<template>
  <div class="com-container">
    <vue-header title="请稍候" :visibleHomeBtn="false"></vue-header>
    <view-box>
      <div class="slogan">
        <p>本公众号致力于疾病健康教育</p>
        <p>完善健康档案与调查问卷</p>
        <p>可生成专属于你的个性教学计划</p>
      </div>
      <img src="http://twst.isart.me/image/wait_1547608075269.png" class="banner">

      <div class="creatingLine"></div>
      <p class="prompt">正在为您生成学习计划</p>
    </view-box>
  </div>
</template>

<script>
export default {
  data (){
    return {
      illId: '',
      count: 0    // 最多允许轮询20次
    }
  },

  mounted (){
    this.illId = this.$route.params.illId
    this.check()
  },

  methods: {
    // 轮询检查是否生成完毕
    check (){
      if(this.count > 20){    // 最多20次
        this.$router.replace({
          name: 'health/ill_info/index',
          params: { illId: this.illId }
        })
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
        
        return
      }
      _request({
        url: 'wj/waitPanduan',
        params: {
          ill_id: this.illId
        }
      }).then(({data}) =>{
        if(data.result){
          this.$router.replace({
            name: 'learning_plan'
          })
          this.$bus.$emit('vux.alert', '已为您生成学习计划')
        }else{
          this.count++
          setTimeout(() => {
            this.check();
            console.log(`data == ${JSON.stringify(data)}`)
            console.log(`????  ${this.count}`);
          }, 5000)
          // this.check()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.com-container{
  background-color: white;
}

.slogan{
  font-size: 18px;
  font-weight: bold;

  > p{
    line-height: 60px;
    text-align: center;
  }
}

.banner{
  width: 70%;
  margin: 0 auto;
  margin-top: 20px;
  display: table;
}

.creatingLine{
  width: 90%;
  margin: 0 auto;
  height: 25px;
  border-radius: 20px;
  background-image: repeating-linear-gradient(-45deg, #007DFF, #007DFF 20px, #2ECCFA 0, #2ECCFA 40px);
  background-repeat: no-repeat;
  background-size: 100% 99999px;
  animation: foo 2000s;
}

@keyframes foo{
  to{
    background-position: 0 -99999px; 
  }
}

.prompt{
  font-size: 19px;
  font-weight: bold;
  color: @theme;
  text-align: center;
  margin-top: 20px;
}
</style>
