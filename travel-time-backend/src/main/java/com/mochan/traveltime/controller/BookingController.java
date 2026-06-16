package com.mochan.traveltime.controller;

import com.mochan.traveltime.dto.booking.create.CreateBookingRequest;
import com.mochan.traveltime.dto.booking.create.PaymentRequest;
import com.mochan.traveltime.dto.booking.get.BookingWithDetailsResponse;
import com.mochan.traveltime.model.BookingStatus;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.service.BookingService;
import com.mochan.traveltime.service.TicketPdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final TicketPdfService ticketPdfService;

    @PostMapping
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<BookingWithDetailsResponse> createBooking(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateBookingRequest request) {
        log.info("Creating booking for current user");

        BookingWithDetailsResponse bookingWithDetailsResponse = bookingService.createBooking(currentUser, request);

        return new ResponseEntity<>(bookingWithDetailsResponse, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<Page<BookingWithDetailsResponse>> getMyBookings(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 3) Pageable pageable) {
        log.info("Fetching bookings for current user");

        Page<BookingWithDetailsResponse> bookingWithDetailsResponseList = bookingService.getUserBookings(currentUser, pageable);

        return new ResponseEntity<>(bookingWithDetailsResponseList, HttpStatus.OK);
    }

    @PatchMapping("/{bookingId}/pay")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<BookingWithDetailsResponse> payForBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User currentUser,
            @RequestBody PaymentRequest request) {
        log.info("Processing payment for booking ID: {}", bookingId);

        BookingWithDetailsResponse bookingWithDetailsResponse = bookingService.payForBooking(currentUser, bookingId, request.getCardNumber());

        return new ResponseEntity<>(bookingWithDetailsResponse, HttpStatus.OK);
    }

    @PatchMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<BookingWithDetailsResponse> cancelBookingByUser(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Cancelling booking ID: {}", bookingId);

        BookingWithDetailsResponse bookingWithDetailsResponse = bookingService.cancelBookingByUser(currentUser, bookingId);

        return new ResponseEntity<>(bookingWithDetailsResponse, HttpStatus.OK);
    }

    @GetMapping("/{bookingId}/ticket")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long bookingId) {
        log.info("Generating ticket PDF for booking ID: {}", bookingId);

        byte[] pdfBytes = ticketPdfService.generateTicketPdf(bookingId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Ticket_" + bookingId + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<BookingWithDetailsResponse>> getAllBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) List<String> type,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        log.info("Admin fetching all bookings. Status filter: {}", status);

        Page<BookingWithDetailsResponse> bookingWithDetailsResponsePage = bookingService.getAllBookings(search, status, type, pageable);

        return new ResponseEntity<>(bookingWithDetailsResponsePage, HttpStatus.OK);
    }

    @GetMapping("/tour/{tourId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'GUIDE', 'USER')")
    public ResponseEntity<List<BookingWithDetailsResponse>> getBookingsByTour(@PathVariable Long tourId) {
        log.info("Fetching bookings for tour ID: {}", tourId);

        List<BookingWithDetailsResponse> bookingWithDetailsResponseList = bookingService.getBookingsByTourId(tourId);

        return new ResponseEntity<>(bookingWithDetailsResponseList, HttpStatus.OK);
    }

    @PatchMapping("/{bookingId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BookingWithDetailsResponse> updateStatus(@PathVariable Long bookingId, @RequestBody Map<String, String> statusUpdate) {
        String statusStr = statusUpdate.get("status");
        log.info("Admin updating status for booking ID: {} to '{}'", bookingId, statusStr);

        BookingStatus newStatus = BookingStatus.valueOf(statusStr);
        BookingWithDetailsResponse bookingWithDetailsResponse = bookingService.updateStatusByAdmin(bookingId, newStatus);

        return new ResponseEntity<>(bookingWithDetailsResponse, HttpStatus.OK);
    }
}