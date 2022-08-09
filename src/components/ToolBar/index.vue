<template>
  <div>
    <div>
      <el-card>
        <el-row type="flex">
          <el-col>
            <div v-if="$slots.before" class="before">
              <i class="el-icon-info" />
              <!-- 阔以获取到你传入的所有组件的一个插槽 -->
              <slot name="before" />
            </div>
          </el-col>
          <el-col>
            <el-row type="flex" justify="end">
              <slot name="after" />
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this)
  }
}
</script>

<style>
.before{
    line-height: 34px;
    vertical-align: middle;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    display: inline-block;
    padding: 0 10px;
    border-radius: 3px;
    border: 1px solid #91d5ff;
    background: #e6f7ff;
}
</style>
