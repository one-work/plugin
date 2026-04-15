import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'
import PrintPic from '../../utils/print_pic'

Page({
  data: {
    state: '正在连接打印机...',
  },

  onLoad(options) {
    this.printer = new BluetoothPrinter(wx, this)
    this.setData({ 
      objectId: this.printer.objectId,
      printerName: options.name
    })
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
  }

})
