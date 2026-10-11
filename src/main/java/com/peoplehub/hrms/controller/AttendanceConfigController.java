package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.dto.HolidayDto;
import com.peoplehub.hrms.dto.ShiftDto;
import com.peoplehub.hrms.dto.WorkSettingsDto;
import com.peoplehub.hrms.service.HolidayService;
import com.peoplehub.hrms.service.ShiftService;
import com.peoplehub.hrms.service.WorkSettingsService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/attendance-config")
public class AttendanceConfigController {

    private final ShiftService shiftService;
    private final WorkSettingsService workSettingsService;
    private final HolidayService holidayService;

    public AttendanceConfigController(ShiftService shiftService, WorkSettingsService workSettingsService, HolidayService holidayService) {
        this.shiftService = shiftService;
        this.workSettingsService = workSettingsService;
        this.holidayService = holidayService;
    }

    @GetMapping
    public String index(@RequestParam(defaultValue = "shifts") String tab, Model model) {
        model.addAttribute("activeTab", tab);
        model.addAttribute("shifts", shiftService.getAllShifts());
        model.addAttribute("workSettingsDto", workSettingsService.getSettingsDto());
        model.addAttribute("holidays", holidayService.getAllHolidays());
        return "attendance-config/index";
    }

    // Shift
    @GetMapping("/shift/add")
    public String addShiftForm(Model model) {
        model.addAttribute("shiftDto", new ShiftDto());
        return "attendance-config/shift-form";
    }

    @GetMapping("/shift/edit/{id}")
    public String editShiftForm(@PathVariable Long id, Model model) {
        model.addAttribute("shiftDto", shiftService.getShiftDtoById(id));
        return "attendance-config/shift-form";
    }

    @PostMapping("/shift/save")
    public String saveShift(@Valid @ModelAttribute("shiftDto") ShiftDto dto, BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "attendance-config/shift-form";
        }
        shiftService.saveShift(dto);
        redirectAttributes.addFlashAttribute("successMessage", "Shift saved successfully!");
        return "redirect:/attendance-config?tab=shifts";
    }

    @PostMapping("/shift/delete/{id}")
    public String deleteShift(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            shiftService.deleteShift(id);
            redirectAttributes.addFlashAttribute("successMessage", "Shift deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Cannot delete shift as employees are assigned to it.");
        }
        return "redirect:/attendance-config?tab=shifts";
    }

    // Work Settings
    @PostMapping("/work-settings/save")
    public String saveWorkSettings(@ModelAttribute("workSettingsDto") WorkSettingsDto dto, RedirectAttributes redirectAttributes) {
        workSettingsService.saveSettings(dto);
        redirectAttributes.addFlashAttribute("successMessage", "Work Settings updated successfully!");
        return "redirect:/attendance-config?tab=workSettings";
    }

    // Holiday
    @GetMapping("/holiday/add")
    public String addHolidayForm(Model model) {
        model.addAttribute("holidayDto", new HolidayDto());
        return "attendance-config/holiday-form";
    }

    @GetMapping("/holiday/edit/{id}")
    public String editHolidayForm(@PathVariable Long id, Model model) {
        model.addAttribute("holidayDto", holidayService.getHolidayDtoById(id));
        return "attendance-config/holiday-form";
    }

    @PostMapping("/holiday/save")
    public String saveHoliday(@Valid @ModelAttribute("holidayDto") HolidayDto dto, BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "attendance-config/holiday-form";
        }
        holidayService.saveHoliday(dto);
        redirectAttributes.addFlashAttribute("successMessage", "Holiday saved successfully!");
        return "redirect:/attendance-config?tab=holidays";
    }

    @PostMapping("/holiday/delete/{id}")
    public String deleteHoliday(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        holidayService.deleteHoliday(id);
        redirectAttributes.addFlashAttribute("successMessage", "Holiday deleted successfully!");
        return "redirect:/attendance-config?tab=holidays";
    }
}
