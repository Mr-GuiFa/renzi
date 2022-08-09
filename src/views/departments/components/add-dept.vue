<template>
  <div>
    <!-- 新增部门的弹层 -->
    <el-dialog :title="`${showTitle}部门 [${treeNode.name}]`" :visible="showDialog">
      <!-- 表单组件  el-form   label-width设置label的宽度   -->
      <!-- 匿名插槽 -->
      <el-form ref="form" label-width="120px" :rules="rules" :model="formData" @close="close">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
        </el-form-item>
        <el-form-item label="部门负责人" prop="manager">
          <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getSimplepEmp">
            <el-option v-for="item in option" :key="item.id" :value="item.username" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门介绍" prop="introduce">
          <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
      <el-row slot="footer" type="flex" justify="center">
        <!-- 列被分为24 -->
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnisOK">确定</el-button>
          <el-button size="small" @click="close">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // rule 当前被校验的对象,value用户输入的值
    const checkName = async(rule, value) => {
      // value:是当前用户输入的name值 判断当前用户输入的name值是否跟同级的节点有重复的
      // 1.获取所有部门的数据
      const { depts } = await getDepartments()
      // 2.找出当前点击部门的子部门数据又什么特点? pid = 当前点击部门的id
      // 点击编辑的时候,先把自己过滤掉之后再去做判断
      let currentChildren = null
      if (this.formData.id) {
        // 当前节点的兄弟节点 && 不包括自己
        currentChildren = depts.filter(item => {
          // 用同样的pid判断他们有同样的父级
          return item.pid === this.treeNode.pid && item.id !== this.treeNode.id
        })
      } else {
        // 当前点击节点的子节点
        currentChildren = depts.filter(item => {
          return item.pid === this.treeNode.id
        })
      }
      console.log(currentChildren)
      //   // 找出点击部门的子部门数据又什么特点 pid = 当前点击部门的id
      //   const currentNodeChilren = depts.filter(item => item.pid === this.treeNode.id)
      //   // 3、判断当前部门的所有子部门名称是否包含用户输入的部门名称.some返回boole值
      //   const isRepeat = currentNodeChilren.some(item => item.name === value)
      //   // 4、如果包含说明名称重复
      //   if (isRepeat) {
      //     return Promise.reject(new Error('部门名称重复'))
      //   }
      //   // --> 核心逻辑：用户输入的部门名称跟当前点击的部门的所有的子部门的名称不能重复
      // }
      // const checkCode = async(rule, value) => {
      // // 1.获取所有部门的数据
      //   const { depts } = await getDepartments()

      // 直接对比所有部门的code是否重复，
      const checkCode = async(rule, value) => {
        const { depts } = await getDepartments()
        // 创建一个空的来进行校验是否有空
        let isRepeat = null
        // 如果是编辑状态
        // 3.如果重复就return reject状态的params ,表示检验失败
        if (this.formData.id) {
          isRepeat = depts.some(item => item.code === value && item.id !== this.treeNode.id)
          // 新增一个的编辑判断逻辑：编辑的时候，需要把自己过滤掉再进行判断
          return Promise.reject('部门编码重复')
        } else {
          isRepeat = depts.some(item => item.code === value)
        }
        // 判断重复
        if (isRepeat) { return Promise.reject('部门编码重复了') }
      }
      // 用户输入的值是和所有的code进行校验，并且不能重复
      console.log(checkCode)
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '', // 部门介绍
        option: []
      },
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }],
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
          { validator: checkCode, trigger: 'blur' }],
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }]
      }
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增子部门'
    }
  },
  methods: {
    async getSimplepEmp() {
      this.option = await getEmployeeSimple()
    },
    async getDepartDetail(id) {
      // 1.先封装一个获取部门详情的接口
      // 当点击编辑部门时获取信息
      // 获取详情书记的部门ID
      this.formData = await getDepartDetail(id)
    },
    // async submit() {
    //   // 表达吗效验
    //   await this.$refs.form.validate()
    //   // 调用了新增的接口
    //   // 编辑的逻辑
    //   // 场景的区分 , 根据this.formData.id
    //   if (this.formData.id) {
    //     // 编辑场景
    //     await updateDepartments(this.formData)
    //   } else {
    //     // 新增场景
    //     await addDepartments({
    //       ...this.formData, // 把表单的数据对象展开
    //       pid: this.treeNode.id
    //     })
    //   }
    // },
    btnisOK() {
      this.$refs.form.validate(async(isok) => {
        if (isok) {
          // 要分清楚现在是编辑还是新增
          if (this.formData.id) {
            // 编辑模式  调用编辑接口
            await updateDepartments(this.formData)
          } else {
            // 新增模式
            await addDepartments({ ...this.formData, pid: this.treeNode.id }) // 调用新增接口 添加父部门的id
          }
          // 表示可以提交了
          this.$emit('addDepts') // 告诉父组件 新增数据成功 重新拉取数据
          // update:props名称
          this.$emit('update:showDialog', false)
          this.close()
        }
      })
    },
    close() {
      this.$emit('update:showDialog', false)
      this.$refs.form.resetFields() // 重置校验表单
      this.formData = {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '', // 部门介绍
        option: []
      }
    }
  }
}
</script>
