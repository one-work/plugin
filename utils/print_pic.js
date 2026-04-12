export default class PrintPic {

  constructor(api, page) {
    this.api = api
    this.page = page
  }

  // 画 canvas 并取 RGBA
  loadImageToCanvas(src, success) {
    const ctx = this.api.createCanvasContext('hiddenCanvas', this.page)
    ctx.clearRect(0, 0, 9999, 9999)
    console.debug('图片 src：', src)

    this.api.getImageInfo({
      src,
      success: (info) => {
        const { width: w, height: h } = info
        /* 统一缩放到 384 点宽（58 mm 纸） */
        const dw = 280
        const dh = Math.round((h * dw) / w)
        console.debug('图片信息：', info, dw, dh)
        this.page.setData({ width: dw, height: dh })

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
              const data = this.imgToRaster(res.data, res.width, res.height)
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
    const grayArray = []
    for (let i = 0; i < rgba.length; i += 4) {
      const gray = Math.round(rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114)
      if (gray < 128) {
        grayArray.push(1) // 打印像素点
      } else {
        grayArray.push(0) // 不打印
      }
    }
    console.debug('转灰度后的数据：', grayArray.length, grayArray.join(''))

    const bytesPerLine = Math.ceil(w / 8)
    const raster = []
    const dataStr = []

    for (let y = 0; y < h; y++) {
      const sub = grayArray.splice(0, w)
      for (let x = 0; x < bytesPerLine; x++) {
        const a = parseInt(sub.splice(0, 8).join('').padEnd(8, '0'), 2)
        raster.push(a) // 8 位二进制转 16进制，不足的用 0 补齐
      }
    }

    const meta = {
      width: w,
      byteWidth: bytesPerLine,
      height: h
    }

    return {
      data: raster,
      dataStr: dataStr,
      meta: meta
    }
  }

}
  