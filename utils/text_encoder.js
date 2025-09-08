export function encodeUTF8(str) {
  const out = [];
  for (let i = 0, code; i < str.length; i++) {
    code = str.codePointAt(i);
    if (code <= 0x7F) out.push(code);
    else if (code <= 0x7FF) out.push(0xC0 | (code >>> 6), 0x80 | (code & 0x3F));
    else if (code <= 0xFFFF) out.push(0xE0 | (code >>> 12), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F));
    else { out.push(0xF0 | (code >>> 18), 0x80 | ((code >>> 12) & 0x3F), 0x80 | ((code >>> 6) & 0x3F), 0x80 | (code & 0x3F)); i++; }
  }
  return new Uint8Array(out);
}