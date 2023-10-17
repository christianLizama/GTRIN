<template>
  <div>
    <snackbar ref="childComponent"></snackbar>
    <v-card class="mx-auto">
      <v-toolbar dense dark>
        <v-toolbar-title> Compartir </v-toolbar-title>
      </v-toolbar>
      <loading :texto="textoLoading" :overlay="false" v-if="loading"></loading>

      <v-card-text v-if="!loading">
        <v-select
          v-model="selectedContainer"
          :items="containers"
          label="Selecciona un contenedor"
          @change="fetchFolders"
          item-text="nombre"
          return-object
        ></v-select>

        <v-select
          v-if="selectedContainer"
          v-model="selectedFolder"
          :items="folders"
          label="Selecciona una carpeta"
          @change="fetchSubfolders"
          item-text="nombre"
          return-object
        ></v-select>

        <v-select
          v-if="selectedFolder"
          v-model="selectedSubfolder"
          :items="subfolders"
          label="Selecciona una subcarpeta"
          item-text="nombre"
          multiple
          return-object
        >
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index === 0">
              <span>{{ item.nombre }}</span>
            </v-chip>
            <span v-if="index === 1" class="grey--text caption"
              >(+{{ selectedSubfolder.length - 1 }} otra(s))</span
            >
          </template>
        </v-select>

        <v-combobox
          v-if="selectedSubfolder"
          v-model="destinos"
          hide-selected
          hint="Ingresar correos correctamente"
          label="Destino(s)"
          multiple
          persistent-hint
          small-chips
          clearable
          :item-text="(correo) => correo"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              small
              label
              color="primary"
              class="ma-2"
            >
              {{ item }} 
              <v-icon @click="removeDestino(index)" small>mdi-close-circle-outline</v-icon>
            </v-chip>
          </template>
        </v-combobox>

        <v-btn
          style="margin-top: 10px"
          color="primary"
          v-if="destinos.length > 0"
          @click="sendEmail"
        >
          Compartir Archivos
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import Snackbar from "@/components/snackbar.vue";
import Loading from "@/components/loading.vue";
export default {
  components: { Snackbar, Loading },
  data() {
    return {
      selectedContainer: null,
      selectedFolder: null,
      selectedSubfolder: null,
      containers: [],
      folders: [],
      subfolders: [],
      destinos: [],
      newCorreo: "",
      loading: false,
      textoLoading: "",
    };
  },

  watch: {
    selectedContainer: function () {
      // Restablecer las selecciones de carpeta y subcarpeta al cambiar el contenedor.
      this.selectedFolder = null;
      this.selectedSubfolder = null;
    },
    selectedFolder() {
      // Cuando se cambia la subcarpeta, restablecer la lista de destinos
      this.destinos = [];
      this.subfolders = [];
      this.selectedSubfolder = null;
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    removeDestino(index) {
      this.destinos.splice(index, 1);
    },
    isValidEmail(email) {
      // Utilizar una expresión regular para validar el formato del correo
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      return emailRegex.test(email);
    },
    async initialize() {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios
        .get("sociedad/getPadres", { headers })
        .then((res) => {
          this.containers = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async fetchFolders() {
      const idContainer = this.selectedContainer._id;
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios
        .get("sociedad/queryFolders?_id=" + idContainer, { headers })
        .then(async (res) => {
          this.folders = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async fetchSubfolders() {
      const idFolder = this.selectedFolder._id;
      await axios
        .get("carpeta/querysubFolders?_id=" + idFolder)
        .then((res) => {
          this.subfolders = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async sendEmail() {
      // Validar los correos electrónicos antes de enviar
      const correosValidos = this.destinos.filter((email) =>
        this.isValidEmail(email)
      );

      if (correosValidos.length === this.destinos.length) {
        // Todos los correos son válidos, realizar la acción de enviar
        this.textoLoading = "Enviando Archivos por correo...";
        this.loading = true;
        await this.performSendAction();
      } else {
        // Algunos correos son inválidos, mostrar un mensaje de error
        this.$refs.childComponent.SnackbarShow(
          "error",
          "Se eliminaron los correos inválidos"
        );

        // Filtrar y mantener solo los correos válidos
        this.destinos = correosValidos;
      }
    },
    async performSendAction() {
      const body = {
        contenedor: this.selectedContainer._id,
        carpeta: this.selectedFolder._id,
        subCarpetas: this.selectedSubfolder,
        destinos: this.destinos,
      };
      // Lógica para enviar correos electrónicos aquí
      await axios
        .post("correo/sendFiles", body)
        .then((res) => {
          this.$refs.childComponent.SnackbarShow("success", res.data.message);
          // Reiniciar las variables a sus valores iniciales
          this.selectedContainer = null;
          this.selectedFolder = null;
          this.selectedSubfolder = null;
          this.destinos = [];
          this.newCorreo = "";
          this.loading = false;
          this.textoLoading = "";
        })
        .catch((e) => {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "No se pudieron compartir los archivos"
          );
          this.selectedContainer = null;
          this.selectedFolder = null;
          this.selectedSubfolder = null;
          this.destinos = [];
          this.newCorreo = "";
          this.loading = false;
          this.textoLoading = "";
          console.log(e);
        });
    },
  },
};
</script>

<style></style>
