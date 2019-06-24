<template>
  <div class="com-container">
    <vue-header title="搜索医生"></vue-header>
    <header>
      <div class="com-input-container">
        <input type="text" v-model.trim="keyword">
      </div>
      <div class="searchBtn font-18" @click="search">搜索</div>
    </header>
    <p class="searchResultTitle font-18">搜索结果</p>
    <vux-group>
      <vux-cell v-for="(item, index) in searchResultData" :key="index" :is-link="true"
        :title="item.real_name"
        @click.native="$toView('follow_doctors/doctor_info', { 
          query: { doctorUserId: item.doctor.user_id, doctorId: item.doctor.id } 
        })"
      ></vux-cell>
      <!-- 注意上面query中doctorId的位置，和同级两个组件中位置的不一样 -->
      <vux-cell class="noData" title="搜索结果为空" v-if="status === 3 && !searchResultData.length"></vux-cell>
    </vux-group>
  </div>
</template>

<script>
export default {
  data (){
    return {
      keyword: '',
      searchResultData: [],
      status: 1
    }
  },

  beforeRouteEnter (to, from, next){
    to.meta.clearMark = from.name !== 'follow_doctors/doctor_info'  // 如果不是从医生详细信息里返回的，则重置组件
    next()
  },

  activated (){
    if(this.$route.meta.clearMark){ this.init() }
  },

  methods: {
    init (){
      this.keyword = ''
      this.searchResultData = []
      this.status = 1
    },

    search (){
      if(!this.keyword){
        this.$bus.$emit('vux.toast', '搜索关键词不能为空')
        return
      }
      this.status = 2
      this.$vux.loading.show('搜索中')
      _request({
        url: 'attention/getAttentionDoctorsByRealName',
        params: {
          search_word: this.keyword
        }
      })
      .finally(this.$vux.loading.hide)
      .then(({data}) =>{
        if(data.result){
          this.status = 3
          this.searchResultData = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
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
header{
  display: flex;
  font-size: 18px;

  @height: 40px;
  .com-input-container{
    flex-grow: 1;
    height: @height;
    background-color: white;
    padding: 0 10px;
    border-radius: 0 10px 10px 0;
  }

  .searchBtn{
    height: @height;
    line-height: @height;
    flex-basis: 3em;
    text-align: center;
    color: @theme;
  }
}

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
