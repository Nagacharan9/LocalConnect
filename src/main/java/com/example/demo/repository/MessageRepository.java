package com.example.demo.repository;

import com.example.demo.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true WHERE m.conversation.id = :convId AND m.sender.id != :userId AND m.read = false")
    int markAsRead(@Param("convId") Long conversationId, @Param("userId") Long userId);

    long countByConversationIdAndReadFalseAndSenderIdNot(Long conversationId, Long userId);
}
