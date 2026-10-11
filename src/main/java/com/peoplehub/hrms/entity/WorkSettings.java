package com.peoplehub.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "work_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalTime officeStartTime;
    private LocalTime officeEndTime;
    private int lateMarkAfterMinutes;
    
    @Column(length = 500)
    private String earlyLeaveRule;
    
    @Column(length = 500)
    private String halfDayRule;
    
    private boolean overtimeEnabled;
    private double overtimeMultiplier;
    
    @Column(length = 255)
    private String weeklyOffDays;
    
    @Column(length = 500)
    private String autoAbsentRule;
}
