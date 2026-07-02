package com.iit.admin.dto;

import com.iit.admin.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    private Long id;
    private Long channelId;
    private Long senderId;
    private String senderUsername;
    private String senderName;
    private String senderRole;
    private String content;
    private String fileUrl;
    private String fileName;
    private ChatMessage.MessageType messageType;
    private boolean deleted;
    private LocalDateTime sentAt;

    public static ChatMessageDTO fromEntity(ChatMessage msg) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(msg.getId());
        dto.setChannelId(msg.getChannel().getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderUsername(msg.getSender().getUsername());
        dto.setContent(msg.isDeleted() ? "This message was deleted." : msg.getContent());
        dto.setFileUrl(msg.isDeleted() ? null : msg.getFileUrl());
        dto.setFileName(msg.isDeleted() ? null : msg.getFileName());
        dto.setMessageType(msg.getMessageType());
        dto.setDeleted(msg.isDeleted());
        dto.setSentAt(msg.getSentAt());
        if (msg.getSender().getRole() != null) {
            dto.setSenderRole(msg.getSender().getRole().getName());
        }
        return dto;
    }
}
