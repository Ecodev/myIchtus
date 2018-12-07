import gql from 'graphql-tag';
import { userMetaFragment } from '../../../shared/queries/fragments';

export const bookableMetaFragment = gql`
    fragment bookableMeta on Bookable {
        id
        name
        description
    }
`;

export const bookablesQuery = gql`
    query Bookables($filter: BookableFilter, $sorting: [BookableSorting!], $pagination: PaginationInput) {
        bookables(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...bookableMeta
            }
            pageSize
            pageIndex
            length
        }
    }
${bookableMetaFragment}`;

export const bookableQuery = gql`
    query Bookable($id: BookableID!) {
        bookable(id: $id) {
            id
            ...bookableMeta
            creator {
                ...userMeta
            }
            updateDate
            updater {
                ...userMeta
            }
        }
    }
${bookableMetaFragment}
${userMetaFragment}`;

export const createBookableMutation = gql`
    mutation CreateBookable($input: BookableInput!) {
        createBookable(input: $input) {
            id
            creator {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateBookableMutation = gql`
    mutation UpdateBookable($id: BookableID!, $input: BookablePartialInput!) {
        updateBookable(id:$id, input:$input) {
            id
            updateDate
            updater {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;