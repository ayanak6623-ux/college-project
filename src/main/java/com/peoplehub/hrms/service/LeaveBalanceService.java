package com.peoplehub.hrms.service;

import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.entity.LeaveBalance;
import com.peoplehub.hrms.entity.LeaveType;
import com.peoplehub.hrms.repository.LeaveBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveBalanceService {
    private final LeaveBalanceRepository balanceRepository;
    private final LeaveTypeService leaveTypeService;

    public LeaveBalanceService(LeaveBalanceRepository balanceRepository, LeaveTypeService leaveTypeService) {
        this.balanceRepository = balanceRepository;
        this.leaveTypeService = leaveTypeService;
    }

    @Transactional
    public void createBalancesForEmployee(Employee employee, int year) {
        List<LeaveType> activeTypes = leaveTypeService.getActive();
        for (LeaveType type : activeTypes) {
            // Check gender applicability
            if (type.getApplicableGender() != com.peoplehub.hrms.enums.ApplicableGender.ALL &&
                !type.getApplicableGender().name().equals(employee.getGender().name())) {
                continue;
            }
            
            balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), year)
                .orElseGet(() -> {
                    LeaveBalance b = LeaveBalance.builder()
                        .employee(employee)
                        .leaveType(type)
                        .year(year)
                        .allocated(type.getYearlyQuota())
                        .used(0)
                        .carriedForward(0)
                        .remaining(type.getYearlyQuota())
                        .build();
                    return balanceRepository.save(b);
                });
        }
    }

    public List<LeaveBalance> getBalances(Long employeeId, int year) {
        return balanceRepository.findByEmployeeIdAndYear(employeeId, year);
    }

    @Transactional
    public void deductBalance(Long employeeId, Long leaveTypeId, int year, double days) {
        LeaveBalance balance = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year)
                .orElseThrow(() -> new IllegalArgumentException("Leave balance not found"));
        
        balance.setUsed(balance.getUsed() + days);
        balance.setRemaining(balance.getAllocated() + balance.getCarriedForward() - balance.getUsed());
        balanceRepository.save(balance);
    }
}
