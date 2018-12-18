import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractDetail } from '../../shared/components/AbstractDetail';
import { AlertService } from '../../../shared/components/alert/alert.service';
import {
    CreateLicenseMutation,
    CreateLicenseMutationVariables, DeleteLicensesMutation,
    LicenseQuery,
    LicenseQueryVariables,
    UpdateLicenseMutation, UpdateLicenseMutationVariables,
} from '../../../shared/generated-types';
import { LicenseService } from '../services/license.service';
import { BookableService } from '../../bookables/services/bookable.service';
import { UserService } from '../../users/services/user.service';


@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
})
export class LicenseComponent
    extends AbstractDetail<LicenseQuery['license'],
        LicenseQueryVariables,
        CreateLicenseMutation['createLicense'],
        CreateLicenseMutationVariables,
        UpdateLicenseMutation['updateLicense'],
        UpdateLicenseMutationVariables,
        DeleteLicensesMutation> {

    constructor(alertService: AlertService,
                licenseService: LicenseService,
                router: Router,
                route: ActivatedRoute,
                public userService: UserService,
                public bookableService: BookableService
    ) {
        super('license', licenseService, alertService, router, route);
    }
}