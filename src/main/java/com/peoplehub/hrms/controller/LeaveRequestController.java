package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.EmployeeFilterDto;
import com.peoplehub.hrms.dto.LeaveActionDto;
import com.peoplehub.hrms.dto.LeaveRequestDto;
import com.peoplehub.hrms.dto.LeaveRequestFilterDto;
import com.peoplehub.hrms.enums.LeaveStatus;
import com.peoplehub.hrms.service.DepartmentService;
import com.peoplehub.hrms.service.EmployeeService;
import com.peoplehub.hrms.service.LeaveRequestService;
import com.peoplehub.hrms.service.LeaveTypeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.time.LocalDate;

@Controller
@RequestMapping("/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveTypeService leaveTypeService;
    private final EmployeeService employeeService;
    private final DepartmentService departmentService;

    public LeaveRequestController(LeaveRequestService leaveRequestService, LeaveTypeService leaveTypeService, EmployeeService employeeService, DepartmentService departmentService) {
        this.leaveRequestService = leaveRequestService;
        this.leaveTypeService = leaveTypeService;
        this.employeeService = employeeService;
        this.departmentService = departmentService;
    }

    @GetMapping
    public String index(@ModelAttribute LeaveRequestFilterDto filter,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "15") int size,
                        Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        model.addAttribute("leavePage", leaveRequestService.getRequests(filter, pageable));
        model.addAttribute("leaveTypes", leaveTypeService.getActive());
        model.addAttribute("departments", departmentService.getAllDepartments());
        model.addAttribute("filter", filter);
        model.addAttribute("statuses", LeaveStatus.values());
        
        return "leave/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("leaveRequestDto", new LeaveRequestDto());
        model.addAttribute("leaveTypes", leaveTypeService.getActive());
        model.addAttribute("employees", employeeService.getEmployees(new EmployeeFilterDto(), PageRequest.of(0, 1000)).getContent());
        return "leave/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("leaveRequestDto") LeaveRequestDto dto, BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("leaveTypes", leaveTypeService.getActive());
            model.addAttribute("employees", employeeService.getEmployees(new EmployeeFilterDto(), PageRequest.of(0, 1000)).getContent());
            return "leave/form";
        }
        
        try {
            leaveRequestService.saveLeaveRequest(dto);
            redirectAttributes.addFlashAttribute("successMessage", "Leave request submitted successfully.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/leaves/add";
        }
        return "redirect:/leaves";
    }

    @PostMapping("/action")
    public String reviewAction(@ModelAttribute LeaveActionDto dto, RedirectAttributes redirectAttributes, @RequestHeader(value = "referer", required = false) String referer) {
        try {
            leaveRequestService.reviewLeaveRequest(dto);
            redirectAttributes.addFlashAttribute("successMessage", "Leave request " + dto.getAction().toLowerCase() + "d successfully.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:" + (referer != null ? referer : "/leaves");
    }
    
    @GetMapping("/calendar")
    public String calendar(Model model) {
        // We will just pass approved leaves for current and next month to render in UI
        LocalDate start = LocalDate.now().withDayOfMonth(1).minusDays(7);
        LocalDate end = start.plusMonths(2).withDayOfMonth(1).plusDays(7);
        model.addAttribute("approvedLeaves", leaveRequestService.getApprovedLeavesBetween(start, end));
        return "leave/calendar";
    }
}
