<template>
  <el-dialog title="新增员工" :visible="isSho" @close="close">
    <!-- 表单 -->
    <el-form ref="rluesFrom" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="姓名" prop="username">
        <el-input v-model="formData.username" style="width:80%" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="formData.mobile" style="width:80%" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="入职时间" prop="timeOfEntry">
        <el-date-picker v-model="formData.timeOfEntry" style="width:80%" placeholder="请选择入职时间" />
      </el-form-item>
      <el-form-item label="聘用形式" prop="formOfEmployment">
        <el-select v-model="formData.formOfEmployment" style="width:80%" placeholder="请选择">
          <el-option v-for="item in listTree" :key="item.id" :label="item.value" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="工号" prop="workNumber">
        <el-input v-model="formData.workNumber" style="width:80%" placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="部门" prop="departmentName">
        <!-- <el-input v-model="formData.departmentName" style="width:80%" placeholder="请选择部门" /> -->
        <el-cascader
          v-model="formData.departmentName"
          style="width:80%"
          :options="options"
          :props="{expandTrigger:'hover', label:'name',value:'name',checkStrictly:'true',emitPath:false}"
          @focus="handleChange"
        />
      </el-form-item>
      <el-form-item label="转正时间" prop="correctionTime">
        <el-date-picker v-model="formData.correctionTime" style="width:80%" placeholder="请选择转正时间" />
      </el-form-item>
    </el-form>
    <!-- footer插槽 -->
    <template v-slot:footer>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small" @click="btnAdd">确定</el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import { getDepartments } from '@/api/departments.js'
import { tranListToTreeData } from '@/utils'
import EmployeeEnum from '@/api/constant/employees.js'
import { addEmployee } from '@/api/employees.js'
export default {
  props: {
    isSho: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listTree: EmployeeEnum.hireType,
      options: [],
      formData: {
        username: '', // 用户姓名
        mobile: '', // 手机号
        formOfEmployment: '', // 聘用形式
        workNumber: '', // 工号
        departmentName: '', // 部门名称
        timeOfEntry: '', // 入职时间
        correctionTime: '' // 转正时间
      },
      rules: {
        username: [{ required: true, message: '用户姓名不能为空', trigger: 'blur' }, {
          min: 1, max: 4, message: '用户姓名为1-4位'
        }],
        mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }, {
          pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'
        }],
        formOfEmployment: [{ required: true, message: '聘用形式不能为空', trigger: 'blur' }],
        workNumber: [{ required: true, message: '工号不能为空', trigger: 'blur' }],
        departmentName: [{ required: true, message: '部门不能为空', trigger: 'change' }],
        timeOfEntry: [{ required: true, message: '入职时间', trigger: 'blur' }]
      }
    }
  },
  created() {
    console.log(this.listTree)
  },
  mounted() {
    console.log(this)
  },
  methods: {
    close() {
      // 阔以使用$listeners获取父组件传递下来的所有自定义事件
      // 阔以使用$attres获取父组件传递下来的所有自定义事件
      this.$emit('update:isSho', false)
      //   重置表单
      this.$refs.formData.resetFields()
      //   重置数据
      this.formData = {
        username: '', // 用户姓名
        mobile: '', // 手机号
        formOfEmployment: '', // 聘用形式
        workNumber: '', // 工号
        departmentName: '', // 部门名称
        timeOfEntry: '', // 入职时间
        correctionTime: '' // 转正时间
      }
    },
    async handleChange() {
      const { depts } = await getDepartments()
      console.log(depts)
      //   数据结构 >>树形
      this.options = tranListToTreeData(depts, '')
    },
    async btnAdd() {
      console.log(this.$parent)
      // 校验表单
      await this.$refs.rluesFrom.validate()
      //   成功的提示
      await addEmployee(this.formData)
      //   关闭的弹层
      this.$message.success('添加成功')
      this.close()
      //   重新获取列表数据
      // 重新获取父组件的示例，直接调用父组件的方法
      this.$parent.getEmployeeList()
      // 第二中关弹层的方式
    //   this.$parent.isSho = false
    }
  }
}
</script>
