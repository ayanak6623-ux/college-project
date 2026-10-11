package com.peoplehub.hrms.repository;

import com.peoplehub.hrms.entity.Attendance;
import com.peoplehub.hrms.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    
    List<Attendance> findByEmployeeIdAndDateBetweenOrderByDateAsc(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    @Query(value = "SELECT a FROM Attendance a JOIN FETCH a.employee e LEFT JOIN FETCH e.department d " +
           "WHERE a.date = :date " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(a) FROM Attendance a JOIN a.employee e LEFT JOIN e.department d " +
           "WHERE a.date = :date " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Attendance> findDailyAttendanceWithFilters(@Param("date") LocalDate date,
                                                    @Param("search") String search,
                                                    @Param("departmentId") Long departmentId,
                                                    @Param("status") AttendanceStatus status,
                                                    Pageable pageable);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);
}
