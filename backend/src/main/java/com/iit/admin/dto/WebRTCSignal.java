package com.iit.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebRTCSignal {
    private Long channelId;
    private String senderUsername;
    private String type; // e.g., 'offer', 'answer', 'ice-candidate', 'end-call'
    private Object data; // Can hold SDP or ICE candidate payloads dynamically
}
