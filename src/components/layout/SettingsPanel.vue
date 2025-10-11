<template>
  <aside class="settings-panel" :class="{ 'collapsed': !isOpen }">
    <div class="settings-panel-content">
      <!-- Заголовок панели -->
      <div class="settings-panel-header">
        <div class="settings-panel-title">
          <i class="bi bi-gear"></i>
          <span class="settings-text">Настройки</span>
        </div>
        <button 
          class="btn-toggle" 
          @click="$emit('toggle')"
          aria-label="Свернуть/развернуть панель настроек"
        >
          <i class="bi" :class="isOpen ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>
      </div>
      
      <!-- Контент панели -->
      <div class="settings-panel-body">
        <slot></slot>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SettingsPanel',
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
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1050;
  pointer-events: auto;
  background: #f2f2f2;
}

.settings-panel-content {
  position: relative;
  width: 350px;
  background: #f2f2f2;
  color: #333;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  height: 100vh;
}

/* Свёрнутое состояние: только иконки */
.settings-panel.collapsed .settings-panel-content {
  width: 52px;
}

.settings-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.settings-panel-title {
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.settings-text {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-panel.collapsed .settings-text {
  display: none;
}

.settings-panel.collapsed .settings-panel-title i {
  margin-right: 0 !important;
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
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #222;
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
  }
  
  i {
    font-size: 16px;
  }
}

.settings-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #fff;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .settings-panel-content {
    width: 300px;
  }
  
  .settings-panel.collapsed .settings-panel-content {
    width: 52px;
  }
}

@media (max-width: 768px) {
  .settings-panel-content {
    width: 280px;
  }
  
  .settings-panel.collapsed .settings-panel-content {
    width: 52px;
  }
}
</style>
