import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { RequestService } from '../../_services/request.service';
import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { EmployeeService } from '../../_services/employee.service';

@Component({
  selector: 'app-request-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  requests: any[] = [];
  loading = false;
  employeeId: number | null = null;
  employeeName: string = '';
  isSingleEmployeeView = false;

  constructor(
    private requestService: RequestService,
    private accountService: AccountService,
    private alertService: AlertService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if we're viewing requests for a specific employee
    this.route.queryParams.subscribe(params => {
      if (params['employeeId']) {
        this.employeeId = parseInt(params['employeeId'], 10);
        this.isSingleEmployeeView = true;
        this.loadEmployeeRequests(this.employeeId);
        this.loadEmployeeName(this.employeeId);
      } else {
        this.isSingleEmployeeView = false;
        this.loadAllRequests();
      }
    });
  }

  loadAllRequests() {
    this.loading = true;
    this.requestService.getAll()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Error loading requests: ' + error);
          this.loading = false;
        }
      });
  }

  loadEmployeeRequests(employeeId: number) {
    this.loading = true;
    this.requestService.getByEmployeeId(employeeId)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Error loading employee requests: ' + error);
          this.loading = false;
        }
      });
  }

  loadEmployeeName(employeeId: number) {
    this.employeeService.getById(employeeId)
      .pipe(first())
      .subscribe({
        next: (employee) => {
          if (employee) {
            this.employeeName = `${employee.employeeId} - ${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`;
          }
        }
      });
  }

  account() {
    return this.accountService.accountValue;
  }

  edit(requestId: number) {
    this.router.navigate(['/requests/edit', requestId]);
  }

  delete(requestId: number) {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }
    
    this.loading = true;
    this.requestService.delete(requestId)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Request deleted successfully');
          this.requests = this.requests.filter(r => r.id !== requestId);
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Error deleting request: ' + error);
          this.loading = false;
        }
      });
  }

  add() {
    // If in employee view, pre-select the employee when adding new request
    if (this.employeeId) {
      this.router.navigate(['/requests/add'], { 
        queryParams: { employeeId: this.employeeId } 
      });
    } else {
      this.router.navigate(['/requests/add']);
    }
  }

  backToEmployees() {
    this.router.navigate(['/employees']);
  }
} 