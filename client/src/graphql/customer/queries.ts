import { gql } from '@apollo/client';

export const GET_CUSTOMER = gql`
  query getCustomer {
    getCustomer {
      Id
      Email
      OnboardingCompletion
      IsVerified
    }
  }
`;
