import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { AccountService } from '../../../admin/accounts/services/account.service';
import { mergeWith } from 'lodash';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { UserService } from '../../../admin/users/services/user.service';
import * as Datatrans from '../../../datatrans-2.0.0.sandbox.js';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

    public user;

    constructor(public userService: UserService,
                private alertService: AlertService,
                private route: ActivatedRoute,
                public bookableService: BookableService,
                public accountService: AccountService) {
    }

    ngOnInit() {
        this.user = this.route.snapshot.data.user.model;
    }

    public pay() {
        Datatrans.startPayment({
            params: {
                production: false,
                merchantId: '1100003518',
                sign: '190314170627759807',
                refno: '1123',
                amount: '999100',
                currency: 'CHF',
                uppReturnTarget: '_self'
            },
            // loaded: () => console.log('datatrans loaded event'),
            // opened: () => console.log('datatrans opened event'),
            // closed: () => console.warn('datatrans canceled event'),
            success: (args) => {
                console.log('succeeded payment', args.data);
                this.alertService.info('Youpi, tu t\'es appauvri et nous nous sommes enrichis');
            },
            error: (args) => {
                console.error('errored payment', args.data);
                this.alertService.error('Echec du paiement, tu reste riche');
            },
        });
    }

}
