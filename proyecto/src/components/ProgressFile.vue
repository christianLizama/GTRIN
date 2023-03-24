<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-progress-circular
          v-bind="attrs"
          v-on="on"
          :rotate="-90"
          :size="40"
          :width="5"
          :value="porcentaje"
          :color="obtenerColor(porcentaje)"
        >
          {{ porcentaje}}
        </v-progress-circular>
      </template>
      <span> Nivel de cumplimiento </span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "Test",
  created() {},
  data() {
    return {};
  },
  props: {
    porcentaje: Number
  },
  methods: {
    obtenerColor(valor) {
      if (valor < 100) {
        return "red";
      } else {
        return "green";
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
