package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.DepartmentDto;
import com.peoplehub.hrms.entity.Department;
import com.peoplehub.hrms.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public DepartmentDto getDepartmentById(Long id) {
        return departmentRepository.findById(id).map(this::mapToDto).orElse(null);
    }

    public void saveDepartment(DepartmentDto dto) {
        Department dept = new Department();
        if (dto.getId() != null) {
            dept = departmentRepository.findById(dto.getId()).orElse(new Department());
        }
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        departmentRepository.save(dept);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentDto mapToDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setDescription(dept.getDescription());
        return dto;
    }
}
