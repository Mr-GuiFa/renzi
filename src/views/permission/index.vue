<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 靠右的按钮 -->
      <page-tools>
        <template v-slot:after>
          <el-button type="primary" size="small" @click="showDialog=true">添加权限</el-button>
        </template>
      </page-tools>
      <!-- 表格 -->
      <el-table :data="list" border="" row-key="id">
        <el-table-column label="名称" prop="name" />
        <el-table-column label="标识" prop="code" />
        <el-table-column label="描述" prop="description" />
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button v-if="row.type === 1" type="text" @click="addPermission(row.id, 2)">添加</el-button>
            <el-button type="text" @click="editPermission(row.id)">编辑</el-button>
            <el-button type="text" @click="delPermission(row.id)"> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 放置一个弹层 用来编辑新增节点 -->
    <el-dialog :title="`${showText}权限点`" :visible.sync="showDialog" @close="btnCancel">
      <!-- 表单 -->
      <el-form ref="perForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width:90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width:90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width:90%" />
        </el-form-item>
        <el-form-item label="开启">
          <!-- /* 当值为1(active-value)时，激活节点，当值为(inactive-value)0时，不激活 */
          /* v-model绑定的为当前switch对应的值 */ -->
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="end">
        <el-col :span="6">
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { addPermission, delPermission, getPermissionDetail, getPermissionList, updatePermission } from '@/api/permisson'
import { transListToTreeData } from '@/utils'
// import { asyncRoutes, constantRoutes } from '@/router'
export default {
  data() {
    return {
      // 需要展示的数据
      list: [],
      // formData数据和rules数据可以等到弹框做完的时候再去定义，
      formData: {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      },
      // 新增或者编辑弹框的校验规则，
      rules: {
        name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '权限标识不能为空', trigger: 'blur' }]
      },
      // 是否展示新增或者编辑弹框
      showDialog: false
    }
  },
  computed: {
    showText() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    // 编辑权限
    async editPermission(id) {
    // 获取当前权限的详情
    // 使this.formData得到数据回显
      this.formData = await getPermissionDetail(id)
      // 打开弹层
      this.showDialog = true
    },
    async delPermission(id) {
      // 删除之前先提示用户
      await this.$confirm('确认删除')
      // 当点击确认之后再执行删除的操作
      await delPermission(id)
      // 给用户一个成功的提示
      this.$message.success('删除成功')
      // 重新获取最新的列表数据
      await this.getPermissionList()
    },
    async getPermissionList() {
      this.list = transListToTreeData(await getPermissionList(), '0')
      console.log(this.list)
    }
  },
  btnCancel() {
    this.$refs.perform.validate()
    this.roleIds = [] // 清空原来的数组
    this.$emit('update:showRoleDialog', false)
  },
  async btnOk() {
    await this.$refs.perform.validate()
    try {
      if (this.formData.id) {
      // 编辑
        await updatePermission(this.formData)
      } else {
        await addPermission(this.formData)
      }
      // 进行成功的提示

      await this.getPermissionList()
    } catch (e) {
      console.log(e)
      this.$message.error('修改失败')
    }
  }
}
</script>
