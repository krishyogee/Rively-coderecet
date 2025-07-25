import { ApolloClient, useApolloClient } from '@apollo/client';
import React from 'react';
import { StateCreator } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GET_COMPANY_UPDATES, SAVE_OR_UNSAVE_COMPANY_UPDATE } from '@/graphql/company_updates/mutation';

export interface CompanyUpdate {
  CompanyUpdateUID: string;
  Title: string;
  Description: string;
  UpdateCategory: string;
  UpdateType: string;
  SourceType: string;
  SourceURL: string;
  PostedAt: string;
  CreatedAt: string;
  ActionPoint: string;
  TrackedCompanyUID: string;
  Domain: string;
  IsSaved: boolean;
}

interface CompanyUpdateState {
  companyUpdates: CompanyUpdate[];
  getAllCompanyUpdates: (client: ApolloClient<object>) => Promise<void>;
  saveOrUnsaveCompanyUpdate: (client: ApolloClient<object>, companyUpdateUID: string, shouldSave: boolean) => Promise<void>;
}

const companyUpdateStoreCreator: StateCreator<CompanyUpdateState, [], []> = (set, get) => ({
  companyUpdates: [],

  getAllCompanyUpdates: async (client: ApolloClient<object>) => {
    try {
      const { data } = await client.query({
        query: GET_COMPANY_UPDATES,
        fetchPolicy: 'no-cache',
      });
      console.log('Company Updates Response:', data);
      set({ companyUpdates: data?.getCompanyUpdates || [] });
    } catch (error) {
      console.error('Failed to fetch company updates:', error);
    }
  },

  saveOrUnsaveCompanyUpdate: async (client: ApolloClient<object>, companyUpdateUID: string, shouldSave: boolean) => {
    try {
      const { data } = await client.mutate({
        mutation: SAVE_OR_UNSAVE_COMPANY_UPDATE,
        variables: {
          input: {
            companyUpdateUID: companyUpdateUID,
            isSaved: shouldSave,
          },
        },
      });

      // Update the local state to reflect the change
      if (data?.saveOrUnsaveCompanyUpdate) {
        const currentUpdates = get().companyUpdates;
        const updatedUpdates = currentUpdates.map(update =>
          update.CompanyUpdateUID === companyUpdateUID
            ? { ...update, IsSaved: data.saveOrUnsaveCompanyUpdate.isSaved }
            : update
        );
        set({ companyUpdates: updatedUpdates });
      }
    } catch (error) {
      console.error('Failed to save/unsave company update:', error);
    }
  },
});

export const useCompanyUpdateStore = create<CompanyUpdateState>()(
  persist(companyUpdateStoreCreator, {
    name: 'company-updates-storage',
  })
);

export function useCompanyUpdates(): CompanyUpdateState {
  const store = useCompanyUpdateStore();
  const client = useApolloClient();

  React.useEffect(() => {
    if (store.companyUpdates.length === 0) {
      store.getAllCompanyUpdates(client);
    }
  }, []);

  return store;
}
