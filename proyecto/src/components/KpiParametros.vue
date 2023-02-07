<template>
  <v-container :fluid="true">
    <v-row>
      <v-col>
        <v-card max-height="100%" height="100%">
          <v-toolbar color="black" dark>
            <v-toolbar-title> Cumplimiento de Parametros </v-toolbar-title>
          </v-toolbar>
          <v-carousel height="auto" hide-delimiter-background show-arrows-on-hover cycle>
            <v-carousel-item
            >
              <div class="caja">
                <v-progress-circular
                  :rotate="90"
                  :size="100"
                  :width="10"
                  :value="calularPorcentaje()"
                  color="green"
                >
                  {{ calularPorcentaje() }}%
                </v-progress-circular>
                <h2>Parametros completados {{archivosSubidos}}</h2>
              </div>
            </v-carousel-item>
            <v-carousel-item
            >
              <div class="caja">
                <v-progress-circular
                  :rotate="90"
                  :size="100"
                  :width="10"
                  :value="100-calularPorcentaje()"
                  color="red"
                >
                  {{100-calularPorcentaje() }}%
                </v-progress-circular>
                <h1>Archivos faltantes {{ archivosRequeridos-archivosSubidos}}</h1>
              </div>
            </v-carousel-item>
            <v-carousel-item>
              <div class="caja">
                <v-progress-circular
                  :rotate="90"
                  :size="100"
                  :width="10"
                  :value="100-calularPorcentaje()"
                  color="red"
                >
                  {{100-calularPorcentaje() }}%
                </v-progress-circular>
                <h1>Archivos faltantes {{ archivosRequeridos-archivosSubidos}}</h1>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Test",
  created() {},
  data() {
    return {};
  },
  props: {
    archivosSubidos: Number,
    archivosRequeridos: Number,
    parametros: Array,
  },
  methods: {
    calularPorcentaje() {
      let porcentaje = (this.archivosSubidos / this.archivosRequeridos) * 100;
      let intPorcentaje = Math.round(porcentaje);
      return intPorcentaje;
    },
  },
};
</script>

<style lang="scss" scoped>
.caja {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
