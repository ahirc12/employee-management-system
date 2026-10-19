
import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { Employee } from '../../../../core/models/employee';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './employee-detail.html'
})
export class EmployeeDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    ),
    { initialValue: this.route.snapshot.paramMap.get('id') }
  );

  readonly employeeId = computed(() => {
    const rawId = this.routeId();

    if (!rawId || !/^\d+$/.test(rawId)) {
      return undefined;
    }

    const id = Number(rawId);

    return Number.isSafeInteger(id) && id > 0
      ? id
      : undefined;
  });

  readonly employeeResource = httpResource<Employee>(
    () => {
      const id = this.employeeId();

      return id === undefined
        ? undefined
        : `/api/employees/${id}`;
    }
  );
}
