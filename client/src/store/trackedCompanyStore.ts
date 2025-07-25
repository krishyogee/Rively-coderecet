import { TrackedCompany, GET_TRACKED_COMPANIES, CreateTrackedCompanyInput, CREATE_TRACKED_COMPANIES, DeleteTrackedCompanyInput, DELETE_TRACKED_COMPANIES, UpdateTrackedCompanyInput, UPDATE_TRACKED_COMPANIES } from '@/graphql/tracked-company/mutation';
import { ApolloClient, useApolloClient } from '@apollo/client';
import React from 'react';
import { StateCreator } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TrackedCompanyState {
  trackedCompanies: TrackedCompany[];
  getAllTrackedCompanies: (client: ApolloClient<object>) => Promise<void>;
  createTrackedCompany: (client: ApolloClient<object>, input: CreateTrackedCompanyInput[]) => Promise<void>;
  updateTrackedCompany: (client: ApolloClient<object>, input: UpdateTrackedCompanyInput) => Promise<void>;
  deleteTrackedCompany: (client: ApolloClient<object>, input: DeleteTrackedCompanyInput) => Promise<void>;
}

const trackedCompanyStoreCreator: StateCreator<TrackedCompanyState, [], []> = (set, get) => ({
  trackedCompanies: [],

  getAllTrackedCompanies: async (client: ApolloClient<object>) => {
    try {
      const { data } = await client.query({
        query: GET_TRACKED_COMPANIES,
        fetchPolicy: 'no-cache',
      });
      console.log('Fetched tracked companies:', data?.getTrackedCompanies);
      
      // Remove duplicates based on TrackedCompanyUID
      const companies = data?.getTrackedCompanies || [];
      const uniqueCompanies = companies.filter((company: TrackedCompany, index: number, self: TrackedCompany[]) => 
        index === self.findIndex(c => c.TrackedCompanyUID === company.TrackedCompanyUID)
      );
      
      set({ trackedCompanies: uniqueCompanies });
    } catch (error) {
      console.error('Failed to fetch tracked companies:', error);
    }
  },

  createTrackedCompany: async (client: ApolloClient<object>, input: CreateTrackedCompanyInput[]) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_TRACKED_COMPANIES,
        variables: { input },
      });
      console.log('Created company data:', data);
      
      const newCompanies = data?.createTrackedCompany || [];
      set((state) => {
        // Ensure no duplicates when adding new companies
        const existingUIDs = new Set(state.trackedCompanies.map(c => c.TrackedCompanyUID));
        const uniqueNewCompanies = newCompanies.filter((company: TrackedCompany) => 
          !existingUIDs.has(company.TrackedCompanyUID)
        );
        
        return {
          trackedCompanies: [...state.trackedCompanies, ...uniqueNewCompanies],
        };
      });
    } catch (error) {
      console.error('Failed to create tracked company:', error);
    }
  },

  updateTrackedCompany: async (client: ApolloClient<object>, input: UpdateTrackedCompanyInput) => {
    try {
      // First, optimistically update the state
      set((state) => {
        const updatedCompanies = state.trackedCompanies.map((company) =>
          company.TrackedCompanyUID === input.trackedCompanyUID
            ? { ...company, IsActive: input.isActive ?? company.IsActive }
            : company
        );
        return { trackedCompanies: updatedCompanies };
      });

      // Then make the API call
      const { data } = await client.mutate({
        mutation: UPDATE_TRACKED_COMPANIES,
        variables: { input },
      });
      
      console.log('Update mutation response:', data);
      
      if (!data?.updateTrackedCompany) {
        console.error('No data returned from updateTrackedCompany mutation');
        // Revert the optimistic update by refetching
        await get().getAllTrackedCompanies(client);
        return;
      }

      // Update with the actual response from the server
      set((state) => {
        const updatedCompanies = state.trackedCompanies.map((company) =>
          company.TrackedCompanyUID === input.trackedCompanyUID
            ? { ...company, ...data.updateTrackedCompany }
            : company
        );
        
        // Remove any potential duplicates
        const uniqueCompanies = updatedCompanies.filter((company, index, self) => 
          index === self.findIndex(c => c.TrackedCompanyUID === company.TrackedCompanyUID)
        );
        
        console.log('Updated tracked companies state:', uniqueCompanies);
        return { trackedCompanies: uniqueCompanies };
      });
    } catch (error) {
      console.error('Failed to update tracked company:', error);
      // Revert the optimistic update by refetching
      await get().getAllTrackedCompanies(client);
    }
  },

  deleteTrackedCompany: async (client: ApolloClient<object>, input: DeleteTrackedCompanyInput) => {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_TRACKED_COMPANIES,
        variables: { input },
      });
      console.log('Deleted company data:', data);
      
      set((state) => {
        const filteredCompanies = state.trackedCompanies.filter(
          (company) => company.TrackedCompanyUID !== input.trackedCompanyUID
        );
        console.log('Filtered tracked companies after deletion:', filteredCompanies);
        return { trackedCompanies: filteredCompanies };
      });
    } catch (error) {
      console.error('Failed to delete tracked company:', error);
    }
  },
});

export const useTrackedCompanyStore = create<TrackedCompanyState>()(
  persist(trackedCompanyStoreCreator, {
    name: 'tracked-companies-storage',
  })
);

export function useTrackedCompanies(): TrackedCompanyState {
  const store = useTrackedCompanyStore();
  const client = useApolloClient();

  React.useEffect(() => {
    console.log('Current tracked companies:', store.trackedCompanies);
    if (store.trackedCompanies.length === 0) {
      store.getAllTrackedCompanies(client);
    }
  }, [store.getAllTrackedCompanies, client]);

  return store;
}