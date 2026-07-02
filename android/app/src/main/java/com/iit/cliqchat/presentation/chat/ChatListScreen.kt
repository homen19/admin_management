package com.iit.cliqchat.presentation.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ChatListScreen(
    viewModel: ChatViewModel,
    onNavigateToChatDetail: (String) -> Unit
) {
    val channels by viewModel.channels.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadChannels()
    }

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        items(channels) { channel ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                    .clickable { onNavigateToChatDetail(channel.id) },
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = channel.name, style = MaterialTheme.typography.titleMedium)
                    if (channel.description.isNotEmpty()) {
                        Text(text = channel.description, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}
