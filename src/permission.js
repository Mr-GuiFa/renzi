import router from './router'
// 引入store仓库，因为token存储在哪
import store from './store'
// 引入进度条
import NProgress from 'nprogress'
// 必须也得引入进度条样式
import 'nprogress/nprogress.css'

const LogonFrom = '/login'
const NotFund = '/404'

// 定义一个白名单
const whiteList = [LogonFrom, NotFund]
// 监听路由的变化
// to 是要去那，from是从那来的,next调用形式决定你去那个路由，后面如果跟参数是强制你的下一步去哪
router.beforeEach(async(to, from, next) => {
  // 骗用户的进度条。开始
  NProgress.start()

  const token = store.getters.token
  //   如果有token 的情况
  if (token) {
    if (!store.getters.userId) {
      /**
      *@type{UserInfoData['data]}
      */
      // 如果没有id这个值 才会调用 vuex的获取资料的action
      const res = await store.dispatch('user/getUserInfo')
      // 为什么要写await 因为我们想获取完资料再去放行
      // 添加用户拥有的路由权限之后，再去做跳转
      console.log(res)
      const routes = await store.dispatch('permission/filterRoutes', res.roles.menus)
      // 默认情况只有静态路由
      // 进行动态路由的添加
      // router.addRoutes(routes)
      router.addRoutes([
        ...routes,
        { path: '*', redirect: '/404', hidden: true }
      ])
      // 重新再进行跳转
      next(to.path)
      // 筛选出动态路由以后,需要添加router里面,这样的可用去访问
      // route.addRoutes
    }
    // 判断你是否去登录页面
    if (to.path === LogonFrom) {
      // 跳转首页
      next('/')
    } else {
      next()
    }
  } else {
    // 没有token的情况
    // 判断是否去白名单界面 /login
    if (whiteList.includes(to.path)) {
      next()
    } else {
      // 如果你没有token,同时要去的界面不是白名单界面（去要权限的界面） 就会重定向到登录页面
      next(LogonFrom)
    }
  }
  //   骗用户的进度条。结束
})

router.afterEach(() => {
  NProgress.done()
})
