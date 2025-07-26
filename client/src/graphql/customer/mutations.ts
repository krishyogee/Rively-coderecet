import { gql } from '@apollo/client';

export interface UpdateCustomerAndUserInput {
  name: string;
  domain: string;
  role: string;
}


export const UPDATE_CUSTOMER_AND_USER = gql`
  mutation UpdateCustomerAndUser($input: UpdateCustomerAndUserInput!) {
    updateCustomerAndUser(input: $input) {
      Email
      Domain
    }
  }
`;