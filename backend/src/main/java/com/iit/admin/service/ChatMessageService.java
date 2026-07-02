package com.iit.admin.service;

import com.iit.admin.dto.ChatMessageDTO;
import com.iit.admin.entity.ChatChannel;
import com.iit.admin.entity.ChatMessage;
import com.iit.admin.entity.User;
import com.iit.admin.repository.ChatChannelRepository;
import com.iit.admin.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final ChatChannelRepository channelRepository;

    @Transactional
    public ChatMessageDTO saveMessage(Long channelId, User sender, String content, ChatMessage.MessageType type, String fileUrl, String fileName) {
        ChatChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found: " + channelId));

        ChatMessage message = new ChatMessage();
        message.setChannel(channel);
        message.setSender(sender);
        message.setContent(content);
        message.setMessageType(type);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message = messageRepository.save(message);
        return ChatMessageDTO.fromEntity(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesByChannel(Long channelId, int page, int size) {
        ChatChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found: " + channelId));

        Page<ChatMessage> messages = messageRepository.findByChannelOrderBySentAtDesc(
                channel, PageRequest.of(page, size, Sort.by("sentAt").descending()));

        // Reverse so oldest is first for natural chat display
        List<ChatMessage> list = messages.getContent();
        return list.stream()
                .sorted((a, b) -> a.getSentAt().compareTo(b.getSentAt()))
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMessage(Long messageId, User requestingUser) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only sender or admin can delete
        boolean isAdmin = requestingUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isSender = message.getSender().getId().equals(requestingUser.getId());

        if (!isAdmin && !isSender) {
            throw new SecurityException("Not authorized to delete this message");
        }

        message.setDeleted(true);
        messageRepository.save(message);
    }
}
