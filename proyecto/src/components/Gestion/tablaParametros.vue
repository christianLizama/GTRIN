<template>
  <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
    <snackbar ref="childComponent"></snackbar>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :options.sync="options"
      :server-items-length="totalDesserts"
      :loading="loading"
      class="elevation-1"
      :items-per-page="5"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 20, 25, 30],
      }"
    >
      <template v-slot:[`item.usuariosConAcceso`]="{ item }">
        <div>
          <span v-if="item.usuariosConAcceso[0]">
            {{ item.usuariosConAcceso[0].email }}
            <span v-if="item.usuariosConAcceso.length > 1" style="color: blue">
              (+{{ item.usuariosConAcceso.length - 1 }} Usuario(s))
            </span>
          </span>
        </div>
      </template>

      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Mis Parametros</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>

          <v-text-field
            v-model="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-btn icon @click="searchData" color="primary">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-magnify</v-icon>
              </template>
              Buscar
            </v-tooltip>
          </v-btn>
          <v-btn icon @click="clearSearch" color="primary">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-filter-remove</v-icon>
              </template>
              Limpiar busqueda
            </v-tooltip>
          </v-btn>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="primary"
                class="ma-2 white--text"
              >
                Agregar parametro
                <v-icon right dark> mdi-pencil-plus </v-icon>
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
                <!-- Permite ingresar el nombre del parametro -->
                <v-text-field
                  outlined
                  v-model="editedItem.value"
                  label="Nombre del parametro"
                  placeholder="Ingrese nombre del parametro"
                ></v-text-field>
                <!-- Permite seleccionar la opción del parametro -->
                <v-select
                  outlined
                  v-model="editedItem.option"
                  label="Requerido"
                  :items="[true, false]"
                  item-text="option"
                >
                </v-select>
                <!-- Permite seleccionar los usuarios con acceso al parametro -->
                <v-autocomplete
                  v-model="editedItem.usuariosConAcceso"
                  outlined
                  :items="usuariosDisponibles"
                  label="Usuarios"
                  multiple
                  chips
                  return-object
                  :item-text="(user) => user.email"
                  hint="Selecciona usuarios con acceso"
                  persistent-hint
                  :no-data-text="
                    usuariosDisponibles.length === 0
                      ? 'No hay usuarios disponibles'
                      : ''
                  "
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index === 0">
                      <span>{{ item.email }}</span>
                    </v-chip>
                    <span v-if="index === 1" class="grey--text text-caption">
                      (+{{ editedItem.usuariosConAcceso.length - 1 }}
                      Usuario(s))
                    </span>
                  </template>
                </v-autocomplete>
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
              <v-toolbar dark color="grey darken-3" dense flat>
                <v-icon color="red" class="mr-2">mdi-alert</v-icon>
                <v-toolbar-title
                  class="text-body-4 font-weight-bold white--text"
                >
                  ¿Estás seguro?
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text class="pa-4 black--text font-weight-bold">
                <strong
                  >No se borrará el parametro {{ editedItem.value }} si posee
                  archivos asignados!</strong
                >
              </v-card-text>
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
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize"> Reset </v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import axios from "axios";
import Snackbar from "../snackbar.vue";

export default {
  components: { Snackbar },
  data: () => ({
    search: "",
    usuarios: [],
    dialog: false,
    dialogDelete: false,
    loading: true,
    headers: [
      {
        text: "Parametro",
        align: "start",
        sortable: false,
        value: "value",
      },
      { text: "Requerido", value: "option" },
      { text: "Archivos", value: "cantidadArchivos" },
      { text: "Usuarios", value: "usuariosConAcceso" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      value: "",
      option: false,
      usuariosConAcceso: [],
    },
    defaultItem: {
      value: "",
      option: false,
      usuariosConAcceso: [],
    },
    totalDesserts: 0,
    options: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Parametro" : "Editar Parametro";
    },
    usuariosDisponibles() {
      if (this.editedIndex === -1) {
        // Creando nueva carpeta
        return this.usuarios;
      } else {
        // Editando carpeta existente
        const usuariosNormales = this.usuarios.filter(
          (user) => user.rol !== "admin"
        );
        const usuariosSeleccionados = this.editedItem.usuariosConAcceso.map(
          (user) => user._id
        );

        return usuariosNormales.map((user) => {
          return {
            ...user,
            selected: usuariosSeleccionados.includes(user._id),
          };
        });
      }
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },

  created() {
    this.getUsers();
  },

  methods: {
    toggleUsuarios() {
      this.mostrarUsuarios = !this.mostrarUsuarios;
    },
    searchData() {
      // Cuando se ingresa texto en el campo de búsqueda, vuelve a la página 1
      this.options.page = 1;
      this.getDataFromApi();
    },
    clearSearch() {
      this.search = ""; // Establece la búsqueda como una cadena vacía
      this.getDataFromApi(); // Vuelve a cargar los datos sin filtro
    },
    getDataFromApi() {
      this.loading = true;
      this.apiCall().then((data) => {
        this.desserts = data.parametros;
        this.totalDesserts = data.cantidad;
        this.loading = false;
      });
    },
    apiCall() {
      return new Promise((resolve) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.getServerData(sortBy, sortDesc, page, itemsPerPage)
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            console.error("Error al obtener datos del servidor:", error);
            this.loading = false;
            resolve({
              items: [],
              total: 0,
            });
          });
      });
    },

    async getServerData(sortBy, sortDesc, page, itemsPerPage) {
      try {
        const response = await axios.get(
          `parametro/allParametros?search=${this.search}&page=${page}&limit=${itemsPerPage}`
        );
        return response.data;
      } catch (error) {
        console.error("Error al obtener datos del servidor:", error);
        this.loading = false;
        return []; // Devuelve un array vacío en caso de error
      }
    },

    async getUsers() {
      await axios
        .get("usuario/getUsuariosNormales")
        .then((res) => {
          this.usuarios = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    //Agregar parametro
    async addParametro() {
      await axios
        .post("parametro/addParametro", this.editedItem)
        .then((res) => {
          const respuesta =
            "El parametro " + res.data.value + " ha sido agregado exitosamente";
          this.$refs.childComponent.SnackbarShow("success", respuesta);
          this.getDataFromApi();
        })
        .catch((error) => {
          if (error.response) {
            // Si hay una respuesta del servidor con un código de error
            console.error(
              "Error de respuesta del servidor:",
              error.response.data
            );
            // Mostrar el mensaje de error en tu componente, por ejemplo, usando un Snackbar
            this.$refs.childComponent.SnackbarShow(
              "error",
              error.response.data.message
            );
          } else if (error.request) {
            // Si la solicitud se realizó pero no se recibió una respuesta del servidor
            console.error("Error de solicitud:", error.request);
          } else {
            // Otros errores
            console.error("Error:", error.message);
          }
        });
    },

    //Eliminar parametro
    async deleteParametro(item) {
      await axios
        .delete("parametro/deleteParametro/" + item._id)
        .then((res) => {
          const mensaje = res.data.message;
          if (mensaje == "warning") {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "Error no se pudo eliminar el parametro, posee archivos asignado"
            );
          } else {
            this.$refs.childComponent.SnackbarShow("success", mensaje);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },

    //actualizar parametro
    async updateParametro() {
      await axios
        .put(
          "parametro/updateParametro/" + this.editedItem._id,
          this.editedItem
        )
        .then((res) => {
          const respuesta =
            "El parametro " +
            res.data.value +
            " ha sido actualizado exitosamente";
          this.$refs.childComponent.SnackbarShow("success", respuesta);
          this.getDataFromApi();
        })
        .catch((error) => {
          if (error.response) {
            // Si hay una respuesta del servidor con un código de error
            console.error(
              "Error de respuesta del servidor:",
              error.response.data
            );
            // Mostrar el mensaje de error en tu componente, por ejemplo, usando un Snackbar
            this.$refs.childComponent.SnackbarShow(
              "error",
              error.response.data.message
            );
          } else if (error.request) {
            // Si la solicitud se realizó pero no se recibió una respuesta del servidor
            console.error("Error de solicitud:", error.request);
          } else {
            // Otros errores
            console.error("Error:", error.message);
          }
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
      this.deleteParametro(this.editedItem);
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

    save() {
      // Si se está editando un parametro existente
      if (this.editedIndex > -1) {
        this.updateParametro();
      }
      // Si se está creando un nuevo parametro
      else {
        this.addParametro();
      }
      this.close();
    },
  },
};
</script>
