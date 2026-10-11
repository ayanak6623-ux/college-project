package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.EmployeeFilterDto;
import com.peoplehub.hrms.dto.EmployeeFormDto;
import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.enums.EmploymentType;
import com.peoplehub.hrms.enums.Gender;
import com.peoplehub.hrms.service.DepartmentService;
import com.peoplehub.hrms.service.DesignationService;
import com.peoplehub.hrms.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/employees")
public class EmployeeController {

    private final com.peoplehub.hrms.service.EmployeeService employeeService;
    private final com.peoplehub.hrms.service.DepartmentService departmentService;
    private final com.peoplehub.hrms.service.DesignationService designationService;
    private final com.peoplehub.hrms.service.ShiftService shiftService;
    private final com.peoplehub.hrms.service.AttendanceService attendanceService;
    private final com.peoplehub.hrms.service.LeaveBalanceService leaveBalanceService;

    public EmployeeController(com.peoplehub.hrms.service.EmployeeService employeeService, 
                              com.peoplehub.hrms.service.DepartmentService departmentService, 
                              com.peoplehub.hrms.service.DesignationService designationService,
                              com.peoplehub.hrms.service.ShiftService shiftService,
                              com.peoplehub.hrms.service.AttendanceService attendanceService,
                              com.peoplehub.hrms.service.LeaveBalanceService leaveBalanceService) {
        this.employeeService = employeeService;
        this.departmentService = departmentService;
        this.designationService = designationService;
        this.shiftService = shiftService;
        this.attendanceService = attendanceService;
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping
    public String list(@ModelAttribute EmployeeFilterDto filter,
                       @RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "10") int size,
                       @RequestParam(defaultValue = "firstName") String sortBy,
                       @RequestParam(defaultValue = "asc") String sortDir,
                       Model model) {
                       
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Employee> employeePage = employeeService.getEmployees(filter, pageable);
        
        model.addAttribute("employeePage", employeePage);
        model.addAttribute("departments", departmentService.getAllDesignations()); // oops, wait...
        model.addAttribute("filter", filter);
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        model.addAttribute("departments", departmentService.getAllDepartments());
        
        return "employee/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("employeeDto", new EmployeeFormDto());
        populateDropdowns(model);
        return "employee/form";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        Employee emp = employeeService.getEmployeeById(id);
        EmployeeFormDto dto = new EmployeeFormDto();
        dto.setId(emp.getId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setEmail(emp.getEmail());
        dto.setPhone(emp.getPhone());
        dto.setDateOfBirth(emp.getDateOfBirth());
        dto.setGender(emp.getGender());
        dto.setAddress(emp.getAddress());
        dto.setJoiningDate(emp.getJoiningDate());
        dto.setEmploymentType(emp.getEmploymentType());
        dto.setSalary(emp.getSalary());
        dto.setStatus(emp.getStatus());
        
        if (emp.getShift() != null) dto.setShiftId(emp.getShift().getId());
        dto.setExistingPhotoPath(emp.getPhotoPath());
        
        if (emp.getDepartment() != null) dto.setDepartmentId(emp.getDepartment().getId());
        if (emp.getDesignation() != null) dto.setDesignationId(emp.getDesignation().getId());
        if (emp.getReportingManager() != null) dto.setReportingManagerId(emp.getReportingManager().getId());
        
        model.addAttribute("employeeDto", dto);
        populateDropdowns(model);
        return "employee/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("employeeDto") EmployeeFormDto dto,
                       BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            populateDropdowns(model);
            return "employee/form";
        }
        
        try {
            employeeService.saveEmployee(dto);
            redirectAttributes.addFlashAttribute("successMessage", "Employee saved successfully!");
        } catch (IllegalArgumentException e) {
            result.rejectValue("email", "error.employee", e.getMessage());
            populateDropdowns(model);
            return "employee/form";
        }
        
        return "redirect:/employees";
    }
    
    @GetMapping("/view/{id}")
    public String viewProfile(@PathVariable Long id, Model model) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return "redirect:/employees";
        }
        model.addAttribute("employee", employee);
        
        // Add monthly attendance data
        model.addAttribute("monthlyAttendance", attendanceService.getMonthlyAttendance(id, java.time.LocalDate.now().getYear(), java.time.LocalDate.now().getMonthValue()));
        
        // Add leave balances
        model.addAttribute("leaveBalances", leaveBalanceService.getBalances(id, java.time.LocalDate.now().getYear()));
        
        return "employee/view";
    }
    
    @PostMapping("/toggle-status/{id}")
    public String toggleStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        employeeService.toggleStatus(id);
        redirectAttributes.addFlashAttribute("successMessage", "Employee status updated.");
        return "redirect:/employees";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            employeeService.deleteEmployee(id);
            redirectAttributes.addFlashAttribute("successMessage", "Employee deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Cannot delete employee. They might be a reporting manager for others.");
        }
        return "redirect:/employees";
    }

    private void populateDropdowns(Model model) {
        model.addAttribute("departments", departmentService.getAllDepartments());
        model.addAttribute("designations", designationService.getAllDesignations());
        model.addAttribute("genders", Gender.values());
        model.addAttribute("employmentTypes", EmploymentType.values());
        model.addAttribute("statuses", EmployeeStatus.values());
        model.addAttribute("shifts", shiftService.getAllShifts());
        
        // Simple unpaged list for manager dropdown (in a real app, use ajax search)
        model.addAttribute("managers", employeeService.getEmployees(new EmployeeFilterDto(), PageRequest.of(0, 1000)).getContent());
    }
}
