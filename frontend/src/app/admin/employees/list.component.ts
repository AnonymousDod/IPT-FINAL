import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService } from '../../_services/employee.service';
import { AlertService } from '../../_services/alert.service';

@Component({
    templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    employees: any[] = [];
    departments: any[] = [];
    loading = false;
    
    showTransferModal = false;
    selectedEmployee: any = null;
    selectedDepartmentId: any = null;

    constructor(
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadEmployees();
        this.loadDepartments();
    }

    loadEmployees() {
        this.loading = true;
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: employees => {
                    this.employees = employees;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    loadDepartments() {
        this.employeeService.getDepartments()
            .pipe(first())
            .subscribe(departments => {
                this.departments = departments;
            });
    }

    deleteEmployee(id: number) {
        const employee = this.employees.find(x => x.id === id);
        if (!confirm(`Are you sure you want to delete employee ${employee.employeeId}?`)) {
            return;
        }
        
        this.loading = true;
        this.employeeService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee deleted successfully');
                    this.loadEmployees();
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    
    // View employee requests
    viewRequests(employeeId: number) {
        this.router.navigate(['/requests'], { 
            queryParams: { employeeId: employeeId } 
        });
    }
    
    // View employee workflows
    viewWorkflows(employeeId: number) {
        this.router.navigate(['/workflows'], { 
            queryParams: { employeeId: employeeId } 
        });
    }
    
    // Handle transfer
    openTransferModal(employee: any) {
        this.selectedEmployee = employee;
        this.selectedDepartmentId = employee.departmentId;
        this.showTransferModal = true;
    }
    
    closeTransferModal() {
        this.showTransferModal = false;
        this.selectedEmployee = null;
    }
    
    confirmTransfer() {
        if (!this.selectedEmployee || !this.selectedDepartmentId) {
            this.alertService.error('Please select a department');
            return;
        }

        this.loading = true;
        this.employeeService.transfer(this.selectedEmployee.id, this.selectedDepartmentId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee transferred successfully');
                    this.loadEmployees();
                    this.closeTransferModal();
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 