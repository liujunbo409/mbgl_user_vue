<template>
  <div>
    <vue-header title="选择角色"></vue-header>
    <div v-if="show_flag">
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-if="index != 'nurse_info'" v-for="(role,index) in user_role" :key="index" :title="role_info[index].name" :is-link="true"
                  @click.native="$toView('follow_doctors/doctor_info', {
          query: { doctorUserId: role.user_id, doctorId: role.id, role_sign:index }
        })"
        ></vux-cell>
      </vux-group>
    </div>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                show_flag: false,
                UserId: null,
                user_role: null,
                role_info: {
                    doctor_info: {
                        name: '医生'
                    },
                    nurse_info: {
                        name: '护士'
                    },
                }
            }
        },
        mounted() {
            this.UserId = this.$route.query.UserId;
            this.getUserRole();
        },
        methods: {
            getUserRole() {
                _request({
                    url: 'attention/getUserRole',
                    params: {
                        doctor_id: this.UserId
                    }
                }).then(res => {
                    this.user_role = res.data.ret.role_list;

                    // console.log(JSON.stringify(this.user_role));
                    this.show_flag = true;
                });
            }
        }
    }
</script>

<style scoped>

</style>
