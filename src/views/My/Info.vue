<template>
  <div class="com-container">
    <vue-header title="个人信息"></vue-header>
    <vux-group class="com-group-noMarginTop">
      <user-info-item title="姓名" :value="userInfo.real_name"
                      @input="value => userInfo.real_name = value"></user-info-item>
      <user-info-item title="昵称" :value="userInfo.nick_name"
                      @input="value => userInfo.nick_name = value"></user-info-item>
      <user-info-item title="性别" type="btn" :value="_gender" @click.native="openGenderSelect"></user-info-item>
      <datetime title="生日" placeholder="请选择" v-model="userInfo.birthday" :min-year=1900
                :class="{ hasValue: userInfo.birthday }"/>
      <user-info-item title="学历" type="btn" :value="_xueli" @click.native="openXueliSelect"></user-info-item>
      <user-info-item title="联系方式" :value="userInfo.phonenum"
                      @input="value => userInfo.phonenum = value"></user-info-item>
    </vux-group>
    <p class="hint font-12">*理理健康将严格保护您的信息安全</p>
    <div class="com-box mainBtn">
      <x-button text="保存信息" :disabled="disabled" @click.native="saveInfo"></x-button>
    </div>
    <readonly-mask></readonly-mask>
  </div>
</template>

<script>
    import {XButton, Actionsheet, Datetime} from 'vux'
    import UserInfoItem from '@c/cell/UserInfoItem'


    import localStorage from '@u/localStorage'

    export default {
        components: {
            XButton, Actionsheet, Datetime, UserInfoItem,
        },

        data() {
            return {
                // 访问不到计算属性，只能这么写
                userInfo: {
                    real_name: this.$store.state.user.userInfo.real_name || '',
                    nick_name: this.$store.state.user.userInfo.nick_name || '',
                    gender: this.$store.state.user.userInfo.gender,
                    birthday: this.$store.state.user.userInfo.birthday,
                    xueli: this.$store.state.user.userInfo.xueli,
                    phonenum: this.$store.state.user.userInfo.phonenum || '',

                },

                map: {
                    xueli: {},
                },

                disabled: false
            }
        },

        // 未录入信息禁止退出该组件
        beforeRouteLeave(to, from, next) {
            if (!localStorage.get('isInfoEdited', false)) {
                this.$bus.$emit('vux.toast', '必须录入信息后才能开始使用')
            } else {
                next()
            }
        },

        mounted() {
            // 初始化常量映射表
            this.$store.dispatch('constText/get', 'xueli_val').then(data => this.map.xueli = data)
        },

        computed: {
            _gender() {
                return {
                    1: '男',
                    2: '女'
                }[this.userInfo.gender] || null
            },

            _xueli() {
                if (Object.keys(this.map.xueli).length) {
                    return this.map.xueli[this.userInfo.xueli] || null
                } else {
                    return ''
                }
            },

            isRemoteMode() {
                return !!this.$store.state.user.userInfo2
            }
        },

        methods: {
            ifRemoteThenStop(e) {
                if (this.isRemoteMode) {
                    e.stopImmediatePropagation();
                }
            },

            // 开启性别选项菜单
            openGenderSelect() {
                this.$bus.$emit('vux.actionsheet', {
                    menus: {
                        1: '男', 2: '女'
                    },

                    onClick: (key, item) => {
                        this.userInfo.gender = key
                    },

                    onMask: () => {
                        this.userInfo.gender = 1
                    }
                })
            },

            // 开启学历选项菜单
            openXueliSelect() {
                // 排序
                var sort = ['04', '03', '21', '31', '41', '51', '70', '80', '90']
                var menus = sort.map(key => {
                    return {
                        label: this.map.xueli[key],
                        value: key
                    }
                })

                this.$bus.$emit('vux.actionsheet', {
                    menus,
                    onClick: (key, item) => {
                        this.userInfo.xueli = key
                    }
                })
            },

            // 保存信息
            saveInfo() {
                var msg = text => this.$bus.$emit('vux.toast', text)
                var userInfo = JSON.parse(JSON.stringify(this.userInfo))
                var {real_name, nick_name, phonenum, ID_number} = userInfo

                if (Object.values(userInfo).some(val => val === '' || val === null)) {
                    msg('请检查是否有未填项')
                    return
                }
                if (!/^[\u4E00-\u9FA5a-z・]{2,20}$/.test(real_name)) {
                    msg('姓名不符合规范')
                    return
                }
                if (!/^.{1,20}$/.test(nick_name)) {
                    msg('昵称只能在1到20个字之间')
                    return
                }
                if (!/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/.test(phonenum)) {
                    msg('请输入正确的手机号')
                    return
                }

                this.disabled = true
                this.$vux.loading.show()
                this.$store.dispatch('user/editInfo', this.userInfo)
                    .finally(() => {
                        this.disabled = false
                        this.$vux.loading.hide()
                    })
                    .then(data => {
                        return this.$store.dispatch('user/editStatus/get')
                    })
                    .then(() => {
                        this.$bus.$emit('vux.alert', '信息修改成功', {
                            onHide: () => {
                                if (localStorage.get('originalTargetUrl', location.href).split('/')[6] == 'follow_doctors'
                                    && localStorage.get('originalTargetUrl', location.href).split('/')[7].split('?')[0] == 'role_select') {
                                    let to_view = localStorage.get('originalTargetUrl', location.href).split('?')[0].split('/');
                                    to_view = to_view[6] + '/' + to_view[7];
                                    let user_id = localStorage.get('originalTargetUrl', location.href).split('?')[1].split('&')[0].split('=')[1];
                                    let auto_follow = localStorage.get('originalTargetUrl', location.href).split('?')[1].split('&')[1].split('=')[1];
                                    this.$toView(to_view, {query: {UserId: user_id, autoFollow: auto_follow}});
                                } else {
                                    this.$toView('home');
                                }
                            }
                        })
                    })
                    .catch(e => {
                        if (e.timeout) {
                            msg('网络错误')
                        }
                    })
            }
        }
    }
</script>

<style lang="less" scoped>
  /deep/ .vux-datetime-value {
    padding-right: 0 !important;

    &::after {
      display: none !important;
    }
  }

  /deep/ .vux-datetime {
    .vux-cell-value {
      color: black;
    }
  }

  .mainBtn {
    margin-top: 20px;
  }

  .hint {
    font-size: 12px;
    margin: 15px 10px 15px;
    color: #e51c23;
  }
</style>
