import { Component, OnInit } from '@angular/core';
import { AbstractDetail } from '../../../admin/shared/components/AbstractDetail';
import {
    CreateUserMutation,
    CreateUserMutationVariables,
    UpdateUserMutation,
    UpdateUserMutationVariables,
    UserQuery,
    UserQueryVariables,
} from '../../../shared/generated-types';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { AppDataSource } from '../../../shared/services/data.source';
import { AnonymousUserService } from './anonymous-user.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { pick } from 'lodash';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends AbstractDetail<UserQuery['user'],
    UserQueryVariables,
    CreateUserMutation['createUser'],
    CreateUserMutationVariables,
    UpdateUserMutation['updateUser'],
    UpdateUserMutationVariables,
    any> implements OnInit {

    private mandatoryBookables: AppDataSource;

    public step;
    public sending = false;

    constructor(userService: AnonymousUserService,
                alertService: AlertService,
                router: Router,
                route: ActivatedRoute,
                protected bookableService: BookableService,
                protected apollo: Apollo,
    ) {
        super('user', userService, alertService, router, route);
    }

    ngOnInit() {

        this.step = +this.route.snapshot.data.step;

        super.ngOnInit();

        this.bookableService.getMandatoryBookables().subscribe(bookables => {
            if (bookables) {
                this.mandatoryBookables = new AppDataSource(bookables);
            }
        });

    }

    public submit(): void {
        this.validateAllFormFields(this.form);
        if (this.form.invalid) {
            return;
        }

        this.doSubmit();
    }

    /**
     * Register new user
     */
    protected doSubmit(): void {
        this.sending = true;
        const mutation = gql`
            mutation Register($email: Email!, $hasInsurance: Boolean!, $termsAgreement: Boolean!) {
                register(email: $email, hasInsurance: $hasInsurance, termsAgreement: $termsAgreement)
            }
        `;

        this.apollo.mutate({
            mutation: mutation,
            variables: this.form.value,
        }).subscribe(() => {
            this.sending = false;

            const message = 'Un email avec des instructions a été envoyé';

            this.alertService.info(message, 5000);
            this.router.navigate(['/login']);
        }, () => this.sending = false);
    }
}
