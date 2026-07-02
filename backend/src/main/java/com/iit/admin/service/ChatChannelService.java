package com.iit.admin.service;

import com.iit.admin.dto.ChatChannelDTO;
import com.iit.admin.dto.ChatMessageDTO;
import com.iit.admin.dto.CreateChannelRequest;
import com.iit.admin.entity.*;
import com.iit.admin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatChannelService {

    private final ChatChannelRepository channelRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatChannelDTO> getUserChannels(User currentUser) {
        List<ChatChannel> channels = channelRepository.findChannelsByParticipant(currentUser);
        return channels.stream().map(channel -> buildChannelDTO(channel, currentUser)).collect(Collectors.toList());
    }

    @Transactional
    public ChatChannelDTO createGroupChannel(CreateChannelRequest request, User creator) {
        ChatChannel channel = new ChatChannel();
        channel.setName(request.getName());
        channel.setDescription(request.getDescription());
        channel.setType(ChatChannel.ChannelType.valueOf(request.getType()));
        channel.setCreatedBy(creator);
        final ChatChannel savedChannel = channelRepository.save(channel);


        addParticipant(savedChannel, creator);

        
        if (request.getParticipantUserIds() != null) {
            for (Long userId : request.getParticipantUserIds()) {
                userRepository.findById(userId).ifPresent(user -> addParticipant(savedChannel, user));
            }
        }
        return buildChannelDTO(savedChannel, creator);
    }

    @Transactional
    public ChatChannelDTO getOrCreateDirectChannel(User user1, User user2) {
        return channelRepository.findDirectChannelBetween(user1, user2)
                .map(channel -> buildChannelDTO(channel, user1))
                .orElseGet(() -> {
                    ChatChannel channel = new ChatChannel();
                    channel.setName(user1.getUsername() + "_" + user2.getUsername());
                    channel.setType(ChatChannel.ChannelType.DIRECT);
                    channel.setCreatedBy(user1);
                    ChatChannel saved = channelRepository.save(channel);
                    addParticipant(saved, user1);
                    addParticipant(saved, user2);
                    return buildChannelDTO(saved, user1);
                });
    }

    @Transactional
    public void markChannelAsRead(Long channelId, User user) {
        channelRepository.findById(channelId).ifPresent(channel -> {
            participantRepository.findByChannelAndUser(channel, user).ifPresent(participant -> {
                participant.setLastReadAt(LocalDateTime.now());
                participantRepository.save(participant);
            });
        });
    }

    @Transactional
    public void archiveChannel(Long channelId) {
        channelRepository.findById(channelId).ifPresent(channel -> {
            channel.setArchived(true);
            channelRepository.save(channel);
        });
    }

    private void addParticipant(ChatChannel channel, User user) {
        if (!participantRepository.existsByChannelAndUser(channel, user)) {
            ChatParticipant participant = new ChatParticipant();
            participant.setChannel(channel);
            participant.setUser(user);
            participantRepository.save(participant);
        }
    }

    private ChatChannelDTO buildChannelDTO(ChatChannel channel, User currentUser) {
        ChatChannelDTO dto = ChatChannelDTO.fromEntity(channel);
        dto.setMemberCount(participantRepository.countByChannel(channel));

        // Compute unread count
        participantRepository.findByChannelAndUser(channel, currentUser).ifPresent(p -> {
            LocalDateTime since = p.getLastReadAt() != null ? p.getLastReadAt() : LocalDateTime.of(2000, 1, 1, 0, 0);
            long unread = messageRepository.countUnreadMessages(channel, since);
            dto.setUnreadCount(unread);
        });

        // Last message
        List<ChatMessage> latest = messageRepository.findLatestByChannel(channel,
                org.springframework.data.domain.PageRequest.of(0, 1, org.springframework.data.domain.Sort.by("sentAt").descending()));
        if (!latest.isEmpty()) {
            dto.setLastMessage(ChatMessageDTO.fromEntity(latest.get(0)));
        }

        // Participants list
        List<ChatParticipant> participants = participantRepository.findByChannel(channel);
        List<ChatChannelDTO.ParticipantInfo> participantInfos = new ArrayList<>();
        for (ChatParticipant p : participants) {
            String role = p.getUser().getRole() != null ? p.getUser().getRole().getName() : "";
            participantInfos.add(new ChatChannelDTO.ParticipantInfo(
                    p.getUser().getId(), p.getUser().getUsername(), role));
        }
        dto.setParticipants(participantInfos);

        return dto;
    }

    public boolean isParticipant(Long channelId, User user) {
        return channelRepository.findById(channelId)
                .map(channel -> participantRepository.existsByChannelAndUser(channel, user))
                .orElse(false);
    }
}
