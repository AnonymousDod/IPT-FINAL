import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { AccountService } from '../_services/account.service';
import { environment } from '../../environments/environment';

@Component({ 
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.less']
})
export class LoginComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    showPassword = false;
    apiUrl = environment.apiUrl; // For debugging

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        console.log('Login component initialized');
        console.log('API URL:', this.apiUrl);
        
        // Try to ping the backend to check connectivity
        this.checkBackendConnectivity();
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    checkBackendConnectivity() {
        fetch(this.apiUrl)
            .then(response => {
                console.log('Backend connectivity check response:', response);
                if (response.ok) {
                    console.log('Backend is reachable');
                    return response.json();
                } else {
                    console.error('Backend returned error status:', response.status);
                    throw new Error(`Backend returned ${response.status}`);
                }
            })
            .then(data => {
                console.log('Backend response data:', data);
            })
            .catch(error => {
                console.error('Backend connectivity check failed:', error);
            });
    }

    onSubmit() {
        this.submitted = true;
        console.log('Login attempt with email:', this.f['email'].value);

        // stop here if form is invalid
        if (this.form.invalid) {
            console.warn('Form is invalid, stopping submission');
            return;
        }

        this.error = '';
        this.loading = true;
        
        console.log('Attempting to authenticate with backend...');
        this.accountService.login(this.f['email'].value, this.f['password'].value)
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('Authentication successful:', response);
                    // get return url from query parameters or default to home page
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: (error: HttpErrorResponse) => {
                    console.error('Authentication error:', error);
                    if (error.status === 0) {
                        this.error = 'Unable to connect to the server. Please try again later.';
                    } else if (error.status === 401) {
                        this.error = 'Invalid email or password';
                    } else if (error.error && error.error.message) {
                        this.error = error.error.message;
                    } else {
                        this.error = 'An unexpected error occurred. Please try again.';
                    }
                    this.loading = false;
                }
            });
    }
}