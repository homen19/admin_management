package com.iit.admin.repository;

import com.iit.admin.entity.ChatChannel;
import com.iit.admin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatChannelRepository extends JpaRepository<ChatChannel, Long> {

    @Query("SELECT c FROM ChatChannel c JOIN ChatParticipant p ON p.channel = c WHERE p.user = :user AND c.archived = false ORDER BY c.createdAt DESC")
    List<ChatChannel> findChannelsByParticipant(@Param("user") User user);

    @Query("SELECT c FROM ChatChannel c JOIN ChatParticipant p ON p.channel = c WHERE p.user = :user AND c.type = 'DIRECT' AND c.archived = false")
    List<ChatChannel> findDirectChannelsByUser(@Param("user") User user);

    @Query("SELECT c FROM ChatChannel c JOIN ChatParticipant p ON p.channel = c WHERE p.user = :user AND c.type = 'GROUP' AND c.archived = false")
    List<ChatChannel> findGroupChannelsByUser(@Param("user") User user);

    @Query("SELECT c FROM ChatChannel c JOIN ChatParticipant p1 ON p1.channel = c JOIN ChatParticipant p2 ON p2.channel = c " +
           "WHERE p1.user = :user1 AND p2.user = :user2 AND c.type = 'DIRECT'")
    Optional<ChatChannel> findDirectChannelBetween(@Param("user1") User user1, @Param("user2") User user2);
}
