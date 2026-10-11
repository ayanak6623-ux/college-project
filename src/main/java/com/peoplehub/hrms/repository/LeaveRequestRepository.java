package com.peoplehub.hrms.repository;

import com.peoplehub.hrms.entity.LeaveRequest;
import com.peoplehub.hrms.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee e JOIN FETCH lr.leaveType lt LEFT JOIN FETCH e.department d " +
           "WHERE (:status IS NULL OR lr.status = :status) " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:leaveTypeId IS NULL OR lt.id = :leaveTypeId) " +
           "AND (cast(:fromDate as date) IS NULL OR lr.fromDate >= :fromDate) " +
           "AND (cast(:toDate as date) IS NULL OR lr.toDate <= :toDate) " +
           "AND (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LeaveRequest> findWithFilters(@Param("status") LeaveStatus status,
                                       @Param("departmentId") Long departmentId,
                                       @Param("leaveTypeId") Long leaveTypeId,
                                       @Param("fromDate") LocalDate fromDate,
                                       @Param("toDate") LocalDate toDate,
                                       @Param("search") String search,
                                       Pageable pageable);

    @Query("SELECT COUNT(lr) > 0 FROM LeaveRequest lr WHERE lr.employee.id = :employeeId " +
           "AND lr.status != 'REJECTED' " +
           "AND ((lr.fromDate <= :toDate AND lr.toDate >= :fromDate))")
    boolean existsOverlappingLeave(@Param("employeeId") Long employeeId, 
                                   @Param("fromDate") LocalDate fromDate, 
                                   @Param("toDate") LocalDate toDate);

    List<LeaveRequest> findByEmployeeIdOrderByFromDateDesc(Long employeeId);

    @Query("SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee e JOIN FETCH lr.leaveType lt " +
           "WHERE lr.status = 'APPROVED' AND lr.fromDate <= :end AND lr.toDate >= :start")
    List<LeaveRequest> findApprovedLeavesBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    long countByStatus(LeaveStatus status);
}
