<template>
  <div class="settings-tab">
    <div class="settings-section">
      <h6 class="text-muted mb-3">Обводка</h6>
      <div class="form-group mb-3">
        <label class="form-label">Цвет обводки</label>
        <input 
          type="color" 
          class="form-control form-control-color" 
          :value="strokeColor"
          @input="onStrokeColorChange"
          title="Выберите цвет обводки"
        >
      </div>
      <div class="form-group mb-3">
        <label class="form-label">Толщина обводки: {{ strokeWidth }}%</label>
        <input 
          type="range" 
          class="form-range" 
          :value="strokeWidth"
          min="0" 
          max="20" 
          step="1"
          @input="onStrokeWidthChange"
        >
      </div>
    </div>
    
    <div class="settings-section">
      <h6 class="text-muted mb-3">Тень</h6>
      <div class="form-group mb-3">
        <label class="form-label">Размытие тени: {{ shadowBlur }}%</label>
        <input 
          type="range" 
          class="form-range" 
          :value="shadowBlur"
          min="0" 
          max="50" 
          step="1"
          @input="onShadowBlurChange"
        >
      </div>
      <div class="form-group mb-3">
        <label class="form-label">Прозрачность тени: {{ shadowOpacity }}%</label>
        <input 
          type="range" 
          class="form-range" 
          :value="shadowOpacity"
          min="0" 
          max="50" 
          step="5"
          @input="onShadowOpacityChange"
        >
      </div>
    </div>
    
    <div class="settings-section">
      <h6 class="text-muted mb-3">Размеры</h6>
      <div class="form-group mb-3">
        <label class="form-label">Минимальный размер: {{ minSize }}%</label>
        <input 
          type="range" 
          class="form-range" 
          :value="minSize"
          min="10" 
          max="50" 
          step="5"
          @input="onMinSizeChange"
        >
      </div>
      <div class="form-group mb-3">
        <label class="form-label">Максимальный размер: {{ maxSize }}%</label>
        <input 
          type="range" 
          class="form-range" 
          :value="maxSize"
          min="50" 
          max="100" 
          step="5"
          @input="onMaxSizeChange"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsTab',
  props: {
    strokeColor: {
      type: String,
      default: '#000000'
    },
    strokeWidth: {
      type: Number,
      default: 5
    },
    shadowBlur: {
      type: Number,
      default: 10
    },
    shadowOpacity: {
      type: Number,
      default: 20
    },
    minSize: {
      type: Number,
      default: 20
    },
    maxSize: {
      type: Number,
      default: 80
    }
  },
  emits: ['stroke-color-change', 'stroke-width-change', 'shadow-blur-change', 'shadow-opacity-change', 'min-size-change', 'max-size-change'],
  methods: {
    onStrokeColorChange(event) {
      this.$emit('stroke-color-change', event.target.value)
    },
    onStrokeWidthChange(event) {
      this.$emit('stroke-width-change', parseInt(event.target.value))
    },
    onShadowBlurChange(event) {
      this.$emit('shadow-blur-change', parseInt(event.target.value))
    },
    onShadowOpacityChange(event) {
      this.$emit('shadow-opacity-change', parseInt(event.target.value))
    },
    onMinSizeChange(event) {
      this.$emit('min-size-change', parseInt(event.target.value))
    },
    onMaxSizeChange(event) {
      this.$emit('max-size-change', parseInt(event.target.value))
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-tab {
  padding: 16px 0;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-control-color {
  width: 100%;
  height: 40px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
}

.form-range {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: #007bff;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #007bff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
}
</style>
