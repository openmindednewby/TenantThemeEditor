import { defineConfig } from 'orval';

/**
 * Orval v8 configuration for TenantThemeEditor API hooks.
 *
 * Generates React Query hooks + TypeScript interfaces from OpenAPI specs.
 * Currently uses the IdentityService spec for tenant theme endpoints.
 *
 * Usage:
 *   npm run api:generate    -- regenerate all hooks
 */

const IDENTITY_MUTATOR = './src/api/mutators/identityMutator.ts';

const sharedOutput = {
  client: 'react-query' as const,
  mode: 'tags-split' as const,
  clean: true,
  prettier: true,
};

const sharedOverride = {
  useTypeOverInterfaces: false,
  query: {
    useQuery: true,
    useMutation: true,
    signal: true,
  },
};

export default defineConfig({
  identity: {
    input: {
      target: './src/api/swagger/identity.json',
      validation: false,
    },
    output: {
      ...sharedOutput,
      target: './src/api/generated/identity/index.ts',
      schemas: './src/api/generated/identity/models',
      override: {
        ...sharedOverride,
        mutator: {
          path: IDENTITY_MUTATOR,
          name: 'identityInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        { command: 'npx prettier --write ./src/api/generated/identity' },
        { command: 'echo "Orval: Identity hooks generated"' },
      ],
    },
  },
});
