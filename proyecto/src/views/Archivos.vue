<template>
  <div>
    <!-- <lista-carpetas></lista-carpetas> -->
    <router-view />
  </div>
</template>

<script>
// import listaCarpetas from "@/components/Gestion/listaCarpetas.vue";
// import TablaCarpetas from "@/components/Gestion/TablaCarpetas.vue";
export default {
  // components: { listaCarpetas },
  data() {
    return {
      padre: {},
    };
  },
  created() {},
  methods: {
    atras() {
      this.$router.go(-1);
    },
    adelante() {
      this.$router.go(1);
    },
  },
};
</script>

<style></style>
