import { Component, OnInit } from '@angular/core';
import {
    BookableQuery,
    BookableQueryVariables,
    CreateBookableMutation,
    CreateBookableMutationVariables,
    UpdateBookableMutation,
    UpdateBookableMutationVariables,
} from '../../shared/generated-types';
import { AlertService } from '../../shared/components/alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BookableService } from '../../admin/bookables/services/bookable.service';
import { AbstractDetail } from '../../admin/shared/components/AbstractDetail';
import { BookingService } from '../../admin/bookings/services/booking.service';
import { UserService } from '../../admin/users/services/user.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent
    extends AbstractDetail<BookableQuery['bookable'],
        BookableQueryVariables,
        CreateBookableMutation['createBookable'],
        CreateBookableMutationVariables,
        UpdateBookableMutation['updateBookable'],
        UpdateBookableMutationVariables,
        any> implements OnInit {

    constructor(alertService: AlertService,
                bookableService: BookableService,
                router: Router,
                route: ActivatedRoute,
                public bookingService: BookingService,
                private userService: UserService,
    ) {
        super('bookable', bookableService, alertService, router, route);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    public isAdmin() {
        return this.userService.getCurrentUser().pipe(map(u => UserService.canAccessAdmin(u)));
    }
}