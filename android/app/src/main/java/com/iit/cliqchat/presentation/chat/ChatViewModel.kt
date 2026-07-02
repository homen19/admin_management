package com.iit.cliqchat.presentation.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.iit.cliqchat.domain.model.Channel
import com.iit.cliqchat.domain.model.Message
import com.iit.cliqchat.domain.usecase.chat.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val getChannelsUseCase: GetChannelsUseCase,
    private val getMessagesUseCase: GetMessagesUseCase,
    private val sendMessageUseCase: SendMessageUseCase,
    private val connectWebSocketUseCase: ConnectChatWebSocketUseCase,
    private val subscribeToChannelUseCase: SubscribeToChannelUseCase,
    private val disconnectWebSocketUseCase: DisconnectChatWebSocketUseCase
) : ViewModel() {

    private val _channels = MutableStateFlow<List<Channel>>(emptyList())
    val channels: StateFlow<List<Channel>> = _channels.asStateFlow()

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private var currentChannelId: String? = null

    fun loadChannels() {
        viewModelScope.launch {
            _isLoading.value = true
            getChannelsUseCase().onSuccess { result ->
                _channels.value = result
            }.onFailure {
                // handle error
            }
            _isLoading.value = false
        }
    }

    fun loadMessages(channelId: String) {
        currentChannelId = channelId
        viewModelScope.launch {
            _isLoading.value = true
            getMessagesUseCase(channelId).onSuccess { result ->
                _messages.value = result
            }
            _isLoading.value = false
        }
    }

    fun connectWebSocket(token: String) {
        connectWebSocketUseCase(token) { messageJson ->
            try {
                val json = JSONObject(messageJson)
                val msg = Message(
                    id = json.optString("id", ""),
                    channelId = json.optString("channelId", ""),
                    senderUsername = json.optString("senderUsername", ""),
                    content = json.optString("content", ""),
                    timestamp = json.optString("timestamp", "")
                )
                if (msg.channelId == currentChannelId) {
                    _messages.value = _messages.value + msg
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    fun subscribeToCurrentChannel() {
        currentChannelId?.let {
            subscribeToChannelUseCase(it, "sub-$it")
        }
    }

    fun sendMessage(content: String) {
        currentChannelId?.let {
            sendMessageUseCase(it, content)
        }
    }

    override fun onCleared() {
        super.onCleared()
        disconnectWebSocketUseCase()
    }
}
