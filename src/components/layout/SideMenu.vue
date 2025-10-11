<template>
  <aside class="side-menu" :class="{ 'collapsed': !isOpen }">
    <div class="side-menu-content">
      <!-- Лого наверху панели -->
      <div class="side-menu-logo">
        <router-link to="/" class="logo-link">
          <img src="@/assets/images/logo.svg" alt="Печать на кружках" class="logo-image" />
        </router-link>
        <button 
          class="btn-toggle" 
          @click="$emit('toggle')"
          aria-label="Свернуть/развернуть панель"
        >
          <i class="bi" :class="isOpen ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>
      
      <!-- Навигация -->
      <nav class="side-menu-nav">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link 
              to="/grids" 
              class="nav-link d-flex align-items-center"
            >
              <i class="bi bi-grid-3x3-gap me-3"></i>
              <span class="nav-text">Сетки</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/sticker-mania" 
              class="nav-link d-flex align-items-center"
            >
              <i class="bi bi-sticky me-3"></i>
              <span class="nav-text">Стикермания</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/mug-comic" 
              class="nav-link d-flex align-items-center"
            >
              <i class="bi bi-cup me-3"></i>
              <span class="nav-text">Кружка-комикс</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- 3D превью кружки -->
      <div class="side-menu-3d">
        <ThreeDRenderer 
          ref="threeRenderer"
          :source-canvas="sourceCanvas"
          :auto-update="true"
          :rotation-speed="0.01"
          @initialized="onThreeInitialized"
          @texture-updated="onTextureUpdated"
          @texture-error="onTextureError"
        />
      </div>
    </div>
  </aside>
</template>

<script>
import ThreeDRenderer from '../ThreeDRenderer.vue'

export default {
  name: 'SideMenu',
  components: {
    ThreeDRenderer
  },
  props: {
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle'],
  data() {
    return {
      sourceCanvas: null
    }
  },
  watch: {
    sourceCanvas(newCanvas, oldCanvas) {
      console.log('🔄 SideMenu sourceCanvas watcher:', { newCanvas, oldCanvas, hasRenderer: !!this.$refs.threeRenderer })
      // Watcher в ThreeDRenderer автоматически обновит текстуру при изменении sourceCanvas
      console.log('✅ sourceCanvas обновлён в SideMenu, ThreeDRenderer должен автоматически обновиться')
    }
  },
  methods: {
    setSourceCanvas(canvas) {
      console.log('🎨 Устанавливаем canvas в боковой панели:', canvas)
      this.sourceCanvas = canvas
      
      // Принудительно обновляем ThreeDRenderer, так как canvas может быть тот же объект
      if (this.$refs.threeRenderer) {
        this.$nextTick(() => {
          console.log('🔄 Принудительно обновляем ThreeDRenderer')
          this.$refs.threeRenderer.forceUpdate()
        })
      }
    },
    onThreeInitialized() {
      console.log('3D renderer initialized in side menu')
    },
    onTextureUpdated() {
      console.log('Texture updated in side menu')
    },
    onTextureError(error) {
      console.error('Texture error in side menu:', error)
    }
  }
}
</script>

<style lang="scss" scoped>

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1050;
  pointer-events: auto;
  background: #f2f2f2;
}

.side-menu-content {
  position: relative;
  width: 280px;
  background: #f2f2f2;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

/* Свёрнутое состояние: только иконки */
.side-menu.collapsed .side-menu-content {
  width: 52px;
}

.side-menu-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 12px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-link {
  color: #111;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  margin: 12px auto 0;
}

.logo-image {
  height: 52px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.side-menu.collapsed .logo-link { 
  display: flex;
  justify-content: center;
}

.side-menu.collapsed .logo-image {
  height: 24px;
}

.btn-toggle {
  background: transparent;
  color: #333;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 11px;
  position: relative;
  left: -5px;
}
.side-menu .btn-toggle {
  left: 0px;
}
.btn-toggle:hover { color: #222; }

.side-menu-nav {
  flex: 1;
  padding: 8px 6px;
}
.side-menu-nav .nav-link {
  padding: 10px 12px;
  color: #333;
  border-radius: 8px;
}
.side-menu-nav .nav-link:hover { color: #222; }
.side-menu-nav .nav-link.router-link-active { background-color: #fff; color: #222; }
.nav-text{
  white-space: nowrap !important;
}

/* Текст скрывается в свёрнутом состоянии */
.side-menu.collapsed .nav-text { display: none; }
.side-menu.collapsed .nav-link i { margin-right: 0 !important; }

/* 3D превью в боковой панели */
.side-menu-3d {
    padding: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.side-menu-3d .three-d-renderer {
  width: 100%;
  height: 300px;
}

.side-menu-3d .preview-container {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
}

.side-menu-3d .three-canvas {
  width: 100%;
  height: 100%;
}

.side-menu-3d .rotation-controls {
  margin-top: 8px;
}

.side-menu-3d .rotation-toggle-btn {
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #e9ecef;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.side-menu-3d .rotation-toggle-btn:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.side-menu-3d .rotation-toggle-btn.disabled {
  opacity: 0.5;
}

/* Скрываем 3D превью в свёрнутом состоянии */
.side-menu.collapsed .side-menu-3d {
  display: none;
}

/* Убираем оверлей и анимации мобильного режима */
@media (max-width: 991.98px) {
  .side-menu-content { width: 240px; }
  .side-menu.collapsed .side-menu-content { width: 64px; }
}
</style>
