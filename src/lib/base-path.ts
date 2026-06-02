const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 为 API 路径附加 Next.js basePath。
 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) {
    return `${basePath}/${path}`;
  }
  return `${basePath}${path}`;
}
