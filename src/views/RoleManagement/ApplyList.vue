<template>
  <div class="com-container">
    <vue-header title="申请列表"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box class="com-header-view" >
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="(item, index) in list" :key="index"
          class="item"
          :title="item.real_name"
          :inline-desc="'手机号码：' + item.phonenum"
        >
          <div class="btn resolve" @click="reply(true, item.id)">同意</div>
          <div class="btn reject" @click="reply(false, item.id)">拒绝</div>
        </vux-cell>
        <vux-cell class="noData" title="暂无申请" v-if="status === 3 && !list.length"></vux-cell>
      </vux-group>
    </view-box>
  </div>
</template>

<script>
export default {
  data (){
    return {
      list: [],     // 申请列表
      status: 1
    }
  },

  mounted (){
    this.load()
  },

  methods: {
    // 获取申请列表
    load (){
      this.status = 2
      _request({
        url: 'account/getShenqingList'
      }).then(({data}) =>{
        if(data.result){
          this.status = 3
          this.list = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 同意或拒绝申请
    reply (isResolve = true, apply_id){
      console.log(apply_id)
      this.$vux.confirm.show({
        title: '提示',
        content: `确定要${isResolve ? '同意' : '拒绝'}申请吗？`,
        onConfirm: () =>{
          var url = isResolve ? 'account/agreeShenqing' : 'account/refuseShenqing'
          _request({ 
            url,
            method: 'post',
            data: { apply_id }
          }).then(({data}) =>{
            if(data.result){
              this.$bus.$emit('vux.alert', '操作成功')
              this.load()
            }else{
              this.$bus.$emit('vux.toast', data.message)
            }
          }).catch(e =>{
            console.log(e)
            this.$bus.$emit('vux.toast', {
              type: 'cancel',
              text: '网络错误'
            })
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.btn{
  display: table;
  padding: 5px 10px;
  margin: 5px;
  .themeBtn;
  border-radius: 10px;

  &.reject{
    background-color: @danger;
  }
}

.noData{
  text-align: center;
}
</style>
