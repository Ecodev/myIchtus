import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../admin/user/services/user.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UserService) {
    }

    /**
     * Return if route is allowed or not considering the authenticated user.
     * Used by routing service.
     */
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        return this.userService.getCurrentUser().pipe(map(user => {
            if (!user) {
                this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
                return false;
            }

            return true;
        }));
    }
}