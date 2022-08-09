<template>
  <div class="bianju">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="角色管理" name="first">
          <el-button icon="el-icon-plus" type="primary" @click="shoDialog = true">新增角色</el-button>
          <template>
            <el-table
              :data="roleList"
              stripe
              style="width: 100%"
            >
              <el-table-column
                label="序号"
                type="index"
                width="180"
              />
              <el-table-column
                prop="name"
                label="角色名称"
                width="180"
              />
              <el-table-column
                prop="description"
                label="描述"
              />
              <el-table-column
                prop="address"
                label="操作"
              >
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="edit(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="del(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <el-row>
            <el-pagination
              class="fenye"
              :page-size="page.pagesize"
              :total="total"
              background
              :current-page="page.pate"
              layout="prev, pager, next"
              @current-change="changeCurrent"
            />
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="公司信息" name="second">
          <el-alert
            title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
            type="info"
            show-icon
          />
          <el-form label-width="100px" disabled style="margin-top:40px">
            <el-form-item label="公司名称">
              <el-input v-model="formDate.name" style="width:50%" />
            </el-form-item>
            <el-form-item label="公司地址">
              <el-input v-model="formDate.companyAddress" style="width:50%" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="formDate.mailbox" style="width:50%" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formDate.remarks" type="textarea" style="width:50%" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog :title="`${this.roleForm.id ? '编辑':'新增'}`" :visible="shoDialog" @close="close">
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-width="100px">
        <el-form-item label="角色" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="btnOk">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="showPermDialog" @close="btnPermCancel">
      <el-tree
        ref="treeRef"
        default-expand-all
        show-checkbox
        :props="props"
        :data="permissionlist"
        check-strictly
        node-key="id"
        :default-checked-keys="checkedkeys"
      />
      <template #footer>
        <el-button size="mini" @click="btnPermCancel">取消</el-button>
        <el-button size="mini" type="primary" @click="btnOkPut">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { getRoleList, getCompanyInfo, deleteRole, getRoleDetail, updateRole, addRole } from '@/api/setting.js'
import { getPermissionList, assignPerm } from '@/api/permisson'
import { transListToTreeData } from '@/utils'
export default {
  data() {
    return {
      showPermDialog: false,
      activeName: 'first',
      props: {
        label: 'name'
      },
      roleForm: {
        name: '',
        description: ''
      },
      page: {
        page: 1,
        pagesize: 2
      },
      total: 0,
      checkedKeys: [],
      roleId: null,
      permissionlist: [],
      roleList: [],
      formDate: [],
      shoDialog: false,
      roleRules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    async btnOkPut() {
      // 获取修改之后tree选中的节点数组
      const checkedKeys = this.$refs.treeRef.getCheckedKeys()
      console.log(checkedKeys)
      await assignPerm({
        id: this.roleId, // 当前角色ID
        permIds: checkedKeys // 修改之后的权限列表
      })
      // 成功的提示
      this.$message.success('分配权限成功')
      // 关闭弹窗
      this.btnPermCancel()
    },
    btnPermCancel() {
      this.showPermDialog = false
      this.checkedKeys = []
    },
    async  assignPerm(id) {
      // 从后端获取的扁平的数组结构转换成树形结构
      // 所有的权限数据转化成树形》》默认展示
      this.permissionlist = transListToTreeData(await getPermissionList(), '0')
      // 当前点击的角色
      this.roleId = id
      // 处理当前角色拥有的权限信息，默认选中
      const { permIds } = await getRoleDetail(id)
      this.checkedkeys = permIds
      this.showPermDialog = true
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      console.log(rows)
      this.roleList = rows
      this.total = total
    },
    changeCurrent(page) {
      this.page.page = page // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    async getCompanyInfo() {
      this.formDate = await getCompanyInfo(this.companyId)
      console.log(this.formDate)
    },
    async del(id) {
      console.log(id)
      await this.$confirm('确认删除？')
      const len = this.roleList.length
      await deleteRole(id)
      if (len === 1 && this.page.page > 1) {
        this.page.page--
      }
      this.$message.success('删除成功')
      await this.getRoleList()
    },
    async edit(id) {
      console.log(id)
      this.shoDialog = true
      this.roleForm = await getRoleDetail(id)
    },
    close() {
      this.shoDialog = false
      this.$refs.roleForm.resetFields()
      this.roleForm = {}
    },
    async btnOk() {
      try {
        await this.$refs.roleForm.validate()
        // 判断是否是编辑状态
        // roleForm这个有id就是编辑,没有就是新增
        if (this.roleForm.id) {
          await updateRole(this.roleForm)
        } else {
          await addRole(this.roleForm)
        }
        this.getRoleList()
        this.$message.success('成功')
        this.close()
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bianju{
  margin: 20px;
}
.fenye{
  text-align: center;
  margin-top: 20px;
}
</style>
