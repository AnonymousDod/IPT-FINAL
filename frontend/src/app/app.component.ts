import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ 
    selector: 'app-root', 
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent {
    title = 'user-management-system';
    Role = Role;
    account: Account | null = null;
    showModal = false;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
    }

    showDetails() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}