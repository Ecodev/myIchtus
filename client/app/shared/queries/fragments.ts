import gql from 'graphql-tag';

export const userMetaFragment = gql`
fragment userMeta on User {
    id
    name
}`;

export const permissionsFragment = gql`
fragment permissions on Permissions {
    read
    update
    delete
}`;