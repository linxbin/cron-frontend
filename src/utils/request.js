import axios from 'axios'
import store from '@/store'
import storage from 'store'
import { VueAxios } from './axios'
import { ACCESS_TOKEN, AUTHORIZATION } from '@/store/mutation-types'
import { message } from 'ant-design-vue'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      if (token) {
        store.commit('SET_TOKEN', '')
        store.commit('SET_ROLES', [])
        storage.remove(ACCESS_TOKEN)
      }
      location.reload()
    }
    message.error(data.message)
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers[AUTHORIZATION] = 'Bearer ' + token
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  if (response.request.custom.method === 'POST') {
    message.success(response.data.message)
  }
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
