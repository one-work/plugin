// plugin/pages/name/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  formSubmit(e) {
    const input = e.detail.value
    const name = input.name
    const config = []

    const data = []
    data.push(0x1f, 0x28, 0x0f)
    data.push(...length)
    data.push(0x1f, 0x42)


    this.print(data)
  }
})