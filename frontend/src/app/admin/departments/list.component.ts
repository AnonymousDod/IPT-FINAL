import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../../_services/department.service';
import { AccountService } from '../../_services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-department-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  departments: any[] = [];

  constructor(
    private departmentService: DepartmentService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.departmentService.getAll().subscribe(data => this.departments = data);
  }

  account() {
    return this.accountService.accountValue;
  }

  edit(deptId: number) {
    this.router.navigate(['/departments/edit', deptId]);
  }

  delete(deptId: number) {
    this.departmentService.delete(deptId).subscribe(() => {
      this.departments = this.departments.filter(d => d.id !== deptId);
    });
  }

  add() {
    this.router.navigate(['/departments/add']);
  }
} 