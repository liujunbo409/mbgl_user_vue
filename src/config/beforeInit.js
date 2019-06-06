// 在挂在实例前执行（比beforeCreate还要前）

import localStorage from '@u/localStorage'

var userInfo = localStorage.get('userInfo')

export default function(main){
  // 在使用openid免登陆的情况下判断是否填写过个人信息
  if(userInfo){
    Promise.all([
      _request({
        url: 'my/NextInstructions',
      }).then(({data}) =>{
        if(data.result){
          window._GLOBAL.editStatus = data.ret
          if(data.ret.info){
            localStorage.set('isInfoEdited', true)
          }
        }
      }),
    ]).then(main).catch(e =>{
      console.log(e)
      main()
    })

  }else{ main() }
}