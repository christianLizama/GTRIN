<template>
  <v-app>
    <navbar v-if="usuario" class="mb-r"></navbar>
    <v-main> 
      <router-view :key="$route.path"></router-view>
    </v-main>
    <Footer v-if="usuario"></Footer>
  </v-app>
</template>

<script>
import Navbar from "./components/Pagina/Navbar.vue";
import Footer from "./components/Pagina/footer.vue"
import { mapState } from "vuex";
export default {
  components: { Navbar ,Footer},
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
