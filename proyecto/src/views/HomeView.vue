<template>
  <div>
    <lista-general></lista-general>
  </div>
</template>

<script>
import listaGeneral from '@/components/Gestion/listaGeneral.vue';
export default {
  components: { listaGeneral },
  data() {
    return {
      alignments: ["start"],
    };
  },
};
</script>

<style></style>
