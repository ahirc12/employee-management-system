
package com.learning.employee_management.controller;

import com.learning.employee_management.exception.ApiError;
import com.learning.employee_management.dto.EmployeeRequest;
import com.learning.employee_management.dto.EmployeeResponse;
import com.learning.employee_management.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public Page<EmployeeResponse> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page must be zero or greater");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100");
        }

        if (!List.of("id", "name", "department", "salary")
                .contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid sort field");
        }

        if (!"asc".equalsIgnoreCase(direction)
                && !"desc".equalsIgnoreCase(direction)) {
            throw new IllegalArgumentException(
                    "Direction must be asc or desc");
        }

        if (minSalary != null && minSalary < 0) {
            throw new IllegalArgumentException(
                    "Minimum salary cannot be negative");
        }

        if (maxSalary != null && maxSalary < 0) {
            throw new IllegalArgumentException(
                    "Maximum salary cannot be negative");
        }

        if (minSalary != null && maxSalary != null
                && minSalary > maxSalary) {
            throw new IllegalArgumentException(
                    "Minimum salary cannot exceed maximum salary");
        }

        Sort.Direction sortDirection =
                Sort.Direction.fromString(direction);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        return employeeService.getEmployees(
                pageable,
                search,
                department,
                minSalary,
                maxSalary
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {

        var employee = employeeService.getEmployeeById(id);

        if (employee == null) {
            ApiError error = new ApiError(
                    404,
                    "Employee not found"
            );

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error);
        }

        return ResponseEntity.ok(
                employeeService.toResponse(employee)
        );
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> addEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse savedEmployee =
                employeeService.addEmployee(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedEmployee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse updatedEmployee =
                employeeService.updateEmployee(id, request);

        if (updatedEmployee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedEmployee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id) {

        boolean deleted = employeeService.deleteEmployee(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
