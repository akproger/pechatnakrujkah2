<template>
  <div class="grids-page">
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">Сетки</h2>
          <p class="text-muted">Инструмент для создания массива масок</p>
        </div>
      </div>
      
      <!-- Вкладки и ползунки управления -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <!-- Вкладки по типам масок -->
                <div class="btn-group" role="group" aria-label="Типы масок">
                  <input type="radio" class="btn-check" name="maskType" id="rectangle" value="rectangle" v-model="maskType">
                  <label class="btn btn-outline-primary" for="rectangle">Параллелепипед</label>
                  
                  <input type="radio" class="btn-check" name="maskType" id="triangle" value="triangle" v-model="maskType">
                  <label class="btn btn-outline-primary" for="triangle">Треугольники</label>
                  
                  <input type="radio" class="btn-check" name="maskType" id="hexagon" value="hexagon" v-model="maskType">
                  <label class="btn btn-outline-primary" for="hexagon">Шестиугольники</label>
                  
                  <input type="radio" class="btn-check" name="maskType" id="diamond" value="diamond" v-model="maskType">
                  <label class="btn btn-outline-primary" for="diamond">Ромбы</label>
                </div>
                
                <!-- Ползунки управления -->
                <div class="d-flex align-items-center gap-4">
                  <div class="form-group mb-0" style="display: flex;">
                    <label for="gridRowsSlider" class="form-label me-2">Строки: {{ gridRows }}</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      id="gridRowsSlider"
                      v-model.number="gridRows"
                      min="1" 
                      max="10" 
                      step="1"
                      style="width: 150px;"
                    >
                  </div>
                  
                  <div class="form-group mb-0" style="display: flex;">
                    <label for="gridColsSlider" class="form-label me-2">Столбцы: {{ gridCols }}</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      id="gridColsSlider"
                      v-model.number="gridCols"
                      min="1" 
                      max="20" 
                      step="1"
                      style="width: 150px;"
                    >
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
      
            <!-- Canvas область -->
      <div class="row">
        <div class="col">
          <div class="card">
            <div class="card-body p-0">
              <canvas 
                ref="paperCanvas"
                class="paper-canvas"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              ></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Кнопки управления -->
      <div class="row mt-3">
        <div class="col-12">
          <div class="d-flex gap-2">
            <button 
              @click="toggleSettings" 
              class="btn btn-outline-secondary"
              type="button"
            >
              <i class="bi" :class="showSettings ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              Дополнительные настройки
            </button>
            
            <button 
              @click="toggleImages" 
              class="btn btn-outline-primary"
              type="button"
            >
              <i class="bi" :class="showImages ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              Изображения
            </button>
          </div>
        </div>
      </div>
      
      <!-- Дополнительные настройки -->
      <div class="row mt-3" v-show="showSettings">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              
              <div class="row g-3">
                <!-- Внешний отступ -->
                <div class="col-md-4">
                  <h6 class="text-muted mb-3">Отступ</h6>
                  <div class="form-group">
                    <label class="form-label">Внешний отступ: {{ externalMargin }}%</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="externalMargin"
                      min="0" 
                      max="50" 
                      step="1"
                    >
                  </div>
                </div>
                
                <!-- Обводка -->
                <div class="col-md-4">
                  <h6 class="text-muted mb-3">Обводка</h6>
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
                    <label class="form-label">Толщина обводки: {{ strokeWidth }}px</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="strokeWidth"
                      min="0" 
                      max="10" 
                      step="0.5"
                    >
                  </div>
                </div>
                
                <!-- Тень -->
                <div class="col-md-4">
                  <h6 class="text-muted mb-3">Тень</h6>
                  <div class="form-group">
                    <label class="form-label">Размытие тени: {{ shadowBlur }}px</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="shadowBlur"
                      min="0" 
                      max="50" 
                      step="1"
                    >
                  </div>
                  <div class="form-group mt-2">
                    <label class="form-label">Позиция X: {{ shadowOffsetX }}px</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="shadowOffsetX"
                      min="-50" 
                      max="50" 
                      step="1"
                    >
                  </div>
                  <div class="form-group mt-2">
                    <label class="form-label">Позиция Y: {{ shadowOffsetY }}px</label>
                    <input 
                      type="range" 
                      class="form-range" 
                      v-model.number="shadowOffsetY"
                      min="-50" 
                      max="50" 
                      step="1"
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
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Панель изображений -->
      <div class="row mt-3" v-show="showImages">
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
                    class="btn btn-primary"
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
                          class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          style="width: 20px; height: 20px; padding: 0; border-radius: 50%;"
                        >
                          <i class="bi bi-x" style="font-size: 10px;"></i>
                        </button>
                      </div>
                      <small class="text-muted d-block mt-1">{{ image.name }}</small>
                      <div class="form-check mt-2">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="'image-' + index"
                          v-model="image.useInGrid"
                          @change="handleImageGridChange(index, $event)"
                        >
                        <label class="form-check-label" :for="'image-' + index">
                          В сетке
                        </label>
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

export default {
  name: 'GridsPage',
  data() {
    return {
      gridRows: 5,
      gridCols: 5,
      maskType: 'rectangle',
      paperScope: null,
      selectedCell: null,
      touchStartPos: null,
      // Дополнительные настройки
      externalMargin: 0,
      strokeColor: '#000000',
      strokeWidth: 1,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 50,
      showSettings: false,
      showImages: false,
      uploadedImages: []
    }
  },
  
  watch: {
    // Автоматическое применение изменений ползунков
    gridRows() {
      this.generateGrid()
    },
    gridCols() {
      this.generateGrid()
    },
    maskType() {
      this.generateGrid()
    },
    // Дополнительные настройки
    externalMargin() {
      this.generateGrid()
    },
    strokeColor() {
      this.generateGrid()
    },
    strokeWidth() {
      this.generateGrid()
    },
    shadowBlur() {
      this.generateGrid()
    },
    shadowOffsetX() {
      this.generateGrid()
    },
    shadowOffsetY() {
      this.generateGrid()
    },
    shadowOpacity() {
      this.generateGrid()
    },
    // Обновляем сетку при изменении изображений
    uploadedImages: {
      handler() {
        this.generateGrid()
      },
      deep: true
    }
  },
  mounted() {
    this.initPaper()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    initPaper() {
      const canvas = this.$refs.paperCanvas
      
      // Устанавливаем размеры canvas сначала
      this.resizeCanvas()
      
      // Инициализируем Paper.js с canvas
      paper.setup(canvas)
      this.paperScope = paper
      
      // Создаем базовую сетку
      this.generateGrid()
      
      // Обработчик изменения размера окна
      window.addEventListener('resize', this.resizeCanvas)
    },
    
    resizeCanvas() {
      const canvas = this.$refs.paperCanvas
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      
      canvas.width = rect.width
      canvas.height = 400
      
      if (this.paperScope) {
        paper.view.viewSize = new paper.Size(canvas.width, canvas.height)
        this.generateGrid()
      }
    },
    
    generateGrid() {
      if (!this.paperScope) return
      
      paper.project.clear()
      
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      const cellWidth = viewWidth / this.gridCols
      const cellHeight = viewHeight / this.gridRows
      
             // Создаем группу для масок
       const maskGroup = new paper.Group()
      
      switch (this.maskType) {
        case 'rectangle':
          this.createRectangleMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'triangle':
          this.createTriangleMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'diamond':
          this.createDiamondMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'hexagon':
          this.createHexagonMasks(maskGroup, cellWidth, cellHeight)
          break
      }
      
      paper.view.draw()
    },
    
    toggleSettings() {
      this.showSettings = !this.showSettings
    },
    
    toggleImages() {
      this.showImages = !this.showImages
    },
    
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
              useInGrid: false
            }
            
            
            
            this.uploadedImages.push(newImage)
          }
          reader.readAsDataURL(file)
        }
      })
      
      // Очищаем input для возможности повторной загрузки тех же файлов
      event.target.value = ''
    },
    
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    
    handleImageGridChange(index, event) {
      // Обновляем состояние
      this.uploadedImages[index].useInGrid = event.target.checked
      
      // Перегенерируем сетку
      this.generateGrid()
    },
    
    getImagesForGrid() {
      return this.uploadedImages.filter(img => img.useInGrid)
    },
    
      getImageForPosition(row, col, totalImages) {
    // Отображаем изображение в первых трех масках (0, 0), (0, 1) и (0, 2)
    if ((row === 0 && col === 0) || (row === 0 && col === 1) || (row === 0 && col === 2)) {
      const gridImages = this.getImagesForGrid()
      if (gridImages.length === 0) {
        return null
      }
      
      // Распределяем изображения по маскам
      let imageIndex = 0
      if (row === 0 && col === 0) imageIndex = 0
      else if (row === 0 && col === 1) imageIndex = 1
      else if (row === 0 && col === 2) imageIndex = 2
      
      return gridImages[imageIndex % gridImages.length] || gridImages[0]
    }
    return null // Для всех остальных позиций - без изображения
  },
    
    getHexagonPoints(width, height) {
      // Создаем точки шестиугольника с учетом пропорций
      const centerX = width / 2
      const centerY = height / 2
      
      // Используем меньшую сторону для радиуса, чтобы шестиугольник поместился
      const radius = Math.min(width, height) / 2 * 0.9 // Немного уменьшаем для отступов
      
      const points = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6 // Смещаем на 30 градусов чтобы верхняя точка была сверху
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push({ x, y })
      }
      
      return points
    },
    
    applyMaskStyles(mask, imageUrl = null) {
      // Применяем настройки обводки
      mask.strokeColor = this.strokeColor
      mask.strokeWidth = this.strokeWidth
      
      if (imageUrl) {
        // Если есть изображение, скрываем маску и создаем растр
        mask.visible = false
        
        // Создаем растр из URL
        const raster = new paper.Raster(imageUrl)
        
        // Сразу скрываем оригинальный растр, чтобы он не перекрывал маски
        raster.visible = false
        
        console.log('🖼️ Создан и скрыт оригинальный растр:', {
          visible: raster.visible,
          bounds: raster.bounds
        })
        
        raster.onLoad = () => {
          console.log('🎨 Начинаем обрезание изображения для маски:', {
            maskType: mask.data?.type,
            maskBounds: mask.bounds,
            rasterBounds: raster.bounds,
            imageSize: { width: raster.image.width, height: raster.image.height }
          })
          
          // Создаем временный canvas для обрезания изображения
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          
          // Получаем размеры маски
          const maskBounds = mask.bounds
          tempCanvas.width = maskBounds.width
          tempCanvas.height = maskBounds.height
          
          // Очищаем canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          // Создаем путь маски на canvas
          tempCtx.save() // Сохраняем состояние
          tempCtx.beginPath()
          
          // Для прямоугольников создаем прямоугольный путь
          if (mask.data && mask.data.type === 'rectangle') {
            tempCtx.rect(0, 0, maskBounds.width, maskBounds.height)
          } else if (mask.data && mask.data.type === 'triangle') {
            // Для треугольников учитываем ориентацию
            console.log('🔺 Данные треугольника:', {
              maskData: mask.data,
              inverted: mask.data.inverted,
              row: mask.data.row,
              col: mask.data.col
            })
            
            // Определяем перевернутый ли треугольник по позиции в шахматном паттерне
            const isInverted = (mask.data.row + mask.data.col) % 2 === 1
            
            if (isInverted) {
              // Перевернутый треугольник - нижняя точка, затем левый и правый верхние углы
              tempCtx.moveTo(maskBounds.width / 2, maskBounds.height) // Нижняя точка
              tempCtx.lineTo(0, 0) // Левый верхний угол
              tempCtx.lineTo(maskBounds.width, 0) // Правый верхний угол
            } else {
              // Обычный треугольник - верхний угол, затем левый и правый нижние углы
              tempCtx.moveTo(maskBounds.width / 2, 0) // Верхняя точка
              tempCtx.lineTo(0, maskBounds.height) // Левый нижний угол
              tempCtx.lineTo(maskBounds.width, maskBounds.height) // Правый нижний угол
            }
            tempCtx.closePath()
          } else if (mask.data && mask.data.type === 'diamond') {
            // Для ромбов создаем ромбовидный путь
            tempCtx.moveTo(maskBounds.width / 2, 0)
            tempCtx.lineTo(0, maskBounds.height / 2)
            tempCtx.lineTo(maskBounds.width / 2, maskBounds.height)
            tempCtx.lineTo(maskBounds.width, maskBounds.height / 2)
            tempCtx.closePath()
          } else if (mask.data && mask.data.type === 'hexagon') {
            // Для шестиугольников копируем реальные сегменты маски
            tempCtx.beginPath()
            
            if (mask.segments && mask.segments.length > 0) {
              // Используем реальные сегменты маски
              const firstPoint = mask.segments[0].point
              const relativeFirstPoint = new paper.Point(
                firstPoint.x - maskBounds.x,
                firstPoint.y - maskBounds.y
              )
              tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
              
              for (let i = 1; i < mask.segments.length; i++) {
                const segment = mask.segments[i]
                const relativePoint = new paper.Point(
                  segment.point.x - maskBounds.x,
                  segment.point.y - maskBounds.y
                )
                tempCtx.lineTo(relativePoint.x, relativePoint.y)
              }
            } else {
              // Fallback - создаем шестиугольник
              const hexPoints = this.getHexagonPoints(maskBounds.width, maskBounds.height)
              tempCtx.moveTo(hexPoints[0].x, hexPoints[0].y)
              for (let i = 1; i < hexPoints.length; i++) {
                tempCtx.lineTo(hexPoints[i].x, hexPoints[i].y)
              }
            }
            
            tempCtx.closePath()
            
            console.log('🔷 Копируем реальные сегменты шестиугольника:', {
              segmentsCount: mask.segments ? mask.segments.length : 0,
              maskBounds: { width: maskBounds.width, height: maskBounds.y }
            })
          } else {
            // Fallback для прямоугольников
            tempCtx.rect(0, 0, maskBounds.width, maskBounds.height)
          }
          
          // Применяем обрезание
          tempCtx.clip()
          
          // Рисуем изображение на canvas с сохранением пропорций
          const imgWidth = raster.image.width
          const imgHeight = raster.image.height
          const canvasWidth = tempCanvas.width
          const canvasHeight = tempCanvas.height
          
          // Вычисляем масштаб для сохранения пропорций
          const scaleX = canvasWidth / imgWidth
          const scaleY = canvasHeight / imgHeight
          const scale = Math.max(scaleX, scaleY) // Используем Math.max чтобы изображение заполнило всю область
          
          // Вычисляем размеры масштабированного изображения
          const scaledWidth = imgWidth * scale
          const scaledHeight = imgHeight * scale
          
          // Центрируем изображение
          const offsetX = (canvasWidth - scaledWidth) / 2
          const offsetY = (canvasHeight - scaledHeight) / 2
          
          console.log('📐 Масштабирование изображения:', {
            originalSize: { width: imgWidth, height: imgHeight },
            canvasSize: { width: canvasWidth, height: canvasHeight },
            scale: scale,
            scaledSize: { width: scaledWidth, height: scaledHeight },
            offset: { x: offsetX, y: offsetY }
          })
          
          tempCtx.drawImage(
            raster.image,
            offsetX, offsetY, scaledWidth, scaledHeight
          )
          
          tempCtx.restore() // Восстанавливаем состояние
          
          // Конвертируем canvas в dataURL
          const maskedImageUrl = tempCanvas.toDataURL()
          
          // Создаем новый растр с обрезанным изображением
          const maskedRaster = new paper.Raster(maskedImageUrl)
          
          maskedRaster.onLoad = () => {
            // Устанавливаем позицию точно в центр маски
            maskedRaster.position = maskBounds.center
            
            // Копируем данные и стили
            maskedRaster.data = mask.data
            maskedRaster.strokeColor = this.strokeColor
            maskedRaster.strokeWidth = this.strokeWidth
            
            // Применяем тень
            this.applyShadowToRaster(maskedRaster)
            
            // Сохраняем родительскую группу и позицию маски
            const parentGroup = mask.parent
            const maskIndex = parentGroup ? parentGroup.children.indexOf(mask) : -1
            
            // Удаляем оригинальную маску
            if (mask.parent) {
              mask.remove()
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
            
            // Обновляем view
            paper.view.update()
            
            console.log('✅ Обрезанное изображение создано и добавлено:', {
              maskedRasterVisible: maskedRaster.visible,
              maskedRasterBounds: maskedRaster.bounds,
              parentGroupChildren: parentGroup ? parentGroup.children.length : 'no parent'
            })
          }
        }
        
        raster.onError = () => {
          // Если изображение не загрузилось, показываем маску с обычной заливкой
          mask.visible = true
          mask.fillColor = '#016527'
          mask.fillOpacity = 0.3
          this.applyShadowToPath(mask)
        }
        
      } else {
        // Обычная заливка без изображения
        mask.fillColor = '#016527'
        mask.fillOpacity = 0.3
        
        // Применяем настройки тени
        this.applyShadowToPath(mask)
      }
    },
    
    applyShadowToPath(path) {
      // Применяем настройки тени к Path
      if (this.shadowBlur > 0 || this.shadowOffsetX !== 0 || this.shadowOffsetY !== 0) {
        const shadowColor = new paper.Color(0, 0, 0, this.shadowOpacity / 100)
        path.shadowColor = shadowColor
        path.shadowBlur = this.shadowBlur
        path.shadowOffset = new paper.Point(this.shadowOffsetX, this.shadowOffsetY)
        
        // Принудительно обновляем отображение
        path.shadowColor = shadowColor
      } else {
        path.shadowColor = null
        path.shadowBlur = 0
        path.shadowOffset = null
      }
    },
    
    applyShadowToRaster(raster) {
      // Применяем настройки тени к Raster
      if (this.shadowBlur > 0 || this.shadowOffsetX !== 0 || this.shadowOffsetY !== 0) {
        const shadowColor = new paper.Color(0, 0, 0, this.shadowOpacity / 100)
        raster.shadowColor = shadowColor
        raster.shadowBlur = this.shadowBlur
        raster.shadowOffset = new paper.Point(this.shadowOffsetX, this.shadowOffsetY)
        
        // Принудительно обновляем отображение
        raster.shadowColor = shadowColor
      } else {
        raster.shadowColor = null
        raster.shadowBlur = 0
        raster.shadowOffset = null
      }
    },
    
    createRectangleMasks(group, cellWidth, cellHeight) {
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      const adjustedWidth = cellWidth - margin * 2
      const adjustedHeight = cellHeight - margin * 2
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const x = col * cellWidth + margin
          const y = row * cellHeight + margin
          
          const rect = new paper.Path.Rectangle({
            point: [x, y],
            size: [adjustedWidth, adjustedHeight]
          })
          
          // Получаем изображение для данной позиции
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(rect, image ? image.url : null)
          
          // Добавляем маску в группу
          group.addChild(rect)
          
          rect.data = { row, col, type: 'rectangle' }
          this.addMaskInteractivity(rect)
        }
      }
    },
    
    createTriangleMasks(group, cellWidth, cellHeight) {
      // Создаем треугольники в шахматном порядке, используя gridRows и gridCols
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      
      // Вычисляем размеры треугольника
      const triangleHeight = cellHeight // Высота треугольника равна высоте ячейки
      const triangleBaseWidth = cellWidth * 2 // Основание треугольника равно 2 ячейкам
      
      // Используем gridRows и gridCols для определения количества
      const numRows = this.gridRows
      const numTriangles = this.gridCols
      
      // Начинаем от левого края с половины основания первого треугольника
      const startX = -cellWidth * 0.5
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numTriangles; col++) {
          const x = startX + col * triangleBaseWidth + margin
          const y = row * triangleHeight + margin
          const isEven = (row + col) % 2 === 0
          
          let triangle
          if (isEven) {
            // Треугольник вершиной вверх
            triangle = new paper.Path({
              segments: [
                [x + (cellWidth - margin * 2) / 2, y], // вершина
                [x - (cellWidth - margin * 2) * 1.5125, y + (cellHeight - margin * 2)], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y + (cellHeight - margin * 2)] // правый угол основания
              ],
              closed: true
            })
          } else {
            // Треугольник основанием вверх
            triangle = new paper.Path({
              segments: [
                [x - (cellWidth - margin * 2) * 1.5125, y], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y], // правый угол основания
                [x + (cellWidth - margin * 2) / 2, y + (cellHeight - margin * 2)] // вершина
              ],
              closed: true
            })
          }
          
          // Получаем изображение для данной позиции
          const gridImages = this.getImagesForGrid()
          const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(triangle, image ? image.url : null)
          
          triangle.data = { row, col: Math.floor(col), type: 'triangle', isEven }
          this.addMaskInteractivity(triangle)
          
          // Добавляем маску в группу
          group.addChild(triangle)
        }
      }
    },
    
    createDiamondMasks(group, cellWidth, cellHeight) {
      // Создаем ромбы в шахматном порядке, используя gridRows и gridCols
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      
      // Вычисляем размеры ромба
      const diamondWidth = cellWidth * 2
      const diamondHeight = cellHeight * 2
      
      // Используем gridRows и gridCols для определения количества
      const numRows = this.gridRows
      const numDiamonds = this.gridCols
      
      // Начинаем от левого края с половины ширины первого ромба
      const startX = -cellWidth * 0.5
      // Начинаем сверху с половины высоты ромба за верхней границей
      const startY = -cellHeight * 0.5
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numDiamonds; col++) {
          const isEven = (row + col) % 2 === 0
          
          if (isEven) {
            // Ромб - по сути два треугольника, соединенные основаниями
            const x = startX + col * diamondWidth + margin
            const y = startY + row * diamondHeight + margin
            
            const diamond = new paper.Path({
              segments: [
                [x + (cellWidth - margin * 2) / 2, y - (cellHeight - margin * 2) * 1.49592857723], // верхняя вершина
                [x + (cellWidth - margin * 2) * 2.487375, y + (cellHeight - margin * 2) / 2], // правая середина
                [x + (cellWidth - margin * 2) / 2, y + (cellHeight - margin * 2) * 2.49592857723], // нижняя вершина
                [x - (cellWidth - margin * 2) * 1.487375, y + (cellHeight - margin * 2) / 2] // левая середина
              ],
              closed: true
            })
            
            // Получаем изображение для данной позиции
            const gridImages = this.getImagesForGrid()
            const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
            
            // Применяем настройки обводки и тени
            this.applyMaskStyles(diamond, image ? image.url : null)
            
            diamond.data = { row, col: Math.floor(col), type: 'diamond', isEven }
            this.addMaskInteractivity(diamond)
            
            // Добавляем маску в группу
            group.addChild(diamond)
          }
        }
      }
    },
    
    createHexagonMasks(group, cellWidth, cellHeight) {
      // Создаем шестиугольники с динамическим размером для правильного покрытия
      const totalWidth = paper.view.viewSize.width
      const totalHeight = paper.view.viewSize.height
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      
      // Вычисляем оптимальный размер шестиугольника для покрытия canvas + 50% за границами
      // Учитываем смещение в шахматном порядке (чередующиеся ряды)
      const adjustedCols = this.gridCols + 1 // +1 для учета смещения
      const adjustedRows = this.gridRows + 1 // +1 для покрытия краев
      
      // Расчет размеров с учетом количества строк и столбцов
      const hexWidth = (totalWidth * 1.5) / adjustedCols
      
      // Расчет высоты с учетом выхода за нижнюю границу на 50% от размера шестиугольника
      let hexHeight
      if (this.gridRows > 1) {
        // Для более чем 1 строки: последняя строка должна уходить за границу на 50% от размера
        // Учитываем, что шестиугольники начинаются с startY = -hexHeight * 0.5
        // Формула: totalHeight + hexHeight * 0.5 = this.gridRows * hexHeight
        // Отсюда: hexHeight = totalHeight / (this.gridRows - 0.5)
        // Увеличиваем коэффициент для точного выхода на 50%
        hexHeight = totalHeight / (this.gridRows - 0.97405)
      } else {
        // Для 1 строки: стандартный расчет
        hexHeight = (totalHeight * 1.5) / adjustedRows
      }
      
      // Расчет размеров для неравносторонних шестиугольников
      // Расстояние между центрами остается постоянным, изменяется только форма
      
      // Начинаем с отрицательных координат для правильного заполнения
      const startX = -hexWidth * 0.5
      const startY = -hexHeight * 0.5
      
              for (let row = 0; row < this.gridRows; row++) {
          for (let col = 0; col < this.gridCols; col++) {
            const centerX = startX + col * hexWidth + hexWidth / 2 + margin
            const centerY = startY + row * hexHeight + hexHeight / 2 + margin
          
          // Смещение для плотного расположения (постоянное расстояние)
          const offsetX = row % 2 === 0 ? 0 : hexWidth * 0.5
          
          // Создаем неравносторонний шестиугольник через Path
          const hexagon = new paper.Path({
            segments: [
              // Верхняя вершина
              [centerX + offsetX, centerY - (hexHeight - margin * 2) * 0.663065],
              // Верхний правый угол
              [centerX + offsetX + (hexWidth - margin * 2) / 2, centerY - (hexHeight - margin * 2) * 0.3315325],
              // Нижний правый угол
              [centerX + offsetX + (hexWidth - margin * 2) / 2, centerY + (hexHeight - margin * 2) * 0.3315325],
              // Нижняя вершина
              [centerX + offsetX, centerY + (hexHeight - margin * 2) * 0.663065],
              // Нижний левый угол
              [centerX + offsetX - (hexWidth - margin * 2) / 2, centerY + (hexHeight - margin * 2) * 0.3315325],
              // Верхний левый угол
              [centerX + offsetX - (hexWidth - margin * 2) / 2, centerY - (hexHeight - margin * 2) * 0.3315325]
            ],
            closed: true
          })
          
          // Получаем изображение для данной позиции
          const gridImages = this.getImagesForGrid()
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(hexagon, image ? image.url : null)
          
          hexagon.data = { row, col, type: 'hexagon' }
          this.addMaskInteractivity(hexagon)
          
          // Добавляем маску в группу
          group.addChild(hexagon)
        }
      }
    },
    

    
    addMaskInteractivity(mask) {
      // События мыши для интерактивности
      mask.onMouseEnter = () => {
        mask.fillOpacity = 0.6
      }
      
      mask.onMouseLeave = () => {
        mask.fillOpacity = 0.3
      }
      
      mask.onMouseDown = () => {
        this.selectedCell = mask
        mask.fillOpacity = 0.8
        mask.strokeColor = '#016527'
        mask.strokeWidth = 2
      }
      
      mask.onMouseUp = () => {
        if (this.selectedCell === mask) {
          mask.fillOpacity = 0.6
        }
        this.selectedCell = null
        mask.strokeColor = '#dee2e6'
        mask.strokeWidth = 1
      }
    },
    
    clearCanvas() {
      if (this.paperScope) {
        paper.project.clear()
        paper.view.draw()
      }
    },
    
    // Touch события для мобильных устройств
    handleTouchStart(e) {
      e.preventDefault()
      const touch = e.touches[0]
      this.touchStartPos = {
        x: touch.clientX,
        y: touch.clientY
      }
    },
    
    handleTouchMove(e) {
      e.preventDefault()
    },
    
    handleTouchEnd(e) {
      e.preventDefault()
      if (this.touchStartPos) {
        // Симуляция клика для touch устройств
        const touch = e.changedTouches[0]
        const canvas = this.$refs.paperCanvas
        const rect = canvas.getBoundingClientRect()
        
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        // Конвертируем в координаты Paper.js
        const point = new paper.Point(x, y)
        const hit = paper.project.hitTest(point)
        
        if (hit && hit.item) {
          hit.item.onMouseDown()
        }
        
        this.touchStartPos = null
      }
    },
    
    // Mouse события для десктопа
    handleMouseDown(e) {
      // Paper.js обрабатывает события автоматически
    },
    
    handleMouseMove(e) {
      // Paper.js обрабатывает события автоматически
    },
    
    handleMouseUp(e) {
      // Paper.js обрабатывает события автоматически
    },
    
    cleanup() {
      window.removeEventListener('resize', this.resizeCanvas)
      
      if (this.paperScope) {
        // В Paper.js v0.12 нет метода remove для глобального объекта
        paper.project.clear()
        this.paperScope = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.grids-page {
  .page-title {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}

.paper-canvas {
  width: 100%;
  height: 400px;
  border: 1px solid #dee2e6;
  cursor: crosshair;
  touch-action: none; // Отключаем стандартные touch события браузера
  
  &:focus {
    outline: none;
  }
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.card-title {
  margin-bottom: 0;
  color: #495057;
  font-weight: 600;
}

.card {
  border: none;
  background: transparent;
}

.card-body {
  padding: 0;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin: 0;
}

.form-control, .form-select {
  &:focus {
    border-color: #016527;
    box-shadow: 0 0 0 0.2rem rgba(1, 101, 39, 0.25);
  }
}

.btn-primary {
  background-color: #016527;
  border-color: #016527;
  
  &:hover {
    background-color: #015a23;
    border-color: #015a23;
  }
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
  
  &:hover {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #fff;
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 767.98px) {
  .grids-page {
    .card-body {
      padding: 1rem;
    }
    
    .paper-canvas {
      height: 300px;
    }
  }
  
  .row.g-3 > .col-6 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 575.98px) {
  .paper-canvas {
    height: 250px;
  }
  
  .btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
}

/* Стили для touch устройств */
@media (hover: none) and (pointer: coarse) {
  .paper-canvas {
    cursor: pointer;
  }
  
  .btn, .form-control, .form-select {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

