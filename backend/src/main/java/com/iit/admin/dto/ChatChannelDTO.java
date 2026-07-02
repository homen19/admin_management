package com.iit.admin.dto;

import com.iit.admin.entity.ChatChannel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatChannelDTO {

    private Long id;
    private String name;
    private String description;
    private ChatChannel.ChannelType type;
    private Long createdById;
    private String createdByUsername;
    private boolean archived;
    private LocalDateTime createdAt;
    private long memberCount;
    private long unreadCount;
    private ChatMessageDTO lastMessage;
    private List<ParticipantInfo> participants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long userId;
        private String username;
        private String role;
    }

    public static ChatChannelDTO fromEntity(ChatChannel channel) {
        ChatChannelDTO dto = new ChatChannelDTO();
        dto.setId(channel.getId());
        dto.setName(channel.getName());
        dto.setDescription(channel.getDescription());
        dto.setType(channel.getType());
        dto.setCreatedById(channel.getCreatedBy().getId());
        dto.setCreatedByUsername(channel.getCreatedBy().getUsername());
        dto.setArchived(channel.isArchived());
        dto.setCreatedAt(channel.getCreatedAt());
        return dto;
    }
}
