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
    ADD_NEW(state, nuevo){
      state.contenedores.push(nuevo)
    },
    DELETE_CONTENEDOR(state,elminado){
      let index = state.contenedores.findIndex(contenedor => contenedor._id === elminado._id)
      state.contenedores.splice(index,1)  
    },
    EDIT_CONTENEDOR(state,newContainers){
      state.contenedores=newContainers
    }
  },
  actions: {
    async obtenerContenedores({ commit }) {
      try {
        await axios.get("/sociedad/getPadres").then((result) => {
          commit("SET_CONTENEDORES",result.data)
        });
      } catch (error) {
        console.log(error)   
      }
    },
    cambiarContenedor({commit},nuevos){
      commit("SET_CONTENEDORES",nuevos)
    },
    modificarContenedor({commit},editados){
      commit("EDIT_CONTENEDOR",editados);
    },
    agregarContenedor({commit},nuevo){
      commit("ADD_NEW",nuevo)
    },
    eliminarContenedor({commit},eliminado){
      commit("DELETE_CONTENEDOR",eliminado)
    }
  },
  modules: {
  }
})
