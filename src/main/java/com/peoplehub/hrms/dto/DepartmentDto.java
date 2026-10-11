package com.peoplehub.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentDto {
    private Long id;
    
    @NotBlank(message = "Department name is required")
    private String name;
    
    private String description;
}
