<template>
  <div class="com-container">
    <vue-header title="搜索医生"></vue-header>
    <vux-group class="com-group-noMarginTop">
      <vux-cell title="选择医院" :value="showSelectedHosp" @click.native="openHospList"></vux-cell>
    </vux-group>

    <p class="searchResultTitle">搜索结果</p>
    <vux-group>
      <vux-cell v-for="(item, index) in data" :key="index" :is-link="true"
        :title="item.real_name"
        @click.native="$toView('follow_doctors/doctor_info', { 
          query: { doctorUserId: item.user_id, doctorId: item.id }
        })"
      ></vux-cell>
      <!-- 注意上面query中doctorId的位置，和同级两个组件中位置的不一样 -->
      <vux-cell class="noData" title="搜索结果为空" v-if="status === 'success' && isNoData"></vux-cell>
    </vux-group>
  </div>
</template>

<script>
export default {
  data (){
    return {
      selectedHosp: '',
      data: {},
      status: 'init'
    }
  },

  beforeRouteEnter (to, from, next){
    to.meta.clearMark = from.name !== 'follow_doctors/doctor_info'  // 如果不是从医生详细信息里返回的，则重置组件
    next()
  },

  activated (){
    if(this.$route.meta.clearMark){ this.init() }
    this.$store.dispatch('hospList/load')       // 载入医院列表
  },

  computed: {
    hospList (){
      return this.$store.getters['hospList/plain']
    },
    
    // 拿id去列表中查name
    showSelectedHosp (){
      if(!this.selectedHosp){ return '未选择' }
      this.getDoctorsByHospId()
      return this.hospList.filter(val => val.id === this.selectedHosp)[0].name
    },
    
    isNoData (){
      return !Object.keys(this.data).length
    }
  },

  methods: {
    init (){
      this.selectedHosp = ''
      this.data = {}
      this.status = 'init'
    },

    // 打开医院选择列表
    openHospList (){
      this.$bus.$emit('vux.actionsheet', {
        menus: this.hospList.map(val => ({ label: val.name, value: val.id })),

        onClick: key =>{
          this.selectedHosp = key
        }
      })
    },

    // 用医院id获取医生集
    getDoctorsByHospId (){
      this.status = 'loading'
      this.$vux.loading.show({ text: '加载中' })
      _request({
        url: 'attention/getAttentionDoctorsByHospital',
        params: {
          hospital: this.selectedHosp
        }
      }).then(({data}) =>{
        this.$vux.loading.hide()
        if(data.result){
          this.status = 'success'
          this.data = data.ret
        }else{
          this.status = 'error'
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.$vux.loading.hide()
        console.log(e)
        this.status = 'error'
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
.searchResultTitle{
  text-indent: 10px;
  font-size: 18px;
  margin-top: 10px;
  border-bottom: 2px @theme solid;
  padding-bottom: 3px;
}

.noData{
  text-align: center;
}
</style>
