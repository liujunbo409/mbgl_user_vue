<template>
  <div class="com-container">
    <!-- 样式需要修改 -->
    <p class="top-head">获取您的定制学习计划</p>
    <p>只需<span style="color:#FFF; font-size:20px;">3</span>步</p>
    <p class="w-fontt">1.完善个人信息</p>
    <p class="w-fontt">2.维护基本病情</p>
    <p class="w-fontt">3.填写调查问卷</p>
    <img src="@img/home/doctor.png">

    <div class="o-btn">生成学习计划</div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },

  methods: {}
}
</script>

<style lang="less" scoped>
.com-container {
  background-color: #30ead6;
  font-size: 26px;
  text-align: center;
  overflow: auto;
}
p{
  letter-spacing: 5px;
  line-height: 40px;
    padding-top: 28px;
}
.com-container .top-head {
  width: 380px;
  height: 40px;
}
img {
  padding-top: 15px;
  width: 80%;
}
.o-btn{
  background-color: #E19C00;
  color: #ffffff;
  width: 70%;
  line-height: 67px;
  border-radius: 39px;
  display: inline-block;
}
.w-fontt {
  color: #ffffff;
}

</style>
