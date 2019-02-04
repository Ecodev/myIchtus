import { Injectable } from '@angular/core';
import { UserService } from '../../../admin/users/services/user.service';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Literal } from '../../../shared/types';
import { FormValidators } from '../../../shared/services/abstract-model.service';
import { Validators } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { PasswordComponent } from '../password/password.component';

@Injectable({
    providedIn: 'root',
})
export class NewUserService extends UserService {

    constructor(apollo: Apollo, router: Router, bookingService: BookingService) {
        super(apollo, router, bookingService);
    }

    public getDefaultValues(): Literal {
        const values = {
            password: '',
            hasInsurance: true, // already accepted on step 1
            termsAgreement: true,  // already accepted on step 1
        };

        return Object.assign(super.getDefaultValues(), values);
    }

    public getFormValidators(): FormValidators {

        const validators = {
            hasInsurance: [],
            termsAgreement: [],
            locality: [Validators.required],
            street: [Validators.required],
            postcode: [Validators.required],
            country: [Validators.required],
        };

        return Object.assign(super.getFormValidators(), validators);
    }
}
