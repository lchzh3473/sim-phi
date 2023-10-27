namespace Type {
  export function int(a: unknown): number {
    return Number(a) | 0;
  }
  export function float(a: unknown): number {
    return Number(a) || 0;
  }
  export function bool(a: unknown): boolean {
    return Boolean(a);
  }
  export function str(a: unknown): string {
    return String(a);
  }
  export function arr<T>(a: unknown, constructor: new (b: Record<string, unknown>) => T): T[] {
    return Array.isArray(a) ? a.map((i?: Record<string, unknown>) => new constructor(i || {})) : [];
  }
  export function obj<T>(a: unknown, constructor: new (b: Record<string, unknown>) => T): T {
    return new constructor((a as Record<string, unknown> | null) || {});
  }
}
export default Type;
