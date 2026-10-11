package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.AttendanceDto;
import com.peoplehub.hrms.dto.AttendanceFilterDto;
import com.peoplehub.hrms.entity.Attendance;
import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.entity.Shift;
import com.peoplehub.hrms.enums.AttendanceStatus;
import com.peoplehub.hrms.repository.AttendanceRepository;
import com.peoplehub.hrms.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public Page<Attendance> getDailyAttendance(AttendanceFilterDto filter, Pageable pageable) {
        return attendanceRepository.findDailyAttendanceWithFilters(
            filter.getDate(), 
            filter.getSearch(), 
            filter.getDepartmentId(), 
            filter.getStatus(), 
            pageable
        );
    }
    
    public AttendanceDto getAttendanceDto(Long id) {
        return attendanceRepository.findById(id).map(a -> {
            AttendanceDto dto = new AttendanceDto();
            dto.setId(a.getId());
            dto.setEmployeeId(a.getEmployee().getId());
            dto.setDate(a.getDate());
            dto.setCheckIn(a.getCheckIn());
            dto.setCheckOut(a.getCheckOut());
            dto.setStatus(a.getStatus());
            dto.setRemarks(a.getRemarks());
            return dto;
        }).orElse(null);
    }

    public void saveAttendance(AttendanceDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid employee"));
                
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(dto.getEmployeeId(), dto.getDate())
                .orElse(new Attendance());
                
        attendance.setEmployee(employee);
        attendance.setDate(dto.getDate());
        attendance.setCheckIn(dto.getCheckIn());
        attendance.setCheckOut(dto.getCheckOut());
        attendance.setRemarks(dto.getRemarks());
        
        // Custom or auto status
        if (dto.getStatus() != null) {
            attendance.setStatus(dto.getStatus());
        } else {
            attendance.setStatus(calculateStatus(dto.getCheckIn(), dto.getCheckOut(), employee.getShift()));
        }
        
        // Calculate total hours
        if (dto.getCheckIn() != null && dto.getCheckOut() != null) {
            long minutes = Duration.between(dto.getCheckIn(), dto.getCheckOut()).toMinutes();
            // Handle overnight
            if (minutes < 0) {
                minutes += 24 * 60;
            }
            attendance.setTotalHours(minutes / 60.0);
        } else {
            attendance.setTotalHours(0.0);
        }

        attendanceRepository.save(attendance);
    }
    
    private AttendanceStatus calculateStatus(LocalTime checkIn, LocalTime checkOut, Shift shift) {
        if (checkIn == null) return AttendanceStatus.ABSENT;
        if (shift == null) return AttendanceStatus.PRESENT;
        
        // Simplified check
        LocalTime shiftStart = shift.getStartTime();
        int grace = shift.getGraceMinutes();
        
        if (checkIn.isAfter(shiftStart.plusMinutes(grace))) {
            return AttendanceStatus.LATE;
        }
        
        if (checkOut != null) {
            long workedMinutes = Duration.between(checkIn, checkOut).toMinutes();
            if (workedMinutes < 0) workedMinutes += 24 * 60;
            
            if (workedMinutes < (shift.getHalfDayHours() * 60)) {
                return AttendanceStatus.HALF_DAY;
            }
        }
        
        return AttendanceStatus.PRESENT;
    }
    
    public List<Attendance> getMonthlyAttendance(Long employeeId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return attendanceRepository.findByEmployeeIdAndDateBetweenOrderByDateAsc(employeeId, start, end);
    }
    
    public long getCountByDateAndStatus(LocalDate date, AttendanceStatus status) {
        return attendanceRepository.countByDateAndStatus(date, status);
    }
}
