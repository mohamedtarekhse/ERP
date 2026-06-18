import type { PostgrestError } from '@supabase/supabase-js';

/** PostgREST returns 404 / PGRST205 when a table or view is not in the schema. */
export function isMissingRelationError(error: PostgrestError | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.message?.includes('Could not find the table') ||
    error.message?.includes('relation') && error.message?.includes('does not exist')
  );
}

export function warnMissingMigration(table: string, migration: string): void {
  console.warn(
    `[amici-erp] Table "${table}" not found. Apply ${migration} in the Supabase SQL editor.`
  );
}
