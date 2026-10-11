package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.LeaveStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class LeaveRequestFilterDto {
    private String search;
    private Long departmentId;
    private Long leaveTypeId;
    private LeaveStatus status;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
}
