
package com.learning.employee_management.service;

import com.learning.employee_management.entity.Employee;
import com.learning.employee_management.repository.EmployeeRepository;
import com.learning.employee_management.dto.EmployeeRequest;
import com.learning.employee_management.dto.EmployeeResponse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void addEmployee_shouldSaveEmployeeAndReturnResponse() {
        // Arrange
        EmployeeRequest request = new EmployeeRequest(
                "Priya Sharma",
                "Engineering",
                85000.0
        );

        Employee savedEmployee = new Employee();
        savedEmployee.setId(101L);
        savedEmployee.setName("Priya Sharma");
        savedEmployee.setDepartment("Engineering");
        savedEmployee.setSalary(85000.0);

        when(employeeRepository.save(any(Employee.class)))
                .thenReturn(savedEmployee);

        // Act
        EmployeeResponse response =
                employeeService.addEmployee(request);

        // Assert: response DTO
        assertEquals(101L, response.id());
        assertEquals("Priya Sharma", response.name());
        assertEquals("Engineering", response.department());
        assertEquals(85000.0, response.salary());

        // Verify: entity sent to repository
        ArgumentCaptor<Employee> captor =
                ArgumentCaptor.forClass(Employee.class);

        verify(employeeRepository).save(captor.capture());

        Employee entityToSave = captor.getValue();

        assertEquals("Priya Sharma", entityToSave.getName());
        assertEquals("Engineering", entityToSave.getDepartment());
        assertEquals(85000.0, entityToSave.getSalary());
    }
}
