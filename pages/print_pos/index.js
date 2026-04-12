import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'
import PrintPOS from '../../utils/print_pos'

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
