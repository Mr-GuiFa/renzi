<template>
  <el-dialog title="分配角色" :visible.sync="showRoleDialog" @close="close">
    <!-- el-checkbox-group选中的是 当前用户所拥有的角色  需要绑定 当前用户拥有的角色-->
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
      <!-- 选项 -->
    </el-checkbox-group>
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="12">
        <el-button type="primary" size="small" @click="btnOk">确定</el-button>
        <el-button size="small">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false
    },
    // 用户的id 用来查询当前用户的角色信息
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      roleIds: ['禁用', '选中且禁用'],
      list: []
    }
  },
  created() {
    this.getRoleList()
    this.getUserDetailById()
  },
  methods: {
    async btnOk() {
      try {
        await assignRoles({
          // 点击了编辑的时候,从父组件传值下来的当用户的ID
          id: this.userId,
          roleIds: this.roleIds
        })
        this.$emit('update:showRoleDialog', false)
        this.$message.success('修改成功')
      } catch (e) {
        this.$message.success('修改失败')
        console.log(e)
      }
    },
    close() {
      // 手动修改父组件的弹层标识变成false
      // 这个属性使用.sync传递下来的
      // 当前选中的角色列表数据置空
      this.roleIds = []
      this.$emit('update:showRoleDialog', false)
    },
    // 获取所有角色列表
    async getRoleList() {
      const { rows } = await getRoleList()
      this.list = rows
    },
    // 获取当前点击用户的角色数据,给roleids进行赋值
    async getUserDetailById(id) {
      const { roleIds = [] } = await getUserDetailById(id)
      this.roleIds = roleIds
    }
  }
}
</script>

