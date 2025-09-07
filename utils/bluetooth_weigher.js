import Bluetooth from './bluetooth'

export default class extends Bluetooth {

  constructor(api) {
    super(api)
    this.chs = []
  }

  // 操作之前先监听，保证第一时间获取数据
  onBLECharacteristicValueChange() {
    this.api.onBLECharacteristicValueChange(characteristic => {
      const foundChs = this.chs
      const item = foundChs.find(e => e.uuid === characteristic.characteristicId)
      const buffer = Array.from(new Uint8Array(characteristic.value)).map(i => i.toString(16).padStart(2, '0')).join('')

      if (item) {
        Object.assign(item, {
          uuid: characteristic.characteristicId,
          value: buffer
        })
      } else {
        foundChs.push({
          uuid: characteristic.characteristicId,
          value: buffer
        })
      }

      this.chs = foundChs
    })
  }

  createBLEConnection(deviceId, success) {

  }

}