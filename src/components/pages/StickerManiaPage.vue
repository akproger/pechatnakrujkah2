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
            <div class="card-body">
              <div class="row align-items-center">
                <!-- Кнопка генерации стикеров -->
                <div class="col">
                  <button 
                    @click="generateStickers" 
                    class="btn btn-primary"
                    :disabled="isLoading"
                  >
                    <i class="bi bi-play me-2"></i>
                    Сгенерировать стикеры
                  </button>
                </div>
                
                <!-- Счетчик стикеров -->
                <div class="d-flex gap-4 ms-auto" style="width: 330px;">
                  <div class="form-group mb-0" style="width: 150px;">
                    <div class="form-label mb-1" style="text-align: left;">Количество стикеров: {{ stickers.length }}</div>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="maxStickers"
                      min="10" 
                      max="100" 
                      step="5"
                      @input="generateStickers"
                    >
                  </div>
                  
                  <div class="form-group mb-0" style="width: 150px;">
                    <div class="form-label mb-1" style="text-align: left;">Размер стикеров: {{ minSize }}-{{ maxSize }}</div>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="stickerSize"
                      min="50" 
                      max="200" 
                      step="10"
                      @input="updateStickerSize"
                    >
                  </div>
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
                  ref="paperCanvas"
                  class="paper-canvas"
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
              <div class="preview-container">
                <canvas 
                  ref="threeCanvas"
                  class="three-canvas"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Тестовый канвас для отладки масок -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">Тестовый канвас для масок</h6>
              <div class="canvas-container" style="height: 600px;">
                <canvas 
                  ref="testCanvas"
                  class="paper-canvas"
                ></canvas>
              </div>
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
                  <h6 class="text-muted mb-3">Выберите формы стикеров</h6>
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
                              @change="generateStickers"
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
                          @change="generateStickers"
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
                          @input="generateStickers"
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
                          @input="generateStickers"
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
                          @input="generateStickers"
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
                          @input="generateStickers"
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
import * as THREE from 'three'
import { markRaw } from 'vue'
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
  data() {
    return {
      // Paper.js
      paperScope: null,
      isLoading: false,
      activeTab: 'shapes',
      
      // Three.js
      threeInstance: markRaw({
        scene: null,
        camera: null,
        renderer: null,
        cylinder: null,
        printSurface: null,
        mugGroup: null,
        animationId: null
      }),
      
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
      strokeWidth: 10, // Проценты (0-20)
      shadowBlur: 5, // Проценты (0-50)
      shadowOffsetX: 10, // Проценты (-50 до +50)
      shadowOffsetY: 10, // Проценты (-50 до +50)
      
      // Стикеры
      stickers: [],
      maxStickers: 50,
      stickerSize: 100, // Размер стикеров
      minSize: 50,
      maxSize: 150
    }
  },
  mounted() {
    this.initPaper()
    this.initTestCanvas()
    this.$nextTick(() => {
      setTimeout(() => {
        this.initThreeJS()
      }, 100)
    })
  },
  beforeUnmount() {
    // Очищаем Three.js анимацию
    if (this.threeInstance.animationId) {
      cancelAnimationFrame(this.threeInstance.animationId)
    }
  },
  methods: {
    // Инициализация Paper.js
    initPaper() {
      const canvas = this.$refs.paperCanvas
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Используем локальную переменную вместо переназначения константы
      const paperInstance = this.paperScope
      
      // Отключаем основной канвас от рендера для тестирования
      // this.resizeCanvas()
      
      // Обработчик изменения размера окна
      // window.addEventListener('resize', this.resizeCanvas)
    },
    
    // Инициализация тестового канваса
    initTestCanvas() {
      const canvas = this.$refs.testCanvas
      this.testPaperScope = new paper.PaperScope()
      this.testPaperScope.setup(canvas)
      
      // Устанавливаем размер тестового канваса
      canvas.width = 1400
      canvas.height = 600
      canvas.style.width = '1400px'
      canvas.style.height = '600px'
      
      this.testPaperScope.view.viewSize = new this.testPaperScope.Size(1400, 600)
      
      // Рисуем тестовую маску (сердце)
      this.drawTestMask()
    },
    
    // Рисование тестовой маски
    drawTestMask() {
      if (!this.testPaperScope) return
      
      // Очищаем канвас
      this.testPaperScope.project.clear()
      
      // Сохраняем ссылки на формы для интерактивности
      this.testForms = []
      
      this.testPaperScope.view.draw()
    },
    
    // Обработчик изменения чекбокса маски
    handleMaskChange(index, event) {
      const mask = this.stickerMasks[index]
      mask.selected = event.target.checked
      
      if (event.target.checked) {
        // Добавляем маску на тестовый канвас
        this.addMaskToTestCanvas(mask)
      } else {
        // Удаляем маску с тестового канваса
        this.removeMaskFromTestCanvas(mask.name)
      }
    },
    
    // Добавить маску на тестовый канвас
    addMaskToTestCanvas(mask) {
      if (!this.testPaperScope) return
      
      // Загружаем SVG маску
      fetch(mask.url)
        .then(response => response.text())
        .then(svgText => {
          this.testPaperScope.project.importSVG(svgText, {
            onLoad: (item) => {
              item.scale(2)
              item.position = new this.testPaperScope.Point(100, 100)
              
              if (item.children && item.children.length > 0) {
                const path = item.children[0]
                path.fillColor = '#ff4757'
                path.strokeColor = '#333'
                path.strokeWidth = 3
              }
              
              // Сохраняем ссылку на элемент
              if (!this.testMaskItems) this.testMaskItems = {}
              this.testMaskItems[mask.name] = item
              
              this.testPaperScope.view.draw()
            }
          })
        })
    },
    
    // Удалить маску с тестового канваса
    removeMaskFromTestCanvas(maskName) {
      if (this.testMaskItems && this.testMaskItems[maskName]) {
        this.testMaskItems[maskName].remove()
        delete this.testMaskItems[maskName]
        this.testPaperScope.view.draw()
      }
    },
    

    
    // Изменение размера канваса
    resizeCanvas() {
      const canvas = this.$refs.paperCanvas
      const container = canvas.parentElement.parentElement // Получаем canvas-container
      const rect = container.getBoundingClientRect()
      
      // Устанавливаем соотношение сторон 19:9
      const targetWidth = rect.width
      const targetHeight = (targetWidth * 9) / 19
      
      // Устанавливаем CSS размер для отображения
      canvas.style.width = targetWidth + 'px'
      canvas.style.height = targetHeight + 'px'
      
      // Устанавливаем внутреннее разрешение canvas
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      if (this.paperScope) {
        this.paperScope.view.viewSize = new this.paperScope.Size(canvas.width, canvas.height)
      }
    },
    
    // Генерация стикеров
    generateStickers() {
      if (!this.paperScope) return
      
      this.isLoading = true
      
      this.paperScope.project.clear()
      
      const viewWidth = this.paperScope.view.viewSize.width
      const viewHeight = this.paperScope.view.viewSize.height
      
      // Получаем выбранные маски и изображения
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      const selectedImages = this.uploadedImages.filter(img => img.useInStickers)
      
      if (selectedMasks.length === 0 || selectedImages.length === 0) {
        this.isLoading = false
        return
      }
      
      // Убираем фоновые изображения - они не нужны для стикеров
      
      this.stickers = []
      
      // Заполняем область стикерами
      for (let i = 0; i < this.maxStickers; i++) {
        const sticker = this.createSticker(selectedMasks, selectedImages, viewWidth, viewHeight)
        if (sticker) {
          this.stickers.push(sticker)
        }
      }
      
      this.paperScope.view.draw()
      
      // Обновляем 3D текстуру
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateThreeTexture()
          this.isLoading = false
        }, 300)
      })
    },
    

    
    // Создание одного стикера
    createSticker(masks, images, viewWidth, viewHeight) {
      // Случайная маска
      const randomMask = masks[Math.floor(Math.random() * masks.length)]
      // Случайное изображение
      const randomImage = images[Math.floor(Math.random() * images.length)]
      
      // Случайный размер (minSize-maxSize единиц)
      const size = this.minSize + Math.random() * (this.maxSize - this.minSize)
      
      // Случайная позиция
      const x = Math.random() * (viewWidth - size)
      const y = Math.random() * (viewHeight - size)
      
      // Проверяем перекрытие с существующими стикерами
      if (this.checkOverlap(x, y, size)) {
        return null
      }
      
      // Создаем стикер
      const sticker = new this.paperScope.Group()
      
      // Создаем маску из SVG
      const maskPath = this.createMaskFromSVG(randomMask, x + size/2, y + size/2, size/2)
      
      // Создаем растр из изображения
      const raster = new this.paperScope.Raster(randomImage.url)
      
      raster.onLoad = () => {
        // Создаем временный canvas для обрезки изображения
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Получаем границы маски
        const maskBounds = maskPath.bounds
        
        // Устанавливаем размер canvas равным размеру маски
        tempCanvas.width = maskBounds.width
        tempCanvas.height = maskBounds.height
        
        // Применяем обрезку по форме маски
        tempCtx.save()
        tempCtx.translate(-maskBounds.x, -maskBounds.y)
        
        // Создаем путь для обрезки
        tempCtx.beginPath()
        
        // Проверяем, является ли маска кругом
        if (maskPath.constructor.name === 'Circle') {
          // Для круга используем arc с координатами относительно переведенного контекста
          const center = maskPath.bounds.center
          const radius = maskPath.radius
          
          // Вычисляем центр относительно переведенного контекста
          const relativeCenterX = center.x - maskBounds.x
          const relativeCenterY = center.y - maskBounds.y
          
          tempCtx.arc(relativeCenterX, relativeCenterY, radius, 0, 2 * Math.PI)
        } else {
          // Для остальных форм используем сегменты
          if (maskPath.segments && maskPath.segments.length > 0) {
            const firstPoint = maskPath.segments[0].point
            tempCtx.moveTo(firstPoint.x, firstPoint.y)
            
            for (let i = 1; i < maskPath.segments.length; i++) {
              const segment = maskPath.segments[i]
              tempCtx.lineTo(segment.point.x, segment.point.y)
            }
          }
        }
        
        tempCtx.closePath()
        tempCtx.clip()
        
        // Рисуем изображение на canvas с сохранением пропорций
        const imgWidth = raster.image.width
        const imgHeight = raster.image.height
        const canvasWidth = maskBounds.width
        const canvasHeight = maskBounds.height
        
        // Вычисляем масштаб для сохранения пропорций
        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight
        const scale = Math.max(scaleX, scaleY)
        
        // Вычисляем размеры масштабированного изображения
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        
        // Центрируем изображение относительно переведенного контекста
        const offsetX = (canvasWidth - scaledWidth) / 2
        const offsetY = (canvasHeight - scaledHeight) / 2
        
        tempCtx.drawImage(
          raster.image,
          offsetX, offsetY, scaledWidth, scaledHeight
        )
        
        tempCtx.restore()
        
        // Конвертируем canvas в dataURL
        const maskedImageUrl = tempCanvas.toDataURL()
        
        // Создаем новый растр с обрезанным изображением
        const maskedRaster = new this.paperScope.Raster(maskedImageUrl)
        
        maskedRaster.onLoad = () => {
          // Устанавливаем позицию точно в центр маски
          maskedRaster.position = maskPath.bounds.center
          
          // Создаем контур для обводки и тени
          const outlinePath = maskPath.clone()
          
          // Применяем обводку и тень к контуру
          const strokeWidthPixels = (this.strokeWidth / 100) * size
          outlinePath.strokeColor = this.strokeColor
          outlinePath.strokeWidth = strokeWidthPixels
          outlinePath.fillColor = null
          
          outlinePath.shadowColor = 'rgba(0, 0, 0, 0.3)'
          outlinePath.shadowBlur = (this.shadowBlur / 100) * size
          outlinePath.shadowOffset = new this.paperScope.Point(
            (this.shadowOffsetX / 100) * size,
            (this.shadowOffsetY / 100) * size
          )
          
          // Добавляем элементы в группу стикера
          sticker.addChild(maskedRaster)
          sticker.addChild(outlinePath)
          
          this.paperScope.project.activeLayer.addChild(sticker)
        }
      }
      

      

      
      return sticker
    },
    
    // Проверка перекрытия стикеров
    checkOverlap(x, y, size) {
      const margin = 10 // Минимальное расстояние между стикерами
      
      for (const sticker of this.stickers) {
        const stickerBounds = sticker.bounds
        const newBounds = {
          left: x - margin,
          top: y - margin,
          right: x + size + margin,
          bottom: y + size + margin
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
    
    // Обновление размера стикеров
    updateStickerSize() {
      const sizeRange = this.stickerSize
      this.minSize = Math.max(30, sizeRange - 50)
      this.maxSize = Math.min(200, sizeRange + 50)
      this.generateStickers()
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
            this.generateStickers()
          }
          reader.readAsDataURL(file)
        }
      })
      
      event.target.value = ''
    },
    
    // Удаление изображения
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
      this.generateStickers()
    },
    
    // Инициализация Three.js
    initThreeJS() {
      const canvas = this.$refs.threeCanvas
      
      // Сцена
      this.threeInstance.scene = new THREE.Scene()
      
      // Камера
      this.threeInstance.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      this.threeInstance.camera.position.set(15, 0, 15)
      this.threeInstance.camera.lookAt(0, 0, 0)
      
      // Рендерер
      this.threeInstance.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
      this.threeInstance.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      this.threeInstance.renderer.setClearColor(0x000000, 0)
      
      // Освещение
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      this.threeInstance.scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      this.threeInstance.scene.add(directionalLight)
      
      // Создаем кружку (цилиндр)
      const cylinderGeometry = new THREE.CylinderGeometry(4, 4, 9.5, 32)
      const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
      this.threeInstance.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
      
      // Группа для кружки
      this.threeInstance.mugGroup = new THREE.Group()
      this.threeInstance.mugGroup.add(this.threeInstance.cylinder)
      this.threeInstance.scene.add(this.threeInstance.mugGroup)
      
      // Поверхность для печати
      const printGeometry = new THREE.PlaneGeometry(16, 8.5)
      const printMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      })
      this.threeInstance.printSurface = new THREE.Mesh(printGeometry, printMaterial)
      this.threeInstance.printSurface.position.z = 4.01
      this.threeInstance.mugGroup.add(this.threeInstance.printSurface)
      
      // Анимация вращения
      const animate = () => {
        this.threeInstance.animationId = requestAnimationFrame(animate)
        this.threeInstance.mugGroup.rotation.y += 0.01
        this.threeInstance.renderer.render(this.threeInstance.scene, this.threeInstance.camera)
      }
      animate()
      
      // Обработчик изменения размера
      window.addEventListener('resize', this.resizeThreeCanvas)
    },
    
    // Изменение размера Three.js канваса
    resizeThreeCanvas() {
      const canvas = this.$refs.threeCanvas
      this.threeInstance.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.threeInstance.camera.updateProjectionMatrix()
      this.threeInstance.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    },
    
    // Обновление текстуры 3D модели
    updateThreeTexture() {
      if (!this.threeInstance.printSurface || !this.paperScope) return
      
      const canvas = this.$refs.paperCanvas
      const texture = new THREE.CanvasTexture(canvas)
      
      if (this.threeInstance.printSurface.material.map) {
        this.threeInstance.printSurface.material.map.dispose()
      }
      
      this.threeInstance.printSurface.material.map = texture
      this.threeInstance.printSurface.material.needsUpdate = true
      
      console.log('✅ Текстура обновлена успешно')
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

.paper-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
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

.preview-container {
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* Квадратное соотношение для 3D превью */
  position: relative;
  background: #fff;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
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
</style>
