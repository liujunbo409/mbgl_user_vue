<template>
  <div class="com-container">
    <p class="top-head">获取您的定制学习计划</p>
    <p>只需<span style="color:#FFF; font-size:30px;">3</span>步</p>
    <p class="text">1.完善个人信息</p>
    <p class="text">2.维护基本病情</p>
    <p class="text">3.填写调查问卷</p>
    <img src="/static/images/doctor.png">

    <div class="mainBtn" @click="$toView('register')">立即注册完善信息</div>
  </div>
</template>

<script>
  export default {
    data() {
      return {}
    },

    computed: {
      isReadonly() {
        return this.$store.state.user.userInfo2 && this.$store.state.user.userInfo.qsgx.quanxian === 1
      }
    },

    methods: {
    }
  }
</script>

<style lang="less" scoped>
  .com-container {
    background-color: #30EAD6;
    font-size: 26px;
    text-align: center;

    @media screen and (max-width: 330px) {
      font-size: 20px;

      p {
        line-height: 16px;
      }
    }
  }

  p {
    letter-spacing: 3px;
    line-height: 20px;
    padding-top: 28px;
  }

  img {
    padding-top: 15px;
    width: 80%;
  }

  .mainBtn {
    background-color: #FF9C00;
    color: #ffffff;
    width: 70%;
    line-height: 50px;
    border-radius: 39px;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .text {
    color: #ffffff;
  }

</style>
