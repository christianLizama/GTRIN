<template>
  <div>
    <v-carousel  :interval="7000" cycle height="auto" show-arrows-on-hover hide-delimiters>
      <v-carousel-item v-for="i in 4" :key="i">
        <v-container fluid>
          <v-row class="fill-height" align="center" justify="center">
            <v-col v-for="item in items" :key="item.nombre">
              <v-hover v-slot="{ hover }">
                <v-card
                  dark
                  elevation="5"
                  :color="item.color"
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
                        :rotate="-90"
                        :size="100"
                        :width="10"
                        :value="item.porcentaje"
                        color="white"
                      >
                        {{ item.porcentaje }}%
                      </v-progress-circular>
                    </div>
                  </v-expand-transition>
                  <v-list-item three-line>
                    <v-list-item-content>
                      <h1>{{ item.total }}</h1>
                      <v-list-item-title class="text-h7 mb-1">
                        {{ item.nombre }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-avatar tile size="100">
                      <v-icon color="white" size="65"> {{ item.icon }}</v-icon>
                    </v-list-item-avatar>
                  </v-list-item>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-container>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
export default {
  name: "kpi",
  created() {},
  data() {
    return {
      model: null,
    };
  },
  props: {
    items: Array,
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.caja {
  width: 100%;
}
.cajon{
  margin-left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
