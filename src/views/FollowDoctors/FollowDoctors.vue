<template>
  <div class="com-container">
    <vue-header title="关注列表"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <template v-if="status === 3">
      <div class="noData" v-if="isNoData">您还未关注任何医生</div>
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="(item, index) in data" :key="index" :is-link="true"
                  :title="item.doctor.real_name"
                  @click.native="$toView('follow_doctors/doctor_info', {
          query: { doctorUserId: item.doctor.user_id, doctorId: item.doctor.id }
        })"
        ></vux-cell>
        <!-- 注意上面query中doctorId的位置，和同级两个组件中位置的不一样 -->
      </vux-group>
      <footer>
        <div class="btn" @click="$toView('follow_doctors/search')">搜索医生</div>
        <div v-if="false" class="btn" @click="$toView('follow_doctors/search_by_hosp')">医院查找医生</div>
      </footer>
    </template>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                data: [],         // 已关注医生数据
                status: 1,
            }
        },

        mounted() {
            this.load()
        },

        computed: {
            // 拿回的数据格式为对象，需要这样判断是否为空
            isNoData() {
                return this.status === 3 && !Object.keys(this.data).length
            }
        },

        methods: {
            // 载入数据
            load() {
                this.status = 2
                _request({
                    url: 'attention/getAttentionDoctors'
                }).then(({data}) => {
                    if (data.result) {
                        this.status = 3
                        this.data = data.ret
                    } else {
                        this.status = 0
                        this.$bus.$emit('vux.toast', data.message)
                    }
                }).catch(e => {
                    this.status = 0
                    console.log(e)
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
  .noData {
    line-height: 40px;
    text-align: center;
    background-color: white;
    font-size: 16px;
  }

  footer {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;

    .btn {
      width: 35%;
      padding: 5px;
      .themeBtn;
      display: inline-block;
      text-align: center;
      border-radius: 5px;
    }
  }
</style>
