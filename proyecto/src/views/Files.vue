<template>
  <div>
    <!-- <tabla-archivos></tabla-archivos> -->
    <parametros-carpeta></parametros-carpeta>
  </div>
</template>

<script>
// import TablaArchivos from "@/components/Gestion/tablaArchivos.vue";
import ParametrosCarpeta from '@/components/Archivos/ParametrosCarpeta.vue';
export default {
  components: { ParametrosCarpeta},
  name: "Files"
};
</script>

<style scoped></style>
