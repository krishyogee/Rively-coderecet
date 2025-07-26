import { gql } from '@apollo/client';

export interface SignupInput {
  email: string;
  password: string;
}

export interface VerifyCustomerInput {
  token: string;
}

export const SIGNUP_MUTATION = gql`
  mutation signup($input: SignupInput!) {
    signup(input: $input) {
      userId
      customerUID
      clerkId
    }
  }
`;

export const VERIFY_CUSTOMER = gql`
  mutation verifyCustomer($input: VerifyCustomerInput!) {
    verifyCustomer(input: $input) {
      success
      token
      OnboardingCompletion
    }
  }
`;
