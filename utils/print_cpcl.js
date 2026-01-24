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
    const content = []
    const content1 = [
      ...this.head(),
      ...this.texts,
      ...this.qrcodes
    ].join("\n")      
    const content2 = [
      'FORM',
      'PRINT',
      ''
    ].join("\n")
    const result = content.concat(
      this.head16(),
      this.texts,
      this.images,
      this.foot16()
    )

    return result
  }

  head() {
    return [
      `! 0 200 200 ${this.height} ${this.qty}`,
      `PW ${this.width}`,
      'PREFEED 64'
    ]
  }

  head16() {
    return [
      0x1A, 0x5B, 0x01, 
      0x00, 0x00, 0x00, 0x00, 
      this.width % 256, Math.floor(this.width / 256), this.height % 256, Math.floor(this.height / 256),
      0x00,
      0x0a
    ]
  }
  
  foot16() {
    return [
      0x1A, 0x5D, 0x00, 
      0x0a,
      0x1A, 0x4F, 0x00
    ]
  }

  text(data, { font = 8, size = 0, x = 0, y = 36, line_add = true } = {}) {
    this.texts.push(
      0x1a, 0x54, 0x00,
      x % 256, Math.floor(x / 256),
      this.currentY % 256, Math.floor(this.currentY / 256),
      ...iconv.encode(data, 'gb18030')
    )
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

  image(dataArray, { x = 0, y = this.currentY, head = {} } = {}) {
    this.images = this.head16().concat(
      [0x1a, 0x21, 0x01],
      [x % 256, Math.floor(x / 256), y % 256, Math.floor(y / 256)],
      [head.xL, head.xH, head.yL, head.yH, 0x00, 0x11],
      [0x0a],
      dataArray,
      [0x0a],
      this.foot16()
    )
    
    return this.images
  }

  barcode(data, { width = 1, ratio = 1, height = 50, x = 0 } = {}) {
    this.texts.push(`B 39 ${width} ${ratio} ${height} ${x} ${this.currentY} ${data}`)
    this.currentY = this.currentY + height
  }

}