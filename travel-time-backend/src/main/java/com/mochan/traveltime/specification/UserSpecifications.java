package com.mochan.traveltime.specification;

import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.Tour;
import com.mochan.traveltime.model.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class UserSpecifications {

    public static Specification<User> withFilters(String search, String role, String status, LocalDateTime startDate, LocalDateTime endDate) {
        return Specification.where(isNotDeleted())
                .and(containsText(search))
                .and(hasRole(role))
                .and(hasStatus(status))
                .and(isAvailable(startDate, endDate));
    }

    private static Specification<User> isNotDeleted() {
        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.isFalse(root.get("isDeleted"));
            }
        };
    }

    private static Specification<User> containsText(String search) {
        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (search == null || search.isBlank()) {
                    return cb.conjunction();
                }

                String pattern = "%" + search.toLowerCase() + "%";
                return cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                );
            }
        };
    }

    private static Specification<User> hasRole(String role) {
        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (role == null || role.isBlank() || role.equals("all")) {
                    return cb.conjunction();
                }
                return cb.equal(root.get("role"), Role.valueOf(role.toUpperCase()));
            }
        };
    }

    private static Specification<User> hasStatus(String status) {
        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (status == null || status.isBlank() || status.equals("all")) {
                    return cb.conjunction();
                }
                return cb.equal(root.get("accountStatus"), AccountStatus.valueOf(status.toUpperCase()));
            }
        };
    }

    private static Specification<User> isAvailable(LocalDateTime reqStart, LocalDateTime reqEnd) {
        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (reqStart == null || reqEnd == null) {
                    return cb.conjunction();
                }

                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Tour> tour = subquery.from(Tour.class);

                subquery.select(tour.get("guide").get("userId"));

                Predicate datesOverlap = cb.and(
                        cb.lessThan(tour.get("startDate"), reqEnd),
                        cb.greaterThan(tour.get("endDate"), reqStart)
                );

                Predicate isActive = cb.isFalse(tour.get("isDeleted"));
                Predicate hasGuide = cb.isNotNull(tour.get("guide"));

                subquery.where(cb.and(datesOverlap, isActive, hasGuide));

                return cb.not(root.get("userId").in(subquery));
            }
        };
    }
}