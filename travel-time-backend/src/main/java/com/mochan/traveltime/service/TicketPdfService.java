package com.mochan.traveltime.service;

import com.mochan.traveltime.exception.BookingNotFoundException;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.BookingRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;

@Log4j2
@Service
@RequiredArgsConstructor
public class TicketPdfService {

    private final BookingRepository bookingRepository;
    private final TemplateEngine templateEngine;

    @Transactional(readOnly = true)
    public byte[] generateTicketPdf(Long bookingId) {
        log.info("Generating ticket PDF for booking ID: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> {
                    log.warn("Ticket generation failed: Booking ID {} not found", bookingId);
                    return new BookingNotFoundException("Бронювання з Id " + bookingId + " не знайдено");
                });

        Tour tour = booking.getTour();
        User user = booking.getUser();

        double factor = booking.getAdultsCount() + booking.getTeensCount() + (booking.getChildrenCount() * 0.8);
        double basePrice = factor > 0 ? booking.getTotalPrice() / factor : 0;

        Context context = new Context();
        context.setVariable("booking", booking);
        context.setVariable("tour", tour);
        context.setVariable("user", user);
        context.setVariable("basePrice", basePrice);
        context.setVariable("timestamp", LocalDateTime.now());

        boolean hasHotels = tour.getStops().stream().anyMatch(s -> s.getHotel() != null);
        context.setVariable("hasHotels", hasHotels);

        String htmlContent = templateEngine.process("ticket", context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            builder.useFont(() -> {
                try {
                    return new ClassPathResource("fonts/Roboto-Regular.ttf").getInputStream();
                } catch (IOException e) {
                    log.error("Font fonts/Roboto-Regular.ttf not found during PDF generation", e);
                    throw new RuntimeException("Шрифт не знайдено: fonts/Roboto-Regular.ttf", e);
                }
            }, "Roboto");

            builder.withHtmlContent(htmlContent, "/");
            builder.toStream(os);
            builder.run();

            log.info("Successfully generated ticket PDF for booking ID: {}", bookingId);
            return os.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF for booking ID: {}", bookingId, e);
            throw new RuntimeException("Помилка генерації PDF", e);
        }
    }
}