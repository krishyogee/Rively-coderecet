import { gql } from '@apollo/client';

export interface CreateTrackedCompanyInput {
  name: string;
  domain: string;
  type: string;
  interests: string[];
}

export interface TrackedCompany {
  Name: string;
  Domain: string;
  Type: string;
  Interests: string[];
  CustomerUID: string;
  TrackedCompanyUID: string;
  IsActive: boolean;
}

export const CREATE_TRACKED_COMPANIES = gql`
  mutation CreateTrackedCompany($input: [CreateTrackedCompanyInput!]!) {
    createTrackedCompany(input: $input) {
      Name
      Domain
      Type
      Interests
      CustomerUID
      TrackedCompanyUID
    }
  }
`;

export interface DeleteTrackedCompanyInput {
  trackedCompanyUID: string;
}

export const DELETE_TRACKED_COMPANIES = gql`
  mutation DeleteTrackedCompany($input: DeleteTrackedCompanyInput!) {
    deleteTrackedCompany(input: $input)
  }
`;

export interface UpdateTrackedCompanyInput {
  trackedCompanyUID: string;
  type?: string;
  interests?: string[];
  isActive?: boolean;
}

export const UPDATE_TRACKED_COMPANIES = gql`
  mutation UpdateTrackedCompany($input: UpdateTrackedCompanyInput!) {
    updateTrackedCompany(input: $input) {
      Name
      Domain
      Type
      Interests
      CustomerUID
      TrackedCompanyUID
      IsActive
    }
  }
`;


export const GET_TRACKED_COMPANIES = gql`
  query GetTrackedCompanies {
    getTrackedCompanies {
      Name
      Domain
      Type
      Interests
      CustomerUID
      IsActive
      TrackedCompanyUID
    }
  }
`;    

