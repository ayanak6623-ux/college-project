package com.peoplehub.hrms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private Long id;
    
    @NotNull(message = "Employee is required")
    private Long employeeId;
    
    @NotNull(message = "Leave Type is required")
    private Long leaveTypeId;
    
    @NotNull(message = "From Date is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;
    
    @NotNull(message = "To Date is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
    
    private boolean halfDay;
    private String reason;
}
