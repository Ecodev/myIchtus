import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {bookableQuery, bookablesQuery, createBookable, deleteBookables, updateBookable} from './bookable.queries';
import {
    Bookable,
    Bookable_bookable,
    BookableInput,
    Bookables,
    BookableState,
    BookablesVariables,
    BookableVariables,
    Bookings,
    BookingsVariables,
    BookingType,
    CreateBookable,
    CreateBookableVariables,
    CurrentUserForProfile,
    DeleteBookables,
    DeleteBookablesVariables,
    LogicalOperator,
    UpdateBookable,
    UpdateBookableVariables,
    User,
} from '../../../shared/generated-types';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BookingService} from '../../bookings/services/booking.service';
import {intersectionBy} from 'lodash-es';
import {
    FormAsyncValidators,
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    unique,
} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';

function creditAccountRequiredValidator(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
        return null;
    }

    const periodicPrice = formGroup.controls.periodicPrice.value;
    const initialPrice = formGroup.controls.initialPrice.value;
    const creditAccount = formGroup.controls.creditAccount.value;
    return (periodicPrice > 0 || initialPrice > 0) && !creditAccount ? {creditAccountRequired: true} : null;
}

@Injectable({
    providedIn: 'root',
})
export class BookableService extends NaturalAbstractModelService<
    Bookable['bookable'],
    BookableVariables,
    Bookables['bookables'],
    BookablesVariables,
    CreateBookable['createBookable'],
    CreateBookableVariables,
    UpdateBookable['updateBookable'],
    UpdateBookableVariables,
    DeleteBookables,
    DeleteBookablesVariables
> {
    public static readonly membershipServices: BookablesVariables = {
        filter: {
            groups: [
                {
                    conditions: [
                        {
                            bookingType: {in: {values: [BookingType.self_approved], not: true}},
                            bookableTags: {have: {values: [BookableTagService.SERVICE]}},
                        },
                    ],
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [
                        {
                            bookingType: {in: {values: [BookingType.admin_approved]}},
                            bookableTags: {
                                have: {
                                    values: [
                                        BookableTagService.STORAGE_REQUEST,
                                        BookableTagService.FORMATION,
                                        BookableTagService.WELCOME,
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };

    public static readonly adminApproved: BookablesVariables = {
        filter: {groups: [{conditions: [{bookingType: {in: {values: [BookingType.admin_approved]}}}]}]},
    };

    constructor(apollo: Apollo, private readonly bookingService: BookingService) {
        super(apollo, 'bookable', bookableQuery, bookablesQuery, createBookable, updateBookable, deleteBookables);
    }

    public static getFiltersByTagId(tagId: string): BookablesVariables {
        return {filter: {groups: [{conditions: [{bookableTags: {have: {values: [tagId]}}}]}]}};
    }

    public static adminApprovedByTag(tagId: string): BookablesVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                isActive: {equal: {value: true}},
                                bookingType: {in: {values: [BookingType.admin_approved]}},
                                bookableTags: {have: {values: [tagId]}},
                            },
                        ],
                    },
                ],
            },
        };
    }

    public static adminByTag(bookableTagId: string): BookablesVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookingType: {in: {values: [BookingType.admin_only]}},
                                bookableTags: {have: {values: [bookableTagId]}},
                            },
                        ],
                    },
                ],
            },
        };
    }

    public static isLicenseGranted(
        bookable: Bookable['bookable'],
        user: User['user'] | CurrentUserForProfile['viewer'],
    ): boolean {
        if (!bookable || !user) {
            return false;
        }

        const matching = intersectionBy(bookable.licenses, user.licenses, 'id');

        return matching.length === bookable.licenses.length;
    }

    protected getDefaultForServer(): BookableInput {
        return {
            name: '',
            code: null,
            description: '',
            initialPrice: '0',
            periodicPrice: '0',
            purchasePrice: '0',
            simultaneousBookingMaximum: 1,
            bookingType: BookingType.self_approved,
            remarks: '',
            isActive: true,
            state: BookableState.good,
            verificationDate: null,
            image: null,
            creditAccount: null,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            code: [Validators.maxLength(10)],
            purchasePrice: [Validators.min(0)],
            simultaneousBookingMaximum: [Validators.min(-1)],
        };
    }

    public getFormAsyncValidators(model: Bookable_bookable): FormAsyncValidators {
        return {
            code: [unique('code', model.id, this)],
        };
    }

    public getFormGroupValidators(): ValidatorFn[] {
        return [creditAccountRequiredValidator];
    }

    public getMandatoryBookables(): Observable<Bookables['bookables']> {
        const mandatoryBookablesFilter: BookablesVariables = {
            filter: {groups: [{conditions: [{bookingType: {in: {values: [BookingType.mandatory]}}}]}]},
        };

        const qvm = new NaturalQueryVariablesManager<BookablesVariables>();
        qvm.set('variables', mandatoryBookablesFilter);
        return this.getAll(qvm); // getAll because mandatory bookables should not change
    }

    public getAvailability(
        bookable: Bookable['bookable'],
    ): Observable<{isAvailable: boolean; result: Bookings['bookings']}> {
        // Variable for pending bookings related to given bookable
        const variables: BookingsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookable: {have: {values: [bookable.id]}},
                                endDate: {null: {}},
                            },
                        ],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<BookingsVariables>();
        qvm.set('variables', variables);

        return this.bookingService.getAll(qvm).pipe(
            map(result => {
                const isAvailable =
                    bookable.isActive &&
                    (bookable.simultaneousBookingMaximum < 0 || bookable.simultaneousBookingMaximum > result.length);

                return {
                    isAvailable: isAvailable,
                    result: result,
                };
            }),
        );
    }

    public resolveByCode(code: string): Observable<{model: any}> {
        if (code) {
            const qvm = new NaturalQueryVariablesManager<BookablesVariables>();
            const variables: BookablesVariables = {
                filter: {groups: [{conditions: [{code: {equal: {value: code}}}]}]},
            };
            qvm.set('variables', variables);

            return this.getAll(qvm).pipe(
                map(result => {
                    return {model: result && result.items.length ? result.items[0] : null};
                }),
            );
        } else {
            return of({model: null});
        }
    }
}
