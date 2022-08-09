<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <!-- 实现页面的基本布局 -->
      <el-card class="tree-card">
        <!-- 用了一个行列布局 -->
        <!-- 缺少treeNode -->
        <tree-tools :tree-node="company" @addDepts="addDepts" />
        <!--放置一个属性   这里的props和我们之前学习的父传子 的props没关系-->
        <el-tree :data="departs" :props="defaultProps" default-expand-all>
          <!-- 说明el-tree里面的这个内容 就是插槽内容 => 填坑内容  => 有多少个节点循环多少次 -->
          <!-- scope-scope 是 tree组件传给每个节点的插槽的内容的数据 -->
          <!-- 顺序一定是 执行slot-scope的赋值 才去执行 props的传值 -->
          <TreeTools slot-scope="obj" :tree-node="obj.data" :is-root="false" @delDepts="getDepartments" @editDepts="editDepts" @addDepts="addDepts" />
        </el-tree>
        <!-- // 父组件 sync修饰符  双向的属性名不变 属性名：是你的字段名-->
        <!-- 提供给子组件一个自定义事件，用于修改当前指端 -->
        <!-- 事件名称：（"update:属性名"） -->
        <AddDept :show-dialog.sync="showDialog" :tree-node="node" />
      </el-card>
    </div>
  </div>
</template>

<script>
import AddDept from './components/add-dept.vue'
import TreeTools from './components/tree-tools.vue'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils/index.js'
export default {
  components: { TreeTools, AddDept },
  data() {
    return {
      loading: false,
      node: {},
      showDialog: false,
      departs: [{ name: '总裁办', manager: '曹操', children: [{ name: '董事会', manager: '曹丕' }] }, { name: '行政部', manager: '刘备' }, { name: '人事部', manager: '孙权' }],
      defaultProps: {
        label: 'name' // 表示 从这个属性显示内容
      },
      company: { name: '江苏传智播客教育科技股份有限公司', manager: '负责人', id: '' }
    }
  },
  created() {
    this.getDepartments() // 调用自身的方法
  },
  methods: {
    async getDepartments() {
      this.loading = true
      const result = await getDepartments()
      console.log(result)
      this.departs = tranListToTreeData(result.depts, '')
      this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.loading = false
    },
    editDepts(node) {
      this.showDialog = true // 显示弹层
      // 因为node是当前的点击的部门， 此时这个部门应该记录下来,
      this.node = node
      // 我们需要在这个位置 调用子组件的方法
      // 父组件 调用子组件的方法
      // 直接调用子组件中的方法 传入一个id
    }
  },
  addDepts(node) {
    this.showDialog = true // 显示弹层
    // 因为node是当前的点击的部门， 此时这个部门应该记录下来,
    this.node = node
    // 我们需要在这个位置 调用子组件的方法
    this.$refs.addDept.getDepartDetail(node.id)
  }
}
</script>

<style scoped>
    .tree-card {
    padding: 30px  140px;
    font-size:14px;
    }
</style>
