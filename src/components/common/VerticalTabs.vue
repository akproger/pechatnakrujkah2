<template>
  <div class="vertical-tabs">
    <!-- Список табов -->
    <div class="tabs-list">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ 'active': activeTab === tab.id, 'collapsed': !isOpen }"
        @click="selectTab(tab.id)"
      >
        <div class="tab-header">
          <i :class="tab.icon" class="tab-icon"></i>
          <span class="tab-text">{{ tab.title }}</span>
          <i 
            class="bi tab-chevron" 
            :class="activeTab === tab.id ? 'bi-chevron-up' : 'bi-chevron-down'"
          ></i>
        </div>
      </div>
    </div>
    
    <!-- Контент активного таба -->
    <div class="tab-content" v-if="isOpen">
      <div class="tab-pane active">
        <slot :name="activeTab"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerticalTabs',
  props: {
    tabs: {
      type: Array,
      required: true
    },
    activeTab: {
      type: String,
      default: ''
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  emits: ['tab-change'],
  methods: {
    selectTab(tabId) {
      if (this.activeTab === tabId) {
        // Если таб уже активен, не меняем его
        return
      }
      this.$emit('tab-change', tabId)
    }
  }
}
</script>

<style lang="scss" scoped>
.vertical-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-item {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  
  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
  
  &.active {
    background: #0d6efd;
    border-color: #0d6efd;
    color: white;
    
    .tab-icon,
    .tab-text,
    .tab-chevron {
      color: white;
    }
  }
  
  &.collapsed {
    .tab-text,
    .tab-chevron {
      display: none;
    }
    
    .tab-header {
      justify-content: center;
    }
  }
}

.tab-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  min-height: 48px;
}

.tab-icon {
  font-size: 16px;
  color: #6c757d;
  flex-shrink: 0;
}

.tab-text {
  flex: 1;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-chevron {
  font-size: 12px;
  color: #6c757d;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fff;
}

.tab-pane {
  height: 100%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .tab-header {
    padding: 10px 12px;
    min-height: 44px;
  }
  
  .tab-icon {
    font-size: 14px;
  }
  
  .tab-text {
    font-size: 14px;
  }
}
</style>
