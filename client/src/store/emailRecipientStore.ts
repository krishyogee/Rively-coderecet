import { ApolloClient, useApolloClient } from '@apollo/client';
import { StateCreator } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  INVITE_EMAIL_RECIPIENT, 
  CREATE_EMAIL_RECIPIENT, 
  UPDATE_EMAIL_RECIPIENT,
  DELETE_EMAIL_RECIPIENT,
  VALIDATE_INVITE 
} from '@/graphql/email_recipients/mutation';
import { GET_ALL_EMAIL_RECIPIENTS } from '@/graphql/email_recipients/query';

export interface EmailRecipient {
  id: number;
  emailRecipientUID: string;
  name: string;
  email: string;
  isActive: boolean;
  departmentUID: string;
  customerUID: string;
  createdAt: string;
}

export interface InviteData {
  departmentUID: string;
  isValid: boolean;
  customerUID: string;
  expiresAt: string;
  createdAt: string;
}

export interface InviteEmailRecipientInput {
  departmentUID: string;
}

export interface CreateEmailRecipientInput {
  name: string;
  email: string;
  departmentUID: string;
}

export interface ValidateInviteInput {
  token: string;
}

export interface UpdateEmailRecipientInput {
  emailRecipientUID: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  departmentUID?: string;
}

export interface DeleteEmailRecipientInput {
  emailRecipientUID: string;
}

interface EmailRecipientState {
  emailRecipients: EmailRecipient[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getAllEmailRecipients: (client: ApolloClient<object>) => Promise<EmailRecipient[]>;
  inviteEmailRecipient: (client: ApolloClient<object>, input: InviteEmailRecipientInput) => Promise<string | null>;
  createEmailRecipient: (client: ApolloClient<object>, input: CreateEmailRecipientInput) => Promise<EmailRecipient | null>;
  updateEmailRecipient: (client: ApolloClient<object>, input: UpdateEmailRecipientInput) => Promise<EmailRecipient | null>;
  deleteEmailRecipient: (client: ApolloClient<object>, input: DeleteEmailRecipientInput) => Promise<boolean>;
  validateInvite: (client: ApolloClient<object>, input: ValidateInviteInput) => Promise<InviteData | null>;
  clearError: () => void;
}

interface EmailRecipientActions {
  emailRecipients: EmailRecipient[];
  isLoading: boolean;
  error: string | null;
  
  // Actions (without client parameter)
  getAllEmailRecipients: () => Promise<EmailRecipient[]>;
  inviteEmailRecipient: (input: InviteEmailRecipientInput) => Promise<string | null>;
  createEmailRecipient: (input: CreateEmailRecipientInput) => Promise<EmailRecipient | null>;
  updateEmailRecipient: (input: UpdateEmailRecipientInput) => Promise<EmailRecipient | null>;
  deleteEmailRecipient: (input: DeleteEmailRecipientInput) => Promise<boolean>;
  validateInvite: (input: ValidateInviteInput) => Promise<InviteData | null>;
  clearError: () => void;
}

const emailRecipientStoreCreator: StateCreator<EmailRecipientState, [], []> = (set, get) => ({
  emailRecipients: [],
  isLoading: false,
  error: null,

  getAllEmailRecipients: async (client: ApolloClient<object>) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.query({
        query: GET_ALL_EMAIL_RECIPIENTS,
        fetchPolicy: 'network-only',
      });
      
      const recipients = data?.getAllEmailRecipients || [];
      set({ emailRecipients: recipients, isLoading: false });
      return recipients;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch email recipients';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to fetch email recipients:', error);
      return [];
    }
  },

  inviteEmailRecipient: async (client: ApolloClient<object>, input: InviteEmailRecipientInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.mutate({
        mutation: INVITE_EMAIL_RECIPIENT,
        variables: { input },
      });
      
      set({ isLoading: false });
      return data?.inviteEmailRecipient?.inviteToken || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invite link';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to invite email recipient:', error);
      return null;
    }
  },

  createEmailRecipient: async (client: ApolloClient<object>, input: CreateEmailRecipientInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.mutate({
        mutation: CREATE_EMAIL_RECIPIENT,
        variables: { input },
      });
      
      const newRecipient = data?.createEmailRecipient;
      if (newRecipient) {
        set(state => ({
          emailRecipients: [...state.emailRecipients, newRecipient],
          isLoading: false
        }));
        return newRecipient;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create email recipient';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to create email recipient:', error);
      return null;
    }
  },

  updateEmailRecipient: async (client: ApolloClient<object>, input: UpdateEmailRecipientInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_EMAIL_RECIPIENT,
        variables: { input },
      });
      
      const updatedRecipient = data?.updateEmailRecipient;
      if (updatedRecipient) {
        set(state => ({
          emailRecipients: state.emailRecipients.map(recipient =>
            recipient.emailRecipientUID === input.emailRecipientUID 
              ? updatedRecipient 
              : recipient
          ),
          isLoading: false
        }));
        return updatedRecipient;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update email recipient';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to update email recipient:', error);
      return null;
    }
  },

  deleteEmailRecipient: async (client: ApolloClient<object>, input: DeleteEmailRecipientInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.mutate({
        mutation: DELETE_EMAIL_RECIPIENT,
        variables: { input },
      });
      
      const success = data?.deleteEmailRecipeint?.success;
      if (success) {
        set(state => ({
          emailRecipients: state.emailRecipients.filter(recipient =>
            recipient.emailRecipientUID !== input.emailRecipientUID
          ),
          isLoading: false
        }));
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete email recipient';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to delete email recipient:', error);
      return false;
    }
  },

  validateInvite: async (client: ApolloClient<object>, input: ValidateInviteInput) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await client.query({
        query: VALIDATE_INVITE,
        variables: { input },
        fetchPolicy: 'no-cache',
      });
      
      set({ isLoading: false });
      return data?.validateInvite || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate invite';
      set({ isLoading: false, error: errorMessage });
      console.error('Failed to validate invite:', error);
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },
});

export const useEmailRecipientStore = create<EmailRecipientState>()(
  persist(emailRecipientStoreCreator, {
    name: 'email-recipients-storage',
    partialize: (state) => ({ emailRecipients: state.emailRecipients }),
  })
);

export function useEmailRecipients(): EmailRecipientActions {
  const {
    emailRecipients,
    isLoading,
    error,
    clearError,
    getAllEmailRecipients: storeGetAll,
    inviteEmailRecipient: storeInvite,
    createEmailRecipient: storeCreate,
    updateEmailRecipient: storeUpdate,
    deleteEmailRecipient: storeDelete,
    validateInvite: storeValidate,
  } = useEmailRecipientStore();
  
  const client = useApolloClient();

  return {
    emailRecipients,
    isLoading,
    error,
    clearError,
    getAllEmailRecipients: () => storeGetAll(client),
    inviteEmailRecipient: (input: InviteEmailRecipientInput) => storeInvite(client, input),
    createEmailRecipient: (input: CreateEmailRecipientInput) => storeCreate(client, input),
    updateEmailRecipient: (input: UpdateEmailRecipientInput) => storeUpdate(client, input),
    deleteEmailRecipient: (input: DeleteEmailRecipientInput) => storeDelete(client, input),
    validateInvite: (input: ValidateInviteInput) => storeValidate(client, input),
  };
}