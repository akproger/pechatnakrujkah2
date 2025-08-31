<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Заголовок -->
      <div class="modal-header">
        <h5 class="modal-title">
          {{ currentStep === 1 ? 'Выберите формы стикеров' : 'Загрузите изображения' }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>

      <!-- Шаг 1: Выбор форм стикеров -->
      <div v-if="currentStep === 1" class="modal-body">
        <div class="sticker-shapes-grid">
          <div 
            v-for="mask in stickerMasks" 
            :key="mask.name"
            class="sticker-shape-item"
            :class="{ 'selected': mask.selected }"
            @click="toggleMaskSelection(mask)"
          >
            <div class="shape-preview">
              <img :src="mask.url" :alt="mask.name" class="shape-image" />
            </div>
            <div class="shape-name">{{ mask.name }}</div>
          </div>
        </div>
        
        <div class="step-actions">
          <button 
            class="btn btn-primary"
            :disabled="selectedMasksCount === 0"
            @click="nextStep"
          >
            Продолжить ({{ selectedMasksCount }} выбрано)
          </button>
        </div>
      </div>

      <!-- Шаг 2: Загрузка изображений -->
      <div v-if="currentStep === 2" class="modal-body">
        <div class="upload-section">
          <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
            <div class="upload-content">
              <i class="bi bi-cloud-upload upload-icon"></i>
              <p class="upload-text">Перетащите изображения сюда или нажмите для выбора</p>
              <p class="upload-hint">Поддерживаются форматы: JPG, PNG, GIF</p>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              multiple 
              accept="image/*" 
              @change="handleFileSelect"
              style="display: none;"
            />
          </div>

          <!-- Список загруженных изображений -->
          <div v-if="uploadedImages.length > 0" class="uploaded-images">
            <h6>Загруженные изображения:</h6>
            <div class="images-grid">
              <div 
                v-for="(image, index) in uploadedImages" 
                :key="index"
                class="image-item"
              >
                <img :src="image.url" :alt="image.name" class="image-preview" />
                <div class="image-name">{{ image.name }}</div>
                <button 
                  class="btn btn-sm btn-outline-danger remove-image"
                  @click="removeImage(index)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            Назад
          </button>
          <button 
            class="btn btn-primary"
            :disabled="uploadedImages.length === 0"
            @click="finishSelection"
          >
            Сгенерировать стикеры ({{ uploadedImages.length }} изображений)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StickerSelectionModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    stickerMasks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentStep: 1,
      uploadedImages: []
    }
  },
  computed: {
    selectedMasksCount() {
      return this.stickerMasks.filter(mask => mask.selected).length
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    toggleMaskSelection(mask) {
      mask.selected = !mask.selected
    },
    
    nextStep() {
      if (this.selectedMasksCount > 0) {
        this.currentStep = 2
      }
    },
    
    prevStep() {
      this.currentStep = 1
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
    },
    
    handleDrop(event) {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    
    processFiles(files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.uploadedImages.push({
              name: file.name,
              url: e.target.result,
              file: file
            })
          }
          reader.readAsDataURL(file)
        }
      })
    },
    
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    
    finishSelection() {
      if (this.uploadedImages.length > 0) {
        this.$emit('finish', {
          selectedMasks: this.stickerMasks.filter(mask => mask.selected),
          uploadedImages: this.uploadedImages
        })
        this.resetModal()
      }
    },
    
    resetModal() {
      this.currentStep = 1
      this.uploadedImages = []
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    }
  },
  
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.resetModal()
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

/* Стили для сетки форм стикеров */
.sticker-shapes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sticker-shape-item {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sticker-shape-item:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.sticker-shape-item.selected {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.shape-preview {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.shape-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}

/* Стили для области загрузки */
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

/* Стили для сетки загруженных изображений */
.uploaded-images {
  margin-top: 1.5rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  position: relative;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem;
  text-align: center;
}

.image-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.image-name {
  font-size: 0.75rem;
  color: #495057;
  word-break: break-word;
}

.remove-image {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

/* Стили для кнопок действий */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
