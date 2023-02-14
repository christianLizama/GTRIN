<template>
  <div>
    <div v-if="opcion == opciones[0]">
      <v-toolbar>
        <v-toolbar-title>Crear Contenedores</v-toolbar-title>
      </v-toolbar>
    </div>
    <div v-if="opcion == opciones[1]">
      <v-toolbar>
        <v-toolbar-title>Editar Contenedores</v-toolbar-title>
      </v-toolbar>
    </div>
    <div v-if="opcion == opciones[2]">
      <v-toolbar>
        <v-toolbar-title> Eliminar Contenedores </v-toolbar-title>
      </v-toolbar>
    </div>
  </div>
</template>

<script>
export default {
  name: "Configuracion",
  mounted() {
    let contador = 0;
    this.opciones.forEach((element) => {
      if (element == this.opcion) {
        contador = contador + 1;
      }
    });
    if (contador == 0) {
      this.$router.push("/");
    }
  },
  data() {
    return {
      opcion: this.$route.params.id,
      opciones: ["crear", "editar", "eliminar"],
    };
  },
  props: {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>
