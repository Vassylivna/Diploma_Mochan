package com.mochan.traveltime.specification;

import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.Transport;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class TransportSpecifications {

    public static Specification<Transport> withFilter(String searchTerm) {
        return Specification
                .where(isNotDeleted())
                .and(containsText(searchTerm));
    }

    public static Specification<Transport> withAvailability(LocalDateTime start, LocalDateTime end) {
        return Specification
                .where(isNotDeleted())
                .and(isAvailable(start, end));
    }

    private static Specification<Transport> isNotDeleted() {
        return new Specification<Transport>() {
            @Override
            public Predicate toPredicate( Root<Transport> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.isFalse(root.get("isDeleted"));
            }
        };
    }

    private static Specification<Transport> containsText(String searchTerm) {
        return new Specification<Transport>() {
            @Override
            public Predicate toPredicate(Root<Transport> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (searchTerm == null || searchTerm.isBlank()) {
                    return cb.conjunction();
                }
                String searchPattern = "%" + searchTerm.toLowerCase() + "%";
                return cb.or(
                        cb.like(cb.lower(root.get("transportName")), searchPattern),
                        cb.like(cb.lower(root.get("transportNumber")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                );
            }
        };
    }

    private static Specification<Transport> isAvailable(LocalDateTime reqStart, LocalDateTime reqEnd) {
        return new Specification<Transport>() {
            @Override
            public Predicate toPredicate(Root<Transport> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (reqStart == null || reqEnd == null) {
                    return cb.conjunction();
                }

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Tour> tour = subquery.from(Tour.class);

                subquery.select(tour.get("transport").get("transportId"));

                Predicate tourActive = cb.isFalse(tour.get("isDeleted"));
                Predicate hasTransport = cb.isNotNull(tour.get("transport"));
                Predicate overlap = cb.and(
                        cb.lessThan(tour.get("startDate"), reqEnd),
                        cb.greaterThan(tour.get("endDate"), reqStart)
                );

                subquery.where(cb.and(tourActive, hasTransport, overlap));

                return cb.not(root.get("transportId").in(subquery));
            }
        };
    }
}