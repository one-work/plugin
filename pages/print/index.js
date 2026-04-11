import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'
import iconv from 'iconv-lite'

Page({
  data: {
    devices: [],
    chs: []
  },

  onLoad(options) {
    console.debug('print onload', options)
    

    this.printer = new BluetoothPrinter(wx, this)
    this.printer.filteredDevices = options.name.split(',')
    this.setData({ 
      objectId: this.printer.objectId,
      printerName: options.name
    })
    wx.cpcl = new PrintCPCL()

    this.printer.getState({
      success: (res) => {
        console.debug(res)
        this.setData({ devices: res.devices })
      }
    })

    wx.getConnectedWifi({
      success: (res) => {
        console.debug('-----', res)
        this.setData({ wifi: res.wifi })
      },
      fail: (err) => {
        console.debug(err)
      }
    })
  },

  scanWifi() {
    wx.scanCode({
      success: (res) => {
        const wifi = {}
        const xx = res.result.substring(5)
        xx.split(';').forEach(i => {
          if (i.startsWith('S:')) {
            wifi.SSID = i.split(':')[1]
          } else if (i.startsWith('P:')) {
            wifi.PWD = i.split(':')[1]
          }
        })
        this.setData({ wifi: wifi })
      }
    })
  },

  formSubmit(e) {
    const input = e.detail.value
    const ssid = iconv.encode(input.ssid, 'utf-8')
    const pass = iconv.encode(input.password, 'utf-8')
    const size = ssid.length + pass.length + 7

    // 计算校验位
    let xor = 0x1f ^ 0x77
    xor ^= ssid.length
    for (const byte of ssid) {
      xor ^= byte
    }
    xor ^= 0x03
    xor ^= 0x01
    xor ^= pass.length
    for (const byte of pass) {
      xor ^= byte
    }

    const data = []
    data.push(0x1f, 0x28, 0x0f)  // 设置 Wifi
    data.push(...[size % 256, Math.floor(size / 256)])  // 数据总长度
    data.push(0x1f, 0x77)
    data.push(ssid.length)  // SSID 长度
    data.push(...ssid)
    data.push(0x03, 0x01) // 固定 pm, km
    data.push(pass.length)  // 密码长度
    data.push(...pass)
    data.push(xor)

    this.printer.registeredDevices = [this.data.connectedDeviceName]
    this.printer.getState({
      success: (res) => {
        if (res.printable) {
          this.printer.writeValue(data)
        }
      }
    })
  }
})
