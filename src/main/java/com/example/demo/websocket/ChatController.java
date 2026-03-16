package com.example.demo.websocket;

import com.example.demo.dto.MessageDto;
import com.example.demo.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket STOMP controller for real-time chat.
 *
 * Client connects to /ws with SockJS, then:
 *  - Subscribes to /topic/messages/{conversationId} for incoming messages
 *  - Sends to /app/chat.send with SendMessageRequest payload
 */
@Controller
public class ChatController {

    private final MessageService messageService;

    public ChatController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload MessageDto.SendMessageRequest request,
            Principal principal) {
        // MessageService broadcasts to /topic/messages/{conversationId} internally
        messageService.sendMessage(request.getReceiverId(), request.getContent());
    }
}
