import BluetoothPrinter from '../../utils/bluetooth_printer'
import PrintCPCL from '../../utils/print_cpcl'

Page({
  data: {
    devices: [],
    chs: []
  },

  onLoad(options) {
    console.debug('print onload', options)
    const printer = new BluetoothPrinter(wx)
    this.printer = printer
    wx.cpcl = new PrintCPCL()
  },

  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    createBLEConnection(deviceId, this)
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
    wx.stopBluetoothDevicesDiscovery({
      complete: res => {
        console.debug('停止蓝牙扫描', res)
        startBluetoothDevicesDiscovery(this)
      }
    })
  },

  doPrint() {
    const printer = wx.getStorageSync('printer') || {}
    wx.request({
      url: this.data.url,
      header: {
        Accept: 'application/json',
        Authorization: wx.getStorageSync('authToken')
      },
      success: res => {
        writeBLECharacteristicValue(printer, res.data)
      },
      complete: res => {
        console.debug(res)
      }
    })
  }
})
