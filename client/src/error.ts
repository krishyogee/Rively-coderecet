// import { z } from "zod"

export interface FieldError {
  field: string;
  message: string;
}

export interface GraphQLError {
  message: string;
  path?: string[];
  extensions?: {
    code: string;
    type: 'INLINE' | 'GLOBAL' | 'TOAST';
    userError?: boolean;
    userPresentableMessage?: string;
    fields?: FieldError[];
    meta?: Record<string, any>;
  };
}

export interface GraphQLResponse<T = any> {
  data: T | null;
  errors?: GraphQLError[];
}
