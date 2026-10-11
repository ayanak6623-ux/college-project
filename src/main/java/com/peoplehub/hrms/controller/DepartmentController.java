package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.DepartmentDto;
import com.peoplehub.hrms.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("departments", departmentService.getAllDepartments());
        return "department/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("departmentDto", new DepartmentDto());
        return "department/form";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("departmentDto", departmentService.getDepartmentById(id));
        return "department/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute("departmentDto") DepartmentDto departmentDto,
                       BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "department/form";
        }
        departmentService.saveDepartment(departmentDto);
        redirectAttributes.addFlashAttribute("successMessage", "Department saved successfully!");
        return "redirect:/departments";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            departmentService.deleteDepartment(id);
            redirectAttributes.addFlashAttribute("successMessage", "Department deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Cannot delete department as it is in use.");
        }
        return "redirect:/departments";
    }
}
