package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.UserDto;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.UserProfileDto>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getProfile(principal.getUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.UserProfileDto>> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(id)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.UserProfileDto>> updateProfile(
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated",
                userService.updateProfile(request)));
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse<String>> updateLocation(
            @Valid @RequestBody UserDto.LocationUpdateRequest request) {
        userService.updateLocation(request.getLatitude(), request.getLongitude());
        return ResponseEntity.ok(ApiResponse.ok("Location updated", null));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<UserDto.NearbyUserDto>>> getNearbyUsers(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "2.0") Double radius) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getNearbyUsers(lat, lng, radius)));
    }
}
