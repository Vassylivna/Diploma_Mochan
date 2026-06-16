package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.booking.create.CreateBookingRequest;
import com.mochan.traveltime.dto.booking.get.BookingWithDetailsResponse;
import com.mochan.traveltime.exception.BookingNotFoundException;
import com.mochan.traveltime.exception.InvalidBookingRequestException;
import com.mochan.traveltime.exception.PaymentFailedException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.TourNotFoundException;
import com.mochan.traveltime.exception.UserNotFoundException;
import com.mochan.traveltime.mapper.BookingMapper;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.BookingRepository;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.repository.UserRepository;
import com.mochan.traveltime.specification.BookingSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final BookingMapper bookingMapper;

    private static final List<BookingStatus> OCCUPIED_STATUSES = Arrays.asList(
            BookingStatus.PAID,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.PENDING_APPROVAL
    );

    public BookingWithDetailsResponse createBooking(User user, CreateBookingRequest createBookingRequest) {
        log.info("Processing create booking request for tour ID: {} by user ID: {}", createBookingRequest.getTourId(), user.getUserId());

        Tour tour = tourRepository.findByIdWithDetailsAndIsDeletedFalse(createBookingRequest.getTourId())
                .orElseThrow(() -> {
                    log.warn("Create booking failed: Tour with ID {} not found", createBookingRequest.getTourId());
                    return new TourNotFoundException("Тур з Id " + createBookingRequest.getTourId() + " не знайдено");
                });

        if (tour.getStartDate().isBefore(LocalDateTime.now())) {
            log.warn("Create booking failed: Tour {} already started", tour.getTourId());
            throw new InvalidBookingRequestException("Неможливо забронювати тур, який вже розпочався");
        }

        int requestedSeats = createBookingRequest.getAdultsCount() + createBookingRequest.getChildrenCount() + createBookingRequest.getTeensCount();
        if (requestedSeats <= 0) {
            log.warn("Create booking failed: Invalid passenger count ({})", requestedSeats);
            throw new InvalidBookingRequestException("Кількість пасажирів має бути більше 0");
        }

        checkAvailabilityOrThrow(tour, requestedSeats);

        Booking booking = bookingMapper.createBookingRequestToBooking(createBookingRequest, user, tour);

        if (createBookingRequest.getInitialStatus() == BookingStatus.AWAITING_PAYMENT) {
            booking.setPaymentDeadline(LocalDateTime.now().plusHours(2));
            log.info("Set payment deadline for booking");
        }

        Booking savedBooking = bookingRepository.save(booking);

        log.info("Successfully created booking ID: {}", savedBooking.getBookingId());
        return bookingMapper.toBookingWithDetailsResponse(savedBooking);
    }

    public Page<BookingWithDetailsResponse> getUserBookings(User user, Pageable pageable) {
        log.info("Fetching bookings for user ID: {}", user.getUserId());

        Specification<Booking> spec = BookingSpecifications.byUserIdWithComplexSort(user.getUserId());
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Booking> bookingPage = bookingRepository.findAll(spec, unsortedPageable);

        List<BookingWithDetailsResponse> responseList = new ArrayList<>();
        for (Booking booking : bookingPage.getContent()) {
            BookingWithDetailsResponse dto = bookingMapper.toBookingWithDetailsResponse(booking);
            responseList.add(dto);
        }

        return new PageImpl<>(responseList, unsortedPageable, bookingPage.getTotalElements());
    }

    public List<BookingWithDetailsResponse> getBookingsByTourId(Long tourId) {
        log.info("Fetching bookings for tour ID: {}", tourId);

        List<Booking> bookings = bookingRepository.findAllByTourTourId(tourId);
        List<BookingWithDetailsResponse> bookingWithDetailsResponseList = new ArrayList<>();

        for (Booking booking : bookings) {
            BookingWithDetailsResponse bookingWithDetailsResponse = bookingMapper.toBookingWithDetailsResponse(booking);
            bookingWithDetailsResponseList.add(bookingWithDetailsResponse);
        }

        return bookingWithDetailsResponseList;
    }

    public BookingWithDetailsResponse payForBooking(User currentUser, Long bookingId, String fullCardNumber) {
        log.info("Processing payment for booking ID: {} by user ID: {}", bookingId, currentUser.getUserId());

        Booking booking = getBookingForUserOrAdmin(currentUser, bookingId);

        if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT && booking.getStatus() != BookingStatus.REFUND_REQUESTED) {
            log.warn("Payment failed for booking ID: {}: Invalid status ({})", bookingId, booking.getStatus());
            throw new InvalidBookingRequestException("Це бронювання неможливо оплатити в поточному статусі");
        }

        simulatePaymentProcessing();

        booking.setStatus(BookingStatus.PAID);
        booking.setConfirmedAt(LocalDateTime.now());
        booking.setPaymentDeadline(null);

        if (fullCardNumber != null) {
            String cleanNumber = fullCardNumber.replaceAll("\\D", "");
            if (cleanNumber.length() == 16) {
                String masked = cleanNumber.substring(0, 4) + " **** **** " + cleanNumber.substring(12);
                booking.setCardNumberMasked(masked);
            }
        }

        log.info("Successfully paid for booking ID: {}", bookingId);
        return bookingMapper.toBookingWithDetailsResponse(bookingRepository.save(booking));
    }

    public BookingWithDetailsResponse cancelBookingByUser(User currentUser, Long bookingId) {
        log.info("Processing cancellation for booking ID: {} by user ID: {}", bookingId, currentUser.getUserId());

        Booking booking = getBookingForUserOrAdmin(currentUser, bookingId);

        if (booking.getTour().getStartDate().isBefore(LocalDateTime.now())) {
            log.warn("Cancellation failed for booking ID: {}: Tour already started", bookingId);
            throw new InvalidBookingRequestException("Неможливо скасувати бронювання для туру, що вже розпочався");
        }

        boolean isPaid = booking.getStatus() == BookingStatus.PAID;
        long daysToStart = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), booking.getTour().getStartDate());

        if (isPaid && daysToStart >= 14) {
            booking.setStatus(BookingStatus.REFUND_REQUESTED);
            log.info("Booking ID: {} set to REFUND_REQUESTED", bookingId);
        } else if (isPaid) {
            booking.setStatus(BookingStatus.CANCELLED_WITH_PAYMENT);
            log.info("Booking ID: {} set to CANCELLED_WITH_PAYMENT", bookingId);
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            log.info("Booking ID: {} set to CANCELLED", bookingId);
        }

        return bookingMapper.toBookingWithDetailsResponse(bookingRepository.save(booking));
    }

    public Page<BookingWithDetailsResponse> getAllBookings(String search, String status, List<String> types, Pageable pageable) {
        log.info("Admin fetching all bookings with filters");

        Specification<Booking> spec = BookingSpecifications.withFilters(search, status, types);
        Page<Booking> bookingPage = bookingRepository.findAll(spec, pageable);
        List<BookingWithDetailsResponse> bookingWithDetailsResponseList = new ArrayList<>();

        for (Booking booking : bookingPage.getContent()) {
            BookingWithDetailsResponse bookingWithDetailsResponse = bookingMapper.toBookingWithDetailsResponse(booking);
            bookingWithDetailsResponseList.add(bookingWithDetailsResponse);
        }

        return new PageImpl<>(bookingWithDetailsResponseList, pageable, bookingPage.getTotalElements());
    }

    public BookingWithDetailsResponse updateStatusByAdmin(Long bookingId, BookingStatus newStatus) {
        log.info("Admin updating status for booking ID: {} to {}", bookingId, newStatus);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> {
                    log.warn("Status update failed: Booking ID {} not found", bookingId);
                    return new BookingNotFoundException("Бронювання з Id " + bookingId + " не знайдено");
                });

        BookingStatus oldStatus = booking.getStatus();

        boolean wasCancelled = isCancelledStatus(oldStatus);
        boolean isNowActive = isActiveStatus(newStatus);

        if (wasCancelled && isNowActive) {
            int seatsInBooking = getTotalParticipants(booking);
            checkAvailabilityOrThrow(booking.getTour(), seatsInBooking);
        }

        booking.setStatus(newStatus);

        if (newStatus == BookingStatus.AWAITING_PAYMENT && booking.getPaymentDeadline() == null) {
            booking.setPaymentDeadline(LocalDateTime.now().plusHours(2));
            log.info("Set payment deadline for booking ID: {}", bookingId);
        }

        Booking saveBooking = bookingRepository.save(booking);
        log.info("Successfully updated status for booking ID: {}", bookingId);
        return bookingMapper.toBookingWithDetailsResponse(saveBooking);
    }

    @Scheduled(cron = "0 * * * * *")
    public void autoCancelExpiredBookings() {
        log.info("Running scheduled task: Auto-cancelling expired bookings");

        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findAllByStatusAndPaymentDeadlineBefore(BookingStatus.AWAITING_PAYMENT, now);

        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired bookings to cancel", expiredBookings.size());
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
            }
            bookingRepository.saveAll(expiredBookings);
            log.info("Successfully cancelled {} expired bookings", expiredBookings.size());
        } else {
            log.info("No expired bookings found");
        }
    }

    private int getStatusPriority(BookingStatus status) {
        if (status == null) {
            log.error("Critical error: Status is null in getStatusPriority");
            throw new IllegalStateException("Критична помилка: Знайдено бронювання без статусу (status is null)");
        }

        return switch (status) {
            case AWAITING_PAYMENT -> 1;
            case PENDING_APPROVAL -> 2;
            case PAID -> 3;
            case REFUND_REQUESTED -> 4;
            case REFUNDED -> 5;
            case CANCELLED_WITH_PAYMENT -> 6;
            case CANCELLED -> 7;
        };
    }

    private void simulatePaymentProcessing() {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing interrupted", e);
            throw new RuntimeException("Процес оплати було перервано");
        }

        if (Math.random() < 0.10) {
            log.warn("Simulated payment failed due to insufficient funds");
            throw new PaymentFailedException("Недостатньо коштів на картці. Спробуйте іншу картку або поповніть баланс");
        }
    }

    private void checkAvailabilityOrThrow(Tour tour, int requestedSeats) {
        Integer occupiedSeats = bookingRepository.countTotalParticipants(tour.getTourId(), OCCUPIED_STATUSES);
        if (occupiedSeats == null) {
            occupiedSeats = 0;
        }

        int availableSeats = tour.getTotalSeats() - occupiedSeats;

        if (availableSeats < requestedSeats) {
            log.warn("Availability check failed for tour ID: {}. Requested: {}, Available: {}", tour.getTourId(), requestedSeats, availableSeats);
            throw new ResourceConflictException("Недостатньо вільних місць у турі. Залишилось: " + availableSeats);
        }
    }

    private Booking getBookingForUserOrAdmin(User currentUser, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> {
                    log.warn("Access denied/Not found: Booking ID {} not found during validation", bookingId);
                    return new BookingNotFoundException("Бронювання з Id " + bookingId + " не знайдено");
                });

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        boolean isOwner = booking.getUser().getUserId().equals(currentUser.getUserId());

        if (!isAdmin && !isOwner) {
            log.warn("Access denied: User ID {} attempted to access booking ID {}", currentUser.getUserId(), bookingId);
            throw new BookingNotFoundException("Бронювання з Id " + bookingId + " не знайдено");
        }

        return booking;
    }

    private int getTotalParticipants(Booking booking) {
        return (booking.getAdultsCount() != null ? booking.getAdultsCount() : 0) +
                (booking.getChildrenCount() != null ? booking.getChildrenCount() : 0) +
                (booking.getTeensCount() != null ? booking.getTeensCount() : 0);
    }

    private boolean isActiveStatus(BookingStatus status) {
        return OCCUPIED_STATUSES.contains(status);
    }

    private boolean isCancelledStatus(BookingStatus status) {
        return !isActiveStatus(status);
    }
}