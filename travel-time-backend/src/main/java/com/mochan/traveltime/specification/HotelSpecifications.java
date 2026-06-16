package com.mochan.traveltime.specification;

import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.Location;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class HotelSpecifications {

    public static Specification<Hotel> withFilter(String searchTerm) {
        return Specification.where(isNotDeleted())
                            .and(containsText(searchTerm));
    }

    private static Specification<Hotel> isNotDeleted() {
        return new Specification<Hotel>() {
            @Override
            public Predicate toPredicate(Root<Hotel> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                return cb.isFalse(root.get("isDeleted"));
            }
        };
    }

    private static Specification<Hotel> containsText(String searchTerm) {
        return new Specification<Hotel>() {
            @Override
            public Predicate toPredicate(Root<Hotel> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
                if (searchTerm == null || searchTerm.isBlank()) {
                    return cb.conjunction();
                }

                String searchPattern = "%" + searchTerm.toLowerCase() + "%";

                Join<Hotel, Location> locationJoin = root.join("location");

                return cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern),
                        cb.like(cb.lower(locationJoin.get("countryName")), searchPattern),
                        cb.like(cb.lower(locationJoin.get("cityName")), searchPattern)
                );
            }
        };
    }
}