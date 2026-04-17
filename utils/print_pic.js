export default class PrintPic {

  constructor(api, page) {
    this.api = api
    this.page = page
  }

  // 画 canvas 并取 RGBA
  loadImageToCanvas(canvas, src, success) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 9999, 9999)
    ctx.filter = 'grayscale(100%)'
    console.debug('图片 src：', src)

    const img = canvas.createImage()
    img.src = src

    this.api.getImageInfo({
      src,
      success: (info) => {
        const { width: w, height: h } = info
        // 统一缩放到 384 点宽（58 mm 纸）
        const dw = 280
        const dh = Math.round((h * dw) / w)
        console.debug('图片信息：', info, dw, dh)
        this.page.setData({ width: dw, height: dh })

        img.addEventListener('load', () => {
          ctx.drawImage(img, 0, 0, dw, dh)
          const imageData = ctx.getImageData(0, 0, dw, dh)
          console.debug('canvas 数据：', imageData)
          const data = this.imgToRaster(imageData, dw, dh)
          console.debug('转化后的数据:', data)
          success?.(data)
        })
      }
    })
  }

  // RGBA → 1 bit 光栅命令
  imgToRaster(rgba, w, h) {
    const grayArray = []
    const totalPixels = rgba.length / 4

    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * rgba[i]
    }

    let sumB = 0, wB = 0, maxBetween = 0, threshold = 0;

    // 专为 8-bit 灰度图像优化，固定 256 级
    for (let t = 0; t < 256; t++) {
      wB += rgba[t];
      if (wB === 0) continue;
      const wF = totalPixels - wB;
      if (wF === 0) break;

      sumB += t * rgba[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) ** 2;  // 类间方差

      if (between > maxBetween) {
        maxBetween = between;
        threshold = t;
      }
    }

    for (let i = 0; i < rgba.length; i += 4) {
      if (i < threshold) {
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
  