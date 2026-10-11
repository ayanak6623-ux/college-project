package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceDto {
    private Long id;
    
    @NotNull(message = "Employee is required")
    private Long employeeId;
    
    @NotNull(message = "Date is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    private LocalTime checkIn;
    private LocalTime checkOut;
    
    @NotNull(message = "Status is required")
    private AttendanceStatus status;
    
    private String remarks;
}
