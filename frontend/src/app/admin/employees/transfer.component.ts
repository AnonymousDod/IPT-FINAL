import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';

import { EmployeeService } from '../../_services/employee.service';
import { AlertService } from '../../_services/alert.service';

@Component({
    selector: 'app-transfer-modal',
    templateUrl: './transfer.component.html'
})
export class TransferComponent implements OnInit {
    @Input() employee: any;
    @Output() close = new EventEmitter();
    @Output() transferComplete = new EventEmitter();

    departmentId: any = '';
    departments: any[] = [];
    loading = false;
    error = '';

    constructor(
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadDepartments();
    }

    loadDepartments() {
        this.employeeService.getDepartments()
            .pipe(first())
            .subscribe(departments => {
                this.departments = departments;
                // Preselect current department if available
                if (this.employee && this.employee.departmentId) {
                    this.departmentId = this.employee.departmentId;
                } else if (departments.length > 0) {
                    this.departmentId = departments[0].id;
                }
            });
    }

    transfer() {
        if (!this.departmentId) {
            this.error = 'Please select a department';
            return;
        }

        this.loading = true;
        this.error = '';

        this.employeeService.transfer(this.employee.id, this.departmentId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee transferred successfully', { keepAfterRouteChange: true });
                    this.transferComplete.emit();
                    this.close.emit();
                },
                error: error => {
                    this.error = error;
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.close.emit();
    }
} 