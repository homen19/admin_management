package com.iit.admin.repository;

import com.iit.admin.entity.ChatChannel;
import com.iit.admin.entity.ChatParticipant;
import com.iit.admin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    List<ChatParticipant> findByChannel(ChatChannel channel);

    Optional<ChatParticipant> findByChannelAndUser(ChatChannel channel, User user);

    boolean existsByChannelAndUser(ChatChannel channel, User user);

    long countByChannel(ChatChannel channel);
}
