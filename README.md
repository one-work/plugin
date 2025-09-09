# 创印蓝牙打印插件

## 使用方法

[Demo](https://gitee.com/cyprinter/uniapp_demo)

###  CPCL 打印指令

```js
import PrintCPCL from '@/uni_modules/chuangyin-bluetooth/utils/print_cpcl.js'
const cpcl = new PrintCPCL()


cpcl.text_bold('hello, world!')
cpcl.text('欢迎使用创印智能打印机！')
const data = cpcl.render()
```


### 蓝牙打印机

```js
import BluetoothPrinter from '@/uni_modules/chuangyin-bluetooth/utils/bluetooth_printer.js'
const printer = new BluetoothPrinter(uni)
printer.registeredDevices = ['GP-M421-87F6']
printer.getState({
  success: (res) => {
    printer.writeBuffer(data)
  }  
})
```