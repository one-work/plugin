import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'

Page({
  data: {
    devices: [],
    chs: []
  },

  onLoad(options) {
    console.debug('print onload', options)
    this.printer = new BluetoothPrinter(wx)
    wx.cpcl = new PrintCPCL()

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

  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    this.setData({
      connectedDeviceId: ds.deviceId,
      connectedDeviceName: ds.name
    })
  },

  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.connectedDeviceId,
      success: res => {
        console.debug('断开与蓝牙设备的连接', res)
        this.setData({ connectedDeviceId: '' })
        wx.removeStorageSync('printer')
      }
    })
  },

  restartBluetoothDevicesDiscovery() {
    this.printer.getState({
      success: (res) => {
        console.debug('-------get state success--')
        console.debug(res)
        this.setData({ devices: res.devices })
        console.debug('---- get state success-')
      }
    })
  },

  doPrint(e) {
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
