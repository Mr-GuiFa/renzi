// import Vue from 'vue'
class Sub {
    // 监听的数组列表
    listteners =[]
    // 监听事件
    $on(eventName, callback) {
      this.listteners.push({
        eventName,
        callback
      })
    }
    $emit(eventName, ...args) {
      this.listteners.forEach(item => {
        if (item.eventName === eventName) {
          item.callback(...args)
        }
      })
    }
}
// 发布订阅模式
export const eventBus = new Sub()
