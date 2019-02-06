import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { ErrorService } from '../../../shared/components/error/error.service';
import { UserByTokenQuery } from '../../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class UserByTokenResolver implements Resolve<{ model: UserByTokenQuery['userByToken'] }> {

    constructor(private userService: UserService,
                private errorService: ErrorService) {
    }

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<{ model: UserByTokenQuery['userByToken'] }> {
        const observable = this.userService.resolveByToken(route.params.token);

        return this.errorService.redirectIfError(observable);
    }

}