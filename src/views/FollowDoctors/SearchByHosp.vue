<template>
  <div class="com-container">
    <vue-header title="搜索医生"></vue-header>
    <vux-group class="com-group-noMarginTop">
      <vux-selector v-model="selectedHosp" title="选择医院" placeholder="未选择"
        :options="hospList.map(val => ({ key: val.id, value: val.name }))"
      ></vux-selector>
    </vux-group>

    <p class="searchResultTitle">搜索结果</p>
    <vux-group>
      <vux-cell v-for="(item, index) in byHospData" :key="index" :is-link="true"
        :title="item.real_name"
        @click.native="$toView('follow_doctors/doctor_info', { 
          query: { doctorUserId: item.user_id, doctorId: item.id }
        })"
      ></vux-cell>
      <!-- 注意上面query中doctorId的位置，和同级两个组件中位置的不一样 -->
      <vux-cell class="noData" title="搜索结果为空" v-if="status === 3 && isNoData"></vux-cell>
    </vux-group>
  </div>
</template>

<script>
import { Selector } from 'vux'

export default {
  components: {
    VuxSelector: Selector
  },  

  data (){
    return {
      selectedHosp: '',
      byHospData: {},
      status: 1
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
    
    isNoData (){
      return !Object.keys(this.byHospData).length
    }
  },
  
  watch: {
    selectedHosp (){
      this.getDoctorsByHospId()
    }
  },

  methods: {
    init (){
      this.selectedHosp = ''
      this.byHospData = {}
      this.status = 1
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
      this.status = 2
      this.$vux.loading.show({ text: '加载中' })
      _request({
        url: 'attention/getAttentionDoctorsByHospital',
        params: {
          hospital: this.selectedHosp
        }
      }).then(({data}) =>{
        this.$vux.loading.hide()
        if(data.result){
          this.status = 3
          this.byHospData = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.$vux.loading.hide()
        console.log(e)
        this.status = 0
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
