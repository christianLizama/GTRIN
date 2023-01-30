<template>
  <v-app>
    <navbar class="mb-r"></navbar>
    <v-main> 
      <router-view :key="$route.path"></router-view>
    </v-main>
    <Footer></Footer>
  </v-app>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/footer.vue"
export default {
  components: { Navbar ,Footer},
  name: "App",
  data: () => ({
    //
  }),
};
</script>
