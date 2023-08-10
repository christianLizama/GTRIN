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
          :value="valor"
          :color="obtenerColor()"
        >
          {{ porcentaje }}
        </v-progress-circular>
      </template>
      <span> Nivel de cumplimiento </span>
    </v-tooltip>
  </div>
</template>

<script>

export default {
  name: "ProgressFolder",
  data() {
    return {
      interval: {},
      valor:0,
    };
  },
  props: {
    porcentaje: Number, 
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  mounted () {
    this.interval = setInterval(() => {
      if (this.valor === this.porcentaje) {
        return (this.valor = this.porcentaje)
      }
      this.valor += 1
    }, 8)
  },
  methods: {
    obtenerColor() {
      if (this.porcentaje < 100) {
        return "red";
      } else {
        return "green";
      }
    },
  },
};
</script>

