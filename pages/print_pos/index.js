import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintPOS from '../../utils/print_pos'
import PrintPic from '../../utils/print_pic'

Page({
  data: {
    state: '正在连接打印机...',
    width: 300,
    height: 200
  },

  onLoad(options) {
    this.printer = new BluetoothPrinter(wx, this)
    this.setData({ 
      objectId: this.printer.objectId,
      printerName: options.name
    })
    this.printer.registeredDevices = [wx.getStorageSync('connectedDeviceName')]
  },

  printPos() {
    const pos = new PrintPOS()
    pos.text_big('蓝牙打印 Bluetooth Printer!')
    pos.text('蓝牙打印')
    pos.qrcode('https://one.work')
    const data = pos.render()
    console.debug('POS处理后的数据：', data)

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(data)
        }
      }
    })
  },

  printImage() {
    const pos = new PrintPOS()
    const pic = new PrintPic(wx, this)
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const img = res.tempFiles[0]
        pic.loadImageToCanvas(img.tempFilePath, ress => {
          console.debug('回调数据：', ress)
          pos.image(ress.data, ress.meta)
          this.printer.getState({
            success: (res) => {
              if (res.printable) {
                this.printer.writeValue(pos.render())
              }
            }
          })
        })
      }
    })
  },

  printText() {
    const pos = new PrintPOS()
    pos.text_big('Bluetooth Printer!')
    pos.text('欢迎使用蓝牙打印机！')

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(pos.render())
        }
      }
    })
  },

  printQrcode() {
    const pos = new PrintPOS()
    pos.qrcode('https://one.work')

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(pos.render())
        }
      }
    })
  },

  printBar() {
    const pos = new PrintPOS()
    pos.barcode('123456789')

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(pos.render())
        }
      }
    })
  }

})
