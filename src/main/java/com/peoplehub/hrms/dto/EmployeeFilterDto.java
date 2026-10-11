package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.enums.EmploymentType;
import lombok.Data;

@Data
public class EmployeeFilterDto {
    private String search;
    private Long departmentId;
    private EmployeeStatus status;
    private EmploymentType employmentType;
}
