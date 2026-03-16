package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    /**
     * Returns posts within radius km, ordered by most recent first.
     */
    @Query(value = """
        SELECT p.* FROM posts p
        WHERE p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(p.latitude))
              * cos(radians(p.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(p.latitude))
            )
          ) <= :radiusKm
        ORDER BY p.created_at DESC
        """, nativeQuery = true,
        countQuery = """
        SELECT count(*) FROM posts p
        WHERE p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(p.latitude))
              * cos(radians(p.longitude) - radians(:lng))
              + sin(radians(:lat)) * sin(radians(p.latitude))
            )
          ) <= :radiusKm
        """)
    Page<Post> findNearbyPosts(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm,
        Pageable pageable
    );
}
