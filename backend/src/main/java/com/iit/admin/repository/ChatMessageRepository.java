package com.iit.admin.repository;

import com.iit.admin.entity.ChatChannel;
import com.iit.admin.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.channel = :channel AND m.deleted = false ORDER BY m.sentAt DESC")
    Page<ChatMessage> findByChannelOrderBySentAtDesc(@Param("channel") ChatChannel channel, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.channel = :channel AND m.deleted = false AND m.sentAt > :since")
    long countUnreadMessages(@Param("channel") ChatChannel channel, @Param("since") LocalDateTime since);

    @Query("SELECT m FROM ChatMessage m WHERE m.channel = :channel AND m.deleted = false ORDER BY m.sentAt ASC")
    List<ChatMessage> findLatestByChannel(@Param("channel") ChatChannel channel, Pageable pageable);
}
