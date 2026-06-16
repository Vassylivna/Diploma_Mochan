package com.mochan.traveltime.specification;

import com.mochan.traveltime.model.Booking;
import com.mochan.traveltime.model.BookingStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class BookingSpecifications {

    public static Specification<Booking> withFilters(String search, String statusFilter, List<String> types) {
        return Specification.where(hasStatus(statusFilter))
                .and(hasGroupType(types))
                .and(containsText(search));
    }

    public static Specification<Booking> byUserIdWithComplexSort(Long userId) {
        return new Specification<Booking>() {
            @Override
            public Predicate toPredicate(Root<Booking> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                Predicate userPredicate = cb.equal(root.get("user").get("userId"), userId);

                if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                    root.fetch("tour", JoinType.LEFT);

                    Expression<Integer> statusRank = cb.selectCase(root.get("status"))
                            .when(BookingStatus.AWAITING_PAYMENT, 1)
                            .when(BookingStatus.PENDING_APPROVAL, 2)
                            .when(BookingStatus.PAID, 3)
                            .when(BookingStatus.REFUND_REQUESTED, 4)
                            .when(BookingStatus.REFUNDED, 5)
                            .when(BookingStatus.CANCELLED_WITH_PAYMENT, 6)
                            .when(BookingStatus.CANCELLED, 7)
                            .otherwise(8).as(Integer.class);

                    query.orderBy(
                            cb.asc(statusRank),
                            cb.asc(root.get("tour").get("startDate"))
                    );
                }

                return userPredicate;
            }
        };
    }

    private static Specification<Booking> hasStatus(String statusFilter) {
        return new Specification<Booking>() {
            @Override
            public Predicate toPredicate(Root<Booking> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (statusFilter == null || statusFilter.equalsIgnoreCase("ALL")) {
                    return cb.conjunction();
                }
                return cb.equal(root.get("status"), BookingStatus.valueOf(statusFilter));
            }
        };
    }

    private static Specification<Booking> hasGroupType(List<String> types) {
        return new Specification<Booking>() {
            @Override
            public Predicate toPredicate(Root<Booking> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (types == null || types.isEmpty()) {
                    return cb.conjunction();
                }

                if (types.contains("WITH_KIDS") && types.contains("WITH_TEENS")) {
                    return cb.and(
                            cb.greaterThan(root.get("childrenCount"), 0),
                            cb.greaterThan(root.get("teensCount"), 0)
                    );
                }

                if (types.contains("ADULTS_ONLY")) {
                    return cb.and(
                            cb.greaterThan(root.get("adultsCount"), 0),
                            cb.equal(root.get("childrenCount"), 0),
                            cb.equal(root.get("teensCount"), 0)
                    );
                }

                if (types.contains("WITH_KIDS")) {
                    return cb.and(
                            cb.greaterThan(root.get("adultsCount"), 0),
                            cb.greaterThan(root.get("childrenCount"), 0),
                            cb.equal(root.get("teensCount"), 0)
                    );
                }

                if (types.contains("WITH_TEENS")) {
                    return cb.and(
                            cb.greaterThan(root.get("adultsCount"), 0),
                            cb.equal(root.get("childrenCount"), 0),
                            cb.greaterThan(root.get("teensCount"), 0)
                    );
                }

                return cb.conjunction();
            }
        };
    }

    private static Specification<Booking> containsText(String search) {
        return new Specification<Booking>() {
            @Override
            public Predicate toPredicate(Root<Booking> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (search == null || search.isBlank()) {
                    return cb.conjunction();
                }

                String pattern = "%" + search.toLowerCase() + "%";

                return cb.or(
                        cb.like(cb.lower(root.get("paymentCode")), pattern),
                        cb.like(cb.lower(root.join("user").get("lastName")), pattern),
                        cb.like(cb.lower(root.join("user").get("phoneNumber")), pattern),
                        cb.like(cb.lower(root.join("tour").get("title")), pattern)
                );
            }
        };
    }
}