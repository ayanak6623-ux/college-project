package com.peoplehub.hrms.dto;

import lombok.Data;

@Data
public class LeaveActionDto {
    private Long leaveRequestId;
    private String action; // APPROVE or REJECT
    private String reviewComment;
}
