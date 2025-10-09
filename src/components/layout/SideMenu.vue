<template>
  <aside class="side-menu" :class="{ 'collapsed': !isOpen }">
    <div class="side-menu-content">
      <!-- Лого наверху панели -->
      <div class="side-menu-logo">
        <router-link to="/" class="logo-link">
          Печать<span class="header-span-1">на</span>кружках<span class="header-span-2">.рф</span>
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
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SideMenu',
  props: {
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle']
}
</script>

<style lang="scss" scoped>
.header-span-1{ color: #0e6ffd; }
.header-span-2{ color: rgb(241, 10, 10); }

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1050;
  pointer-events: auto;
  border-right: 1px solid #333;
}

.side-menu-content {
  position: relative;
  width: 280px;
  height: 100%;
  background-color: #181818;
  color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
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
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.side-menu.collapsed .logo-link { display: none; }

.btn-toggle {
  background: transparent;
  color: #adb5bd;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-toggle:hover { color: #fff; border-color: rgba(255,255,255,0.35); }

.side-menu-nav {
  flex: 1;
  padding: 8px 6px;
}
.side-menu-nav .nav-link {
  padding: 10px 12px;
  color: #e9ecef;
  border-radius: 8px;
}
.side-menu-nav .nav-link:hover { background-color: rgba(255,255,255,0.06); color: #fff; }
.side-menu-nav .nav-link.router-link-active { background-color: rgba(13,110,253,0.25); color: #fff; }
.nav-text{
  white-space: nowrap !important;
}

/* Текст скрывается в свёрнутом состоянии */
.side-menu.collapsed .nav-text { display: none; }
.side-menu.collapsed .nav-link i { margin-right: 0 !important; }

/* Убираем оверлей и анимации мобильного режима */
@media (max-width: 991.98px) {
  .side-menu-content { width: 240px; }
  .side-menu.collapsed .side-menu-content { width: 64px; }
}
</style>
