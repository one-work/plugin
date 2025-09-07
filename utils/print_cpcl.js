const iconv = require('iconv-lite')
export default class PrintCPCL {
  static PADDING_TOP = 40

  constructor({ width = 72, height = 40 } = {}) {
    this.width = width * 8
    this.height = height * 8
    this.qty = 1
    this.texts = []
    this.currentY = PrintCPCL.PADDING_TOP
    this.qrcodes = []
  }

  render() {
    const content = [
      ...this.head(),
      ...this.texts,
      ...this.qrcodes,
      'FORM',
      'PRINT',
      ''
    ].join("\n")

    return iconv.encode(content, 'gb18030')
  }

  head() {
    return [
      `! 0 200 200 ${this.height} ${this.qty}`,
      `PW ${this.width}`,
      'PREFEED 64'
    ]
  }

  text(data, { font = 8, size = 0, x = 0, y = 36, line_add = true } = {}) {
    this.texts.push(`T ${font} ${size} ${x} ${this.currentY} ${data}`)
    if (line_add) {
      this.currentY = this.currentY + y
    }
  }

  text_bold(data, { size = 1, ...options } = {}) {
    this.texts.push('SETBOLD 2')
    this.texts.push(`SETMAG ${size} ${size}`)

    this.text(data, { size: size, y: 36 * size, ...options })
    this.texts.push('SETMAG 0 0')
    this.texts.push('SETBOLD 0')
  }

}