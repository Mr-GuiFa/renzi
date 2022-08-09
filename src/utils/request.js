
import router from '@/router'
import store from '@/store'
import axios from 'axios'
import { Promise } from 'core-js'
import { Message } from 'element-ui'
import { getTimeStamp } from './auth'
const TimeOut = 999999999999 // 调用超时的时间

const request = axios.create({
  baseURL: process.env['VUE_APP_BASE_API']
})
function IsCheckTimeOut() {
  return Date.now() - getTimeStamp() < TimeOut
}
// 请求拦截器
request.interceptors.request.use(config => {
  // 如果token存在，请求的时候需要把token携带到请求头
  const token = store.getters.token
  if (token) {
    if (IsCheckTimeOut()) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      Message.error('登录过期，请重新登录')
      store.dispatch('user/logOut')
      router.push('/')
      return Promise.reject('')
    }
    // token携带到请求头
  }
  // config的配置项一定要return 不return配置项就是undifund
  return config
},
error => {
  return Promise.reject(error)
})
// 相应拦截器
request.interceptors.response.use(response => {
//   console.log(response)
  //   结构从后端返沪的数据和状态
  const { data: { data, message, success }} = response
  // console.log(response)
  //   判断success是否是true
  // 如果是true 直接返回token数据
  if (success) {
    return data
  }
  //   代码走到这里就证明了success不存在，或者接口有问题
  // 进行错误提示
  Message.error(message || '服务器报错')
  return Promise.reject(message || '服务器报错')
}, error => {
  // 前端和后端协商的规范，
  if (error.response.status === 401) {
    store.dispatch('user/logOut')
    router.push('/login')
  }
  Message.error(error.response?.data?.message || '系统错误')
  return Promise.reject(error)
})
export default request
