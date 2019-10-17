<template>
  <div class="com-container">
    <vue-header title="医生信息"></vue-header>
    <view-box>
      <header>
        <div class="main-info">
          <div class="icon">
            <img src="@img/sub/head.png" alt="">
          </div>
          <div class="right">
            <div class="realName">{{ data.real_name }}</div>
            <div class="hospital">{{ data.hospital_name }}</div>
            <div class="zhi_wei">{{ data.title }}</div>
          </div>
        </div>
        <div class="sub">
          <div class="followBtn" @click="followToggle" :class="{ followed }">{{ followed ? '取消' : ''}}关注</div>
        </div>
      </header>
      <div class="desc">
        <div class="title">个人简介</div>
        <div class="content">{{ data.desc_cache }}</div>
      </div>
      <div class="czxx">
        <div class="title">出诊信息</div>
        <div class="content">
          <table class="czxx-table">
            <tr>
              <td>时间段</td>
              <td>上午</td>
              <td>下午</td>
              <td>夜间</td>
            </tr>
            <tr v-for="(item, index) in czsjData" :key="index">
              <td>{{ item[0].$prefix }}</td>
              <td v-for="(block, blockInd) in item.filter((val, ind) => ind > 0)" :key="blockInd"
                  v-html="block === null ? '-' : block.time_from + '-' + block.time_to + '<br>' + block.address"
              ></td>
            </tr>
          </table>
        </div>
      </div>
    </view-box>
    <readonly-mask></readonly-mask>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                doctorId: '',
                doctorUserId: '',
                data: {},   // 医生数据
                czsjData: [],   // 出诊计划数据
                followed: false,    // 是否关注
                status: 1,
            }
        },

        mounted() {
            this.doctorId = this.$route.query.doctorId;
            this.doctorUserId = this.$route.query.doctorUserId;
            this.load();
            this.getFollowStatus();
        },

        methods: {
            // 载入数据
            load() {
                this.status = 2;
                this.$vux.loading.show({text: '加载中'});
                _request({
                    url: 'attention/getAttentionDetail',
                    params: {
                        doctor_id: this.doctorUserId
                    }
                }).then(({data}) => {
                    this.$vux.loading.hide();
                    if (data.result) {
                        this.status = 3;
                        this.data = data.ret;
                        // 直接在每组数据前加入星期用来渲染
                        this.czsjData = data.ret.czsjs.map((val, ind) => {
                            var week = ['一', '二', '三', '四', '五', '六', '日'];
                            var val = JSON.parse(JSON.stringify(val));
                            val.unshift({$prefix: `星期${week[ind]}`});
                            return val;
                        })
                    } else {
                        this.stauts = 0;
                        this.bus.emit('vux.toast', data.message);
                    }
                }).catch(e => {
                    this.$vux.loading.hide();
                    this.stauts = 0;
                    console.log(e);
                    this.$bus.$emit('vux.toast', {
                        type: 'cancel',
                        text: '网络错误'
                    })
                })
            },

            // 获取关注状态
            getFollowStatus() {
                _request({
                    url: 'attention/getAttentionStatus',
                    params: {
                        doctor_id: this.doctorId
                    }
                }).then(({data}) => {
                    this.followed = data.result;
                }).catch(e => {
                    console.log(e);
                })
            },

            // 切换关注状态
            followToggle() {
                if (this.status !== 3) {
                    return;
                }
                _request({
                    url: 'attention/changeAttentionStatus',
                    method: 'post',
                    data: {
                        doctor_id: this.doctorId
                    }
                }).then(({data}) => {
                    this.followed = !this.followed;
                    this.$bus.$emit('vux.toast', data.ret);
                }).catch(e => {
                    console.log(e);
                })
            }
        }
    }
</script>

<style lang="less" scoped>
  header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 10px 20px;
    background-color: white;

    .main-info {
      display: flex;
      align-items: center;

      .icon {
        @size: 80px;
        width: @size;
        height: @size;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 1;

        @media screen and (max-width: 330px) {
          width: 50px;
          height: 50px;
        }

        > img {
          background-color: #eee;
          width: 100%;
        }
      }

      .right {
        margin-left: 10px;

        .realName {
          font-weight: bold;
          font-size: 16px;
        }

        .hospital,
        .zhi_wei {
          color: #666;
        }
      }
    }

    .sub {
      .followBtn {
        width: 100px;
        box-sizing: border-box;
        text-align: center;
        display: inline-block;
        padding: 5px 10px;
        color: @theme;
        border: 1px @theme solid;
        border-radius: 10px;
        flex-basis: 100px;
        white-space: nowrap;

        &::before {
          content: '+ ';
          display: inline;
          font-size: 22px;
          line-height: 14px;
          vertical-align: -2px;
        }

        &.followed {
          .themeBtn;

          &::before {
            content: '';
          }
        }
      }
    }
  }

  .desc {
    background-color: white;
    padding: 5px 20px;

    .title {
      font-size: 18px;
    }

    .content {
      text-indent: 2em;
    }
  }

  .czxx {
    margin: 10px 0;
    background-color: white;
    padding: 10px;

    .title {
      font-size: 18px;
      text-indent: 10px;
      margin-bottom: 10px;
    }

    .czxx-table {
      width: 100%;
      text-align: center;
      table-layout: fixed;
      border-collapse: collapse;

      th, td {
        border: 1px #b5d6e6 solid;
        padding: 10px;
      }
    }
  }
</style>
