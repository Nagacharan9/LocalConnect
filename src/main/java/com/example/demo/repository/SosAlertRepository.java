package com.example.demo.repository;

import com.example.demo.entity.SosAlert;
import com.example.demo.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
    Page<SosAlert> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<SosAlert> findByStatus(AlertStatus status);
    Page<SosAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
