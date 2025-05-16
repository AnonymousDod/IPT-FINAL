import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService } from '../../_services/employee.service';
import { AlertService } from '../../_services/alert.service';
import { AccountService } from '../../_services/account.service';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    employee: any = {};
    accounts: any[] = [];
    departments: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Fetch all accounts for the Account dropdown, but only include those with status 'Active'
        this.accountService.getAll().subscribe(accounts => {
            this.accounts = accounts.filter(account => account.status === 'Active');
        });
        this.employeeService.getDepartments().subscribe(departments => this.departments = departments);

        if (this.id) {
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.employee = x;
                    this.employee.accountId = x.user?.id;
                    this.employee.departmentId = x.department?.id;
                    if (x.hireDate) {
                        this.employee.hireDate = x.hireDate.split('T')[0];
                    }
                });
        } else {
            // Auto-generate next employeeId
            this.employeeService.getAll().pipe(first()).subscribe(employees => {
                const ids = employees.map(e => e.employeeId).filter(id => /^EMP\d+$/.test(id));
                let maxNum = 0;
                ids.forEach(id => {
                    const num = parseInt(id.replace('EMP', ''), 10);
                    if (num > maxNum) maxNum = num;
                });
                const nextNum = (maxNum + 1).toString().padStart(3, '0');
                this.employee.employeeId = `EMP${nextNum}`;
            });
        }
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;

        // Map accountId to userId for backend compatibility
        if (this.employee.accountId) {
            this.employee.userId = this.employee.accountId;
        }

        if (this.id) {
            this.updateEmployee();
        } else {
            this.createEmployee();
        }
    }

    private createEmployee() {
        this.employeeService.create(this.employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the employee';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateEmployee() {
        this.employeeService.update(this.id!, this.employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the employee';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 