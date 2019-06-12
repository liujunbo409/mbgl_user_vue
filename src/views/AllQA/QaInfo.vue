<template>
  <div class="com-container">
    <vue-header title="问答题库" :back="() => $emit('input', false)"></vue-header>
    <inline-loading v-if="!qqbank"></inline-loading>
    <template v-else>
      <view-box minus="40px" class="classify">
        <p class="top_text">{{ qqbank.question.question }}</p>
        <p class="top_time">{{ qqbank.question.oper_name }} {{ qqbank.question.updated_at }} 浏览数:{{ qqbank.count.doctor_show_num + qqbank.count.user_show_num }}</p>
        <p>所属分类: {{ qqbank.banks.map(val => val.bankname).join(' > ') }}</p>
        <p v-html="qqbank.question.answer" class="nav-content"></p>
        <p>关联文章:</p>
        <p>文章来源:</p>
        <div class="btn" @click="showFeedback">问答反馈</div>
      </view-box>
      <div
        class="bottom-btn"
        @click="changeState"
        :class="{ disabled: status === 'loading' }"
      >{{ is_collected ? '取消' : '添加' }}收藏</div>
    </template>
    <vue-feedback feedbackType="question" :moduleId="bank_id" :modal="true" class="com-modal"
      v-if="visibleFeedback"
      v-model="visibleFeedback"
    ></vue-feedback>
  </div>
</template>

<script>
import Feedback from '@c/layout/Feedback'
export default {
  props: ['question_id', 'bank_id'],

  components: {
    VueFeedback: Feedback
  },

  data() {
    return {
      qqbank: null,
      user_id: "",
      qa_id: "",
      is_collected: false,
      status: "init",
      clickCount: 0,
      visibleFeedback: false,
    };
  },

  mounted() {
    this.load();
    this.getCollectState();
  },
  
  methods: {
    load() {
      this.$bus.$emit("vux.spinner.show");
      _request({
        url: "qa/info",
        params: {
          question_id: this.question_id,
          bank_id: this.bank_id || 0
        }
      })
      .finally(() => this.$bus.$emit("vux.spinner.hide"))
      .then(({ data }) => {
        if (data.result) {
          this.qqbank = data.ret;
        } else {
          this.$bus.$emit("vux.toast", data.message);
        }
      })
      .catch(e => {
        console.log(e);
        this.$bus.$emit("vux.toast", {
          type: "cancel",
          text: "网络错误"
        });
      });
    },

    getCollectState() {
      _request({
        url: "qa/collect",
        params: {
          qa_id: this.question_id
        }
      })
      .finally(() => this.$bus.$emit("vux.spinner.hide"))
      .then(({ data }) => {
        if (data.result) {
          this.is_collected = !data.ret;
        } else {
          this.$bus.$emit("vux.toast", data.message);
        }
      })
      .catch(e => {
        console.log(e);
        this.$bus.$emit("vux.toast", {
          type: "cancel"
        });
      });
    },

    toggleState() {
      if (this.clickCount > 4) {
        this.$bus.$emit("vux.toast", "您的点击频率过快");
        return;
      }

      this.clickCount++;
      setTimeout(() => this.clickCount--, 10000);

      this.status = "loading";
      _request({
        url: "qa/collectPost",
        method: "post",
        data: {
          qa_id: this.question_id
        }
      })
      .finally(() => this.$bus.$emit("vux.spinner.hide"))
      .then(({ data }) => {
        if (data.result) {
          this.status = "success";
          this.is_collected = !this.is_collected;
          this.$bus.$emit('vux.toast', {
            type: 'success',
            text: '操作成功'
          })
        } else {
          this.status = "error";
          this.$bus.$emit("vux.toast", data.message);
        }
      })
      .catch(e => {
        console.log(e);
        this.status = "error";
        this.$bus.$emit("vux.toast", {
          type: "cancel",
          text: '网络错误'
        });
      });
    },

    showFeedback (){
      this.visibleFeedback = true
    }
  }
};
</script>

<style lang="less" scoped>
.top_text {
  margin: 8px auto;
  text-align: center;
  font-weight: 700;
  font-size: 15px;
}
.top_time {
  text-align: center;
  color: #aaa;
  font-size: 12px;
}
.nav-content {
  padding-left: 5px;
  color: #a9a9a9;
  margin: 10px 0;
}
.btn {
  width: 140px;
  height: 25px;
  line-height: 25px;
  background-color: white;
  text-align: center;
  border-radius: 51px;
  margin-top: 8px;
  border: 1px #aaa solid;
}
.bottom-btn {
  height: 40px;
  line-height: 40px;
  color: white;
  background-color: @theme;
  text-align: center;
}
.classify /deep/ #vux_view_box_body {
  padding: 10px;
  box-sizing: border-box;
}
</style>
