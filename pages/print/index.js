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
  },

  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    this.printer.createBLEConnection(deviceId, () => {

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
