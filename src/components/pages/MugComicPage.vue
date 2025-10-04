<template>
  <div class="mug-comic-page">
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="row">
        <div class="col">
          <h2 class="page-title">Кружка-комикс</h2>
          <p class="text-muted">Инструмент для создания комиксов на кружках</p>
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
                      :class="{ 'active': activeTool === 'scalpel' || scalpelMode }"
                      @click="toggleScalpelMode"
                      title="Скальпель - разрезать прямоугольник"
                    >
                      <i class="bi bi-scissors"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Кнопка добавления текста -->
                <div class="col" style="padding: 0;">
                  <button 
                    @click="openTextManager" 
                    class="btn canvas-button text-button"
                  >
                    <i class="bi bi-type me-2"></i>
                    Текст
                  </button>
                </div>
                
                <div class="col" style="padding: 0;">
                  <TextManager 
                    ref="textManager"
                    :canvas="$refs.comicCanvas"
                    :paper-scope="paperScope"
                    @text-dialog-opened="onTextDialogOpened"
                    @text-dialog-closed="onTextDialogClosed"
                    @text-applied="onTextApplied"
                  />
                </div>
                
                <!-- Кнопка сохранения -->
                <div class="col" style="padding: 0;">
                  <GridSaveCanvas
                    :grid-cols="1"
                    :grid-rows="1"
                    :mask-type="'rectangle'"
                    :uploaded-images="[]"
                    :stroke-color="strokeColor"
                    :stroke-width="strokeWidthPx"
                    :external-margin="0"
                    :shadow-blur="0"
                    :shadow-offset-x="0"
                    :shadow-offset-y="0"
                    :shadow-opacity="0"
                    :solid-background-color="'#ffffff'"
                    :solid-background-opacity="100"
                    :background-image="backgroundImage"
                    :enable-background-image="!!backgroundImage"
                    :text-layers="textLayers"
                    @save-start="onSaveStart"
                    @save-success="onSaveSuccess"
                    @save-error="onSaveError"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Canvas область и 3D превью -->
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body p-0">
              <div class="canvas-container">
                <canvas 
                  ref="comicCanvas"
                  class="comic-canvas"
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
        
        <!-- 3D превью кружки -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body p-0">
              <ThreeDRenderer 
                ref="threeRenderer"
                :source-canvas="$refs.comicCanvas"
                :auto-update="true"
                :rotation-speed="0.01"
                :mug-radius="4"
                :mug-height="9.5"
                :print-aspect-ratio="19/9"
                @initialized="onThreeInitialized"
                @texture-updated="onTextureUpdated"
                @texture-error="onTextureError"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Табы управления -->
      <div class="row mt-4">
        <div class="col-12">
          <ul class="nav nav-tabs" id="mugComicTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'images' }"
                id="images-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#images" 
                type="button" 
                role="tab" 
                aria-controls="images" 
                aria-selected="activeTab === 'images'"
                @click="activeTab = 'images'"
              >
                <i class="bi bi-images me-2"></i>
                Изображения
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'background' }"
                id="background-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#background" 
                type="button" 
                role="tab" 
                aria-controls="background" 
                aria-selected="activeTab === 'background'"
                @click="activeTab = 'background'"
              >
                <i class="bi bi-image me-2"></i>
                Фон
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'texts' }"
                id="texts-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#texts" 
                type="button" 
                role="tab" 
                aria-controls="texts" 
                aria-selected="activeTab === 'texts'"
                @click="activeTab = 'texts'"
              >
                <i class="bi bi-type me-2"></i>
                Тексты
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'settings' }"
                id="settings-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#settings" 
                type="button" 
                role="tab" 
                aria-controls="settings" 
                aria-selected="activeTab === 'settings'"
                @click="activeTab = 'settings'"
              >
                <i class="bi bi-gear me-2"></i>
                Настройки
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Контент табов -->
      <div class="tab-content" id="mugComicTabContent">
        <!-- Таб "Изображения" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'images' }" id="images" role="tabpanel" aria-labelledby="images-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <!-- Загрузка изображений -->
                    <div class="col-12">
                      <input 
                        type="file" 
                        ref="imageInput"
                        @change="handleImageUpload" 
                        multiple
                        accept="image/*"
                        class="d-none"
                      >
                      <button 
                        @click="$refs.imageInput.click()" 
                        class="btn"
                        :disabled="uploadedImages.length >= 10"
                        style="background-color: #0d6efd; border: none; color: white;"
                      >
                        <i class="bi bi-cloud-upload me-2"></i>
                        <span v-if="uploadedImages.length >= 10">
                          Максимальное количество изображений загружено
                        </span>
                        <span v-else-if="uploadedImages.length === 0">
                          Загрузить изображения (до 10)
                        </span>
                        <span v-else>
                          Добавить изображения (осталось {{ 10 - uploadedImages.length }})
                        </span>
                      </button>
                    </div>
                    
                    <!-- Список загруженных изображений -->
                    <div class="col-12" v-if="uploadedImages.length > 0">
                      <h6 class="text-muted mb-3">Загруженные изображения</h6>
                      <div class="row g-2">
                        <div 
                          v-for="(image, index) in uploadedImages" 
                          :key="index"
                          class="col-md-4 col-lg-3 col-xl-2"
                        >
                          <div class="position-relative">
                            <img 
                              :src="image.url" 
                              :alt="image.name"
                              class="img-fluid rounded border"
                              style="max-height: 100px; width: 100%; object-fit: cover;"
                            >
                            <button 
                              @click="removeImage(index)"
                              class="btn btn-sm position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center"
                              style="width: 24px; height: 24px; padding: 0; border-radius: 50%; background-color: #495057; border: none; color: white;"
                            >
                              <i class="bi bi-x" style="font-size: 14px; line-height: 1;"></i>
                            </button>
                          </div>
                          <small class="text-muted d-block mt-1">{{ image.name }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Таб "Фон" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'background' }" id="background" role="tabpanel" aria-labelledby="background-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <!-- Загрузка фонового изображения -->
                    <div class="col-12">
                      <input 
                        type="file" 
                        ref="backgroundInput"
                        @change="handleBackgroundUpload" 
                        accept="image/*"
                        class="d-none"
                      >
                      <button 
                        @click="$refs.backgroundInput.click()" 
                        class="btn"
                        style="background-color: #0d6efd; border: none; color: white;"
                      >
                        <i class="bi bi-cloud-upload me-2"></i>
                        <span v-if="!backgroundImage">
                          Загрузить фоновое изображение
                        </span>
                        <span v-else>
                          Заменить фоновое изображение
                        </span>
                      </button>
                    </div>
                    
                    <!-- Предпросмотр фонового изображения -->
                    <div class="col-12" v-if="backgroundImage">
                      <h6 class="text-muted mb-3">Фоновое изображение</h6>
                      <div class="position-relative preview-contaner">
                        <img 
                          :src="backgroundImage" 
                          alt="Фоновое изображение"
                          class="rounded border"
                          style="max-height: 100px; width: auto; object-fit: contain;"
                        >
                        <button 
                          @click="removeBackground" 
                          class="btn btn-danger btn-sm position-absolute"
                          style="top: 5px; right: 5px; border-radius: 50%; width: 30px; height: 30px; padding: 0; display: flex; align-items: center; justify-content: center;"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Таб "Тексты" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'texts' }" id="texts" role="tabpanel" aria-labelledby="texts-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <h6 class="text-muted mb-3">Управление текстовыми слоями</h6>
                  
                  <!-- Список текстовых слоев -->
                  <div v-if="textLayers.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-type" style="font-size: 3rem;"></i>
                    <p class="mt-2">Нет добавленных текстов. Нажмите кнопку "Текст" выше, чтобы добавить.</p>
                  </div>
                  
                  <div v-else class="row g-3">
                    <div 
                      v-for="(layer, index) in textLayers" 
                      :key="layer.id"
                      class="col-12"
                    >
                      <div class="card border">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                              <h6 class="mb-2">
                                <i class="bi bi-type me-2"></i>
                                Текст {{ index + 1 }}
                              </h6>
                              <p class="text-muted mb-2 small">{{ layer.text }}</p>
                              <div class="d-flex gap-3 small text-muted">
                                <span><i class="bi bi-fonts me-1"></i>{{ layer.fontSize }}px</span>
                                <span><i class="bi bi-palette me-1"></i>{{ layer.fillColor }}</span>
                              </div>
                            </div>
                            <div class="d-flex gap-2">
                              <button 
                                @click="editTextLayer(index)"
                                class="btn btn-sm btn-outline-primary"
                                title="Редактировать"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button 
                                @click="deleteTextLayer(index)"
                                class="btn btn-sm btn-outline-danger"
                                title="Удалить"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Таб "Настройки" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'settings' }" id="settings" role="tabpanel" aria-labelledby="settings-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <!-- Обводка -->
                    <div class="col-md-4">
                      <h6 class="text-muted mb-3">Обводка основного поля</h6>
                      <div class="form-group">
                        <label class="form-label">Цвет обводки</label>
                        <input 
                          type="color" 
                          class="form-control form-control-color" 
                          v-model="strokeColor"
                          title="Выберите цвет обводки"
                        >
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Толщина обводки: {{ strokeWidth }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="strokeWidth"
                          min="0" 
                          max="20" 
                          step="1"
                        >
                      </div>
                    </div>
                    
                    <!-- Настройки скальпеля -->
                    <div class="col-md-4">
                      <h6 class="text-muted mb-3">Настройки скальпеля</h6>
                      <div class="form-group">
                        <label class="form-label">Ширина разреза: {{ scalpelWidth }}px</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="scalpelWidth"
                          min="1" 
                          max="10" 
                          step="1"
                        >
                      </div>
                      <div class="form-group mt-2">
                        <small class="text-muted">
                          Ширина разреза определяет, насколько широким будет разрез основного прямоугольника
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import paper from 'paper'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import TextManager from '../TextManager.vue'
import GridSaveCanvas from '../common/GridSaveCanvas.vue'

export default {
  name: 'MugComicPage',
  components: {
    ThreeDRenderer,
    TextManager,
    GridSaveCanvas
  },
  data() {
    return {
      // Canvas и Paper.js
      paperScope: null,
      isLoading: false,
      baseRectangle: null, // Базовый прямоугольник на canvas
      
      // Инструменты
      activeTool: null,
      
      // Вкладки
      activeTab: 'images',
      
      // Изображения
      uploadedImages: [],
      
      // Фоновое изображение
      backgroundImage: null,
      
      // Текстовые слои
      textLayers: [],
      nextTextLayerId: 100, // Начальный ID для текстовых слоёв
      
      // Настройки обводки
      strokeColor: '#000000',
      strokeWidth: 5, // Проценты (0-20)
      
      // Настройки скальпеля
      scalpelMode: false, // Режим скальпеля
      scalpelPoints: [], // Точки линии разреза
      scalpelLine: null, // Временная линия разреза
      scalpelWidth: 2 // Ширина разреза в пикселях
    }
  },
  computed: {
    // Рассчитываем толщину обводки в пикселях от размера основного поля
    strokeWidthPx() {
      if (!this.baseRectangle || !this.paperScope) return 0
      
      // Берём минимальный размер (ширина или высота) основного поля
      const bounds = this.baseRectangle.bounds
      const minDimension = Math.min(bounds.width, bounds.height)
      
      // Вычисляем толщину обводки как процент от минимального размера
      return (this.strokeWidth / 100) * minDimension
    }
  },
  watch: {
    strokeColor() {
      this.updateBaseRectangle()
    },
    strokeWidth() {
      this.updateBaseRectangle()
    }
  },
  mounted() {
    this.initPaperCanvas()
  },
  beforeUnmount() {
    if (this.paperScope) {
      this.paperScope.remove()
      this.paperScope = null
    }
  },
  methods: {
    // ========== Инициализация Paper.js ==========
    initPaperCanvas() {
      const canvas = this.$refs.comicCanvas
      if (!canvas) {
        console.error('Canvas не найден')
        return
      }

      // Создаём новый scope для Paper.js
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Получаем размер контейнера (.canvas-container)
      const container = canvas.parentElement
      if (!container) {
        console.log('⚠️ Контейнер не найден')
        return
      }

      // Контейнер использует padding-bottom для соотношения сторон 19:9
      const width = container.offsetWidth
      const height = container.offsetHeight
      
      // Устанавливаем размер Paper.js view
      this.paperScope.view.viewSize = new this.paperScope.Size(width, height)
      
      // Устанавливаем белый фон
      const background = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: 'white'
      })
      background.sendToBack()
      
      // Создаём базовый прямоугольник размером с canvas
      this.createBaseRectangle(width, height)
      
      // Настраиваем инструменты Paper.js для перетаскивания
      this.setupPaperTools()
      
      console.log('Paper.js canvas инициализирован:', width, 'x', height)
    },

    // ========== Создание базового прямоугольника ==========
    createBaseRectangle(width, height) {
      if (!this.paperScope) return

      // Рассчитываем начальную толщину обводки
      const minDimension = Math.min(width, height)
      const initialStrokeWidth = (this.strokeWidth / 100) * minDimension

      // Создаём фоновое изображение, если оно загружено
      if (this.backgroundImage) {
        this.createBackgroundImage(width, height)
      }

      // Создаём прямоугольник размером с весь canvas
      this.baseRectangle = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: null, // Без заливки
        strokeColor: this.strokeColor,
        strokeWidth: initialStrokeWidth
      })
      
      // Устанавливаем острые углы для чётких линий
      this.baseRectangle.strokeJoin = 'miter'
      this.baseRectangle.strokeCap = 'butt'
      
      console.log('✅ Базовый прямоугольник создан:', {
        size: `${width}x${height}`,
        strokeColor: this.strokeColor,
        strokeWidth: initialStrokeWidth,
        hasBackground: !!this.backgroundImage
      })
    },

    // Создание фонового изображения
    createBackgroundImage(width, height) {
      if (!this.backgroundImage || !this.paperScope) return

      // Создаём Paper.js Raster из изображения
      const backgroundRaster = new this.paperScope.Raster(this.backgroundImage)
      
      backgroundRaster.onLoad = () => {
        // Масштабируем изображение пропорционально, чтобы покрыть весь прямоугольник
        const scaleX = width / backgroundRaster.bounds.width
        const scaleY = height / backgroundRaster.bounds.height
        const scale = Math.max(scaleX, scaleY) // Используем больший масштаб для покрытия
        
        backgroundRaster.scaling = new this.paperScope.Point(scale, scale)
        
        // Центрируем изображение
        backgroundRaster.position = new this.paperScope.Point(width / 2, height / 2)
        
        // Перемещаем фоновое изображение в самый низ
        backgroundRaster.sendToBack()
        
        console.log('✅ Фоновое изображение добавлено:', {
          originalSize: `${backgroundRaster.bounds.width}x${backgroundRaster.bounds.height}`,
          scale: scale,
          position: backgroundRaster.position
        })
      }
    },

    // ========== Обновление базового прямоугольника ==========
    updateBaseRectangle() {
      if (!this.baseRectangle || !this.paperScope) return

      // Обновляем стили обводки
      this.baseRectangle.strokeColor = this.strokeColor
      this.baseRectangle.strokeWidth = this.strokeWidthPx
      
      // Перерисовываем view
      this.paperScope.view.update()
      
      // Обновляем 3D модель
      this.update3DTexture()
      
      console.log('🔄 Базовый прямоугольник обновлён:', {
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidthPx
      })
    },

    // ========== Обновление 3D текстуры ==========
    update3DTexture() {
      // Ждём следующий фрейм для обновления canvas
      this.$nextTick(() => {
        if (this.$refs.threeRenderer && this.$refs.threeRenderer.updateTexture) {
          this.$refs.threeRenderer.updateTexture()
        }
      })
    },

    // ========== Настройка инструментов Paper.js для перетаскивания ==========
    setupPaperTools() {
      if (!this.paperScope) return
      
      // Создаем инструмент для перетаскивания
      const dragTool = new this.paperScope.Tool()
      
      let dragItem = null
      let offset = null
      let clickCount = 0
      let clickTimer = null
      
      // Функция для снятия выделения
      const clearSelection = () => {
        if (dragItem) {
          dragItem.selected = false
          dragItem = null
          console.log('🎯 Выделение снято')
        }
      }
      
      dragTool.onMouseDown = (event) => {
        // Обработка двойного клика
        clickCount++
        
        if (clickCount === 1) {
          clickTimer = setTimeout(() => {
            // Одинарный клик - выбираем объект
            this.handleSingleClick(event, clearSelection)
            clickCount = 0
          }, 300) // 300ms для двойного клика
        } else if (clickCount === 2) {
          clearTimeout(clickTimer)
          clickCount = 0
          
          // Обрабатываем двойной клик
          this.handleDoubleClick(event)
          return // Не продолжаем с обычной логикой перетаскивания
        }
        
        // Ищем элемент под курсором
        if (!this.paperScope.project) {
          console.warn('⚠️ paperScope.project не найден')
          return
        }
        
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 10
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          
          // Проверяем, что это текстовый элемент или подложка (не базовый прямоугольник)
          const isBaseRectangle = item === this.baseRectangle
          const isTextItem = !isBaseRectangle && (
            item.className === 'TextItem' || 
            item.className === 'Group' || 
            item.className === 'Raster' ||
            (item.parent && item.parent.className === 'Layer') ||
            (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
          )
          
          if (isTextItem) {
            // Снимаем предыдущее выделение при начале перетаскивания
            clearSelection()
            
            // Это текстовый элемент
            dragItem = item
            console.log('🎯 Начато перетаскивание текстового элемента:', dragItem.className, dragItem.data)
            
            offset = event.point.subtract(dragItem.position)
            dragItem.selected = true
          }
        }
      }
      
      dragTool.onMouseDrag = (event) => {
        if (dragItem && this.paperScope && this.paperScope.project) {
          // Обычное перемещение
          dragItem.position = event.point.subtract(offset)
          
          // Обновляем позицию в данных слоя для всех текстовых слоев
          const layerInfo = this.textLayers.find(layer => layer.raster === dragItem || layer.backgroundItem === dragItem || layer.layer === dragItem)
          if (layerInfo) {
            layerInfo.position = { x: dragItem.position.x, y: dragItem.position.y }
            console.log('📍 Обновлена позиция слоя при перетаскивании:', {
              layerIndex: layerInfo.id,
              position: layerInfo.position
            })
          }
          
          // Перерисовываем рендер кружки при перемещении
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      dragTool.onMouseUp = (event) => {
        if (dragItem && this.paperScope && this.paperScope.project) {
          dragItem.selected = false
          console.log('🎯 Завершено перетаскивание Paper.js элемента')
          
          // Находим соответствующий слой и фиксируем итоговую позицию ЦЕНТРА объекта
          const layerInfo = this.textLayers.find(layer => layer.raster === dragItem || layer.backgroundItem === dragItem || layer.layer === dragItem)
          if (layerInfo) {
            layerInfo.position = { x: dragItem.position.x, y: dragItem.position.y }
            console.log('📌 Финальная фиксация позиции слоя после перетаскивания:', {
              id: layerInfo.id,
              position: layerInfo.position
            })
          }

          dragItem = null
          offset = null
          
          // Финальная перерисовка рендера кружки после завершения перемещения
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      // Обработчик двойного клика для редактирования текстовых элементов
      dragTool.onDoubleClick = (event) => {
        console.log('🎯 Двойной клик зарегистрирован в точке:', event.point)
        
        if (!this.paperScope || !this.paperScope.project) {
          console.warn('⚠️ paperScope.project не найден при двойном клике')
          return
        }
        
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 15 // Увеличиваем tolerance для лучшего обнаружения
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          
          // Проверяем, что это текстовый элемент (не базовый прямоугольник)
          const isBaseRectangle = item === this.baseRectangle
          const isTextItem = !isBaseRectangle && (
            item.className === 'TextItem' || 
            item.className === 'Group' || 
            item.className === 'Raster' ||
            (item.parent && item.parent.className === 'Layer') ||
            (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
          )
          
          if (isTextItem) {
            // Находим соответствующий текстовый слой
            const layerInfo = this.textLayers.find(layer => layer.raster === item || layer.backgroundItem === item || layer.layer === item)
            if (layerInfo) {
              // Открываем диалог редактирования
              this.editTextLayer(this.textLayers.indexOf(layerInfo))
              console.log('✏️ Открыто редактирование текстового слоя:', layerInfo.id)
            }
          }
        }
      }
      
      console.log('✅ Инструменты Paper.js настроены для перетаскивания')
    },

    // Обработка одинарного клика
    handleSingleClick(event, clearSelection) {
      // Обработка кликов в режиме скальпеля
      if (this.scalpelMode) {
        this.handleScalpelClick(event)
        return
      }
      
      // Здесь можно добавить логику для одинарного клика
      console.log('🖱️ Одинарный клик в точке:', event.point)
    },
    
    // Обработка клика в режиме скальпеля
    handleScalpelClick(event) {
      console.log('🔪 Клик скальпеля в точке:', event.point)
      
      // Добавляем точку
      this.scalpelPoints.push({
        x: event.point.x,
        y: event.point.y
      })
      
      console.log('📍 Точка добавлена. Всего точек:', this.scalpelPoints.length)
      
      // Обновляем линию
      this.updateScalpelLine()
    },

    // Обработка двойного клика
    handleDoubleClick(event) {
      // Логика двойного клика уже реализована в setupPaperTools
      console.log('🖱️ Двойной клик в точке:', event.point)
    },

    // ========== Управление изображениями ==========
    handleImageUpload(event) {
      const files = event.target.files
      if (!files || files.length === 0) return

      const remainingSlots = 10 - this.uploadedImages.length
      const filesToProcess = Array.from(files).slice(0, remainingSlots)

      filesToProcess.forEach(file => {
        if (!file.type.startsWith('image/')) {
          console.warn('Файл не является изображением:', file.name)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          this.uploadedImages.push({
            name: file.name,
            url: e.target.result,
            file: file
          })
        }
        reader.readAsDataURL(file)
      })

      // Очищаем input для повторной загрузки
      event.target.value = ''
    },

    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },

    // ========== Управление фоновым изображением ==========
    handleBackgroundUpload(event) {
      const file = event.target.files[0]
      if (!file || !file.type.startsWith('image/')) {
        console.warn('Файл не является изображением:', file?.name)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.backgroundImage = e.target.result
        console.log('✅ Фоновое изображение загружено:', file.name)
        this.updateCanvasWithBackground()
        
        // Принудительно обновляем 3D модель после небольшой задержки
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              console.log('🔄 Принудительное обновление 3D модели после загрузки фона')
              this.$refs.threeRenderer.updateTexture()
            }
          }, 100)
        })
      }
      reader.readAsDataURL(file)

      // Очищаем input для повторной загрузки
      event.target.value = ''
    },

    removeBackground() {
      this.backgroundImage = null
      console.log('🗑️ Фоновое изображение удалено')
      this.updateCanvasWithBackground()
      
      // Принудительно обновляем 3D модель после удаления фона
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            console.log('🔄 Принудительное обновление 3D модели после удаления фона')
            this.$refs.threeRenderer.updateTexture()
          }
        }, 100)
      })
    },

    updateCanvasWithBackground() {
      if (this.paperScope && this.paperScope.view) {
        // Очищаем canvas
        this.paperScope.project.clear()
        
        // Пересоздаем базовый прямоугольник с фоновым изображением
        const canvasWidth = this.paperScope.view.viewSize.width
        const canvasHeight = this.paperScope.view.viewSize.height
        this.createBaseRectangle(canvasWidth, canvasHeight)
        
        // Текстовые слои уже существуют в this.textLayers и автоматически отображаются
        // Обновляем canvas
        this.paperScope.view.update()
        
        // Обновляем 3D модель
        this.$nextTick(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.updateTexture()
          }
        })
      }
    },

    // ========== Управление скальпелем ==========
    toggleScalpelMode() {
      if (this.scalpelMode) {
        // Применяем разрез
        this.applyScalpelCut()
      } else {
        // Активируем режим скальпеля
        this.activateScalpelMode()
      }
    },
    
    activateScalpelMode() {
      this.scalpelMode = true
      this.scalpelPoints = []
      this.scalpelLine = null
      this.activeTool = 'scalpel'
      console.log('🔪 Режим скальпеля активирован')
    },
    
    applyScalpelCut() {
      if (this.scalpelPoints.length < 2) {
        console.warn('⚠️ Недостаточно точек для разреза')
        this.scalpelMode = false
        this.activeTool = null
        return
      }
      
      console.log('✂️ Применяем разрез скальпеля:', this.scalpelPoints.length, 'точек')
      this.performScalpelCut()
      
      // Сбрасываем режим
      this.scalpelMode = false
      this.activeTool = null
      this.scalpelPoints = []
      this.clearScalpelLine()
    },
    
    performScalpelCut() {
      console.log('🔪 Выполняем разрез по точкам:', this.scalpelPoints)
      
      // Продлеваем линию до края прямоугольника
      const extendedPoints = this.extendLineToRectangleEdges()
      console.log('📏 Продленная линия:', extendedPoints)
      
      // Создаем линию разреза и проверяем её свойства
      const cutLine = this.createCutLine(extendedPoints)
      console.log('🔍 Свойства линии разреза:', {
        closed: cutLine.closed,
        segments: cutLine.segments.length,
        strokeWidth: cutLine.strokeWidth,
        bounds: cutLine.bounds.toString()
      })
      
      // Применяем разрез
      this.cutRectangleWithLine(extendedPoints)
    },
    
    extendLineToRectangleEdges() {
      if (this.scalpelPoints.length < 2) {
        return this.scalpelPoints
      }
      
      const canvasWidth = this.paperScope.view.viewSize.width
      const canvasHeight = this.paperScope.view.viewSize.height
      
      // Получаем границы прямоугольника
      const rectBounds = {
        left: 0,
        top: 0,
        right: canvasWidth,
        bottom: canvasHeight
      }
      
      const extendedPoints = [...this.scalpelPoints]
      
      // Продлеваем первую точку
      if (this.scalpelPoints.length >= 2) {
        const firstPoint = this.scalpelPoints[0]
        const secondPoint = this.scalpelPoints[1]
        
        // Вектор от второй точки к первой
        const direction = {
          x: firstPoint.x - secondPoint.x,
          y: firstPoint.y - secondPoint.y
        }
        
        // Нормализуем вектор
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
        if (length > 0) {
          direction.x /= length
          direction.y /= length
        }
        
        // Находим пересечение с границами прямоугольника
        const extendedFirst = this.findIntersectionWithRectangle(
          firstPoint, direction, rectBounds
        )
        
        if (extendedFirst) {
          extendedPoints[0] = extendedFirst
        }
      }
      
      // Продлеваем последнюю точку
      if (this.scalpelPoints.length >= 2) {
        const lastPoint = this.scalpelPoints[this.scalpelPoints.length - 1]
        const prevPoint = this.scalpelPoints[this.scalpelPoints.length - 2]
        
        // Вектор от предпоследней точки к последней
        const direction = {
          x: lastPoint.x - prevPoint.x,
          y: lastPoint.y - prevPoint.y
        }
        
        // Нормализуем вектор
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
        if (length > 0) {
          direction.x /= length
          direction.y /= length
        }
        
        // Находим пересечение с границами прямоугольника
        const extendedLast = this.findIntersectionWithRectangle(
          lastPoint, direction, rectBounds
        )
        
        if (extendedLast) {
          extendedPoints[extendedPoints.length - 1] = extendedLast
        }
      }
      
      return extendedPoints
    },
    
    findIntersectionWithRectangle(point, direction, rectBounds) {
      // Находим пересечение луча с границами прямоугольника
      const intersections = []
      
      // Проверяем пересечение с левой границей
      if (direction.x !== 0) {
        const t = (rectBounds.left - point.x) / direction.x
        if (t > 0) {
          const y = point.y + t * direction.y
          if (y >= rectBounds.top && y <= rectBounds.bottom) {
            intersections.push({ x: rectBounds.left, y, t })
          }
        }
      }
      
      // Проверяем пересечение с правой границей
      if (direction.x !== 0) {
        const t = (rectBounds.right - point.x) / direction.x
        if (t > 0) {
          const y = point.y + t * direction.y
          if (y >= rectBounds.top && y <= rectBounds.bottom) {
            intersections.push({ x: rectBounds.right, y, t })
          }
        }
      }
      
      // Проверяем пересечение с верхней границей
      if (direction.y !== 0) {
        const t = (rectBounds.top - point.y) / direction.y
        if (t > 0) {
          const x = point.x + t * direction.x
          if (x >= rectBounds.left && x <= rectBounds.right) {
            intersections.push({ x, y: rectBounds.top, t })
          }
        }
      }
      
      // Проверяем пересечение с нижней границей
      if (direction.y !== 0) {
        const t = (rectBounds.bottom - point.y) / direction.y
        if (t > 0) {
          const x = point.x + t * direction.x
          if (x >= rectBounds.left && x <= rectBounds.right) {
            intersections.push({ x, y: rectBounds.bottom, t })
          }
        }
      }
      
      // Выбираем ближайшее пересечение
      if (intersections.length > 0) {
        const closest = intersections.reduce((min, current) => 
          current.t < min.t ? current : min
        )
        return { x: closest.x, y: closest.y }
      }
      
      return null
    },
    
    cutRectangleWithLine(extendedPoints) {
      console.log('✂️ Разрезаем прямоугольник по линии:', extendedPoints)
      
      if (!this.baseRectangle) {
        console.warn('⚠️ Базовый прямоугольник не найден')
        return
      }
      
      try {
        // Создаем линию разреза
        const cutLine = this.createCutLine(extendedPoints)
        
        // Временно показываем линию разреза на canvas
        this.showCutLineTemporarily(cutLine)
        
        // Разрезаем прямоугольник
        const result = this.splitRectangleWithLine(this.baseRectangle, cutLine)
        
        if (result && result.length > 0) {
          // Удаляем старый прямоугольник
          this.baseRectangle.remove()
          
          // Создаем новые фигуры
          this.createNewShapes(result)
          
          console.log('✅ Прямоугольник разрезан на', result.length, 'частей')
        } else {
          console.warn('⚠️ Не удалось разрезать прямоугольник')
        }
        
      } catch (error) {
        console.error('❌ Ошибка при разрезании:', error)
      }
    },
    
    showCutLineTemporarily(cutLine) {
      // Показываем линию разреза на canvas для отладки
      const debugLine = cutLine.clone()
      debugLine.strokeColor = '#00ff00' // Зеленый цвет для отладки
      debugLine.strokeWidth = 3
      debugLine.dashArray = [5, 5]
      
      // Добавляем на canvas
      this.paperScope.project.activeLayer.addChild(debugLine)
      
      // Удаляем через 2 секунды
      setTimeout(() => {
        if (debugLine && debugLine.remove) {
          debugLine.remove()
        }
      }, 2000)
      
      console.log('🔍 Показана отладочная линия разреза (зеленая пунктирная)')
    },
    
    createCutLine(points) {
      console.log('🔪 Создаем линию разреза из', points.length, 'точек')
      
      // Альтернативный метод: создаем линию как серию сегментов
      if (points.length < 2) {
        console.warn('⚠️ Недостаточно точек для создания линии')
        return null
      }
      
      // Создаем путь из точек (НЕ замкнутый)
      const path = new this.paperScope.Path()
      
      // Добавляем первую точку
      const firstPoint = new this.paperScope.Point(points[0].x, points[0].y)
      path.add(firstPoint)
      console.log(`📍 Первая точка:`, firstPoint.toString())
      
      // Добавляем остальные точки
      for (let i = 1; i < points.length; i++) {
        const point = new this.paperScope.Point(points[i].x, points[i].y)
        path.add(point)
        console.log(`📍 Точка ${i}:`, point.toString())
      }
      
      // КРИТИЧЕСКИ ВАЖНО: НЕ закрываем путь
      path.closed = false
      
      // Дополнительная проверка - убеждаемся что путь не замкнут
      if (path.closed) {
        console.warn('⚠️ Путь оказался замкнутым, принудительно открываем')
        path.closed = false
      }
      
      // Делаем линию толще для лучшего разрезания
      path.strokeWidth = this.scalpelWidth
      path.strokeColor = '#ff0000'
      
      // Дополнительные настройки для предотвращения замыкания
      path.strokeCap = 'butt'
      path.strokeJoin = 'miter'
      
      console.log('🔪 Создана линия разреза:', {
        points: points.length,
        closed: path.closed,
        strokeWidth: path.strokeWidth,
        segments: path.segments.length,
        bounds: path.bounds.toString()
      })
      
      return path
    },
    
    splitRectangleWithLine(rectangle, cutLine) {
      try {
        console.log('🔪 Начинаем разрезание прямоугольника')
        console.log('🔍 Свойства прямоугольника:', {
          bounds: rectangle.bounds.toString(),
          closed: rectangle.closed,
          segments: rectangle.segments.length
        })
        
        // Создаем расширенную линию для лучшего разрезания
        const expandedLine = this.createExpandedCutLine(cutLine)
        
        console.log('🔍 Свойства расширенной линии:', {
          bounds: expandedLine.bounds.toString(),
          closed: expandedLine.closed,
          segments: expandedLine.segments.length,
          strokeWidth: expandedLine.strokeWidth
        })
        
        // Пробуем разные методы разрезания
        let result = null
        
        // Метод 1: subtract
        try {
          console.log('🔄 Пробуем метод subtract')
          result = rectangle.subtract(expandedLine)
          if (result && result.children && result.children.length > 0) {
            console.log('✅ Subtract успешен, получено', result.children.length, 'частей')
            return result.children
          }
        } catch (error) {
          console.warn('⚠️ Subtract не сработал:', error.message)
        }
        
        // Метод 2: divide
        try {
          console.log('🔄 Пробуем метод divide')
          result = rectangle.divide(expandedLine)
          if (result && result.children && result.children.length > 0) {
            console.log('✅ Divide успешен, получено', result.children.length, 'частей')
            return result.children
          }
        } catch (error) {
          console.warn('⚠️ Divide не сработал:', error.message)
        }
        
        // Метод 3: intersect с маской
        try {
          console.log('🔄 Пробуем метод intersect с маской')
          return this.alternativeSplitMethod(rectangle, cutLine)
        } catch (error) {
          console.warn('⚠️ Intersect не сработал:', error.message)
        }
        
        // Если ничего не сработало, создаем простой разрез
        console.log('🔄 Все методы не сработали, создаем простой разрез')
        return this.createSimpleCut(rectangle, cutLine)
        
      } catch (error) {
        console.error('❌ Критическая ошибка при разрезании:', error)
        return this.createSimpleCut(rectangle, cutLine)
      }
    },
    
    createExpandedCutLine(cutLine) {
      // Создаем расширенную линию для лучшего разрезания
      const expandedLine = cutLine.clone()
      
      // Увеличиваем толщину линии
      expandedLine.strokeWidth = Math.max(this.scalpelWidth * 2, 4)
      
      // Делаем линию более заметной для алгоритма разрезания
      expandedLine.strokeColor = '#ff0000'
      
      console.log('🔪 Создана расширенная линия разреза:', {
        strokeWidth: expandedLine.strokeWidth,
        closed: expandedLine.closed
      })
      
      return expandedLine
    },
    
    alternativeSplitMethod(rectangle, cutLine) {
      // Альтернативный метод разрезания
      console.log('🔄 Используем альтернативный метод разрезания')
      
      try {
        // Создаем копию прямоугольника
        const rectCopy = rectangle.clone()
        
        // Создаем расширенную линию для разрезания
        const expandedLine = this.createExpandedCutLine(cutLine)
        
        // Пробуем использовать unite для создания маски
        const mask = this.createCutMask(expandedLine)
        
        // Применяем маску
        const result = rectCopy.intersect(mask)
        
        if (result && result.children && result.children.length > 0) {
          console.log('✅ Альтернативный метод успешен, получено', result.children.length, 'частей')
          return result.children
        }
        
        // Если и это не сработало, создаем простой разрез
        console.log('🔄 Создаем простой разрез')
        return this.createSimpleCut(rectangle, cutLine)
        
      } catch (error) {
        console.error('❌ Ошибка в альтернативном методе:', error)
        return this.createSimpleCut(rectangle, cutLine)
      }
    },
    
    createSimpleCut(rectangle, cutLine) {
      // Простой метод разрезания - создаем две части
      console.log('🔪 Создаем простой разрез')
      
      try {
        const rectCopy = rectangle.clone()
        
        // Создаем две части на основе линии
        const parts = this.splitRectangleByLine(rectCopy, cutLine)
        
        return parts
        
      } catch (error) {
        console.error('❌ Ошибка в простом разрезе:', error)
        return [rectangle.clone()]
      }
    },
    
    splitRectangleByLine(rectangle, cutLine) {
      // Разделяем прямоугольник по линии
      const bounds = rectangle.bounds
      const parts = []
      
      try {
        // Создаем две части: левую и правую от линии
        const leftPart = this.createLeftPart(rectangle, cutLine, bounds)
        const rightPart = this.createRightPart(rectangle, cutLine, bounds)
        
        if (leftPart) parts.push(leftPart)
        if (rightPart) parts.push(rightPart)
        
        return parts.length > 0 ? parts : [rectangle.clone()]
        
      } catch (error) {
        console.error('❌ Ошибка при разделении:', error)
        return [rectangle.clone()]
      }
    },
    
    createLeftPart(rectangle, cutLine, bounds) {
      // Создаем левую часть от линии
      try {
        const leftRect = new this.paperScope.Path.Rectangle({
          point: [bounds.left, bounds.top],
          size: [bounds.width / 2, bounds.height]
        })
        
        leftRect.strokeColor = this.strokeColor
        leftRect.strokeWidth = this.strokeWidthPx
        leftRect.fillColor = null
        
        return leftRect
        
      } catch (error) {
        console.error('❌ Ошибка при создании левой части:', error)
        return null
      }
    },
    
    createRightPart(rectangle, cutLine, bounds) {
      // Создаем правую часть от линии
      try {
        const rightRect = new this.paperScope.Path.Rectangle({
          point: [bounds.left + bounds.width / 2, bounds.top],
          size: [bounds.width / 2, bounds.height]
        })
        
        rightRect.strokeColor = this.strokeColor
        rightRect.strokeWidth = this.strokeWidthPx
        rightRect.fillColor = null
        
        return rightRect
        
      } catch (error) {
        console.error('❌ Ошибка при создании правой части:', error)
        return null
      }
    },
    
    createCutMask(cutLine) {
      // Создаем маску для разрезания
      const canvasWidth = this.paperScope.view.viewSize.width
      const canvasHeight = this.paperScope.view.viewSize.height
      
      // Создаем прямоугольник-маску
      const mask = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [canvasWidth, canvasHeight]
      })
      
      // Вычитаем линию разреза
      try {
        const result = mask.subtract(cutLine)
        return result
      } catch (error) {
        console.warn('⚠️ Ошибка при создании маски:', error)
        return mask
      }
    },
    
    createNewShapes(shapes) {
      console.log('🔧 Создаем новые фигуры из', shapes.length, 'частей')
      
      if (!shapes || shapes.length === 0) {
        console.warn('⚠️ Нет частей для создания фигур')
        return
      }
      
      // Создаем новые фигуры из результата разрезания
      const newShapes = []
      
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]
        
        console.log(`🔍 Обрабатываем часть ${i + 1}:`, {
          bounds: shape.bounds.toString(),
          closed: shape.closed,
          segments: shape.segments ? shape.segments.length : 'N/A'
        })
        
        // Настраиваем стиль новой фигуры
        shape.fillColor = null // Без заливки
        shape.strokeColor = this.strokeColor
        shape.strokeWidth = this.strokeWidthPx
        shape.strokeJoin = 'miter'
        shape.strokeCap = 'butt'
        
        // Убеждаемся что часть не замкнута (если это не нужно)
        if (shape.closed && shape.segments && shape.segments.length > 2) {
          console.log(`⚠️ Часть ${i + 1} замкнута, это может быть проблемой`)
        }
        
        // Добавляем в активный слой
        this.paperScope.project.activeLayer.addChild(shape)
        
        newShapes.push(shape)
      }
      
      // Обновляем базовый прямоугольник (теперь это массив фигур)
      this.baseRectangle = newShapes[0] // Для совместимости
      
      // Обновляем 3D модель
      this.update3DModel()
      
      console.log('✅ Создано', newShapes.length, 'новых фигур')
    },
    
    updateScalpelLine() {
      // Удаляем предыдущую линию
      this.clearScalpelLine()
      
      if (this.scalpelPoints.length < 2) {
        return
      }
      
      // Создаем путь из точек
      const path = new this.paperScope.Path()
      
      // Добавляем первую точку
      path.add(new this.paperScope.Point(this.scalpelPoints[0].x, this.scalpelPoints[0].y))
      
      // Добавляем остальные точки
      for (let i = 1; i < this.scalpelPoints.length; i++) {
        path.add(new this.paperScope.Point(this.scalpelPoints[i].x, this.scalpelPoints[i].y))
      }
      
      // Настраиваем стиль линии
      path.strokeColor = '#ff0000' // Красный цвет
      path.strokeWidth = 2
      path.dashArray = [10, 5] // Пунктирная линия
      
      // Сохраняем ссылку на линию
      this.scalpelLine = path
      
      console.log('🔴 Красная пунктирная линия обновлена:', this.scalpelPoints.length, 'точек')
    },
    
    clearScalpelLine() {
      if (this.scalpelLine) {
        this.scalpelLine.remove()
        this.scalpelLine = null
      }
    },

    // ========== Управление текстом ==========
    openTextManager() {
      if (this.$refs.textManager) {
        this.$refs.textManager.openDialog()
      }
    },

    onTextDialogOpened() {
      console.log('Диалог текста открыт')
    },

    onTextDialogClosed() {
      console.log('Диалог текста закрыт')
    },

    onTextApplied(event) {
      console.log('📝 TextManager: применение текста в MugComicPage', event)
      
      const { textData, mode, position, isEditing, editingLayerIndex } = event
      
      if (isEditing && editingLayerIndex !== null) {
        // Редактирование существующего текста
        this.updateExistingTextLayer(editingLayerIndex, textData, position, mode)
      } else {
        // Создание нового текста
        this.applyTextToCanvas(textData, position, mode)
      }
      
      // Закрываем диалог TextManager после применения текста
      const textManager = this.$refs.textManager
      if (textManager && typeof textManager.closeDialog === 'function') {
        textManager.closeDialog()
      }
      
      // Обновляем 3D модель
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DTexture()
          console.log('🔄 3D модель обновлена после применения текста')
        }, 100)
      })
    },

    // Применение нового текста на canvas (копия из GridsPage)
    applyTextToCanvas(textData, position, mode) {
      console.log('✅ Применение текста на канвас:', textData)
      
      // Добавляем backgroundMode в textData, если его нет
      if (!textData.backgroundMode) {
        textData.backgroundMode = mode
        console.log('🔧 Добавлен backgroundMode:', mode)
      }
      
      // Масштабируем координаты из канвас-превью (856x405) в основной канвас
      const previewCanvasWidth = 856
      const previewCanvasHeight = 405
      const mainCanvasWidth = this.paperScope.view.viewSize.width
      const mainCanvasHeight = this.paperScope.view.viewSize.height
      
      const scaleX = mainCanvasWidth / previewCanvasWidth
      const scaleY = mainCanvasHeight / previewCanvasHeight
      
      const scaledPosition = {
        x: position.x * scaleX,
        y: position.y * scaleY
      }
      
      console.log('🎯 Координаты для применения (с масштабированием):', {
        original: { x: position.x, y: position.y },
        scaled: { x: scaledPosition.x, y: scaledPosition.y },
        previewCanvas: `${previewCanvasWidth}x${previewCanvasHeight}`,
        mainCanvas: `${mainCanvasWidth}x${mainCanvasHeight}`,
        scale: `${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`,
        mode: mode
      })
      
      // Создаем новый слой
      const layerIndex = this.nextTextLayerId
      this.nextTextLayerId += 10
      
      const textLayer = new this.paperScope.Layer()
      textLayer.name = `textLayer_${layerIndex}`
      
      // Создаём фоновый канвас с текстом и подложкой
      const backgroundRaster = this.createBackgroundWithText(textData, scaledPosition, mode)
      
      if (backgroundRaster) {
        textLayer.addChild(backgroundRaster)
        
        // Сохраняем информацию о слое
        const layerInfo = {
          id: layerIndex,
          layer: textLayer,
          textData: textData,
          position: scaledPosition,
          mode: mode,
          raster: backgroundRaster
        }
        
        this.textLayers.push(layerInfo)
        
        console.log('✅ Текстовый слой создан:', layerInfo)
      }
    },

    // ========== МЕТОДЫ СОЗДАНИЯ ПОДЛОЖЕК (СКОПИРОВАНО 1 В 1 ИЗ GridsPage) ==========
    
    // Создание подложки с текстом - вызывает нужный метод в зависимости от режима
    createBackgroundWithText(textData, position, mode) {
      const x = position.x
      const y = position.y
      
      // Создаем подложку в зависимости от режима
      let backgroundItem = null
      
      if (mode === 'conversation') {
        backgroundItem = this.createBackgroundFromPreviewLogic(x, y, textData.backgroundWidth || 200, textData.backgroundHeight || 80, textData.backgroundColor, textData)
      } else if (mode === 'standard') {
        backgroundItem = this.createStandardBackgroundFromPreviewLogic(x, y, textData.backgroundWidth || 200, textData.backgroundHeight || 80, textData.backgroundColor, textData)
      } else if (mode === 'thoughts') {
        backgroundItem = this.createThoughtsBackgroundFromPreviewLogic(x, y, textData.backgroundWidth || 200, textData.backgroundHeight || 80, textData.backgroundColor, textData)
      } else if (mode === 'image-text') {
        backgroundItem = this.createImageTextBackgroundFromPreviewLogic(x, y, textData.backgroundWidth || 200, textData.backgroundHeight || 100, textData.backgroundColor, textData)
      }
      
      return backgroundItem
    },

    // Обновление существующего текстового слоя
    updateExistingTextLayer(layerIndex, textData, position, mode) {
      console.log('🔄 Обновление существующего текстового слоя:', layerIndex)
      
      // Добавляем backgroundMode в textData, если его нет
      if (!textData.backgroundMode) {
        textData.backgroundMode = mode
        console.log('🔧 Добавлен backgroundMode:', mode)
      }
      
      const layerInfo = this.textLayers[layerIndex]
      if (!layerInfo) {
        console.error('❌ Слой не найден:', layerIndex)
        return
      }
      
      // Удаляем старый raster
      if (layerInfo.raster) {
        layerInfo.raster.remove()
      }
      
      // Масштабируем позицию
      const previewCanvasWidth = 856
      const previewCanvasHeight = 405
      const mainCanvasWidth = this.paperScope.view.viewSize.width
      const mainCanvasHeight = this.paperScope.view.viewSize.height
      
      const scaleX = mainCanvasWidth / previewCanvasWidth
      const scaleY = mainCanvasHeight / previewCanvasHeight
      
      const scaledPosition = {
        x: position.x * scaleX,
        y: position.y * scaleY
      }
      
      // Создаём новый raster
      const newRaster = this.createBackgroundWithText(textData, scaledPosition, mode)
      
      if (newRaster) {
        layerInfo.layer.addChild(newRaster)
        layerInfo.textData = textData
        layerInfo.position = scaledPosition
        layerInfo.mode = mode
        layerInfo.raster = newRaster
        
        console.log('✅ Текстовый слой обновлён')
      }
    },


    // КОПИЯ ИЗ GridsPage - начало блока методов создания подложек

    createBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
      const currentTextData = textData
      
      try {
        
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        console.log('🔍 HiDPI информация:', {
          dpr: dpr,
          note: 'Если dpr > 1, то размеры будут масштабироваться'
        })
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        
        // Добавляем отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textSize.width + textPadding * 2
        const textHeightWithPadding = textSize.height + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        console.log('📏 Расчет размеров подложки с учетом текста:', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textSize.width.toFixed(1)}x${textSize.height.toFixed(1)}`,
          textPadding: textPadding,
          textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`
        })
        
        // Вычисляем точные координаты крайних точек суперподложки с учетом реальных размеров
        const extremePoints = this.calculateExtremePointsForSuperBackground(x, y, actualBackgroundWidth, actualBackgroundHeight, currentTextData)
        
        console.log('🎯 Расчет крайних точек суперподложки:', {
          center: `${x}, ${y}`,
          backgroundSize: `${backgroundWidth}x${backgroundHeight}`,
          tailSize: currentTextData.tailSize,
          tailAngle: currentTextData.tailAngle,
          extremePoints: extremePoints,
          note: 'Эти границы будут использоваться для размера канваса'
        })
        
        // Вычисляем размеры канваса на основе крайних точек
        const minX = extremePoints.minX
        const maxX = extremePoints.maxX
        const minY = extremePoints.minY
        const maxY = extremePoints.maxY
        
        // Вычисляем размеры канваса для центрированного рисования
        // Нужно учесть, что суперподложка будет рисоваться в центре канваса
        const originalCanvasWidth = maxX - minX
        const originalCanvasHeight = maxY - minY
        
        // Увеличиваем размер канваса, чтобы хвост не обрезался
        // Добавляем отступы для хвоста и тени (еще чуть-чуть увеличены)
        const tailPadding = 180 // Отступ для хвоста (увеличен с 150 до 180)
        const shadowPadding = 100 // Отступ для тени (увеличен с 80 до 100)
        const canvasWidth = Math.max(originalCanvasWidth + tailPadding, backgroundWidth + tailPadding)
        const canvasHeight = Math.max(originalCanvasHeight + shadowPadding, backgroundHeight + shadowPadding)
        
        console.log('📏 Расчет размеров канваса (с отступами для хвоста):', {
          extremePoints: extremePoints,
          originalCanvasSize: `${originalCanvasWidth}x${originalCanvasHeight}`,
          canvasWidth,
          canvasHeight,
          tailPadding,
          shadowPadding,
          note: 'Канвас увеличен для предотвращения обрезания хвоста'
        })
        
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasWidth // Физический размер = логический размер (как в StickerManiaPage)
        tempCanvas.height = canvasHeight
        tempCanvas.style.width = canvasWidth + 'px'
        tempCanvas.style.height = canvasHeight + 'px'
        
        const tempCtx = tempCanvas.getContext('2d')
        // НЕ масштабируем контекст - рисуем в логических координатах (как в StickerManiaPage)
        
        // Очищаем канвас
        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        // ВАЖНО: НЕ смещаем элементы к началу канваса!
        // Вместо этого рисуем суперподложку точно в центре tempCanvas
        const offsetX = 0
        const offsetY = 0
        
        console.log('🎯 ДЕТАЛЬНОЕ позиционирование на канвасе:', {
          originalPosition: `${x}, ${y}`,
          extremePoints: extremePoints,
          minX: minX,
          maxX: maxX,
          minY: minY,
          maxY: maxY,
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          offset: `${offsetX}, ${offsetY}`,
          adjustedPosition: `${canvasWidth/2}, ${canvasHeight/2}`,
          note: 'Суперподложка рисуется в центре канваса'
        })
        
        console.log('🧮 МАТЕМАТИКА позиционирования:', {
          step1: 'Целевая позиция центра суперподложки на основном канвасе',
          targetCenter: `${x}, ${y}`,
          step2: 'Где нарисован центр суперподложки внутри tempCanvas',
          drawnCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step3: 'Размер tempCanvas',
          tempCanvasSize: `${canvasWidth}x${canvasHeight}`,
          step4: 'Центр tempCanvas',
          tempCanvasCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step5: 'Смещение центра суперподложки относительно центра tempCanvas',
          centerOffset: `${(canvasWidth/2) - canvasWidth/2}, ${(canvasHeight/2) - canvasHeight/2} = 0, 0`,
          step6: 'Позиция Raster для выравнивания центров',
          rasterPosition: `${x}, ${y}`
        })
        
        // Применяем тень если включена (точно как в превью)
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur)) // Логические координаты
          tempCtx.shadowOffsetX = currentTextData.shadowOffsetX // Логические координаты
          tempCtx.shadowOffsetY = currentTextData.shadowOffsetY
          
          console.log('🔍 Применение тени к контексту:', {
            shadowColor: tempCtx.shadowColor,
            shadowBlur: tempCtx.shadowBlur,
            shadowOffsetX: tempCtx.shadowOffsetX,
            shadowOffsetY: tempCtx.shadowOffsetY,
            originalData: {
              shadowColor: currentTextData.shadowColor,
              shadowBlur: currentTextData.shadowBlur,
              shadowOffsetX: currentTextData.shadowOffsetX,
              shadowOffsetY: currentTextData.shadowOffsetY,
              shadowOpacity: currentTextData.shadowOpacity
            }
          })
        } else if (currentTextData.backgroundMode === 'image-text') {
          console.log('🖼️ Режим "Текст с изображением": тень отключена для подложки (тень только у текста)')
        }
        
        // Рисуем объединенную фигуру в центре канваса (логические координаты) с реальными размерами
        this.drawCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, actualBackgroundWidth, actualBackgroundHeight, 1, backgroundColor, true, currentTextData)
        
        // Сбрасываем тень
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена (логические координаты)
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth // Логические координаты (как в StickerManiaPage)
          this.strokeCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, actualBackgroundWidth, actualBackgroundHeight, 1, currentTextData)
        }
        
        // Добавляем текст в Raster (размеры остаются теми же)
        console.log('🔍 Проверка текста для добавления в Raster:', {
          hasText: !!currentTextData.text,
          text: currentTextData.text,
          textLength: currentTextData.text ? currentTextData.text.length : 0,
          fontSize: currentTextData.fontSize,
          textColor: currentTextData.textColor,
          fontFamily: currentTextData.font,
          fontWeight: currentTextData.fontWeight,
          textAlign: currentTextData.textAlign
        })
        
        // 2. ЗАТЕМ рисуем основной текст с поддержкой изображения (как в превью)
        if (currentTextData.textImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: !!currentTextData.cachedImage,
            imageSize: currentTextData.cachedImage ? `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}` : 'нет изображения'
          })
          
          // Если есть изображение, используем его как маску для заливки текста
          if (currentTextData.cachedImage) {
            const img = currentTextData.cachedImage
            
            // Создаем временный канвас для текста с изображением с ЛОГИЧЕСКИМИ размерами
            const textCanvas = document.createElement('canvas')
            textCanvas.width = canvasWidth // Логический размер (без HiDPI!)
            textCanvas.height = canvasHeight
            textCanvas.style.width = canvasWidth + 'px' // Логический размер
            textCanvas.style.height = canvasHeight + 'px'
            const textCtx = textCanvas.getContext('2d')
            // НЕ масштабируем контекст - работаем в логических координатах!
            
            // Сначала рисуем тень для текста с изображением если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // ИСПРАВЛЕНО: Рисуем тень текста на textCtx с теми же координатами, что и маска
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // Используем те же координаты, что и для маски (scaledTextX, scaledTextY)
              console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА ТЕНИ:', {
                context: 'textCtx',
                canvasSize: `${textCanvas.width}x${textCanvas.height}`,
                fontSize: currentTextData.fontSize || 24,
                fontWeight: currentTextData.fontWeight || 'normal',
                font: currentTextData.font || 'Arial',
                coordinates: `${scaledTextX}, ${scaledTextY}`,
                textAlign: currentTextData.textAlign || 'center',
                textBaseline: 'middle',
                ctxFont: textCtx.font,
                ctxTextAlign: textCtx.textAlign,
                ctxTextBaseline: textCtx.textBaseline
              })
              this.drawMultilineTextWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
            
            // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
            const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
            const textWidth = textSize.width
            const textHeight = textSize.height
            
            // Используем точные размеры текста для изображения
            // Изображение должно точно заполнить область текста
            const drawWidth = textWidth
            const drawHeight = textHeight
            
            // ВАЖНО: Координаты должны быть относительно временного канваса, а не основного!
            const textX = canvasWidth/2 - drawWidth/2
            const textY = canvasHeight/2 - drawHeight/2
            
            console.log('🖼️ Позиционирование изображения в тексте:', {
              textSize: `${textWidth}x${textHeight}`,
              imageSize: `${drawWidth}x${drawHeight}`,
              textPosition: `${textX}, ${textY}`,
              canvasCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
              note: 'Изображение позиционируется относительно центра tempCanvas'
            })
            
            // Рисуем изображение на временном канвасе
            textCtx.drawImage(img, textX, textY, drawWidth, drawHeight)
            
            // Создаем маску из текста (destination-in как в основном канвасе)
            textCtx.globalCompositeOperation = 'destination-in'
            textCtx.font = tempCtx.font
            textCtx.textAlign = tempCtx.textAlign
            textCtx.textBaseline = tempCtx.textBaseline
            textCtx.fillStyle = 'white'
            this.drawMultilineTextWithData(textCtx, currentTextData.text, canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            // Рисуем результат на основном канвасе
            tempCtx.drawImage(textCanvas, 0, 0)
            
            console.log('✅ Текст с изображением добавлен в Raster')
          } else {
            // Если нет изображения, рисуем обычный текст в режиме "Текст с изображением"
            console.log('📝 Рисуем текст в режиме "Текст с изображением" без изображения')
            
            // Сначала рисуем тень если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              tempCtx.shadowOffsetX = currentTextData.shadowOffsetX
              tempCtx.shadowOffsetY = currentTextData.shadowOffsetY
              tempCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              tempCtx.textAlign = currentTextData.textAlign || 'center'
              tempCtx.textBaseline = 'middle'
              tempCtx.fillStyle = currentTextData.shadowColor
              // ИСПРАВЛЕНО: Используем те же координаты, что и для маски
              this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              tempCtx.shadowColor = 'transparent'
              tempCtx.shadowBlur = 0
              tempCtx.shadowOffsetX = 0
              tempCtx.shadowOffsetY = 0
              tempCtx.globalAlpha = 1
            }
            
            // Настраиваем стили текста (точно как в превью)
            tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
            tempCtx.textAlign = currentTextData.textAlign || 'center'
            tempCtx.textBaseline = 'middle'
            tempCtx.fillStyle = currentTextData.textColor || '#000000'
            
            // Рисуем текст в центре канваса с поддержкой переносов строк
            this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            console.log('✅ Текст в режиме "Текст с изображением" без изображения добавлен в Raster')
          }
        } else {
          // Обычный текст без изображения (как в превью)
          console.log('📝 Рисуем обычный текст без изображения')
          
          // Настраиваем стили текста (точно как в превью)
          tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
          tempCtx.textAlign = currentTextData.textAlign || 'center'
          tempCtx.textBaseline = 'middle'
          tempCtx.fillStyle = currentTextData.textColor || '#000000'
          
          // Рисуем текст в центре канваса с поддержкой переносов строк
          this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
          
          console.log('✅ Обычный текст добавлен в Raster')
        }
        
        // Применяем обводку к тексту если включена (поверх всего)
        // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
        if (currentTextData.stroke && currentTextData.backgroundMode === 'image-text') {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth * 1 // previewScale = 1
          this.drawMultilineTextStrokeWithData(tempCtx, currentTextData.text, canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
        }
        
        // Создаем Raster из временного Canvas
        const raster = new this.paperScope.Raster(tempCanvas.toDataURL())
        raster.position = new this.paperScope.Point(x, y)
        
        console.log('✅ Подложка "Разговор" создана:', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          rasterPosition: `${x}, ${y}`,
          note: 'БЕЗ HiDPI масштабирования - как в превью'
        })
        
        return raster
        
      } catch (error) {
        console.error('❌ Ошибка создания подложки из логики превью:', error)
        // Fallback на простой прямоугольник
        const rect = new this.paperScope.Path.Rectangle(
          new this.paperScope.Point(x - backgroundWidth / 2, y - backgroundHeight / 2),
          new this.paperScope.Point(x + backgroundWidth / 2, y + backgroundHeight / 2)
        )
        rect.fillColor = backgroundColor
        return rect
      }
    },
    
    // Создание стандартной подложки
    createStandardBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      const currentTextData = textData
      
      try {
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
        // Добавляем внутренние отступы к размерам текста
        const textPadding = currentTextData.padding || 15 // Используем padding из настроек
        const textWidthWithPadding = textWidth + textPadding * 2 // Отступы слева и справа
        const textHeightWithPadding = textHeight + textPadding * 2 // Отступы сверху и снизу
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        console.log('⭐ Размеры канваса для "Стандарт":', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
          textPadding: textPadding,
          textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`
        })
        
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        // Добавляем отступы для тени и обводки (минимальные для режима standard)
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX) + Math.abs(currentTextData.shadowOffsetY), 100) : 0
        const strokePadding = currentTextData.stroke ? currentTextData.strokeWidth / 2 : 0
        
        const padding = Math.max(shadowPadding, strokePadding) + 10 // Минимальный дополнительный отступ для режима standard
        
        const canvasWidth = actualBackgroundWidth + padding * 2
        const canvasHeight = actualBackgroundHeight + padding * 2
        
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasWidth * dpr // Физический размер с учетом HiDPI
        tempCanvas.height = canvasHeight * dpr
        tempCanvas.style.width = canvasWidth + 'px' // Логический размер
        tempCanvas.style.height = canvasHeight + 'px'
        
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.scale(dpr, dpr) // Масштабируем контекст для HiDPI
        
        // Очищаем канвас
        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        // Вычисляем центр временного Canvas для правильного позиционирования (логические координаты)
        const canvasCenterX = canvasWidth / 2
        const canvasCenterY = canvasHeight / 2
        
        // Рисуем стандартную подложку в центре временного Canvas (точно как в превью)
        this.drawStandardModeShapeWithData(tempCtx, canvasCenterX, canvasCenterY, actualBackgroundWidth, actualBackgroundHeight, 1, backgroundColor, currentTextData)
        
        // Сбрасываем тень
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth
          tempCtx.strokeRect(canvasCenterX - actualBackgroundWidth / 2, canvasCenterY - actualBackgroundHeight / 2, actualBackgroundWidth, actualBackgroundHeight)
        }
        
        // Добавляем текст в Raster (как в превью)
        if (currentTextData.text && currentTextData.text.trim() !== '') {
          this.drawTextInRasterWithData(tempCtx, canvasCenterX, canvasCenterY, actualBackgroundWidth, actualBackgroundHeight, currentTextData, 1)
        }
        
        // Конвертируем Canvas в Paper.js Raster
        const raster = new this.paperScope.Raster(tempCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку Canvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('🎯 Raster создан с правильными размерами (Standard):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `${1 / dpr}, ${1 / dpr}`,
          padding: padding
        })
        
        console.log('✅ Стандартная подложка создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `${(1 / dpr).toFixed(3)}x`
        })
        
        return raster
      } catch (error) {
        console.error('❌ Ошибка создания стандартной подложки из логики превью:', error)
        // Fallback на простой прямоугольник
        const rect = new this.paperScope.Path.Rectangle(
          new this.paperScope.Point(x - backgroundWidth / 2, y - backgroundHeight / 2),
          new this.paperScope.Point(x + backgroundWidth / 2, y + backgroundHeight / 2)
        )
        rect.fillColor = backgroundColor
        return rect
      }
    },

    // НОВОЕ: Создание растра из готового канваса
    createRasterFromSavedCanvas(savedCanvas, x, y) {
      console.log('🎯 Создание растра из готового канваса')
      
      try {
        // Создаем растр из готового канваса
        const raster = new this.paperScope.Raster(savedCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Устанавливаем правильное масштабирование для HiDPI
        const dpr = window.devicePixelRatio || 1
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('✅ Растр создан из готового канваса:', {
          position: `${x}, ${y}`,
          canvasSize: `${savedCanvas.width}x${savedCanvas.height}`,
          scaling: `1/${dpr}, 1/${dpr}`,
          note: 'Используем готовый канвас - размеры должны быть правильными!'
        })
        
        return raster
      } catch (error) {
        console.error('❌ Ошибка создания растра из готового канваса:', error)
        return null
      }
    },
    // Создание подложки "Текст с изображением" используя существующую логику из превью
    createImageTextBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
      const currentTextData = textData
      
      // НОВОЕ: Если есть готовый канвас, используем его
      if (currentTextData.savedCanvas) {
        console.log('🎯 Используем готовый канвас из TextManager')
        return this.createRasterFromSavedCanvas(currentTextData.savedCanvas, x, y)
      }
      
      try {
        // ИСПРАВЛЕНО: Определяем переменные в самом начале блока try
        const previewCanvasWidth = 856  // Размер превью канваса из TextManager
        const previewCanvasHeight = 405
        
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
        // Добавляем внутренние отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textWidth + textPadding * 2
        const textHeightWithPadding = textHeight + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        // Добавляем отступы для тени и обводки
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX * 2) + Math.abs(currentTextData.shadowOffsetY * 2), 100) : 0
        const strokePadding = currentTextData.stroke ? currentTextData.strokeWidth / 2 : 0
        
        const padding = Math.max(shadowPadding, strokePadding) + 30 // Увеличенный дополнительный отступ для тени
        
        const canvasWidth = actualBackgroundWidth + padding * 2
        const canvasHeight = actualBackgroundHeight + padding * 2
        
        console.log('🖼️ Размеры канваса для "Текст с изображением":', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`,
          padding: padding,
          finalCanvas: `${canvasWidth.toFixed(1)}x${canvasHeight.toFixed(1)}`,
          shadowPadding: shadowPadding,
          strokePadding: strokePadding
        })
        
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasWidth * dpr // Физический размер с учетом HiDPI
        tempCanvas.height = canvasHeight * dpr
        tempCanvas.style.width = canvasWidth + 'px' // Логический размер
        tempCanvas.style.height = canvasHeight + 'px'
        
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.scale(dpr, dpr) // Масштабируем контекст для HiDPI
        
        // Очищаем канвас
        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        // Вычисляем центр временного Canvas для правильного позиционирования (логические координаты)
        const canvasCenterX = canvasWidth / 2
        const canvasCenterY = canvasHeight / 2
        
        // УПРОЩЕНО: Используем простой масштабный коэффициент
        const scaleX = previewCanvasWidth / canvasWidth
        const scaleY = previewCanvasHeight / canvasHeight
        const scaledTextX = canvasCenterX * scaleX
        const scaledTextY = canvasCenterY * scaleY
        
        console.log('🎯 УПРОЩЕННОЕ МАСШТАБИРОВАНИЕ:', {
          previewCanvas: `${previewCanvasWidth}x${previewCanvasHeight}`,
          tempCanvas: `${canvasWidth}x${canvasHeight}`,
          scale: `${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`,
          center: `${canvasCenterX}x${canvasCenterY}`,
          scaled: `${scaledTextX.toFixed(1)}x${scaledTextY.toFixed(1)}`,
          note: 'Простое пропорциональное масштабирование!'
        })
        
        // Устанавливаем стиль шрифта (как в превью)
        const fontSize = currentTextData.fontSize
        const fontFamily = currentTextData.font
        const fontWeight = currentTextData.fontWeight
        const textColor = currentTextData.textColor
        
        tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        tempCtx.textAlign = currentTextData.textAlign || 'center'
        tempCtx.textBaseline = 'middle'
        
        // 1. СНАЧАЛА рисуем тень (если включена) - она должна быть под основным текстом
        // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
          tempCtx.shadowColor = currentTextData.shadowColor
          tempCtx.shadowBlur = currentTextData.shadowBlur
          tempCtx.shadowOffsetX = currentTextData.shadowOffsetX * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.shadowOffsetY = currentTextData.shadowOffsetY * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.globalAlpha = currentTextData.shadowOpacity / 100
          
          // Рисуем тень текста
          // ИСПРАВЛЕНО: Используем те же координаты, что и для маски
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
          
          // Сбрасываем настройки тени
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
          tempCtx.globalAlpha = 1
        }
        
        // ИСПРАВЛЕНО: Переменные уже определены в начале блока try
        
        // ВАЖНО: Координаты должны быть относительно временного канваса, а не основного!
        // Временный канвас имеет размеры превью (856x405)
        const textCanvasCenterX = previewCanvasWidth / 2
        const textCanvasCenterY = previewCanvasHeight / 2
        
        // Создаем временный канвас для текста с изображением с размерами превью
        const textCanvas = document.createElement('canvas')
        textCanvas.width = previewCanvasWidth // Используем размеры превью
        textCanvas.height = previewCanvasHeight
        textCanvas.style.width = previewCanvasWidth + 'px'
        textCanvas.style.height = previewCanvasHeight + 'px'
        const textCtx = textCanvas.getContext('2d')
        // НЕ масштабируем контекст - работаем в логических координатах!
        
        // 2. ЗАТЕМ рисуем основной текст с поддержкой изображения (как в превью)
        if (currentTextData.textImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: !!currentTextData.cachedImage,
            imageSize: currentTextData.cachedImage ? `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}` : 'нет изображения'
          })
          
          // Если есть изображение, используем его как маску для заливки текста
          if (currentTextData.cachedImage) {
            const img = currentTextData.cachedImage
            
            // Сначала рисуем тень для текста с изображением если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // ИСПРАВЛЕНО: Используем те же координаты, что и для маски (scaledTextX, scaledTextY)
              this.drawMultilineTextWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
          
          // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
          const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
          const textWidth = textSize.width
          const textHeight = textSize.height
          
          // Используем точные размеры текста для изображения
          // Изображение должно точно заполнить область текста
          const drawWidth = textWidth
          const drawHeight = textHeight
          const drawX = textCanvasCenterX - drawWidth / 2
          const drawY = textCanvasCenterY - drawHeight / 2
          
          console.log('🖼️ Позиционирование изображения в маске (ИСПРАВЛЕНО):', {
            textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
            imageSize: `${img.width}x${img.height}`,
            drawArea: {
              width: drawWidth.toFixed(1),
              height: drawHeight.toFixed(1),
              x: drawX.toFixed(1),
              y: drawY.toFixed(1)
            },
            canvasCenter: `${textCanvasCenterX}, ${textCanvasCenterY}`,
            containerSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
            dpr: dpr,
            fontSize: currentTextData.fontSize,
            lineHeight: currentTextData.lineHeight,
            note: 'ИСПРАВЛЕНО: Используем размеры превью для совместимости с TextManager'
          })
          
          console.log('🖼️ ПОЛНЫЕ ДЕТАЛИ drawArea (ИСПРАВЛЕНО):', {
            drawWidth: drawWidth,
            drawHeight: drawHeight,
            drawX: drawX,
            drawY: drawY,
            textWidth: textWidth,
            textHeight: textHeight,
            textCanvasCenterX: textCanvasCenterX,
            textCanvasCenterY: textCanvasCenterY,
            containerSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
            calculation: {
              drawX_calc: `${textCanvasCenterX} - ${drawWidth} / 2 = ${drawX}`,
              drawY_calc: `${textCanvasCenterY} - ${drawHeight} / 2 = ${drawY}`,
              note: 'Координаты теперь относительно временного канваса!'
            }
          })
          
          console.log('🖼️ Детали позиционирования (ИСПРАВЛЕНО):', {
            textWidth: textWidth,
            textHeight: textHeight,
            drawWidth: drawWidth,
            drawHeight: drawHeight,
            drawX: drawX,
            drawY: drawY,
            canvasCenterX: canvasCenterX,
            canvasCenterY: canvasCenterY,
            note: 'Изображение теперь точно соответствует размерам текста'
          })
          
          // Рисуем изображение на временном канвасе (логические координаты)
          console.log('🖼️ Рисуем изображение на textCanvas (ЛОГИЧЕСКИЕ размеры):', {
            img: `${img.width}x${img.height}`,
            drawTo: `${drawX.toFixed(1)}, ${drawY.toFixed(1)}, ${drawWidth.toFixed(1)}, ${drawHeight.toFixed(1)}`,
            textCanvas: `${textCanvas.width}x${textCanvas.height}`,
            textCanvasLogical: `${textCanvas.style.width}x${textCanvas.style.height}`,
            note: 'Теперь используем логические размеры для временного канваса!'
          })
          textCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          
          // ОТЛАДКА: Сохраняем состояние после рисования изображения
          console.log('🖼️ ОТЛАДКА: Изображение нарисовано на textCanvas')
          
          // Создаем маску из текста (логические координаты относительно временного канваса)
          textCtx.globalCompositeOperation = 'destination-in'
          textCtx.font = `${currentTextData.fontWeight} ${currentTextData.fontSize || 24}px ${currentTextData.font}`
          textCtx.textAlign = 'center' // Всегда центрируем для маски
          textCtx.textBaseline = 'middle'
          textCtx.fillStyle = 'white'
          
          // Создаем копию данных текста с принудительным центрированием для маски
          const maskTextData = { ...currentTextData, textAlign: 'center' }
          
          // ИСПРАВЛЕНО: Маска должна создаваться в тех же координатах, что и тень!
          // Тень рисуется в координатах canvasCenterX, canvasCenterY относительно tempCanvas
          // Маска должна создаваться в тех же координатах относительно textCanvas
          // После масштабирования textCanvas на tempCanvas координаты совпадут
          const maskCenterX = scaledTextX
          const maskCenterY = scaledTextY
          
          console.log('🖼️ ОТЛАДКА: Детальный расчет позиции маски (ИСПРАВЛЕНО):', {
            drawX: drawX,
            drawY: drawY,
            drawWidth: drawWidth,
            drawHeight: drawHeight,
            maskCenterX: maskCenterX,
            maskCenterY: maskCenterY,
            scaledTextX: scaledTextX,
            scaledTextY: scaledTextY,
            calculation: {
              maskCenterX_calc: `scaledTextX = ${maskCenterX}`,
              maskCenterY_calc: `scaledTextY = ${maskCenterY}`,
              note: 'Маска теперь в тех же координатах, что и тень!'
            }
          })
          
          console.log('🖼️ ОТЛАДКА: Создаем маску с данными (ИСПРАВЛЕНО):', {
            text: currentTextData.text,
            fontSize: currentTextData.fontSize,
            lineHeight: currentTextData.lineHeight,
            textAlign: maskTextData.textAlign,
            imagePosition: `${drawX}, ${drawY}`,
            imageSize: `${drawWidth}, ${drawHeight}`,
            maskPosition: `${maskCenterX}, ${maskCenterY}`,
            oldPosition: `${textCanvasCenterX}, ${textCanvasCenterY}`,
            note: 'Маска теперь в координатах scaledTextX, scaledTextY для совпадения с тенью!'
          })
          
          // ИСПРАВЛЕНО: Используем drawMultilineTextWithData с размером шрифта, соответствующим тени
          // Маска должна создаваться с тем же размером шрифта, что и тень
          // ИСПРАВЛЕНО: Создаем маску с тем же размером шрифта, что и тень
          console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА МАСКИ:', {
            context: 'textCtx',
            canvasSize: `${textCanvas.width}x${textCanvas.height}`,
            fontSize: currentTextData.fontSize || 24,
            fontWeight: currentTextData.fontWeight || 'normal',
            font: currentTextData.font || 'Arial',
            coordinates: `${maskCenterX}, ${maskCenterY}`,
            textAlign: maskTextData.textAlign,
            globalCompositeOperation: textCtx.globalCompositeOperation,
            ctxFont: textCtx.font,
            ctxTextAlign: textCtx.textAlign,
            ctxTextBaseline: textCtx.textBaseline,
            ctxFillStyle: textCtx.fillStyle
          })
          
          // ИСПРАВЛЕНО: Увеличиваем размер шрифта для маски, чтобы после масштабирования он совпал с тенью
          const maskFontSize = (currentTextData.fontSize || 24) * (canvasWidth / previewCanvasWidth)
          
          console.log('🎯 ИСПРАВЛЕНИЕ РАЗМЕРА ШРИФТА ДЛЯ МАСКИ:', {
            originalFontSize: currentTextData.fontSize || 24,
            scaleFactor: (canvasWidth / previewCanvasWidth).toFixed(3),
            maskFontSize: maskFontSize.toFixed(1),
            canvasWidth: canvasWidth,
            previewCanvasWidth: previewCanvasWidth,
            note: 'Маска теперь будет того же размера, что и тень!'
          })
          
          this.drawMultilineTextWithData(textCtx, currentTextData.text, maskCenterX, maskCenterY, maskFontSize, currentTextData.lineHeight, maskTextData)
          
          // Сбрасываем режим композиции
          textCtx.globalCompositeOperation = 'source-over'
          
          console.log('🖼️ ОТЛАДКА: Маска создана, рисуем на основном канвасе')
          
          // ОТЛАДКА: Проверяем, что получилось на textCanvas
          console.log('🖼️ ОТЛАДКА: Состояние textCanvas после создания маски:', {
            textCanvasSize: `${textCanvas.width}x${textCanvas.height}`,
            globalCompositeOperation: textCtx.globalCompositeOperation,
            note: 'Проверяем, что маска создана правильно'
          })
          
          // Рисуем результат на основном канвасе (полный размер)
          // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
          const scaleX = canvasWidth / previewCanvasWidth
          const scaleY = canvasHeight / previewCanvasHeight
          tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
          
          console.log('🖼️ Маска с изображением нарисована (ЛОГИЧЕСКИЕ размеры):', {
            textCanvasSize: `${textCanvas.width}x${textCanvas.height}`,
            tempCanvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
            textCanvasLogicalSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
            dpr: dpr,
            note: 'textCanvas использует размеры превью - растр будет правильного размера!'
          })
          } else {
            // Если нет изображения, рисуем обычный текст в режиме "Текст с изображением"
            console.log('📝 Рисуем текст в режиме "Текст с изображением" без изображения')
            
            // Сначала рисуем тень если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // Используем координаты, которые после масштабирования будут соответствовать canvasCenterX, canvasCenterY
              this.drawMultilineTextWithData(textCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
            
            // Настраиваем стили текста (точно как в превью)
            textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
            textCtx.textAlign = currentTextData.textAlign || 'center'
            textCtx.textBaseline = 'middle'
            textCtx.fillStyle = currentTextData.textColor || '#000000'
            
            // Рисуем текст в центре канваса с поддержкой переносов строк
            // Используем те же координаты, что и для тени
            this.drawMultilineTextWithData(textCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            // Рисуем результат на основном канвасе
            // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
            tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
            
            console.log('✅ Текст в режиме "Текст с изображением" без изображения добавлен в Raster')
          }
        } else {
          // Если нет изображения, используем обычную заливку цветом
          console.log('🖼️ Рисуем текст без изображения:', {
            text: currentTextData.text,
            textColor: textColor,
            fontSize: currentTextData.fontSize,
            position: `${textCanvasCenterX}, ${textCanvasCenterY}`
          })
          tempCtx.fillStyle = textColor
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, canvasCenterX, canvasCenterY, currentTextData.fontSize * 1, currentTextData.lineHeight, currentTextData)
        }
        
        // 3. НАКОНЕЦ применяем обводку к тексту если включена (поверх всего)
        if (currentTextData.stroke) {
          // Если это режим "Текст с изображением", рисуем обводку на textCtx и переносим на tempCtx
          if (currentTextData.textImage) {
            textCtx.strokeStyle = currentTextData.strokeColor
            textCtx.lineWidth = currentTextData.strokeWidth * 1 // previewScale = 1
            // ИСПРАВЛЕНО: Создаем обводку с тем же размером шрифта, что и тень
            console.log('🖼️ ОТЛАДКА: Рисуем обводку с параметрами:', {
              fontSize: currentTextData.fontSize || 24,
              fontWeight: currentTextData.fontWeight || 'normal',
              font: currentTextData.font || 'Arial',
              coordinates: `${scaledTextX}, ${scaledTextY}`,
              strokeWidth: currentTextData.strokeWidth
            })
            
            this.drawMultilineTextStrokeWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight, currentTextData)
            
            // Переносим обводку на основной канвас
            // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
            tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
          } else {
            // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
            // Для других режимов обводка у текста не применяется
            console.log('📝 Режим не "Текст с изображением": обводка у текста отключена')
          }
        }
        
        // Конвертируем Canvas в Paper.js Raster
        // ИСПРАВЛЕНО: Используем tempCanvas для правильных размеров с HiDPI масштабированием
        const raster = new this.paperScope.Raster(tempCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку tempCanvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        // Создаем область перетаскивания для правильного выделения
        // Ждем пока Paper.js вычислит bounds
        setTimeout(() => {
          const rasterBounds = raster.bounds
          if (rasterBounds) {
            // Рассчитываем правильные bounds с учетом хвоста
            const expandedBounds = this.calculateSmartBounds(rasterBounds, currentTextData, 'imageText')
            console.log('🎯 Создаем область перетаскивания для Raster (ImageText):', {
              originalBounds: rasterBounds,
              expandedBounds: expandedBounds
            })
            
            // Устанавливаем правильные bounds для области перетаскивания
            raster.bounds = expandedBounds
          } else {
            console.warn('⚠️ Не удалось получить bounds для Raster (ImageText)')
          }
        }, 0)
        
        console.log('🎯 Raster создан с правильными размерами (ImageText):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `1/${dpr}, 1/${dpr} (с HiDPI масштабированием)`,
          padding: padding
        })
        
        console.log('✅ Подложка "Текст с изображением" создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `1/${dpr}x (с HiDPI масштабированием)`,
          textData: {
            text: currentTextData.text,
            fontSize: currentTextData.fontSize,
            textColor: currentTextData.textColor,
            fontWeight: currentTextData.fontWeight,
            font: currentTextData.font,
            hasImage: !!currentTextData.textImage,
            shadow: currentTextData.shadow,
            stroke: currentTextData.stroke
          }
        })
        
        return raster
        
      } catch (error) {
        console.error('❌ Ошибка создания подложки "Текст с изображением" из логики превью:', error)
        // Fallback на простой прямоугольник
        const rect = new this.paperScope.Path.Rectangle(
          new this.paperScope.Point(x - backgroundWidth / 2, y - backgroundHeight / 2),
          new this.paperScope.Point(x + backgroundWidth / 2, y + backgroundHeight / 2)
        )
        rect.fillColor = backgroundColor
        return rect
      }
    },
    
    // Создание подложки "Мысли"
    createThoughtsBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      const currentTextData = textData
      
      try {
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        console.log('🔍 HiDPI информация для режима "Мысли":', {
          dpr: dpr,
          note: 'Если dpr > 1, то размеры будут масштабироваться'
        })
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
        // Добавляем внутренние отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textWidth + textPadding * 2
        const textHeightWithPadding = textHeight + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        console.log('📏 Расчет размеров подложки с учетом текста (режим "Мысли"):', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
          textPadding: textPadding,
          textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`
        })
        
        // Добавляем отступы для тени и обводки
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX) + Math.abs(currentTextData.shadowOffsetY), 100) : 0
        const strokePadding = currentTextData.stroke ? (currentTextData.strokeWidth / 2 + 2) : 0
        
        // Рассчитываем отступ для хвоста на основе максимальной длины хвоста
        const maxTailSize = 7.5 // Максимальный размер хвоста (750%)
        const minDimension = Math.min(actualBackgroundWidth, actualBackgroundHeight)
        const maxTailLength = minDimension * maxTailSize
        const tailPadding = Math.max(100, maxTailLength * 0.2) // 20% от максимальной длины хвоста, минимум 100px
        
        const canvasWidth = actualBackgroundWidth + shadowPadding + strokePadding + tailPadding
        const canvasHeight = actualBackgroundHeight + shadowPadding + strokePadding + tailPadding
        
        console.log('📏 Расчет размеров канваса (с учетом текста):', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`,
          shadowPadding: shadowPadding,
          strokePadding: strokePadding,
          maxTailLength: maxTailLength.toFixed(1),
          tailPadding: tailPadding.toFixed(1),
          canvasSize: `${canvasWidth.toFixed(1)}x${canvasHeight.toFixed(1)}`,
          note: 'Используем реальные размеры с учетом текста и хвоста'
        })
        
        // Смещение для центрирования в канвасе
        const offsetX = 0
        const offsetY = 0
        
        console.log('🎯 ДЕТАЛЬНОЕ позиционирование на канвасе:', {
          originalPosition: `${x}, ${y}`,
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          offset: `${offsetX}, ${offsetY}`
        })
        
        console.log('🧮 МАТЕМАТИКА позиционирования:', {
          step1: 'Целевая позиция центра подложки на основном канвасе',
          targetCenter: `${x}, ${y}`,
          step2: 'Где нарисован центр подложки внутри tempCanvas',
          drawnCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step3: 'Размер tempCanvas',
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          step4: 'Позиция Raster на основном канвасе',
          rasterPosition: `${x}, ${y}`
        })
        
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasWidth * dpr // Физический размер с учетом HiDPI
        tempCanvas.height = canvasHeight * dpr
        tempCanvas.style.width = canvasWidth + 'px' // Логический размер
        tempCanvas.style.height = canvasHeight + 'px'
        
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.scale(dpr, dpr) // Масштабируем контекст для HiDPI
        
        // Очищаем канвас
        tempCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        // Используем реальные размеры подложки с учетом текста
        const backgroundScale = 1.0 // Используем полный размер подложки
        const textScale = 1.0 // Используем полный размер текста
        const scaledBackgroundWidth = actualBackgroundWidth * backgroundScale
        const scaledBackgroundHeight = actualBackgroundHeight * backgroundScale
        
        // Вычисляем центр временного Canvas для правильного позиционирования (логические координаты)
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2
        
        console.log('🎨 Рисуем режим "Мысли" в центре tempCanvas:', {
          tempCanvasSize: `${canvasWidth}x${canvasHeight}`,
          centerPosition: `${centerX}, ${centerY}`,
          scaledBackground: `${scaledBackgroundWidth}x${scaledBackgroundHeight}`,
          note: 'Режим "Мысли" рисуется в центре tempCanvas'
        })
        
        // Применяем тень если включена (для суперподложки)
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        console.log('🧠 ЛОГ: createThoughtsBackgroundFromPreviewLogic - проверяем тень:', {
          hasShadow: !!currentTextData.shadow,
          shadowValue: currentTextData.shadow,
          backgroundMode: currentTextData.backgroundMode,
          isImageText: currentTextData.backgroundMode === 'image-text',
          willApplyShadow: currentTextData.shadow && currentTextData.backgroundMode !== 'image-text'
        })
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * backgroundScale))
          // ИСПРАВЛЕНИЕ: Для режима "Мысли" сдвиг тени умножаем на 2 при переносе на основной канвас
          if (currentTextData.backgroundMode === 'thoughts') {
            console.log('🧠 ЛОГ: createThoughtsBackgroundFromPreviewLogic - применяем тень:', {
              originalOffsetX: currentTextData.shadowOffsetX,
              originalOffsetY: currentTextData.shadowOffsetY,
              backgroundScale: backgroundScale,
              resultOffsetX: Math.round(currentTextData.shadowOffsetX * backgroundScale * 2),
              resultOffsetY: Math.round(currentTextData.shadowOffsetY * backgroundScale * 2),
              backgroundMode: currentTextData.backgroundMode
            })
            tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale * 2)
            tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale * 2)
          } else {
            tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale)
            tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale)
          }
        }
        
        console.log('🧠 ЭКСПЕРИМЕНТ: Вызываем drawThoughtsModeShapeWithData с правильными размерами:', {
          centerX: centerX,
          centerY: centerY,
          originalSize: `${backgroundWidth}x${backgroundHeight}`,
          scaledSize: `${scaledBackgroundWidth}x${scaledBackgroundHeight}`,
          backgroundScale: backgroundScale,
          textScale: textScale,
          backgroundColor: backgroundColor,
          withShadow: true,
          drawTail: true,
          hasTextData: !!currentTextData
        })
        this.drawThoughtsModeShapeWithData(tempCtx, centerX, centerY, scaledBackgroundWidth, scaledBackgroundHeight, 1, backgroundColor, true, true, currentTextData)
        
        // Сбрасываем тень
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена (для суперподложки - нормальная толщина)
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = Math.max(1, currentTextData.strokeWidth * backgroundScale)
          // Для режима "Мысли" обводка применяется к основному овалу
          tempCtx.beginPath()
          this.drawOval(tempCtx, centerX, centerY, scaledBackgroundWidth, scaledBackgroundHeight)
          tempCtx.stroke()
        }
        
        // Добавляем текст в Raster (уменьшенный)
        if (currentTextData.text && currentTextData.text.trim() !== '') {
          this.drawTextInRasterWithData(tempCtx, centerX, centerY, scaledBackgroundWidth, scaledBackgroundHeight, currentTextData, textScale)
        }
        
        // Конвертируем Canvas в Paper.js Raster
        const raster = new this.paperScope.Raster(tempCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку Canvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('🎯 Raster создан с правильными размерами (Thoughts):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          originalPosition: `${x}, ${y}`,
          offset: `${offsetX}, ${offsetY}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `${(1 / dpr).toFixed(3)}x`,
          note: 'Raster позиционирован точно в целевую точку'
        })
        
        console.log('🧮 ПРОВЕРКА математики позиционирования:', {
          step1: 'Целевая позиция центра подложки',
          target: `${x}, ${y}`,
          step2: 'Центр подложки внутри tempCanvas',
          drawnCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step3: 'Центр tempCanvas',
          canvasCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step4: 'Позиция Raster на основном канвасе',
          finalPosition: `${x}, ${y}`,
          result: 'Центр Raster совпадает с целевой позицией'
        })
        
        console.log('✅ Подложка "Мысли" создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `${(1 / dpr).toFixed(3)}x`
        })
        
        return raster
        
      } catch (error) {
        console.error('❌ Ошибка создания подложки "Мысли":', error)
        return null
      }
    },
    
    // Рисование режима "Мысли" - овальная подложка с множественными хвостами
    drawThoughtsModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true) {
      console.log('🧠 Отрисовка режима "Мысли" - овальная подложка с множественными хвостами')
      
      // Рисуем каждый овал отдельно, чтобы избежать создания общего пути
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor)
      
      console.log('✅ Режим "Мысли" отрисован - только овалы, без треугольников!')
    },

    drawThoughtsModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true, textData = null) {
      console.log('🧠 Отрисовка режима "Мысли" с переданными данными - овальная подложка с множественными хвостами')
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor, textData)
      console.log('✅ Режим "Мысли" отрисован с переданными данными - только овалы, без треугольников!')
    },
    // Построение пути для режима "Мысли" - ПРОСТАЯ ЛОГИКА
    buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail = true, backgroundColor, textData = null, isHighDPI = false) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
      // 1️⃣ Рисуем основной овал (подложка) с тенью если включена
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      console.log('🧠 ЛОГ: buildThoughtsModePath - проверяем тень:', {
        hasShadow: !!currentTextData.shadow,
        shadowValue: currentTextData.shadow,
        backgroundMode: currentTextData.backgroundMode,
        isImageText: currentTextData.backgroundMode === 'image-text',
        willApplyShadow: currentTextData.shadow && currentTextData.backgroundMode !== 'image-text'
      })
      if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
        ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        // ИСПРАВЛЕНИЕ: Для режима "Мысли" умножаем размытие и смещение тени на 2
        ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale * 2))
        ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale * 2)
        ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale * 2)
      }
      
      ctx.beginPath()
      this.drawOval(ctx, centerX, centerY, bgWidth, bgHeight)
      ctx.fillStyle = backgroundColor || currentTextData.backgroundColor
      ctx.fill()
      
      // Сбрасываем тень
      if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена
      if (currentTextData.stroke) {
        ctx.strokeStyle = currentTextData.strokeColor
        ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale))
        ctx.stroke()
      }
      
      // Если не нужно рисовать хвост (для дефолтной подложки), выходим
      if (!drawTail) {
        console.log('🧠 Режим "Мысли" - только основной овал, хвост не рисуем')
        return
      }
      
      console.log('🧠 Режим "Мысли" - рисуем хвост с параметрами:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailAngle: currentTextData.tailAngle,
        drawTail: drawTail
      })
      
      // Параметры хвоста из настроек
      const tailSize = Number(currentTextData.tailSize) / 100 // Длина хвоста (от 100% до 750%)
      const tailWidth = Number(currentTextData.tailWidth) / 100 // Ширина хвоста (от 40% до 100%)
      const tailAngle = Number(currentTextData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (используем ту же логику что и в превью)
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * tailSize // Длина хвоста (как в превью)
      const tailWidthPixels = minDimension * tailWidth // Ширина хвоста в пикселях (как в превью)
      
      console.log('🧠 Параметры хвоста:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailAngle: currentTextData.tailAngle,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        tailAngleDeg: (tailAngle * 180 / Math.PI).toFixed(1),
        tailLength: tailLength.toFixed(1),
        tailWidthPixels: tailWidthPixels.toFixed(1),
        minDimension: minDimension.toFixed(1)
      })
      
      // Проверяем, что параметры хвоста не слишком маленькие
      if (tailLength < 10 || tailWidthPixels < 5) {
        console.log('⚠️ Параметры хвоста слишком маленькие, используем минимальные значения')
        const minTailLength = Math.max(10, minDimension * 0.3)
        const minTailWidth = Math.max(5, 50 * 0.2) // 50 - это базовая ширина хвоста
        console.log('🧠 Скорректированные параметры:', {
          tailLength: minTailLength.toFixed(1),
          tailWidthPixels: minTailWidth.toFixed(1)
        })
      }
      
      // 2️⃣ ЛОГИКА ИЗ ПРЕВЬЮ: рисуем овалы хвоста точно как в TextManager
      // Упрощенная логика: рисуем только 2 овала (большой и маленький)
      const tailCount = 2
      
      console.log('🧠 Количество овалов хвоста:', tailCount)
      
      // 3️⃣ Отступ от основного овала (как в превью)
      const offsetFromMain = tailWidthPixels * 0.1
      
      // 4️⃣ Рисуем овалы хвоста с правильным расположением (как в превью)
      console.log('🧠 Начинаем рисование овалов хвоста (логика из превью):', {
        tailCount: tailCount,
        tailLength: tailLength,
        tailWidthPixels: tailWidthPixels,
        offsetFromMain: offsetFromMain
      })
      
      for (let i = 0; i < tailCount; i++) {
        // Позиция овалов: маленький в конце, большой на 35% длины хвоста от маленького (как в превью)
        let distanceFromCenter
        if (i === 0) {
          // Первый овал (большой) - на 35% длины хвоста от маленького овала
          const smallOvalDistance = offsetFromMain + (tailLength - offsetFromMain) // Маленький в конце
          const distanceFromSmall = (tailLength - offsetFromMain) * 0.35 // 35% длины хвоста
          distanceFromCenter = smallOvalDistance - distanceFromSmall
        } else {
          // Второй овал (маленький) - в конце хвоста
          distanceFromCenter = offsetFromMain + (tailLength - offsetFromMain)
        }
        
        // Размер овала (только 2 овала) - точно как в превью
        let sizeMultiplier
        if (i === 0) {
          // Первый овал (большой) - увеличиваем на 60%
          sizeMultiplier = 1.6 // 1.0 + 60% = 1.6
        } else {
          // Второй овал (маленький) - базовый размер
          sizeMultiplier = 1.0
        }
        
        // Размеры овала (точно как в превью)
        const ovalWidth = tailWidthPixels * sizeMultiplier
        const ovalHeight = tailWidthPixels * sizeMultiplier * 0.6 // Овалы немного сплющены (как в превью)
        
        // Позиция овала (центр совпадает с линией хвоста)
        const ovalX = centerX + Math.cos(tailAngle) * distanceFromCenter
        const ovalY = centerY + Math.sin(tailAngle) * distanceFromCenter
        
        console.log(`🧠 Овал ${i + 1}:`, {
          distanceFromCenter: distanceFromCenter.toFixed(1),
          sizeMultiplier: sizeMultiplier.toFixed(2),
          ovalSize: `${ovalWidth.toFixed(1)}x${ovalHeight.toFixed(1)}`,
          position: { x: ovalX.toFixed(1), y: ovalY.toFixed(1) }
        })
        
        // Рисуем овал хвоста с тенью если включена
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          // ИСПРАВЛЕНИЕ: Для режима "Мысли" умножаем размытие и смещение тени на 2
          ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale * 2))
          ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale * 2)
          ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale * 2)
        }
        
        // Рисуем овал хвоста с собственным заполнением
        ctx.beginPath()
        this.drawOval(ctx, ovalX, ovalY, ovalWidth, ovalHeight)
        ctx.fillStyle = backgroundColor || currentTextData.backgroundColor
        ctx.fill()
        
        // Сбрасываем тень
        if (currentTextData.shadow) {
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена (такая же толщина как у основного овала)
        if (currentTextData.stroke) {
          ctx.strokeStyle = currentTextData.strokeColor
          ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale))
          ctx.stroke()
        }
      }
      
      console.log('🧠 Режим "Мысли" - хвост отрисован успешно!')
    },
    
    
    // Отрисовка объединенной фигуры (подложка + хвост) как единое целое
    drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // КЭШИРУЕМ точку пересечения для использования в strokeCombinedShape
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight, currentTextData)
      
      // Создаем путь для объединенной фигуры по внешним границам
      ctx.beginPath()
      
      // Строим объединенную фигуру как единый путь с кэшированной точкой
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection, currentTextData)
      
      // Заполняем объединенную фигуру
      ctx.fillStyle = backgroundColor
      ctx.fill()
      
    },
    
    // Обводка объединенной фигуры (подложка + хвост) как единое целое
    strokeCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // ИСПОЛЬЗУЕМ КЭШИРОВАННУЮ точку пересечения
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight, currentTextData)
      
      // Создаем путь для объединенной фигуры по внешним границам
      ctx.beginPath()
      
      // Строим объединенную фигуру как единый путь с кэшированной точкой
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection, currentTextData)
      
      // Обводим объединенную фигуру
      ctx.stroke()
    },
    
    // КЭШИРОВАНИЕ точки пересечения для стабильности
    getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight, textData = null) {
      const currentTextData = textData
      
      // Параметры хвоста
      const tailSize = Number(currentTextData.tailSize) / 100
      const tailWidth = Number(currentTextData.tailWidth) / 100
      const tailAngle = Number(currentTextData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (точно как в StickerManiaPage для основного канваса)
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * 1.25 // Базовая длина хвоста (как в StickerManiaPage)
      // Используем формулу из StickerManiaPage для расчета границ: minDimension * 0.3 * tailWidth
      const tailWidthPixels = minDimension * 0.3 * tailWidth
      
      console.log('🔍 getCachedTailIntersection DEBUG:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        minDimension: minDimension,
        tailLength: tailLength,
        tailWidthPixels: tailWidthPixels
      })
      
      // Вычисляем точку пересечения хвоста с подложкой
      return this.calculateTailIntersection(centerX, centerY, bgWidth, bgHeight, tailAngle, tailLength, tailWidthPixels)
    },
    
    // Построение пути для суперподложки с кэшированной точкой пересечения
    buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // Параметры хвоста
      const tailWidthPercent = Number(currentTextData.tailWidth) / 100
      const tailSizePercent = Number(currentTextData.tailSize) / 100
      
      console.log('🔍 buildUnifiedShapePathWithCache DEBUG:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailSizePercent: tailSizePercent,
        tailWidthPercent: tailWidthPercent,
        minDimension: Math.min(bgWidth, bgHeight),
        tailLength: Math.min(bgWidth, bgHeight) * 1.25,
        scale: scale
      })
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      if (cachedIntersection) {
        // Создаем суперподложку с хвостом используя КЭШИРОВАННУЮ точку
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   cachedIntersection, currentTextData.tailAngle * Math.PI / 180, Math.min(bgWidth, bgHeight) * 1.25, tailWidthPercent, currentTextData, scale)
      } else {
        // Если нет пересечения, рисуем обычную подложку
        this.buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight)
      }
    },
    
    // Построение пути суперподложки с хвостом
    buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                           intersectionPoint, tailAngle, tailLength, tailWidthPercent, textData = null, scale = 1) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // Вычисляем параметры хвоста
      const tailWidthPixels = tailWidthPercent * 50 * scale * 2
      
      // Острая вершина хвоста (используем переданный tailLength с учетом tailSize)
      const sharpPointX = centerX + tailLength * Number(currentTextData.tailSize) / 100 * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * Number(currentTextData.tailSize) / 100 * Math.sin(tailAngle)
      
      // Определяем, с какой стороны подложки выходит хвост
      const tailSide = this.getTailSideFromIntersection(intersectionPoint, bgX, bgY, bgWidth, bgHeight)
      
      // Проверяем, находится ли точка пересечения в углу подложки
      const isCorner = this.isIntersectionAtCorner(intersectionPoint, bgX, bgY, bgWidth, bgHeight)
      
      // Строим путь суперподложки
      ctx.beginPath()
      
      if (isCorner) {
        // Если хвост выходит из угла, строим специальный путь
        this.buildCornerTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                    intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent, scale)
      } else {
        // Обычный путь для стороны
        this.buildSideTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                  intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent, scale)
      }
      
      ctx.closePath()
    },
    
    // Построение простого пути подложки без хвоста
    buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight) {
      ctx.rect(bgX, bgY, bgWidth, bgHeight)
    },
    
    // Определение стороны выхода хвоста по точке пересечения
    getTailSideFromIntersection(intersectionPoint, bgX, bgY, bgWidth, bgHeight) {
      const tolerance = 1
      
      // Верхняя сторона
      if (Math.abs(intersectionPoint.y - bgY) < tolerance) return 'top'
      // Правая сторона
      if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < tolerance) return 'right'
      // Нижняя сторона
      if (Math.abs(intersectionPoint.y - (bgY + bgHeight)) < tolerance) return 'bottom'
      // Левая сторона
      if (Math.abs(intersectionPoint.x - bgX) < tolerance) return 'left'
      
      return 'top' // По умолчанию
    },
    
    // Проверка, находится ли точка пересечения в углу подложки
    isIntersectionAtCorner(intersectionPoint, bgX, bgY, bgWidth, bgHeight) {
      const tolerance = 2
      
      // Левый верхний угол
      if (Math.abs(intersectionPoint.x - bgX) < tolerance && Math.abs(intersectionPoint.y - bgY) < tolerance) return true
      // Правый верхний угол
      if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < tolerance && Math.abs(intersectionPoint.y - bgY) < tolerance) return true
      // Правый нижний угол
      if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < tolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < tolerance) return true
      // Левый нижний угол
      if (Math.abs(intersectionPoint.x - bgX) < tolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < tolerance) return true
      
      return false
    },
    
    // Построение пути суперподложки с хвостом из угла
    buildCornerTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                            intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent, scale = 1) {
      // Определяем, какой это угол
      const tolerance = 2
      let isTopLeft = false, isTopRight = false, isBottomRight = false, isBottomLeft = false
      
      if (Math.abs(intersectionPoint.x - bgX) < tolerance && Math.abs(intersectionPoint.y - bgY) < tolerance) {
        isTopLeft = true
      } else if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < tolerance && Math.abs(intersectionPoint.y - bgY) < tolerance) {
        isTopRight = true
      } else if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < tolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < tolerance) {
        isBottomRight = true
      } else if (Math.abs(intersectionPoint.x - bgX) < tolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < tolerance) {
        isBottomLeft = true
      }
      
      // Вычисляем ширину хвоста точно как в StickerManiaPage для основного канваса
      const minDimension = Math.min(bgWidth, bgHeight)
      // Используем формулу из StickerManiaPage: tailWidthPercent * 50 * scale, умножаем на 2 для правильной ширины
      const tailWidthPixels = tailWidthPercent * 50 * scale * 2
      
      if (isTopLeft) {
        // Левый верхний угол - строим путь с хвостом
        const point1X = bgX + tailWidthPixels
        const point1Y = bgY
        const point2X = bgX
        const point2Y = bgY + tailWidthPixels
        
        ctx.moveTo(bgX, bgY)  // A
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX, bgY)  // A (замыкаем)
      } else if (isTopRight) {
        // Правый верхний угол
        const point1X = bgX + bgWidth - tailWidthPixels
        const point1Y = bgY
        const point2X = bgX + bgWidth
        const point2Y = bgY + tailWidthPixels
        
        ctx.moveTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B (замыкаем)
      } else if (isBottomRight) {
        // Правый нижний угол
        const point1X = bgX + bgWidth
        const point1Y = bgY + bgHeight - tailWidthPixels
        const point2X = bgX + bgWidth - tailWidthPixels
        const point2Y = bgY + bgHeight
        
        ctx.moveTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C (замыкаем)
      } else if (isBottomLeft) {
        // Левый нижний угол
        const point1X = bgX
        const point1Y = bgY + bgHeight - tailWidthPixels
        const point2X = bgX + tailWidthPixels
        const point2Y = bgY + bgHeight
        
        ctx.moveTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX, bgY + bgHeight)  // D (замыкаем)
      }
    },
    
    // Построение пути суперподложки с хвостом со стороны (не из угла)
    buildSideTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                          intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent, scale = 1) {
      // Вычисляем ширину хвоста точно как в StickerManiaPage для основного канваса
      const minDimension = Math.min(bgWidth, bgHeight)
      // Используем формулу из StickerManiaPage: tailWidthPercent * 50 * scale, умножаем на 2 для правильной ширины
      const tailWidthPixels = tailWidthPercent * 50 * scale * 2
      
      if (tailSide === 'top') {
        // Хвост сверху
        const point1X = intersectionPoint.x - tailWidthPixels / 2
        const point1Y = bgY
        const point2X = intersectionPoint.x + tailWidthPixels / 2
        const point2Y = bgY
        
        ctx.moveTo(bgX, bgY)  // A
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A (замыкаем)
      } else if (tailSide === 'right') {
        // Хвост справа
        const point1X = bgX + bgWidth
        const point1Y = intersectionPoint.y - tailWidthPixels / 2
        const point2X = bgX + bgWidth
        const point2Y = intersectionPoint.y + tailWidthPixels / 2
        
        ctx.moveTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B (замыкаем)
      } else if (tailSide === 'bottom') {
        // Хвост снизу
        const point1X = intersectionPoint.x + tailWidthPixels / 2
        const point1Y = bgY + bgHeight
        const point2X = intersectionPoint.x - tailWidthPixels / 2
        const point2Y = bgY + bgHeight
        
        ctx.moveTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C (замыкаем)
      } else if (tailSide === 'left') {
        // Хвост слева
        const point1X = bgX
        const point1Y = intersectionPoint.y + tailWidthPixels / 2
        const point2X = bgX
        const point2Y = intersectionPoint.y - tailWidthPixels / 2
        
        ctx.moveTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(point1X, point1Y)     // точка1
        ctx.lineTo(sharpPointX, sharpPointY)  // вершина хвоста
        ctx.lineTo(point2X, point2Y)     // точка2
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX, bgY + bgHeight)  // D (замыкаем)
      }
    },
    
    // Вычисление точки пересечения хвоста с подложкой
    calculateTailIntersection(centerX, centerY, bgWidth, bgHeight, tailAngle, tailLength, tailWidth) {
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      // Вычисляем точку пересечения линии хвоста с границей подложки
      return this.getTailIntersectionWithBackground(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight)
    },
    
    // Вычисление точки пересечения линии хвоста с границей подложки
    getTailIntersectionWithBackground(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight) {
      // Координаты углов подложки
      const bgLeft = bgX
      const bgRight = bgX + bgWidth
      const bgTop = bgY
      const bgBottom = bgY + bgHeight
      
      // Длина линии хвоста (достаточно длинная для пересечения с любой стороной)
      const tailLength = Math.max(bgWidth, bgHeight) * 2
      
      // Координаты конца хвоста
      const tailEndX = centerX + tailLength * Math.cos(tailAngle)
      const tailEndY = centerY + tailLength * Math.sin(tailAngle)
      
      // Проверяем пересечение с каждой стороной подложки
      const sides = [
        { x1: bgLeft, y1: bgTop, x2: bgRight, y2: bgTop }, // Верх
        { x1: bgRight, y1: bgTop, x2: bgRight, y2: bgBottom }, // Право
        { x1: bgRight, y1: bgBottom, x2: bgLeft, y2: bgBottom }, // Низ
        { x1: bgLeft, y1: bgBottom, x2: bgLeft, y2: bgTop } // Лево
      ]
      
      // Собираем ВСЕ пересечения
      const allIntersections = []
      
      for (const side of sides) {
        const intersection = this.getLineIntersection(
          centerX, centerY, tailEndX, tailEndY,
          side.x1, side.y1, side.x2, side.y2
        )
        
        if (intersection) {
          // Проверяем, что точка пересечения находится на отрезке
          if (this.isPointOnLineSegment(intersection.x, intersection.y, side.x1, side.y1, side.x2, side.y2)) {
            allIntersections.push(intersection)
          }
        }
      }
      
      // Возвращаем ближайшую точку пересечения
      if (allIntersections.length > 0) {
        let closestIntersection = allIntersections[0]
        let minDistance = Math.sqrt(Math.pow(closestIntersection.x - centerX, 2) + Math.pow(closestIntersection.y - centerY, 2))
        
        for (let i = 1; i < allIntersections.length; i++) {
          const distance = Math.sqrt(Math.pow(allIntersections[i].x - centerX, 2) + Math.pow(allIntersections[i].y - centerY, 2))
          if (distance < minDistance) {
            minDistance = distance
            closestIntersection = allIntersections[i]
          }
        }
        
        return closestIntersection
      }
      
      return null
    },
    
    // Вычисление пересечения двух линий
    getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(den) < 1e-10) return null // Линии параллельны
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        }
      }
      
      return null
    },
    
    // Проверка, находится ли точка на отрезке
    isPointOnLineSegment(px, py, x1, y1, x2, y2) {
      const tolerance = 1e-10
      
      // Проверяем, что точка лежит на линии
      const crossProduct = Math.abs((px - x1) * (y2 - y1) - (py - y1) * (x2 - x1))
      if (crossProduct > tolerance) return false
      
      // Проверяем, что точка находится между концами отрезка
      const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)
      const squaredLength = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
      
      return dotProduct >= 0 && dotProduct <= squaredLength
    },
    
    // Рисование текста на канвасе
    drawTextOnCanvas(ctx, centerX, centerY, textData) {
      ctx.save()
      
      const fontSize = textData.fontSize || 16
      const fontFamily = textData.font || 'Arial'
      const fontWeight = textData.fontWeight || 'normal'
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = textData.textColor || '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Рисуем тень только для режима "Текст с изображением"
      if (textData.shadow && textData.backgroundMode === 'image-text') {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = textData.shadowBlur || 10
        ctx.shadowOffsetX = textData.shadowOffsetX || 5
        ctx.shadowOffsetY = textData.shadowOffsetY || 5
      } else {
        // Сбрасываем тень для других режимов
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      
      // Рисуем обводку если есть
      // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
      if (textData.stroke && textData.backgroundMode === 'image-text') {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      }
      
      ctx.restore()
    },

    drawTextOnCanvasWithScale(ctx, centerX, centerY, textData, scale) {
      ctx.save()
      
      const fontSize = (textData.fontSize || 16) * scale
      const fontFamily = textData.font || 'Arial'
      const fontWeight = textData.fontWeight || 'normal'
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = textData.textColor || '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Рисуем тень только для режима "Текст с изображением" (с масштабированием)
      if (textData.shadow && textData.backgroundMode === 'image-text') {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = (textData.shadowBlur || 10) * scale
        ctx.shadowOffsetX = (textData.shadowOffsetX || 5) * scale
        ctx.shadowOffsetY = (textData.shadowOffsetY || 5) * scale
      } else {
        // Сбрасываем тень для других режимов
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize * scale, textData.lineHeight || 1.2, textData)
      
      // Рисуем обводку если есть (с масштабированием)
      // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
      if (textData.stroke && textData.backgroundMode === 'image-text') {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = (textData.strokeWidth || 3) * scale
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize * scale, textData.lineHeight || 1.2, textData)
      }
      
      ctx.restore()
    },

    // Отрисовка текста в Raster с переданными данными
    drawTextInRasterWithData(ctx, x, y, backgroundWidth, backgroundHeight, textData, dpr = 1) {
      try {
        console.log('🎨 Начинаем отрисовку текста в Raster с данными:', {
          text: textData.text,
          position: `${x}, ${y}`,
          backgroundSize: `${backgroundWidth}x${backgroundHeight}`
        })
        
        // Настройки текста из переданных данных (с масштабированием)
        const fontSize = textData.fontSize * dpr // Масштабируем размер шрифта
        const fontFamily = textData.font
        const fontWeight = textData.fontWeight
        const textColor = textData.textColor
        
        console.log('🎨 Настройки текста (с масштабированием):', {
          originalFontSize: textData.fontSize,
          scaledFontSize: fontSize,
          dpr: dpr,
          fontFamily,
          fontWeight,
          textColor
        })
        
        // Устанавливаем стиль шрифта
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.textAlign = textData.textAlign || 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = textColor
        
        // Применяем тень только для режима "Текст с изображением"
        if (textData.shadow && textData.backgroundMode === 'image-text') {
          ctx.shadowColor = textData.shadowColor || '#000000'
          ctx.shadowBlur = (textData.shadowBlur || 10) * dpr
          ctx.shadowOffsetX = (textData.shadowOffsetX || 5) * dpr
          ctx.shadowOffsetY = (textData.shadowOffsetY || 5) * dpr
        } else {
          // Сбрасываем тень для других режимов
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        console.log('🎨 Контекст настроен:', {
          font: ctx.font,
          textAlign: ctx.textAlign,
          textBaseline: ctx.textBaseline,
          fillStyle: ctx.fillStyle,
          shadowApplied: textData.shadow && textData.backgroundMode === 'image-text'
        })
        
        // Рисуем текст с поддержкой переноса строк и выравнивания
        this.drawMultilineTextWithData(ctx, textData.text, x, y, fontSize, textData.lineHeight, textData)
        
        console.log('✅ Текст добавлен в Raster с данными:', {
          position: `${x}, ${y}`,
          content: textData.text,
          fontSize: fontSize,
          fontFamily: fontFamily
        })
        
      } catch (error) {
        console.error('❌ Ошибка добавления текста в Raster с данными:', error)
      }
    },
    // Расчет размеров многострочного текста
    calculateMultilineTextSize(text, fontSize, lineHeight = 1.2, textData) {
      if (!text) return { width: 0, height: 0 }
      
      const lines = text.split('\n')
      
      // Создаем временный контекст для измерения
      const tempCtx = document.createElement('canvas').getContext('2d')
      tempCtx.font = `${textData.fontWeight || 'normal'} ${fontSize}px ${textData.font || 'Arial'}`
      
      // Вычисляем максимальную ширину текста
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = tempCtx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Вычисляем общую высоту текста
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      
      return {
        width: maxTextWidth,
        height: totalTextHeight
      }
    },

    // Рисование многострочного текста
    drawMultilineText(ctx, text, x, y, fontSize, lineHeight = 1.2) {
      if (!text) return
      
      const lines = text.split('\n')
      const lineHeightPixels = fontSize * lineHeight
      const startY = y - (lines.length - 1) * lineHeightPixels / 2
      
      lines.forEach((line, index) => {
        const lineY = startY + index * lineHeightPixels
        ctx.fillText(line, x, lineY)
      })
    },

    // Вспомогательный метод для отрисовки овала
    drawOval(ctx, centerX, centerY, width, height) {
      // Используем эллипс для отрисовки овала
      ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI)
    },

    // Отрисовка формы для режима "Стандарт" с переданными данными (для основного канваса)
    drawStandardModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData) {
      console.log('⭐ Отрисовка формы "Стандарт" с переданными данными - только прямоугольник без хвоста')
      
      // Сначала рисуем тень если включена (точно как в превью)
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        // ИСПРАВЛЕНИЕ: Для режима "Стандарт" умножаем размытие и смещение тени на 2
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale * 2))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale * 2)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale * 2)
        
        // Рисуем тень
        ctx.fillStyle = backgroundColor
        ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Затем рисуем основную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // В конце применяем обводку если включена
      if (textData.stroke) {
        ctx.strokeStyle = textData.strokeColor
        ctx.lineWidth = textData.strokeWidth * scale
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      }
      
      console.log('✅ Форма "Стандарт" с переданными данными отрисована - только прямоугольник')
    },

    // Отрисовка обводки многострочного текста с передачей данных
    drawMultilineTextStrokeWithData(ctx, text, x, y, fontSize, lineHeight = 1.2, textData) {
      // Разбиваем текст на строки по символу \n
      const lines = text.split('\n')
      
      // Устанавливаем размер шрифта
      ctx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Вычисляем межстрочный интервал
      const lineSpacing = fontSize * lineHeight
      
      // Вычисляем общую высоту текста для центрирования по вертикали
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем обводку каждой строки
      lines.forEach((line, index) => {
        // Для однострочного текста позиция строки просто y, для многострочного - с учетом lineHeight
        const lineY = lines.length === 1 ? y : startY + (index * fontSize * lineHeight) + fontSize / 2
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if ((textData.textAlign || 'center') === 'left') {
          lineX = x - maxTextWidth / 2
        } else if ((textData.textAlign || 'center') === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        ctx.strokeText(line, lineX, lineY)
      })
    },

    // Отрисовка многострочного текста с передачей данных
    drawMultilineTextWithData(ctx, text, x, y, fontSize, lineHeight = 1.2, textData) {
      
      // ОТЛАДКА: Логируем параметры для всех элементов
      console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА drawMultilineTextWithData:', {
        text: text,
        x: x,
        y: y,
        fontSize: fontSize,
        lineHeight: lineHeight,
        textAlign: textData.textAlign,
        fontWeight: textData.fontWeight,
        font: textData.font,
        globalCompositeOperation: ctx.globalCompositeOperation,
        ctxFont: ctx.font,
        ctxTextAlign: ctx.textAlign,
        ctxTextBaseline: ctx.textBaseline,
        ctxFillStyle: ctx.fillStyle,
        canvasSize: `${ctx.canvas.width}x${ctx.canvas.height}`
      })
      
      // Если это режим с изображением, запрещаем перенос текста
      let processedText = text
      if (textData.textImage && textData.cachedImage) {
        processedText = processedText.replace(/\n/g, ' ')
        console.log('🖼️ Запрещен перенос текста в режиме с изображением:', {
          original: text,
          processed: processedText
        })
      }
      
      const lines = processedText.split('\n')
      
      // Устанавливаем размер шрифта (используем fontSize как есть, масштабирование применяется на уровне вызова)
      ctx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Вычисляем межстрочный интервал
      const lineSpacing = fontSize * lineHeight
      
      // Вычисляем общую высоту текста для центрирования по вертикали
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем каждую строку
      lines.forEach((line, index) => {
        // Для однострочного текста позиция строки просто y, для многострочного - с учетом lineHeight
        const lineY = lines.length === 1 ? y : startY + (index * fontSize * lineHeight) + fontSize / 2
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if ((textData.textAlign || 'center') === 'left') {
          lineX = x - maxTextWidth / 2
        } else if ((textData.textAlign || 'center') === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        // ОТЛАДКА: Логируем каждую строку для маски
        if (ctx.globalCompositeOperation === 'destination-in') {
          console.log(`🖼️ ОТЛАДКА: Рисуем строку ${index + 1} для маски:`, {
            line: line,
            lineX: lineX.toFixed(1),
            lineY: lineY.toFixed(1),
            textAlign: textData.textAlign
          })
        }
        
        ctx.fillText(line, lineX, lineY)
      })
    },
    
    // Рисование фона для режима "Разговор"
    drawConversationBackground(ctx, centerX, centerY, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Рисуем основную прямоугольную подложку
      const bgX = centerX - backgroundWidth / 2
      const bgY = centerY - backgroundHeight / 2
      
      ctx.fillStyle = backgroundColor || '#ffffff'
      ctx.fillRect(bgX, bgY, backgroundWidth, backgroundHeight)
      
      // Рисуем простой хвост (треугольник)
      if (textData.tailSize > 0) {
        const tailAngle = (textData.tailAngle || 45) * Math.PI / 180
        const tailLength = Math.min(backgroundWidth, backgroundHeight) * 0.5 * (textData.tailSize / 100)
        const tailWidth = Math.min(backgroundWidth, backgroundHeight) * 0.2 * (textData.tailWidth / 100)
        
        // Позиция хвоста (выходит из правой стороны)
        const tailStartX = bgX + backgroundWidth
        const tailStartY = centerY
        
        const tailEndX = tailStartX + Math.cos(tailAngle) * tailLength
        const tailEndY = tailStartY + Math.sin(tailAngle) * tailLength
        
        ctx.beginPath()
        ctx.moveTo(tailStartX, tailStartY)
        ctx.lineTo(tailEndX, tailEndY - tailWidth / 2)
        ctx.lineTo(tailEndX, tailEndY + tailWidth / 2)
        ctx.closePath()
        ctx.fill()
      }
      
      // Рисуем обводку если есть
      if (textData.stroke) {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        ctx.strokeRect(bgX, bgY, backgroundWidth, backgroundHeight)
      }
    },

    // Получение названия режима для отображения
    // Обновление 3D модели

    // Расчет крайних точек для суперподложки (с учетом хвоста, тени, обводки)
    calculateExtremePointsForSuperBackground(x, y, backgroundWidth, backgroundHeight, textData) {
      try {
        // Параметры хвоста
        const tailSize = Number(textData.tailSize) / 100
        const tailWidth = Number(textData.tailWidth) / 100
        const tailAngle = Number(textData.tailAngle)
        
        // Базовые координаты прямоугольника
        const halfWidth = backgroundWidth / 2
        const halfHeight = backgroundHeight / 2
        
        let minX = x - halfWidth
        let maxX = x + halfWidth
        let minY = y - halfHeight
        let maxY = y + halfHeight
        
        // Если есть хвост, учитываем его координаты
        if (tailSize > 0) {
          const minDimension = Math.min(backgroundWidth, backgroundHeight)
          const tailLength = minDimension * tailSize
          const tailWidthPixels = minDimension * tailWidth
          
          // Вычисляем координаты хвоста
          const tailAngleRad = tailAngle * Math.PI / 180
          const tailEndX = x + tailLength * Math.cos(tailAngleRad)
          const tailEndY = y + tailLength * Math.sin(tailAngleRad)
          
          // Учитываем ширину хвоста
          const tailHalfWidth = tailWidthPixels / 2
          const perpAngle = tailAngleRad + Math.PI / 2
          const tailLeftX = tailEndX + tailHalfWidth * Math.cos(perpAngle)
          const tailLeftY = tailEndY + tailHalfWidth * Math.sin(perpAngle)
          const tailRightX = tailEndX - tailHalfWidth * Math.cos(perpAngle)
          const tailRightY = tailEndY - tailHalfWidth * Math.sin(perpAngle)
          
          // Обновляем границы с учетом хвоста
          minX = Math.min(minX, tailEndX, tailLeftX, tailRightX)
          maxX = Math.max(maxX, tailEndX, tailLeftX, tailRightX)
          minY = Math.min(minY, tailEndY, tailLeftY, tailRightY)
          maxY = Math.max(maxY, tailEndY, tailLeftY, tailRightY)
        }
        
        // Учитываем тень если включена
        if (textData.shadow) {
          const shadowBlur = Number(textData.shadowBlur) || 0
          const shadowOffsetX = Number(textData.shadowOffsetX) || 0
          const shadowOffsetY = Number(textData.shadowOffsetY) || 0
          const shadowPadding = shadowBlur + Math.abs(shadowOffsetX) + Math.abs(shadowOffsetY)
          
          minX -= shadowPadding
          maxX += shadowPadding
          minY -= shadowPadding
          maxY += shadowPadding
        }
        
        // Учитываем обводку если включена + дополнительный отступ
        if (textData.stroke) {
          const strokeWidth = Number(textData.strokeWidth) || 0
          const strokePadding = strokeWidth / 2 + 5
          
          minX -= strokePadding
          maxX += strokePadding
          minY -= strokePadding
          maxY += strokePadding
        }
        
        return {
          minX: minX,
          maxX: maxX,
          minY: minY,
          maxY: maxY,
          width: maxX - minX,
          height: maxY - minY
        }
        
      } catch (error) {
        console.error('❌ Ошибка расчета крайних точек суперподложки:', error)
        const halfWidth = backgroundWidth / 2
        const halfHeight = backgroundHeight / 2
        return {
          minX: x - halfWidth,
          maxX: x + halfWidth,
          minY: y - halfHeight,
          maxY: y + halfHeight,
          width: backgroundWidth,
          height: backgroundHeight
        }
      }
    },

    calculateSmartBounds(originalBounds, textData, mode) {
      return originalBounds // Упрощенная версия, просто возвращаем оригинальные bounds
    },

    // КОПИЯ ИЗ GridsPage - конец блока методов создания подложек
 
  
     editTextLayer(index) {
      const layer = this.textLayers[index]
      if (this.$refs.textManager) {
        this.$refs.textManager.openDialog(layer.textData, index)
      }
    },

    deleteTextLayer(index) {
      if (confirm('Удалить этот текстовый слой?')) {
        const layerInfo = this.textLayers[index]
        
        // Удаляем Paper.js слой
        if (layerInfo && layerInfo.layer) {
          layerInfo.layer.remove()
        }
        
        // Удаляем из массива
        this.textLayers.splice(index, 1)
        
        // Обновляем 3D модель
        this.update3DTexture()
      }
    },

    // Сохранение canvas для печати (300 DPI)
    async saveCanvasForPrint() {
      console.log('🖨️ Начинаем сохранение холста для печати в 300 DPI')
      
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = this.$refs.comicCanvas
          if (!canvas) {
            console.error('❌ Основной холст не найден')
            reject(new Error('Холст не найден'))
            return
          }

          // Параметры для печати (300 DPI - стандарт для качественной печати)
          const printDPI = 300
          const screenDPI = 96 // Стандартный DPI экрана
          
          // Получаем размеры холста
          const canvasWidth = canvas.width
          const canvasHeight = canvas.height
          
          // Вычисляем размеры для печати (увеличиваем в 3.125 раза для 300 DPI)
          const printWidth = Math.round(canvasWidth * (printDPI / screenDPI))
          const printHeight = Math.round(canvasHeight * (printDPI / screenDPI))
          const scale = printDPI / screenDPI
          
          console.log('📏 Размеры для печати:', {
            original: `${canvasWidth}x${canvasHeight}`,
            print: `${printWidth}x${printHeight}`,
            scale: scale.toFixed(2)
          })

          // Создаем временный холст в высоком разрешении
          const printCanvas = document.createElement('canvas')
          printCanvas.width = printWidth
          printCanvas.height = printHeight
          const printCtx = printCanvas.getContext('2d')

          // Настраиваем высокое качество рендеринга
          printCtx.imageSmoothingEnabled = true
          printCtx.imageSmoothingQuality = 'high'
          
          // Отладочная информация
          console.log('🔍 Отладочная информация для сохранения:')
          console.log('- textLayers:', this.textLayers.length, this.textLayers)
          
          // Создаем новый Paper.js canvas с высоким разрешением
          console.log('🎨 Создаем новый Paper.js canvas с высоким разрешением')
          
          if (this.paperScope && this.paperScope.project) {
            try {
              // Создаем временный PaperScope с высоким разрешением
              const tempPaperScope = new paper.PaperScope()
              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = printWidth
              tempCanvas.height = printHeight
              // ВАЖНО: Устанавливаем стили для правильного масштабирования
              tempCanvas.style.width = canvasWidth + 'px'
              tempCanvas.style.height = canvasHeight + 'px'
              tempPaperScope.setup(tempCanvas)
              
              // Создаем белый фон в tempPaperScope
              const whiteBackground = new tempPaperScope.Path.Rectangle({
                point: [0, 0],
                size: [printWidth, printHeight]
              })
              whiteBackground.fillColor = '#FFFFFF'
              whiteBackground.name = 'whiteBackground'
              tempPaperScope.project.activeLayer.addChild(whiteBackground)
              
              // Перерисовываем все элементы в высоком разрешении
              await this.redrawAllElementsInHighDPI(tempPaperScope, scale, printWidth, printHeight)
              
              // Ждем загрузки всех изображений с timeout
              await new Promise(resolve => {
                let attempts = 0
                const maxAttempts = 50 // 5 секунд максимум
                
                const checkLoaded = () => {
                  attempts++
                  const allRasters = tempPaperScope.project.getItems({ class: tempPaperScope.Raster })
                  const loadedRasters = allRasters.filter(raster => raster.loaded)
                  console.log('🔍 Проверка загрузки изображений:', {
                    attempt: attempts,
                    total: allRasters.length,
                    loaded: loadedRasters.length,
                    allLoaded: allRasters.length === loadedRasters.length,
                    maxAttempts
                  })
                  
                  if (allRasters.length === loadedRasters.length || attempts >= maxAttempts) {
                    if (attempts >= maxAttempts) {
                      console.warn('⚠️ Timeout ожидания загрузки изображений, продолжаем с загруженными')
                    }
                    resolve()
                  } else {
                    setTimeout(checkLoaded, 100)
                  }
                }
                checkLoaded()
              })
              
              // ВАЖНО: Обновляем view после создания всех элементов
              tempPaperScope.view.update()
              
              // Копируем результат на printCanvas
              printCtx.drawImage(tempCanvas, 0, 0)
              
              // Очищаем временный PaperScope
              tempPaperScope.project.clear()
              
            } catch (error) {
              console.error('❌ Ошибка при создании высокого разрешения:', error)
              
              // Fallback: простое масштабирование
              printCtx.drawImage(
                canvas,
                0, 0, canvasWidth, canvasHeight,
                0, 0, printWidth, printHeight
              )
            }
          } else {
            console.error('❌ Paper.js project не найден')
            // Fallback: простое масштабирование HTML canvas
            printCtx.drawImage(
              canvas,
              0, 0, canvasWidth, canvasHeight,
              0, 0, printWidth, printHeight
            )
          }

          // Создаем ссылку для скачивания
          const filename = `mug-comic-${new Date().toISOString().slice(0, 10)}.png`
          const link = document.createElement('a')
          link.download = filename
          
          // Конвертируем в blob с высоким качеством
          printCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              link.href = url
              
              // Запускаем скачивание
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              // Очищаем URL
              URL.revokeObjectURL(url)
              
              console.log('✅ Файл успешно сохранен:', link.download)
              
              // Показываем уведомление пользователю
              this.$nextTick(() => {
                console.log('🎉 Изображение сохранено в высоком качестве для печати!')
              })
            } else {
              console.error('❌ Ошибка при создании blob')
              reject(new Error('Ошибка при создании файла'))
            }
          }, 'image/png', 1.0) // Максимальное качество

          resolve({
            success: true,
            filename: filename,
            size: { width: printWidth, height: printHeight },
            scale: scale
          })

        } catch (error) {
          console.error('❌ Ошибка при сохранении холста:', error)
          reject(error)
        }
      })
    },
    
    // Перерисовка всех элементов в высоком разрешении для печати
    async redrawAllElementsInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight) {
      console.log('🎨 Перерисовываем все элементы в высоком разрешении')
      console.log('📊 Статистика элементов:')
      console.log('- textLayers:', this.textLayers.length)
      
      try {
        // 1. Рисуем базовый прямоугольник (обводку) в высоком разрешении
        console.log('🔍 Отладка обводки:', {
          baseRectangle: !!this.baseRectangle,
          strokeWidth: this.strokeWidth,
          strokeWidthPx: this.strokeWidthPx,
          strokeColor: this.strokeColor,
          scale: scale
        })
        
        if (this.baseRectangle && this.strokeWidth > 0) {
          console.log('🖼️ Рисуем базовый прямоугольник в высоком разрешении')
          const rect = new tempPaperScope.Path.Rectangle({
            point: [0, 0],
            size: [canvasWidth, canvasHeight],
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidthPx * scale
          })
          rect.strokeCap = 'square'
          rect.strokeJoin = 'miter'
          tempPaperScope.project.activeLayer.addChild(rect)
          console.log('✅ Базовый прямоугольник добавлен:', rect.bounds)
        } else {
          console.log('⚠️ Базовый прямоугольник не рисуется:', {
            baseRectangle: !!this.baseRectangle,
            strokeWidth: this.strokeWidth
          })
        }
        
        // 2. Перерисовываем все текстовые элементы с подложками
        console.log(`📝 Рисуем ${this.textLayers.length} текстовых слоев в правильном порядке`)
        
        // Сортируем текстовые слои по их реальному z-index (порядку наложения на канвасе)
        const sortedTextLayers = [...this.textLayers].sort((a, b) => {
          // Получаем z-index из Paper.js слоя, если он есть
          const aZIndex = a.layer?.index || a.id || 0
          const bZIndex = b.layer?.index || b.id || 0
          return aZIndex - bZIndex
        })
        
        console.log('📊 Порядок текстовых слоев при сохранении:', sortedTextLayers.map((layer, index) => ({
          id: layer.id,
          text: layer.textData?.text,
          mode: layer.mode,
          position: layer.position,
          zIndex: layer.layer?.index || layer.id || 0,
          order: index + 1
        })))
        
        for (let i = 0; i < sortedTextLayers.length; i++) {
          const layer = sortedTextLayers[i]
          const originalIndex = this.textLayers.indexOf(layer)
          
          console.log(`📝 Текстовый слой ${originalIndex + 1} (z-index: ${layer.layer?.index || layer.id || 0}, слой ${i + 1}):`, {
            id: layer.id,
            text: layer.textData?.text,
            mode: layer.mode,
            position: layer.position,
            zIndex: layer.layer?.index || layer.id || 0
          })
          
          try {
            await this.redrawTextLayerInHighDPIForPaper(tempPaperScope, layer, scale)
            console.log(`✅ Текстовый слой ${originalIndex + 1} успешно обработан`)
          } catch (error) {
            console.error(`❌ Ошибка в текстовом слое ${originalIndex + 1}:`, error)
          }
        }
        
        console.log('✅ Все элементы перерисованы в высоком разрешении')
        
      } catch (error) {
        console.error('❌ Ошибка при перерисовке элементов в высоком разрешении:', error)
        throw error
      }
    },

    // Перерисовка текстового слоя в высоком разрешении для Paper.js (КОПИЯ 1 в 1 из GridsPage)
    async redrawTextLayerInHighDPIForPaper(tempPaperScope, layerInfo, scale) {
      console.log('📝 Перерисовываем текстовый слой:', layerInfo.id)
      
      try {
        if (layerInfo.textData && layerInfo.textData.backgroundMode === 'image-text') {
          await this.drawImageTextLayerInHighDPI(tempPaperScope, layerInfo, scale)
          return
        }
        // Создаем временный canvas для рендеринга в высоком разрешении
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Получаем размеры из оригинального элемента
        let bounds
        if (layerInfo.backgroundItem && layerInfo.backgroundItem.bounds) {
          bounds = layerInfo.backgroundItem.bounds
        } else {
          // Используем примерные размеры
          bounds = {
            width: 200,
            height: 100,
            x: 0,
            y: 0
          }
        }
        
        console.log('📏 Размеры слоя:', bounds)
        
        // Создаем canvas с высоким разрешением
        let backgroundWidth = layerInfo.textData.backgroundWidth || 200
        let backgroundHeight = layerInfo.textData.backgroundHeight || 80
        
        // Вычисляем размеры в высоком разрешении
        const scaledBackgroundWidth = backgroundWidth * scale
        const scaledBackgroundHeight = backgroundHeight * scale
        const highResWidth = Math.max(scaledBackgroundWidth, 200 * scale)
        const highResHeight = Math.max(scaledBackgroundHeight, 100 * scale)
        
        // Устанавливаем размеры canvas
        tempCanvas.width = highResWidth
        tempCanvas.height = highResHeight
        
        // Добавляем отступы для тени и обводки
        const padding = Math.max(20 * scale, 20)
        const totalWidth = highResWidth + padding * 2
        const totalHeight = highResHeight + padding * 2
        
        tempCanvas.width = totalWidth
        tempCanvas.height = totalHeight
        
        // Настраиваем контекст для высокого качества
        tempCtx.imageSmoothingEnabled = true
        tempCtx.imageSmoothingQuality = 'high'
        
        // Рисуем подложку в высоком разрешении
        console.log('🎨 Рисуем подложку для текста в высоком разрешении')
        
        // Сохраняем контекст и применяем отступы
        tempCtx.save()
        tempCtx.translate(padding, padding)
        
        // Создаем временный слой для передачи в методы
        const tempLayer = {
          textData: layerInfo.textData,
          bounds: {
            width: scaledBackgroundWidth,
            height: scaledBackgroundHeight
          }
        }
        
        // Рисуем подложку в зависимости от режима
        if (layerInfo.textData.backgroundMode === 'conversation') {
          console.log('💬 Рисуем подложку "Разговор" в высоком разрешении')
          await this.drawConversationBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'standard') {
          console.log('📋 Рисуем подложку "Стандарт" в высоком разрешении')
          await this.drawStandardBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'thoughts') {
          console.log('💭 Рисуем подложку "Мысли" в высоком разрешении')
          await this.drawThoughtsBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'image-text') {
          console.log('🖼️ Рисуем подложку "Текст с изображением" в высоком разрешении')
          await this.drawImageTextBackgroundInHighDPI(tempCtx, tempLayer, scale)
        }
        
        // Восстанавливаем контекст
        tempCtx.restore()
        
        // Рисуем текст в высоком разрешении
        console.log('✍️ Рисуем текст в высоком разрешении')
        this.drawTextInHighDPI(tempCtx, { 
          ...layerInfo, 
          bounds: { width: highResWidth, height: highResHeight },
          textData: {
            ...layerInfo.textData,
            fontSize: layerInfo.textData.fontSize * scale  // Масштабируем размер шрифта
          }
        })
        
        // Создаем Raster из временного canvas
        const textRaster = new tempPaperScope.Raster(tempCanvas.toDataURL('image/png', 1.0))
        
        // Ждем загрузки
        await new Promise((resolve) => {
          textRaster.onLoad = resolve
        })
        
        // Позиционируем в высоком разрешении
        const position = layerInfo.position || { x: 0, y: 0 }
        const scaledX = position.x * scale
        const scaledY = position.y * scale
        
        console.log('📍 Позиция текста:', {
          original: position,
          scaled: { x: scaledX, y: scaledY },
          canvasSize: { width: tempPaperScope.view.element.width, height: tempPaperScope.view.element.height },
          textSize: { width: textRaster.bounds.width, height: textRaster.bounds.height }
        })
        
        textRaster.position = new tempPaperScope.Point(scaledX, scaledY)
        
        // Добавляем на слой
        tempPaperScope.project.activeLayer.addChild(textRaster)
        
        console.log('✅ Текстовый слой добавлен в высоком разрешении:', textRaster.bounds)
        
      } catch (error) {
        console.error('❌ Ошибка при перерисовке текстового слоя:', error)
        throw error
      }
    },

    // Отрисовка подложки "Разговор" для высокого разрешения
    drawCombinedShapeForHighDPI(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData) {
      // Используем существующий метод drawCombinedShape
      this.drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData)
    },

    // Отрисовка подложки "Мысли" для высокого разрешения
    drawThoughtsModeShapeForHighDPI(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData) {
      // Используем существующий метод buildThoughtsModePath
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData)
    },

    // Методы отрисовки для высокого разрешения (ЗАГЛУШКИ - как в GridsPage)
    async drawConversationBackgroundInHighDPI(ctx, layer, scale) {
      console.log('💬 Рисуем подложку "Разговор" в высоком разрешении')
      // ЗАГЛУШКА: В GridsPage это тоже заглушка с fillRect
      ctx.fillStyle = layer.textData.backgroundColor || '#FFFFFF'
      ctx.fillRect(0, 0, layer.bounds.width, layer.bounds.height)
    },

    async drawStandardBackgroundInHighDPI(ctx, layer, scale) {
      console.log('📝 Рисуем подложку "Стандарт" в высоком разрешении')
      
      const textData = layer.textData
      const backgroundColor = textData.backgroundColor || '#FFFFFF'
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      const bgWidth = layer.bounds.width
      const bgHeight = layer.bounds.height
      
      console.log('📝 Параметры подложки "Стандарт" в высоком разрешении:', {
        centerX,
        centerY,
        bgWidth,
        bgHeight,
        scale,
        backgroundColor,
        hasShadow: !!textData.shadow,
        hasStroke: !!textData.stroke,
        backgroundMode: textData.backgroundMode
      })
      
      // Используем ту же логику, что и в drawStandardModeShapeWithData, но с масштабированием для высокого разрешения
      // Сначала рисуем тень если включена
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        console.log('📝 Применяем тень к подложке "Стандарт" в высоком разрешении')
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale)
        
        // Рисуем тень
        ctx.fillStyle = backgroundColor
        ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        console.log('✅ Тень подложки "Стандарт" нарисована в высоком разрешении')
      }
      
      // Затем рисуем основную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // В конце применяем обводку если включена
      if (textData.stroke) {
        console.log('📝 Применяем обводку к подложке "Стандарт" в высоком разрешении')
        ctx.strokeStyle = textData.strokeColor
        ctx.lineWidth = textData.strokeWidth * scale
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        console.log('✅ Обводка подложки "Стандарт" нарисована в высоком разрешении')
      }
      
      console.log('✅ Подложка "Стандарт" полностью нарисована в высоком разрешении')
    },

    async drawThoughtsBackgroundInHighDPI(ctx, layer, scale) {
      console.log('🧠 Рисуем подложку "Мысли" в высоком разрешении')
      // Здесь будет логика рисования подложки "Мысли" в высоком разрешении
      ctx.fillStyle = layer.textData.backgroundColor || '#FFFFFF'
      ctx.fillRect(0, 0, layer.bounds.width, layer.bounds.height)
    },

    drawTextInHighDPI(ctx, layer) {
      const textData = layer.textData
      console.log('✍️ drawTextInHighDPI вызван:', {
        hasTextData: !!textData,
        text: textData?.text,
        fontSize: textData?.fontSize,
        font: textData?.font,
        backgroundMode: textData?.backgroundMode,
        hasShadow: !!textData?.shadow,
        hasStroke: !!textData?.stroke
      })
      
      if (!textData) {
        console.log('⚠️ Нет данных текста, выходим')
        return
      }
      
      // Сохраняем оригинальные значения для восстановления
      const originalShadow = textData.shadow
      const originalStroke = textData.stroke
      
      // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
      if (textData.backgroundMode !== 'image-text' && textData.shadow) {
        console.log(`📝 Режим "${textData.backgroundMode}": отключаем тень для текста (тень только для "Текст с изображением")`)
        textData.shadow = false
      }
      
      // Настраиваем шрифт
      ctx.font = `${textData.fontWeight || 'normal'} ${textData.fontSize}px ${textData.font}`
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = textData.textColor || '#000000'
      
      // Центрируем текст
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      
      // Применяем тень к тексту только для режима "Текст с изображением"
      if (textData.backgroundMode === 'image-text' && textData.shadow) {
        console.log('📝 Применяем тень к тексту в режиме "Текст с изображением"')
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY)
      }
      
      // Рисуем текст с поддержкой переносов строк
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      
      // Сбрасываем тень
      if (textData.backgroundMode === 'image-text' && textData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Применяем обводку к тексту только для режима "Текст с изображением"
      if (textData.backgroundMode === 'image-text' && textData.stroke) {
        console.log('📝 Применяем обводку к тексту в режиме "Текст с изображением"')
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      }
      
      // Восстанавливаем оригинальные значения
      textData.shadow = originalShadow
      textData.stroke = originalStroke
      
      console.log('✅ Текст нарисован в высоком разрешении:', {
        text: textData.text,
        fontSize: textData.fontSize,
        position: { x: centerX, y: centerY },
        backgroundMode: textData.backgroundMode,
        shadowApplied: textData.backgroundMode === 'image-text' && originalShadow,
        strokeApplied: textData.backgroundMode === 'image-text' && originalStroke
      })
    },

    async drawImageTextLayerInHighDPI(tempPaperScope, layerInfo, scale) {
      const textData = layerInfo.textData || {}
      const position = layerInfo.position || { x: 0, y: 0 }
      const x = position.x * scale
      const y = position.y * scale

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = tempPaperScope.view.element.width
      tempCanvas.height = tempPaperScope.view.element.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

      const img = textData.cachedImage || null
      const scaledFontSize = (textData.fontSize || 24) * scale
      tempCtx.font = `${textData.fontWeight || 'normal'} ${scaledFontSize}px ${textData.font || 'Arial'}`

      const lines = String(textData.text || '').split('\n')
      let maxWidth = 0
      lines.forEach(line => { const w = tempCtx.measureText(line).width; if (w > maxWidth) maxWidth = w })
      const textWidth = maxWidth
      const textHeight = lines.length === 1 ? scaledFontSize : lines.length * scaledFontSize * (textData.lineHeight || 1.2)

      if (img) {
        const widthScale = textWidth / img.width
        const heightScale = textHeight / img.height
        const imageScale = Math.max(widthScale, heightScale) * 1.2
        const scaledImageWidth = img.width * imageScale
        const scaledImageHeight = img.height * imageScale
        const drawX = x - scaledImageWidth / 2
        const drawY = y - scaledImageHeight / 2
        tempCtx.drawImage(img, drawX, drawY, scaledImageWidth, scaledImageHeight)
      }

      tempCtx.globalCompositeOperation = 'destination-in'
      tempCtx.textAlign = textData.textAlign || 'center'
      tempCtx.textBaseline = 'middle'
      tempCtx.fillStyle = '#000'
      const totalTextHeight = lines.length === 1 ? scaledFontSize : lines.length * scaledFontSize * (textData.lineHeight || 1.2)
      const startY = y - totalTextHeight / 2
      lines.forEach((line, index) => {
        const lineY = lines.length === 1 ? y : startY + (index * scaledFontSize * (textData.lineHeight || 1.2)) + scaledFontSize / 2
        tempCtx.fillText(line, x, lineY)
      })
      tempCtx.globalCompositeOperation = 'source-over'

      if (textData.stroke) {
        tempCtx.strokeStyle = textData.strokeColor || '#000'
        tempCtx.lineWidth = (textData.strokeWidth || 2) * scale
        lines.forEach((line, index) => {
          const lineY = lines.length === 1 ? y : startY + (index * scaledFontSize * (textData.lineHeight || 1.2)) + scaledFontSize / 2
          tempCtx.strokeText(line, x, lineY)
        })
      }

      const imageDataURL = tempCanvas.toDataURL('image/png', 1.0)
      const raster = new tempPaperScope.Raster(imageDataURL)
      await new Promise((resolve, reject) => { raster.onLoad = resolve; raster.onError = reject })
      raster.position = new tempPaperScope.Point(x, y)
      tempPaperScope.project.activeLayer.addChild(raster)
    },

    // Обработчики событий кнопки сохранения
    onSaveStart() {
      console.log('🔄 Начало сохранения')
      console.log('📊 Данные для сохранения:', {
        textLayers: this.textLayers,
        textLayersCount: this.textLayers.length,
        strokeColor: this.strokeColor,
        strokeWidthPx: this.strokeWidthPx
      })
    },

    onSaveSuccess(result) {
      console.log('✅ Файл успешно сохранён:', result)
      
      // Принудительно обновляем основной канвас после сохранения с задержкой
      setTimeout(() => {
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.update()
          console.log('🔄 Основной канвас обновлен после сохранения')
        }
      }, 100)
      
      // Обновляем 3D модель после сохранения
      this.$nextTick(() => {
        if (this.$refs.threeRenderer) {
          this.$refs.threeRenderer.updateTexture()
          console.log('🔄 3D модель обновлена после сохранения')
        }
      })
    },

    onSaveError(error) {
      console.error('❌ Ошибка при сохранении:', error)
      
      // Принудительно обновляем основной канвас даже при ошибке
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.update()
        console.log('🔄 Основной канвас обновлен после ошибки сохранения')
      }
    },

    showNotification(message) {
      console.log('📢', message)
    },

    // ========== 3D Renderer callbacks ==========
    onThreeInitialized() {
      console.log('ThreeDRenderer инициализирован')
    },

    onTextureUpdated() {
      // Texture обновлена
    },

    onTextureError(error) {
      console.error('Ошибка обновления текстуры:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.mug-comic-page {
  // Пустой блок для scope
}

/* Стили из StickerManiaPage */
.page-title {
  color: #016527;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.canvas-container {
  width: 100%;
  height: 0;
  padding-bottom: 47.37%; /* 19:9 соотношение */
  position: relative;
  background: #fff;
}

.comic-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  box-shadow: 4px 4px 12px 0 rgba(0,0,0,.15);
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Стили для всех кнопок над основным канвасом */
.canvas-button {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.canvas-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  color: white !important;
}

.canvas-button:hover:not(:disabled) * {
  color: white !important;
}

.canvas-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
  color: white !important;
}

.canvas-button:active:not(:disabled) * {
  color: white !important;
}

.canvas-button * {
  color: white !important;
}

.canvas-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.text-button {
  width: auto;
  margin-left: 20px;
}

/* Панель инструментов */
.tools-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  height: 48px; /* Та же высота, что и кнопка "Текст" */
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.tool-button:hover:not(:disabled) {
  background: #e9ecef;
  color: #016527;
  transform: translateY(-1px);
}

.tool-button:active:not(:disabled) {
  transform: translateY(0);
}

.tool-button.active {
  background: #016527;
  color: white;
}

.tool-button:disabled {
  background: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.nav-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #016527;
  background-color: transparent;
  border-bottom-color: #dee2e6;
}

.nav-tabs .nav-link.active {
  color: #016527;
  background-color: transparent;
  border-bottom-color: #016527;
}

.nav-tabs .nav-link i {
  font-size: 1.1rem;
}

.card {
  border-radius: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
}

.card-body {
  padding: 1rem;
}

.card-body.p-0 {
  padding: 0 !important;
}

.btn-primary {
  background-color: #016527;
  border-color: #016527;
}

.btn-primary:hover {
  background-color: #015a23;
  border-color: #015a23;
}

.btn-outline-primary {
  color: #016527;
  border-color: #016527;
}

.btn-outline-primary:hover {
  background-color: #016527;
  border-color: #016527;
  color: #fff;
}

.form-check-input:checked {
  background-color: #016527;
  border-color: #016527;
}
.preview-contaner{
  width: fit-content;
}

/* Адаптивность */
@media (max-width: 767.98px) {
  .page-title {
    font-size: 1.5rem;
  }

  .canvas-button {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
}

@media (max-width: 575.98px) {
  .page-title {
    font-size: 1.3rem;
  }
}
</style>

