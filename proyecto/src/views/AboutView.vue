<template>
  <div id="about">
    <div class="flex-container row2">
      <router-link to="/about/jeje">Nested Page One</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "about",
};
</script>

<style scoped>
div {
  text-align: center;
}
</style>
