import BluetoothPrinter from '../../utils/bluetooth_printer'

Component({

  properties: {
    printerName: {
      type: String,
      value: ''
    }
  },

  data: {

  },

  pageLifetimes: {
    show() {
      this.setData({
        connectedDeviceId: wx.getStorageSync('connectedDeviceId'),
        connectedDeviceName: wx.getStorageSync('connectedDeviceName')
      })

      this.printer = new BluetoothPrinter(wx, this)
      this.printer.filteredDevices = this.data.printerName.split(',')
      this.printer.getState({
        success: res => {
          this.setData({ devices: res.devices })
        }
      })
    }
  },

  methods: {
    createBLEConnection(e) {
      const ds = e.currentTarget.dataset
      this.setData({
        connectedDeviceId: ds.deviceId,
        connectedDeviceName: ds.name
      })
      wx.setStorageSync('connectedDeviceId', ds.deviceId)
      wx.setStorageSync('connectedDeviceName', ds.name)
    },

    closeBLEConnection() {
      wx.closeBLEConnection({
        deviceId: this.data.connectedDeviceId,
        success: res => {
          console.debug('断开与蓝牙设备的连接', res)
        }
      })
      this.setData({ 
        connectedDeviceId: '',
        connectedDeviceName: ''
      })
      wx.removeStorageSync('connectedDeviceId')
      wx.removeStorageSync('connectedDeviceName')
    }
  }
})