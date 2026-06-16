package com.mochan.traveltime.data;

import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.BookingRepository;
import com.mochan.traveltime.repository.TourRepository;
import com.mochan.traveltime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
@Order(6) // Запускаємо після Турів (Order 5)
@Profile("!test")
public class BookingDataSeeder implements CommandLineRunner {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (bookingRepository.count() > 0) {
            return;
        }

        System.out.println("Завантаження бронювань...");

        // Ціни для розрахунків (взяті з TourDataSeeder)
        double priceTour1_Istanbul = 12450.0;
        double priceTour2_Bukovel = 30500.0;
        double priceTour3_Paris = 40000.0;
        double priceTour4_Italy = 4800.0;
        double priceTour5_Prague = 32000.0;
        double priceTour6_Lviv = 11000.0;
        double priceTour7_Carpathians = 9680.0;
        double priceTour8_Rome = 12000.0;
        double priceTour9_Vienna = 8900.0;

        // Маппінг Юзерів (ID з файлу -> Email)
        String user1 = "user@gmail.com";
        String user6 = "ivan.petrenko@gmail.com";
        String user7 = "svitlana.boyko@gmail.com";
        String user8 = "max.kozak@gmail.com";
        String user9 = "sofia.honchar@gmail.com";
        String user11 = "yulia.romaniuk@gmail.com";

        // =========================================================================
        // ГРУПА 1: МИНУЛИЙ ТУР (Зимовий Буковель - Tour 2)
        // =========================================================================
        String tour2 = "Зимова казка Карпат: Буковель";

        createBooking(user6, tour2, 2, 1, 1,
                (priceTour2_Bukovel * 2) + (priceTour2_Bukovel * 1 * 0.8) + (priceTour2_Bukovel * 1),
                BookingStatus.PAID, "4441 **** **** 1289", "TR-992104",
                "2025-11-15T14:20:00Z", "2025-11-15T15:30:00Z", "2025-11-16T14:20:00Z", null);

        createBooking(user7, tour2, 1, 0, 4,
                (priceTour2_Bukovel * 1) + (priceTour2_Bukovel * 4),
                BookingStatus.PAID, "5375 **** **** 4456", "TR-102933",
                "2025-12-01T10:00:00Z", "2025-12-02T09:15:00Z", "2025-12-02T10:00:00Z", null);

        createBooking(user8, tour2, 2, 2, 0,
                (priceTour2_Bukovel * 2) + (priceTour2_Bukovel * 2 * 0.8),
                BookingStatus.PAID, "4141 **** **** 8822", "TR-445100",
                "2025-12-05T18:00:00Z", "2025-12-05T19:00:00Z", "2025-12-06T18:00:00Z", null);

        createBooking(user9, tour2, 1, 0, 1,
                (priceTour2_Bukovel * 1) + (priceTour2_Bukovel * 1),
                BookingStatus.CANCELLED, null, "TR-112233",
                "2025-12-10T12:00:00Z", null, "2025-12-11T12:00:00Z", "2025-12-11T14:00:00Z");

        createBooking(user11, tour2, 2, 0, 0,
                (priceTour2_Bukovel * 2),
                BookingStatus.PAID, "5168 **** **** 3344", "TR-778899",
                "2025-12-15T09:00:00Z", "2025-12-15T11:20:00Z", "2025-12-16T09:00:00Z", null);

        createBooking(user6, tour2, 2, 0, 0,
                (priceTour2_Bukovel * 2),
                BookingStatus.PAID, "4441 **** **** 1289", "TR-223344",
                "2025-12-18T16:00:00Z", "2025-12-18T16:45:00Z", "2025-12-19T16:00:00Z", null);

        createBooking(user7, tour2, 1, 1, 0,
                (priceTour2_Bukovel * 1) + (priceTour2_Bukovel * 1 * 0.8),
                BookingStatus.PAID, "5375 **** **** 4456", "TR-556677",
                "2025-12-20T10:00:00Z", "2025-12-20T10:30:00Z", "2025-12-21T10:00:00Z", null);

        createBooking(user8, tour2, 2, 0, 0,
                (priceTour2_Bukovel * 2),
                BookingStatus.PAID, "4141 **** **** 8822", "TR-101010",
                "2025-12-22T14:00:00Z", "2025-12-22T15:00:00Z", "2025-12-23T14:00:00Z", null);

        createBooking(user1, tour2, 3, 0, 0,
                (priceTour2_Bukovel * 3),
                BookingStatus.PAID, "5168 **** **** 0000", "TR-202020",
                "2025-12-24T11:00:00Z", "2025-12-24T12:00:00Z", "2025-12-25T11:00:00Z", null);

        createBooking(user9, tour2, 2, 1, 0,
                (priceTour2_Bukovel * 2) + (priceTour2_Bukovel * 1 * 0.8),
                BookingStatus.PAID, "4441 **** **** 7777", "TR-303030",
                "2025-12-25T13:00:00Z", "2025-12-25T14:00:00Z", "2025-12-26T13:00:00Z", null);


        // =========================================================================
        // ГРУПА 2: АРХІВНИЙ/ГАРЯЧИЙ ТУР (Стамбул - Tour 1)
        // =========================================================================
        String tour1 = "Стамбул: Місто двох континентів";

        createBooking(user6, tour1, 2, 0, 0,
                (priceTour1_Istanbul * 2),
                BookingStatus.PAID, "4141 **** **** 9911", "TR-404040",
                "2026-01-05T10:00:00Z", "2026-01-05T11:00:00Z", "2026-01-06T10:00:00Z", null);

        createBooking(user7, tour1, 1, 0, 0,
                (priceTour1_Istanbul * 1),
                BookingStatus.PAID, "5375 **** **** 2288", "TR-505050",
                "2026-01-07T09:00:00Z", "2026-01-07T10:00:00Z", "2026-01-08T09:00:00Z", null);

        createBooking(user8, tour1, 2, 0, 2,
                (priceTour1_Istanbul * 2) + (priceTour1_Istanbul * 2),
                BookingStatus.CANCELLED_WITH_PAYMENT, "4441 **** **** 5566", "TR-606060",
                "2026-01-08T15:00:00Z", "2026-01-08T15:30:00Z", "2026-01-09T15:00:00Z", "2026-01-09T18:00:00Z");

        createBooking(user11, tour1, 2, 1, 0,
                (priceTour1_Istanbul * 2) + (priceTour1_Istanbul * 1 * 0.8),
                BookingStatus.PAID, "5168 **** **** 9090", "TR-707070",
                "2026-01-09T11:00:00Z", "2026-01-09T12:00:00Z", "2026-01-10T11:00:00Z", null);

        createBooking(user1, tour1, 1, 0, 0,
                (priceTour1_Istanbul * 1),
                BookingStatus.PENDING_APPROVAL, null, "TR-808080",
                "2026-01-10T06:00:00Z", null, "2026-01-11T06:00:00Z", null);


        // =========================================================================
        // ГРУПА 3: МАЙБУТНІ ТУРИ
        // =========================================================================
        String tour3 = "Париж та Ніцца: Від Лувру до Лазурового берега";
        String tour4 = "Dolce Vita: Рим та Венеція";
        String tour5 = "Королівський вікенд: Прага та Відень";
        String tour6 = "Легенди старого Львова";
        String tour7 = "Релакс у горах: Спа та полонини";
        String tour8 = "Римські канікули: Мистецтво та шопінг";
        String tour9 = "Віденський вальс: Вихідні в імперській столиці"; // Цей тур вже триває, але в групі 3 в TS

        // Booking 16
        createBooking(user6, tour3, 2, 0, 0,
                (priceTour3_Paris * 2),
                BookingStatus.PAID, "4141 **** **** 1111", "TR-909090",
                "2026-01-02T10:00:00Z", "2026-01-02T11:00:00Z", "2026-01-03T10:00:00Z", null);

        // Booking 17
        createBooking(user7, tour3, 2, 2, 0,
                (priceTour3_Paris * 2) + (priceTour3_Paris * 2 * 0.8),
                BookingStatus.AWAITING_PAYMENT, null, "TR-121212",
                "2026-01-10T07:00:00Z", null, "2026-01-11T07:00:00Z", null);

        // Booking 18
        createBooking(user8, tour4, 2, 0, 0,
                (priceTour4_Italy * 2),
                BookingStatus.PAID, "5375 **** **** 0000", "TR-131313",
                "2026-01-05T14:00:00Z", "2026-01-05T15:00:00Z", "2026-01-06T14:00:00Z", null);

        // Booking 19
        createBooking(user9, tour4, 1, 0, 2,
                (priceTour4_Italy * 1) + (priceTour4_Italy * 2),
                BookingStatus.PENDING_APPROVAL, null, "TR-141414",
                "2026-01-10T05:30:00Z", null, "2026-01-11T05:30:00Z", null);

        // Booking 20
        createBooking(user11, tour5, 2, 0, 0,
                (priceTour5_Prague * 2),
                BookingStatus.PAID, "4441 **** **** 4444", "TR-151515",
                "2026-01-01T12:00:00Z", "2026-01-01T13:00:00Z", "2026-01-02T12:00:00Z", null);

        // Booking 21
        createBooking(user1, tour5, 4, 0, 2,
                (priceTour5_Prague * 4) + (priceTour5_Prague * 2),
                BookingStatus.PAID, "5168 **** **** 5555", "TR-161616",
                "2026-01-04T10:00:00Z", "2026-01-04T11:00:00Z", "2026-01-05T10:00:00Z", null);

        // Booking 22
        createBooking(user6, tour6, 2, 0, 0,
                (priceTour6_Lviv * 2),
                BookingStatus.PAID, "4141 **** **** 6666", "TR-171717",
                "2026-01-08T09:00:00Z", "2026-01-08T10:00:00Z", "2026-01-09T09:00:00Z", null);

        // Booking 23
        createBooking(user7, tour6, 1, 2, 0,
                (priceTour6_Lviv * 1) + (priceTour6_Lviv * 2 * 0.8),
                BookingStatus.PAID, "5375 **** **** 7777", "TR-181818",
                "2026-01-09T14:00:00Z", "2026-01-09T15:00:00Z", "2026-01-10T14:00:00Z", null);

        // Booking 24
        createBooking(user8, tour7, 2, 0, 0,
                (priceTour7_Carpathians * 2),
                BookingStatus.REFUND_REQUESTED, "4441 **** **** 8888", "TR-191919",
                "2026-01-03T11:00:00Z", "2026-01-03T12:00:00Z", "2026-01-04T11:00:00Z", "2026-01-10T07:30:00Z");

        // Booking 25
        createBooking(user9, tour7, 1, 0, 0,
                (priceTour7_Carpathians * 1),
                BookingStatus.PAID, "5168 **** **** 9999", "TR-202122",
                "2026-01-05T16:00:00Z", "2026-01-05T17:00:00Z", "2026-01-06T16:00:00Z", null);

        // Booking 26
        createBooking(user11, tour8, 2, 0, 0,
                (priceTour8_Rome * 2),
                BookingStatus.PAID, "4141 **** **** 0101", "TR-232425",
                "2026-01-06T10:00:00Z", "2026-01-06T11:00:00Z", "2026-01-07T10:00:00Z", null);

        // Booking 27
        createBooking(user1, tour8, 1, 2, 0,
                (priceTour8_Rome * 1) + (priceTour8_Rome * 2 * 0.8),
                BookingStatus.AWAITING_PAYMENT, null, "TR-262728",
                "2026-01-10T04:00:00Z", null, "2026-01-10T06:00:00Z", null);

        // Booking 28
        createBooking(user6, tour4, 2, 0, 0,
                (priceTour4_Italy * 2),
                BookingStatus.CANCELLED, null, "TR-293031",
                "2026-01-07T13:00:00Z", null, "2026-01-08T13:00:00Z", "2026-01-08T10:00:00Z");

        // Booking 29
        createBooking(user7, tour3, 2, 0, 0,
                (priceTour3_Paris * 2),
                BookingStatus.PAID, "5375 **** **** 5656", "TR-323334",
                "2026-01-04T15:00:00Z", "2026-01-04T16:00:00Z", "2026-01-05T15:00:00Z", null);

        // Booking 30 (Стамбул - Tour 1)
        createBooking(user8, tour1, 1, 0, 0,
                (priceTour1_Istanbul * 1),
                BookingStatus.PAID, "4441 **** **** 3322", "TR-353637",
                "2026-01-09T20:00:00Z", "2026-01-09T21:00:00Z", "2026-01-10T20:00:00Z", null);

        // Booking 31 (Відень - Tour 9)
        createBooking(user6, tour9, 2, 0, 0,
                (priceTour9_Vienna * 2),
                BookingStatus.PAID, "4141 **** **** 1289", "TR-770011",
                "2025-11-20T10:00:00Z", "2025-11-20T11:30:00Z", "2025-11-21T10:00:00Z", null);

        // Booking 32
        createBooking(user9, tour9, 1, 1, 0,
                (priceTour9_Vienna * 1) + (priceTour9_Vienna * 1 * 0.8),
                BookingStatus.PAID, "5375 **** **** 9900", "TR-770022",
                "2025-11-25T14:20:00Z", "2025-11-26T09:00:00Z", "2025-11-26T14:20:00Z", null);

        // Booking 33
        createBooking(user11, tour9, 2, 0, 1,
                (priceTour9_Vienna * 2) + (priceTour9_Vienna * 1),
                BookingStatus.PAID, "4441 **** **** 3344", "TR-770033",
                "2025-12-05T12:00:00Z", "2025-12-05T12:45:00Z", "2025-12-06T12:00:00Z", null);

        // Booking 34
        createBooking(user1, tour9, 1, 0, 0,
                (priceTour9_Vienna * 1),
                BookingStatus.PAID, "5168 **** **** 0001", "TR-770044",
                "2025-12-15T18:00:00Z", "2025-12-16T10:00:00Z", "2025-12-16T18:00:00Z", null);

        // Booking 35
        createBooking(user8, tour9, 2, 0, 0,
                (priceTour9_Vienna * 2),
                BookingStatus.CANCELLED_WITH_PAYMENT, null, "TR-770055",
                "2025-12-20T09:00:00Z", "2025-12-20T10:00:00Z", "2025-12-21T09:00:00Z", "2025-12-28T15:00:00Z");

        System.out.println("Бронювання успішно завантажено!");
    }

    private void createBooking(String userEmail, String tourTitle,
                               Integer adults, Integer children, Integer teens,
                               Double totalPrice, BookingStatus status,
                               String cardNumber, String paymentCode,
                               String createdAtStr, String confirmedAtStr, String deadlineStr, String cancelledAtStr) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        Tour tour = tourRepository.findByTitle(tourTitle)
                .orElseThrow(() -> new RuntimeException("Tour not found: " + tourTitle));

        // Парсинг дат з формату ISO (2025-11-15T14:20:00Z)
        LocalDateTime createdAt = parseIsoDate(createdAtStr);
        LocalDateTime confirmedAt = confirmedAtStr != null ? parseIsoDate(confirmedAtStr) : null;
        LocalDateTime deadline = deadlineStr != null ? parseIsoDate(deadlineStr) : null;
        // У тебе немає поля cancelledAt в Booking entity з першого повідомлення, 
        // але воно є в TS файлі. Якщо додав - розкоментуй.
        // LocalDateTime cancelledAt = cancelledAtStr != null ? parseIsoDate(cancelledAtStr) : null;

        Booking booking = Booking.builder()
                .user(user)
                .tour(tour)
                .adultsCount(adults)
                .childrenCount(children)
                .teensCount(teens)
                .totalPrice(totalPrice)
                .status(status)
                .cardNumberMasked(cardNumber)
                .paymentCode(paymentCode)
                .createdAt(createdAt)
                .confirmedAt(confirmedAt)
                .paymentDeadline(deadline)
                // .cancelledAt(cancelledAt) // Якщо поле існує
                .build();

        bookingRepository.save(booking);
    }

    private LocalDateTime parseIsoDate(String isoDate) {
        // Конвертуємо "2025-11-15T14:20:00Z" -> LocalDateTime
        return Instant.parse(isoDate).atZone(ZoneId.of("UTC")).toLocalDateTime();
    }
}