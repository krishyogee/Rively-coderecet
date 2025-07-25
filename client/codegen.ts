import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    '../api/graph/schema.graphqls',
    '../api/graph/user.schema.graphqls',
    '../api/graph/customer.schema.graphqls',
    '../api/graph/auth.schema.graphqls'
  ],
  generates: {
    './src/gql/generated.ts': {
      plugins: ['typescript', 'typescript-resolvers', 'typescript-operations'],
      config: {
        useIndexSignature: true,
        enumsAsTypes: true,
        strictScalars: true,
        scalars: {
          Date: 'string',
          DateTime: 'string',
          JSON: 'Record<string, any>',
          Upload: 'File',
          UUID: 'string',
        },
        maybeValue: 'T | null',
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
        },
      },
    },
  },
  // hooks: {
  //   afterAllFilesWrite: ['prettier --write']
  // }
};

export default config;
