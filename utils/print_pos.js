import iconv from 'iconv-lite'

export default class PrintPOS {
  static TXT_NORMAL = [ 0x1b, 0x21, 0x00 ]
  static CTL_LF = [ 0x0a ] // Print and line feed

  constructor() {
    this.data = []
    this.data.push(0x1b, 0x40)  // 初始化打印机：清除打印缓存，各参数恢复默认值
    this.data.push(0x1b, 0x4c)  // 页模式
    this.data.push(0x1d, 0x4c, 0x12, 0x00)  // 设置左限（左边距）：向右移动 18（0x12）点
    this.data.push(0x1c, 0x26) // 启用 16×16 点阵中文打印模式
    this.data.push(0x1c, 0x21, 0x00)  // 中文字间距为 0 点
  }

  text_big(value) {
    this.data.push(0x1b, 0x21, 0x30) // Quad area text
    this.data.push(...Array.from(iconv.encode(value, 'gb18030'))) // 将 value 转为 bytes
    this.data.push(...PrintPOS.TXT_NORMAL)
    this.data.push(...PrintPOS.CTL_LF)
  }
  
  render() {
    return this.data
  }

  render_raw() {
  }
  
}