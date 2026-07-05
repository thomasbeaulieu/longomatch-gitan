export function toFileUrl(absolutePath: string): string {
  const normalized = absolutePath.replace(/\\/g, '/')
  return `file:///${normalized}`
}
