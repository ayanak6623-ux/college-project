package com.peoplehub.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DesignationDto {
    private Long id;
    
    @NotBlank(message = "Designation name is required")
    private String name;
    
    private String description;
}
