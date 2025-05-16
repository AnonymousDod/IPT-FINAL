import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from './_helpers';
import { AccountService } from './_services';
import { environment } from '../environments/environment';
import { FakeBackendInterceptor } from './_helpers/fake-backend';
import { AlertService } from './_services';

import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home';
import { UsersComponent } from './users/users.component';

// Create providers array that conditionally includes the fake backend
const providers: any[] = [
  { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
];

// Add fake backend interceptor if enabled in environment
if (environment.useFakeBackend) {
  providers.push({ 
    provide: HTTP_INTERCEPTORS, 
    useClass: FakeBackendInterceptor, 
    multi: true,
    deps: [AlertService] 
  });
}

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    UsersComponent
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }