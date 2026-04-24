import BluetoothPrinter from '../../utils/bluetooth_printer'
import iconv from 'iconv-lite'

Component({
  onLoad(options) {
    console.debug('name onload', options)
    this.setData({
      connectedName: options.connectedName
    })

    this.printer = new BluetoothPrinter(wx, this)
    this.printer.registeredDevices = [this.data.connectedName]
  },

  formSubmit(e) {
    const input = e.detail.value
    const name = iconv.encode(input.name, 'utf-8')
    const length = name.length + 5

    // 计算校验位
    let xor = 0x1f ^ 0x42
    for (const byte of name) {
      xor ^= byte
    }

    const data = []
    data.push(0x1f, 0x28, 0x0f)
    data.push(...[length % 256, Math.floor(length / 256)])
    data.push(0x1f, 0x42)
    data.push(...name)
    data.push(0x00, 0x00)
    data.push(xor)

    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(data)
        }
      }
    })
  }
})