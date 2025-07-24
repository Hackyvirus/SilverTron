// Use env variable and convert to Uint8Array
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
