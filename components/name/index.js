import BluetoothPrinter from '../../utils/bluetooth_printer'
import iconv from 'iconv-lite'

Component({
  properties: {
    connectedName: {
      type: String,
      value: ''
    }
  },

  lifetimes: {
    attached() {
      this.printer = new BluetoothPrinter(wx, this)
    }
  },

  methods: {
    formSubmit(e) {
      this.printer.registeredDevices = [this.data.connectedName]
      const input = e.detail.value
      const name = iconv.encode(input.name, 'utf-8')
      const length = name.length + 5 + 4

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
      data.push(0x00, 0x30, 0x30, 0x30, 0x30, 0x00) // 配对码 0000
      data.push(xor)

      this.printer.getState({
        success: (res) => {
          if (res.printable) {
            this.printer.writeValue(data)
          }
        }
      })
    }
  }
})