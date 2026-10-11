package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.AttendanceDto;
import com.peoplehub.hrms.dto.AttendanceFilterDto;
import com.peoplehub.hrms.enums.AttendanceStatus;
import com.peoplehub.hrms.service.AttendanceService;
import com.peoplehub.hrms.service.DepartmentService;
import com.peoplehub.hrms.service.EmployeeService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final DepartmentService departmentService;
    private final EmployeeService employeeService;

    public AttendanceController(AttendanceService attendanceService, DepartmentService departmentService, EmployeeService employeeService) {
        this.attendanceService = attendanceService;
        this.departmentService = departmentService;
        this.employeeService = employeeService;
    }

    @GetMapping("/daily")
    public String dailyAttendance(@ModelAttribute AttendanceFilterDto filter,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "15") int size,
                                  Model model) {
                                  
        Pageable pageable = PageRequest.of(page, size, Sort.by("employee.firstName").ascending());
        
        model.addAttribute("attendancePage", attendanceService.getDailyAttendance(filter, pageable));
        model.addAttribute("departments", departmentService.getAllDepartments());
        model.addAttribute("statuses", AttendanceStatus.values());
        model.addAttribute("filter", filter);
        
        model.addAttribute("presentCount", attendanceService.getCountByDateAndStatus(filter.getDate(), AttendanceStatus.PRESENT));
        model.addAttribute("absentCount", attendanceService.getCountByDateAndStatus(filter.getDate(), AttendanceStatus.ABSENT));
        model.addAttribute("lateCount", attendanceService.getCountByDateAndStatus(filter.getDate(), AttendanceStatus.LATE));
        model.addAttribute("leaveCount", attendanceService.getCountByDateAndStatus(filter.getDate(), AttendanceStatus.ON_LEAVE));
        
        return "attendance/daily";
    }

    @PostMapping("/save")
    public String saveAttendance(@ModelAttribute AttendanceDto dto, RedirectAttributes redirectAttributes, @RequestHeader(value = "referer", required = false) String referer) {
        try {
            attendanceService.saveAttendance(dto);
            redirectAttributes.addFlashAttribute("successMessage", "Attendance updated.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error updating attendance.");
        }
        return "redirect:" + (referer != null ? referer : "/attendance/daily");
    }
}
