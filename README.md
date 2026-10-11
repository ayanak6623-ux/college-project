# PeopleHub HRMS

PeopleHub HRMS is a modern, full-stack Spring Boot web application designed for comprehensive HR management. It features a premium, glassmorphism-inspired UI built with Bootstrap 5.3, vanilla JS, and Thymeleaf.

## Features Completed
1. **Employee Management**
   - Full CRUD operations with detailed profiles, photo upload simulation, and department/designation assignments.
   - Smart DTOs, strict `@Valid` validation, and PRG (Post-Redirect-Get) with toast notifications.
2. **Attendance Configuration & Daily Logs**
   - **Shifts**: Configurable working days, start/end times, and grace periods (including overnight shifts).
   - **Holidays**: Calendar-view management.
   - **Daily Attendance**: Track check-ins, check-outs, auto-calculating `PRESENT`, `LATE`, or `HALF_DAY` based on shift rules. Includes manual HR overrides.
3. **Leave Management**
   - **Leave Types**: Configurable quotas, paid/unpaid status, carry-forward logic, and gender restrictions.
   - **Leave Balances**: Auto-tracking of used, allocated, and remaining days.
   - **Leave Requests**: HR application, modal approvals/rejections.
   - **Integration**: Approved leaves automatically flag daily attendance as `ON_LEAVE` exclusively for working days.
4. **Dashboard & Settings**
   - Live metrics (Total Employees, Present Today, On Leave, Pending Leaves).
   - Dynamic charts using Chart.js.
   - Password reset and profile settings.

## Entity-Relationship (ER) Diagram Explanation

The system is fully relational and mapped using JPA/Hibernate:
- **`departments` & `designations`**: Core lookup tables.
- **`shifts` & `work_settings` & `holidays`**: Attendance configuration tables.
- **`employees`**: Central entity. Links `ManyToOne` to `departments`, `designations`, and `shifts`. Contains self-referencing `reporting_manager_id`.
- **`attendance`**: Daily log. Unique constraint on `(employee_id, date)`. Flags `PRESENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`, or `ABSENT`.
- **`leave_types`**: Configurable types (e.g., Sick, Casual).
- **`leave_balances`**: Tracks available quota per employee per leave type per year. Unique on `(employee_id, leave_type_id, year)`.
- **`leave_requests`**: Connects `employees` to `leave_types` with date ranges. Modifies `leave_balances` and `attendance` upon approval.

## Setup & Running

### Requirements
- Java 17
- Maven 3.8+

### Profiles (H2 vs MySQL)
The application defaults to an H2 in-memory database using `spring.profiles.active=dev` in `application.properties`. This allows immediate running with zero setup.
To switch to MySQL:
1. Ensure MySQL is running on port `3306`.
2. Change `spring.profiles.active=prod`.
3. Configure `application-prod.properties` with your MySQL credentials.

### Running the App
Run the following Maven command:
```bash
mvn spring-boot:run
```
Access the application at: `http://localhost:8080`

### Demo Credentials
A `DataSeeder` automatically generates all testing data on startup.
- **Email**: `hr@company.com`
- **Password**: `admin123`

## Screenshots Checklist
- [ ] Login screen (Premium gradient + glass card)
- [ ] Dashboard (Metrics + Chart.js + Pending Leaves)
- [ ] Employee List & Profile View (Tabs for Job, Attendance, Leaves)
- [ ] Attendance Config (Tabs: Shifts, Settings, Holiday Calendar)
- [ ] Daily Attendance (Status badges, HR edit modal)
- [ ] Leave Requests (Tabs, Filters, Modal Approval, Leave Calendar)

## Common Errors & Fixes
- **`LazyInitializationException`**: Occurs when accessing lazy associations (like `employee.department.name`) outside an active session (e.g., in a Thymeleaf view). 
  - *Fix*: The repository uses `@Query` with `JOIN FETCH` (e.g., `SELECT lr FROM LeaveRequest lr JOIN FETCH lr.employee e JOIN FETCH lr.leaveType`) to eagerly load required data in a single query.
- **`StackOverflowError` with Lombok**: Using `@Data` on JPA entities causes infinite loops in `hashCode()`/`toString()` due to bidirectional relationships.
  - *Fix*: Strictly use `@Getter` and `@Setter` on `@Entity` classes.
- **Multiple representations of the same entity**: Updating relationships (like assigning a shift to an employee) can fail if the managed context is out of sync.
  - *Fix*: Always fetch the managed entity via `findById` before saving, rather than saving an unmanaged DTO directly.
