import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    private apiUrl = `${environment.apiUrl}/workflows`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    create(workflow: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, workflow);
    }

    update(id: number, workflow: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, workflow);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/departments`);
    }

  getByEmployeeId(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`/workflows/employee/${employeeId}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`/workflows/${id}/status`, { status });
  }
} 