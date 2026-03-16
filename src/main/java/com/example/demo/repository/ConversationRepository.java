package com.example.demo.repository;

import com.example.demo.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("""
        SELECT c FROM Conversation c
        JOIN c.participants p1
        JOIN c.participants p2
        WHERE p1.id = :userId1 AND p2.id = :userId2
        """)
    Optional<Conversation> findByTwoParticipants(
        @Param("userId1") Long userId1,
        @Param("userId2") Long userId2
    );

    @Query("""
        SELECT c FROM Conversation c
        JOIN c.participants p
        WHERE p.id = :userId
        ORDER BY c.lastMessageAt DESC NULLS LAST
        """)
    java.util.List<Conversation> findByParticipantId(@Param("userId") Long userId);
}
