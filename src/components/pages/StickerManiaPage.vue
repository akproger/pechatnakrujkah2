<template>
  <div class="sticker-mania-page">
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
                <!-- Кнопка генерации стикеров -->
                <div class="col" style="padding: 0;">
                  <button 
                    @click="generateOptimalStickers" 
                    class="btn btn-primary"
                    :disabled="isLoading"
                    style="background-color: #007bff; border-color: #007bff;"
                  >
                    <i class="bi bi-lightning-fill me-2"></i>
                    {{ isLoading ? 'Генерация...' : 'Сгенерировать стикеры' }}
                  </button>
                  

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
        
        <!-- 3D превью кружки -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body p-0">
              <ThreeDRenderer 
                ref="threeRenderer"
                :source-canvas="$refs.testCanvas"
                :auto-update="true"
                :rotation-speed="0.01"
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
          <ul class="nav nav-tabs" id="stickerTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'shapes' }"
                id="shapes-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#shapes" 
                type="button" 
                role="tab" 
                aria-controls="shapes" 
                aria-selected="activeTab === 'shapes'"
                @click="activeTab = 'shapes'"
              >
                <i class="bi bi-shapes me-2"></i>
                Формы стикеров
              </button>
            </li>
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
      <div class="tab-content" id="stickerTabContent">
        <!-- Таб "Формы стикеров" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'shapes' }" id="shapes" role="tabpanel" aria-labelledby="shapes-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">

                  <div class="row g-3">
                    <div v-for="(mask, index) in stickerMasks" :key="index" class="col-md-3 col-sm-4 col-6">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="'mask-' + index"
                          v-model="mask.selected"
                          @change="handleMaskChange(index, $event)"
                        >
                        <label class="form-check-label d-flex align-items-center" :for="'mask-' + index">
                          <img :src="mask.url" :alt="mask.name" style="width: 24px; height: 24px; margin-right: 8px;">
                          {{ mask.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Таб "Изображения" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'images' }" id="images" role="tabpanel" aria-labelledby="images-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
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
                    class="btn"
                    :disabled="uploadedImages.length >= 5"
                    style="background-color: #0d6efd; border: none; color: white;"
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
                    <div class="row g-2">
                      <div v-for="(image, index) in uploadedImages" :key="index" class="col-md-6">
                        <div class="d-flex align-items-center p-2 border rounded">
                          <div class="form-check me-2">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              :id="'use-image-' + index"
                              v-model="image.useInStickers"
                              @change="generateOptimalStickers"
                            >
                          </div>
                          <img :src="image.url" :alt="image.name" style="width: 40px; height: 40px; object-fit: cover; margin-right: 8px;">
                          <span class="flex-grow-1 text-truncate">{{ image.name }}</span>
                          <button 
                            @click="removeImage(index)" 
                            class="btn btn-sm btn-outline-danger"
                            style="background-color: #6c757d; border: none; color: white;"
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

        <!-- Таб "Настройки" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'settings' }" id="settings" role="tabpanel" aria-labelledby="settings-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <!-- Обводка -->
                    <div class="col-md-6">
                      <h6 class="text-muted mb-3">Обводка</h6>
                      <div class="form-group">
                        <label class="form-label">Цвет обводки</label>
                        <input 
                          type="color" 
                          class="form-control form-control-color" 
                          v-model="strokeColor"
                          @change="generateOptimalStickers"
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
                          @input="updateStickerStyles"
                        >
                      </div>
                    </div>
                    
                    <!-- Тень -->
                    <div class="col-md-6">
                      <h6 class="text-muted mb-3">Тень</h6>
                      <div class="form-group">
                        <label class="form-label">Размытие тени: {{ shadowBlur }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="shadowBlur"
                          min="0" 
                          max="50" 
                          step="1"
                          @input="updateStickerStyles"
                        >
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Смещение по X: {{ shadowOffsetX }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="shadowOffsetX"
                          min="-50" 
                          max="50" 
                          step="1"
                          @input="updateStickerStyles"
                        >
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Смещение по Y: {{ shadowOffsetY }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="shadowOffsetY"
                          min="-50" 
                          max="50" 
                          step="1"
                          @input="updateStickerStyles"
                        >
                      </div>
                      
                      <div class="form-group mt-2">
                        <label class="form-label">Прозрачность тени: {{ shadowOpacity }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="shadowOpacity"
                          min="0" 
                          max="100" 
                          step="1"
                          @input="updateStickerStyles"
                        >
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
import { markRaw } from 'vue'
import ThreeDRenderer from '../ThreeDRenderer.vue'
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
    ThreeDRenderer
  },
  data() {
    return {
      // Paper.js
      paperScope: null,
      maskItems: {},
      whiteOverlayLayer: null,
      isLoading: false,
      activeTab: 'shapes',
      
      // Маски стикеров
      stickerMasks: [
        { name: 'Сердце', url: heartMask, selected: false },
        { name: 'Ракета', url: rocketMask, selected: false },
        { name: 'Облачко', url: blabMask, selected: false },
        { name: 'Треугольник', url: trangleMask, selected: false },
        { name: 'Октагон', url: octaGoneMask, selected: false },
        { name: 'Форма 2', url: form2Mask, selected: false },
        { name: 'Форма 1', url: form1Mask, selected: false },
        { name: 'Квадрат', url: squadMask, selected: false },
        { name: 'Звезда 6', url: star6Mask, selected: false },
        { name: 'Шестигранник', url: sixGoneMask, selected: false },
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
      
      // Стикеры
      stickers: [],
      coveragePercentage: 0,
      // Настройки генерации
      minStickerSize: 50, // Минимальный размер стикера (50% от базового)
      maxStickerSize: 150, // Максимальный размер стикера (150% от базового)
      baseStickerSize: 100, // Базовый размер стикера
      targetCoverage: 100, // Целевое покрытие в процентах (100%)
      maxIterations: 2000, // Максимальное количество попыток размещения
      overlapThreshold: 0.05 // Максимальное перекрытие (5%) - уменьшаем для более плотного размещения
    }
  },
  mounted() {
    console.log('🚀 Компонент смонтирован')
    this.$nextTick(() => {
      console.log('🔄 DOM обновлен')
      // Даем больше времени на рендеринг DOM
      setTimeout(async () => {
        console.log('⏰ Таймаут истек, начинаем инициализацию')
        
        // Проверяем, что канвас существует
        const canvas = this.$refs.testCanvas
        if (!canvas) {
          console.log('❌ Канвас не найден после таймаута')
          return
        }
        console.log('✅ Канвас найден:', canvas)
        
        // Инициализируем Paper.js
        await this.initPaper()
        // Three.js теперь инициализируется через компонент ThreeDRenderer
      }, 200)
    })
  },
  beforeUnmount() {
    // Three.js ресурсы очищаются автоматически в компоненте ThreeDRenderer
    
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleCanvasResize)
    // Очищаем все обработчики resize
    window.removeEventListener('resize', () => {})
  },
  methods: {
    // Инициализация Paper.js
    async initPaper() {
      const canvas = this.$refs.testCanvas
      if (!canvas) {
        console.log('❌ Канвас не найден при инициализации')
        return
      }
      
      console.log('🎨 Инициализация Paper.js')
      
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Устанавливаем размер канваса
      this.resizeCanvas()
      
      // Создаем белый слой-прослойку при инициализации
      await this.createWhiteOverlayLayer()
      
      // Добавляем обработчик изменения размера окна с debounce
      let resizeTimeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          this.handleCanvasResize()
        }, 100)
      })
      
      console.log('✅ Paper.js инициализирован')
    },
    

    
    // Обработчик изменения размера окна
    async handleCanvasResize() {
      if (this.paperScope) {
        console.log('🔄 Изменение размера окна - обновляем канвас')
        this.resizeCanvas()
        await this.updateCanvasContent()
      }
    },
    
    // Изменение размера канваса
    resizeCanvas() {
      const canvas = this.$refs.testCanvas
      if (!canvas) {
        console.log('⚠️ Канвас не найден')
        return
      }
      
      if (!this.paperScope) {
        console.log('⚠️ PaperScope не инициализирован')
        return
      }
      
      // Получаем размер контейнера (.canvas-container)
      const container = canvas.parentElement
      if (!container) {
        console.log('⚠️ Контейнер не найден')
        return
      }
      
      const containerWidth = container.clientWidth
      const containerHeight = (containerWidth * 9) / 19
      
      console.log('📏 Размеры контейнера:', containerWidth, 'x', containerHeight)
      
      // Устанавливаем размеры канваса
      canvas.width = containerWidth
      canvas.height = containerHeight
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      

      
      // Обновляем размер view в Paper.js
      this.paperScope.view.viewSize = new this.paperScope.Size(containerWidth, containerHeight)
      
      console.log('📐 Канвас изменен:', containerWidth, 'x', containerHeight)
    },
    
    // Обновление содержимого канваса при изменении размера
    async updateCanvasContent() {
      if (!this.paperScope) return
      
      // Скрываем все большие растры при изменении размера
      this.paperScope.project.activeLayer.children.forEach(child => {
        if (child.className === 'Raster' && child.bounds && 
            (child.bounds.width > 500 || child.bounds.height > 500)) {
          console.log('👁️ Скрываем большой растр при изменении размера:', child.bounds)
          child.visible = false
        }
      })
      
      // Пересчитываем позиции всех масок
      Object.keys(this.maskItems).forEach(maskName => {
        const maskItem = this.maskItems[maskName]
        if (maskItem && maskItem.parent) {
          // Получаем новые размеры канваса
          const canvasWidth = this.paperScope.view.viewSize.width
          const canvasHeight = this.paperScope.view.viewSize.height
          
          // Пересчитываем позицию (центр канваса)
          const newX = canvasWidth * 0.5
          const newY = canvasHeight * 0.5
          
          // Обновляем позицию группы маски
          maskItem.position = new this.paperScope.Point(newX, newY)
        }
      })
      
      // Пересоздаем белый слой-прослойку
      await this.createWhiteOverlayLayer()
      
      // Перерисовываем канвас
      this.paperScope.view.draw()
    },
    

    
    // Обработчик изменения чекбокса маски
    handleMaskChange(index, event) {
      const mask = this.stickerMasks[index]
      mask.selected = event.target.checked
      
      // НЕ обновляем канвас при выборе масок - только сохраняем состояние
      console.log(`🎭 Маска "${mask.name}" ${mask.selected ? 'выбрана' : 'отменена'}`)
    },
    
    // Добавить маску на канвас
    addMaskToCanvas(mask) {
      if (!this.paperScope) return Promise.resolve()
      
      return new Promise(async (resolve) => {
      
      console.log('Добавляем маску:', mask.name)
      
      // Загружаем SVG маску
      fetch(mask.url)
        .then(response => response.text())
        .then(svgText => {
          this.paperScope.project.importSVG(svgText, {
            onLoad: (item) => {
              item.scale(2)
              
              // Позиционируем в центре канваса
              const canvasWidth = this.paperScope.view.viewSize.width
              const canvasHeight = this.paperScope.view.viewSize.height
              const x = canvasWidth * 0.5
              const y = canvasHeight * 0.5
              item.position = new this.paperScope.Point(x, y)
              
              if (item.children && item.children.length > 0) {
                // Ищем путь в импортированном SVG
                let path = null
                
                // Рекурсивно ищем Path в импортированном SVG
                const findPath = (node) => {
                  if (node.className === 'Path') {
                    path = node
                    return true
                  }
                  if (node.children) {
                    for (let child of node.children) {
                      if (findPath(child)) return true
                    }
                  }
                  return false
                }
                
                findPath(item)
                
                if (!path) {
                  console.log('⚠️ Не найден Path в SVG:', item)
                  // Fallback - используем первый элемент
                  path = item.children[0]
                }
                
                console.log('🔍 Найден путь:', path.className, 'Сегменты:', path.segments ? path.segments.length : 'нет')
                
                // Проверяем есть ли загруженные изображения
                if (this.uploadedImages.length > 0) {
                  // Берем первое изображение
                  const image = this.uploadedImages[0]
                  
                  // Создаем растр из изображения
                  const raster = new this.paperScope.Raster(image.url)
                  raster.visible = false // Скрываем оригинальный растр
                  console.log('🖼️ Растр создан, visible = false')
                  
                  // НЕ перемещаем растр - оставляем его там, где он есть
                  console.log('📍 Оригинальный растр оставлен на месте')
                  
                  // Обработка загрузки растра (как в GridsPage)
                  raster.onLoad = () => {
                    console.log('🖼️ Растр загружен:', {
                      imageSize: { width: raster.image.width, height: raster.image.height },
                      rasterBounds: raster.bounds
                    })
                    
                    // Дополнительная проверка - убеждаемся что растр скрыт
                    if (raster.parent) {
                      raster.visible = false
                      console.log('👁️ Оригинальный растр скрыт в onLoad')
                    }
                    
                    // Создаем временный canvas для обрезки изображения
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    
                    // Получаем размеры маски
                    const maskBounds = path.bounds
                    console.log('📐 Размеры маски:', maskBounds)
                    
                    tempCanvas.width = maskBounds.width
                    tempCanvas.height = maskBounds.height
                    
                    // Очищаем canvas
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
                    
                    // Создаем путь маски на canvas
                    tempCtx.save()
                    tempCtx.beginPath()
                    
                    // Рисуем путь маски (как в GridsPage)
                    if (path.className === 'Path' && path.segments && path.segments.length > 0) {
                      console.log('🔍 Сегменты пути:', path.segments.length)
                      
                                                                      // Используем более точный способ отрисовки SVG пути
                        if (path.pathData) {
                          // Если есть pathData, используем его для более точной отрисовки
                          console.log('🎯 Используем pathData для точной отрисовки')
                          console.log('📄 pathData:', path.pathData)
                          
                          // Парсим SVG path data и рисуем его на canvas
                          const pathCommands = this.parseSVGPath(path.pathData)
                          console.log('🔧 Парсированные команды:', pathCommands)
                          console.log('🔧 Первые 3 команды:', pathCommands.slice(0, 3))
                        console.log('🔧 Последние 3 команды:', pathCommands.slice(-3))
                          tempCtx.translate(-maskBounds.x, -maskBounds.y)
                          
                          // Устанавливаем fill-rule для правильной обработки отверстий
                          tempCtx.fillRule = 'evenodd'
                          
                          // Используем ручную отрисовку для более точного контроля
                          console.log('🎨 Рисуем путь вручную')
                          
                          for (const command of pathCommands) {
                            if (command.type === 'M') {
                              tempCtx.moveTo(command.x, command.y)
                            } else if (command.type === 'L') {
                              tempCtx.lineTo(command.x, command.y)
                            } else if (command.type === 'C') {
                              tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                            } else if (command.type === 'Q') {
                              tempCtx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
                            } else if (command.type === 'Z') {
                              tempCtx.closePath()
                            }
                          }
                          tempCtx.clip()
                          
                          tempCtx.translate(maskBounds.x, maskBounds.y)
                      } else {
                        // Fallback на сегменты
                        console.log('📐 Используем сегменты для отрисовки')
                        
                        // Первая точка
                        const firstPoint = path.segments[0].point
                        const relativeFirstPoint = new this.paperScope.Point(
                          firstPoint.x - maskBounds.x,
                          firstPoint.y - maskBounds.y
                        )
                        tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
                        
                        // Остальные точки
                        let lastRelativePoint = relativeFirstPoint
                        for (let i = 1; i < path.segments.length; i++) {
                          const segment = path.segments[i]
                          const relativePoint = new this.paperScope.Point(
                            segment.point.x - maskBounds.x,
                            segment.point.y - maskBounds.y
                          )
                          tempCtx.lineTo(relativePoint.x, relativePoint.y)
                          lastRelativePoint = relativePoint
                        }
                        
                        console.log('📏 Первая точка:', relativeFirstPoint, 'Последняя точка:', lastRelativePoint)
                      }
                    } else {
                      console.log('⚠️ Нет сегментов в пути!')
                    }
                    
                    tempCtx.closePath()
                    
                    // Проверяем, что путь создан правильно
                    console.log('🔒 Путь закрыт, применяем clip()')
                    tempCtx.clip()
                    
                    // Рисуем изображение на canvas с сохранением пропорций
                    const imgWidth = raster.image.width
                    const imgHeight = raster.image.height
                    const canvasWidth = maskBounds.width
                    const canvasHeight = maskBounds.height
                    
                    // Вычисляем масштаб для заполнения всей площади
                    const scaleX = canvasWidth / imgWidth
                    const scaleY = canvasHeight / imgHeight
                    const scale = Math.max(scaleX, scaleY)
                    
                    // Вычисляем размеры масштабированного изображения
                    const scaledWidth = imgWidth * scale
                    const scaledHeight = imgHeight * scale
                    
                    // Центрируем изображение
                    const offsetX = (canvasWidth - scaledWidth) / 2
                    const offsetY = (canvasHeight - scaledHeight) / 2
                    
                    tempCtx.drawImage(
                      raster.image,
                      offsetX, offsetY, scaledWidth, scaledHeight
                    )
                    
                    tempCtx.restore()
                    
                    console.log('🎨 Изображение нарисовано на canvas:', {
                      offset: { x: offsetX, y: offsetY },
                      scaledSize: { width: scaledWidth, height: scaledHeight }
                    })
                    
                    // Конвертируем canvas в dataURL
                    const maskedImageUrl = tempCanvas.toDataURL()
                    console.log('📄 DataURL создан, длина:', maskedImageUrl.length)
                    
                    // Создаем новый растр с обрезанным изображением
                    const maskedRaster = new this.paperScope.Raster(maskedImageUrl)
                    console.log('🔄 Создан новый растр из dataURL')
                    
                    maskedRaster.onLoad = () => {
                      console.log('✅ Новый растр загружен:', {
                        bounds: maskedRaster.bounds,
                        visible: maskedRaster.visible
                      })
                      // Устанавливаем позицию точно в центр маски
                      maskedRaster.position = maskBounds.center
                      console.log('📍 Позиция растра установлена:', maskBounds.center)
                      
                      // Сохраняем родительскую группу и позицию маски
                      const parentGroup = item.parent
                      const maskIndex = parentGroup ? parentGroup.children.indexOf(item) : -1
                      
                      // Удаляем оригинальную маску (как в GridsPage)
                      if (item.parent) {
                        item.remove()
                        console.log('🗑️ Оригинальная маска удалена из проекта')
                      }
                      
                      // Добавляем обрезанный растр в ту же позицию что и маска
                      if (parentGroup) {
                        if (maskIndex >= 0) {
                          parentGroup.insertChild(maskIndex, maskedRaster)
                        } else {
                          parentGroup.addChild(maskedRaster)
                        }
                      }
                      
                      // Показываем обрезанный растр
                      maskedRaster.visible = true
                      
                      // Создаем обводку поверх изображения
                      const outlinePath = path.clone()
                      outlinePath.fillColor = null
                      outlinePath.strokeColor = '#333'
                      outlinePath.strokeWidth = 3
                      outlinePath.position = maskBounds.center
                      
                      if (parentGroup) {
                        parentGroup.addChild(outlinePath)
                      }
                      
                      // Сохраняем ссылку на элемент
                      if (!this.testMaskItems) this.testMaskItems = {}
                      this.testMaskItems[mask.name] = maskedRaster
                      
                      console.log('Маска с изображением добавлена:', mask.name, 'Растр в проекте:', maskedRaster.parent !== null, 'Позиция:', maskedRaster.position)
                      
                      // Финальная проверка - убеждаемся что оригинальный растр скрыт
                      if (raster.parent) {
                        raster.visible = false
                        console.log('👁️ Оригинальный растр скрыт (финальная проверка)')
                      }
                      
                      this.paperScope.view.draw()
                      resolve()
                    }
                  }
                  
                  // Обработка ошибок загрузки растра (как в GridsPage)
                  raster.onError = () => {
                    console.log('❌ Ошибка загрузки изображения для маски:', mask.name)
                    // Если изображение не загрузилось, показываем маску с обычной заливкой
                    path.fillColor = '#ff4757'
                    path.strokeColor = '#333'
                    path.strokeWidth = 3
                    
                    // Сохраняем ссылку на элемент
                    if (!this.maskItems) this.maskItems = {}
                    this.maskItems[mask.name] = item
                    
                    resolve()
                  }
                } else {
                  // Если нет изображений, показываем обычную маску (как в GridsPage)
                  path.fillColor = '#ff4757'
                  path.strokeColor = '#333'
                  path.strokeWidth = 3
                  
                  // Сохраняем ссылку на элемент
                  if (!this.maskItems) this.maskItems = {}
                  this.maskItems[mask.name] = item
                  
                  console.log('Обычная маска добавлена:', mask.name)
                  this.paperScope.view.draw()
                  resolve()
                }
              }
            }
          })
        })
      })
    },
    
    // Удалить маску с канваса
    removeMaskFromCanvas(maskName) {
      if (this.maskItems && this.maskItems[maskName]) {
        console.log('🗑️ Удаляем маску:', maskName)
        
        const maskItem = this.maskItems[maskName]
        if (maskItem && maskItem.parent) {
          maskItem.remove()
          console.log('✅ Маска удалена из проекта')
        }
        delete this.maskItems[maskName]
        
        this.paperScope.view.draw()
      }
    },
    
    // Парсинг SVG path data
    parseSVGPath(pathData) {
      const commands = []
      const regex = /([MLHVCSQTAZmlhvcsqtaz])\s*([^MLHVCSQTAZmlhvcsqtaz]*)/g
      let match
      let currentX = 0
      let currentY = 0
      
      while ((match = regex.exec(pathData)) !== null) {
        const command = match[1]
        const isRelative = command === command.toLowerCase()
        const upperCommand = command.toUpperCase()
        const params = match[2].trim().split(/[\s,]+/).filter(p => p !== '').map(Number)
        
        if (upperCommand === 'M') {
          const x = isRelative ? currentX + params[0] : params[0]
          const y = isRelative ? currentY + params[1] : params[1]
          commands.push({ type: 'M', x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'L') {
          const x = isRelative ? currentX + params[0] : params[0]
          const y = isRelative ? currentY + params[1] : params[1]
          commands.push({ type: 'L', x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'V') {
          // Вертикальная линия
          const y = isRelative ? currentY + params[0] : params[0]
          commands.push({ type: 'L', x: currentX, y })
          currentY = y
        } else if (upperCommand === 'H') {
          // Горизонтальная линия
          const x = isRelative ? currentX + params[0] : params[0]
          commands.push({ type: 'L', x, y: currentY })
          currentX = x
        } else if (upperCommand === 'C') {
          const x1 = isRelative ? currentX + params[0] : params[0]
          const y1 = isRelative ? currentY + params[1] : params[1]
          const x2 = isRelative ? currentX + params[2] : params[2]
          const y2 = isRelative ? currentY + params[3] : params[3]
          const x = isRelative ? currentX + params[4] : params[4]
          const y = isRelative ? currentY + params[5] : params[5]
          commands.push({ type: 'C', x1, y1, x2, y2, x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'Q') {
          const x1 = isRelative ? currentX + params[0] : params[0]
          const y1 = isRelative ? currentY + params[1] : params[1]
          const x = isRelative ? currentX + params[2] : params[2]
          const y = isRelative ? currentY + params[3] : params[3]
          commands.push({ type: 'Q', x1, y1, x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'Z') {
          commands.push({ type: 'Z' })
        }
      }
      
      return commands
    },
    
    // Обновление стилей существующих стикеров
    updateStickerStyles() {
      if (!this.paperScope || this.stickers.length === 0) return
      
      console.log('🎨 Обновляем стили стикеров...')
      
      for (const sticker of this.stickers) {
        if (sticker.group && sticker.group.children && sticker.group.children.length >= 3) {
          // Получаем элементы стикера
          const shadowPath = sticker.group.children[0] // Тень внизу
          const clippedRaster = sticker.group.children[1] // Изображение посередине
          const outlinePath = sticker.group.children[2] // Обводка сверху
          
          // Обновляем обводку
          if (outlinePath) {
            outlinePath.strokeColor = this.strokeColor
            outlinePath.strokeWidth = this.strokeWidth
          }
          
          // Обновляем тень
          if (shadowPath) {
            const shadowAlpha = this.shadowOpacity / 100
            shadowPath.fillColor = `rgba(0, 0, 0, ${shadowAlpha})`
            shadowPath.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
            shadowPath.shadowBlur = this.shadowBlur
            shadowPath.shadowOffset = new this.paperScope.Point(
              this.shadowOffsetX,
              this.shadowOffsetY
            )
          }
        }
      }
      
      // Перерисовываем канвас
      this.paperScope.view.draw()
      console.log('✅ Стили стикеров обновлены')
    },
    
    // Оптимальная генерация стикеров (5 итераций)
    async generateOptimalStickers() {
      if (!this.paperScope) {
        console.log('❌ PaperScope не инициализирован')
        return
      }
      
      // Проверяем, что есть выбранные маски и изображения
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      const selectedImages = this.uploadedImages.filter(img => img.useInStickers)
      
      if (selectedMasks.length === 0) {
        alert('Выберите хотя бы одну форму стикера')
        return
      }
      
      if (selectedImages.length === 0) {
        alert('Загрузите и выберите хотя бы одно изображение')
        return
      }
      
      this.isLoading = true
      
      // Очищаем канвас полностью
      this.paperScope.project.clear()
      
      // Создаем белый фон
      this.createWhiteBackground()
      
      // Очищаем существующие стикеры
      this.stickers.forEach(sticker => {
        if (sticker.group) {
          sticker.group.remove()
        }
      })
      this.stickers = []
      
      // Получаем размеры канваса
      const viewWidth = this.paperScope.view.viewSize.width
      const viewHeight = this.paperScope.view.viewSize.height
      
      console.log('🎯 Запуск 5 итераций генерации стикеров:', viewWidth, 'x', viewHeight)
      
      // Запускаем 5 итераций генерации
      await this.runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight)
    },
    
    // Запуск множественных итераций генерации
    async runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight) {
      console.log('🚀 Запуск 5 итераций генерации...')
      
      try {
        // Итерация 1: Основная генерация
        console.log('📋 Итерация 1/5: Основная генерация')
        await this.runOptimalPlacement(selectedMasks, selectedImages, viewWidth, viewHeight)
        
        // Итерации 2-5: Дополнительные слои
        for (let iteration = 2; iteration <= 5; iteration++) {
          console.log(`📋 Итерация ${iteration}/5: Дополнительный слой`)
          
          // Проверяем общий лимит стикеров (максимум 100)
          if (this.stickers.length >= 100) {
            console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
            break
          }
          
          // Небольшая пауза между итерациями для стабильности
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Запускаем addMoreStickers для создания нового слоя
          await this.addMoreStickers()
          
          // Обновляем прогресс
          console.log(`✅ Итерация ${iteration}/5 завершена. Всего стикеров: ${this.stickers.length}`)
        }
        
        console.log('🎉 Все итерации генерации завершены!')
        console.log(`📊 Итоговое количество стикеров: ${this.stickers.length} (максимум 100 - 20 на итерацию)`)
        
        // Финальное обновление
        this.paperScope.view.draw()
        
        // Обновляем 3D текстуру
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              this.$refs.threeRenderer.forceUpdate()
            }
            this.isLoading = false
          }, 300)
        })
        
      } catch (error) {
        console.error('❌ Ошибка при выполнении множественных итераций:', error)
        this.isLoading = false
      }
    },
    

    
    // Алгоритм оптимального размещения стикеров
    async runOptimalPlacement(selectedMasks, selectedImages, viewWidth, viewHeight) {
      console.log('🚀 Запуск алгоритма оптимального размещения')
      
      // Создаем сетку для отслеживания покрытия
      const gridSize = 10 // Размер ячейки сетки
      const gridCols = Math.ceil(viewWidth / gridSize)
      const gridRows = Math.ceil(viewHeight / gridSize)
      const coverageGrid = Array(gridRows).fill().map(() => Array(gridCols).fill(false))
      
      let totalCovered = 0
      let iterations = 0
      let currentCoverage = 0
      
      // Функция для расчета покрытия
      const calculateCoverage = () => {
        let covered = 0
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            if (coverageGrid[row][col]) covered++
          }
        }
        return (covered / (gridRows * gridCols)) * 100
      }
      
      // Функция для обновления сетки покрытия (учитывает стикеры за границами канваса)
      const updateCoverageGrid = (x, y, size) => {
        const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
        const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
        const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
        const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
        
        // Проверяем, что есть хотя бы одна ячейка внутри канваса
        if (startCol <= endCol && startRow <= endRow) {
          for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              coverageGrid[row][col] = true
            }
          }
        }
      }
      
      // Функция для поиска лучшей позиции (улучшенная)
      const findBestPosition = (size) => {
        let bestX = 0, bestY = 0, bestScore = -1
        
        // Сначала ищем пустые области в сетке
        const emptyAreas = []
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            if (!coverageGrid[row][col]) {
              emptyAreas.push({ row, col })
            }
          }
        }
        
        // Если есть пустые области, приоритетно размещаем в них
        if (emptyAreas.length > 0) {
          // Выбираем случайную пустую область
          const randomEmptyArea = emptyAreas[Math.floor(Math.random() * emptyAreas.length)]
          const centerX = (randomEmptyArea.col + 0.5) * gridSize
          const centerY = (randomEmptyArea.row + 0.5) * gridSize
          
          // Пробуем разместить стикер в этой области
          for (let attempt = 0; attempt < 20; attempt++) {
            const x = centerX + (Math.random() - 0.5) * gridSize * 2
            const y = centerY + (Math.random() - 0.5) * gridSize * 2
            
            // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.2) {
              continue
            }
            
            // Проверяем перекрытие с существующими стикерами (разрешено перекрытие на 30%)
            if (this.checkOverlap(x, y, size)) { // checkOverlap уже учитывает 30% перекрытие
              continue
            }
            
            // Рассчитываем "полезность" этой позиции
            let score = 0
            const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
            const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
            const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
            const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
            
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                if (!coverageGrid[row][col]) {
                  score += 2 // Увеличенный бонус за покрытие пустой области
                } else {
                  score -= 0.2 // Увеличенный штраф за перекрытие
                }
              }
            }
            
            if (score > bestScore) {
              bestScore = score
              bestX = x
              bestY = y
            }
          }
        }
        
        // Если не нашли хорошую позицию в пустых областях, пробуем случайные
        if (bestScore <= 0) {
                       for (let attempt = 0; attempt < 30; attempt++) {
               // Расширяем область поиска за пределы канваса для лучшего заполнения
               const x = (Math.random() - 0.2) * viewWidth * 1.4 // -20% до +40% от ширины
               const y = (Math.random() - 0.2) * viewHeight * 1.4 // -20% до +40% от высоты
            
            // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.2) {
              continue
            }
            
            // Проверяем перекрытие с существующими стикерами (разрешено перекрытие на 30%)
            if (this.checkOverlap(x, y, size)) { // checkOverlap уже учитывает 30% перекрытие
              continue
            }
            
            // Рассчитываем "полезность" этой позиции
            let score = 0
            const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
            const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
            const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
            const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
            
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                if (!coverageGrid[row][col]) {
                  score += 1 // Бонус за покрытие пустой области
                } else {
                  score -= 0.1 // Штраф за перекрытие
                }
              }
            }
            
            if (score > bestScore) {
              bestScore = score
              bestX = x
              bestY = y
            }
          }
        }
        
        return bestScore > 0 ? { x: bestX, y: bestY } : null
      }
      
      // Основной цикл размещения (ограничиваем 20 стикерами на итерацию и общим лимитом 100)
      while (currentCoverage < this.targetCoverage && iterations < this.maxIterations && this.stickers.length < 20 && this.stickers.length < 100) {
        iterations++
        
        // Выбираем размер стикера в зависимости от покрытия (увеличены минимальные размеры в 3 раза)
        let sizeMultiplier
        if (currentCoverage < 50) {
          // В начале используем большие стикеры для быстрого покрытия
          sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0
        } else if (currentCoverage < 80) {
          // В середине используем средние стикеры
          sizeMultiplier = 1.2 + Math.random() * 0.6 // 1.2 - 1.8
        } else {
          // В конце используем маленькие стикеры для заполнения пустот (увеличены в 3 раза)
          sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0 (было 0.5 - 1.0)
        }
        const size = this.baseStickerSize * sizeMultiplier
        
        // Ищем лучшую позицию
        const position = findBestPosition(size)
        
        if (position) {
          // Создаем стикер (теперь асинхронно)
          try {
            const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size)
            
            if (sticker) {
              this.stickers.push(sticker)
              
              // Обновляем сетку покрытия
              updateCoverageGrid(position.x, position.y, size)
              
              // Пересчитываем покрытие
              currentCoverage = calculateCoverage()
              this.coveragePercentage = Math.round(currentCoverage)
              
              console.log(`📊 Итерация ${iterations}: ${this.stickers.length} стикеров, покрытие ${this.coveragePercentage}%`)
            }
          } catch (error) {
            console.error('Ошибка создания стикера:', error)
          }
        }
        
        // Обновляем канвас каждые 10 стикеров
        if (this.stickers.length % 10 === 0) {
          this.paperScope.view.draw()
        }
      }
      
      if (this.stickers.length >= 100) {
        console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
      }
      console.log(`✅ Завершено: ${this.stickers.length} стикеров (максимум 20), покрытие ${this.coveragePercentage}%`)
      
      // Финальное обновление канваса
      this.paperScope.view.draw()
      
      // Обновляем стили всех стикеров
      this.updateStickerStyles()
      
      // Обновляем 3D текстуру (но не устанавливаем isLoading = false, это делается в runMultipleGenerations)
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }, 300)
      })
    },
    
    // Добавление дополнительных стикеров
    async addMoreStickers() {
      console.log('🔄 Создаем новый слой со стикерами...')
      
      // Проверяем условия
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      const selectedImages = this.uploadedImages
      
      if (selectedMasks.length === 0 || selectedImages.length === 0) {
        console.log('⚠️ Нет выбранных масок или изображений')
        return
      }
      
      this.isLoading = true
      
      try {
        // Получаем размеры канваса
        const viewWidth = this.paperScope.view.viewSize.width
        const viewHeight = this.paperScope.view.viewSize.height
        
        console.log(`🎯 Создание нового слоя стикеров: ${viewWidth} x ${viewHeight}`)
        
        // Создаем новый слой - НЕ перемещаем существующие стикеры, новые будут поверх
        console.log('🔄 Создаем новый слой поверх существующих стикеров...')
        
        // Создаем сетку для отслеживания покрытия (пустая, так как не учитываем предыдущие стикеры)
        const gridSize = 10 // Размер ячейки сетки
        const gridCols = Math.ceil(viewWidth / gridSize)
        const gridRows = Math.ceil(viewHeight / gridSize)
        
        // Инициализируем пустую сетку покрытия (не учитываем существующие стикеры)
        const coverageGrid = Array(gridRows).fill().map(() => Array(gridCols).fill(false))
        
        // Функция для обновления сетки покрытия (учитывает стикеры за границами канваса)
        const updateCoverageGrid = (x, y, size) => {
          const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
          const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
          const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
          const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
          
          // Проверяем, что есть хотя бы одна ячейка внутри канваса
          if (startCol <= endCol && startRow <= endRow) {
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                coverageGrid[row][col] = true
              }
            }
          }
        }
        
        // Функция для расчета покрытия
        const calculateCoverage = () => {
          let coveredCells = 0
          let totalCells = 0
          
          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              totalCells++
              if (coverageGrid[row][col]) {
                coveredCells++
              }
            }
          }
          
          return (coveredCells / totalCells) * 100
        }
        
        let currentCoverage = 0 // Начинаем с 0, так как не учитываем предыдущие стикеры
        console.log(`📊 Начинаем новый слой с покрытием: ${Math.round(currentCoverage)}%`)
        
        // Функция для поиска лучшей позиции (не учитывает существующие стикеры)
        const findBestPosition = (size) => {
          let bestX = 0, bestY = 0, bestScore = -1
          
          // Ищем пустые области в сетке (только новые стикеры)
          const emptyAreas = []
          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              if (!coverageGrid[row][col]) {
                emptyAreas.push({ row, col })
              }
            }
          }
          
          if (emptyAreas.length === 0) {
            console.log('✅ Нет пустых областей для размещения')
            return null
          }
          
          // Сначала пробуем разместить в пустых областях
          for (let areaIndex = 0; areaIndex < Math.min(5, emptyAreas.length); areaIndex++) {
            const randomEmptyArea = emptyAreas[Math.floor(Math.random() * emptyAreas.length)]
            const centerX = (randomEmptyArea.col + 0.5) * gridSize
            const centerY = (randomEmptyArea.row + 0.5) * gridSize
             
             // Пробуем разместить стикер в этой области
             for (let attempt = 0; attempt < 15; attempt++) {
               const x = centerX + (Math.random() - 0.5) * gridSize * 1.5
               const y = centerY + (Math.random() - 0.5) * gridSize * 1.5
               
               // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
               // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
               const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
               if (overlapWithCanvas < 0.2) {
                 continue
               }
               
               // Проверяем перекрытие только с новыми стикерами (не учитываем существующие)
               if (this.checkOverlap(x, y, size, true)) { // excludeExisting = true - не проверяем существующие стикеры
                 continue
               }
               
               // Рассчитываем "полезность" этой позиции
               let score = 0
               const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
               const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
               const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
               const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
               
               for (let row = startRow; row <= endRow; row++) {
                 for (let col = startCol; col <= endCol; col++) {
                   if (!coverageGrid[row][col]) {
                     score += 4 // Увеличенный бонус за покрытие пустой области
                   } else {
                     score -= 0.2 // Уменьшенный штраф за перекрытие
                   }
                 }
               }
               
               if (score > bestScore) {
                 bestScore = score
                 bestX = x
                 bestY = y
               }
             }
           }
           
           // Если не нашли хорошую позицию в пустых областях, пробуем случайные
           if (bestScore <= 0) {
             console.log('🔄 Пробуем случайные позиции...')
             for (let attempt = 0; attempt < 30; attempt++) {
               // Расширяем область поиска за пределы канваса для лучшего заполнения
               const x = (Math.random() - 0.2) * viewWidth * 1.4 // -20% до +40% от ширины
               const y = (Math.random() - 0.2) * viewHeight * 1.4 // -20% до +40% от высоты
               
               // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
               // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
               const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
               if (overlapWithCanvas < 0.2) {
                 continue
               }
               
               // Проверка перекрытия для случайных позиций (только с новыми стикерами)
               if (this.checkOverlap(x, y, size, true)) { // excludeExisting = true - не проверяем существующие стикеры
                 continue
               }
               
               // Рассчитываем "полезность" этой позиции
               let score = 0
               const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
               const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
               const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
               const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
               
               for (let row = startRow; row <= endRow; row++) {
                 for (let col = startCol; col <= endCol; col++) {
                   if (!coverageGrid[row][col]) {
                     score += 2 // Бонус за покрытие пустой области
                   } else {
                     score -= 0.1 // Минимальный штраф за перекрытие
                   }
                 }
               }
               
               if (score > bestScore) {
                 bestScore = score
                 bestX = x
                 bestY = y
               }
             }
           }
           
           return bestScore > 0 ? { x: bestX, y: bestY } : null
         }
        
        // Генерируем новый слой стикеров (ограничиваем 20 стикерами на итерацию)
        let iterations = 0
        const maxIterations = 20 // Ограничиваем количество стикеров в новом слое
        
        while (currentCoverage < 80 && iterations < maxIterations && this.stickers.length < 100) { // Останавливаемся на 80% покрытии, 20 стикерах или общем лимите 100
          iterations++
          
          // Выбираем размер стикера в зависимости от покрытия (увеличены минимальные размеры в 3 раза)
          let sizeMultiplier
          if (currentCoverage < 50) {
            // В начале используем большие стикеры для быстрого покрытия
            sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0
          } else if (currentCoverage < 70) {
            // В середине используем средние стикеры
            sizeMultiplier = 1.2 + Math.random() * 0.6 // 1.2 - 1.8
          } else {
            // В конце используем маленькие стикеры для заполнения пустот (увеличены в 3 раза)
            sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0 (было 0.5 - 1.0)
          }
          
          const size = this.baseStickerSize * sizeMultiplier
          
          // Ищем лучшую позицию
          const position = findBestPosition(size)
          
          if (position) {
            // Создаем стикер
            try {
              const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size)
              
              if (sticker) {
                this.stickers.push(sticker)
                updateCoverageGrid(position.x, position.y, size)
                currentCoverage = calculateCoverage()
                this.coveragePercentage = Math.round(currentCoverage)
                
                console.log(`📊 Добавлен стикер ${iterations}: покрытие ${this.coveragePercentage}%`)
              }
            } catch (error) {
              console.error('Ошибка создания стикера:', error)
            }
          } else {
            console.log(`❌ Не удалось найти позицию для стикера ${iterations}`)
            break // Прерываем цикл, если не можем найти позицию
          }
        }
        
        if (this.stickers.length >= 100) {
          console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
        }
        console.log(`✅ Создан новый слой: ${iterations} стикеров (максимум 20), покрытие: ${this.coveragePercentage}%`)
        
        // Обновляем канвас только один раз в конце
        this.paperScope.view.draw()
        
        // Обновляем 3D текстуру
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              this.$refs.threeRenderer.forceUpdate()
            }
            this.isLoading = false
          }, 300)
        })
        
      } catch (error) {
        console.error('Ошибка при добавлении стикеров:', error)
        this.isLoading = false
      }
    },
    
    // Создание оптимального стикера
    createOptimalSticker(masks, images, x, y, size) {
      // Случайная маска
      const randomMask = masks[Math.floor(Math.random() * masks.length)]
      // Случайное изображение
      const randomImage = images[Math.floor(Math.random() * images.length)]
      
      console.log(`🎨 Создаем стикер: ${randomMask.name} + ${randomImage.name} в позиции (${x}, ${y}) размером ${size}`)
      
      // Случайный поворот для лучшего покрытия
      const rotation = Math.random() * 360
      
      return new Promise((resolve) => {
        // Загружаем SVG маску (как в addMaskToCanvas)
        fetch(randomMask.url)
          .then(response => response.text())
          .then(svgText => {
            this.paperScope.project.importSVG(svgText, {
              onLoad: (item) => {
                // Масштабируем и позиционируем
                const scale = size / 100 // Масштабируем под нужный размер
                item.scale(scale)
                item.rotate(rotation)
                // НЕ позиционируем здесь - позиционируем после обрезки
                
                if (item.children && item.children.length > 0) {
                  // Ищем путь в импортированном SVG
                  let path = null
                  
                  // Рекурсивно ищем Path в импортированном SVG
                  const findPath = (node) => {
                    if (node.className === 'Path') {
                      path = node
                      return true
                    }
                    if (node.children) {
                      for (let child of node.children) {
                        if (findPath(child)) return true
                      }
                    }
                    return false
                  }
                  
                  findPath(item)
                  
                  if (!path) {
                    console.log('⚠️ Не найден Path в SVG:', item)
                    path = item.children[0]
                  }
                  
                  // Создаем растр из изображения (новый для каждого стикера)
                  const raster = new this.paperScope.Raster(randomImage.url)
                  raster.visible = false // Скрываем оригинальный растр
                  
                  raster.onLoad = () => {
                    console.log(`🖼️ Растр загружен: ${randomImage.name}, размеры: ${raster.image.width}x${raster.image.height}`)
                    
                    // Создаем временный canvas для обрезки изображения
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    
                    // Получаем размеры маски
                    const maskBounds = path.bounds
                    console.log(`📐 Размеры маски ${randomMask.name}: ${maskBounds.width}x${maskBounds.height}`)
                    
                    tempCanvas.width = maskBounds.width
                    tempCanvas.height = maskBounds.height
                    
                    // Очищаем canvas
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
                    
                    // Создаем путь маски на canvas
                    tempCtx.save()
                    tempCtx.beginPath()
                    
                    // Рисуем путь маски (как в addMaskToCanvas)
                    if (path.className === 'Path' && path.segments && path.segments.length > 0) {
                      console.log('🔍 Сегменты пути:', path.segments.length)
                      
                      // Используем более точный способ отрисовки SVG пути
                      if (path.pathData) {
                        // Если есть pathData, используем его для более точной отрисовки
                        console.log('🎯 Используем pathData для точной отрисовки')
                        console.log('📄 pathData:', path.pathData)
                        
                        // Парсим SVG path data и рисуем его на canvas
                        const pathCommands = this.parseSVGPath(path.pathData)
                        console.log('🔧 Парсированные команды:', pathCommands)
                        console.log('🔧 Первые 3 команды:', pathCommands.slice(0, 3))
                        console.log('🔧 Последние 3 команды:', pathCommands.slice(-3))
                        tempCtx.translate(-maskBounds.x, -maskBounds.y)
                        
                        // Устанавливаем fill-rule для правильной обработки отверстий
                        tempCtx.fillRule = 'evenodd'
                        
                        // Используем ручную отрисовку для более точного контроля
                        console.log('🎨 Рисуем путь вручную')
                        
                        for (const command of pathCommands) {
                          if (command.type === 'M') {
                            tempCtx.moveTo(command.x, command.y)
                          } else if (command.type === 'L') {
                            tempCtx.lineTo(command.x, command.y)
                          } else if (command.type === 'C') {
                            tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                          } else if (command.type === 'Q') {
                            tempCtx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
                          } else if (command.type === 'Z') {
                            tempCtx.closePath()
                          }
                        }
                        tempCtx.clip()
                        
                        tempCtx.translate(maskBounds.x, maskBounds.y)
                      } else {
                        // Fallback на сегменты
                        console.log('📐 Используем сегменты для отрисовки')
                        
                        // Первая точка
                        const firstPoint = path.segments[0].point
                        const relativeFirstPoint = new this.paperScope.Point(
                          firstPoint.x - maskBounds.x,
                          firstPoint.y - maskBounds.y
                        )
                        tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
                        
                        // Остальные точки
                        let lastRelativePoint = relativeFirstPoint
                        for (let i = 1; i < path.segments.length; i++) {
                          const segment = path.segments[i]
                          const relativePoint = new this.paperScope.Point(
                            segment.point.x - maskBounds.x,
                            segment.point.y - maskBounds.y
                          )
                          tempCtx.lineTo(relativePoint.x, relativePoint.y)
                          lastRelativePoint = relativePoint
                        }
                        
                        console.log('📏 Первая точка:', relativeFirstPoint, 'Последняя точка:', lastRelativePoint)
                      }
                    } else {
                      console.log('⚠️ Нет сегментов в пути!')
                    }
                    
                    tempCtx.closePath()
                    
                    // Проверяем, что путь создан правильно
                    console.log('🔒 Путь закрыт, применяем clip()')
                    tempCtx.clip()
                    
                    // Рисуем изображение на canvas с сохранением пропорций и поворотом
                    const imgWidth = raster.image.width
                    const imgHeight = raster.image.height
                    const canvasWidth = maskBounds.width
                    const canvasHeight = maskBounds.height
                    
                    // Вычисляем масштаб для заполнения всей площади стикера
                    const scaleX = canvasWidth / imgWidth
                    const scaleY = canvasHeight / imgHeight
                    const scale = Math.max(scaleX, scaleY) // Используем Math.max для заполнения всей площади
                    
                    // Дополнительно увеличиваем масштаб для гарантированного заполнения
                    const extraScale = 1.1 // Увеличиваем на 10% для гарантии заполнения
                    const finalScale = scale * extraScale
                    
                    // Вычисляем размеры масштабированного изображения
                    const scaledWidth = imgWidth * finalScale
                    const scaledHeight = imgHeight * finalScale
                    
                    // Вычисляем смещение для центрирования
                    const offsetX = (canvasWidth - scaledWidth) / 2
                    const offsetY = (canvasHeight - scaledHeight) / 2
                    
                    // Применяем поворот к изображению
                    tempCtx.save()
                    tempCtx.translate(canvasWidth / 2, canvasHeight / 2)
                    tempCtx.rotate((rotation * Math.PI) / 180)
                    tempCtx.translate(-canvasWidth / 2, -canvasHeight / 2)
                    
                    // Рисуем изображение
                    tempCtx.drawImage(
                      raster.image,
                      offsetX,
                      offsetY,
                      scaledWidth,
                      scaledHeight
                    )
                    
                    tempCtx.restore()
                    
                    tempCtx.restore()
                    
                    // Создаем новый растр из обрезанного изображения
                    const dataURL = tempCanvas.toDataURL('image/png')
                    console.log(`✂️ Создан обрезанный растр, размер dataURL: ${dataURL.length} символов`)
                    const clippedRaster = new this.paperScope.Raster(dataURL)
                    
                    clippedRaster.onLoad = () => {
                      console.log(`✅ Обрезанный растр загружен, позиционируем в (${x}, ${y})`)
                      // Позиционируем обрезанный растр точно в центр маски
                      clippedRaster.position = new this.paperScope.Point(x, y)
                      
                      // Создаем контур для обводки
                      const outlinePath = path.clone()
                      outlinePath.position = new this.paperScope.Point(x, y)
                      
                      // Применяем обводку к контуру (фиксированные параметры)
                      const strokeWidthPixels = this.strokeWidth // Фиксированная толщина обводки
                      outlinePath.strokeColor = this.strokeColor
                      outlinePath.strokeWidth = strokeWidthPixels
                      outlinePath.fillColor = null
                      
                      // Создаем отдельную маску для тени (заполненная)
                      const shadowPath = path.clone()
                      shadowPath.position = new this.paperScope.Point(x, y)
                      // Используем shadowOpacity для прозрачности тени
                      const shadowAlpha = this.shadowOpacity / 100
                      shadowPath.fillColor = `rgba(0, 0, 0, ${shadowAlpha})` // Заполняем тень
                      shadowPath.strokeColor = null
                      
                      // Применяем тень к заполненной маске
                      shadowPath.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
                      shadowPath.shadowBlur = this.shadowBlur // Фиксированная размытость тени
                      shadowPath.shadowOffset = new this.paperScope.Point(
                        this.shadowOffsetX, // Фиксированное смещение тени по X
                        this.shadowOffsetY  // Фиксированное смещение тени по Y
                      )
                      
                      // Создаем группу стикера (правильный порядок слоев)
                      const sticker = new this.paperScope.Group()
                      sticker.addChild(shadowPath) // Тень внизу
                      sticker.addChild(clippedRaster) // Изображение посередине
                      sticker.addChild(outlinePath) // Обводка сверху
                      
                      // Добавляем группу в проект
                      this.paperScope.project.activeLayer.addChild(sticker)
                      
                      // Удаляем оригинальный импортированный элемент
                      item.remove()
                      
                      resolve({
                        group: sticker,
                        x: x,
                        y: y,
                        size: size,
                        rotation: rotation,
                        mask: randomMask.name,
                        image: randomImage.name
                      })
                    }
                  }
                } else {
                  resolve(null)
                }
              }
            })
          })
          .catch(error => {
            console.error('Ошибка загрузки SVG:', error)
            resolve(null)
          })
      })
    },
    
    // Создание белого фона
    createWhiteBackground() {
      if (!this.paperScope) return
      
      // Создаем белый прямоугольник на весь размер канваса
      const canvasSize = this.paperScope.view.viewSize
      const whiteRect = new this.paperScope.Path.Rectangle(
        new this.paperScope.Point(0, 0),
        new this.paperScope.Point(canvasSize.width, canvasSize.height)
      )
      
      whiteRect.fillColor = 'white'
      whiteRect.strokeColor = null
      
      // Добавляем в проект
      this.paperScope.project.activeLayer.addChild(whiteRect)
      
      console.log('⬜ Белый фон создан')
    },
    
    // Проверка перекрытия стикеров (разрешено перекрытие на 30%)
    checkOverlap(x, y, size, excludeExisting = false) {
      // Убираем margin для разрешения перекрытия
      const margin = 0 // Убираем минимальное расстояние между стикерами
      
      // Если excludeExisting = true, не проверяем перекрытие с существующими стикерами
      const stickersToCheck = excludeExisting ? [] : this.stickers
      
      for (const sticker of stickersToCheck) {
        // Используем данные стикера для проверки перекрытия
        const stickerX = sticker.x
        const stickerY = sticker.y
        const stickerSize = sticker.size
        
        // Разрешаем перекрытие на 30% (стикеры могут заходить друг на друга на 30%)
        const overlapThreshold = 0.3 // Допускаем 30% перекрытие
        
        const newBounds = {
          left: x - size/2 * (1 - overlapThreshold) - margin,
          top: y - size/2 * (1 - overlapThreshold) - margin,
          right: x + size/2 * (1 - overlapThreshold) + margin,
          bottom: y + size/2 * (1 - overlapThreshold) + margin
        }
        
        const stickerBounds = {
          left: stickerX - stickerSize/2 * (1 - overlapThreshold) - margin,
          top: stickerY - stickerSize/2 * (1 - overlapThreshold) - margin,
          right: stickerX + stickerSize/2 * (1 - overlapThreshold) + margin,
          bottom: stickerY + stickerSize/2 * (1 - overlapThreshold) + margin
        }
        
        if (this.boundsIntersect(stickerBounds, newBounds)) {
          return true
        }
      }
      
      return false
    },
    
    // Проверка пересечения областей
    boundsIntersect(bounds1, bounds2) {
      return !(bounds1.right < bounds2.left || 
               bounds1.left > bounds2.right || 
               bounds1.bottom < bounds2.top || 
               bounds1.top > bounds2.bottom)
    },
    
    // Расчет перекрытия стикера с канвасом
    calculateCanvasOverlap(x, y, size, viewWidth, viewHeight) {
      // Границы стикера
      const stickerLeft = x - size/2
      const stickerRight = x + size/2
      const stickerTop = y - size/2
      const stickerBottom = y + size/2
      
      // Границы канваса
      const canvasLeft = 0
      const canvasRight = viewWidth
      const canvasTop = 0
      const canvasBottom = viewHeight
      
      // Находим область пересечения
      const overlapLeft = Math.max(stickerLeft, canvasLeft)
      const overlapRight = Math.min(stickerRight, canvasRight)
      const overlapTop = Math.max(stickerTop, canvasTop)
      const overlapBottom = Math.min(stickerBottom, canvasBottom)
      
      // Если нет пересечения, возвращаем 0
      if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
        return 0
      }
      
      // Площадь пересечения
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop)
      
      // Площадь стикера
      const stickerArea = size * size
      
      // Возвращаем долю перекрытия (от 0 до 1)
      return overlapArea / stickerArea
    },
    
    // Создание маски из SVG
    createMaskFromSVG(maskData, centerX, centerY, radius) {
      try {
        // Создаем разные формы в зависимости от маски
        let path
        
        switch (maskData.name) {
          case 'Сердце':
            path = this.createHeartPath(centerX, centerY, radius)
            break
          case 'Звезда':
            path = this.createStarPath(centerX, centerY, radius)
            break
          case 'Звезда 6':
            path = this.createStar6Path(centerX, centerY, radius)
            break
          case 'Звезда 8':
            path = this.createStar8Path(centerX, centerY, radius)
            break
          case 'Звезда 8-2':
            path = this.createStar8Path(centerX, centerY, radius)
            break
          case 'Треугольник':
            path = this.createTrianglePath(centerX, centerY, radius)
            break
          case 'Шестигранник':
            path = this.createHexagonPath(centerX, centerY, radius)
            break
          case 'Октагон':
            path = this.createOctagonPath(centerX, centerY, radius)
            break
          case 'Круг':
            path = new this.paperScope.Path.Circle(new this.paperScope.Point(centerX, centerY), radius)
            break
          case 'Квадрат':
            path = new this.paperScope.Path.Rectangle(new this.paperScope.Point(centerX - radius, centerY - radius), new this.paperScope.Point(centerX + radius, centerY + radius))
            break
          case 'Ромб':
            path = this.createDiamondPath(centerX, centerY, radius)
            break
          case 'Облачко':
            path = this.createCloudPath(centerX, centerY, radius)
            break
          case 'Ракета':
            path = this.createRocketPath(centerX, centerY, radius)
            break
          default:
            // Для остальных масок используем круг
            path = new this.paperScope.Path.Circle(new this.paperScope.Point(centerX, centerY), radius)
        }
        
        path.fillColor = null
        path.strokeColor = null
        
        return path
      } catch (error) {
        console.error('Ошибка создания маски:', error)
        // Fallback на круг
        const circle = new this.paperScope.Path.Circle(new this.paperScope.Point(centerX, centerY), radius)
        circle.fillColor = null
        circle.strokeColor = null
        return circle
      }
    },
    
    // Создание пути сердца
    createHeartPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      const scale = radius / 60 // Масштабируем под размер
      
      // Координаты сердца (примерные)
      const points = [
        [centerX, centerY - scale * 40],
        [centerX - scale * 35, centerY - scale * 20],
        [centerX - scale * 50, centerY + scale * 10],
        [centerX - scale * 40, centerY + scale * 30],
        [centerX, centerY + scale * 50],
        [centerX + scale * 40, centerY + scale * 30],
        [centerX + scale * 50, centerY + scale * 10],
        [centerX + scale * 35, centerY - scale * 20]
      ]
      
      path.add(new this.paperScope.Point(points[0][0], points[0][1]))
      path.add(new this.paperScope.Point(points[1][0], points[1][1]))
      path.add(new this.paperScope.Point(points[2][0], points[2][1]))
      path.add(new this.paperScope.Point(points[3][0], points[3][1]))
      path.add(new this.paperScope.Point(points[4][0], points[4][1]))
      path.add(new this.paperScope.Point(points[5][0], points[5][1]))
      path.add(new this.paperScope.Point(points[6][0], points[6][1]))
      path.add(new this.paperScope.Point(points[7][0], points[7][1]))
      path.closed = true
      path.smooth()
      
      return path
    },
    
    // Создание пути звезды
    createStarPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      const innerRadius = radius * 0.4
      const outerRadius = radius
      
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5
        const currentRadius = i % 2 === 0 ? outerRadius : innerRadius
        const x = centerX + Math.cos(angle) * currentRadius
        const y = centerY + Math.sin(angle) * currentRadius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути звезды 6
    createStar6Path(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      const innerRadius = radius * 0.5
      const outerRadius = radius
      
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        const currentRadius = i % 2 === 0 ? outerRadius : innerRadius
        const x = centerX + Math.cos(angle) * currentRadius
        const y = centerY + Math.sin(angle) * currentRadius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути звезды 8
    createStar8Path(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      const innerRadius = radius * 0.4
      const outerRadius = radius
      
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8
        const currentRadius = i % 2 === 0 ? outerRadius : innerRadius
        const x = centerX + Math.cos(angle) * currentRadius
        const y = centerY + Math.sin(angle) * currentRadius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути треугольника
    createTrianglePath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути шестигранника
    createHexagonPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути восьмигранника
    createOctagonPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        path.add(new this.paperScope.Point(x, y))
      }
      
      path.closed = true
      return path
    },
    
    // Создание пути ромба
    createDiamondPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      const points = [
        [centerX, centerY - radius],
        [centerX + radius, centerY],
        [centerX, centerY + radius],
        [centerX - radius, centerY]
      ]
      
      points.forEach(point => {
        path.add(new this.paperScope.Point(point[0], point[1]))
      })
      
      path.closed = true
      return path
    },
    
    // Создание пути облачка
    createCloudPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      // Создаем облачко из нескольких кругов
      const circles = [
        { x: centerX - radius * 0.5, y: centerY, r: radius * 0.4 },
        { x: centerX + radius * 0.5, y: centerY, r: radius * 0.4 },
        { x: centerX, y: centerY - radius * 0.3, r: radius * 0.3 },
        { x: centerX, y: centerY + radius * 0.2, r: radius * 0.3 }
      ]
      
      circles.forEach(circle => {
        const circlePath = new this.paperScope.Path.Circle(new this.paperScope.Point(circle.x, circle.y), circle.r)
        path.unite(circlePath)
      })
      
      return path
    },
    
    // Создание пути ракеты
    createRocketPath(centerX, centerY, radius) {
      const path = new this.paperScope.Path()
      
      // Создаем ракету из треугольников и прямоугольников
      const scale = radius / 40
      
      // Основная часть (прямоугольник)
      const mainRect = new this.paperScope.Path.Rectangle(
        new this.paperScope.Point(centerX - scale * 15, centerY - scale * 25),
        new this.paperScope.Point(centerX + scale * 15, centerY + scale * 20)
      )
      
      // Нос (треугольник)
      const nose = new this.paperScope.Path()
      nose.add(new this.paperScope.Point(centerX, centerY - scale * 25))
      nose.add(new this.paperScope.Point(centerX - scale * 10, centerY - scale * 10))
      nose.add(new this.paperScope.Point(centerX + scale * 10, centerY - scale * 10))
      nose.closed = true
      
      // Хвост (треугольники)
      const tail = new this.paperScope.Path()
      tail.add(new this.paperScope.Point(centerX, centerY + scale * 20))
      tail.add(new this.paperScope.Point(centerX - scale * 25, centerY + scale * 15))
      tail.add(new this.paperScope.Point(centerX + scale * 25, centerY + scale * 15))
      tail.closed = true
      
      path.unite(mainRect)
      path.unite(nose)
      path.unite(tail)
      
      return path
    },
    

    
    // Загрузка изображений
    handleImageUpload(event) {
      const files = Array.from(event.target.files)
      const maxImages = 5
      const remainingSlots = maxImages - this.uploadedImages.length
      
      if (files.length > remainingSlots) {
        alert(`Можно загрузить только ${remainingSlots} изображений`)
        return
      }
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const newImage = {
              name: file.name,
              url: e.target.result,
              file: file,
              useInStickers: true // Сразу помечаем для использования
            }
            
            this.uploadedImages.push(newImage)
            
            // НЕ обновляем канвас при загрузке изображений - только генерируем стикеры
            const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
            if (selectedMasks.length > 0) {
              this.generateOptimalStickers()
            }
          }
          reader.readAsDataURL(file)
        }
      })
      
      event.target.value = ''
    },
    
    // Удаление изображения
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
      
      // НЕ обновляем канвас при удалении изображений - только генерируем стикеры
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      if (selectedMasks.length > 0 && this.uploadedImages.length > 0) {
        this.generateOptimalStickers()
      }
    },
    
    // Обновление канваса с изображениями
    updateCanvasWithImages() {
      if (!this.paperScope) return
      
      // Очищаем канвас
      this.paperScope.project.clear()
      
      // Последовательно создаем слои
      this.createLayersSequentially()
    },
    
    // Последовательное создание слоев
    async createLayersSequentially() {
      if (!this.paperScope) return
      
      console.log('🎨 Начинаем последовательное создание слоев')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 1. Создаем белый слой-прослойку (самый нижний)
      await this.createWhiteOverlayLayer()
      console.log('⬜ Белый слой создан')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 2. Добавляем все выбранные маски с изображениями
      const maskPromises = []
      this.stickerMasks.forEach(mask => {
        if (mask.selected) {
          maskPromises.push(this.addMaskToCanvas(mask))
        }
      })
      
      // Ждем завершения всех операций с масками
      await Promise.all(maskPromises)
      console.log('🎭 Все маски добавлены')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      console.log('✅ Все слои созданы последовательно')
      this.paperScope.view.draw()
      console.log('🎨 Канвас перерисован')
    },
    
    // Создание белого слоя-прослойки
    async createWhiteOverlayLayer() {
      if (!this.paperScope) return
      
      // Удаляем старый слой-прослойку, если он существует
      if (this.whiteOverlayLayer) {
        this.whiteOverlayLayer.remove()
      }
      
      // Скрываем все большие растры перед созданием белого слоя
      this.paperScope.project.activeLayer.children.forEach(child => {
        if (child.className === 'Raster' && child.bounds && 
            (child.bounds.width > 500 || child.bounds.height > 500)) {
          console.log('👁️ Скрываем большой растр:', child.bounds)
          child.visible = false
        }
      })
      console.log('👁️ Все большие растры скрыты')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Создаем белый прямоугольник на весь размер канваса
      const canvasSize = this.paperScope.view.viewSize
      const whiteRect = new this.paperScope.Path.Rectangle(
        new this.paperScope.Point(0, 0),
        new this.paperScope.Point(canvasSize.width, canvasSize.height)
      )
      
      whiteRect.fillColor = 'white'
      whiteRect.strokeColor = null
      
      // Создаем группу для слоя-прослойки
      this.whiteOverlayLayer = new this.paperScope.Group()
      this.whiteOverlayLayer.addChild(whiteRect)
      
      // Добавляем слой-прослойку в проект
      this.paperScope.project.activeLayer.addChild(this.whiteOverlayLayer)
      
      // Перемещаем слой-прослойку под все маски (но поверх больших фотографий)
      this.whiteOverlayLayer.sendToBack()
      
      console.log('🟦 Белый слой-прослойка создан')
      await new Promise(resolve => setTimeout(resolve, 10))
    },
    
    // Обработчики событий ThreeDRenderer
    onThreeInitialized() {
      console.log('✅ ThreeDRenderer инициализирован')
    },
    
    onTextureUpdated() {
      console.log('✅ Текстура ThreeDRenderer обновлена')
    },
    
    onTextureError(error) {
      console.error('❌ Ошибка текстуры ThreeDRenderer:', error)
    }
  }
}
</script>

<style scoped>
.sticker-mania-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px 0;
}

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

.test-canvas {
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

.form-check-label {
  font-size: 0.9rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #016527;
  border-color: #016527;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #016527;
  border-color: #016527;
  color: #fff;
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

.btn-primary {
  background-color: #016527;
  border-color: #016527;
}

.btn-primary:hover {
  background-color: #015a23;
  border-color: #015a23;
}

.form-control-color {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
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

</style>
