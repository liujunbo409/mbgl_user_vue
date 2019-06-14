// 根实例的created

import localStorage from '@u/localStorage'

export default function(){
  // 如果标记为已登录，尝试判断登录状态是否有效以及账户是否被禁用，若有效更新userInfo，无效跳转login
  var laravelId = window.localStorage.getItem('user_laravel_id', false)
  if(localStorage.get('isLogin', false)){
    _request({
      url: 'my/getByIdWithToken'
    }).then(({data}) =>{
      if(data.code === 105){
        this.$store.commit('user/clear')
        this.$toView('login')
        this.$bus.$emit('vux.toast', {
          text: '您的登录状态似乎已经失效，请重新登录',
          width: '10em',
          position: 'bottom'
        })
      }
      if(data.code === 200){
        _request({
          url: 'my/userStatus',
          params: {
            user_id: data.ret.id
          }
        }).then(({data: {result: noBan}}) =>{
          if(!noBan){
            this.$store.commit('user/clear')
            this.$toView('login')
            this.$bus.$emit('vux.toast', {
              type: 'cancel',
              text: '您的账户已被禁用'
            })
          }
        })
      }
    })

    // 若为控制着其他账户的状态，则进行权限确认
    var userInfo = localStorage.get('userInfo', null),
    remoteAccess = localStorage.get('remoteAccess', null)
    if(remoteAccess){
      this.$store.dispatch('user/checkRemoteAccess')
      .then((data) =>{
        if(data.changed){
          this.$bus.$emit('vux.alert', '您当前控制的账户权限已经被改为“' + data.access + '”')
        }
      }).catch(e =>{
        if(e.timeout){
          this.$bus.$emit('vux.alert', '因网络异常，权限验证失败，您控制的账号“' + userInfo.real_name + '”被迫下线')
        }else if(e.type === 'close'){
          this.$bus.$emit('vux.alert', `“${userInfo.real_name}”已将您的控制权限撤销`)
        }else if(e.type === 'error'){
          this.$bus.$emit('vux.alert', '因未知错误，权限验证失败，您控制的账号“' + userInfo.real_name + '”被迫下线')
        }
      })
    }

    // 初始化医院数据
    this.$store.dispatch('hospList/load')

    // 获取填写状态
    this.$store.dispatch('user/editStatus/get')

  }else if(laravelId){        // 判断是否有openId
    // 获取用户信息
    _request({
      url: 'my/getByIdWithToken',
      params: {
        user_id: laravelId
      }
    }).then(({data}) =>{
      if(data.result){
        this.$store.commit('user/writeState', data.ret)
        var originalTargetUrl = localStorage.get('originalTargetUrl', '')
        if(originalTargetUrl){
          window.location.href = originalTargetUrl
        }else{
          window.location.reload()
        }
      }
    }).catch(e =>{
      console.log(e)
    })
  }

  
  // 获取基本疾病列表
  this.$store.dispatch('baseIllList/load')
}