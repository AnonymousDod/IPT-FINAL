import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService } from '../../_services/workflow.service';
import { AccountService } from '../../_services/account.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  @Input() employeeId?: number;
  workflows: any[] = [];

  constructor(
    private workflowService: WorkflowService,
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.employeeId) {
      this.employeeId = this.route.snapshot.queryParams['employeeId'];
    }
    if (this.employeeId) {
      this.workflowService.getByEmployeeId(this.employeeId).subscribe(data => this.workflows = data);
    }
  }

  account() {
    return this.accountService.accountValue;
  }

  updateStatus(workflow: any) {
    this.workflowService.updateStatus(workflow.id, workflow.status).subscribe();
  }
} 