package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.ServiceDto;
import com.example.demo.enums.BookingStatus;
import com.example.demo.service.ServiceListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ServiceController {

    private final ServiceListingService serviceListingService;

    public ServiceController(ServiceListingService serviceListingService) {
        this.serviceListingService = serviceListingService;
    }

    // ── Service Listings ─────────────────────────────────────────
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ServiceDto.ServiceListingResponse>> createListing(
            @Valid @RequestBody ServiceDto.CreateServiceRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Listing created",
                        serviceListingService.createListing(request)));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<Page<ServiceDto.ServiceListingResponse>>> search(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0")  double radius,
            @RequestParam(required = false)       String category,
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "20")    int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                serviceListingService.searchNearby(category, lat, lng, radius, page, size)));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceDto.ServiceListingResponse>> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceListingService.getById(id)));
    }

    // ── Bookings ──────────────────────────────────────────────────
    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<ServiceDto.BookingResponse>> createBooking(
            @Valid @RequestBody ServiceDto.CreateBookingRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created",
                        serviceListingService.createBooking(request)));
    }

    @GetMapping("/bookings/me")
    public ResponseEntity<ApiResponse<Page<ServiceDto.BookingResponse>>> getMyBookings(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                serviceListingService.getMyBookings(page, size)));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<ServiceDto.BookingResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ServiceDto.UpdateBookingStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                serviceListingService.updateBookingStatus(id, request.getStatus())));
    }
}
