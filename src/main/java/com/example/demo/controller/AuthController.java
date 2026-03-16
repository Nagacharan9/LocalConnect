package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.AuthDto;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Step 1 – Request OTP to the provided email.
     * Auto-registers user on first call.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(
            @Valid @RequestBody AuthDto.EmailRequest request) {
        authService.initiateLogin(request.getEmail(), request.getName());
        return ResponseEntity.ok(
                ApiResponse.ok("OTP sent to " + request.getEmail(), null));
    }

    /**
     * Step 2 – Verify OTP and receive JWT token.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> verifyOtp(
            @Valid @RequestBody AuthDto.OtpVerifyRequest request) {
        AuthDto.AuthResponse response =
                authService.completeLogin(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}
