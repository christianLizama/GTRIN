<template>
  <div>
    <snackbar ref="childComponent"></snackbar>
    <v-card width="98%" class="mx-auto mt-3">
      <v-data-table
        :headers="headers"
        :items="desserts"
        sort-by="calories"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Mis triggers</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Nuevo Trigger
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <CronCore
                    v-model="editedItem.expresion"
                    :custom-locale="locale"
                    :periods="periods"
                  >
                    <template #default="{ fields, period }">
                      <div>
                        <v-row align="baseline" dense>
                          <!-- period selection -->
                          <v-col v-if="period.prefix" class="flex-grow-0">{{
                            period.prefix
                          }}</v-col>
                          <v-col cols="auto">
                            <v-select
                              class="fit"
                              v-bind="period.attrs"
                              :items="period.items"
                              @input="period.events.input"
                              item-value="id"
                              dense
                              :menu-props="{ 'offset-y': true }"
                            ></v-select>
                          </v-col>
                          <v-col v-if="period.suffix" class="flex-grow-0">{{
                            period.suffix
                          }}</v-col>

                          <!-- cron expression fields -->
                          <template v-for="f in fields">
                            <v-col
                              v-if="f.prefix"
                              class="flex-grow-0"
                              :key="f.id + '-prefix'"
                              >{{ f.prefix }}</v-col
                            >
                            <!-- custom select -->
                            <v-menu
                              offset-y
                              :key="f.id"
                              :close-on-content-click="false"
                              max-height="300"
                            >
                              <!-- menu activator -->
                              <template v-slot:activator="{ on, attrs }">
                                <v-col v-on="on" v-bind="attrs">
                                  <v-text-field
                                    :value="f.selectedStr"
                                    dense
                                    readonly
                                  ></v-text-field>
                                </v-col>
                              </template>

                              <!-- list of field items -->
                              <v-list dense>
                                <v-list-item-group
                                  v-bind="f.attrs"
                                  @change="f.events.input"
                                  multiple
                                >
                                  <v-list-item
                                    v-for="item in f.items"
                                    :value="item.value"
                                    :key="item.value"
                                  >
                                    <v-list-item-content>
                                      <v-list-item-title>{{
                                        item.text
                                      }}</v-list-item-title>
                                    </v-list-item-content>
                                  </v-list-item>
                                </v-list-item-group>
                              </v-list>
                            </v-menu>

                            <v-col
                              v-if="f.suffix"
                              class="flex-grow-0"
                              :key="f.id + '-suffix'"
                              >{{ f.suffix }}</v-col
                            >
                          </template>
                        </v-row>

                        <!-- editable cron expression -->
                        <!-- <v-row class="mt-0">
                          <v-col class="pt-0">
                            <v-text-field
                              :value="editedItem.expresion"
                              @change="value = $event"
                              label="Expresion cron"
                              readonly
                              :error-messages="error"
                            />
                          </v-col>
                        </v-row> -->
                      </div>
                    </template>
                  </CronCore>
                </v-card-text>
                <v-card-text>
                  <v-row align="baseline">
                    <v-col>
                      <v-text-field
                        label="Nombre Trigger"
                        v-model="editedItem.nombre"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-select
                        label="Contenedor"
                        v-model="editedItem.contenedor"
                        :items="contenedores"
                        item-text="nombre"
                        return-object
                      ></v-select>
                    </v-col>
                    <v-col>
                      <v-select
                        :disabled="desabilitado"
                        label="Carpetas"
                        v-model="editedItem.carpeta"
                        :items="carpetasDisponibles"
                        item-text="nombre"
                        return-object
                      ></v-select>
                    </v-col>
                    <v-col>
                      <v-select
                        :disabled="desabilitado2"
                        label="Parametros"
                        v-model="editedItem.parametro"
                        :items="parametrosDisponibles"
                        item-text="value"
                        return-object
                      ></v-select>
                    </v-col>
                    <v-col>
                      <v-select
                        label="Status"
                        v-model="editedItem.status"
                        :items="estados"
                        item-text="nombre"
                      ></v-select>
                    </v-col>
                    <v-col>
                      <v-text-field
                        label="Asunto"
                        v-model="editedItem.asunto"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-combobox
                        v-model="editedItem.destino"
                        hide-selected
                        hint="Ingresar correos correctamente"
                        label="Destino(s)"
                        multiple
                        persistent-hint
                        small-chips
                      ></v-combobox>
                    </v-col>
                    <v-col>
                      <v-select
                        label="Periodos"
                        :disabled="habilitarRango"
                        v-model="editedItem.rango"
                        hint="Desde la fecha del día del trigger"
                        persistent-hint
                        :items="fechas"
                        item-text="text"
                        return-object
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    text
                    class="body-2 font-weight-bold"
                    @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    class="body-2 font-weight-bold"
                    outlined
                    @click="save"
                  >
                    crear trigger
                  </v-btn>
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
                    ¿Estás seguro que deseas borrar un trigger?
                  </v-toolbar-title>
                </v-toolbar>
                <v-card-text class="pa-4 black--text"
                  >Esta acción es irreversible
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    text
                    class="body-2 font-weight-bold"
                    @click="closeDelete"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="red"
                    class="body-2 font-weight-bold"
                    outlined
                    @click="deleteItemConfirm"
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
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Reset </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import Snackbar from "../components/snackbar.vue";
export default {
  components: { Snackbar },
  data() {
    return {
      desabilitadoPeriodos: true,
      fechas: [
        { text: "15 días", value: 15 },
        { text: "30 días", value: 30 },
        { text: "45 días", value: 45 },
        { text: "60 días", value: 60 },
      ],
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          text: "Nombre Trigger",
          align: "start",
          sortable: false,
          value: "nombre",
        },
        { text: "Expresión", value: "expresion" },
        { text: "Contenedor", value: "contenedor.nombre" },
        { text: "Carpeta", value: "carpeta.nombre" },
        { text: "Estado", value: "status" },
        { text: "Destino(s)", value: "destino" },
        { text: "Acciones", value: "actions", sortable: false },
      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
        nombre: "",
        mensaje: "",
        destino: [],
        asunto: "",
        expresion: "* * * * *",
        contenedor: {},
        carpeta: {},
        parametro: {},
        rango: {},
        status: "",
      },
      defaultItem: {
        nombre: "",
        mensaje: "",
        destino: [],
        asunto: "",
        expresion: "* * * * *",
        contenedor: {},
        carpeta: {},
        parametro: {},
        rango: {},
        status: "",
      },

      nombre: "",
      asunto: "",
      mensaje: "",
      value: "* * * * *",
      destino: [],
      contenedores: [],
      carpetas: [],
      desabilitado: true,
      desabilitado2: true,
      estados: ["Vigente","Por vencer", "Vencido"],
      fields: [
        { id: "month", items: ["enero", "febrero", "marzo"] },
        { id: "dayOfWeek", items: ["lunes", "martes", "miercoles"] },
      ],
      periods: [
        { id: "minute", text: "minutos", value: [] },
        { id: "hour", text: "horas", value: ["minute"] },
        { id: "day", text: "dias", value: ["hour", "minute"] },
        { id: "week", text: "semanas", value: ["dayOfWeek", "hour", "minute"] },
        {
          id: "month",
          text: "meses",
          value: ["day", "dayOfWeek", "hour", "minute"],
        },
        {
          id: "year",
          text: "años",
          value: ["month", "day", "dayOfWeek", "hour", "minute"],
        },
      ],

      locale: {
        eachPeriod: {
          eachField: {
            //empty: 'Todos los {{field.id}}',
            value: "{{value.text}}",
            range: "{{start.text}}-{{end.text}}",
            everyX: "every {{every.value}}",
          },
          monthField: {
            empty: "todos los meses",
            prefix: "en",
            value: "{{value.alt}}",
            range: "{{start.alt}}-{{end.alt}}",
          },
          dayField: {
            empty: "todos los dias",
            prefix: "en",
          },
          dayOfWeekField: {
            prefix: "y",
            empty: "todos los dias de la semana",
            value: "{{value.alt}}",
            range: "{{start.alt}}-{{end.alt}}",
          },
          hourField: {
            empty: "todas las horas",
            prefix: "a",
          },
          minuteField: {
            empty: "todos los minutos",
            prefix: ":",
          },
        },
        hourPeriod: {
          minuteField: {
            prefix: "at",
            suffix: "minute(s)",
            empty: "every",
          },
        },
        monthPeriod: {
          dayOfWeekField: {
            prefix: "y",
          },
        },
        yearPeriod: {
          dayOfWeekField: {
            prefix: "y",
          },
        },
        periodPrefix: "Todos los",
        periodSuffix: "",
      },
    };
  },
  created() {
    this.obtenerTodo();
    this.initialize();
  },
  computed: {
    carpetasDisponibles() {
      return this.obtenerCarpetasDisponibles();
    },
    parametrosDisponibles() {
      return this.obtenerParametrosDisponibles();
    },
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo trigger" : "Editar trigger";
    },
    habilitarRango(){
      return this.comprobarStatus();
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  methods: {
    async initialize() {
      axios.get("correo/getTriggers").then((res) => {
        this.desserts = res.data;
      });
    },
    comprobarStatus(){
      if(this.editedItem.status.length>0){
        console.log(this.editedItem.status)
        if(this.editedItem.status=="Vigente"){
          return false;
        }
        else{
          return true;
        }
      }
      else{
        return true;
      }
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
      this.borrarTrigger(this.editedItem);
      this.closeDelete();
    },
    async borrarTrigger(cron) {
      axios
        .post("/correo/stopCron", { nombreCron: cron.nombre })
        .then((res) => {
          this.$refs.childComponent.SnackbarShow("success", res.data);
        });
    },
    close() {
      this.dialog = false;
      this.desabilitado = true;
      this.desabilitado2 = true;
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
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.crearCron(this.editedItem);
      }
    },
    obtenerParametrosDisponibles() {
      if (this.editedItem.carpeta.nombre) {
        this.desabilitado2 = false;
        return this.editedItem.carpeta.parametros;
      }
    },
    obtenerCarpetasDisponibles() {
      if (this.editedItem.contenedor.nombre) {
        this.desabilitado = false;
        return this.carpetas.filter(
          (carpeta) => carpeta.padre == this.editedItem.contenedor._id
        );
      } else {
        return this.carpetas;
      }
    },
    async crearCron(nuevoCron) {
      if (
        Object.entries(nuevoCron.contenedor).length === 0 ||
        Object.entries(nuevoCron.carpeta).length === 0 ||
        nuevoCron.status.length === 0 ||
        !this.editedItem.nombre ||
        this.editedItem.destino.length == 0 ||
        !this.editedItem.asunto ||
        Object.entries(nuevoCron.parametro).length === 0
      ) {
        this.$refs.childComponent.SnackbarShow(
          "error",
          "Por favor completa el trigger"
        );
      } else {
        let conteo = 0;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.editedItem.destino.forEach((destino) => {
          console.log(destino);
          if (!regex.test(destino)) {
            conteo = conteo + 1;
          }
        });
        if (
          this.editedItem.status === "Vigente" &&
          Object.entries(nuevoCron.rango).length === 0
        ) {
          this.$refs.childComponent.SnackbarShow(
            "error",
            "Por favor seleccione un rango"
          );
        } else {
          if (conteo == 0) {
            this.desserts.push(this.editedItem);
            this.close();
            await axios
              .post("correo/sendEmail", nuevoCron)
              .then((res) => {
                this.$refs.childComponent.SnackbarShow("success", res.data);
              })
              .catch((e) => {
                this.$refs.childComponent.SnackbarShow(
                  "success",
                  "No se pudo crear el trigger"
                );
                console.log(e);
              });
          } else {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "Hay correos que no cumplen el formato"
            );
          }
        }
      }
    },
    async obtenerTodo() {
      await axios.get("archivo/archivosStatus").then((result) => {
        let { sociedades, carpetas } = result.data;
        this.contenedores = sociedades;
        this.carpetas = carpetas;
        this.isLoading = false;
      });
    },
  },
};
</script>
