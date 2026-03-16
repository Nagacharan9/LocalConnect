package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    Page<Booking> findByServiceProviderIdOrderByCreatedAtDesc(Long providerId, Pageable pageable);
    Page<Booking> findByServiceProviderIdAndStatusOrderByCreatedAtDesc(Long providerId, BookingStatus status, Pageable pageable);
}
