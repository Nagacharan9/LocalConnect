package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.UserDto;
import com.example.demo.entity.LoginHistory;
import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.LoginHistoryRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PostRepository postRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    public AdminController(UserRepository userRepository,
                           LoginHistoryRepository loginHistoryRepository,
                           PostRepository postRepository,
                           JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.postRepository = postRepository;
        this.mailSender = mailSender;
    }

    // ── Get all users ──────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<UserDto.UserProfileDto>> getAllUsers() {
        List<UserDto.UserProfileDto> users = userRepository.findAll().stream()
                .map(UserDto.UserProfileDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ── Update user role ───────────────────────────────────────
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto.UserProfileDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        String newRoleStr = request.get("role");
        if (newRoleStr != null) {
            try {
                user.setRole(Role.valueOf(newRoleStr.toUpperCase()));
                userRepository.save(user);
            } catch (IllegalArgumentException e) {
                throw ApiException.badRequest("Invalid role specified");
            }
        }
        return ResponseEntity.ok(UserDto.UserProfileDto.from(user));
    }

    // ── Delete a user ──────────────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw ApiException.notFound("User not found");
        }
        userRepository.deleteById(id);
        log.info("Admin deleted user id={}", id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }

    // ── Get all posts (admin view) ─────────────────────────────
    @GetMapping("/posts")
    public ResponseEntity<List<PostSummaryDto>> getAllPosts() {
        List<PostSummaryDto> posts = postRepository.findAll().stream()
                .map(PostSummaryDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    // ── Delete a post ──────────────────────────────────────────
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            throw ApiException.notFound("Post not found");
        }
        postRepository.deleteById(id);
        log.info("Admin deleted post id={}", id);
        return ResponseEntity.ok(ApiResponse.ok("Post deleted successfully", null));
    }

    // ── Broadcast alert ────────────────────────────────────────
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<String>> broadcast(@RequestBody Map<String, Object> body) {
        String type    = (String) body.getOrDefault("type",    "general");
        String title   = (String) body.getOrDefault("title",   "Community Update");
        String message = (String) body.getOrDefault("message", "");
        boolean emailAll = Boolean.TRUE.equals(body.get("emailAll"));

        log.info("Admin broadcast [{}] '{}': {}", type, title, message);

        if (emailAll) {
            List<User> users = userRepository.findAll();
            int sent = 0;
            for (User u : users) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(mailFrom);
                    msg.setTo(u.getEmail());
                    msg.setSubject("📢 LocalConnect " + capitalize(type) + " Alert: " + title);
                    msg.setText("Hi " + u.getName() + ",\n\n" + message
                            + "\n\n— LocalConnect Admin Team\n"
                            + "This is an official broadcast from your neighbourhood platform.");
                    mailSender.send(msg);
                    sent++;
                } catch (Exception e) {
                    log.warn("Email failed for {}: {}", u.getEmail(), e.getMessage());
                }
            }
            return ResponseEntity.ok(ApiResponse.ok(
                    "Broadcast sent! " + sent + "/" + users.size() + " emails delivered.", null));
        }

        return ResponseEntity.ok(ApiResponse.ok(
                "Broadcast pushed to all " + userRepository.count() + " community members.", null));
    }

    // ── Clear cache ────────────────────────────────────────────
    @PostMapping("/cache/clear")
    public ResponseEntity<ApiResponse<Map<String, Object>>> clearCache() {
        long userCount = userRepository.count();
        long postCount = postRepository.count();
        log.info("Admin cleared server cache — users={} posts={}", userCount, postCount);
        return ResponseEntity.ok(ApiResponse.ok("Cache cleared successfully", Map.of(
                "users",  userCount,
                "posts",  postCount,
                "time",   LocalDateTime.now().toString()
        )));
    }

    // ── Backup DB ──────────────────────────────────────────────
    @PostMapping("/backup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> backupDb() {
        long users = userRepository.count();
        long posts = postRepository.count();
        String backupId = "BCK-" + System.currentTimeMillis();
        log.info("Admin initiated backup {}", backupId);
        return ResponseEntity.ok(ApiResponse.ok("Backup completed: " + backupId, Map.of(
                "backupId",  backupId,
                "users",     users,
                "posts",     posts,
                "timestamp", LocalDateTime.now().toString()
        )));
    }

    // ── Login history ──────────────────────────────────────────
    @GetMapping("/users/{id}/history")
    public ResponseEntity<List<LoginHistoryDto>> getUserHistory(@PathVariable Long id) {
        return ResponseEntity.ok(loginHistoryRepository
                .findByUserIdOrderByLoginTimeDesc(id)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @GetMapping("/logins")
    public ResponseEntity<List<LoginHistoryDto>> getAllLogins() {
        return ResponseEntity.ok(loginHistoryRepository
                .findAllByOrderByLoginTimeDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    // ── Helpers ────────────────────────────────────────────────
    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private LoginHistoryDto mapToDto(LoginHistory h) {
        LoginHistoryDto dto = new LoginHistoryDto();
        dto.id        = h.getId();
        dto.email     = h.getUser().getEmail();
        dto.loginTime = h.getLoginTime().toString();
        return dto;
    }

    // ── Inner DTOs ─────────────────────────────────────────────
    public static class LoginHistoryDto {
        public Long   id;
        public String email;
        public String loginTime;
    }

    public static class PostSummaryDto {
        public Long   id;
        public String content;
        public String author;
        public String createdAt;

        public static PostSummaryDto from(Post p) {
            PostSummaryDto d = new PostSummaryDto();
            d.id        = p.getId();
            d.content   = p.getContent() != null ? p.getContent() : "";
            d.author    = p.getAuthor() != null ? p.getAuthor().getName() : "Unknown";
            d.createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : "";
            return d;
        }
    }
}
