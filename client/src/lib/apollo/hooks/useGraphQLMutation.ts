import { useMutation, DocumentNode } from '@apollo/client';

export function useGraphQLMutation<T>(
  mutation: DocumentNode,
  options?: object
) {
  const [mutate, { data, loading, error }] = useMutation<T>(mutation, {
    ...options,
    onError: (error) => {
      // Custom error handling
      console.error('Mutation Error:', error);
    },
  });

  return { mutate, data, loading, error };
}
