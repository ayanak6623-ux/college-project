package com.peoplehub.hrms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String landingPage() {
        return "index";
    }
    
    @GetMapping("/coming-soon")
    public String comingSoon() {
        return "coming-soon";
    }
}
