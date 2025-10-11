<template>
  <div id="app" class="d-flex">
    <!-- Боковая панель меню -->
    <SideMenu ref="sideMenu" :isOpen="isMenuOpen" @toggle="toggleMenu" />
    
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Шапка -->
      <Header @menu-toggle="toggleMenu" />
      
      <!-- Контентная область -->
      <main class="content-area">
        <router-view @canvas-ready="onCanvasReady" />
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
    },
    onCanvasReady(canvas) {
      // Передаём canvas в боковую панель для 3D превью
      console.log('🎨 App.vue onCanvasReady вызван:', { canvas: !!canvas, width: canvas?.width, height: canvas?.height })
      if (this.$refs.sideMenu) {
        this.$refs.sideMenu.setSourceCanvas(canvas)
        console.log('✅ Canvas передан в SideMenu из App.vue')
      } else {
        console.warn('⚠️ SideMenu не найден в App.vue')
      }
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
  background-color: #fff;
  
  @media (max-width: 767.98px) {
    padding: 15px;
  }
}

.container {
  width: 879px !important;
  max-width: 100% !important;
}

/* Переопределяем Bootstrap стили для всех размеров экрана */
@media (min-width: 576px) {
  .container, .container-sm {
    max-width: 100% !important;
  }
}

@media (min-width: 768px) {
  .container, .container-sm, .container-md {
    max-width: 100% !important;
  }
}

@media (min-width: 992px) {
  .container, .container-sm, .container-md, .container-lg {
    max-width: 100% !important;
  }
}

@media (min-width: 1200px) {
  .container, .container-sm, .container-md, .container-lg, .container-xl {
    max-width: 100% !important;
  }
}

@media (min-width: 1400px) {
  .container, .container-sm, .container-md, .container-lg, .container-xl, .container-xxl {
    max-width: 100% !important;
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
