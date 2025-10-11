<template>
  <div class="sticker-mania-page">
    <!-- Лайтбокс выбора стикеров -->
    <StickerSelectionModal
      :is-visible="showSelectionModal"
      :sticker-masks="stickerMasks"
      @close="closeSelectionModal"
      @finish="handleSelectionFinish"
    />
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="row">
        <div class="col">
          <h2 class="page-title">Стикермания</h2>
          <p class="text-muted">Инструмент для создания стикеров с случайным размещением</p>
        </div>
      </div>
      
      <!-- Кнопки управления -->
      <div class="row mb-2">
        <div class="col-12" style="width: 66.66666667%;">
          <div class="card">
            <div class="card-body" style="padding-left: 10px;">
              <div class="row align-items-center">
                
                <!-- Панель инструментов -->
                <div class="col-auto" style="padding: 0; margin-right: 20px;">
                  <div class="tools-panel">
                    <button 
                      class="tool-button"
                      @click="handleGenerateClick"
                      :disabled="isLoading"
                      title="Генерировать стикеры"
                    >
                      <i class="bi bi-lightning-fill"></i>
                    </button>
                    <button 
                      class="tool-button"
                      :class="{ active: isManualStickerMode }"
                      :disabled="!getSelectedMasks() || getSelectedMasks().length === 0 || !getSelectedImages() || getSelectedImages().length === 0"
                      @click="toggleManualStickerMode"
                      title="Ручное размещение стикеров"
                    >
                      <i class="bi bi-plus-lg"></i>
                    </button>
                    <button 
                      class="tool-button"
                      @click="openTextManager"
                      title="Добавить текст"
                    >
                      <i class="bi bi-type"></i>
                    </button>
                    <button 
                      class="tool-button"
                      @click="triggerSave"
                      title="Сохранить в высоком качестве"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </div>
                
                <div class="col" style="padding: 0;">
                  <TextManager 
                    ref="textManager"
                    :canvas="$refs.testCanvas"
                    :paper-scope="paperScope"
                    @text-dialog-opened="onTextDialogOpened"
                    @text-dialog-closed="onTextDialogClosed"
                    @text-applied="onTextApplied"
                  />
                </div>
                
                <div class="col" style="padding: 0;">
                  <HighQualitySaveButton
                    ref="saveButton"
                    :save-function="saveCanvasForPrint"
                    :save-params="{}"
                    button-text="Сохранить в высоком качестве"
                    size="medium"
                    variant="primary"
                    :hide-button="true"
                    @save-success="onSaveSuccess"
                    @save-error="onSaveError"
                    @show-notification="showNotification"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Canvas область и 3D превью -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body p-0">
              <div class="canvas-container">
                <canvas 
                  ref="testCanvas"
                  class="test-canvas"
                ></canvas>
                
                <!-- Прелоадер -->
                <div v-if="isLoading" class="canvas-overlay">
                  <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 3D превью перенесён в боковую панель -->
      </div>
      
      <!-- Табы теперь в правой панели -->
    </div>
  </div>
</template>

<script>
import paper from 'paper'
import { markRaw } from 'vue'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import StickerSelectionModal from '../StickerSelectionModal.vue'
import TextManager from '../TextManager.vue'
import HighQualitySaveButton from '../common/HighQualitySaveButton.vue'
import ShapesTab from '../tabs/ShapesTab.vue'
import ImagesTab from '../tabs/ImagesTab.vue'
import SettingsTab from '../tabs/SettingsTab.vue'
import heartMask from '/src/assets/masks/heart.svg'
import rocketMask from '/src/assets/masks/rocket.svg'
import blabMask from '/src/assets/masks/blab.svg'
import trangleMask from '/src/assets/masks/trangle.svg'
import octaGoneMask from '/src/assets/masks/octa-gone.svg'
import form2Mask from '/src/assets/masks/form-2.svg'
import form1Mask from '/src/assets/masks/form-1.svg'
import squadMask from '/src/assets/masks/squad.svg'
import star6Mask from '/src/assets/masks/star-6.svg'
import sixGoneMask from '/src/assets/masks/six-gone.svg'
import star82Mask from '/src/assets/masks/star-8-2.svg'
import star8Mask from '/src/assets/masks/star-8.svg'
import starMask from '/src/assets/masks/star.svg'
import circleMask from '/src/assets/masks/circle.svg'

export default {
  name: 'StickerManiaPage',
  components: {
    ThreeDRenderer,
    StickerSelectionModal,
    TextManager,
    HighQualitySaveButton,
    ShapesTab,
    ImagesTab,
    SettingsTab
  },
  data() {
    return {
      // Paper.js
      paperScope: null,
      maskItems: {},
      
      // Состояние
      isLoading: false,
      showSelectionModal: false,
      isManualStickerMode: false,
      
      // Активный таб
      activeTab: 'shapes',
      
      // Маски стикеров
      stickerMasks: [
        { name: 'Сердце', url: heartMask, selected: false },
        { name: 'Ракета', url: rocketMask, selected: false },
        { name: 'Облако', url: blabMask, selected: false },
        { name: 'Треугольник', url: trangleMask, selected: false },
        { name: 'Восьмиугольник', url: octaGoneMask, selected: false },
        { name: 'Форма 2', url: form2Mask, selected: false },
        { name: 'Форма 1', url: form1Mask, selected: false },
        { name: 'Квадрат', url: squadMask, selected: false },
        { name: 'Звезда 6', url: star6Mask, selected: false },
        { name: 'Шестиугольник', url: sixGoneMask, selected: false },
        { name: 'Звезда 8-2', url: star82Mask, selected: false },
        { name: 'Звезда 8', url: star8Mask, selected: false },
        { name: 'Звезда', url: starMask, selected: false },
        { name: 'Круг', url: circleMask, selected: false }
      ],
      
      // Загруженные изображения
      uploadedImages: [],
      
      // Настройки
      strokeColor: '#ffffff',
      strokeWidth: 8, // Проценты (0-20)
      shadowBlur: 2, // Проценты (0-50)
      shadowOffsetX: 5, // Проценты (-50 до +50)
      shadowOffsetY: 5, // Проценты (-50 до +50)
      shadowOpacity: 40, // Проценты (0-100)
      
      // Управление стикерами
      selectedStickerIndex: -1,
      selectedItem: null, // Выбранный объект (стикер или текст)
      selectedItemType: null, // Тип выбранного объекта: 'sticker' или 'text'
      
      // Стикеры
      stickers: [],
      stickerPreviews: {}, // Хранилище превью стикеров
      
      // Текстовые элементы
      textItems: [],
      
      // Размеры
      minSize: 20, // Минимальный размер стикера в процентах
      maxSize: 80, // Максимальный размер стикера в процентах
      
      // Уведомления
      notifications: []
    }
  },
  computed: {
    getSelectedMasks() {
      return () => this.stickerMasks.filter(mask => mask.selected)
    },
    getSelectedImages() {
      return () => this.uploadedImages.filter(img => img.useInStickers)
    }
  },
  mounted() {
    console.log('🚀 Компонент смонтирован')
    
    // Инициализируем табы для правой панели
    this.initializeTabs()
    
    this.$nextTick(() => {
      console.log('🔄 DOM обновлен')
      // Даем больше времени на рендеринг DOM
      setTimeout(async () => {
        console.log('⏰ Таймаут истек, начинаем инициализацию')
        
        // Проверяем, что канвас существует
        const canvas = this.$refs.testCanvas
        if (!canvas) {
          console.error('❌ Канвас не найден!')
          return
        }
        
        console.log('✅ Канвас найден:', { width: canvas.width, height: canvas.height })
        
        try {
          await this.initPaperCanvas()
          console.log('✅ Paper.js инициализирован успешно')
        } catch (error) {
          console.error('❌ Ошибка инициализации Paper.js:', error)
        }
      }, 100)
    })
    
    // Добавляем обработчик изменения размера окна для пропорционального масштабирования
    window.addEventListener('resize', this.handleCanvasResize)
  },
  beforeUnmount() {
    // Очищаем Paper.js
    if (this.paperScope) {
      this.paperScope.remove()
      this.paperScope = null
    }
    
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleCanvasResize)
    // Очищаем все обработчики resize
    window.removeEventListener('resize', () => {})
  },
  methods: {
    // Инициализация табов для правой панели
    initializeTabs() {
      const tabs = [
        { id: 'shapes', title: 'Формы стикеров', icon: 'bi bi-shapes' },
        { id: 'images', title: 'Изображения', icon: 'bi bi-images' },
        { id: 'text', title: 'Тексты', icon: 'bi bi-type' },
        { id: 'settings', title: 'Настройки', icon: 'bi bi-gear' }
      ]
      
      // Добавляем таб "Стикеры" если есть сгенерированные стикеры
      if (this.stickers.length > 0) {
        tabs.push({ id: 'stickers', title: 'Стикеры', icon: 'bi bi-sticky' })
      }
      
      // Передаем табы в App.vue через событие
      this.$emit('set-page-tabs', tabs, this.activeTab || 'shapes')
    },
    
    // Обработчик изменения таба
    onTabChange(tabId) {
      this.activeTab = tabId
      console.log(`🔄 Переключение на таб: ${tabId}`)
    },
    
    // Триггер сохранения из панели инструментов
    triggerSave() {
      // Отключаем режим ручного размещения при клике на другую кнопку
      this.isManualStickerMode = false
      
      if (this.$refs.saveButton && this.$refs.saveButton.triggerSave) {
        this.$refs.saveButton.triggerSave()
      }
    },
    
    // Остальные методы будут добавлены позже...
    async initPaperCanvas() {
      // Инициализация Paper.js
      const canvas = this.$refs.testCanvas
      if (!canvas) return
      
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Настройка размеров канваса
      this.updateCanvasSize()
      
      // Создание фона
      this.createBackground()
      
      // Настройка обработчиков событий
      this.setupEventHandlers()
    },
    
    updateCanvasSize() {
      const canvas = this.$refs.testCanvas
      if (!canvas) return
      
      const container = canvas.parentElement
      if (!container) return
      
      const containerWidth = container.clientWidth
      const containerHeight = this.calculateCanvasHeight()
      
      canvas.width = containerWidth
      canvas.height = containerHeight
      
      if (this.paperScope) {
        this.paperScope.view.viewSize = new paper.Size(containerWidth, containerHeight)
      }
    },
    
    calculateCanvasHeight() {
      const canvas = this.$refs.testCanvas
      if (!canvas) return 400
      
      const containerWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 400
      const containerHeight = (containerWidth * 9) / 19
      return containerHeight
    },
    
    createBackground() {
      if (!this.paperScope) return
      
      const rect = new this.paperScope.Rectangle(
        new this.paperScope.Point(0, 0),
        this.paperScope.view.viewSize
      )
      
      const background = new this.paperScope.Path.Rectangle(rect)
      background.fillColor = 'white'
      background.sendToBack()
    },
    
    setupEventHandlers() {
      if (!this.paperScope) return
      
      // Обработчик клика для ручного размещения стикеров
      this.paperScope.view.onClick = (event) => {
        if (this.isManualStickerMode) {
          this.createManualSticker(event.point)
        }
      }
    },
    
    handleCanvasResize() {
      this.updateCanvasSize()
      this.createBackground()
    },
    
    // Заглушки для остальных методов
    handleGenerateClick() {
      console.log('Генерация стикеров...')
    },
    
    toggleManualStickerMode() {
      this.isManualStickerMode = !this.isManualStickerMode
    },
    
    openTextManager() {
      console.log('Открытие менеджера текста...')
    },
    
    createManualSticker(point) {
      console.log('Создание стикера в точке:', point)
    },
    
    handleMaskChange(index, event) {
      console.log('Изменение маски:', index, event)
    },
    
    handleImageUpload(event) {
      console.log('Загрузка изображений:', event)
    },
    
    onTextDialogOpened() {
      console.log('Диалог текста открыт')
    },
    
    onTextDialogClosed() {
      console.log('Диалог текста закрыт')
    },
    
    onTextApplied() {
      console.log('Текст применен')
    },
    
    onSaveSuccess() {
      console.log('Сохранение успешно')
    },
    
    onSaveError() {
      console.log('Ошибка сохранения')
    },
    
    showNotification(notification) {
      console.log('Уведомление:', notification)
    },
    
    closeSelectionModal() {
      this.showSelectionModal = false
    },
    
    handleSelectionFinish() {
      this.showSelectionModal = false
    },
    
    saveCanvasForPrint() {
      console.log('Сохранение канваса для печати...')
    }
  }
}
</script>

<style lang="scss" scoped>
.sticker-mania-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tools-panel {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tool-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover:not(:disabled) {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #007bff;
    color: white;
  }
  
  i {
    font-size: 16px;
  }
}

.canvas-container {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.test-canvas {
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  padding: 12px 16px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  
  &.success {
    background: #28a745;
  }
  
  &.error {
    background: #dc3545;
  }
  
  &.warning {
    background: #ffc107;
    color: #212529;
  }
  
  &.info {
    background: #17a2b8;
  }
}
</style>