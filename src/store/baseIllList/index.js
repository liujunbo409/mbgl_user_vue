export default {
  namespaced: true,

  state: {
    data: []
  },

  mutations: {
    writeStatus (state, payload){
      state.data = payload
    }
  },

  getters: {
    plain: state =>{
      return state.data.map(val =>{
        return { 
          name: val.name,
          id: val.id
        }
      })
    }
  },

  actions: {
    load (store, payload){
      var {state} = store
      return new Promise((resolve, reject) =>{
        if(state.data.length){
          resolve(state.data)
        }else{
          _request({
            baseURL: Vue._GLOBAL.comApi,
            url: 'baseIllList',
            params: {
              role: 'doctor'
            }
          }).then(({data: {ret}}) =>{
            store.commit('writeStatus', ret)
            resolve()
          }).catch(e =>{
            console.log(e)
            reject()
          })
        }
      })
    }
  }
}