package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.MessageDto;
import com.example.demo.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageDto.MessageResponse>> sendMessage(
            @Valid @RequestBody MessageDto.SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Message sent",
                messageService.sendMessage(request.getReceiverId(), request.getContent())));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<MessageDto.ConversationResponse>>> getConversations() {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getConversations()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<Page<MessageDto.MessageResponse>>> getHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                messageService.getHistory(id, page, size)));
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(@PathVariable Long id) {
        int count = messageService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok(count + " messages marked as read", null));
    }
}
