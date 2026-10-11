package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.LeaveTypeDto;
import com.peoplehub.hrms.enums.ApplicableGender;
import com.peoplehub.hrms.service.LeaveTypeService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/leave-types")
public class LeaveTypeController {
    
    private final LeaveTypeService leaveTypeService;

    public LeaveTypeController(LeaveTypeService leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }

    @GetMapping
    public String index(Model model) {
        model.addAttribute("leaveTypes", leaveTypeService.getAll());
        return "leave-type/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("leaveTypeDto", new LeaveTypeDto());
        model.addAttribute("genders", ApplicableGender.values());
        return "leave-type/form";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("leaveTypeDto", leaveTypeService.getDtoById(id));
        model.addAttribute("genders", ApplicableGender.values());
        return "leave-type/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("leaveTypeDto") LeaveTypeDto dto, BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("genders", ApplicableGender.values());
            return "leave-type/form";
        }
        leaveTypeService.save(dto);
        redirectAttributes.addFlashAttribute("successMessage", "Leave Type saved successfully!");
        return "redirect:/leave-types";
    }
}
