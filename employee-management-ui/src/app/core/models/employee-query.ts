
export interface EmployeeQuery {
    page: number;
    size: number;
    sortBy: 'id' | 'name' | 'department' | 'salary';
    direction: 'asc' | 'desc';
    search?: string;
    department?: string;
    minSalary?: number;
    maxSalary?: number;
}
