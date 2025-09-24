import Bluetooth from './bluetooth'

export default class extends Bluetooth {

  constructor(api) {
    super(api)
  }

  // 向蓝牙设备发送数据
  writeValue(data, maxChunk = 20) {
    while (data.length > 0) {
      let subData = data.splice(0, maxChunk)
      let buffer = new ArrayBuffer(subData.length)
      let uint = new Uint8Array(buffer)
      uint.set(subData)

      this.api.writeBLECharacteristicValue({
        deviceId: this.connectedDevice.deviceId,
        serviceId: this.connectedDevice.serviceId,
        characteristicId: this.connectedDevice.characteristicId,
        value: buffer,
        writeType: 'write',
        success(res) {
          console.debug('写入数据成功', res.errMsg)
        },
        fail(res) {
          console.debug('写入数据失败', res)
        }
      })
    }
  }

  // 完善后的写入Buffer函数
  writeBuffer(buffer, chunkSize = 20) {
    const totalChunks = Math.ceil(buffer.length / chunkSize)
    const systemInfo = this.api.getSystemInfoSync()
    const writeType = systemInfo.platform === 'android' ? 'writeNoResponse' : 'write'
    console.debug(`开始发送数据，总大小: ${buffer.length}字节，分${totalChunks}块发送`, `当前浏览器${systemInfo.platform}`)

    this.writeRemain({ 
      buffer: buffer, 
      chunkSize: chunkSize, 
      writeType: writeType
    })
  }

  writeRemain({ buffer, chunkSize, writeType, offset = 0, index = 1 } = {}) {
    if (offset >= buffer.length) {
      console.debug('所有数据已发送完成')
      return
    }

    const chunk = buffer.subarray(offset, offset + chunkSize)
    const arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length)

    this.api.writeBLECharacteristicValue({
      deviceId: this.connectedDevice.deviceId,
      serviceId: this.connectedDevice.serviceId,
      characteristicId: this.connectedDevice.characteristicId,
      value: arrayBuffer,
      writeType: writeType,
      success: (res) => {
        console.debug(`写入第${index}块数据成功，写入类型：${writeType}，大小: ${chunk.length}字节`, res.errMsg)
        offset += chunkSize
        index += 1
        this.writeRemain({ 
          buffer: buffer, 
          offset: offset, 
          chunkSize: chunkSize, 
          writeType: writeType,
          index: index
        })
      },
      fail: (res) => {
        console.debug(`写入第${index}块数据失败：`, res)
        this.api.showModal({
          title: '写入数据失败',
          content: JSON.stringify(res)
        })
        this.writeRemain({
          buffer: buffer, 
          offset: offset, 
          chunkSize: chunkSize, 
          writeType: writeType,
          index: index
        })
      }
    })
  }

  createBLEConnection(deviceId, success) {
    this.api.createBLEConnection({
      deviceId,
      success: res => {
        console.debug('连接蓝牙设备', deviceId, res)

        // 获取蓝牙设备的所有服务
        this.api.getBLEDeviceServices({
          deviceId,
          success: res => {
            const servicesLength = res.services.length
            res.services.forEach((service, index) => {
              if (service.isPrimary && service.uuid.endsWith('0000-1000-8000-00805F9B34FB')) {
                console.debug('设备 ID：', deviceId, '主服务：', service.uuid)
                // 获取蓝牙设备服务中所有特征
                this.api.getBLEDeviceCharacteristics({
                  deviceId: deviceId,
                  serviceId: service.uuid,
                  success: res => {
                    for (const characteristic of res.characteristics) {
                      console.debug('特征值', deviceId, service.uuid, characteristic.uuid, characteristic.properties)
                      if (characteristic.properties.write && (characteristic.properties.writeNoResponse || (characteristic.uuid.endsWith('0000-1000-8000-00805F9B34FB')))) {
                        console.debug('可写入', deviceId, service.uuid, characteristic.uuid)
                        this.connectedDevice = {
                          deviceId: deviceId,
                          serviceId: service.uuid,
                          characteristicId: characteristic.uuid
                        }
                      }
                    }
                    // 所有 service 的特制值已获取完毕
                    if (servicesLength === index + 1) {
                      console.debug('获取打印机', this.connectedDevice)
                      if (this.connectedDevice.deviceId) {
                        success?.({devices: this.allDevices})
                      } else {
                        this.api.showModal({
                          title: '获取合适的特征值失败',
                          content: JSON.stringify(res)
                        })
                      }
                    }
                  },
                  fail: res => {
                    console.error('读取蓝牙设备特征值失败', res)
                  }
                })
              }
            })
          }
        })
      },
      fail: res => {
        console.debug('连接蓝牙设备失败', deviceId, res)
      }
    })
  }
}