package com.iit.cliqchat.data.remote.dto

data class ChannelDto(
    val id: String,
    val name: String,
    val description: String?,
    val type: String?,
    val isDirectMessage: Boolean?
)

data class MessageDto(
    val id: String?,
    val channelId: String,
    val senderId: String?,
    val senderUsername: String,
    val content: String,
    val timestamp: String?
)
