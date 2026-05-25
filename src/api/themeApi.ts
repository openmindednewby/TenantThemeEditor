/**
 * Theme API hooks - React Query integration.
 *
 * GET  /api/tenants/{tenantId}/theme    - Load current theme
 * PUT  /api/tenants/{tenantId}/theme    - Save theme
 * GET  /api/tenants/theme-presets       - List built-in presets
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { TenantThemeConfig } from '@/types';
import type { ThemePreset } from '@/presets';
import { identityClient } from './client';

// -- Query keys ---------------------------------------------------------------

const THEME_QUERY_KEY = 'tenant-theme';
const PRESETS_QUERY_KEY = 'theme-presets';

// -- API functions ------------------------------------------------------------

async function fetchTenantTheme(tenantId: string): Promise<TenantThemeConfig> {
  const response = await identityClient.get<TenantThemeConfig>(
    `/tenants/${tenantId}/theme`,
  );
  return response.data;
}

async function saveTenantTheme(
  tenantId: string,
  config: TenantThemeConfig,
): Promise<TenantThemeConfig> {
  const response = await identityClient.put<TenantThemeConfig>(
    `/tenants/${tenantId}/theme`,
    config,
  );
  return response.data;
}

async function fetchThemePresets(): Promise<ThemePreset[]> {
  const response = await identityClient.get<ThemePreset[]>(
    '/tenants/theme-presets',
  );
  return response.data;
}

// -- Hooks --------------------------------------------------------------------

/** Fetch the current tenant theme. */
export function useGetTenantTheme(tenantId: string) {
  return useQuery({
    queryKey: [THEME_QUERY_KEY, tenantId],
    queryFn: () => fetchTenantTheme(tenantId),
    enabled: tenantId !== '',
    staleTime: Infinity,
  });
}

/** Save the tenant theme. */
export function useSaveTenantTheme(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: TenantThemeConfig) =>
      saveTenantTheme(tenantId, config),
    onSuccess: (data) => {
      queryClient.setQueryData([THEME_QUERY_KEY, tenantId], data);
    },
  });
}

/** Fetch available theme presets from the server. */
export function useGetThemePresets() {
  return useQuery({
    queryKey: [PRESETS_QUERY_KEY],
    queryFn: fetchThemePresets,
    staleTime: Infinity,
  });
}
