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
    const grayArray = new Uint8Array(rgba.length / 4)
    for (let i = 0; i < rgba.length; i += 4) {
      const gray = Math.round(rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114)
      if (gray < 128) {
        grayArray[i] = 1 // 打印像素点
      } else {
        grayArray[i] = 0 // 不打印
      }
    }

    const bytesPerLine = Math.ceil(w / 8)
    const raster = new Uint8Array(bytesPerLine * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < bytesPerLine; x += 8) {
        raster[x/8] = parseInt(grayArray.slice(x, x + 8).join('').padEnd(8, '0'), 2) // 8 位二进制转 16进制，不足的用 0 补齐
      }
    }
    console.debug('图片数据：', raster)
    
    const head = {
      xL: bytesPerLine % 256,
      xH: Math.floor(bytesPerLine / 256),
      yL: h % 256,
      yH: Math.floor(h / 256)
    }
    const meta = {
      width: bytesPerLine,
      height: h
    }

    return {
      head: head,
      data: raster,
      meta: meta
    }
  }

}
  