package com.learning.employee_management.service;

import com.learning.employee_management.entity.Employee;
import com.learning.employee_management.dto.EmployeeRequest;
import com.learning.employee_management.dto.EmployeeResponse;
import com.learning.employee_management.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeService {

    private static final Logger log =
            LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Page<EmployeeResponse> getEmployees(
            Pageable pageable,
            String search,
            String department,
            Double minSalary,
            Double maxSalary) {

        List<Specification<Employee>> filters = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            String term = search.trim().toLowerCase();

            filters.add((root, query, cb) ->
                    cb.like(
                            cb.lower(root.get("name")),
                            "%" + term + "%"
                    )
            );
        }

        if (department != null && !department.isBlank()) {
            String departmentName = department.trim().toLowerCase();

            filters.add((root, query, cb) ->
                    cb.equal(
                            cb.lower(root.get("department")),
                            departmentName
                    )
            );
        }

        if (minSalary != null) {
            filters.add((root, query, cb) ->
                    cb.greaterThanOrEqualTo(
                            root.get("salary"),
                            minSalary
                    )
            );
        }

        if (maxSalary != null) {
            filters.add((root, query, cb) ->
                    cb.lessThanOrEqualTo(
                            root.get("salary"),
                            maxSalary
                    )
            );
        }

        Specification<Employee> specification =
                Specification.allOf(filters);

        return employeeRepository.findAll(specification, pageable)
                .map(this::toResponse);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public EmployeeResponse addEmployee(EmployeeRequest request) {
        Employee employee = toEntity(request);
        Employee savedEmployee = employeeRepository.save(employee);
        return toResponse(savedEmployee);
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        return employeeRepository.findById(id)
                .map(existingEmployee -> {
                    existingEmployee.setName(request.name());
                    existingEmployee.setDepartment(request.department());
                    existingEmployee.setSalary(request.salary());

                    Employee savedEmployee = employeeRepository.save(existingEmployee);
                    return toResponse(savedEmployee);
                })
                .orElse(null);
    }

    public boolean deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            return false;
        }

        employeeRepository.deleteById(id);
        return true;
    }

    private Employee toEntity(EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setName(request.name());
        employee.setDepartment(request.department());
        employee.setSalary(request.salary());
        return employee;
    }

    public EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getDepartment(),
                employee.getSalary()
        );
    }
}