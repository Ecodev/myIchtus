import {gql} from 'apollo-angular';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';
import {bookableMetaFragment} from '../../bookables/services/bookable.queries';

export const bookingMetaFragment = gql`
    fragment BookingMeta on Booking {
        id
        destination
        startComment
        startDate
        endComment
        endDate
        estimatedEndDate
        creationDate
        updateDate
        participantCount
        status
        remarks
        internalRemarks
        owner {
            id
            ...UserMeta
            sex
        }
        creator {
            id
            name
        }
    }
    ${userMetaFragment}
`;

export const bookingsQuery = gql`
    query Bookings($filter: BookingFilter, $sorting: [BookingSorting!], $pagination: PaginationInput) {
        bookings(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...BookingMeta
                bookable {
                    id
                    name
                    code
                    image {
                        id
                    }
                }
            }
            pageSize
            pageIndex
            length
            totalParticipantCount
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookingMetaFragment}
`;

export const bookingsWithOwnerBalanceQuery = gql`
    query BookingsWithOwnerBalance($filter: BookingFilter, $sorting: [BookingSorting!], $pagination: PaginationInput) {
        bookings(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...BookingMeta
                bookable {
                    id
                    name
                    code
                    image {
                        id
                    }
                }
                owner {
                    id
                    creationDate
                    account {
                        id
                        balance
                    }
                }
            }
            pageSize
            pageIndex
            length
            totalParticipantCount
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookingMetaFragment}
`;

export const pricedBookingsQuery = gql`
    query PricedBookings($filter: BookingFilter, $sorting: [BookingSorting!], $pagination: PaginationInput) {
        bookings(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...BookingMeta
                periodicPrice
                bookable {
                    id
                    name
                    bookingType
                    initialPrice
                    sharedBookings {
                        id
                        owner {
                            id
                            name
                        }
                    }
                    bookableTags {
                        id
                    }
                }
            }
            pageSize
            pageIndex
            length
            totalParticipantCount
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookingMetaFragment}
`;

export const bookingQuery = gql`
    query Booking($id: BookingID!) {
        booking(id: $id) {
            ...BookingMeta
            bookable {
                id
                name
                image {
                    id
                }
                ...BookableMeta
            }
            creationDate
            creator {
                ...UserMeta
            }
            updateDate
            updater {
                ...UserMeta
            }
            permissions {
                ...PermissionsRUD
            }
        }
    }
    ${bookableMetaFragment}
    ${bookingMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const createBooking = gql`
    mutation CreateBooking($input: BookingInput!) {
        createBooking(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateBooking = gql`
    mutation UpdateBooking($id: BookingID!, $input: BookingPartialInput!) {
        updateBooking(id: $id, input: $input) {
            id
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteBookings = gql`
    mutation DeleteBookings($ids: [BookingID!]!) {
        deleteBookings(ids: $ids)
    }
`;

export const terminateBooking = gql`
    mutation TerminateBooking($id: BookingID!, $comment: String) {
        terminateBooking(id: $id, comment: $comment) {
            id
            endDate
        }
    }
`;
