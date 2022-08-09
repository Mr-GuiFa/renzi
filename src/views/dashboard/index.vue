<template>
  <div class="dashboard-container">
    <div class="app-container">
      <h2>
        员工
      </h2>
      <div><ImageUpload /></div>
    </div></div></template>

<script>
import { mapGetters } from 'vuex'
import { mixins } from '@/utils/mixins'
export default {
  name: 'Dashboard',
  mixins: [mixins],
  computed: [
    ...mapGetters([
      'name'
    ])
  ],
  mounted() {
    this.hello()
  },
  created() {

  }
}
</script>

<style>

</style>
