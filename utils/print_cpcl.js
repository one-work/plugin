import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

export default class PrintCPCL {
  static PADDING_TOP = 40

  constructor({ width = 72, height = 40 } = {}) {
    this.width = width * 8
    this.height = height * 8
    this.qty = 1
    this.texts = []
    this.currentY = PrintCPCL.PADDING_TOP
    this.qrcodes = []
    this.images = []
  }

  render() {
    const content = [
      ...this.head(),
      ...this.texts,
      ...this.qrcodes,
      ...this.images,
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

  qrcode_right(data, { y = PrintCPCL.PADDING_TOP, u = 6 } = {}) {
    const qrcodeEncoder = Qrcode(4, 'M')
    qrcodeEncoder.addData(data)
    qrcodeEncoder.make()
    const size = qrcodeEncoder.getModuleCount()
    console.debug('qrcode size：', size)
    const x = this.width - (u * size) - 16

    const qrData = [
      `B QR ${x} ${y} M 2 U ${u}`,
      `MA,${data}`,
      'ENDQR'
    ].join("\n")
    this.qrcodes.push(qrData)
  }

  lineX({ x0 = 0, x1 = 40 * 8, width = 8, height = 36 } = {}) {
    this.texts.push(`L ${x0} ${this.currentY} ${x1} ${this.currentY} ${width}`)
    this.currentY = this.currentY + height
  }

  // 使用压缩数据
  image(data, { x = 0, y = this.currentY, width = 1, height = 1 } = {}) {
    this.images.push(`CG ${width} ${height} ${x} ${y} ${data}`)
  }

  barcode(data, { width = 1, ratio = 1, height = 50, x = 0 } = {}) {
    this.texts.push(`B 39 ${width} ${ratio} ${height} ${x} ${this.currentY} ${data}`)
    this.currentY = this.currentY + height
  }

}