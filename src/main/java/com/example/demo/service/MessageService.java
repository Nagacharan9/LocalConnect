package com.example.demo.service;

import com.example.demo.dto.MessageDto;
import com.example.demo.entity.Conversation;
import com.example.demo.entity.Message;
import com.example.demo.entity.User;
import com.example.demo.enums.NotificationType;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository      messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository         userRepository;
    private final UserService            userService;
    private final NotificationService    notificationService;
    private final SimpMessagingTemplate  messagingTemplate;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository, UserRepository userRepository, UserService userService, NotificationService notificationService, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageDto.MessageResponse sendMessage(Long receiverId, String content) {
        User sender   = userService.currentUser();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ApiException.notFound("Recipient not found"));

        // Get or create conversation
        Conversation conversation = conversationRepository
                .findByTwoParticipants(sender.getId(), receiver.getId())
                .orElseGet(() -> {
                    Set<User> participants = new HashSet<>(Set.of(sender, receiver));
                    participants.forEach(u -> u.getConversations().add(null)); // will be set below
                    Conversation conv = Conversation.builder().build();
                    conv = conversationRepository.save(conv);
                    sender.getConversations().add(conv);
                    receiver.getConversations().add(conv);
                    userRepository.save(sender);
                    userRepository.save(receiver);
                    return conv;
                });

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build();
        message = messageRepository.save(message);

        // Update conversation lastMessage preview
        conversation.setLastMessage(content.length() > 100 ? content.substring(0, 100) + "…" : content);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageDto.MessageResponse dto = MessageDto.MessageResponse.from(message);

        // Broadcast to conversation WebSocket topic
        messagingTemplate.convertAndSend(
                "/topic/messages/" + conversation.getId(), dto);

        // Push notification to receiver
        notificationService.send(
            receiverId, NotificationType.DIRECT_MESSAGE,
            "New message from " + sender.getName(),
            content.substring(0, Math.min(80, content.length())),
            conversation.getId()
        );

        return dto;
    }

    @Transactional(readOnly = true)
    public List<MessageDto.ConversationResponse> getConversations() {
        User me = userService.currentUser();
        return conversationRepository.findByParticipantId(me.getId())
                .stream()
                .map(conv -> {
                    long unread = messageRepository
                            .countByConversationIdAndReadFalseAndSenderIdNot(conv.getId(), me.getId());
                    return MessageDto.ConversationResponse.from(conv, unread);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MessageDto.MessageResponse> getHistory(Long conversationId, int page, int size) {
        User me = userService.currentUser();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Conversation not found"));
        boolean isMember = conv.getParticipants().stream()
                .anyMatch(u -> u.getId().equals(me.getId()));
        if (!isMember) throw ApiException.forbidden("Not a member of this conversation");

        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size))
                .map(MessageDto.MessageResponse::from);
    }

    @Transactional
    public int markRead(Long conversationId) {
        User me = userService.currentUser();
        return messageRepository.markAsRead(conversationId, me.getId());
    }
}
