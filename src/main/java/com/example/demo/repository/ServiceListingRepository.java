package com.example.demo.repository;

import com.example.demo.entity.ServiceListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceListingRepository extends JpaRepository<ServiceListing, Long> {

    Page<ServiceListing> findByProviderIdAndActiveTrue(Long providerId, Pageable pageable);

    @Query(value = """
        SELECT s.* FROM service_listings s
        WHERE s.active = true
          AND (:category IS NULL OR s.category = :category)
          AND s.latitude IS NOT NULL
          AND s.longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(s.latitude))
              * cos(radians(s.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(s.latitude))
            )
          ) <= :radiusKm
        ORDER BY s.rating DESC
        """,
        countQuery = """
        SELECT count(*) FROM service_listings s
        WHERE s.active = true
          AND (:category IS NULL OR s.category = :category)
          AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(s.latitude))
              * cos(radians(s.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(s.latitude))
            )
          ) <= :radiusKm
        """, nativeQuery = true)
    Page<ServiceListing> findNearbyByCategory(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm,
        @Param("category") String category,
        Pageable pageable
    );
}
