<template>
  <v-app>
    <navbar-2 v-if="usuario" class="mb-r"></navbar-2>
    <v-main> 
      <router-view :key="$route.path"></router-view>
    </v-main>
    <Footer v-if="usuario"></Footer>
  </v-app>
</template>

<script>
//import Navbar from "./components/Pagina/Navbar.vue";
import Footer from "./components/Pagina/footer.vue"
import Navbar2 from "./components/Pagina/Navbar2.vue";
import { mapState } from "vuex";
export default {
  components: { Footer, Navbar2},
  name: "App",
  data: () => ({
    //
  }),
  computed:{
    ...mapState(["usuario"]),
  },
  created(){
    //this.$store.dispatch("obtenerContenedores");
    this.$store.dispatch("autoLogin");
  },
};
</script>
