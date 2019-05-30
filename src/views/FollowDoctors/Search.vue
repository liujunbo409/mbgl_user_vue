<template>
  <div class="com-container">
    <vue-header title="搜索医生"></vue-header>
    <header>
      <div class="com-input-container">
        <input type="text" v-model.trim="keyword">
      </div>
      <div class="searchBtn" @click="search">搜索</div>
    </header>
    <p class="searchResultTitle">搜索结果</p>
    <vux-group>
      <vux-cell v-for="(item, index) in data" :key="index" :is-link="true"
        :title="item.real_name"
        @click.native="$toView('follow_doctors/doctor_info', { 
          query: { doctorUserId: item.doctor.user_id, doctorId: item.doctor_id } 
        })"
      ></vux-cell>
      <vux-cell class="noData" title="搜索结果为空" v-if="status === 'success' && !data.length"></vux-cell>
    </vux-group>
  </div>
</template>

<script>
export default {
  data (){
    return {
      keyword: '',
      data: [],
      status: 'init'
    }
  },

  methods: {
    search (){
      if(!this.keyword){
        this.$bus.$emit('vux.toast', '搜索关键词不能为空')
        return
      }
      this.status = 'loading'
      _request({
        url: 'attention/getAttentionDoctorsByRealName',
        params: {
          search_word: this.keyword
        }
      }).then(({data}) =>{
        if(data.result){
          this.status = 'success'
          this.data = data.ret
        }else{
          this.status = 'error'
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
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
