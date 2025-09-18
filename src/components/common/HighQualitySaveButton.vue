<template>
  <button 
    @click="handleSave" 
    :disabled="isSaving"
    class="high-quality-save-btn"
    :class="{ 'saving': isSaving }"
  >
    <div class="btn-content">
      <div v-if="isSaving" class="spinner"></div>
      <svg v-else class="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
      <span class="btn-text">
        {{ isSaving ? 'Сохранение...' : 'Сохранить в высоком качестве' }}
      </span>
    </div>
  </button>
</template>

<script>
export default {
  name: 'HighQualitySaveButton',
  props: {
    // Функция сохранения, которая должна возвращать Promise
    saveFunction: {
      type: Function,
      required: true
    },
    // Дополнительные параметры для функции сохранения
    saveParams: {
      type: Object,
      default: () => ({})
    },
    // Текст кнопки
    buttonText: {
      type: String,
      default: 'Сохранить в высоком качестве'
    },
    // Размер кнопки
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // Стиль кнопки
    variant: {
      type: String,
      default: 'primary', // primary, secondary, success
      validator: (value) => ['primary', 'secondary', 'success'].includes(value)
    }
  },
  data() {
    return {
      isSaving: false
    }
  },
  methods: {
    async handleSave() {
      if (this.isSaving) return
      
      this.isSaving = true
      
      try {
        console.log('🖨️ Начинаем сохранение через HighQualitySaveButton')
        
        // Вызываем переданную функцию сохранения
        const result = await this.saveFunction(this.saveParams)
        
        // Эмитим событие успешного сохранения
        this.$emit('save-success', result)
        
        console.log('✅ Сохранение завершено успешно')
        
      } catch (error) {
        console.error('❌ Ошибка при сохранении:', error)
        
        // Эмитим событие ошибки
        this.$emit('save-error', error)
        
        // Показываем уведомление об ошибке
        this.$emit('show-notification', {
          type: 'error',
          message: 'Ошибка при сохранении файла. Попробуйте еще раз.'
        })
        
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style scoped>
.high-quality-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.high-quality-save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.high-quality-save-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.high-quality-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.high-quality-save-btn.saving {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.save-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

/* Размеры */
.high-quality-save-btn.size-small {
  padding: 8px 16px;
  font-size: 12px;
  min-width: 150px;
}

.high-quality-save-btn.size-large {
  padding: 16px 32px;
  font-size: 16px;
  min-width: 250px;
}

/* Варианты стилей */
.high-quality-save-btn.variant-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
}

.high-quality-save-btn.variant-secondary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
}

.high-quality-save-btn.variant-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.high-quality-save-btn.variant-success:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Анимация пульсации при сохранении */
.high-quality-save-btn.saving::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>
