package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.ApplicableGender;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveTypeDto {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Code is required")
    private String code;
    
    private String color = "#4F46E5";
    private double yearlyQuota;
    private boolean paid;
    private boolean carryForward;
    private int maxCarryDays;
    private boolean requiresApproval;
    private ApplicableGender applicableGender = ApplicableGender.ALL;
    private String description;
    private boolean active = true;
}
