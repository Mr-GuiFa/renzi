<template>
  <div>
    <button @click="handleClick">点击触发event里面的方法</button>
  </div>
</template>

<script>
import eventBus from './event.js'
export default {
  methods: {
    handleClick() {
      eventBus.$emit('update', '新值')
    }
  }
}
</script>

<style>

</style>
