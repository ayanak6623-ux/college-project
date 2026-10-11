package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.AttendanceStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class AttendanceFilterDto {
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date = LocalDate.now();
    
    private String search;
    private Long departmentId;
    private AttendanceStatus status;
}
