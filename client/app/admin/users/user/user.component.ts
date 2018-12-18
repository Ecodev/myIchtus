import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractDetail } from '../../shared/components/AbstractDetail';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { UserService } from '../services/user.service';
import {
    BookingFilter,
    BookingStatus,
    BookingType,
    CreateUserMutation,
    CreateUserMutationVariables,
    UpdateUserMutation,
    UpdateUserMutationVariables,
    UserQuery,
    UserQueryVariables,
} from '../../../shared/generated-types';
import { LicenseService } from '../../licenses/services/license.service';
import { UserTagService } from '../../userTags/services/userTag.service';
import { BookingService } from '../../bookings/services/booking.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent
    extends AbstractDetail<UserQuery['user'],
        UserQueryVariables,
        CreateUserMutation['createUser'],
        CreateUserMutationVariables,
        UpdateUserMutation['updateUser'],
        UpdateUserMutationVariables,
        any> implements OnInit {

    public runningSelfApproved;
    public runningActive;
    public pendingDemands;

    constructor(alertService: AlertService,
                userService: UserService,
                router: Router,
                route: ActivatedRoute,
                public userTagService: UserTagService,
                public licenseService: LicenseService,
                public bookingService: BookingService,
    ) {
        super('user', userService, alertService, router, route);
    }

    ngOnInit() {
        super.ngOnInit();

        this.runningSelfApproved = this.getRunningSelfApprovedFilter();
        this.runningActive = this.getRunningActive();
        this.pendingDemands = this.getPendingApplicationsFilter();
    }

    /**
     * Sorties en cours
     */
    public getRunningSelfApprovedFilter(): BookingFilter {

        const filter: BookingFilter = {
            groups: [
                {
                    conditions: [
                        {
                            responsible: {have: {values: [this.data.model.id]}},
                            status: {equal: {value: BookingStatus.booked}},
                            endDate: {null: {not: false}},

                        },
                    ],
                    joins: {bookables: {conditions: [{bookingType: {in: {values: [BookingType.self_approved]}}}]}},
                },
            ],
        };

        return filter;
    }

    /**
     * Membership and inventory
     */
    public getRunningActive(): BookingFilter {

        const filter: BookingFilter = {
            groups: [
                {
                    conditions: [
                        {
                            responsible: {have: {values: [this.data.model.id]}},
                            status: {equal: {value: BookingStatus.booked}},
                            endDate: {null: {not: false}},
                        },
                    ],
                    joins: {bookables: {conditions: [{bookingType: {in: {values: [BookingType.admin_only, BookingType.mandatory]}}}]}},
                },
            ],
        };

        return filter;
    }

    /**
     * Demandes en attente
     */
    public getPendingApplicationsFilter(): BookingFilter {

        const filter: BookingFilter = {
            groups: [
                {
                    conditions: [
                        {
                            responsible: {have: {values: [this.data.model.id]}},
                            status: {equal: {value: BookingStatus.application}},
                        },
                    ], joins: {bookables: {conditions: [{bookingType: {in: {values: [BookingType.admin_approved]}}}]}},
                },
            ],
        };
        return filter;
    }

}