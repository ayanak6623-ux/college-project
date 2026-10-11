package com.peoplehub.hrms.service;

import com.peoplehub.hrms.dto.EmployeeFilterDto;
import com.peoplehub.hrms.dto.EmployeeFormDto;
import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.repository.DepartmentRepository;
import com.peoplehub.hrms.repository.DesignationRepository;
import com.peoplehub.hrms.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final FileStorageService fileStorageService;
    private final ShiftRepository shiftRepository;

    public EmployeeService(EmployeeRepository employeeRepository, 
                           DepartmentRepository departmentRepository, 
                           DesignationRepository designationRepository,
                           FileStorageService fileStorageService,
                           ShiftRepository shiftRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.fileStorageService = fileStorageService;
        this.shiftRepository = shiftRepository;
    }

    public Page<Employee> getEmployees(EmployeeFilterDto filter, Pageable pageable) {
        return employeeRepository.findWithFilters(
                filter.getSearch(), 
                filter.getDepartmentId(), 
                filter.getStatus(), 
                filter.getEmploymentType(), 
                pageable);
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public void saveEmployee(EmployeeFormDto dto) {
        Employee employee = new Employee();
        
        if (dto.getId() != null) {
            employee = getEmployeeById(dto.getId());
            if (employeeRepository.existsByEmailAndIdNot(dto.getEmail(), dto.getId())) {
                throw new IllegalArgumentException("Email already in use");
            }
        } else {
            if (employeeRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            // Generate Employee Code
            Long maxId = employeeRepository.findMaxId();
            long nextId = (maxId == null ? 0 : maxId) + 1;
            employee.setEmployeeCode(String.format("EMP-%04d", nextId));
        }

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setGender(dto.getGender());
        employee.setAddress(dto.getAddress());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setEmploymentType(dto.getEmploymentType());
        employee.setSalary(dto.getSalary());
        employee.setStatus(dto.getStatus());
        
        if (dto.getShiftId() != null) {
            employee.setShift(shiftRepository.findById(dto.getShiftId()).orElse(null));
        }

        if (dto.getDepartmentId() != null) {
            employee.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElse(null));
        }
        if (dto.getDesignationId() != null) {
            employee.setDesignation(designationRepository.findById(dto.getDesignationId()).orElse(null));
        }
        if (dto.getReportingManagerId() != null) {
            employee.setReportingManager(employeeRepository.findById(dto.getReportingManagerId()).orElse(null));
        }

        // Handle Photo Upload
        if (dto.getPhotoFile() != null && !dto.getPhotoFile().isEmpty()) {
            String photoPath = fileStorageService.storeFile(dto.getPhotoFile());
            employee.setPhotoPath(photoPath);
        } else if (dto.getExistingPhotoPath() != null && !dto.getExistingPhotoPath().isEmpty()) {
            employee.setPhotoPath(dto.getExistingPhotoPath());
        }

        employeeRepository.save(employee);
    }

    public void toggleStatus(Long id) {
        Employee employee = getEmployeeById(id);
        if (employee.getStatus() == EmployeeStatus.ACTIVE) {
            employee.setStatus(EmployeeStatus.INACTIVE);
        } else {
            employee.setStatus(EmployeeStatus.ACTIVE);
        }
        employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
