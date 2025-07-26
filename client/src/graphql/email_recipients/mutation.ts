import { gql } from '@apollo/client';

export const INVITE_EMAIL_RECIPIENT = gql`
  mutation InviteEmailRecipient($input: InviteEmailRecipientInput!) {
    inviteEmailRecipient(input: $input) {
      inviteToken
    }
  }
`;

export const CREATE_EMAIL_RECIPIENT = gql`
  mutation CreateEmailRecipient($input: CreateEmailRecipientInput!) {
    createEmailRecipient(input: $input) {
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

export const VALIDATE_INVITE = gql`
  query ValidateInvite($input: ValidateInviteInput!) {
    validateInvite(input: $input) {
      departmentUID
      isValid
      customerUID
      expiresAt
      createdAt
    }
  }
`;

export const UPDATE_EMAIL_RECIPIENT = gql`
  mutation UpdateEmailRecipient($input: UpdateEmailRecipientInput!) {
    updateEmailRecipient(input: $input) {
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

export const DELETE_EMAIL_RECIPIENT = gql`
  mutation DeleteEmailRecipient($input: DeleteEmailRecipientInput!) {
    deleteEmailRecipeint(input: $input) {
      success
    }
  }
`;