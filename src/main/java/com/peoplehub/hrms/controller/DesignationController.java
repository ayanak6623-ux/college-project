package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.DesignationDto;
import com.peoplehub.hrms.service.DesignationService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/designations")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("designations", designationService.getAllDesignations());
        return "designation/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("designationDto", new DesignationDto());
        return "designation/form";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("designationDto", designationService.getDesignationById(id));
        return "designation/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("designationDto") DesignationDto designationDto,
                       BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "designation/form";
        }
        designationService.saveDesignation(designationDto);
        redirectAttributes.addFlashAttribute("successMessage", "Designation saved successfully!");
        return "redirect:/designations";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            designationService.deleteDesignation(id);
            redirectAttributes.addFlashAttribute("successMessage", "Designation deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Cannot delete designation as it is in use.");
        }
        return "redirect:/designations";
    }
}
