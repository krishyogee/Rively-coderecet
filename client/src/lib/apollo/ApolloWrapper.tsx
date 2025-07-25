'use client';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
// import { createUploadLink } from 'apollo-upload-client'; // Import createUploadLink
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [client] = useState(() => {
    const uploadLink = createUploadLink({
      // Use createUploadLink instead of createHttpLink
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    });

    const authLink = setContext(async (_, { headers }) => {
      // Get token from clerk session
      const token = await getToken();
      console.info('token', token);
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });
    const link = ApolloLink.from([authLink, uploadLink]);

    return new ApolloClient({
      link: link, // Concatenate authLink with uploadLink
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
