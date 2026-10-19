
import { Injectable, inject } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpParams
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { Employee } from '../models/employee';
import { PageResponse } from '../models/page-response';
import { EmployeeQuery } from '../models/employee-query';

@Injectable({
    providedIn: 'root'
})
export class EmployeeApi {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/employees';

    private handleError(error: HttpErrorResponse) {
        console.error('Employee API error:', error);
        return throwError(() => error);
    }

    getAll(query: EmployeeQuery): Observable<PageResponse<Employee>> {
        let params = new HttpParams()
            .set('page', query.page)
            .set('size', query.size)
            .set('sortBy', query.sortBy)
            .set('direction', query.direction);

        if (query.search?.trim()) {
            params = params.set('search', query.search.trim());
        }

        if (query.department?.trim()) {
            params = params.set('department', query.department.trim());
        }

        if (query.minSalary !== undefined) {
            params = params.set('minSalary', query.minSalary);
        }

        if (query.maxSalary !== undefined) {
            params = params.set('maxSalary', query.maxSalary);
        }

        return this.http.get<PageResponse<Employee>>(
            this.apiUrl,
            { params }
        ).pipe(
            catchError(error => this.handleError(error))
        );
    }

    getById(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => this.handleError(error))
        );
    }

    create(employee: Omit<Employee, 'id'>): Observable<Employee> {
        return this.http.post<Employee>(this.apiUrl, employee).pipe(
            catchError(error => this.handleError(error))
        );
    }

    update(
        id: number,
        employee: Omit<Employee, 'id'>
    ): Observable<Employee> {
        return this.http.put<Employee>(
            `${this.apiUrl}/${id}`,
            employee
        ).pipe(
            catchError(error => this.handleError(error))
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => this.handleError(error))
        );
    }
}
