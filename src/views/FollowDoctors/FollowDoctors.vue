<template>
  <div class="com-container">
    <vue-header title="关注列表"></vue-header>
    <inline-loading v-if="status === 'loading'"></inline-loading>
    <template v-if="status === 'success'">
      <div class="noData" v-if="isNoData">您还未关注任何医生</div>
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="(item, index) in data" :key="index" :is-link="true"
          :title="item.doctor.real_name"
          @click.native="$toView('follow_doctors/doctor_info', { 
            query: { doctorUserId: item.doctor.user_id, doctorId: item.doctor_id } 
          })"
        ></vux-cell>
      </vux-group>
      <footer>
        <div class="btn" @click="$toView('follow_doctors/search')">搜索关注医生</div>
        <div class="btn" @click="$toView('follow_doctors/search_by_hosp')">医院查找医生</div>
      </footer>
    </template>
  </div>
</template>

<script>
export default {
  data (){
    return {
      data: [],
      status: 'init'
    }
  },

  mounted (){
    this.load()
  },

  computed: {
    // 拿回的数据格式为对象，需要这样判断是否为空
    isNoData (){
      return this.status === 'success' && !Object.keys(this.data)
    }
  },

  methods: {
    // 载入数据
    load (){
      this.status = 'loading'
      _request({
        url: 'attention/getAttentionDoctors'
      }).then(({data}) =>{
        if(data.result){
          this.status = 'success'
          this.data = data.ret
        }else{
          this.status = 'error'
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.status = 'error'
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.noData{
  line-height: 30px;
  text-align: center;
  background-color: white;
  font-size: 16px;
}

footer{
  display: flex;
  justify-content: space-around;
  margin-top: 10px;

  .btn{
    width: 35%;
    padding: 5px;
    .themeBtn;
    display: inline-block;
    text-align: center;
    border-radius: 5px;
  }
}
</style>
