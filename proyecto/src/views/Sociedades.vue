<template>
  <div>
    <lista-contenedores></lista-contenedores>
  </div>
</template>

<script>
import ListaContenedores from '@/components/Gestion/listaContenedores.vue';
export default {
  components: {ListaContenedores  },
  data() {
    return {
      alignments: ["start"],
    };
  },
};
</script>

<style></style>
