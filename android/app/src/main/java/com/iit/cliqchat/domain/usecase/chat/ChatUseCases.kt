package com.iit.cliqchat.domain.usecase.chat

import com.iit.cliqchat.domain.model.Channel
import com.iit.cliqchat.domain.model.Message
import com.iit.cliqchat.domain.repository.ChatRepository
import javax.inject.Inject

class GetChannelsUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    suspend operator fun invoke(): Result<List<Channel>> {
        return repository.getChannels()
    }
}

class GetMessagesUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    suspend operator fun invoke(channelId: String, page: Int = 0): Result<List<Message>> {
        return repository.getMessages(channelId, page)
    }
}

class SendMessageUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    operator fun invoke(channelId: String, content: String) {
        repository.sendMessage(channelId, content)
    }
}

class ConnectChatWebSocketUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    operator fun invoke(token: String, onMessageReceived: (String) -> Unit) {
        repository.connectWebSocket(token, onMessageReceived)
    }
}

class SubscribeToChannelUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    operator fun invoke(channelId: String, subscriptionId: String) {
        repository.subscribeToChannel(channelId, subscriptionId)
    }
}

class DisconnectChatWebSocketUseCase @Inject constructor(
    private val repository: ChatRepository
) {
    operator fun invoke() {
        repository.disconnectWebSocket()
    }
}
