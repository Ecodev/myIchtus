import {Directive, Input} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {BookingService} from '../services/booking.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {SafetyBookingService} from '../../../safety/safety-booking.service';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractBookings<
    TService extends BookingService | BookingWithOwnerService | SafetyBookingService,
> extends NaturalAbstractList<TService> {
    @Input() public availableColumns?: string[];

    public columnIsAvailable(column: string): boolean {
        if (this.availableColumns === undefined) {
            return true;
        }

        return this.availableColumns.includes(column);
    }

    protected initFromRoute(): void {
        // Available columns
        if (this.route.snapshot.data.availableColumns) {
            this.availableColumns = this.route.snapshot.data.availableColumns;
        }
        super.initFromRoute();
    }

    public maybeTerminateBooking(id: string): void {
        if (!(this.service instanceof BookingService)) {
            throw new Error('Cannot terminate a booking with this service');
        }

        this.service.terminateBooking(id);
    }
}
