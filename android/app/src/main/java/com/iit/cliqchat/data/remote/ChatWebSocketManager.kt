package com.iit.cliqchat.data.remote

import android.util.Log
import okhttp3.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatWebSocketManager @Inject constructor(
    private val client: OkHttpClient
) {
    private var webSocket: WebSocket? = null
    private val listeners = mutableListOf<(String) -> Unit>()
    
    fun connect(token: String, onMessage: (String) -> Unit) {
        if (!listeners.contains(onMessage)) {
            listeners.add(onMessage)
        }
        if (webSocket != null) return
        
        val request = Request.Builder()
            .url("ws://10.0.2.2:8082/api/chat/websocket") // Standard Spring Boot WebSocket without SockJS
            .build()
            
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                // Send STOMP CONNECT frame
                val connectFrame = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\nAuthorization:Bearer $token\n\n\u0000"
                webSocket.send(connectFrame)
                Log.d("ChatWebSocket", "Connected")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d("ChatWebSocket", "Received: $text")
                if (text.startsWith("MESSAGE")) {
                    val body = text.substringAfter("\n\n").substringBefore("\u0000")
                    listeners.forEach { it(body) }
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("ChatWebSocket", "Error: ${t.message}")
                webSocket = null
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("ChatWebSocket", "Closed: $reason")
                this@ChatWebSocketManager.webSocket = null
            }
        })
    }
    
    fun subscribe(destination: String, id: String) {
        val subscribeFrame = "SUBSCRIBE\nid:$id\ndestination:$destination\n\n\u0000"
        webSocket?.send(subscribeFrame)
    }

    fun sendMessage(destination: String, body: String) {
        val sendFrame = "SEND\ndestination:$destination\ncontent-length:${body.toByteArray().size}\n\n$body\u0000"
        webSocket?.send(sendFrame)
    }

    fun disconnect() {
        val disconnectFrame = "DISCONNECT\n\n\u0000"
        webSocket?.send(disconnectFrame)
        webSocket?.close(1000, "User disconnected")
        webSocket = null
        listeners.clear()
    }
}
