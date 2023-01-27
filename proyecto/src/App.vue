<template>
  <v-app>
    <navbar></navbar>
    <v-main> 
      <router-view :key="$route.path"></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Navbar from "./components/Navbar.vue";
export default {
  components: { Navbar },
  name: "App",
  data: () => ({
    //
  }),
};
</script>
