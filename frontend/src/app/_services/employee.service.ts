import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    private apiUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    create(employee: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, employee);
    }

    update(id: number, employee: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    transfer(id: number, departmentId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/transfer`, { departmentId });
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/users`);
    }

    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/departments`);
    }
} 