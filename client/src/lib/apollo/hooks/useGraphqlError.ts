// import { useToast } from "@/components/ui/use-toast"
import { useToast } from '@/hooks/use-toast';

import { UseFormSetError } from 'react-hook-form';
import { useState } from 'react';
import { GraphQLError } from 'graphql/error/GraphQLError';

interface UseGraphQLErrorOptions {
  setFormError?: UseFormSetError<any>;
}

interface UseGraphQLErrorResult {
  globalError: string | null;
  handleGraphQLErrors: (errors: GraphQLError[]) => void;
  clearErrors: () => void;
}

interface GraphQLErrorExtension {
  type: 'INLINE' | 'GLOBAL' | 'TOAST';
  fields?: { field: string; message: string }[];
  userPresentableMessage?: string;
}

// Type guard to check if the extensions object is of type GraphQLErrorExtension
function isGraphQLErrorExtension(
  extension: unknown
): extension is GraphQLErrorExtension {
  return (
    typeof extension === 'object' &&
    extension !== null &&
    'type' in extension &&
    (extension as any).type in { INLINE: true, GLOBAL: true, TOAST: true }
  );
}

export function useGraphQLError({
  setFormError,
}: UseGraphQLErrorOptions = {}): UseGraphQLErrorResult {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGraphQLErrors = (errors: GraphQLError[]) => {
    errors.forEach((error) => {
      const extension = error.extensions as unknown;

      if (!isGraphQLErrorExtension(extension)) return;

      switch (extension.type) {
        case 'INLINE':
          if (
            extension.fields &&
            Array.isArray(extension.fields) &&
            setFormError
          ) {
            extension.fields.forEach((field) => {
              setFormError(field.field as any, {
                type: 'manual',
                message: field.message,
              });
            });
          }
          break;

        case 'GLOBAL':
          setGlobalError(extension.userPresentableMessage || error.message);
          break;

        case 'TOAST':
          toast({
            variant: 'destructive',
            title: 'Error',
            description: extension.userPresentableMessage || error.message,
          });
          break;
      }
    });
  };

  const clearErrors = () => {
    setGlobalError(null);
  };

  return {
    globalError,
    handleGraphQLErrors,
    clearErrors,
  };
}
