import { ApolloClient, useApolloClient } from '@apollo/client';
import React from 'react';
import { StateCreator } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GET_ALL_DEPARTMENTS } from '@/graphql/departments/mutation';

export interface Department {
  departmentUID: string;
  name: string;
}

interface DepartmentState {
  departments: Department[];
  getAllDepartments: (client: ApolloClient<object>) => Promise<void>;
}

const departmentStoreCreator: StateCreator<DepartmentState, [], []> = (set) => ({
  departments: [],

  getAllDepartments: async (client: ApolloClient<object>) => {
    try {
      const { data } = await client.query({
        query: GET_ALL_DEPARTMENTS,
        fetchPolicy: 'no-cache',
      });
      console.log('Departments Response:', data);
      set({ departments: data?.getDepartments || [] });
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  },
});

export const useDepartmentStore = create<DepartmentState>()(
  persist(departmentStoreCreator, {
    name: 'departments-storage',
  })
);

export function useDepartments(): DepartmentState {
  const store = useDepartmentStore();
  const client = useApolloClient();

  React.useEffect(() => {
    if (store.departments.length === 0) {
      store.getAllDepartments(client);
    }
  }, []);

  return store;
}