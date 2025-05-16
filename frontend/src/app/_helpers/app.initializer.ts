import { AccountService } from '../_services';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // Check if we have a current user in localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            // Try to refresh the token
            accountService.refreshToken().subscribe({
                next: () => {
                    console.log('Token refreshed successfully');
                    resolve();
                },
                error: (error) => {
                    console.error('Token refresh failed:', error);
                    // Only logout if the error is not 401 (Unauthorized)
                    if (error.status !== 401) {
                        accountService.logout();
                    }
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}