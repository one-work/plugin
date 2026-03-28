import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'
import PrintPOS from '../../utils/print_pos'

Page({
  data: {
    state: '正在连接打印机...',
  },

  onLoad() {
    this.printer = new BluetoothPrinter(wx, this)
    this.printer.registeredDevices = [wx.getStorageSync('connectedDeviceName')]
  },

  printCpcl() {
    const cpcl = new PrintCPCL()
    cpcl.text('const cpcl = new PrintCPCL()')
    cpcl.text('cpcl.text_bold("蓝牙打印")')
    cpcl.text_bold('蓝牙打印')
    cpcl.text('cpcl.lineX()')
    cpcl.lineX()
    cpcl.text('cpcl.text("蓝牙打印")')
    cpcl.text('蓝牙打印')
    cpcl.text('cpcl.qrcode_right("https://one.work")')
    cpcl.qrcode_right('https://one.work')
    const data = cpcl.render()
    console.debug(data)

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(data)
        }
      }
    })
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
  }

})
