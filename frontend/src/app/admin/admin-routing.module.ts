import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubnavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const employeesModule = () => import('./employees/employees.module').then(x => x.EmployeesModule);
const requestsModule = () => import('./requests/requests.module').then(x => x.RequestsModule);
const workflowsModule = () => import('./workflows/workflows.module').then(x => x.WorkflowsModule);
const departmentsModule = () => import('./departments/departments.module').then(x => x.DepartmentsModule);

const routes: Routes = [
  { path: '', component: SubnavComponent, outlet: 'subnav' },
  {
    path: '', component: LayoutComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'accounts', loadChildren: accountsModule },
      { path: 'employees', loadChildren: employeesModule },
      { path: 'requests', loadChildren: requestsModule },
      { path: 'workflows', loadChildren: workflowsModule },
      { path: 'departments', loadChildren: departmentsModule }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }