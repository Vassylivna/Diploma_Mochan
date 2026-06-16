package com.mochan.traveltime.service;

import com.mochan.traveltime.dto.stats.ChartItemResponse;
import com.mochan.traveltime.dto.stats.ChartsResponse;
import com.mochan.traveltime.dto.stats.DemographicItemResponse;
import com.mochan.traveltime.dto.stats.KpiResponse;
import com.mochan.traveltime.dto.stats.PeriodInfoResponse;
import com.mochan.traveltime.dto.stats.StatsResponse;
import com.mochan.traveltime.dto.stats.TimelineItemResponse;
import com.mochan.traveltime.dto.stats.TopTourResponse;
import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.Transport;
import com.mochan.traveltime.repository.BookingRepository;
import com.mochan.traveltime.repository.TransportRepository;
import com.mochan.traveltime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TransportRepository transportRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:00");
    private static final DateTimeFormatter FULL_TIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("d MMM", new Locale("uk"));
    private static final DateTimeFormatter YMD_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("uk"));
    private static final DateTimeFormatter YM_FMT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter YEAR_FMT = DateTimeFormatter.ofPattern("yyyy");

    @Transactional(readOnly = true)
    public StatsResponse getBusinessStats(LocalDateTime start, LocalDateTime end) {
        log.info("Generating business statistics from {} to {}", start, end);

        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        List<Transport> transports = transportRepository.findAll();
        long activeUsersCount = userRepository.countByAccountStatus(AccountStatus.ACTIVE);

        log.info("Fetched data for stats: {} total bookings, {} transports, {} active users",
                allBookings.size(), transports.size(), activeUsersCount);

        Map<String, Integer> transportStats = new HashMap<>();
        transports.forEach(t -> transportStats.put(t.getTransportName(), 0));

        Map<String, Integer> hotelStats = new HashMap<>();
        List<String> hotelCategories = List.of("П'ять зірок", "Чотири зірки", "Три зірки", "Дві зірки", "Одна зірка", "Без зірок");
        hotelCategories.forEach(cat -> hotelStats.put(cat, 0));

        List<Booking> periodBookings = allBookings.stream().filter(b -> {
            LocalDateTime created = b.getCreatedAt();
            LocalDateTime targetDate = b.getConfirmedAt() != null ? b.getConfirmedAt() : created;
            return !targetDate.isBefore(start) && !targetDate.isAfter(end);
        }).toList();

        log.info("Filtered {} bookings matching the requested period", periodBookings.size());

        double totalRevenue = 0;
        long leadTimeSum = 0;
        long leadTimeCount = 0;
        int paidInPeriod = 0;

        int adultsCount = 0, childrenCount = 0, teensCount = 0;
        double adultsRev = 0, childrenRev = 0, teensRev = 0;

        Map<String, TopTourResponse> tourStatsMap = new HashMap<>();
        Map<String, Double> countryStats = new HashMap<>();

        long daysDiff = ChronoUnit.DAYS.between(start, end);
        List<TimelineItemResponse> timelineData = generateEmptyTimeline(start, end, daysDiff);

        for (Booking booking : periodBookings) {
            LocalDateTime confirmedDate = booking.getConfirmedAt();
            boolean isRevenueGenerating = booking.getStatus() == BookingStatus.PAID ||
                    booking.getStatus() == BookingStatus.CANCELLED_WITH_PAYMENT;
            Tour tour = booking.getTour();

            if (isRevenueGenerating && confirmedDate != null && !confirmedDate.isBefore(start) && !confirmedDate.isAfter(end)) {
                double price = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
                totalRevenue += price;
                paidInPeriod++;

                String key = getTimelineKey(confirmedDate, daysDiff);
                timelineData.stream()
                        .filter(p -> p.getFullDate().equals(key))
                        .findFirst()
                        .ifPresent(p -> p.setValue(p.getValue() + price));

                int ac = booking.getAdultsCount() != null ? booking.getAdultsCount() : 0;
                int cc = booking.getChildrenCount() != null ? booking.getChildrenCount() : 0;
                int tc = booking.getTeensCount() != null ? booking.getTeensCount() : 0;
                int totalPeople = ac + cc + tc;

                if (totalPeople > 0) {
                    double pp = price / totalPeople;
                    adultsRev += pp * ac;
                    childrenRev += pp * cc;
                    teensRev += pp * tc;
                }

                if (tour != null) {
                    String cName = "Невідомо";
                    if (tour.getStops() != null && !tour.getStops().isEmpty() && tour.getStops().iterator().next().getLocation() != null) {
                        cName = tour.getStops().iterator().next().getLocation().getCountryName();
                    } else if (tour.getStartLocation() != null) {
                        cName = tour.getStartLocation().getCountryName();
                    }
                    countryStats.put(cName, countryStats.getOrDefault(cName, 0.0) + price);

                    long diff = ChronoUnit.DAYS.between(booking.getCreatedAt(), tour.getStartDate());
                    if (diff >= 0) {
                        leadTimeSum += diff;
                        leadTimeCount++;
                    }
                }
            }

            if (booking.getStatus() != BookingStatus.CANCELLED) {
                adultsCount += (booking.getAdultsCount() != null ? booking.getAdultsCount() : 0);
                childrenCount += (booking.getChildrenCount() != null ? booking.getChildrenCount() : 0);
                teensCount += (booking.getTeensCount() != null ? booking.getTeensCount() : 0);

                if (tour != null) {
                    if (tour.getTransport() != null) {
                        String tName = tour.getTransport().getTransportName();
                        transportStats.put(tName, transportStats.getOrDefault(tName, 0) + 1);
                    }

                    Integer stars = 0;
                    if (tour.getStops() != null && !tour.getStops().isEmpty()) {
                        Hotel h = tour.getStops().iterator().next().getHotel();
                        if(h != null) stars = h.getStars();
                    }

                    String hCat = getHotelCategory(stars);
                    if (hotelStats.containsKey(hCat)) {
                        hotelStats.put(hCat, hotelStats.get(hCat) + 1);
                    }

                    tourStatsMap.putIfAbsent(tour.getTitle(), new TopTourResponse(tour.getTitle(), 0, 0.0));
                    TopTourResponse stat = tourStatsMap.get(tour.getTitle());

                    stat.setSales(stat.getSales() + 1);
                    if (isRevenueGenerating) {
                        double tourPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
                        stat.setRevenue(stat.getRevenue() + tourPrice);
                    }
                }
            }
        }

        Map<String, Long> userPurchaseCounts = allBookings.stream()
                .filter(b -> (b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.CANCELLED_WITH_PAYMENT) && b.getUser() != null)
                .collect(Collectors.groupingBy(b -> b.getUser().getUserId().toString(), Collectors.counting()));

        Map<String, Integer> loyaltyBuckets = new LinkedHashMap<>();
        loyaltyBuckets.put("1 покупка", 0);
        loyaltyBuckets.put("2-3 покупки", 0);
        loyaltyBuckets.put("4-6 покупок", 0);
        loyaltyBuckets.put("7-9 покупок", 0);
        loyaltyBuckets.put("10+ покупок", 0);

        Set<String> periodUserIds = new HashSet<>();
        for(Booking b : periodBookings) {
            if((b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.CANCELLED_WITH_PAYMENT) && b.getUser() != null) {
                String uid = b.getUser().getUserId().toString();
                if(!periodUserIds.contains(uid)) {
                    periodUserIds.add(uid);
                    long count = userPurchaseCounts.getOrDefault(uid, 0L);
                    if (count == 1) loyaltyBuckets.put("1 покупка", loyaltyBuckets.get("1 покупка") + 1);
                    else if (count <= 3) loyaltyBuckets.put("2-3 покупки", loyaltyBuckets.get("2-3 покупки") + 1);
                    else if (count <= 6) loyaltyBuckets.put("4-6 покупок", loyaltyBuckets.get("4-6 покупок") + 1);
                    else if (count <= 9) loyaltyBuckets.put("7-9 покупок", loyaltyBuckets.get("7-9 покупок") + 1);
                    else loyaltyBuckets.put("10+ покупок", loyaltyBuckets.get("10+ покупок") + 1);
                }
            }
        }

        KpiResponse kpi = KpiResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(periodBookings.size())
                .averageCheck(paidInPeriod > 0 ? (double) Math.round(totalRevenue / paidInPeriod) : 0.0)
                .activeUsers(activeUsersCount)
                .conversionRate(periodBookings.size() > 0 ? (double) Math.round(((double) paidInPeriod / periodBookings.size()) * 100) : 0.0)
                .averageLeadTime(leadTimeCount > 0 ? (double) Math.round((double) leadTimeSum / leadTimeCount) : 0.0)
                .build();

        ChartsResponse charts = ChartsResponse.builder()
                .revenueTimeline(timelineData)
                .bookingStatus(buildStatusChart(periodBookings))
                .topTours(tourStatsMap.values().stream()
                        .sorted(Comparator.comparingInt(TopTourResponse::getSales).reversed())
                        .limit(5)
                        .collect(Collectors.toList()))
                .demographics(List.of(
                        new DemographicItemResponse("Дорослі", adultsCount, (double) Math.round(adultsRev)),
                        new DemographicItemResponse("Підлітки (13-17)", teensCount, (double) Math.round(teensRev)),
                        new DemographicItemResponse("Діти (0-12)", childrenCount, (double) Math.round(childrenRev))
                ))
                .transportUsage(mapToChart(transportStats))
                .revenueByCountry(countryStats.entrySet().stream()
                        .map(e -> new ChartItemResponse(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparingDouble(ChartItemResponse::getValue).reversed())
                        .limit(6)
                        .collect(Collectors.toList()))
                .hotelPreferences(mapToChart(hotelStats))
                .userLoyalty(buildLoyaltyChart(loyaltyBuckets))
                .build();

        log.info("Successfully generated business statistics");

        return StatsResponse.builder()
                .periodInfoResponse(new PeriodInfoResponse(start, end, daysDiff == 0 ? 1L : daysDiff + 1)) // 1L -> Long
                .kpi(kpi)
                .charts(charts)
                .build();
    }


    private List<TimelineItemResponse> generateEmptyTimeline(LocalDateTime start, LocalDateTime end, long daysDiff) {
        List<TimelineItemResponse> list = new ArrayList<>();
        LocalDateTime current = start;
        LocalDate endDate = end.toLocalDate();

        if (daysDiff <= 1) {
            while (!current.isAfter(end)) {
                String fullDate = current.format(FULL_TIME_FMT);
                String label = current.format(TIME_FMT);
                boolean isMidnight = current.getHour() == 0 && !current.isEqual(start);

                if(isMidnight) label = "24:00";

                if (daysDiff == 1) {
                    String dateLabel = current.format(DATE_FMT);
                    if(isMidnight) {
                        dateLabel = current.minusHours(1).format(DATE_FMT);
                    }
                    label = dateLabel + " " + label;
                }

                list.add(new TimelineItemResponse(label, 0.0, fullDate));
                current = current.plusHours(2);
            }
        } else if (daysDiff <= 62) {
            while (!current.toLocalDate().isAfter(endDate)) {
                list.add(new TimelineItemResponse(current.format(DATE_FMT), 0.0, current.format(YMD_FMT)));
                current = current.plusDays(1);
            }
        } else if (daysDiff <= 730) {
            current = current.withDayOfMonth(1);
            while (!current.toLocalDate().isAfter(endDate)) {
                list.add(new TimelineItemResponse(current.format(MONTH_FMT), 0.0, current.format(YM_FMT)));
                current = current.plusMonths(1);
            }
        } else {
            current = current.withDayOfYear(1);
            while (!current.toLocalDate().isAfter(endDate)) {
                list.add(new TimelineItemResponse(current.format(YEAR_FMT), 0.0, current.format(YEAR_FMT)));
                current = current.plusYears(1);
            }
        }
        return list;
    }

    private String getTimelineKey(LocalDateTime date, long daysDiff) {
        if (daysDiff <= 1) {
            int h = date.getHour();
            LocalDateTime adjusted = date.withMinute(0).withSecond(0).withNano(0);
            if (h % 2 != 0) adjusted = adjusted.minusHours(1);
            return adjusted.format(FULL_TIME_FMT);
        } else if (daysDiff <= 62) {
            return date.format(YMD_FMT);
        } else if (daysDiff <= 730) {
            return date.format(YM_FMT);
        } else {
            return date.format(YEAR_FMT);
        }
    }

    private String getHotelCategory(Integer stars) {
        if (stars == null) return "Без зірок";
        return switch (stars) {
            case 5 -> "П'ять зірок";
            case 4 -> "Чотири зірки";
            case 3 -> "Три зірки";
            case 2 -> "Дві зірки";
            case 1 -> "Одна зірка";
            default -> "Без зірок";
        };
    }

    private List<ChartItemResponse> buildStatusChart(List<Booking> bookings) {
        Map<BookingStatus, Long> counts = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));

        List<ChartItemResponse> list = new ArrayList<>();
        list.add(new ChartItemResponse("На перевірці", counts.getOrDefault(BookingStatus.PENDING_APPROVAL, 0L).doubleValue()));
        list.add(new ChartItemResponse("Очікує повернення", counts.getOrDefault(BookingStatus.REFUND_REQUESTED, 0L).doubleValue()));
        list.add(new ChartItemResponse("Очікують оплати", counts.getOrDefault(BookingStatus.AWAITING_PAYMENT, 0L).doubleValue()));
        list.add(new ChartItemResponse("Оплачені", counts.getOrDefault(BookingStatus.PAID, 0L).doubleValue()));
        list.add(new ChartItemResponse("Скасовано (оплачені)", counts.getOrDefault(BookingStatus.CANCELLED_WITH_PAYMENT, 0L).doubleValue()));
        list.add(new ChartItemResponse("Повернені", counts.getOrDefault(BookingStatus.REFUNDED, 0L).doubleValue()));
        list.add(new ChartItemResponse("Скасовані", counts.getOrDefault(BookingStatus.CANCELLED, 0L).doubleValue()));
        return list;
    }

    private List<ChartItemResponse> mapToChart(Map<String, Integer> map) {
        return map.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(e -> new ChartItemResponse(e.getKey(), e.getValue().doubleValue()))
                .collect(Collectors.toList());
    }

    private List<ChartItemResponse> buildLoyaltyChart(Map<String, Integer> buckets) {
        List<ChartItemResponse> list = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : buckets.entrySet()) {
            list.add(new ChartItemResponse(entry.getKey(), entry.getValue().doubleValue()));
        }
        return list;
    }
}