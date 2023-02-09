<template>
  <v-container :fluid="true">
    <v-row>
      <v-col>
        <v-hover v-slot="{ hover }">
          <v-card
            dark
            elevation="5"
            color="red"
            class="mx-auto"
            height="140"
            outlined
          >
            <v-expand-transition>
              <div
                v-if="hover"
                class="caja transition-fast-in-fast-out darken-2 v-card--reveal text-h5 white--text"
                style="height: 100%"
              >
                <v-progress-circular
                  :rotate="90"
                  :size="100"
                  :width="10"
                  :value="100 - calularPorcentaje()"
                  color="white"
                >
                  {{ 100 - calularPorcentaje() }}%
                </v-progress-circular>
                <h2>Archivos Faltantes</h2>
              </div>
            </v-expand-transition>
            <v-list-item three-line>
              <v-list-item-content>
                <h1>Archivos faltantes</h1>
                <v-list-item-title class="text-h7 mb-1">
                  {{ archivosRequeridos - archivosSubidos }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-avatar tile size="100">
                <v-icon color="white" size="65"> mdi-note-remove</v-icon>
              </v-list-item-avatar>
            </v-list-item>
          </v-card>
        </v-hover>
      </v-col>
      <v-col>
        <v-hover v-slot="{ hover }">
          <v-card
            dark
            elevation="5"
            color="green"
            class="mx-auto"
            height="140"
            outlined
          >
            <v-expand-transition>
              <div
                v-if="hover"
                class="caja transition-fast-in-fast-out darken-2 v-card--reveal text-h5 white--text"
                style="height: 100%"
              >
                <v-progress-circular
                  :rotate="90"
                  :size="100"
                  :width="10"
                  :value="100 - calularPorcentaje()"
                  color="white"
                >
                  {{ calularPorcentaje() }}%
                </v-progress-circular>
                <h2>Archivos Subidos</h2>
              </div>
            </v-expand-transition>
            <v-list-item three-line>
              <v-list-item-content>
                <h1>Archivos Subidos</h1>
                <v-list-item-title class="text-h7 mb-1">
                  {{ archivosSubidos }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-avatar tile size="100">
                <v-icon color="white" size="65">mdi-note-check</v-icon>
              </v-list-item-avatar>
            </v-list-item>
          </v-card>
        </v-hover>
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
