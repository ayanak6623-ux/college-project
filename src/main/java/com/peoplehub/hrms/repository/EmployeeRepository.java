package com.peoplehub.hrms.repository;

import com.peoplehub.hrms.entity.Employee;
import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.enums.EmploymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    @Query(value = "SELECT e FROM Employee e LEFT JOIN FETCH e.department d LEFT JOIN FETCH e.designation ds WHERE " +
           "(:departmentId IS NULL OR d.id = :departmentId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:empType IS NULL OR e.employmentType = :empType) AND " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(e) FROM Employee e LEFT JOIN e.department d WHERE " +
           "(:departmentId IS NULL OR d.id = :departmentId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:empType IS NULL OR e.employmentType = :empType) AND " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> findWithFilters(@Param("search") String search, 
                                   @Param("departmentId") Long departmentId, 
                                   @Param("status") EmployeeStatus status, 
                                   @Param("empType") EmploymentType empType, 
                                   Pageable pageable);
                                   
    @EntityGraph(attributePaths = {"department", "designation", "reportingManager"})
    Optional<Employee> findById(Long id);
    
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByEmail(String email);
    
    @Query("SELECT MAX(e.id) FROM Employee e")
    Long findMaxId();
    
    long countByDepartmentId(Long departmentId);
}
