import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { WorkflowService } from '../../_services/workflow.service';
import { AlertService } from '../../_services/alert.service';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    workflow: any = {};
    departments: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load departments for dropdowns
        this.workflowService.getDepartments().subscribe(departments => this.departments = departments);

        if (this.id) {
            this.workflowService.getById(this.id)
                .pipe(first())
                .subscribe(x => this.workflow = x);
        }
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;

        if (this.id) {
            this.updateWorkflow();
        } else {
            this.createWorkflow();
        }
    }

    private createWorkflow() {
        this.workflowService.create(this.workflow)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the workflow';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateWorkflow() {
        this.workflowService.update(this.id!, this.workflow)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the workflow';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 