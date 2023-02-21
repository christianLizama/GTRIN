<template>
  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :multi-line="snackbar.mode === 'multi-line'"
    :timeout="snackbar.timeout"
    :top="snackbar.position === 'top'"
  >
    <v-container>
      <v-row align="center" justify="center" class="d-flex">
        <v-col cols="auto">
          <v-icon dark large>{{ snackbar.icon }}</v-icon>
        </v-col>
        <v-col cols="auto">
          <div>
            <strong>{{ snackbar.title }}</strong>
          </div>
          <div>{{ snackbar.text }}</div>
        </v-col>
        <v-col cols="auto">
          <v-btn icon @click="snackbar.visible = false">
            <v-icon>mdi-close-thick</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      snackbar: {
        color: null,
        icon: null,
        mode: null,
        position: "top",
        text: null,
        timeout: 1500,
        title: null,
        visible: false,
      },
    };
  },
  methods: {
    SnackbarShow(type, texto) {
      if (!type) return;
      switch (type) {
        case "error":
          this.snackbar = {
            color: "error",
            icon: "mdi-car-brake-alert",
            mode: "multi-line",
            position: "top",
            timeout: this.snackbar.timeout,
            title: "Error",
            text: texto,
            visible: true,
          };
          break;
        case "info":
          this.snackbar = {
            color: "info",
            icon: "mdi-info",
            mode: "multi-line",
            position: "top",
            timeout: this.snackbar.timeout,
            title: "Information",
            text: texto,
            visible: true,
          };
          break;
        case "success":
          this.snackbar = {
            color: "success",
            icon: "mdi-check-circle-outline",
            mode: "multi-line",
            position: "top",
            timeout: this.snackbar.timeout,
            title: "Exitoso",
            text: texto,
            visible: true,
          };
          break;
        case "warning":
          this.snackbar = {
            color: "warning",
            icon: "mdi-car-brake-alert",
            mode: "multi-line",
            position: "top",
            timeout: this.snackbar.timeout,
            title: "Warning",
            text: texto,
            visible: true,
          };
          break;
      }
    },
  }
};
</script>
