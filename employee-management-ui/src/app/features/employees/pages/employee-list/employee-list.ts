
import {
  Component,
  computed,
  inject,
  OnInit,
  DestroyRef,
  signal
} from '@angular/core';
import { } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { EmployeeQuery } from '../../../../core/models/employee-query';
import { PageResponse } from '../../../../core/models/page-response';
import { EmployeeApi } from '../../../../core/services/employee-api';
import { Employee } from '../../../../core/models/employee';
import { EmployeeForm } from '../../components/employee-form/employee-form';

type EmployeeFormData = Omit<Employee, 'id'>;

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CurrencyPipe, EmployeeForm, RouterLink],
  templateUrl: './employee-list.html'
})
export class EmployeeList implements OnInit {
  private readonly employeeApi = inject(EmployeeApi);

  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  readonly error = signal('');
  readonly saveError = signal('');
  readonly deleteError = signal('');

  readonly fieldErrors = signal<Record<string, string>>({});
  readonly searchTerm = signal('');

  readonly formOpen = signal(false);
  readonly selectedEmployee = signal<Employee | undefined>(undefined);
  readonly employeeToDelete = signal<Employee | undefined>(undefined);

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly sortBy = signal<EmployeeQuery['sortBy']>('id');
  readonly sortDirection = signal<EmployeeQuery['direction']>('asc');

  readonly departmentFilter = signal('');
  readonly minSalary = signal<number | undefined>(undefined);
  readonly maxSalary = signal<number | undefined>(undefined);

  readonly filteredEmployees = computed(() => this.employees());

  readonly totalEmployees = computed(() => this.totalElements());

  readonly departmentCount = computed(
    () => new Set(
      this.employees().map(employee => employee.department)
    ).size
  );

  readonly averageSalary = computed(() => {
    const employees = this.employees();

    if (employees.length === 0) {
      return 0;
    }

    const total = employees.reduce(
      (sum, employee) => sum + employee.salary,
      0
    );

    return total / employees.length;
  });
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  constructor() {
    this.searchChanges.pipe(
      debounceTime(300),
      // distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadEmployees();
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.error.set('');

    const query: EmployeeQuery = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortBy(),
      direction: this.sortDirection(),
      search: this.searchTerm(),
      department: this.departmentFilter(),
      minSalary: this.minSalary(),
      maxSalary: this.maxSalary()
    };

    this.employeeApi.getAll(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: PageResponse<Employee>) => {
          this.employees.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to load employees', err);
          this.error.set(
            'Unable to load employees. Check that the backend is running.'
          );
        }
      });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
    this.searchChanges.next(value);
  }

  openCreateForm(): void {
    this.selectedEmployee.set(undefined);
    this.saveError.set('');
    this.fieldErrors.set({});
    this.formOpen.set(true);
  }

  openEditForm(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.saveError.set('');
    this.fieldErrors.set({});
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.selectedEmployee.set(undefined);
    this.saveError.set('');
    this.fieldErrors.set({});
  }

  clearFieldError(field: string): void {
    this.fieldErrors.update(errors => {
      const { [field]: removed, ...remaining } = errors;
      return remaining;
    });
  }


  onDepartmentChange(event: Event): void {
    this.departmentFilter.set(
      (event.target as HTMLInputElement).value
    );
    this.currentPage.set(0);
    this.loadEmployees();
  }

  onMinSalaryChange(event: Event): void {
    this.minSalary.set(
      this.parseOptionalNumber(
        (event.target as HTMLInputElement).value
      )
    );
    this.currentPage.set(0);
    this.loadEmployees();
  }

  onMaxSalaryChange(event: Event): void {
    this.maxSalary.set(
      this.parseOptionalNumber(
        (event.target as HTMLInputElement).value
      )
    );
    this.currentPage.set(0);
    this.loadEmployees();
  }

  private parseOptionalNumber(value: string): number | undefined {
    if (value.trim() === '') {
      return undefined;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }

  goToPage(page: number): void {
    if (
      page < 0 ||
      page >= this.totalPages() ||
      page === this.currentPage()
    ) {
      return;
    }

    this.currentPage.set(page);
    this.loadEmployees();
  }

  onPageSizeChange(event: Event): void {
    const size = Number(
      (event.target as HTMLSelectElement).value
    );

    if (![5, 10, 20, 50].includes(size)) {
      return;
    }

    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadEmployees();
  }

  toggleSort(field: EmployeeQuery['sortBy']): void {
    if (this.sortBy() === field) {
      this.sortDirection.update(direction =>
        direction === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }

    this.currentPage.set(0);
    this.loadEmployees();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.departmentFilter.set('');
    this.minSalary.set(undefined);
    this.maxSalary.set(undefined);
    this.currentPage.set(0);

    this.searchChanges.next('');
  }

  private getSaveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot connect to the server. Please try again.';
    }

    if (err.status === 400) {
      const body: unknown = err.error;

      if (typeof body === 'string') {
        return body;
      }

      if (
        body !== null &&
        typeof body === 'object' &&
        !Array.isArray(body)
      ) {
        const messages = Object.values(body).filter(
          (value): value is string => typeof value === 'string'
        );

        if (messages.length > 0) {
          return messages.join(' ');
        }
      }

      return 'Please check the employee details and try again.';
    }

    return 'Unable to save employee. Please try again.';
  }

  saveEmployee(data: EmployeeFormData): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set('');
    this.fieldErrors.set({});

    const employee = this.selectedEmployee();

    const request = employee
      ? this.employeeApi.update(employee.id, data)
      : this.employeeApi.create(data);

    request
      .pipe(
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: savedEmployee => {
          this.closeForm();

          if (!employee) {
            this.currentPage.set(0);
          }

          this.loadEmployees();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to save employee', err);

          const body: unknown = err.error;

          if (
            err.status === 400 &&
            body !== null &&
            typeof body === 'object' &&
            !Array.isArray(body)
          ) {
            const errors = Object.fromEntries(
              Object.entries(body).filter(
                (entry): entry is [string, string] =>
                  typeof entry[1] === 'string'
              )
            );

            if (Object.keys(errors).length > 0) {
              this.fieldErrors.set(errors);
              this.saveError.set('');
              return;
            }
          }

          this.fieldErrors.set({});
          this.saveError.set(this.getSaveErrorMessage(err));
        }
      });
  }

  requestDelete(employee: Employee): void {
    this.deleteError.set('');
    this.employeeToDelete.set(employee);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.employeeToDelete.set(undefined);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    const employee = this.employeeToDelete();

    if (!employee || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');

    this.employeeApi.delete(employee.id)
      .pipe(
        finalize(() => this.deleting.set(false))
      )
      .subscribe({
        next: () => {
          this.employeeToDelete.set(undefined);

          // If the deleted employee was the only row on this page,
          // move back one page so the user doesn't land on an empty page.
          if (this.employees().length === 1 && this.currentPage() > 0) {
            this.currentPage.update(page => page - 1);
          }

          this.loadEmployees();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to delete employee', err);

          this.deleteError.set(
            'Unable to delete this employee. Please try again.'
          );
        }
      });
  }
}
