package com.iit.admin.controller;

import com.iit.admin.dto.ChatChannelDTO;
import com.iit.admin.dto.ChatMessageDTO;
import com.iit.admin.dto.CreateChannelRequest;
import com.iit.admin.entity.User;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.service.ChatChannelService;
import com.iit.admin.service.ChatMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatChannelService chatChannelService;
    private final ChatMessageService chatMessageService;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // ── Channels ──────────────────────────────────────────────

    @GetMapping("/channels")
    public ResponseEntity<List<ChatChannelDTO>> getMyChannels(Principal principal) {
        User currentUser = getUser(principal);
        return ResponseEntity.ok(chatChannelService.getUserChannels(currentUser));
    }

    @PostMapping("/channels")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ChatChannelDTO> createChannel(
            @Valid @RequestBody CreateChannelRequest request, Principal principal) {
        User currentUser = getUser(principal);
        return ResponseEntity.ok(chatChannelService.createGroupChannel(request, currentUser));
    }

    @DeleteMapping("/channels/{channelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archiveChannel(@PathVariable Long channelId) {
        chatChannelService.archiveChannel(channelId);
        return ResponseEntity.ok().build();
    }

    // ── Direct Messages ───────────────────────────────────────

    @PostMapping("/dm/{targetUserId}")
    public ResponseEntity<ChatChannelDTO> startDirectMessage(
            @PathVariable Long targetUserId, Principal principal) {
        User currentUser = getUser(principal);
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(chatChannelService.getOrCreateDirectChannel(currentUser, targetUser));
    }

    // ── Messages ──────────────────────────────────────────────

    @GetMapping("/channels/{channelId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        User currentUser = getUser(principal);
        if (!chatChannelService.isParticipant(channelId, currentUser)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(chatMessageService.getMessagesByChannel(channelId, page, size));
    }

    @PostMapping("/channels/{channelId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long channelId, Principal principal) {
        chatChannelService.markChannelAsRead(channelId, getUser(principal));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId, Principal principal) {
        chatMessageService.deleteMessage(messageId, getUser(principal));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        try {
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path targetLocation = dirPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/" + filename);
            response.put("fileName", file.getOriginalFilename());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    // ── User Search ───────────────────────────────────────────

    @GetMapping("/users/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(
            @RequestParam String q, Principal principal) {
        User currentUser = getUser(principal);
        List<User> users = userRepository.searchUsers(q, org.springframework.data.domain.PageRequest.of(0, 20)).getContent();
        List<Map<String, Object>> result = users.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "role", u.getRole() != null ? u.getRole().getName() : ""
                ))
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/colleagues")
    public ResponseEntity<List<Map<String, Object>>> getColleagues(Principal principal) {
        User currentUser = getUser(principal);
        List<User> users = userRepository.findByRole_NameNot("ROLE_STUDENT");
        List<Map<String, Object>> result = users.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "role", u.getRole() != null ? u.getRole().getName() : ""
                ))
                .toList();
        return ResponseEntity.ok(result);
    }

    private User getUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
