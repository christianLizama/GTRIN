<template>
  <v-dialog
    v-model="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="black" class="mb-5">
        <v-btn icon dark @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Triggers</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="dialog = false"> Save </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container>
        <v-row align="center" justify="center">
            <v-card outlined width="50%">
              <v-card-title class="justify-center"> Selección de parametros del trigger </v-card-title>
              <v-list>
                <v-list-item>
                  <v-select
                    prepend-icon="mdi-folder"
                    label="Contenedor"
                    outlined
                  ></v-select>
                </v-list-item>
                <v-list-item>
                  <v-select
                    prepend-icon="mdi-folder-multiple"
                    label="Carpeta"
                    outlined
                  ></v-select>
                </v-list-item>
                <v-list-item>
                  <v-select
                    prepend-icon="mdi-folder-multiple"
                    label="Sub-Carpeta"
                    outlined
                  ></v-select>
                </v-list-item>
                <v-list-item>
                  <v-select
                    prepend-icon="mdi-calendar"
                    label="Año"
                    outlined
                  ></v-select>
                </v-list-item>
                <v-list-item>
                  <v-select
                    prepend-icon="mdi-calendar"
                    label="Mes"
                    outlined
                  ></v-select>
                </v-list-item>
              </v-list>
            </v-card>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: Boolean,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>
