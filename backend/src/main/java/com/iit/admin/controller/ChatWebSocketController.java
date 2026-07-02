package com.iit.admin.controller;

import com.iit.admin.dto.ChatMessageDTO;
import com.iit.admin.dto.SendMessageRequest;
import com.iit.admin.entity.ChatMessage;
import com.iit.admin.entity.User;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.service.ChatChannelService;
import com.iit.admin.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final ChatChannelService chatChannelService;
    private final UserRepository userRepository;

    /**
     * Client sends to /app/chat.send
     * Server broadcasts to /topic/channel/{channelId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        User sender = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is a participant of the channel
        if (!chatChannelService.isParticipant(request.getChannelId(), sender)) {
            return;
        }

        ChatMessage.MessageType type = ChatMessage.MessageType.TEXT;
        try {
            type = ChatMessage.MessageType.valueOf(request.getMessageType());
        } catch (IllegalArgumentException ignored) {}

        ChatMessageDTO savedMessage = chatMessageService.saveMessage(
                request.getChannelId(), sender, request.getContent(), type, request.getFileUrl(), request.getFileName());

        // Broadcast to all subscribers of this channel
        messagingTemplate.convertAndSend(
                "/topic/channel/" + request.getChannelId(),
                savedMessage
        );
    }

    /**
     * Client sends to /app/chat.typing
     * Server broadcasts typing indicator to channel subscribers
     */
    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload TypingPayload payload, Principal principal) {
        TypingNotification notification = new TypingNotification(principal.getName(), payload.getChannelId(), payload.isTyping());
        messagingTemplate.convertAndSend(
                "/topic/channel/" + payload.getChannelId() + "/typing",
                notification
        );
    }

    /**
     * Client sends to /app/chat.webrtc
     * Server broadcasts WebRTC signaling data to channel subscribers
     */
    @MessageMapping("/chat.webrtc")
    public void webrtcSignal(@Payload com.iit.admin.dto.WebRTCSignal signal, Principal principal) {
        // Enforce sender identity to prevent spoofing
        signal.setSenderUsername(principal.getName());
        
        messagingTemplate.convertAndSend(
                "/topic/channel/" + signal.getChannelId() + "/webrtc",
                signal
        );
    }

    /**
     * Client sends to /app/chat.status
     * Server broadcasts user presence status to all subscribers
     */
    @MessageMapping("/chat.status")
    public void statusUpdate(@Payload StatusPayload payload, Principal principal) {
        StatusNotification notification = new StatusNotification(principal.getName(), payload.getStatus());
        messagingTemplate.convertAndSend("/topic/status", notification);
    }

    // Inner payload classes
    public static class StatusPayload {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StatusNotification {
        private String username;
        private String status;

        public StatusNotification(String username, String status) {
            this.username = username;
            this.status = status;
        }

        public String getUsername() { return username; }
        public String getStatus() { return status; }
    }

    public static class TypingPayload {
        private Long channelId;
        private boolean typing;

        public Long getChannelId() { return channelId; }
        public void setChannelId(Long channelId) { this.channelId = channelId; }
        public boolean isTyping() { return typing; }
        public void setTyping(boolean typing) { this.typing = typing; }
    }

    public static class TypingNotification {
        private String username;
        private Long channelId;
        private boolean typing;

        public TypingNotification(String username, Long channelId, boolean typing) {
            this.username = username;
            this.channelId = channelId;
            this.typing = typing;
        }

        public String getUsername() { return username; }
        public Long getChannelId() { return channelId; }
        public boolean isTyping() { return typing; }
    }
}
