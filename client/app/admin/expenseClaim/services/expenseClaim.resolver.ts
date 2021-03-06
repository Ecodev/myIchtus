import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {ExpenseClaimResolve} from '../expenseClaim';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimResolver implements Resolve<ExpenseClaimResolve> {
    constructor(
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly errorService: ErrorService,
    ) {}

    /**
     * Resolve expenseClaim data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<ExpenseClaimResolve> {
        const observable = this.expenseClaimService.resolve(route.params.expenseClaimId);

        return this.errorService.redirectIfError(observable);
    }
}
