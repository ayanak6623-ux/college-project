package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.entity.Department;
import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.repository.DepartmentRepository;
import com.peoplehub.hrms.repository.EmployeeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import com.peoplehub.hrms.service.AttendanceService;
import com.peoplehub.hrms.service.LeaveRequestService;
import com.peoplehub.hrms.enums.AttendanceStatus;
import com.peoplehub.hrms.enums.LeaveStatus;
import org.springframework.data.domain.PageRequest;

@Controller
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceService attendanceService;
    private final LeaveRequestService leaveRequestService;

    public DashboardController(EmployeeRepository employeeRepository, 
                               DepartmentRepository departmentRepository, 
                               AttendanceService attendanceService,
                               LeaveRequestService leaveRequestService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.attendanceService = attendanceService;
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"));
        model.addAttribute("todayDate", today);
        
        long totalEmployees = employeeRepository.count();
        model.addAttribute("totalEmployees", totalEmployees);
        model.addAttribute("presentToday", attendanceService.getCountByDateAndStatus(LocalDate.now(), AttendanceStatus.PRESENT) + attendanceService.getCountByDateAndStatus(LocalDate.now(), AttendanceStatus.LATE));
        model.addAttribute("onLeave", attendanceService.getCountByDateAndStatus(LocalDate.now(), AttendanceStatus.ON_LEAVE));
        model.addAttribute("pendingLeaves", leaveRequestService.getPendingCount());
        
        // Fetch recent pending leaves
        com.peoplehub.hrms.dto.LeaveRequestFilterDto lf = new com.peoplehub.hrms.dto.LeaveRequestFilterDto();
        lf.setStatus(LeaveStatus.PENDING);
        model.addAttribute("recentPendingLeaves", leaveRequestService.getRequests(lf, PageRequest.of(0, 5)).getContent());
        
        List<Employee> recentEmployees = employeeRepository.findAll(PageRequest.of(0, 5, Sort.by("joiningDate").descending())).getContent();
        model.addAttribute("recentEmployees", recentEmployees);
        
        List<Department> departments = departmentRepository.findAll();
        List<String> deptNames = new ArrayList<>();
        List<Long> deptCounts = new ArrayList<>();
        
        for (Department dept : departments) {
            deptNames.add(dept.getName());
            deptCounts.add(employeeRepository.countByDepartmentId(dept.getId()));
        }
        
        model.addAttribute("deptNames", deptNames);
        model.addAttribute("deptCounts", deptCounts);
        
        return "dashboard/index";
    }
}
