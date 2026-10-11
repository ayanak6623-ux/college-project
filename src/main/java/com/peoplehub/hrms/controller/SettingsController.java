package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.entity.User;
import com.peoplehub.hrms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/settings")
public class SettingsController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public String index(Model model, Authentication authentication, @RequestParam(value="tab", defaultValue="profile") String tab) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        model.addAttribute("user", user);
        model.addAttribute("activeTab", tab);
        return "settings/index";
    }

    @PostMapping("/profile")
    public String updateProfile(@RequestParam String name, 
                                Authentication authentication, 
                                RedirectAttributes redirectAttributes) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user != null) {
            user.setName(name);
            userRepository.save(user);
            redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully.");
        }
        return "redirect:/settings?tab=profile";
    }

    @PostMapping("/password")
    public String changePassword(@RequestParam String oldPassword, 
                                 @RequestParam String newPassword, 
                                 Authentication authentication, 
                                 RedirectAttributes redirectAttributes) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            redirectAttributes.addFlashAttribute("successMessage", "Password updated successfully.");
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect old password.");
        }
        return "redirect:/settings?tab=security";
    }
}
