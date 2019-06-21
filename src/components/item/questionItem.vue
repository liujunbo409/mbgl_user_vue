<template>
  <div class="question-item">
    <header>
      <span class="title">{{ data.title }}</span>
      <span class="date">{{ data.created_at | date }}</span>
    </header>
    <footer>
      <div class="info">
        <span class="answerCount">{{ data.answer_num }}个回答</span>
        <span sclass="followCount">{{ data.attention_num }}人关注</span>
      </div>
      <div class="hasNew" v-if="data.have_new_answer">有新回答</div>
    </footer>
  </div>
</template>

<script>
export default {
  props: ['data'],

  data (){
    return {

    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.question-item{
  background-color: white;
  font-size: 16px;
  border-top: 1px #666 solid;
  padding: 5px 0;

  header, footer{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    box-sizing: border-box;
  }

  header{
    .date{
      color: #aaa;
    }
  }

  footer{
    margin-top: 5px;
    color: #aaa;

    .hasNew{
      background-color: #E51A21;
      padding: 2.5px 10px;
      color: white;
      border-radius: 20px;
      font-size: 14px;
    }
  }
}
</style>
