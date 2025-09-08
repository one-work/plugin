function xx(codePoint) {
  if (codePoint <= 0x7F) { // 单字节字符
    return codePoint
  } else if (codePoint <= 0x7FF) { // 双字节UTF-8字符
    return [
      0xC0 | (codePoint >> 6),
      0x80 | (codePoint & 0x3F)
    ]
  } else if (codePoint <= 0xFFFF) { // 三字节UTF-8字符
    return [
      0xE0 | (codePoint >> 12),
      0x80 | ((codePoint >> 6) & 0x3F),
      0x80 | (codePoint & 0x3F)
    ]
  } else { // 更多字节的UTF-8字符
    return codePoint
  }
}

export function utf8ToGb18030(str) {
  let result = []
  for (let i = 0; i < str.length; i++) {
    result.push(xx(str.charCodeAt(i)))
  }

  return result
}
