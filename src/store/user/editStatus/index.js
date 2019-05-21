import localStorage from '@u/localStorage'

export default {
  namespaced: true,

  state: {
    info: false,
    jbbq: 0,
    xxjh: false
  },

  mutations: {
    // 写状态
    writeState (state, payload){
      for(let key in payload){
        state[key] = payload[key]

        // 额外设置一个判断info是否填写的状态，方便获取
        if(key === 'info'){
          localStorage.set('isInfoEdited', payload[key])
        }
      }

      localStorage.set('editStatus', state)
    }
  },

  actions: {
    // 获取状态
    get (store, payload){
      return new Promise((resolve, reject) =>{
        _request({
          url: 'my/NextInstructions'
        }).then(({data}) =>{
          store.commit('writeState', data.ret)
          resolve()
        }).catch(e =>{
          console.log(e)
          reject({ timeout: true })
        })
      }) 
    }
  }
}