import { Injectable } from '@angular/core';
import { UserService } from '../../../admin/users/services/user.service';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Literal } from '../../../shared/types';
import { FormValidators } from '../../../shared/services/abstract-model.service';
import { BookingService } from '../../../admin/bookings/services/booking.service';

@Injectable({
    providedIn: 'root',
})
export class FamilyUserService extends UserService {

    constructor(apollo: Apollo, router: Router, bookingService: BookingService) {
        super(apollo, router, bookingService);
    }

    public getDefaultValues(): Literal {
        const values = {
            hasInsurance: false,
            termsAgreement: false,
        };

        return Object.assign(super.getDefaultValues(), values);
    }

    public getFormValidators(): FormValidators {

        const validators = {
            hasInsurance: [],
            termsAgreement: [],
            locality: [],
            street: [],
            postcode: [],
            country: [],
        };

        return Object.assign(super.getFormValidators(), validators);
    }
}
