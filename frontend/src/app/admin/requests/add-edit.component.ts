import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService } from '../../_services/request.service';
import { AlertService } from '../../_services/alert.service';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    request: any = { 
        type: '',
        employeeId: '',
        status: 'Pending',
        items: [{ name: '', quantity: 1 }] 
    };
    employees: any[] = [];
    workflows: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';
    preselectedEmployeeId: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Check if employee ID is provided in query params
        this.route.queryParams.subscribe(params => {
            if (params['employeeId']) {
                this.preselectedEmployeeId = parseInt(params['employeeId'], 10);
                this.request.employeeId = this.preselectedEmployeeId;
            }
        });
        
        // Load employees for dropdown
        this.requestService.getEmployees().subscribe({
            next: (employees) => {
                this.employees = employees;
                if (this.employees.length === 0) {
                    this.alertService.warn('No employees found. Please create employees first.');
                }
            },
            error: (error) => {
                this.alertService.error('Error loading employees: ' + error);
            }
        });
        
        // If editing an existing request, load it
        if (this.id) {
            this.loading = true;
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: (request) => {
                        this.request = request;
                        
                        // Convert RequestItems to items for the form
                        if (request.RequestItems && request.RequestItems.length > 0) {
                            this.request.items = request.RequestItems;
                        } else if (!this.request.items) {
                            this.request.items = [{ name: '', quantity: 1 }];
                        }
                        
                        // Convert employeeId to number if needed
                        if (this.request.employeeId && typeof this.request.employeeId === 'string') {
                            this.request.employeeId = parseInt(this.request.employeeId, 10);
                        }
                        
                        this.loading = false;
                    },
                    error: (error) => {
                        this.alertService.error('Error loading request: ' + error);
                        this.router.navigate(['../'], { relativeTo: this.route });
                        this.loading = false;
                    }
                });
        }
    }

    addItem() {
        this.request.items.push({ name: '', quantity: 1 });
    }

    removeItem(index: number) {
        if (this.request.items.length > 1) {
            this.request.items.splice(index, 1);
        } else {
            this.alertService.error('At least one item is required');
        }
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;
        this.errorMessage = '';

        // Validate form
        if (!this.request.type || !this.request.employeeId) {
            this.errorMessage = 'Please fill all required fields';
            this.loading = false;
            return;
        }

        // Check if all items have a name
        if (this.request.items.some((item: any) => !item.name.trim())) {
            this.errorMessage = 'All items must have a name';
            this.loading = false;
            return;
        }
        
        // Check if all items have valid quantities
        if (this.request.items.some((item: any) => !item.quantity || item.quantity < 1)) {
            this.errorMessage = 'All items must have a quantity greater than 0';
            this.loading = false;
            return;
        }

        // Always set status to 'Pending' when creating a new request
        if (!this.id) {
            this.request.status = 'Pending';
        }

        // Prepare data for API
        const requestData = { ...this.request };
        
        // Ensure employeeId is a number
        if (requestData.employeeId && typeof requestData.employeeId === 'string') {
            requestData.employeeId = parseInt(requestData.employeeId, 10);
        }
        
        if (this.id) {
            this.updateRequest(requestData);
        } else {
            this.createRequest(requestData);
        }
    }

    private createRequest(requestData: any) {
        this.requestService.create(requestData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request created successfully', { keepAfterRouteChange: true });
                    // If this was created for a specific employee, return to that employee's requests
                    if (this.preselectedEmployeeId) {
                        this.router.navigate(['/requests'], { 
                            queryParams: { employeeId: this.preselectedEmployeeId } 
                        });
                    } else {
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the request';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }

    private updateRequest(requestData: any) {
        this.requestService.update(this.id!, requestData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    // If this was updated for a specific employee, return to that employee's requests
                    if (this.preselectedEmployeeId) {
                        this.router.navigate(['/requests'], { 
                            queryParams: { employeeId: this.preselectedEmployeeId } 
                        });
                    } else {
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the request';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }

    cancel() {
        // If this was for a specific employee, return to that employee's requests
        if (this.preselectedEmployeeId) {
            this.router.navigate(['/requests'], { 
                queryParams: { employeeId: this.preselectedEmployeeId } 
            });
        } else {
            this.router.navigate(['../'], { relativeTo: this.route });
        }
    }
} 