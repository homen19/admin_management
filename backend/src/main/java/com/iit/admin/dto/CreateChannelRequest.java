package com.iit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChannelRequest {

    @NotBlank(message = "Channel name is required")
    private String name;

    private String description;

    private String type = "GROUP"; // GROUP or BROADCAST

    private List<Long> participantUserIds;
}
