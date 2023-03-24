<template>
  <v-card width="98%" class="mx-auto mt-3">
    <CronCore v-model="value" :custom-locale="locale" :periods="periods">
      <template #default="{ fields, period, error }">
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
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
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
          <v-row class="mt-0">
            <v-col class="pt-0">
              <v-text-field
                :value="value"
                @change="value = $event"
                label="Expresion cron"
                readonly
                :error-messages="error"
              />
            </v-col>
          </v-row>
        </div>
      </template>
    </CronCore>
    <v-row align="baseline">
      <v-col>
        <v-text-field label="Nombre Trigger" v-model="nombre"></v-text-field>
      </v-col>
      <v-col>
        <v-select label="Contenedor" v-model="contenedorSeleccionado" :items="contenedores" item-text="nombre" return-object></v-select>
      </v-col>
      <v-col>
        <v-select label="Carpetas" v-model="carpetaSeleccionada" :items="carpetas" item-text="nombre" return-object></v-select>
      </v-col>
      <v-col>
        <v-select label="Status" v-model="estadoSeleccionado" :items="estados" item-text="nombre" return-object></v-select>
      </v-col>
      <v-col>
        <v-text-field label="Asunto" v-model="asunto"></v-text-field>
      </v-col>
      <v-col>
        <v-combobox
          v-model="destino"
          hide-selected
          hint="Ingresar correos correctamente"
          label="Destino(s)"
          multiple
          persistent-hint
          small-chips
        ></v-combobox>
      </v-col>
      <v-col>
        <v-btn @click="crearCron()" color="primary">Crear Trigger</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      nombre: "",
      asunto: "",
      mensaje: "",
      value: "* * * * *",
      destino: [],
      contenedores: [],
      contenedorSeleccionado:{},
      carpetas: [],
      carpetaSeleccionada:{},
      estados: [
        { nombre: "Por vencer", codigo: 2 },
        { nombre: "Vencido", codigo: 1 },
      ],
      estadoSeleccionado:{},
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
    this.obtenerTodo()
  },
  methods: {
    async crearCron() {
      let datos = {
        nombre: this.nombre,
        mensaje: this.mensaje,
        destino: this.destino,
        asunto: this.asunto,
        expresion: this.value,
      };
      await axios
        .post("correo/sendEmail", datos)
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async obtenerTodo() {
      await axios.get("archivo/archivosStatus").then((result) => {
        console.log(result)
        let {sociedades, carpetas} = result.data;
        //this.archivos = archivos;
        this.contenedores = sociedades;
        this.carpetas = carpetas;
        this.isLoading = false;
      });
    },
  },
};
</script>
