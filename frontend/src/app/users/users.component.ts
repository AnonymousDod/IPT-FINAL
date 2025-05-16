import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services';
import { Account } from '../_models';

interface UserWithEditing extends Account {
    isEditing: boolean;
}

@Component({
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.less']
})
export class UsersComponent implements OnInit {
    users: UserWithEditing[] = [];
    loading = false;
    private originalUser: UserWithEditing | null = null;

    // Add Account form state
    showAddForm = false;
    addAccountForm = {
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        role: 'User',
        status: 'Active'
    };

    // Edit Account form state
    showEditForm = false;
    editAccountForm: any = null;
    editingUserId: string | null = null;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.loading = true;
        this.accountService.getAll()
            .subscribe(users => {
                this.users = users.map(user => ({ ...user, isEditing: false }));
                this.loading = false;
            });
    }

    // Add Account logic
    openAddForm() {
        console.log('Add Account button clicked!');
        this.showAddForm = true;
        this.addAccountForm = {
            title: 'Mr',
            firstName: '',
            lastName: '',
            email: '',
            role: 'User',
            status: 'Active'
        };
    }
    cancelAdd() {
        this.showAddForm = false;
    }
    saveAdd() {
        this.loading = true;
        const newAccount = { ...this.addAccountForm, password: 'TempPass123!', confirmPassword: 'TempPass123!', acceptTerms: true };
        this.accountService.register(newAccount)
            .subscribe({
                next: () => {
                    this.showAddForm = false;
                    this.ngOnInit(); // reload users
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
    }

    // Edit Account logic (card form)
    openEditForm(user: UserWithEditing) {
        this.showEditForm = true;
        this.editingUserId = user.id;
        this.editAccountForm = {
            title: user.title,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status
        };
    }
    cancelEditForm() {
        this.showEditForm = false;
        this.editingUserId = null;
        this.editAccountForm = null;
    }
    saveEditForm() {
        console.log('Edit form submitted', this.editAccountForm);
        if (!this.editingUserId) return;
        this.loading = true;
        const updateData = {
            title: this.editAccountForm.title,
            firstName: this.editAccountForm.firstName,
            lastName: this.editAccountForm.lastName,
            email: this.editAccountForm.email,
            role: this.editAccountForm.role,
            status: this.editAccountForm.status
        };
        this.accountService.update(this.editingUserId, updateData)
            .subscribe({
                next: () => {
                    this.showEditForm = false;
                    this.editingUserId = null;
                    this.editAccountForm = null;
                    this.ngOnInit(); // reload users
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
    }
} 