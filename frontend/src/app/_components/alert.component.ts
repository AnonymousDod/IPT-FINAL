import { Component, OnInit, OnDestroy, Input } from '@angular/core' ;
import { Router, NavigationStart }  from '@angular/router' ;
import { Subscription } from 'rxjs' ;

import { Alert, AlertType } from '../_models';
import { AlertService } from '../_services';

/**
 * Alert component that displays alert messages with different types (success, error, info, warning)
 * Supports auto-closing, fade animations, and route change handling
 */
@Component({ selector: 'alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {
    @Input() id = 'default-alert';
    @Input() fade = true;

    alerts: Alert [] = [];
    alertSubscription!: Subscription;
    routeSubscription!: Subscription;

    constructor(private router: Router, private alertService: AlertService) { }

    /**
     * Initialize component by subscribing to alert notifications and route changes
     */
    ngOnInit() {
        // Subscribe to alert service to receive new alerts
        this.alertSubscription = this.alertService.onAlert(this.id)
            .subscribe(alert => {
                // Handle empty alert (clear request)
                if (!alert.message) {
                    // Keep only alerts marked to persist after route change
                    this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

                    // Remove persistence flag from remaining alerts
                    this.alerts.forEach(x => delete x.keepAfterRouteChange);
                    return;
                }

                // Add new alert to display
                this.alerts.push(alert);

                // Auto-close alert after delay if configured
                if (alert.autoClose) {
                    setTimeout(() => this.removeAlert(alert), 3000);
                }
            });

        // Clear alerts when navigating to new route
        this.routeSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.alertService.clear(this.id);
            }
        });
    }

    /**
     * Clean up subscriptions to prevent memory leaks
     */
    ngOnDestroy() {
        this.alertSubscription.unsubscribe();
        this.routeSubscription.unsubscribe();
    }

    /**
     * Remove an alert from display with optional fade animation
     * @param alert The alert to remove
     */
    removeAlert(alert: Alert) {
        if (!this.alerts.includes(alert)) return;

        if (this.fade) {
            // Trigger fade animation
            alert.fade = true;

            // Remove alert after fade animation completes
            setTimeout(() => {
                this.alerts = this.alerts.filter(x => x !== alert);
            }, 250);
        } else {
            // Remove alert immediately
            this.alerts = this.alerts.filter(x => x !== alert);
        }
    }

    /**
     * Generate CSS classes for alert styling based on type and state
     * @param alert The alert to style
     * @returns Space-separated string of CSS classes
     */
    cssClasses(alert: Alert) {
        if (!alert) return;

        const classes = ['alert', 'alert-dismissable'];

        const alertTypeClass = {
            [AlertType.Success]: 'alert alert-success',
            [AlertType.Error]: 'alert alert-danger',
            [AlertType.Info]: 'alert alert-info',
            [AlertType.Warning]: 'alert alert-warning'
        }

        if (alert.type !== undefined) {
            classes.push(alertTypeClass[alert.type]);
        }

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    }
}