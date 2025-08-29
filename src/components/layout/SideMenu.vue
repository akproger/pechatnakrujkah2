<template>
  <aside class="side-menu" :class="{ 'open': isOpen }">
    <div class="side-menu-overlay" @click="$emit('toggle')"></div>
    <div class="side-menu-content">
      <!-- Заголовок меню -->
      <div class="side-menu-header">
        <h5 class="mb-0">Меню</h5>
        <button 
          class="btn-close" 
          @click="$emit('toggle')"
          aria-label="Закрыть меню"
        >
          <span>&times;</span>
        </button>
      </div>
      
      <!-- Навигация -->
      <nav class="side-menu-nav">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link 
              to="/" 
              class="nav-link d-flex align-items-center"
              @click="$emit('toggle')"
            >
              <i class="bi bi-house-door me-3"></i>
              Главная
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/grids" 
              class="nav-link d-flex align-items-center"
              @click="$emit('toggle')"
            >
              <i class="bi bi-grid-3x3-gap me-3"></i>
              Сетки
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/sticker-mania" 
              class="nav-link d-flex align-items-center"
              @click="$emit('toggle')"
            >
              <i class="bi bi-sticky me-3"></i>
              Стикермания
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SideMenu',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle']
}
</script>

<style lang="scss" scoped>
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1050;
  pointer-events: none;
  transition: all 0.3s ease;
  
  .side-menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    pointer-events: auto;
  }
  
  .side-menu-content {
    position: absolute;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background-color: #fff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 575.98px) {
      width: 260px;
      left: -260px;
    }
  }
  
  &.open {
    pointer-events: auto;
    
    .side-menu-overlay {
      opacity: 1;
      visibility: visible;
    }
    
    .side-menu-content {
      left: 0;
    }
  }
}

.side-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  
  h5 {
    margin: 0;
    color: #495057;
    font-weight: 600;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #e9ecef;
      color: #495057;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.side-menu-nav {
  flex: 1;
  padding: 1rem 0;
  
  .nav-item {
    .nav-link {
      padding: 1rem 1.5rem;
      color: #495057;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      border-radius: 0;
      
      &:hover {
        background-color: #e9ecef;
        color: #016527;
      }
      
      &.router-link-active {
        background-color: #016527;
        color: #fff;
        
        &:hover {
          background-color: #015a23;
        }
      }
      
      i {
        font-size: 1.2rem;
        width: 20px;
        text-align: center;
      }
    }
  }
}

/* Анимация для мобильных устройств */
@media (max-width: 991.98px) {
  .side-menu-content {
    transform: translateX(-100%);
  }
  
  .side-menu.open .side-menu-content {
    transform: translateX(0);
  }
}
</style>
