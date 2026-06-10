export function checkAdminKey(provided: string | null | undefined) {
  const expected = process.env.ADMIN_KEY?.trim();
  if (!expected) return false;
  return Boolean(provided?.trim()) && provided.trim() === expected;
}
