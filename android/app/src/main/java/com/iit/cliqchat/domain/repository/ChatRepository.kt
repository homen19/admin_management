package com.iit.cliqchat.domain.repository

import com.iit.cliqchat.domain.model.Channel
import com.iit.cliqchat.domain.model.Message

interface ChatRepository {
    suspend fun getChannels(): Result<List<Channel>>
    suspend fun getMessages(channelId: String, page: Int = 0): Result<List<Message>>
    fun connectWebSocket(token: String, onMessageReceived: (String) -> Unit)
    fun subscribeToChannel(channelId: String, subscriptionId: String)
    fun sendMessage(channelId: String, content: String)
    fun disconnectWebSocket()
}
