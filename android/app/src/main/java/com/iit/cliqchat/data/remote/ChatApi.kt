package com.iit.cliqchat.data.remote

import com.iit.cliqchat.data.remote.dto.ChannelDto
import com.iit.cliqchat.data.remote.dto.MessageDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface ChatApi {
    @GET("/api/chat/channels")
    suspend fun getChannels(): List<ChannelDto>

    @GET("/api/chat/messages/{channelId}")
    suspend fun getMessages(
        @Path("channelId") channelId: String,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 50
    ): List<MessageDto>
}
