<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-progress-circular
          v-bind="attrs"
          v-on="on"
          :rotate="-90"
          :size="28"
          :width="3"
          :value="valor"
          :color="obtenerColor()"
          style="font-size: 0.75em"
        >
          {{ porcentaje }}
        </v-progress-circular>
      </template>
      <span> % de avance </span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "progressContainer",
  created() {
    this.calularPorcentaje();
  },
  data() {
    return {
      carpetasCumplidas: 0,
      porcentaje: 0,
      interval: {},
      valor: 0,
    };
  },
  props: {
    cantidadCarpetas: Number,
    fracciones: Array,
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.valor === this.porcentaje) {
        return (this.valor = this.porcentaje);
      }
      this.valor += 1;
    }, 8);
  },
  methods: {
    obtenerColor(){
      if(this.porcentaje<33){
        return "#FF1744"
      }
      else if(this.porcentaje>33 && this.porcentaje<66){
        return "#FF6D00"
      }
      return "#00E676"
    },
    calularPorcentaje() {
      if (this.fracciones.length == 0) {
        return 0;
      }
      let calculo = 0;
      this.fracciones.forEach((fraccion) => {
        let numerador = fraccion[0];
        let denominador = fraccion[1];
        let resultado = numerador / denominador;
        if(numerador==0 || denominador==0){
          calculo=calculo+0
        }
        else{
          calculo = calculo + resultado;
        }
      });

      let porcentaje = (calculo / this.cantidadCarpetas) * 100;
      let intPorcentaje = Math.round(porcentaje);
      console.log(porcentaje)
      this.porcentaje = intPorcentaje;
    },
  },
};
</script>
