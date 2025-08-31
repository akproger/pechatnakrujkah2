<template>
  <div class="text-editor">
    <!-- Кнопка добавления текста -->
    <div class="add-text-section">
      <button 
        @click="showAddTextForm = !showAddTextForm"
        class="btn btn-outline-primary"
        :class="{ 'active': showAddTextForm }"
      >
        <i class="bi bi-plus-circle me-2"></i>
        {{ showAddTextForm ? 'Скрыть форму' : 'Добавить текст' }}
      </button>
    </div>

    <!-- Форма добавления текста -->
    <div v-if="showAddTextForm" class="add-text-form">
      <div class="form-group mb-3">
        <label class="form-label">Текст:</label>
        <textarea 
          v-model="newText.content"
          class="form-control"
          rows="3"
          placeholder="Введите текст..."
        ></textarea>
      </div>

      <!-- Выбор подложки -->
      <div class="form-group mb-3">
        <label class="form-label">Подложка:</label>
        <div class="background-options">
                     <div 
             v-for="bg in backgroundOptions" 
             :key="bg.id"
             class="background-option"
             :class="{ 'selected': newText.backgroundId === bg.id }"
             @click="newText.backgroundId = bg.id"
           >
             <div class="bg-preview" :style="{ backgroundColor: bg.type === 'color' ? bg.color : 'transparent' }">
               <span v-if="bg.id === 'none'" class="bg-text">Нет</span>
               <img v-else-if="bg.type === 'svg'" :src="bg.svg" :alt="bg.name" class="bg-svg" />
               <span v-else class="bg-text">{{ bg.name }}</span>
             </div>
             <div class="bg-name">{{ bg.name }}</div>
           </div>
        </div>
      </div>

      <!-- Настройки текста -->
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label">Шрифт:</label>
            <select v-model="newText.fontFamily" class="form-select">
              <option v-for="font in googleFonts" :key="font.family" :value="font.family">
                {{ font.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label">Размер шрифта:</label>
            <input 
              v-model.number="newText.fontSize" 
              type="range" 
              class="form-range" 
              min="12" 
              max="72" 
              step="1"
            />
            <div class="text-center">{{ newText.fontSize }}px</div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label">Выравнивание:</label>
            <div class="alignment-buttons">
              <button 
                v-for="align in alignmentOptions" 
                :key="align.value"
                @click="newText.textAlign = align.value"
                class="btn btn-outline-secondary btn-sm"
                :class="{ 'active': newText.textAlign === align.value }"
              >
                <i :class="align.icon"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label">Цвет текста:</label>
            <input 
              v-model="newText.color" 
              type="color" 
              class="form-control form-control-color"
            />
          </div>
        </div>
      </div>

      <!-- Чекбоксы -->
      <div class="form-group mb-3">
        <div class="form-check">
          <input 
            v-model="newText.showWithoutBackground" 
            type="checkbox" 
            class="form-check-input" 
            id="showWithoutBg"
          />
          <label class="form-check-label" for="showWithoutBg">
            Показать без подложки
          </label>
        </div>
        <div class="form-check">
          <input 
            v-model="newText.useAsMask" 
            type="checkbox" 
            class="form-check-input" 
            id="useAsMask"
          />
          <label class="form-check-label" for="useAsMask">
            Использовать как маску для изображения
          </label>
        </div>
      </div>

      <!-- Загрузка изображения для маски -->
      <div v-if="newText.useAsMask" class="form-group mb-3">
        <label class="form-label">Изображение для маски:</label>
        <div class="upload-area" @click="triggerImageInput" @drop="handleImageDrop" @dragover.prevent>
          <div v-if="!newText.maskImage" class="upload-content">
            <i class="bi bi-image upload-icon"></i>
            <p class="upload-text">Нажмите для выбора изображения</p>
          </div>
          <div v-else class="image-preview">
            <img :src="newText.maskImage" alt="Preview" class="preview-img" />
            <button @click.stop="removeMaskImage" class="btn btn-sm btn-outline-danger remove-btn">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <input 
            ref="imageInput"
            type="file" 
            accept="image/*" 
            @change="handleImageSelect"
            style="display: none;"
          />
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="form-actions">
        <button @click="saveText" class="btn btn-primary" :disabled="!newText.content.trim()">
          <i class="bi bi-check-circle me-2"></i>
          Сохранить
        </button>
        <button @click="cancelAdd" class="btn btn-secondary">
          Отмена
        </button>
      </div>
    </div>

    <!-- Список добавленных текстов -->
    <div v-if="texts.length > 0" class="texts-list">
      <h6 class="texts-title">Добавленные тексты:</h6>
      <div class="text-item" v-for="(text, index) in texts" :key="text.id">
        <div class="text-content">
          <div class="text-preview">
            <div 
              class="text-display"
              :style="getTextStyle(text)"
            >
              {{ text.content }}
            </div>
          </div>
          <div class="text-info">
            <div class="text-name">{{ text.content.substring(0, 30) }}{{ text.content.length > 30 ? '...' : '' }}</div>
            <div class="text-details">
              {{ text.fontFamily }}, {{ text.fontSize }}px
            </div>
          </div>
        </div>
        <div class="text-controls">
          <div class="form-check">
            <input 
              v-model="text.visible" 
              type="checkbox" 
              class="form-check-input"
              @change="updateTextVisibility(text)"
            />
            <label class="form-check-label">Показать</label>
          </div>
          <div class="control-buttons">
            <button @click="editText(text)" class="btn btn-sm btn-outline-primary" title="Редактировать">
              <i class="bi bi-pencil"></i>
            </button>
            <button @click="deleteText(index)" class="btn btn-sm btn-outline-danger" title="Удалить">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Импорт SVG подложек
import svg001 from '/src/assets/text-svg/001.svg'
import svg002 from '/src/assets/text-svg/002.svg'
import svg003 from '/src/assets/text-svg/003.svg'

export default {
  name: 'TextEditor',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showAddTextForm: false,
      editingText: null,
      newText: {
        content: '',
        backgroundId: 'white',
        fontFamily: 'Roboto',
        fontSize: 24,
        textAlign: 'left',
        color: '#000000',
        showWithoutBackground: false,
        useAsMask: false,
        maskImage: null
      },
      backgroundOptions: [
        { id: 'none', name: 'Без подложки', color: 'transparent', type: 'color' },
        { id: 'white', name: 'Белая', color: '#ffffff', type: 'color' },
        { id: 'black', name: 'Черная', color: '#000000', type: 'color' },
        { id: 'gray', name: 'Серая', color: '#f8f9fa', type: 'color' },
        { id: 'blue', name: 'Синяя', color: '#e3f2fd', type: 'color' },
        { id: 'green', name: 'Зеленая', color: '#e8f5e8', type: 'color' },
        { id: 'yellow', name: 'Желтая', color: '#fff8e1', type: 'color' },
        { id: 'red', name: 'Красная', color: '#ffebee', type: 'color' },
        { id: 'svg001', name: 'Прямоугольник', svg: svg001, type: 'svg' },
        { id: 'svg002', name: 'Скругленный', svg: svg002, type: 'svg' },
        { id: 'svg003', name: 'Овал', svg: svg003, type: 'svg' }
      ],
      googleFonts: [
        { family: 'Roboto', name: 'Roboto' },
        { family: 'Open Sans', name: 'Open Sans' },
        { family: 'Lato', name: 'Lato' },
        { family: 'Poppins', name: 'Poppins' },
        { family: 'Source Sans Pro', name: 'Source Sans Pro' },
        { family: 'Montserrat', name: 'Montserrat' },
        { family: 'Raleway', name: 'Raleway' },
        { family: 'PT Sans', name: 'PT Sans' },
        { family: 'Noto Sans', name: 'Noto Sans' },
        { family: 'Ubuntu', name: 'Ubuntu' },
        { family: 'Playfair Display', name: 'Playfair Display' },
        { family: 'Merriweather', name: 'Merriweather' },
        { family: 'Lora', name: 'Lora' },
        { family: 'Crimson Text', name: 'Crimson Text' },
        { family: 'Libre Baskerville', name: 'Libre Baskerville' }
      ],
      alignmentOptions: [
        { value: 'left', icon: 'bi bi-text-left' },
        { value: 'center', icon: 'bi bi-text-center' },
        { value: 'right', icon: 'bi bi-text-right' },
        { value: 'justify', icon: 'bi bi-text-paragraph' }
      ]
    }
  },
  computed: {
    texts: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  mounted() {
    this.loadGoogleFonts()
  },
  methods: {
    loadGoogleFonts() {
      const fontFamilies = this.googleFonts.map(font => font.family.replace(' ', '+')).join('&family=')
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    },

    getTextStyle(text) {
      const background = this.backgroundOptions.find(bg => bg.id === text.backgroundId)
      const isSvgBackground = background && background.type === 'svg'
      
      return {
        fontFamily: text.fontFamily,
        fontSize: `${text.fontSize}px`,
        textAlign: text.textAlign,
        color: text.color,
        backgroundColor: text.showWithoutBackground ? 'transparent' : this.getBackgroundColor(text.backgroundId),
        padding: text.showWithoutBackground ? '0' : '8px 12px',
        borderRadius: text.showWithoutBackground ? '0' : '4px',
        display: 'inline-block',
        maxWidth: '100%',
        wordBreak: 'break-word',
        backgroundImage: isSvgBackground ? `url(${background.svg})` : 'none',
        backgroundSize: isSvgBackground ? 'contain' : 'auto',
        backgroundRepeat: isSvgBackground ? 'no-repeat' : 'repeat',
        backgroundPosition: isSvgBackground ? 'center' : 'initial'
      }
    },

    getBackgroundColor(backgroundId) {
      const bg = this.backgroundOptions.find(b => b.id === backgroundId)
      return bg ? bg.color : 'transparent'
    },

    triggerImageInput() {
      this.$refs.imageInput.click()
    },

    handleImageSelect(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.newText.maskImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    handleImageDrop(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.newText.maskImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    removeMaskImage() {
      this.newText.maskImage = null
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = ''
      }
    },

    saveText() {
      if (!this.newText.content.trim()) return

      const textData = {
        id: Date.now() + Math.random(),
        ...this.newText,
        visible: false
      }

      if (this.editingText) {
        // Редактирование существующего текста
        const index = this.texts.findIndex(t => t.id === this.editingText.id)
        if (index !== -1) {
          this.texts.splice(index, 1, textData)
        }
        this.editingText = null
      } else {
        // Добавление нового текста
        this.texts.push(textData)
      }

      this.resetForm()
      this.showAddTextForm = false
      this.$emit('texts-changed', this.texts)
    },

    cancelAdd() {
      this.resetForm()
      this.showAddTextForm = false
      this.editingText = null
    },

    resetForm() {
      this.newText = {
        content: '',
        backgroundId: 'white',
        fontFamily: 'Roboto',
        fontSize: 24,
        textAlign: 'left',
        color: '#000000',
        showWithoutBackground: false,
        useAsMask: false,
        maskImage: null
      }
    },

    editText(text) {
      this.editingText = text
      this.newText = { ...text }
      this.showAddTextForm = true
    },

    deleteText(index) {
      this.texts.splice(index, 1)
      this.$emit('texts-changed', this.texts)
    },

    updateTextVisibility(text) {
      this.$emit('text-visibility-changed', text)
    }
  }
}
</script>

<style scoped>
.text-editor {
  margin-bottom: 1rem;
}

.add-text-section {
  margin-bottom: 1rem;
}

.add-text-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.background-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
}

.background-option {
  text-align: center;
  cursor: pointer;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.background-option:hover {
  border-color: #007bff;
}

.background-option.selected {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.bg-preview {
  width: 40px;
  height: 40px;
  margin: 0 auto 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
}

.bg-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
}

.bg-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bg-name {
  font-size: 0.75rem;
  color: #6c757d;
}

.alignment-buttons {
  display: flex;
  gap: 0.25rem;
}

.alignment-buttons .btn {
  flex: 1;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.875rem;
  color: #495057;
  margin: 0;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-img {
  max-width: 100px;
  max-height: 60px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.texts-list {
  margin-top: 1.5rem;
}

.texts-title {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #495057;
}

.text-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background: white;
}

.text-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 1rem;
}

.text-preview {
  min-width: 120px;
  max-width: 200px;
}

.text-display {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.875rem;
  line-height: 1.2;
  max-height: 60px;
  overflow: hidden;
}

.text-info {
  flex: 1;
}

.text-name {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.text-details {
  font-size: 0.75rem;
  color: #6c757d;
}

.text-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-buttons {
  display: flex;
  gap: 0.25rem;
}

.form-check {
  margin: 0;
}

.form-check-label {
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
</style>
