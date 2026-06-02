/**
 * 统一成功响应结构。
 */
export function ok<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}

/**
 * 统一失败响应结构。
 */
export function fail(message: string): { ok: false; message: string } {
  return { ok: false, message };
}
