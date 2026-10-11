package com.peoplehub.hrms.dto;

import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.enums.EmploymentType;
import com.peoplehub.hrms.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeFormDto {
    private Long id;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotNull(message = "Date of birth is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    private String address;
    
    private MultipartFile photoFile;
    private String existingPhotoPath;
    
    @NotNull(message = "Department is required")
    private Long departmentId;
    
    @NotNull(message = "Designation is required")
    private Long designationId;
    
    @NotNull(message = "Joining date is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;
    
    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;
    
    private Long reportingManagerId;
    
    private BigDecimal salary;
    
    @NotNull(message = "Status is required")
    private EmployeeStatus status = EmployeeStatus.ACTIVE;
    
    private Long shiftId;
}
