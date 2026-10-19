import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'employees'
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./features/employees/pages/employee-list/employee-list')
        .then(m => m.EmployeeList)
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./features/employees/pages/employee-detail/employee-detail')
        .then(m => m.EmployeeDetail)
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
