
import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';

import {
  form,
  FormField,
  required,
  min,
  validate
} from '@angular/forms/signals';

import { Employee } from '../../../../core/models/employee';

interface EmployeeFormModel {
  name: string;
  department: string;
  salary: number;
}

const emptyEmployee: EmployeeFormModel = {
  name: '',
  department: '',
  salary: 0
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './employee-form.html'
})
export class EmployeeForm implements OnChanges {
  readonly employee = input<Employee | undefined>();
  readonly saveError = input('');
  readonly fieldErrors = input<Record<string, string>>({});
  readonly saving = input(false);

  readonly saved = output<EmployeeFormModel>();
  readonly cancelled = output<void>();
  readonly fieldErrorCleared = output<string>();

  readonly submitted = signal(false);
  readonly model = signal<EmployeeFormModel>({ ...emptyEmployee });

  readonly employeeForm = form(this.model, path => {
    required(path.name, {
      message: 'Employee name is required'
    });

    required(path.department, {
      message: 'Department is required'
    });

    if (path.salary) {
      required(path.salary, {
        message: 'Salary is required'
      });

      min(path.salary, 0.01, {
        message: 'Salary must be greater than zero'
      });
    }
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee']) {
      const employee = this.employee();

      this.model.set(
        employee
          ? {
            name: employee.name,
            department: employee.department,
            salary: employee.salary ?? 0
          }
          : { ...emptyEmployee }
      );

      this.submitted.set(false);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    const salary = this.model().salary;

    if (
      this.employeeForm().invalid() ||
      salary === undefined ||
      !Number.isFinite(salary) ||
      salary <= 0
    ) {
      return;
    }

    this.saved.emit({
      name: this.model().name,
      department: this.model().department,
      salary
    });
  }
}
