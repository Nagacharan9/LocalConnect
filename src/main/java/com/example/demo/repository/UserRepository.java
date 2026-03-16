package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Haversine formula to find nearby users within radius km.
     */
    @Query(value = """
        SELECT u.* FROM users u
        WHERE u.latitude IS NOT NULL
          AND u.longitude IS NOT NULL
          AND u.id != :userId
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(u.latitude))
              * cos(radians(u.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(u.latitude))
            )
          ) <= :radiusKm
        ORDER BY (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(u.latitude))
              * cos(radians(u.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(u.latitude))
            )
          ) ASC
        """, nativeQuery = true)
    List<User> findNearbyUsers(
        @Param("userId") Long userId,
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm
    );
}
