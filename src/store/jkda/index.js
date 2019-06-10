export default {
  namespaced: true,

  state: {

  },

  mutations: {
    add (state, payload){
      state[Object.keys(payload)[0]] = Object.values(payload)[0]
    }
  },

  actions: {
    get (store, ill_id){
      return new Promise((resolve, reject) =>{
        _request({
          url: 'jkda/illIndex',
          params: { ill_id }
        }).then(({data}) =>{
          if(data.result){
            store.commit('add', {
              [ill_id]: data.ret
            })
            resolve(data.ret)
          }else{
            reject(data)
          }
        }).catch(e =>{
          console.log(e)
          reject({ timeout: true })
        })
      })
    }
  }
}