package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.SosDto;
import com.example.demo.service.SosAlertService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    private final SosAlertService sosAlertService;

    public SosController(SosAlertService sosAlertService) {
        this.sosAlertService = sosAlertService;
    }

    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<SosDto.SosAlertResponse>> trigger(
            @Valid @RequestBody SosDto.SosAlertRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("SOS alert sent",
                sosAlertService.triggerSos(request)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<SosDto.SosAlertResponse>>> history(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(sosAlertService.getHistory(page, size)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Page<SosDto.SosAlertResponse>>> active(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(sosAlertService.getActiveAlerts(page, size)));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<SosDto.SosAlertResponse>> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Alert resolved",
                sosAlertService.resolveAlert(id)));
    }
}
