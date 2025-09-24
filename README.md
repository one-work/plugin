# 创印蓝牙打印插件

## 使用方法

[Demo](https://gitee.com/cyprinter/uniapp_demo)

###  CPCL 打印指令

```js
import PrintCPCL from '@/uni_modules/chuangyin-bluetooth/utils/print_cpcl.js'
const cpcl = new PrintCPCL()

cpcl.text_bold('hello, world!')
cpcl.text('欢迎使用创印智能打印机！')
cpcl.qrcode_right('二维码内容')
cpcl.lineX()  // 打印横线
const data = cpcl.render()
```

###  POS/ESC 打印指令

```js
import PrintPOS from '@/uni_modules/chuangyin-bluetooth/utils/print_pos.js'
const pos = new PrintPOS()

pos.text_bold('hello, world!')
pos.text('欢迎使用创印智能打印机！')
pos.qrcode('二维码内容')
const data = pos.render()
```


### 蓝牙打印机

```js
import BluetoothPrinter from '@/uni_modules/chuangyin-bluetooth/utils/bluetooth_printer.js'
const printer = new BluetoothPrinter(uni)
printer.registeredDevices = ['GP-M421-87F6']  // 此处为打印机的蓝牙设备名称
// getState 会基于上面注册的蓝牙打印机名称自动连接打印机并调用打印
printer.getState({  
  success: (res) => {
    printer.writeValue(data)
  }  
})
```