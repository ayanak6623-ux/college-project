package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.LeaveTypeDto;
import com.peoplehub.hrms.entity.LeaveType;
import com.peoplehub.hrms.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveTypeService {
    private final LeaveTypeRepository repository;

    public LeaveTypeService(LeaveTypeRepository repository) {
        this.repository = repository;
    }

    public List<LeaveType> getAll() {
        return repository.findAll();
    }
    
    public List<LeaveType> getActive() {
        return repository.findByActiveTrue();
    }

    public LeaveType getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public LeaveTypeDto getDtoById(Long id) {
        LeaveType lt = getById(id);
        if (lt == null) return null;
        LeaveTypeDto dto = new LeaveTypeDto();
        dto.setId(lt.getId());
        dto.setName(lt.getName());
        dto.setCode(lt.getCode());
        dto.setColor(lt.getColor());
        dto.setYearlyQuota(lt.getYearlyQuota());
        dto.setPaid(lt.isPaid());
        dto.setCarryForward(lt.isCarryForward());
        dto.setMaxCarryDays(lt.getMaxCarryDays());
        dto.setRequiresApproval(lt.isRequiresApproval());
        dto.setApplicableGender(lt.getApplicableGender());
        dto.setDescription(lt.getDescription());
        dto.setActive(lt.isActive());
        return dto;
    }

    public void save(LeaveTypeDto dto) {
        LeaveType lt = dto.getId() != null ? getById(dto.getId()) : new LeaveType();
        lt.setName(dto.getName());
        lt.setCode(dto.getCode());
        lt.setColor(dto.getColor());
        lt.setYearlyQuota(dto.getYearlyQuota());
        lt.setPaid(dto.isPaid());
        lt.setCarryForward(dto.isCarryForward());
        lt.setMaxCarryDays(dto.getMaxCarryDays());
        lt.setRequiresApproval(dto.isRequiresApproval());
        lt.setApplicableGender(dto.getApplicableGender());
        lt.setDescription(dto.getDescription());
        lt.setActive(dto.isActive());
        repository.save(lt);
    }
}
