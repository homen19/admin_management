package com.iit.cliqchat.domain.model

data class Channel(
    val id: String,
    val name: String,
    val description: String = "",
    val isDirectMessage: Boolean = false
)

data class Message(
    val id: String = "",
    val channelId: String,
    val senderUsername: String,
    val content: String,
    val timestamp: String = "",
    val isMine: Boolean = false
)
