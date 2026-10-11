package com.peoplehub.hrms.config;

import com.peoplehub.hrms.entity.*;
import com.peoplehub.hrms.enums.AttendanceStatus;
import com.peoplehub.hrms.enums.EmployeeStatus;
import com.peoplehub.hrms.enums.EmploymentType;
import com.peoplehub.hrms.enums.Gender;
import com.peoplehub.hrms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                      PasswordEncoder passwordEncoder,
                                      DepartmentRepository departmentRepository,
                                      DesignationRepository designationRepository,
                                      EmployeeRepository employeeRepository,
                                      ShiftRepository shiftRepository,
                                      HolidayRepository holidayRepository,
                                      AttendanceRepository attendanceRepository,
                                      LeaveTypeRepository leaveTypeRepository,
                                      com.peoplehub.hrms.service.LeaveBalanceService leaveBalanceService) {
        return args -> {
            if (userRepository.findByEmail("hr@company.com").isEmpty()) {
                User hrAdmin = User.builder()
                        .name("HR Administrator")
                        .email("hr@company.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role("ROLE_HR")
                        .build();
                userRepository.save(hrAdmin);
            }
            
            if (shiftRepository.count() == 0) {
                // Seed Shifts
                Shift s1 = Shift.builder().name("General").startTime(LocalTime.of(9,0)).endTime(LocalTime.of(18,0)).graceMinutes(15).halfDayHours(4.0).fullDayHours(8.0).workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY").color("#4F46E5").build();
                Shift s2 = Shift.builder().name("Morning").startTime(LocalTime.of(6,0)).endTime(LocalTime.of(14,0)).graceMinutes(10).halfDayHours(4.0).fullDayHours(8.0).workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY").color("#10B981").build();
                Shift s3 = Shift.builder().name("Night").startTime(LocalTime.of(22,0)).endTime(LocalTime.of(6,0)).graceMinutes(15).halfDayHours(4.0).fullDayHours(8.0).workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY").color("#F59E0B").build();
                shiftRepository.saveAll(List.of(s1, s2, s3));
                
                // Seed Holidays
                Holiday h1 = Holiday.builder().name("Republic Day").date(LocalDate.of(LocalDate.now().getYear(), 1, 26)).description("National Holiday").build();
                Holiday h2 = Holiday.builder().name("Independence Day").date(LocalDate.of(LocalDate.now().getYear(), 8, 15)).description("National Holiday").build();
                Holiday h3 = Holiday.builder().name("Diwali").date(LocalDate.of(LocalDate.now().getYear(), 11, 12)).description("Festival").build();
                holidayRepository.saveAll(List.of(h1, h2, h3));
                
                // Seed Depts
                String[] depts = {"Engineering", "Human Resources", "Sales & Marketing", "Finance", "Customer Support"};
                List<Department> savedDepts = new ArrayList<>();
                for (String d : depts) {
                    Department dept = Department.builder().name(d).description(d + " Department").build();
                    savedDepts.add(departmentRepository.save(dept));
                }

                // Seed Designations
                String[] desigs = {"Software Engineer", "HR Manager", "Sales Executive", "Accountant", "Support Specialist"};
                List<Designation> savedDesigs = new ArrayList<>();
                for (String d : desigs) {
                    Designation desig = Designation.builder().name(d).description(d + " Role").build();
                    savedDesigs.add(designationRepository.save(desig));
                }

                String[] firstNames = {"John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"};
                String[] lastNames = {"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson"};
                
                Random random = new Random();
                List<Employee> allEmployees = new ArrayList<>();
                List<Shift> shifts = shiftRepository.findAll();
                
                for (int i = 0; i < 25; i++) {
                    String fn = firstNames[random.nextInt(firstNames.length)];
                    String ln = lastNames[random.nextInt(lastNames.length)];
                    Department dept = savedDepts.get(random.nextInt(savedDepts.size()));
                    Designation desig = savedDesigs.get(random.nextInt(savedDesigs.size()));
                    Shift shift = shifts.get(random.nextInt(shifts.size()));
                    
                    Employee emp = Employee.builder()
                            .employeeCode(String.format("EMP-%04d", i + 1))
                            .firstName(fn)
                            .lastName(ln)
                            .email(fn.toLowerCase() + "." + ln.toLowerCase() + i + "@company.com")
                            .phone("555-01" + String.format("%02d", i))
                            .dateOfBirth(LocalDate.of(1980 + random.nextInt(20), 1 + random.nextInt(12), 1 + random.nextInt(28)))
                            .gender(random.nextBoolean() ? Gender.MALE : Gender.FEMALE)
                            .address(100 + i + " Main St, City")
                            .department(dept)
                            .designation(desig)
                            .shift(shift)
                            .joiningDate(LocalDate.now().minusDays(random.nextInt(1000)))
                            .employmentType(EmploymentType.FULL_TIME)
                            .salary(new BigDecimal(50000 + random.nextInt(50000)))
                            .status(random.nextInt(10) > 1 ? EmployeeStatus.ACTIVE : EmployeeStatus.INACTIVE) // 80% active
                            .build();
                            
                    allEmployees.add(employeeRepository.save(emp));
                }
                
                // Seed 30 days attendance
                LocalDate today = LocalDate.now();
                for (Employee e : allEmployees) {
                    if (e.getStatus() == EmployeeStatus.INACTIVE) continue;
                    
                    for (int d = 0; d < 30; d++) {
                        LocalDate dDate = today.minusDays(d);
                        // Skip weekends for simplicity
                        if (dDate.getDayOfWeek().getValue() >= 6) continue;
                        
                        LocalTime cIn = e.getShift().getStartTime().plusMinutes(random.nextInt(30) - 10);
                        LocalTime cOut = cIn.plusHours(8).plusMinutes(random.nextInt(60));
                        
                        AttendanceStatus st = AttendanceStatus.PRESENT;
                        if (random.nextInt(100) < 5) st = AttendanceStatus.ABSENT;
                        else if (random.nextInt(100) < 10) st = AttendanceStatus.ON_LEAVE;
                        else if (random.nextInt(100) < 15) st = AttendanceStatus.LATE;
                        
                        Attendance a = Attendance.builder()
                                .employee(e)
                                .date(dDate)
                                .checkIn(st == AttendanceStatus.ABSENT || st == AttendanceStatus.ON_LEAVE ? null : cIn)
                                .checkOut(st == AttendanceStatus.ABSENT || st == AttendanceStatus.ON_LEAVE ? null : cOut)
                                .status(st)
                                .totalHours(st == AttendanceStatus.ABSENT || st == AttendanceStatus.ON_LEAVE ? 0.0 : 8.5)
                                .remarks(st == AttendanceStatus.LATE ? "Traffic" : null)
                                .build();
                        attendanceRepository.save(a);
                    }
                }
                
                // Seed Leave Types
                if (leaveTypeRepository.count() == 0) {
                    LeaveType lt1 = LeaveType.builder().name("Casual Leave").code("CL").color("#3B82F6").yearlyQuota(12).paid(true).carryForward(false).maxCarryDays(0).requiresApproval(true).applicableGender(com.peoplehub.hrms.enums.ApplicableGender.ALL).active(true).build();
                    LeaveType lt2 = LeaveType.builder().name("Sick Leave").code("SL").color("#EF4444").yearlyQuota(12).paid(true).carryForward(true).maxCarryDays(12).requiresApproval(true).applicableGender(com.peoplehub.hrms.enums.ApplicableGender.ALL).active(true).build();
                    LeaveType lt3 = LeaveType.builder().name("Maternity Leave").code("ML").color("#EC4899").yearlyQuota(90).paid(true).carryForward(false).maxCarryDays(0).requiresApproval(true).applicableGender(com.peoplehub.hrms.enums.ApplicableGender.FEMALE).active(true).build();
                    LeaveType lt4 = LeaveType.builder().name("Unpaid Leave").code("LWP").color("#6B7280").yearlyQuota(365).paid(false).carryForward(false).maxCarryDays(0).requiresApproval(true).applicableGender(com.peoplehub.hrms.enums.ApplicableGender.ALL).active(true).build();
                    leaveTypeRepository.saveAll(List.of(lt1, lt2, lt3, lt4));
                    
                    for (Employee e : allEmployees) {
                        leaveBalanceService.createBalancesForEmployee(e, LocalDate.now().getYear());
                    }
                }
            }
        };
    }
}
