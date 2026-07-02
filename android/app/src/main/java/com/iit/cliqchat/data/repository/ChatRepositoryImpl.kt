package com.iit.cliqchat.data.repository

import com.iit.cliqchat.data.remote.ChatApi
import com.iit.cliqchat.data.remote.ChatWebSocketManager
import com.iit.cliqchat.domain.model.Channel
import com.iit.cliqchat.domain.model.Message
import com.iit.cliqchat.domain.repository.ChatRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepositoryImpl @Inject constructor(
    private val chatApi: ChatApi,
    private val webSocketManager: ChatWebSocketManager
) : ChatRepository {

    override suspend fun getChannels(): Result<List<Channel>> {
        return try {
            val dtos = chatApi.getChannels()
            Result.success(dtos.map { 
                Channel(
                    id = it.id, 
                    name = it.name, 
                    description = it.description ?: "",
                    isDirectMessage = it.isDirectMessage ?: false
                ) 
            })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getMessages(channelId: String, page: Int): Result<List<Message>> {
        return try {
            val dtos = chatApi.getMessages(channelId, page)
            Result.success(dtos.map {
                Message(
                    id = it.id ?: "",
                    channelId = it.channelId,
                    senderUsername = it.senderUsername,
                    content = it.content,
                    timestamp = it.timestamp ?: ""
                )
            })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun connectWebSocket(token: String, onMessageReceived: (String) -> Unit) {
        webSocketManager.connect(token, onMessageReceived)
    }

    override fun subscribeToChannel(channelId: String, subscriptionId: String) {
        val destination = "/topic/channel.$channelId"
        webSocketManager.subscribe(destination, subscriptionId)
    }

    override fun sendMessage(channelId: String, content: String) {
        // Prepare a basic JSON payload for the SEND frame
        val payload = """{"channelId":"$channelId","content":"${content.replace("\"", "\\\"")}"}"""
        webSocketManager.sendMessage("/app/chat.send", payload)
    }

    override fun disconnectWebSocket() {
        webSocketManager.disconnect()
    }
}
