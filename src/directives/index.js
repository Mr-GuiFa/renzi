
export const imgError = {
  inserted(el, options) {
    // el 指令绑定的原始，阔以用来直接操作 DOM
    // console.log(el)
    // 如果图片赋值出错了，给他一个默认图片
    el.onerror = function() {
      el.src = options.value
    }
  }
}

export const focus = {
// 低昂被绑定的原始插入到DOM中时
  inserted: function(el) {
    // 聚焦元素
    el.focus()
  }
}
