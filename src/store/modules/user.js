import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'
import { getToken, removeToken, setToken, setTimeStamp } from '@/utils/auth'
// 状态
const state = {
  token: getToken(),
  userInfo: {}
}
// 修改状态
const mutations = {
  // 修改oken的方法
  // 设置token
  // 1.vuex
  // 2.cokkie
  setToken(state, token) {
    state.token = token // 修改了vuex状态
    setToken(token) // 本地存储的设置token的方法 》》 从auth.js中引入
  },
  // 移除token
  removeToken(state) {
    state.token = null
    removeToken()
  },
  setUserInfo(state, userInfo) {
    state.userInfo = { ...userInfo } // 用 浅拷贝的方式去赋值对象 因为这样数据更新之后，才会触发组件的更新
  },
  // 删除用户信息
  reomveUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {
  // 登录请求 >> commit >> mutations
  // 点击登录的时候>> dispath('user/login), this.loginFrom
  // 登录  >>commit >>mutations
  async login(context, data) {
    // console.log(context);
    // 调用登录的请求接口
    const res = await login(data)
    // 打印接口调用的结构
    console.log(res)
    // 获取到token存储vuex/cookie
    context.commit('setToken', res)
    setTimeStamp() // 将当前的最新时间写入缓存
  },
  async getUserInfo(context) {
    console.log(context)
    const res = await getUserInfo() // 获取返回值
    console.log(res)
    const baseInfo = await getUserDetailById(res.userId)
    // 存储到vueX
    context.commit('setUserInfo', { ...res, ...baseInfo }) // 将整个的个人信息设置到用户的vuex数据中
    return {
      ...baseInfo,
      ...res
    } // 这里为什么要返回 为后面埋下伏笔
  },
  // 退出登录功能
  logOut(context) {
    // 使用本地的方法
    context.commit('reomveUserInfo')
    context.commit('removeToken')
    resetRouter()
    // {root:true}标识根节点,添加以后可用获取到其他路由的方法
    context.commit('permission/filterRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
