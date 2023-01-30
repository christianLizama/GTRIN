<template>
  <v-row justify="center">
    <v-dialog
      v-model="show"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="black">
          <v-btn icon dark @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Triggers</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="dialog = false"> Save </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Selección de parametros</v-subheader>
          <v-container>
            <v-row align="center" style="width: 30%">
              <v-col>
                <v-select
                  v-model="select"
                  :items="items"
                  :rules="[(v) => !!v || 'Item is required']"
                  label="Item"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-row align="center" style="width: 30%">
              <v-col>
                <v-select
                  v-model="select"
                  :items="items"
                  :rules="[(v) => !!v || 'Item is required']"
                  label="Item"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-row align="center" style="width: 30%">
              <v-col>
                <v-select
                  v-model="select"
                  :items="items"
                  :rules="[(v) => !!v || 'Item is required']"
                  label="Item"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Password</v-list-item-title>
              <v-list-item-subtitle
                >Require password for purchase or use password to restrict
                purchase</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
        </v-list>
      </v-card>
    </v-dialog>
  </v-row>
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
