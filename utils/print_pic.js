export default class PrintPic {

  constructor(api, page) {
    this.api = api
    this.page = page
  }

  // 画 canvas 并取 RGBA
  loadImageToCanvas(src, { success } = {}) {
    const ctx = this.api.createCanvasContext('hiddenCanvas', this.page)
    ctx.clearRect(0, 0, 9999, 9999)
    console.debug('图片 src：', src)

    this.api.getImageInfo({
      src,
      success: (info) => {
        const { width: w, height: h } = info
        /* 统一缩放到 384 点宽（58 mm 纸） */
        const dw = 384
        const dh = Math.round((h * dw) / w)
        console.debug('图片信息：', info, dw, dh)
        ctx.drawImage(src, 0, 0, dw, dh)
        ctx.draw(false, () => {
          this.api.canvasGetImageData({
            canvasId: 'hiddenCanvas',
            x: 0,
            y: 0,
            width: dw,
            height: dh,
            success: (res) => {
              console.debug('canvas 数据：', res)
              const data = this.imgToRaster(res.data, dw, dh)
              console.debug('转化后的数据:', data)
              success?.(data)
            }
          })
        })
      }
    })
  }

  // RGBA → 1 bit 光栅命令
  imgToRaster(rgba, w, h) {
    const bytesPerLine = Math.ceil(w / 8)
    const raster = new Uint8Array(bytesPerLine * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gray = rgba[(y * w + x) * 4] * 0.299 + rgba[(y * w + x) * 4 + 1] * 0.587 + rgba[(y * w + x) * 4 + 2] * 0.114
        if (gray < 128) {
          const byte = Math.floor(x / 8)
          const bit = 7 - (x % 8)
          raster[y * bytesPerLine + byte] |= (1 << bit)
        }
      }
    }
    /* ESC/POS 光栅位图命令：GS v 0 */
    const head = new Uint8Array([
      0x1d, 0x76, 0x30, 0x00,          // m=0 正常模式
      bytesPerLine % 256, bytesPerLine / 256,
      h % 256, h / 256
    ])
    console.debug('图片数据：', raster)
    return Uint8Array.from([...head, ...raster])
  }

}
  