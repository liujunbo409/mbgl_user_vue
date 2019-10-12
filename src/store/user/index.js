import localStorage from '@u/localStorage'

import editStatus from './editStatus'

export default {
  namespaced: true,
  modules: {
    editStatus    // 用户填写状态
  },

  // 先取本地状态，当完全加载完毕后再检测一次登录状态是否有效
  state: {
    isLogin: localStorage.get('isLogin', false),
    openId: window.localStorage.getItem('fwh_openid') || null,
    phoneNum: localStorage.get('phoneNum', ''),
    userInfo: localStorage.get('userInfo', null),
    userInfo2: localStorage.get('userInfo2', null),    // 用于在切换账户时备份原账户
    remoteAccess: localStorage.get('remoteAccess', null)
  },

  mutations: {
    // 写状态，改变state中的三个属性的值
    writeState(state, payload) {
      // 未选择统一置为null
      if (payload.role === 'unselec') {
        payload.role = null;
      }
      state.isLogin = true;
      state.phoneNum = payload.phonenum;
      state.userInfo = payload;
      localStorage.set('isLogin', true);
      localStorage.set('phoneNum', payload.phonenum);
      localStorage.set('userInfo', payload);
    },

    // 改变进入其他模块的权限状态
    changeAccess(state, payload) {
      state.access = payload;
    },

    // 清除状态，相当于登出
    clear(state) {
      state.isLogin = false;
        state.userInfo = null;
      localStorage.set('isLogin', false);
      localStorage.remove('userInfo');
      localStorage.remove('remoteUser');
    },

    writeRemoteAccess(state, payload) {
      state.remoteAccess = payload;
      localStorage.set('remoteAccess', payload);
    },

    // 备份原账户
    backupOrigin(state) {
      localStorage.set('userInfo2', state.userInfo);
      state.userInfo2 = localStorage.get('userInfo2');
    },

    // 删除控制模式账户
    backOrigin(state) {
      state.userInfo = state.userInfo2;
      localStorage.set('userInfo', state.userInfo2);
      state.userInfo2 = null;
      localStorage.remove('userInfo2');
      localStorage.remove('remoteAccess');
    }
  },

  actions: {
    // 获取用户信息
    get(store) {
      return new Promise((resolve, reject) => {
        _request({
          url: 'my/getByIdWithToken',
        }).then(({data}) => {
          if (data.result) {
            store.commit('writeState', data.ret);
            resolve(data.ret);
          }
        }).catch(e => {
          console.log(e);
          return reject({timeout: true});
        })
      })
    },

    // 获取是否可以进入其他模块的权限信息
    getAccess(store) {
      return new Promise((resolve, reject) => {
        _request({
          url: 'my/access',
          timeout: 3000,
          params: {
            role: store.state.userInfo.role
          }
        }).then(({data}) => {
          store.commit('changeAccess', data.result);
          resolve(data.result);
        }).catch(e => {
          console.log(e);
          reject({timeout: true});
        })
      })
    },

    // 登录
    login(store, payload) {
      var {state} = store;
      return new Promise((resolve, reject) => {
        var {phoneNum: phonenum, password} = payload;
        // 防止传入的类型为数字
        phonenum = phonenum.toString();
        password = password.toString();
        _request({
          url: 'login/login',
          method: 'post',
          data: {
            phonenum, password,
            fwh_openid: state.openId
          }
        }).then(({data}) => {
            return data.result ? resolve(data) : reject(data)
          }).catch((e) => {
          console.log(e);
          // 因为下面没有catch，这里直接退出
          return reject({result: false, type: 'timeout'});
        })
      })
        .then(data => {
          return new Promise((resolve, reject) => {
            // 判断帐号是否被禁用
            _request({
              url: 'my/userStatus',
              params: {
                user_id: data.ret.id
              }
            }).then(({data: {result}}) => {
                if (result) {
                  resolve(data);
                } else {
                  reject({result: false, type: 'ban'});
                }
              })
          })
        })
        .then(data => {
          return new Promise((resolve, reject) => {
            store.commit('writeState', data.ret);
            resolve(data);
          })
        })
    },

    // 注册
    register(store, payload) {
      var {state} = store;
      payload.fwh_openid = state.openId;

      return new Promise((resolve, reject) => {
        _request({
          method: 'post',
          url: 'login/register',
          data: payload
        }).then(({data}) => {
          if (data.result) {
            // 注册成功后直接写入登录状态
            store.commit('writeState', data.ret);
            resolve();
          } else {
            reject(data);
          }
        }).catch((e) => {
          console.log(e);
          reject({timeout: true});
        })
      })
    },

    // 重设密码
    resetPsd(store, payload) {
      var {state} = store;
      payload.fwh_openid = state.openId;

      return new Promise((resolve, reject) => {
        _request({
          url: 'login/forgetPWD',
          method: 'post',
          data: payload
        }).then(({data}) => {
          if (data.result) {
            store.commit('writeState', data.ret);
            resolve();
          } else {
            reject(data);
          }
        }).catch((e) => {
          console.log(e);
          reject({timeout: true});
        });
      });
    },

    // 编辑个人信息
    editInfo(store, payload) {
      return new Promise((resolve, reject) => {
        _request({
          url: 'my/updateById',
          method: 'post',
          data: payload
        }).then(({data}) => {
            if (data.result) {
              store.commit('writeState', data.ret)
              localStorage.set('isInfoEdited', true)
              resolve()
            } else {
              reject(data)
            }
          })
          .catch(e => {
            console.log(e)
            reject({timeout: true})
          })
      })
    },

    // 改变控制模式账户
    changeToRemote(store, payload) {
      store.commit('backupOrigin')    // 先备份原账户
      store.commit('writeState', payload)   // 再切换
      store.commit('writeRemoteAccess', payload.qsgx)
    },

    // 检查权限是否有变化
    checkRemoteAccess(store) {
      var {state} = store
      return new Promise((resolve, reject) => {
        _request({
          url: 'account/changeAccount',
          params: {
            user_id: state.userInfo2.id,
            token: state.userInfo2.token,
            relative_id: state.userInfo.id
          }
        }).then(({data}) => {
          if (data.result) {
            if (data.ret.qsgx.quanxian === 0) {     // 权限为0，撤销控制权
              store.commit('backOrigin')
              reject({type: 'close'})           // 返回特征用于在config/created.js发送提示
            } else {
              resolve({                           // 对比，若权限码发生变化，将changed设为true
                changed: state.remoteAccess.quanxian !== data.ret.qsgx.quanxian,
                access: data.ret.qsgx.quanxian_str
              })
              store.commit('writeRemoteAccess', data.ret.qsgx)
            }
          } else {
            store.commit('backOrigin')            // 未知错误，撤销控制权
            reject({type: 'error'})
          }
        }).catch(e => {
          console.log(e)
          store.commit('backOrigin')             // 网络错误，撤销控制权
          reject({timeout: true})
        })
      })
    }
  }
}
