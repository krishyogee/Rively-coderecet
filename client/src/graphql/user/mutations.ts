import { gql } from '@apollo/client';

export const GET_ACCOUNT_USERS = gql`
  query getAccountUsers {
    getAccountUsers {
      id
      userUID
      name
      email
      isVerified
      customerUID
    }
  }
`;
