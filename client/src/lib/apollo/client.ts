// import {
//   ApolloClient,
//   ApolloLink,
//   InMemoryCache,
//   createHttpLink,
//   from,
//   Observable,
// } from '@apollo/client';
// import { onError } from '@apollo/client/link/error';
// import { setContext } from '@apollo/client/link/context';
// import { useAuth } from '@clerk/nextjs';
// import { GraphQLError } from 'graphql';

// // HTTP Link
// const httpLink = createHttpLink({
//   uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
// });

// // Auth Interceptor with Clerk
// const authLink = setContext(async (_, { headers }) => {
//   try {
//     const { getToken } = useAuth();
//     const token = await getToken();

//     return {
//       headers: {
//         ...headers,
//         authorization: token ? `Bearer ${token}` : '',
//       },
//     };
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return {
//       headers,
//     };
//   }
// });

// // Error Interceptor with token refresh
// const errorLink = onError(
//   ({ graphQLErrors, networkError, operation, forward }) => {
//     if (graphQLErrors) {
//       // Handle multiple GraphQL errors
//       const authError = graphQLErrors.find(
//         (error) =>
//           error.message.includes('UNAUTHENTICATED') ||
//           error.message.includes('invalid_token')
//       );

//       if (authError) {
//         // Return a new observable for auth errors
//         return new Observable((observer) => {
//           // Async function to handle token refresh
//           (async () => {
//             try {
//               const { getToken } = useAuth();
//               const newToken = await getToken({ skipCache: true });

//               if (!newToken) {
//                 window.location.href = '/login';
//                 observer.complete();
//                 return;
//               }

//               // Retry the failed request with new token
//               const oldHeaders = operation.getContext().headers;
//               operation.setContext({
//                 headers: {
//                   ...oldHeaders,
//                   authorization: `Bearer ${newToken}`,
//                 },
//               });

//               // Retry operation and forward results to observer
//               forward(operation).subscribe({
//                 next: observer.next.bind(observer),
//                 error: observer.error.bind(observer),
//                 complete: observer.complete.bind(observer),
//               });
//             } catch (refreshError) {
//               console.error('Token refresh failed:', refreshError);
//               window.location.href = '/login';
//               observer.complete();
//             }
//           })();
//         });
//       }

//       // Log all GraphQL errors
//       graphQLErrors.forEach(({ message, locations, path }) => {
//         console.error(
//           `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
//         );
//       });
//     }

//     if (networkError) {
//       console.error(`[Network error]:`, networkError);
//       if ('statusCode' in networkError && networkError.statusCode === 401) {
//         window.location.href = '/login';
//       }
//     }

//     // If no auth error, continue with the error
//     return forward(operation);
//   }
// );

// // Response Interceptor
// const responseLink = new ApolloLink((operation, forward) => {
//   return forward(operation).map((response) => {
//     return response;
//   });
// });

// // Apollo Client instance
// export const apolloClient = new ApolloClient({
//   link: from([authLink, errorLink, responseLink, httpLink]),
//   cache: new InMemoryCache({
//     typePolicies: {
//       Query: {
//         fields: {},
//       },
//     },
//   }),
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'cache-and-network',
//       errorPolicy: 'all',
//     },
//     query: {
//       fetchPolicy: 'network-only',
//       errorPolicy: 'all',
//     },
//     mutate: {
//       errorPolicy: 'all',
//     },
//   },
// });

// // Utility function to reset Apollo Client cache
// export const resetApolloCache = () => {
//   apolloClient.resetStore();
// };

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  from,
  Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from "apollo-upload-client";
import { useAuth } from '@clerk/nextjs';
import { GraphQLError } from 'graphql';

// Upload Link for handling file uploads
const uploadLink = createUploadLink({
  uri: "http://localhost:8080/graphql", // Your GraphQL endpoint
});

// Auth Interceptor with Clerk
const authLink = setContext(async (_, { headers }) => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting token:', error);
    return {
      headers,
    };
  }
});

// Error Interceptor with token refresh
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      const authError = graphQLErrors.find(
        (error) =>
          error.message.includes('UNAUTHENTICATED') ||
          error.message.includes('invalid_token')
      );

      if (authError) {
        return new Observable((observer) => {
          (async () => {
            try {
              const { getToken } = useAuth();
              const newToken = await getToken({ skipCache: true });

              if (!newToken) {
                window.location.href = '/login';
                observer.complete();
                return;
              }

              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newToken}`,
                },
              });

              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              window.location.href = '/login';
              observer.complete();
            }
          })();
        });
      }

      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]:`, networkError);
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        window.location.href = '/login';
      }
    }

    return forward(operation);
  }
);

// Response Interceptor
const responseLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    return response;
  });
});

// const apolloCache = new InMemoryCache(); //added

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([authLink, errorLink, responseLink, uploadLink]), // Replaced httpLink with uploadLink
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {},
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Utility function to reset Apollo Client cache
export const resetApolloCache = () => {
  apolloClient.resetStore();
};
