package com.peoplehub.hrms.entity;

import com.peoplehub.hrms.enums.ApplicableGender;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    private String color;
    
    private double yearlyQuota;
    private boolean paid;
    private boolean carryForward;
    private int maxCarryDays;
    private boolean requiresApproval;
    
    @Enumerated(EnumType.STRING)
    private ApplicableGender applicableGender;
    
    @Column(length = 500)
    private String description;
    
    private boolean active;
}
