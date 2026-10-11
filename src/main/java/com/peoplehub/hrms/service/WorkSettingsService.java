package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.WorkSettingsDto;
import com.peoplehub.hrms.entity.WorkSettings;
import com.peoplehub.hrms.repository.WorkSettingsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
public class WorkSettingsService {
    private final WorkSettingsRepository workSettingsRepository;

    public WorkSettingsService(WorkSettingsRepository workSettingsRepository) {
        this.workSettingsRepository = workSettingsRepository;
    }

    public WorkSettings getSettings() {
        List<WorkSettings> list = workSettingsRepository.findAll();
        if (list.isEmpty()) {
            // seed default
            WorkSettings s = WorkSettings.builder()
                .officeStartTime(LocalTime.of(9, 0))
                .officeEndTime(LocalTime.of(18, 0))
                .lateMarkAfterMinutes(15)
                .overtimeEnabled(true)
                .overtimeMultiplier(1.5)
                .weeklyOffDays("SATURDAY,SUNDAY")
                .build();
            return workSettingsRepository.save(s);
        }
        return list.get(0);
    }

    public WorkSettingsDto getSettingsDto() {
        WorkSettings s = getSettings();
        WorkSettingsDto dto = new WorkSettingsDto();
        dto.setId(s.getId());
        dto.setOfficeStartTime(s.getOfficeStartTime());
        dto.setOfficeEndTime(s.getOfficeEndTime());
        dto.setLateMarkAfterMinutes(s.getLateMarkAfterMinutes());
        dto.setEarlyLeaveRule(s.getEarlyLeaveRule());
        dto.setHalfDayRule(s.getHalfDayRule());
        dto.setOvertimeEnabled(s.isOvertimeEnabled());
        dto.setOvertimeMultiplier(s.getOvertimeMultiplier());
        dto.setAutoAbsentRule(s.getAutoAbsentRule());
        if (s.getWeeklyOffDays() != null && !s.getWeeklyOffDays().isEmpty()) {
            dto.setWeeklyOffDaysList(Arrays.asList(s.getWeeklyOffDays().split(",")));
        }
        return dto;
    }

    public void saveSettings(WorkSettingsDto dto) {
        WorkSettings s = getSettings();
        s.setOfficeStartTime(dto.getOfficeStartTime());
        s.setOfficeEndTime(dto.getOfficeEndTime());
        s.setLateMarkAfterMinutes(dto.getLateMarkAfterMinutes());
        s.setEarlyLeaveRule(dto.getEarlyLeaveRule());
        s.setHalfDayRule(dto.getHalfDayRule());
        s.setOvertimeEnabled(dto.isOvertimeEnabled());
        s.setOvertimeMultiplier(dto.getOvertimeMultiplier());
        s.setAutoAbsentRule(dto.getAutoAbsentRule());
        if (dto.getWeeklyOffDaysList() != null) {
            s.setWeeklyOffDays(String.join(",", dto.getWeeklyOffDaysList()));
        }
        workSettingsRepository.save(s);
    }
}
