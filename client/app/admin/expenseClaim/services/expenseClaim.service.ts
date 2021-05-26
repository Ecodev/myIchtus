import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    FormValidators,
    money,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    SortingOrder,
} from '@ecodev/natural';
import {
    createExpenseClaim,
    deleteExpenseClaims,
    expenseClaimQuery,
    expenseClaimsQuery,
    updateExpenseClaim,
} from './expenseClaim.queries';
import {
    CreateExpenseClaim,
    CreateExpenseClaimVariables,
    CurrentUserForProfile_viewer,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables,
    ExpenseClaim,
    ExpenseClaimInput,
    ExpenseClaims,
    ExpenseClaimSortingField,
    ExpenseClaimStatus,
    ExpenseClaimsVariables,
    ExpenseClaimType,
    ExpenseClaimVariables,
    UpdateExpenseClaim,
    UpdateExpenseClaimVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimService extends NaturalAbstractModelService<
    ExpenseClaim['expenseClaim'],
    ExpenseClaimVariables,
    ExpenseClaims['expenseClaims'],
    ExpenseClaimsVariables,
    CreateExpenseClaim['createExpenseClaim'],
    CreateExpenseClaimVariables,
    UpdateExpenseClaim['updateExpenseClaim'],
    UpdateExpenseClaimVariables,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables
> {
    constructor(apollo: Apollo) {
        super(
            apollo,
            'expenseClaim',
            expenseClaimQuery,
            expenseClaimsQuery,
            createExpenseClaim,
            updateExpenseClaim,
            deleteExpenseClaims,
        );
    }

    protected getDefaultForServer(): ExpenseClaimInput {
        return {
            name: '',
            owner: null,
            amount: '0',
            description: '',
            remarks: '',
            internalRemarks: '',
            status: ExpenseClaimStatus.new,
            type: ExpenseClaimType.expenseClaim,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            amount: [Validators.required, money, Validators.min(1)],
        };
    }

    public getForUser(
        user: CurrentUserForProfile_viewer,
        expire: Subject<void>,
    ): Observable<ExpenseClaims['expenseClaims']> {
        const variables: ExpenseClaimsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                owner: {equal: {value: user.id}},
                                // status: {equal: {value: BookingStatus.application}}, ?? all ? or just pending ones ?
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: ExpenseClaimSortingField.creationDate, order: SortingOrder.DESC}],
        };

        const qvm = new NaturalQueryVariablesManager<ExpenseClaimsVariables>();
        qvm.set('variables', variables);
        return this.watchAll(qvm, expire);
    }
}
