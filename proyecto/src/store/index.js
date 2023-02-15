import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    contenedores:[]
  },
  getters: {
    getContenedores: (state) => state.contenedores,
  },
  mutations: {
    SET_CONTENEDORES(state, contenedores) {
      state.contenedores = contenedores;
    },
  },
  actions: {
    async obtenerContenedores({ commit }) {
      try {
        await axios.get("/sociedad/getPadres").then((result) => {
          commit("SET_CONTENEDORES",result.data)
          console.log(result.data)
        });
      } catch (error) {
        console.log(error)   
      }
    },
  },
  modules: {
  }
})
