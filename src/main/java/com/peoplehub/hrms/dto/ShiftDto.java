package com.peoplehub.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;
import java.util.List;

@Data
public class ShiftDto {
    private Long id;
    
    @NotBlank(message = "Shift name is required")
    private String name;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private int breakMinutes;
    private int graceMinutes;
    private double halfDayHours;
    private double fullDayHours;
    
    private List<String> workingDaysList;
    
    private String color = "#4F46E5";
}
