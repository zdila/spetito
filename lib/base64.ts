export function toBase64(arrayBuffer: ArrayBuffer | null) {
  return (
    arrayBuffer &&
    btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer) as any))
    // .replace(/\+/g, "-")
    // .replace(/\//g, "_")
    // .replace(/=+$/, "")
  );
}
