package com.peoplehub.hrms.controller;

import com.peoplehub.hrms.service.LeaveRequestService;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalControllerAdvice {

    private final LeaveRequestService leaveRequestService;

    public GlobalControllerAdvice(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @ModelAttribute("globalPendingLeavesCount")
    public long globalPendingLeavesCount() {
        return leaveRequestService.getPendingCount();
    }
}
