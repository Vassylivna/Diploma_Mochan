package com.mochan.traveltime.exception.handler;

import com.mochan.traveltime.dto.exception.ExceptionResponse;
import com.mochan.traveltime.exception.BookingNotFoundException;
import com.mochan.traveltime.exception.HotelNotFoundException;
import com.mochan.traveltime.exception.InvalidBookingRequestException;
import com.mochan.traveltime.exception.InvalidCredentialsException;
import com.mochan.traveltime.exception.LocationNotFoundException;
import com.mochan.traveltime.exception.OperationNotAllowedException;
import com.mochan.traveltime.exception.PasswordMismatchException;
import com.mochan.traveltime.exception.PaymentFailedException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.TourNotFoundException;
import com.mochan.traveltime.exception.TransportNotFoundException;
import com.mochan.traveltime.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Log4j2
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            UserNotFoundException.class,
            TourNotFoundException.class,
            BookingNotFoundException.class,
            HotelNotFoundException.class,
            LocationNotFoundException.class,
            TransportNotFoundException.class
    })
    public ResponseEntity<ExceptionResponse> handleNotFound(RuntimeException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ExceptionResponse> handleConflict(ResourceConflictException ex) {
        log.warn("Conflict error: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler({
            InvalidBookingRequestException.class,
            PasswordMismatchException.class,
            PaymentFailedException.class
    })
    public ResponseEntity<ExceptionResponse> handleBadRequest(RuntimeException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ExceptionResponse> handleUnauthorized(InvalidCredentialsException ex) {
        log.warn("Unauthorized access attempt: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ExceptionResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Доступ заборонено: у вас недостатньо прав для цієї операції");
    }

    @ExceptionHandler(OperationNotAllowedException.class)
    public ResponseEntity<ExceptionResponse> handleForbidden(OperationNotAllowedException ex) {
        log.warn("Operation not allowed: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("INTERNAL SERVER ERROR at path: {}", request.getRequestURI(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Сталася внутрішня помилка сервера. Спробуйте пізніше."
        );
    }

    private ResponseEntity<ExceptionResponse> buildResponse(HttpStatus status, String message) {
        ExceptionResponse response = ExceptionResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .build();

        return new ResponseEntity<>(response, status);
    }
}