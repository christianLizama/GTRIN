import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
   
    
  },
  {
    path: '/archivos',
    name: 'archivos',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Archivos.vue'),
    children: [
      {
        path: ':id',
        name:'folder',
        component: () => import(/* webpackChunkName: "about" */ '../views/Folder.vue'),
      },
      {
        path: ':sociedad/:Folder',
        name:'subFolders',
        component: () => import(/* webpackChunkName: "about" */ '../views/SubFolders.vue'),
      }, 
      {
        path: ':sociedad/:Folder/:subFolder',
        name:'files',
        component: () => import(/* webpackChunkName: "about" */ '../views/Files.vue'),
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
