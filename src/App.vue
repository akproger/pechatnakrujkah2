<template>
  <div id="app" class="d-flex">
    <!-- Боковая панель меню -->
    <SideMenu :isOpen="isMenuOpen" @toggle="toggleMenu" />
    
    <!-- Основной контент -->
    <div class="main-content" :class="{ 'menu-open': isMenuOpen }">
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
  components: {
    SideMenu,
    Header,
    Footer
  },
  data() {
    return {
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  },
  mounted() {
    // Закрытие меню при клике вне его
    this.handleClickOutside = (e) => {
      const sideMenu = document.querySelector('.side-menu')
      const menuToggle = document.querySelector('.menu-toggle')
      
      if (this.isMenuOpen && 
          !sideMenu?.contains(e.target) && 
          !menuToggle?.contains(e.target)) {
        this.isMenuOpen = false
      }
    }
    
    document.addEventListener('click', this.handleClickOutside)
    
    // Закрытие меню при изменении размера экрана на десктоп
    this.handleResize = () => {
      if (window.innerWidth >= 992 && this.isMenuOpen) {
        this.isMenuOpen = false
      }
    }
    
    window.addEventListener('resize', this.handleResize)
  },
  
  beforeUnmount() {
    // Очистка обработчиков событий
    if (this.handleClickOutside) {
      document.removeEventListener('click', this.handleClickOutside)
    }
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
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

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: transform 0.3s ease;
  
  @media (max-width: 991.98px) {
    &.menu-open {
      transform: translateX(280px);
    }
  }
}

.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
  
  @media (max-width: 767.98px) {
    padding: 15px;
  }
}

/* Общие стили для адаптивности */
.container-fluid {
  padding-left: 15px;
  padding-right: 15px;
}

/* Плавные переходы */
* {
  transition: all 0.2s ease;
}

/* Стили для touch устройств */
@media (hover: none) and (pointer: coarse) {
  .btn, .nav-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
