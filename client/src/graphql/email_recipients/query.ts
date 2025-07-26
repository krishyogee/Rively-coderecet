import { gql } from '@apollo/client';

export const GET_ALL_EMAIL_RECIPIENTS = gql`
  query GetAllEmailRecipients {
    getAllEmailRecipients {
      id
      emailRecipientUID
      name
      email
      isActive
      departmentUID
      customerUID
      createdAt
    }
  }
`;
