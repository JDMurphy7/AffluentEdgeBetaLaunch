export function isSafeInput(input: string): boolean {
  // Reject common SQL injection patterns
  const forbidden = /drop table|delete from|insert into|;|--|\/\*|\*\//i;
  return !forbidden.test(input);
}
