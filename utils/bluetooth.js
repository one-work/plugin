export default class {

  constructor(api) {
    this.api = api
    this.allDevices = []
    this.registeredDevices = []
    this.connectedDevice = {}
    this.objectId = Math.random()
  }

  // 获取本机蓝牙适配器状态
  getState({ success, fail, allowDup = false } = {}) {
    const allDevices = [...this.allDevices]
    console.debug('已连接设备（init）：', this.connectedDevice, this.objectId)
    console.debug('绑定设备（init）：', this.registeredDevices)
    console.debug('所有设备（init）：', allDevices.length, allDevices)
    this.api.getBluetoothAdapterState({
      success: stateRes => {
        console.debug('蓝牙状态：', stateRes)
        const state = stateRes.adapterState || stateRes

        if (state.available) {
          this.#getConnectedBluetoothDevices(success)
        }

        if (state.discovering) {
          this.api.onBluetoothDeviceFound(res => {
            console.debug('发现新设备：', JSON.stringify(res.devices))
            this.#filterBluetoothDevices(res.devices, this.objectId, success)
          })
        } else {
          const item = allDevices.find(e => this.registeredDevices.includes(e.name))
          if (item) {
            console.debug('打印机已连接：', item)
          } else {
            this.#startBluetoothDevicesDiscovery(allowDup, success)
          }
        }
      },
      fail: stateRes => {
        console.debug('获取蓝牙状态失败：', stateRes)
        this.api.openBluetoothAdapter({
          success: res => {
            console.debug('初始化蓝牙模块：', res)
            this.#startBluetoothDevicesDiscovery(allowDup, success)
          },
          fail: res => {
            fail?.(res)
            this.api.showModal({
              title: '初始化蓝牙模块失败',
              content: '清除微信缓存后再试'
            })
            console.debug('初始化蓝牙模块失败', res)
          }
        })
      }
    })
  }

  #startBluetoothDevicesDiscovery(allowDup, success) {
    this.api.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: allowDup,
      success: discoveryRes => {
        console.debug('开始搜寻：', discoveryRes)
        this.api.onBluetoothDeviceFound(foundRes => {
          // 因为 uniApp 没有实现停止监听的方法，所以通过传递 ObjectId 来比较打印服务实例
          console.debug('发现新设备（startBlue）：', this.objectId, JSON.stringify(foundRes.devices))
          this.#filterBluetoothDevices(foundRes.devices, this.objectId, success)
        })
      },
      fail: res => {
        console.debug('搜寻失败：', res)
        this.#reportError('startBluetoothDevicesDiscovery', res)
      }
    })
  }

  #filterBluetoothDevices(devices, objectId, success) {
    const allDevices = [...this.allDevices]
    console.debug('本次筛选（filter）：', devices)
    console.debug('所有设备（filter）：', allDevices)
    console.debug('本次已连接:', this.connectedDevice)
    devices.forEach(device => {
      if (!device.name && !device.localName) { return }
      if (!device.RSSI) { return }
      if (device.name.includes('未知或不支持的设备') || device.name.includes('未知设备')) { return }
      const item = allDevices.find(e => e.deviceId === device.deviceId)
      if (item) {
        console.debug('=====搜索到新设备-更新：', device.name)
        Object.assign(item, device)
      } else {
        console.debug('=====搜索到新设备：', device.name)
        this.allDevices.push(device)
      }
    })

    const item = devices.find(e => this.registeredDevices.includes(e.name))
    console.debug('筛选设备-符合条件：', item)
    console.debug('筛选设备-绑定列表：', this.registeredDevices)

    if (item) {
      if (this.api.offBluetoothDeviceFound === 'function') {
        this.api.offBluetoothDeviceFound(res => {
          console.debug('停止监听：', res)
        })
      }
      this.api.stopBluetoothDevicesDiscovery({
        complete: res => {
          console.debug('停止扫描：', res)
        }
      })

      this.allDevices.sort((a, b) => {
        if (a.deviceId === item.deviceId) {
          return -1
        } else if (b.deviceId === item.deviceId) {
          return 1
        }
        return 0
      })

      if (this.connectedDevice.deviceId === item.deviceId) {
        console.debug('已连接设备：', this.connectedDevice, this.offed)
        success?.()
      } else {
        this.createBLEConnection(item.deviceId, success)
      }
    }
  }

  #getConnectedBluetoothDevices(success, item) {
    let filterDevices = []
    if (this.connectedDevice.deviceId) {
      filterDevices = [this.connectedDevice.deviceId]
    }
    console.debug('筛选列表：', filterDevices)
    this.api.getConnectedBluetoothDevices({
      services: filterDevices,
      success: res => {
        console.debug('当前连接：', res, item)
        if (res.devices.length > 0) {
          const connectedItem = res.devices.find(e => e.deviceId === this.connectedDevice.deviceId)
          console.debug('当前连接-已连接：', connectedItem)

          const registeredItem = res.devices.find(e => this.registeredDevices.includes(e.name))
          console.debug('当前连接-已绑定：', registeredItem)

          if (connectedItem) {
            success?.()
          } else if (registeredItem) {
            this.getBLEDeviceServices(registeredItem.deviceId, success)
          } else if (item) {
            this.createBLEConnection(item.deviceId, success)
          }
        } else {
          if (item) {
            this.createBLEConnection(item.deviceId, success)
          } else {
            this.api.getBluetoothDevices({
              success: res => {
                console.debug('获取在蓝牙模块生效期间所有搜索到的蓝牙设备', res)
                this.#filterBluetoothDevices(res.devices, success)
              }
            })
          }
        }
      }
    })
  }

  closeBLEConnection() {
    this.api.stopBluetoothDevicesDiscovery({
      complete: res => {
        console.debug('停止扫描蓝牙设备', res)
      }
    })

    if (this.connectedDevice) {
      //this.api.closeBLEConnection({deviceId: this.connectedDevice.deviceId,success: res => {console.debug('断开蓝牙连接成功：', res)}})
    }

    //this.api.closeBluetoothAdapter({success: res => {console.debug('关闭蓝牙!', res)}})
  }

  #reportError(api, res) {
    this.api.request({
      url: 'https://one.work/bluetooth/devices/err',
      method: 'POST',
      header: {
        Accept: 'application/json'
      },
      data: {
        api: api,
        message: res
      }
    })
  }

}
