<template>
  <div class="com-container">
    <vue-header title="基本病情"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box class="view-box" v-if="status === 3 && !no_remove">
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="({ill_name, ill_id, stage}, index) in list" :key="index"
                  :title="ill_name" :is-link="true"
                  @click.native="$toView('health/ill_info/index', { params: { illId: ill_id } })">
          <span class="com-cell-text" :class="{ done: stage === 100 }">完成度：{{ stage }}%</span>
        </vux-cell>
        <div class="noData" v-if="!list.length">暂未添加任何疾病</div>
      </vux-group>
    </view-box>
    <view-box class="view-box" v-if="status === 3 && no_remove">
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="({ill_name, id}, index) in list" :key="index"
                  :title="ill_name" :is-link="true"
                  @click.native="deleteIll(id,index)">
          <span class="com-cell-text" style="color: red;">删除</span>
        </vux-cell>
        <div class="noData" v-if="!list.length">暂未添加任何疾病</div>
      </vux-group>
    </view-box>
    <div style=" width: 100%;display: flex;justify-content: center;">
      <div class="addIllBtn font-16" style="width: 50%;display: flex;justify-content: center"
           v-if="status === 3 && !no_remove"><span @click="$toView('health/add_ill')">+ 添加疾病</span>
      </div>
      <div class="delIllBtn font-16" style="width: 50%;display: flex;justify-content: center"
           v-if="status === 3 && !no_remove"><span @click="deleteIll()">- 删除疾病</span>
      </div>
      <div class="addIllBtn font-16" style="width: 50%;display: flex;justify-content: center"
           v-if="status === 3 && no_remove"><span @click="deleteIll()">取消删除</span>
      </div>
    </div>
    <div class="com-reloadBtn" @click="load" v-if="!status">重新加载</div>
  </div>
</template>

<script>

    export default {
        data() {
            return {
                list: [],     // 已添加疾病列表
                status: 1,
                no_remove: false, //是否删除
            }
        },

        mounted() {
            this.load()
        },

        methods: {
            deleteIll(id,index) {
                if (!id) {
                    this.no_remove = !this.no_remove;
                } else {
                    _request({
                        url: 'jkda/removeIll',
                        method: 'post',
                        data: {
                            user_jkda_ill_id: id
                        }
                    }).then(({data}) => {
                        if (data.result) {
                            this.$bus.$emit('vux.toast', {
                                type: 'success',
                                text: '删除成功'
                            });
                            this.list.splice(index,1);
                        } else {
                            this.$bus.$emit('vux.toast', data.message)
                        }
                    })
                }
            },
            load() {
                this.status = 2;
                _request({
                    url: 'jkda/getJKDAIllList'
                }).then(({data}) => {
                    if (data.result) {
                        this.status = 3;
                        this.list = data.ret;
                    }
                }).catch(e => {
                    this.status = 0;
                    console.log(e)
                })
            }
        }
    }
</script>

<style lang="less" scoped>
  .view-box {
    height: auto !important;
    max-height: calc(~'100% - 76px');
    height: auto;
    overflow: auto;
  }

  .noData {
    line-height: 60px;
    text-align: center;
    background-color: white;
    font-size: 18px;
  }

  .addIllBtn {
    color: @theme;
    font-size: 18px;
    line-height: 20px;
    font-weight: bold;
    margin-top: 20px;
  }

  .delIllBtn {
    color: @danger;
    font-size: 18px;
    line-height: 20px;
    font-weight: bold;
    margin-top: 20px;
  }

  .done {
    color: @success;
  }
</style>
