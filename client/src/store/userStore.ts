// client/src/store/usersStore.ts
import { User } from '@/gql/generated';
import { GET_ACCOUNT_USERS } from '@/graphql/user/mutations';
import { ApolloClient, useApolloClient } from '@apollo/client';
import React from 'react';
import { StateCreator } from 'zustand';
import { create } from 'zustand';

import { persist } from 'zustand/middleware';
// import { User } from '@/types'; // Adjust the import based on your User type definition

interface UsersState {
  users: User[]; // Array to hold user data
  getAllAccountUsers: (client: ApolloClient<object>) => Promise<void>; // Method to fetch all users
}

const userStoreCreator: StateCreator<UsersState, [], []> = (set) => ({
  users: [], // Initial state for users

  // Method to fetch all account users
  getAllAccountUsers: async (client: ApolloClient<object>) => {
    try {
      const { data } = await client.query({
        query: GET_ACCOUNT_USERS,
        fetchPolicy: 'no-cache',
      });
      console.log('Response  data', data);
      set({ users: data?.getAccountUsers }); // Update the state with fetched users
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  },
});

export const useUserStore = create<UsersState>()(
  persist(userStoreCreator, {
    name: 'users-storage', // Name for the storage
    // You can add more options here if needed
  })
);

export function useUsers(): UsersState {
  const store = useUserStore();
  const client = useApolloClient();

  React.useEffect(() => {
    console.log('store', store);
    if (store.users.length === 0) {
      store.getAllAccountUsers(client);
    }
  }, []);

  return store;
}
