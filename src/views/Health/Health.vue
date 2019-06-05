<template>
  <div class="com-container">
    <vue-header title="基本病情"></vue-header>
    <inline-loading v-if="status === 'loading'"></inline-loading>
    <view-box class="view-box" v-if="status === 'success'">
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="({ill_name, ill_id, stage}, index) in list" :key="index" 
          :title="ill_name" :is-link="true"
          @click.native="$toView('health/ill_info/index', { params: { illId: ill_id } })"
        >
          <span class="com-cell-text" :class="{ done: stage === 100 }">
            完成度：{{ stage }}%
          </span>
        </vux-cell>
        <div class="noData" v-if="!list.length">暂未添加任何疾病</div>
      </vux-group>
    </view-box>
    <div class="addIllBtn" @click="$toView('health/add_ill')" v-if="status === 'success'">+ 添加疾病</div>
    <div class="com-reloadBtn" @click="load" v-if="status === 'error'">重新加载</div>
  </div>
</template>

<script>

export default {

  data (){
    return {
      list: [],
      status: 'init'
    }
  },

  mounted (){
    this.load()
  },

  methods: {
    load (){
      this.status = 'loading'
      _request({
        url: 'jkda/getJKDAIllList'
      }).then(({data}) =>{
        if(data.result){
          this.status = 'success'
          this.list = data.ret
        }
      }).catch(e =>{
        this.status = 'error'
        console.log(e)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.view-box{
  height: auto !important;
  max-height: calc(~'100% - 76px'); 
  height: auto;
  overflow: auto;
}

.noData{
  line-height: 60px;
  text-align: center;
  background-color: white;
  font-size: 18px;
}

.addIllBtn{
  color: @theme;
  text-align: center;
  font-size: 18px;
  line-height: 20px;
  font-weight: bold;
}

.done{
  color: @success;
}
</style>
