package com.peoplehub.hrms.dto;

import lombok.Data;
import java.time.LocalTime;
import java.util.List;

@Data
public class WorkSettingsDto {
    private Long id;
    private LocalTime officeStartTime;
    private LocalTime officeEndTime;
    private int lateMarkAfterMinutes;
    private String earlyLeaveRule;
    private String halfDayRule;
    private boolean overtimeEnabled;
    private double overtimeMultiplier;
    private List<String> weeklyOffDaysList;
    private String autoAbsentRule;
}
