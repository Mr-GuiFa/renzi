<template>
  <div>
    <el-card class="container">
      <el-tabs>
        <el-tab-pane label="登录账户设置">
          <el-form ref="fromRef" :model="formData" :rules="rules" class="form" label-width="120px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" style="width:40%" />
            </el-form-item>
            <el-form-item label="密码" prop="password2">
              <el-input v-model="formData.password2" style="width:40%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUser">更新</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="个人详情">
          <component :is="UserInfo" />
        </el-tab-pane>
        <el-tab-pane label="岗位信息">
          <component :is="JobInfo" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { getUserDetailById } from '@/api/user'
import { saveUserDetailById } from '@/api/employees'
import UserInfo from '@/views/employees/components/user-info.vue'
import JobInfo from '@/views/employees/components/job-info.vue'
export default {
  components: {
    UserInfo,
    JobInfo
  },
  data() {
    return {
      UserInfo: 'UserInfo',
      JobInfo: 'JobInfo',
      formData: {
        name: '',
        // 防止后端加密密码在前端展示
        password2: ''
      },
      rules: {
        name: [
          { required: true, trigger: 'blur', message: '姓名不能为空' }
        ],
        password2: [
          { required: true, trigger: 'blur', message: '密码不能为空' },
          { min: 3, max: 6, trigger: 'blur', message: '密码3~6位数' }

        ]
      }
    }
  },
  //  获取用户信息
  created() {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      this.formData = await getUserDetailById(this.$route.params.id)
    },
    async updateUser() {
      await this.$refs.fromRef.validate()
      try {
        await saveUserDetailById(
          {
            ...this.formData,
            password: this.formData.password2
          })
        this.$message.success('更新成功')
      } catch (e) {
        this.$message.success(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
    margin: 20px;
}
</style>
