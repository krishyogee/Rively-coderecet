import { gql } from '@apollo/client';

export const GET_COMPANY_UPDATES = gql`
  query GetCompanyUpdates {
    getCompanyUpdates {
      CompanyUpdateUID
      Title
      Description
      UpdateCategory
      UpdateType
      SourceType
      SourceURL
      PostedAt
      CreatedAt
      ActionPoint
      TrackedCompanyUID
      Domain
      IsSaved
    }
  }
`;

export const SAVE_OR_UNSAVE_COMPANY_UPDATE = gql`
  mutation SaveOrUnsaveCompanyUpdate($input: saveOrUnsaveCompanyUpdateInput!) {
    saveOrUnsaveCompanyUpdate(input: $input) {
      companyUpdateUID
      isSaved
    }
  }
`;




