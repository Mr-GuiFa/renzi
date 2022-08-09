<template>
  <div class="dashboard-container">
    <div class="app-container">
      <ToolBar>
        <template #before>
          <span>共50条记录</span>
        </template>
        <template #after router>
          <el-button type="primary" @click="inputUp">导入</el-button>
          <el-button type="danger" @click="exporToExcel">导出</el-button>
          <el-button type="warning" @click="isSho = true">新增员工</el-button>
        </template>
      </ToolBar>
      <template>
        <el-table
          :data="tableData"
          border
          style="width: 100%"
        >
          <el-table-column
            label="序号"
            type="index"
            width="100"
          />
          <el-table-column
            prop="username"
            label="姓名"
            width="100"
          />
          <el-table-column label="头像" align="center">
            <template slot-scope="{row}">
              <img
                slot="reference"
                v-imageerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto "
                style="border-radius: 50%; width: 100px; height: 100px; padding: 10px"
                alt=""
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="workNumber"
            label="工号"
            width="100"
          />
          <el-table-column
            prop="formOfEmployment"
            label="聘用形式"
            width="100"
            :formatter="formatter"
          />
          <el-table-column
            prop="departmentName"
            label="部门名称"
            width="100"
          />
          <el-table-column
            proptime-of-entry
            label="入职时间"
            width="100"
          >
            <template slot-scope="{ row }">{{ row.timeOfEntry | formatDate }}</template>
            <!-- <template v-slot="{row}">
              {{ row.timeOfEntry| formatDate }}
            </template> -->
          </el-table-column>
          <el-table-column
            prop="enableState"
            label="账户状态"
            width="100"
          />
          <el-table-column
            prop="address"
            label="操作"
          >
            <template v-slot="{row}">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调离</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button :disabled="checkPermission('DELETE_USER')" type="text" size="small" style="color:#ccc" @click="del(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page="page.page"
            :total="total"
            @current-change="changePage"
          />
        </el-row>
      </template>
    </div>
    <AddEmployee :is-sho.sync="isSho" />
    <el-dialog title="二维码" :visible.sync="showCodeDialog" @opened="showQrCode" @close="imgUrl=''">
      <el-row type="flex" justify="center">
        <canvas ref="canvas" @click="showQrCode" />
      </el-row>
    </el-dialog>
    <AssignRole ref="assignRole" :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import QrCode from 'qrcode'
import ToolBar from '@/components/ToolBar/index.vue'
import { getEmployeeList, delEmployee } from '@/api/employees.js'
import EmployeeEnum from '@/api/constant/employees.js'
import AddEmployee from './components/add-employee.vue'
import { formatDate } from '@/filters'
import AssignRole from './components/assign-role.vue'
// import { export_json_to_excel } from '@/vendor/Export2Excel'
// import objectAssign from 'core-js/internals/object-assign'
export default {
  components: { ToolBar, AddEmployee, AssignRole },
  data() {
    return {
      isSho: false,
      showCodeDialog: false,
      showRoleDialog: false,
      EmployeeEnum,
      // resDate: [],
      tableData: [],
      total: 0,
      page: {
        page: 1,
        size: 10
      }
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    // 点击角色按钮的逻辑
    async  editRole(id) {
      this.userId = id // props传值 是异步的
      // 手动调用弹层内部获取当前用户角色数据的方法
      await this.$refs.assignRole.getUserDetailById(id) // 父组件调用子组件方法
      this.showRoleDialog = true
    },
    showQrCode(url) {
      // url存在的情况下 才弹出层
      if (url) {
        console.log(url)
        // 预览头像的弹层展示出来
        this.showCodeDialog = true // 数据更新了 但是我的弹层会立刻出现吗 ？页面的渲染是异步的！！！！
        // 如果数据更新之后不能李剑渲染
        // 要在数据更新之后获取到更新后的最新的dom元素
        // 需要使用$nextTick
        // 有一个方法可以在上一次数据更新完毕，页面渲染完毕之后
        this.$nextTick(() => {
          // 此时可以确认已经有ref对象了
          QrCode.toCanvas(this.$refs.canvas, url) // 将地址转化成二维码
          // 如果转化的二维码后面信息 是一个地址的话 就会跳转到该地址 如果不是地址就会显示内容
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    },
    changePage(newPage) {
      this.page.page = newPage
      this.getEmployeeList()
    },
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      console.log(rows)
      this.total = total
      this.tableData = rows
      this.loading = false
    },
    formatter(row, clum, cellvalue) {
      const currentDate = EmployeeEnum.hireType.find(item => item.id === cellvalue)?.value
      return currentDate || '啥？'
    },
    async del(id) {
      try {
        await this.$confirm('是否删除？')
        await delEmployee(id)
        this.$message.success('删除成功')
        await this.getEmployeeList()
      } catch (error) {
        console.log(error)
      }
    },
    inputUp() {
      this.$router.push('/')
    },
    async exporToExcel() {
      //  做操作
      // 表头对应关系
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 懒加载
      import('@/vendor/Export2Excel').then(async excel => {
        // 1、获取需要导出的数据
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        // 2、调用自己封装的方法进行数据的转化
        const data = this.formatJson(headers, rows)

        excel.export_json_to_excel({
          header: Object.keys(headers), // 表头数组 -> ['姓名', '手机号', '入职日期', '聘用形式', ....]
          data, // [['13399999', '张三', '2020-2020-2020', '2020', '79119'],[],[],[],[],[],[]]
          filename: '员工信息表',
          autoWidth: true,
          bookType: 'xlsx'
        })
        // 获取所有的数据

        // excel.export_json_to_excel({
        //   header: ['姓名', '薪资'],
        //   data: [['张三', 12000], ['李四', 5000]],
        //   filename: '员工薪资表',
        //   autoWidth: true,
        //   bookType: 'csv'
        // })
      })
    },
    // 该方法负责将数组转化成二维数组
    fromJson(headers, rows) {
      // rows的结构 ->
      // rows: [{username: '234234', mobile: '1398888888', 'workNumber': 123123}, ....]
      // headers的结构 ['姓名', '手机号', '入职日期', ....] -> 配置项里面生效的数据结构
      // rows的预期结果 -> result数组的每一项要和和headers一一对应
      // result -> [['张三', '138888888', '2020-10-01', ...], ['张三', '138888888', '2020-10-01', ...]]
      const result = rows.map(item => {
        // item 为对象 ->
        // 替换成数组即可 ->
        // 数组的结构要和headers对应起来 ->
        return Object.keys(headers).map(key => {
          // key -> 中文的key
          // 预期 -> 返回当前项的值
          // 值在哪？-> item为真实的数据对象 -> 取到正确的值返回即可
          // 判断
          // 如果是事件 >> 格式化
          if (['timeOfEntry', 'correctionTime'].includes(headers[key])) {
            return formatDate(item[headers[key]])
          }
          // 如果是聘用形式 >转化 1.正式员工 2.非真实员工 未知
          if (headers[key] === 'formOfEmployment') {
            return EmployeeEnum.hireType.find(child => +child.id === +item[headers[key]])?.value || '未知'
          }
          // 返回值的思路
          // 1. 数据里面的key是中文还是英文？ -> 英文
          // 2. headers里面取到中文key对应的英文key
          // 3. 直接去数据对象里面取数据
          return item[headers[key]]
        })
      })
      return result
      //       const { rows } = await getEmployeeList({ page: 1, size: this.total })
      //       // 调用发给发处理员工数据 》返回的值就是所有的员工数据 》传入方法进行数据的处理
      //       const resDate = this.formatterData(rows, headers)
      //       // 员工数据？
      //       export_json_to_excel({
      //         header: objectAssign.keys(headers), // 表头 必填
      //         // 每一个内层数组占据一行数据
      //         // 内层数组和header一一应对
      //         data: resData, // 具体数据 必填
      //         filename: 'excel-list', // 非必填
      //         autoWidth: true, // 非必填
      //         bookType: 'xlsx' // 非必填
      //       })
      //       formatterData(rows, headers){
      // // 遍历元素rows数据
      //         return rows.map(item =>{
      //           // 返回值是数据
      //           // 顺序需要和headers的key一一应对 >
      //           // 阔以拿到遍历的每一项中文key
      //           // 中文key >> 映射表 >英文的key >通过item阔以找到具体数据进行返回
      //           return Object.keys(headers.map(key =>{
      //             return item[headers[key]]
      //           }))
      //         })
      //       }
      // 预期导出一个excel
      // 动态导入一个模块的时候，使用import语法
      // import返回值是一个priomise
      // 如果想要拿到模块内部导出的内容，then(res) 接收
      // const tHeader = ['id', '喜好', '日常']
      // 使用了import 语法的文件会单独打包出一个文件
      // 使用了魔法注释 》自定义
      // webpackChunkName：'文件名'
      // import(
      //   /* webpackChunkName:'export2Excel'*/
      //   '@/vendor/Export2Excel').then(excel => {
      //   excel.export_json_to_excel({
      //     header: tHeader, // 表头 必填
      //     // 每一个内层数组占据一行数据
      //     // 内层数组和header一一应对
      //     data: [[1, '读书', '看书'], [1, '读书', '看书'], [1, '读书', '看书']], // 具体数据 必填
      //     filename: 'excel-list', // 非必填
      //     autoWidth: true, // 非必填
      //     bookType: 'xlsx' // 非必填
      //   })
      // })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
