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
          :color="obtenerColor(calularPorcentaje())"
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
  name: "Test2",
  created() {
    this.contarCumplidas()
    this.calularPorcentaje()
  },
  data() {
    return {
      carpetasCumplidas:0,
      porcentaje:0,
      interval: {},
      valor:0,
    };
  },
  props: {
    cantidadCarpetas: Number,
    subCarpetas: Array,
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
    contarCumplidas(){
      let cumplidas=0;
      this.subCarpetas.forEach(subCarpeta => {
        if(subCarpeta.cumplimiento == "cumple"){
          cumplidas=cumplidas+1
        }
      });
      this.carpetasCumplidas = cumplidas
    },
    obtenerColor(valor) {
      if (valor < 100) {
        return "red";
      } else {
        return "green";
      }
    },
    calularPorcentaje() {
      if (this.carpetasCumplidas == 0) {
        return 0;
      }
      let porcentaje = (this.carpetasCumplidas / this.subCarpetas.length) * 100;
      let intPorcentaje = Math.round(porcentaje);
      this.porcentaje = intPorcentaje
    },
  },
};
</script>

