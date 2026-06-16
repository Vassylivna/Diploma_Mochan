package com.mochan.traveltime.specification;

import com.mochan.traveltime.dto.criteria.TourSearchCriteria;
import com.mochan.traveltime.model.Tour;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TourSpecifications {

    public static Specification<Tour> notDeleted() {
        return new Specification<Tour>() {
            @Override
            public Predicate toPredicate(Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.isFalse(root.get("isDeleted"));
            }
        };
    }

    public static Specification<Tour> assignedToGuide(Long guideId) {
        return new Specification<Tour>() {
            @Override
            public Predicate toPredicate(Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.equal(root.get("guide").get("userId"), guideId);
            }
        };
    }

    public static Specification<Tour> any() {
        return new Specification<Tour>() {
            @Override
            public Predicate toPredicate(Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.conjunction();
            }
        };
    }

    public static Specification<Tour> hasAccess(List<Long> bookedTourIds, boolean isAdmin) {
        return new Specification<Tour>() {
            @Override
            public Predicate toPredicate(Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                Predicate notDeleted = cb.isFalse(root.get("isDeleted"));

                if (isAdmin) {
                    return notDeleted;
                }

                Predicate notArchived = cb.isFalse(root.get("isArchived"));
                Predicate notHidden = cb.isFalse(root.get("isHidden"));
                Predicate accessCondition;

                if (bookedTourIds != null && !bookedTourIds.isEmpty()) {
                    Predicate isBooked = root.get("tourId").in(bookedTourIds);
                    accessCondition = cb.or(notHidden, isBooked);
                } else {
                    accessCondition = notHidden;
                }

                return cb.and(notDeleted, notArchived, accessCondition);
            }
        };
    }

    public static Specification<Tour> withFilters(TourSearchCriteria criteria) {
        return new Specification<Tour>() {
            @Override
            public Predicate toPredicate(Root<Tour> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                query.distinct(true);
                List<Predicate> predicates = new ArrayList<>();

                if (criteria.getIsComingSoon() != null) {
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime dayAhead = now.plusHours(24);

                    if (Boolean.TRUE.equals(criteria.getIsComingSoon())) {
                        predicates.add(cb.between(root.get("startDate"), now, dayAhead));
                    } else {
                        predicates.add(cb.greaterThan(root.get("startDate"), dayAhead));
                    }
                }

                if (criteria.getQuery() != null && !criteria.getQuery().isBlank()) {
                    String searchPattern = "%" + criteria.getQuery().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), searchPattern),
                            cb.like(cb.lower(root.get("description")), searchPattern)
                    ));
                }

                if (criteria.getIsArchived() != null) {
                    if (criteria.getIsArchived()) {
                        predicates.add(cb.and(
                                cb.equal(root.get("isArchived"), true),
                                cb.lessThan(root.get("endDate"), LocalDateTime.now())
                        ));
                    } else {
                        predicates.add(cb.equal(root.get("isArchived"), false));
                    }
                }
                if (criteria.getIsHidden() != null) {
                    predicates.add(cb.equal(root.get("isHidden"), criteria.getIsHidden()));
                }

                List<Predicate> statusPredicates = new ArrayList<>();
                boolean hasShowFilters = Boolean.TRUE.equals(criteria.getShowActive()) ||
                        Boolean.TRUE.equals(criteria.getShowHidden()) ||
                        Boolean.TRUE.equals(criteria.getShowArchived());

                if (hasShowFilters) {
                    if (Boolean.TRUE.equals(criteria.getShowActive())) {
                        statusPredicates.add(cb.and(
                                cb.isFalse(root.get("isHidden")),
                                cb.isFalse(root.get("isArchived"))
                        ));
                    }
                    if (Boolean.TRUE.equals(criteria.getShowHidden())) {
                        statusPredicates.add(cb.isTrue(root.get("isHidden")));
                    }
                    if (Boolean.TRUE.equals(criteria.getShowArchived())) {
                        statusPredicates.add(cb.isTrue(root.get("isArchived")));
                    }
                    predicates.add(cb.or(statusPredicates.toArray(new Predicate[0])));
                }

                if (criteria.getIsArchived() == null &&
                        criteria.getIsHidden() == null &&
                        !hasShowFilters &&
                        !Boolean.TRUE.equals(criteria.getIsComingSoon())) {

                    predicates.add(cb.and(
                            cb.isFalse(root.get("isHidden")),
                            cb.isFalse(root.get("isArchived"))
                    ));
                }

                if (criteria.getStartCity() != null && !criteria.getStartCity().isBlank()) {
                    predicates.add(cb.equal(
                            cb.lower(root.join("startLocation").get("cityName")),
                            criteria.getStartCity().toLowerCase()
                    ));
                }

                if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
                    predicates.add(cb.equal(
                            cb.lower(root.join("stops").join("location").get("countryName")),
                            criteria.getCountry().toLowerCase()
                    ));
                }

                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), criteria.getDateTo()));
                }

                if (criteria.getPriceFrom() != null) {
                    predicates.add(cb.ge(root.get("price"), criteria.getPriceFrom()));
                }
                if (criteria.getPriceTo() != null) {
                    predicates.add(cb.le(root.get("price"), criteria.getPriceTo()));
                }

                if (criteria.getHotelStars() != null) {
                    predicates.add(cb.equal(
                            root.join("stops").join("hotel").get("stars"),
                            criteria.getHotelStars()
                    ));
                }

                if (criteria.getTransportType() != null && !criteria.getTransportType().isBlank()) {
                    predicates.add(cb.like(
                            cb.lower(root.join("transport").get("transportName")),
                            "%" + criteria.getTransportType().toLowerCase() + "%"
                    ));
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            }
        };
    }
}