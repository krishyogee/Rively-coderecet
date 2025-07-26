import { gql } from '@apollo/client';

export const GET_ALL_DEPARTMENTS = gql`
  query GetAllDepartments {
    getDepartments {
      departmentUID
      name
    }
  }
`;

