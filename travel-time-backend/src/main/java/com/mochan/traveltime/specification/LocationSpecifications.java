package com.mochan.traveltime.specification;

import com.mochan.traveltime.model.Location;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class LocationSpecifications {

    public static Specification<Location> withFilter(String searchTerm) {
        return Specification.where(isNotDeleted())
                            .and(containsText(searchTerm));
    }

    private static Specification<Location> isNotDeleted() {
        return new Specification<Location>() {
            @Override
            public Predicate toPredicate(Root<Location> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.isFalse(root.get("isDeleted"));
            }
        };
    }

    private static Specification<Location> containsText(String searchTerm) {
        return new Specification<Location>() {
            @Override
            public Predicate toPredicate(Root<Location> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (searchTerm == null || searchTerm.isBlank()) {
                    return cb.conjunction();
                }

                String searchPattern = "%" + searchTerm.toLowerCase() + "%";

                return cb.or(
                        cb.like(cb.lower(root.get("countryName")), searchPattern),
                        cb.like(cb.lower(root.get("cityName")), searchPattern),
                        cb.like(cb.lower(root.get("regionName")), searchPattern)
                );
            }
        };
    }
}