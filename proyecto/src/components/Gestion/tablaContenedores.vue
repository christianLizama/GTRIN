<template>
  <div class="contenedor">
    <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8">
      <v-data-table
        :headers="headers"
        :items="desserts"
        sort-by="calories"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Contenedores</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  New Item
                </v-btn>
              </template>
              <v-card>
                <v-toolbar dark color="black lighten-3" dense flat>
                  <v-btn icon dark @click="dialog = !dialog">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    class="text-body-4 font-weight-bold white--text"
                  >
                    {{ formTitle }}
                  </v-toolbar-title>
                </v-toolbar>

                <v-card-text class="pa-4">
                  <v-text-field
                    outlined
                    v-model="editedItem.nombre"
                    label="Nombre"
                    placeholder="Ingrese nombre de la carpeta"
                  ></v-text-field>
                  <v-text-field
                    outlined
                    v-model="editedItem.descripcion"
                    label="Descripción"
                    placeholder="Ingrese descripción"
                  ></v-text-field>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="text-h5"
                  >Are you sure you want to delete this item?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete"
                    >Cancel</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                    >OK</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>
        <template v-slot:[`item.fechaCreacion`]="{ item }">
          {{ fechaFormateada(item.fechaCreacion) }}
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Reset </v-btn>
        </template>
      </v-data-table>
      <snackbar ref="childComponent"></snackbar>
    </v-card>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import snackbar from '../snackbar.vue';
export default {
  components: { snackbar },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Nombre contenedor",
        align: "start",
        sortable: false,
        value: "nombre",
      },
      { text: "Fecha Creación", value: "fechaCreacion" },
      { text: "Descripción", value: "descripcion" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      nombre: "",
      descripcion: "",
      fechaCreacion: "",
    },
    defaultItem: {
      nombre: "",
      descripcion: "",
      fechaCreacion: "",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Contenedor" : "Editar Contenedor";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    fechaFormateada(fecha) {
      let fechaFormat = moment(fecha).format("DD/MM/YYYY");
      return fechaFormat;
    },
    async initialize() {
      await axios.get("/sociedad/getPadres").then((result) => {
        this.desserts = result.data;
      });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async postSociedad(nuevaSociedad) {
      await axios
        .post("sociedad/add", nuevaSociedad)
        .then((res) => {
          this.desserts.push(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    crearSociedad(){
      const resultado = this.desserts.find(
        (sociedad) => sociedad.nombre === this.editedItem.nombre
      );
      if(!resultado){
        this.editedItem.fechaCreacion = moment();
        this.postSociedad(this.editedItem);
      }
      else{
        this.$refs.childComponent.SnackbarShow(
          "error",
          "El nombre del contenedor ingresado ya existe"
        );
      }
    },
    save() {
      //Si se edita
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        if (this.editedItem.nombre.length >= 3) {
          this.crearSociedad()  
        } else {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "El nombre del contenedor debe contener un largo minimo de 3 caracteres"
          );
        }
        // this.desserts.push(this.editedItem);
        
      }
      this.close();
    },
  },
};
</script>
