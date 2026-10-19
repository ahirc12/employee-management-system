
package com.learning.employee_management.dto;

public record EmployeeResponse(
        Long id,
        String name,
        String department,
        double salary
) {}
