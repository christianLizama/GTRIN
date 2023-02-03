<template>
  <div>
    <v-overlay :value="overlay"> </v-overlay>
    <v-container>
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="text-subtitle-1 text-center" cols="12">
          {{ texto }}
        </v-col>
        <v-col cols="6">
          <v-progress-linear
            color="deep-purple accent-4"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  props: {
    texto: String,
    overlay: Boolean,
  },
  data: () => ({}),
  watch: {},
};
</script>
