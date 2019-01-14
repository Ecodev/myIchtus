import gql from 'graphql-tag';
import { userMetaFragment } from '../../../shared/queries/fragments';

// Fragment for single display usage. Too much data for listings, and unused fields for mutations.
export const userFieldsFragment = gql`
    fragment userFields on User {
        id
        login
        firstName
        lastName
        name
        email
        birthday
        phone
        postcode
        street
        locality
        familyRelationship
        country {
            id
            name
        }
        creator {
            ...userMeta
        }
        updateDate
        updater {
            ...userMeta
        }
    }
`;

export const usersQuery = gql`
    query Users($filter: UserFilter, $sorting: [UserSorting!], $pagination: PaginationInput) {
        users(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                login
                name
                familyRelationship
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const userQuery = gql`
    query User($id: UserID!) {
        user(id: $id) {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const updateUserMutation = gql`
    mutation UpdateUser($id: UserID!, $input: UserPartialInput!) {
        updateUser(id:$id, input:$input) {
            id
            updateDate
            updater {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const createUserMutation = gql`
    mutation CreateUser ($input: UserInput!) {
        createUser (input: $input) {
            id
            name
            creator {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const logoutMutation = gql`
    mutation Logout {
        logout
    }`;

export const loginMutation = gql`
    mutation Login($login: Login!, $password: String!) {
        login(login:$login, password:$password) {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const currentUserForProfileQuery = gql`
    query CurrentUserForProfile {
        viewer {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

