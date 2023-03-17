<template>
  <v-card width="98%" class="mx-auto">
    <CronCore v-model="value" :custom-locale="locale" :periods="periods">
      <template #default="{ fields, period, error }">
        <div>
          <v-row align="baseline" dense>
            <!-- period selection -->
            <v-col v-if="period.prefix" class="flex-grow-0">{{ period.prefix }}</v-col>
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
            <v-col v-if="period.suffix" class="flex-grow-0">{{ period.suffix }}</v-col>

            <!-- cron expression fields -->
            <template v-for="f in fields">
              <v-col v-if="f.prefix" class="flex-grow-0" :key="f.id + '-prefix'">{{
                f.prefix
              }}</v-col>
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
                    <v-text-field :value="f.selectedStr" dense readonly></v-text-field>
                  </v-col>
                </template>

                <!-- list of field items -->
                <v-list dense>
                  <v-list-item-group v-bind="f.attrs" @change="f.events.input" multiple>
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

              <v-col v-if="f.suffix" class="flex-grow-0" :key="f.id + '-suffix'">{{
                f.suffix
              }}</v-col>
            </template>
          </v-row>

          <!-- editable cron expression -->
          <v-row class="mt-0">
            <v-col class="pt-0">
              <v-text-field
                :value="value"
                @change="value = $event"
                label="cron expression"
                :error-messages="error"
              />
            </v-col>
          </v-row>
        </div>
      </template>
    </CronCore>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      value: "* * * * *",
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
  methods: {},
};
</script>
