package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.NotificationDto;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationDto.NotificationResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                notificationService.getNotifications(principal.getUserId(), page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<NotificationDto.UnreadCountResponse>> unreadCount(
            @AuthenticationPrincipal CustomUserDetails principal) {
        long count = notificationService.getUnreadCount(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(new NotificationDto.UnreadCountResponse(count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        notificationService.markRead(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllRead(
            @AuthenticationPrincipal CustomUserDetails principal) {
        int count = notificationService.markAllRead(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(count + " notifications marked as read", null));
    }
}
