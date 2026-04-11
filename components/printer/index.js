import BluetoothPrinter from '../../utils/bluetooth_printer'

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    printerName: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
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
      this.setData({ objectId: this.printer.objectId })

      this.printer.getState({
        success: (res) => {
          console.debug(res)
          this.setData({ devices: res.devices })
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
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