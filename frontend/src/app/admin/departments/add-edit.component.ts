import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DepartmentService } from '../../_services/department.service';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id?: number;
  department: any = {};
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.departmentService.getAll().subscribe(departments => {
        const dept = departments.find((d: any) => d.id == this.id);
        if (dept) this.department = { ...dept };
      });
    }
  }

  save() {
    if (this.id) {
      this.departmentService.update(this.id, this.department).subscribe({
        next: () => this.router.navigate(['/departments']),
        error: err => this.errorMessage = err.error?.message || 'Error updating department'
      });
    } else {
      this.departmentService.create(this.department).subscribe({
        next: () => this.router.navigate(['/departments']),
        error: err => this.errorMessage = err.error?.message || 'Error creating department'
      });
    }
  }

  cancel() {
    this.router.navigate(['/departments']);
  }
} 