package com.iit.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class StatsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long pendingLeaves;
    private long openComplaints;
    private long recentNoticesCount;
    private List<ActivityLogDTO> recentLogs;
}
