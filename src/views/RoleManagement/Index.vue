<template>
  <div class="com-container">
    <vue-header title="角色管理"></vue-header>
    <template v-if="!isRemoteMode">
      <vux-group class="com-group-noMarginTop">
        <vux-cell title="亲友申请" :is-link="true" @click.native="$toView('role_management/apply_list')">
          <img slot="icon" src="@img/sub/message.png" class="icon">
          <span v-if="applyTotal > 0" class="applyLine">
            <span style="margin-right:10px;">有新的申请</span>
            <vux-badge :text="applyTotal"></vux-badge>
          </span>
        </vux-cell>
      </vux-group>

      <p class="role-table-title">角色列表</p>
      <table class="role-table">
        <tr>
          <th>姓名</th>
          <th>关系</th>
          <th>权限</th>
          <th>操作</th>
        </tr>
        <tr v-for="(item, index) in list" :key="index" class="font-16">
          <td>{{ item.real_name }}</td> 
          <td>{{ item.type }}</td> 
          <td>{{ item.quanxian }}</td> 
          <td><span class="changeBtn"
            :class="{ disabled: !item.status || $store.state.user.userInfo.id === item.user1_id }" 
            @click="changeTo(item.user1_id)"
          >切换</span></td> 
        </tr>
      </table>
    </template>

    <div class="controled">当前控制角色：{{ controledRole }}</div>
    <div class="backOriginBtn" @click="backOrigin" v-if="isRemoteMode">切换原账户</div>
  </div>
</template>

<script>
import { Badge } from 'vux'

export default {
  components: {
    VuxBadge: Badge
  },

  data (){
    return {
      applyTotal: -1,
      list: [],         // 已同意亲友列表
      status: 1
    }
  },

  mounted (){
    this.getApplyTotal()
    this.load()
  },

  computed: {
    controledRole (){
      return this.$store.state.user.userInfo.real_name
    },

    isRemoteMode (){
      return !!this.$store.state.user.userInfo2 
    }
  },

  methods: {
    getApplyTotal (){
      _request({
        url: 'account/getApplyTotal',
      }).then(({data}) =>{
        if(data.result){
          this.applyTotal = data.ret
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        console.log(e)
      })
    },

    load (){
      this.status = 2
      _request({
        url: 'account/getAccountList'
      }).then(({data}) =>{
        if(data.result){
          this.status = 3
          this.list = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.status = 0
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    changeTo (id){
      this.$vux.loading.show()
      _request({
        url: 'account/changeAccount',
        params: {
          relative_id: id
        }
      }).finally(this.$vux.loading.hide)
      .then(({data}) =>{
        this.$store.dispatch('user/changeToRemote', data.ret)
        this.$bus.$emit('vux.alert', '您已成功切换账户，请谨慎操作')
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    backOrigin (){
      this.$store.commit('user/backOrigin')
      this.$bus.$emit('vux.alert', '已切换回原账户')
      Vue.nextTick(() =>{
        this.getApplyTotal()
        this.load()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.icon{
  width: 26px;
  vertical-align: -10px;
  margin-right: 10px;
}

.role-table-title{
  padding: 10px 0;
  text-indent: 10px;
}

.role-table{
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;
  font-size: 16px;
  background-color: white;

  th, td{
    padding: 5px;
  }

  th{
    padding: 10px;
    font-weight: normal;
    border-bottom: 2px #ccc solid;
  }

  td{
    
  }

  .changeBtn{
    display: inline-block;
    .themeBtn;
    padding: 2.5px 10px;
    border-radius: 10px;

    &.disabled{
      background-color: #aaa;
      color: white;
    }
  }
}

.controled{
  font-size: 16px;
  margin-top: 30px;
  text-align: center;
  color: @theme;
  padding: 10px 0;
  background-color: white;
}

.backOriginBtn{
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  @height: 50px;
  height: @height;
  line-height: @height;
  .themeBtn;
  text-align: center;
  font-size: 18px;
}
</style>
