package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.ShiftDto;
import com.peoplehub.hrms.entity.Shift;
import com.peoplehub.hrms.repository.EmployeeRepository;
import com.peoplehub.hrms.repository.ShiftRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShiftService {
    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    public ShiftService(ShiftRepository shiftRepository, EmployeeRepository employeeRepository) {
        this.shiftRepository = shiftRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public Shift getShiftById(Long id) {
        return shiftRepository.findById(id).orElse(null);
    }

    public ShiftDto getShiftDtoById(Long id) {
        Shift s = getShiftById(id);
        if (s == null) return null;
        ShiftDto dto = new ShiftDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setBreakMinutes(s.getBreakMinutes());
        dto.setGraceMinutes(s.getGraceMinutes());
        dto.setHalfDayHours(s.getHalfDayHours());
        dto.setFullDayHours(s.getFullDayHours());
        dto.setColor(s.getColor());
        if (s.getWorkingDays() != null && !s.getWorkingDays().isEmpty()) {
            dto.setWorkingDaysList(Arrays.asList(s.getWorkingDays().split(",")));
        }
        return dto;
    }

    public void saveShift(ShiftDto dto) {
        Shift shift = new Shift();
        if (dto.getId() != null) {
            shift = getShiftById(dto.getId());
        }
        shift.setName(dto.getName());
        shift.setStartTime(dto.getStartTime());
        shift.setEndTime(dto.getEndTime());
        shift.setBreakMinutes(dto.getBreakMinutes());
        shift.setGraceMinutes(dto.getGraceMinutes());
        shift.setHalfDayHours(dto.getHalfDayHours());
        shift.setFullDayHours(dto.getFullDayHours());
        shift.setColor(dto.getColor());
        if (dto.getWorkingDaysList() != null) {
            shift.setWorkingDays(String.join(",", dto.getWorkingDaysList()));
        }
        shiftRepository.save(shift);
    }

    public void deleteShift(Long id) {
        shiftRepository.deleteById(id);
    }
}
