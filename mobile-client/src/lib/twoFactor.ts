export function toQrCodeDataUrl(qrCodeBase64: string): string {
  if (qrCodeBase64.startsWith('data:image')) {
    return qrCodeBase64
  }
  return `data:image/png;base64,${qrCodeBase64}`
}
