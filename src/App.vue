<template>
  <div id="app" class="d-flex">
    <!-- Боковая панель меню -->
    <SideMenu :isOpen="isMenuOpen" @toggle="toggleMenu" />
    
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Шапка -->
      <Header @menu-toggle="toggleMenu" />
      
      <!-- Контентная область -->
      <main class="content-area">
        <router-view />
      </main>
      
      <!-- Подвал -->
      <Footer />
    </div>
  </div>
</template>

<script>
import SideMenu from './components/layout/SideMenu.vue'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'

export default {
  name: 'App',
  components: { SideMenu, Header, Footer },
  data() {
    return {
      isMenuOpen: true
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  }
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.tool-button > i:before{ vertical-align: -3px !important; }
.tool-button:active, .tool-button:hover{ background: rgb(13, 110, 253) !important; }
.tool-button.active > i:before, .tool-button:hover > i:before{ color: #fff !important; }

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-area {
  flex: 1;
  padding: 20px;
  background-color: #212121;
  
  @media (max-width: 767.98px) {
    padding: 15px;
  }
}

.container-fluid { padding-left: 15px; padding-right: 15px; }
* { transition: all 0.2s ease; }

@media (hover: none) and (pointer: coarse) {
  .btn, .nav-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
