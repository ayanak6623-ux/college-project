package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.LeaveActionDto;
import com.peoplehub.hrms.dto.LeaveRequestDto;
import com.peoplehub.hrms.dto.LeaveRequestFilterDto;
import com.peoplehub.hrms.entity.*;
import com.peoplehub.hrms.enums.AttendanceStatus;
import com.peoplehub.hrms.enums.LeaveStatus;
import com.peoplehub.hrms.repository.LeaveRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveRequestService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final WorkSettingsService workSettingsService;
    private final HolidayService holidayService;
    private final EmployeeService employeeService;
    private final LeaveTypeService leaveTypeService;
    private final AttendanceService attendanceService;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               LeaveBalanceService leaveBalanceService,
                               WorkSettingsService workSettingsService,
                               HolidayService holidayService,
                               EmployeeService employeeService,
                               LeaveTypeService leaveTypeService,
                               AttendanceService attendanceService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.workSettingsService = workSettingsService;
        this.holidayService = holidayService;
        this.employeeService = employeeService;
        this.leaveTypeService = leaveTypeService;
        this.attendanceService = attendanceService;
    }

    public Page<LeaveRequest> getRequests(LeaveRequestFilterDto filter, Pageable pageable) {
        return leaveRequestRepository.findWithFilters(
                filter.getStatus(),
                filter.getDepartmentId(),
                filter.getLeaveTypeId(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getSearch(),
                pageable
        );
    }
    
    public List<LeaveRequest> getApprovedLeavesBetween(LocalDate start, LocalDate end) {
        return leaveRequestRepository.findApprovedLeavesBetween(start, end);
    }

    public double calculateTotalDays(LocalDate from, LocalDate to, boolean halfDay) {
        if (halfDay) return 0.5;
        
        WorkSettings settings = workSettingsService.getSettings();
        List<Holiday> holidays = holidayService.getHolidaysBetween(from, to);
        
        double days = 0;
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            final LocalDate d = date;
            boolean isHoliday = holidays.stream().anyMatch(h -> h.getDate().equals(d));
            boolean isWeeklyOff = settings.getWeeklyOffDays() != null && settings.getWeeklyOffDays().contains(d.getDayOfWeek().name());
            
            if (!isHoliday && !isWeeklyOff) {
                days += 1.0;
            }
        }
        return days;
    }

    @Transactional
    public void saveLeaveRequest(LeaveRequestDto dto) {
        if (dto.getFromDate().isAfter(dto.getToDate())) {
            throw new IllegalArgumentException("From Date must be before or equal to To Date");
        }

        Employee emp = employeeService.getEmployeeById(dto.getEmployeeId());
        LeaveType type = leaveTypeService.getById(dto.getLeaveTypeId());
        
        if (type.getApplicableGender() != com.peoplehub.hrms.enums.ApplicableGender.ALL &&
            !type.getApplicableGender().name().equals(emp.getGender().name())) {
            throw new IllegalArgumentException("This leave type is not applicable for this employee's gender.");
        }

        if (leaveRequestRepository.existsOverlappingLeave(emp.getId(), dto.getFromDate(), dto.getToDate())) {
            throw new IllegalArgumentException("Leave request overlaps with an existing request.");
        }

        double totalDays = calculateTotalDays(dto.getFromDate(), dto.getToDate(), dto.isHalfDay());
        if (totalDays <= 0) {
            throw new IllegalArgumentException("Selected date range only contains holidays or weekly off days.");
        }
        
        // Ensure balance exists
        leaveBalanceService.createBalancesForEmployee(emp, dto.getFromDate().getYear());
        
        // Check balance if paid
        if (type.isPaid()) {
            double remaining = leaveBalanceService.getBalances(emp.getId(), dto.getFromDate().getYear())
                .stream()
                .filter(b -> b.getLeaveType().getId().equals(type.getId()))
                .mapToDouble(LeaveBalance::getRemaining)
                .findFirst().orElse(0.0);
                
            if (remaining < totalDays) {
                throw new IllegalArgumentException("Insufficient leave balance.");
            }
        }

        LeaveRequest lr = LeaveRequest.builder()
                .employee(emp)
                .leaveType(type)
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .halfDay(dto.isHalfDay())
                .totalDays(totalDays)
                .reason(dto.getReason())
                .status(type.isRequiresApproval() ? LeaveStatus.PENDING : LeaveStatus.APPROVED)
                .build();
                
        leaveRequestRepository.save(lr);
        
        if (!type.isRequiresApproval()) {
            applyLeaveEffects(lr);
        }
    }

    @Transactional
    public void reviewLeaveRequest(LeaveActionDto actionDto) {
        LeaveRequest lr = leaveRequestRepository.findById(actionDto.getLeaveRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));
                
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave request is already processed.");
        }
        
        lr.setReviewComment(actionDto.getReviewComment());
        lr.setReviewedAt(LocalDateTime.now());
        
        if ("APPROVE".equalsIgnoreCase(actionDto.getAction())) {
            lr.setStatus(LeaveStatus.APPROVED);
            applyLeaveEffects(lr);
        } else {
            lr.setStatus(LeaveStatus.REJECTED);
        }
        
        leaveRequestRepository.save(lr);
    }
    
    private void applyLeaveEffects(LeaveRequest lr) {
        if (lr.getLeaveType().isPaid()) {
            leaveBalanceService.deductBalance(lr.getEmployee().getId(), lr.getLeaveType().getId(), lr.getFromDate().getYear(), lr.getTotalDays());
        }
        
        // Mark attendance as ON_LEAVE
        WorkSettings settings = workSettingsService.getSettings();
        List<Holiday> holidays = holidayService.getHolidaysBetween(lr.getFromDate(), lr.getToDate());
        
        for (LocalDate date = lr.getFromDate(); !date.isAfter(lr.getToDate()); date = date.plusDays(1)) {
            final LocalDate d = date;
            boolean isHoliday = holidays.stream().anyMatch(h -> h.getDate().equals(d));
            boolean isWeeklyOff = settings.getWeeklyOffDays() != null && settings.getWeeklyOffDays().contains(d.getDayOfWeek().name());
            
            if (!isHoliday && !isWeeklyOff) {
                com.peoplehub.hrms.dto.AttendanceDto attDto = new com.peoplehub.hrms.dto.AttendanceDto();
                attDto.setEmployeeId(lr.getEmployee().getId());
                attDto.setDate(date);
                attDto.setStatus(lr.isHalfDay() ? AttendanceStatus.HALF_DAY : AttendanceStatus.ON_LEAVE);
                attDto.setRemarks("Approved Leave: " + lr.getLeaveType().getName());
                attendanceService.saveAttendance(attDto);
            }
        }
    }
    
    public long getPendingCount() {
        return leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
    }
}
