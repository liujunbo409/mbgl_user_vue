<template>
  <div class="com-container">
    <vue-header title="公开提问"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box v-if="status === 3">
      <main>
        <p class="title">选择要提问的疾病</p>
        <p class="subtitle">我关注的疾病</p>
        <div class="illBox-container">
          <div class="illBox" v-for="(item, index) in selectedList" :key="index"
            @click="$toView('open_qa', { params: { select: item.ill_id } })"
          >{{ item.ill_name }}</div>
        </div>

        <p class="subtitle">更多疾病</p>
        <div class="illBox-container">
          <div class="illBox" v-for="(item, index) in otherList" :key="index"
            @click="toOpenQACarryIll(item)"
          >{{ item.name }}</div>
        </div>
      </main>
    </view-box>
  </div>
</template>

<script>
export default {
  data (){
    return {
      selectedList: [],
      otherList: [],
      status: 1
    }
  },

  activated (){
    // 已选列表疾病列表从qa_info里拿（接收）
    if(this.$route.params.selectedIllList){
      this.selectedList = this.$route.params.selectedIllList
    }
    this.getOtherIllList()
  },

  methods: {
    getOtherIllList (){
      this.status = 2
      _request({
        url: 'jkda/otherIll',
      }).then(({data}) =>{
        if(data.result){
          this.otherList = data.ret
          this.status = 3
        }else{
          this.$bus.$emit('vux.toast', data.message)
          this.status = 0
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

    toOpenQACarryIll (ill){
      var add = {
        ill_name: ill.name,
        ill_id: ill.id
      }
      this.$toView('open_qa', { params: { add } })
    }
  }
}
</script>

<style lang="less" scoped>
.com-container{
  background-color: white;
  text-align: center;

  main{
    padding: 10px;

    .title{
      font-size: 20px;
      line-height: 50px;
    }

    .subtitle{
      font-size: 18px;
      line-height: 35px;
    }
    
    .illBox-container{
      padding: 20px 0;

      .illBox{
        display: inline-block;
        width: 35%;
        padding: 10px;
        text-align: center;
        border: 1px #ccc solid;
        margin: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
