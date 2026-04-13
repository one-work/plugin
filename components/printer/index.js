import BluetoothPrinter from '../../utils/bluetooth_printer'

Component({
  behaviors: ['wx://component-export'],

  export() {
    return {
      connectedDeviceId: this.data.connectedDeviceId,
      connectedDeviceName: this.data.connectedDeviceName
    }
  },

  properties: {
    printerName: {
      type: String,
      value: ''
    }
  },

  data: {

  },

  lifetimes: {
    attached() {
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
      wx.createBLEConnection({
        deviceId: ds.deviceId,
        success: res => {
        },
        fail: res => {
          wx.showModal({
            title: '连接蓝牙失败',
            content: JSON.stringify(res)
          })
        }
      })

      this.triggerEvent('selected', { ...ds })
    },

    closeBLEConnection(e) {
      const ds = e.currentTarget.dataset
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

      this.triggerEvent('unselected', { ...ds })
    }
  }
})