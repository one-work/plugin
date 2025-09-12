import PrintCPCL from '../../utils/print_cpcl'
import PrintPOS from '../../utils/print_pos'

Page({
  data: {
    state: '正在连接打印机...',
  },

  onLoad() {
  },

  printCpcl() {
    const cpcl = new PrintCPCL()
    cpcl.text_bold('创印智能')
    cpcl.text('你好呀')
    const data = cpcl.render()
    console.debug(data)
    this.printer.writeBuffer(data)
  },

  printPos() {
    const pos = new PrintPOS()
    pos.text_big('创印智能')
    pos.text('创印智能')
    const data = pos.render()
    console.debug('POS处理后的数据：', data)

    this.printer.getState({
      success: (res) => {
        this.printer.writeValue(data)
      }
    })
    this.printer.writeValue(data)
  }

})
