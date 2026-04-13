import BluetoothPrinter from '../../utils/bluetooth_printer'
import iconv from 'iconv-lite'

Page({
  onLoad(options) {
    console.debug('print onload', options)

    this.printer = new BluetoothPrinter(wx, this)
    
    this.setData({ 
      objectId: this.printer.objectId,
      printerName: options.name,
      connectedDeviceName: options.name
    })
  },

  formSubmit(e) {
    const input = e.detail.value
    const name = input.name
    const config = []

    const data = []
    data.push(0x1f, 0x28, 0x0f)
    data.push(...length)
    data.push(0x1f, 0x42)


    this.print(data)
  }
})