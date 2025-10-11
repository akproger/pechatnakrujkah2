<template>
  <div class="images-tab">
    <h6 class="text-muted mb-3">Загрузите изображения для стикеров</h6>
    
    <!-- Кнопка загрузки -->
    <input 
      ref="imageInput"
      type="file" 
      @change="handleImageUpload" 
      multiple
      accept="image/*"
      class="d-none"
    >
    <button 
      @click="$refs.imageInput.click()" 
      class="btn canvas-button w-100 mb-3"
      :disabled="uploadedImages.length >= 5"
    >
      <i class="bi bi-cloud-upload me-2"></i>
      <span v-if="uploadedImages.length >= 5">
        Максимальное количество изображений загружено
      </span>
      <span v-else-if="uploadedImages.length === 0">
        Загрузить изображения (до 5)
      </span>
      <span v-else>
        Добавить изображения (осталось {{ 5 - uploadedImages.length }})
      </span>
    </button>

    <!-- Список загруженных изображений -->
    <div v-if="uploadedImages.length > 0" class="mt-3">
      <h6 class="text-muted">Загруженные изображения:</h6>
      <div class="uploaded-images-list">
        <div v-for="(image, index) in uploadedImages" :key="index" class="image-item">
          <div class="form-check me-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              :id="'use-image-' + index"
              :checked="image.useInStickers"
              @change="onImageToggle"
            >
          </div>
          <img :src="image.url" :alt="image.name" class="image-preview">
          <span class="image-name">{{ image.name }}</span>
          <button 
            @click="removeImage(index)" 
            class="btn btn-sm btn-outline-danger ms-auto"
            title="Удалить изображение"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImagesTab',
  props: {
    uploadedImages: {
      type: Array,
      required: true
    }
  },
  emits: ['image-upload', 'image-toggle', 'image-remove'],
  methods: {
    handleImageUpload(event) {
      this.$emit('image-upload', event)
    },
    onImageToggle() {
      this.$emit('image-toggle')
    },
    removeImage(index) {
      this.$emit('image-remove', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.images-tab {
  padding: 16px 0;
}

.canvas-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
}

.uploaded-images-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
}

.image-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.image-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
