<template>
  <div class="com-container">
    <x-header title="选择疾病" :left-options="{
        showBack: false,
      }" class="header">

    </x-header>
    <vux-checker v-model="selec_ill_list_index"
                 class="checkers-container"
                 default-item-class="checkers"
                 selected-item-class="selected"
    >
      <checker-item v-for="({id, name}, index) in ill_list" :key="index" :value="index">{{ name }}</checker-item>
    </vux-checker>
    <div class="mainBtn-container">
      <x-button @click.native="next">下一步</x-button>
    </div>
  </div>
</template>
<script>
  import {XButton, Checker, CheckerItem, XHeader} from 'vux'
  export default {
    components: {
      XButton, VuxChecker: Checker, CheckerItem, XHeader
    },
    props: {
      back: {
        default: null
      }
    },
    data() {
      return {
        ill_list: [],     // 可选疾病列表
        selec_ill_list_index: '',
      }
    },
    mounted() {
      _request({
        baseURL: Vue._GLOBAL.comApi,
        url: 'baseIllList',
      }).then(({data}) => {
        if (data.result) {
          this.ill_list = data.ret
        }
      }).catch(e => {
        console.log(e)
      })
    },
    methods: {
      //下一步
      next() {
        if (!this.selec_ill_list_index){
          this.$bus.$emit('vux.toast', {type: 'text', text: '请选择疾病'});
          return;
        }
        let query = {ill_id:this.ill_list[this.selec_ill_list_index].id,ill_name:this.ill_list[this.selec_ill_list_index].name};
        this.$router.push({path: 'course', query: query});
      }
    }
  }
</script>

<style lang="less" scoped>
  .option {
  }
  .mainBtn-container {
    padding: 0 10px;
    margin-top: 50px;
  }
  .noData {
    line-height: 60px;
    text-align: center;
    background-color: white;
    font-size: 18px;
  }
  .checkers-container {
    text-align: center;
    padding-top: 50px;
  }
  .checkers {
    padding: 7px 14px;
    border: 1px #ccc solid;
    border-radius: 20px;
    margin: 10px;
    margin-top: 0;
    background-color: white;
  }
  .selected {
    background-color: @theme;
    border-color: @theme;
    color: white;
  }
</style>
