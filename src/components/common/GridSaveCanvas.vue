<template>
  <div class="grid-save-canvas">
    <!-- Кнопка сохранения -->
    <button 
      @click="handleSave" 
      :disabled="isSaving"
      class="save-btn"
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
          {{ isSaving ? 'Сохранение...' : 'Сохранить сетку' }}
        </span>
      </div>
    </button>
    
    <!-- Скрытый canvas для сохранения -->
    <canvas 
      ref="saveCanvas" 
      :width="canvasWidth" 
      :height="canvasHeight"
      style="display: none;"
    ></canvas>
  </div>
</template>

<script>
import paper from 'paper'

export default {
  name: 'GridSaveCanvas',
  props: {
    // Настройки сетки
    gridCols: {
      type: Number,
      required: true
    },
    gridRows: {
      type: Number,
      required: true
    },
    maskType: {
      type: String,
      required: true
    },
    // Изображения для сетки
    uploadedImages: {
      type: Array,
      default: () => []
    },
    // Настройки масок
    strokeColor: {
      type: String,
      default: '#000000'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    externalMargin: {
      type: Number,
      default: 10
    },
    // Текстовые слои
    textLayers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isSaving: false,
      canvasWidth: 1900,
      canvasHeight: 900,
      paperScope: null,
      // Счетчики для асинхронной отрисовки
      totalExpectedElements: 0,
      renderedElements: 0,
      allElementsRendered: false
    }
  },
  mounted() {
    this.initPaper()
  },
  beforeUnmount() {
    if (this.paperScope) {
      this.paperScope.remove()
    }
  },
  methods: {
    initPaper() {
      // Создаем новый PaperScope для сохранения
      this.paperScope = new paper.PaperScope()
      
      // Устанавливаем canvas
      const canvas = this.$refs.saveCanvas
      this.paperScope.setup(canvas)
      
      console.log('🎨 GridSaveCanvas: Paper.js инициализирован')
    },
    
    // Метод для увеличения счетчика отрисованных элементов
    incrementRenderedElements() {
      this.renderedElements++
      console.log(`📊 Элемент отрисован: ${this.renderedElements}/${this.totalExpectedElements}`)
      
      if (this.renderedElements >= this.totalExpectedElements) {
        this.allElementsRendered = true
        console.log('✅ Все элементы отрисованы!')
      }
    },
    
    // Метод для ожидания завершения всех отрисовок
    async waitForAllElementsToRender() {
      console.log('⏳ Ждем завершения отрисовки всех элементов...')
      
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.allElementsRendered) {
            clearInterval(checkInterval)
            console.log('✅ Все элементы отрисованы, продолжаем сохранение')
            resolve()
          }
        }, 100) // Проверяем каждые 100мс
        
        // Fallback timeout на 30 секунд
        setTimeout(() => {
          clearInterval(checkInterval)
          console.log('⚠️ Таймаут ожидания отрисовки, продолжаем сохранение')
          resolve()
        }, 30000)
      })
    },
    
    async handleSave() {
      if (this.isSaving) return
      
      this.isSaving = true
      
      try {
        console.log('🖨️ Начинаем сохранение сетки')
        
        // Сбрасываем счетчики
        this.renderedElements = 0
        this.allElementsRendered = false
        this.totalExpectedElements = 0
        
        // Очищаем canvas
        this.paperScope.project.clear()
        
        // Создаем сетку точно так же, как на основном канвасе
        await this.createGridForSave()
        
        // Ждем завершения всех отрисовок
        await this.waitForAllElementsToRender()
        
        // Ждем завершения всех загрузок изображений
        await this.waitForAllImagesToLoad()
        
        // Добавляем текстовые слои
        await this.addTextLayers()
        
        // Сохраняем изображение
        const result = await this.saveImage()
        
        // Эмитим событие успешного сохранения
        this.$emit('save-success', result)
        
        console.log('✅ Сетка сохранена успешно')
        
      } catch (error) {
        console.error('❌ Ошибка при сохранении сетки:', error)
        this.$emit('save-error', error)
      } finally {
        this.isSaving = false
      }
    },
    
    async createGridForSave() {
      console.log('🎨 Создаем сетку для сохранения:', {
        cols: this.gridCols,
        rows: this.gridRows,
        maskType: this.maskType
      })
      
      // Вычисляем размеры ячеек
      const cellWidth = this.canvasWidth / this.gridCols
      const cellHeight = this.canvasHeight / this.gridRows
      
      console.log('📏 Размеры ячейки:', { cellWidth, cellHeight })
      
      // Подсчитываем ожидаемое количество элементов
      this.totalExpectedElements = this.calculateExpectedElements(cellWidth, cellHeight)
      console.log('📊 Ожидаемое количество элементов:', this.totalExpectedElements)
      
      // Создаем фоновый слой
      this.createBackgroundLayer()
      
      // Создаем группу для масок
      const maskGroup = new this.paperScope.Group()
      
      // Создаем маски в зависимости от типа
      switch (this.maskType) {
        case 'rectangle':
          await this.createRectangleMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'triangle':
          await this.createTriangleMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'diamond':
          await this.createDiamondMasks(maskGroup, cellWidth, cellHeight)
          break
        case 'hexagon':
          await this.createHexagonMasks(maskGroup, cellWidth, cellHeight)
          break
        default:
          console.warn('⚠️ Неизвестный тип маски:', this.maskType)
          break
      }
      
      console.log('✅ Сетка создана для сохранения')
    },
    
    // Метод для подсчета ожидаемого количества элементов
    calculateExpectedElements(cellWidth, cellHeight) {
      let expectedElements = 0
      
      switch (this.maskType) {
        case 'rectangle': {
          const rectanglesNeededForFullWidth = Math.ceil(this.canvasWidth / cellWidth) + 2
          const numCols = Math.max(rectanglesNeededForFullWidth, 10)
          expectedElements = this.gridRows * numCols
          break
        }
        case 'triangle': {
          const triangleBaseWidth = cellWidth * 2
          const trianglesNeededForFullWidth = Math.ceil(this.canvasWidth / triangleBaseWidth) + 2
          const numTriangles = Math.max(trianglesNeededForFullWidth, 20)
          expectedElements = this.gridRows * numTriangles
          break
        }
        case 'diamond': {
          const diamondWidth = cellWidth * 2
          const diamondsNeededForFullWidth = Math.ceil(this.canvasWidth / diamondWidth) + 2
          const numDiamonds = Math.max(diamondsNeededForFullWidth, 16)
          expectedElements = this.gridRows * numDiamonds
          break
        }
        case 'hexagon': {
          const hexWidth = (this.canvasWidth * 1.5) / (this.gridCols + 1)
          const hexagonsNeededForFullWidth = Math.ceil(this.canvasWidth / hexWidth) + 2
          const numHexCols = Math.max(hexagonsNeededForFullWidth, 8)
          expectedElements = this.gridRows * numHexCols
          break
        }
      }
      
      return expectedElements
    },
    
    async waitForAllImagesToLoad() {
      console.log('⏳ Ждем завершения всех загрузок изображений...')
      
      // Получаем все растры в проекте
      const rasters = this.paperScope.project.getItems({
        class: this.paperScope.Raster
      })
      
      console.log('🖼️ Найдено растров для загрузки:', rasters.length)
      
      // Ждем загрузки всех растров
      const loadPromises = rasters.map(raster => {
        return new Promise((resolve) => {
          if (raster.loaded) {
            resolve()
          } else {
            raster.onLoad = resolve
            // Fallback timeout на 5 секунд
            setTimeout(resolve, 5000)
          }
        })
      })
      
      await Promise.all(loadPromises)
      console.log('✅ Все изображения загружены')
    },
    
    createBackgroundLayer() {
      // Создаем белый фон
      const background = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [this.canvasWidth, this.canvasHeight]
      })
      background.fillColor = 'white'
      background.strokeColor = null
      
      console.log('✅ Фоновый слой создан')
    },
    
    async createRectangleMasks(group, cellWidth, cellHeight) {
      console.log('🔲 Создаем прямоугольные маски')
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      let adjustedWidth = cellWidth - margin * 2
      let adjustedHeight = cellHeight - margin * 2
      
      // Увеличиваем размер на 0.5% с каждой стороны для устранения просветов
      const sizeIncrease = 0.005 // 0.5%
      adjustedWidth += adjustedWidth * sizeIncrease
      adjustedHeight += adjustedHeight * sizeIncrease
      
      // Корректируем позицию для центрирования увеличенного прямоугольника
      const xOffset = (adjustedWidth - (cellWidth - margin * 2)) / 2
      const yOffset = (adjustedHeight - (cellHeight - margin * 2)) / 2
      
      // Для полного покрытия канваса вычисляем необходимое количество прямоугольников
      const numRows = this.gridRows
      const rectanglesNeededForFullWidth = Math.ceil(this.canvasWidth / cellWidth) + 2 // +2 для запаса
      const numCols = Math.max(rectanglesNeededForFullWidth, 10) // Минимум 10 столбцов
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const x = col * cellWidth + margin - xOffset
          const y = row * cellHeight + margin - yOffset
          
          const rect = new this.paperScope.Path.Rectangle({
            point: [x, y],
            size: [adjustedWidth, adjustedHeight]
          })
          rect.strokeJoin = 'miter' // Убираем скругление углов
          
          // Устанавливаем данные маски ПЕРЕД применением стилей
          rect.data = { row, col, type: 'rectangle' }
          
          // Получаем изображение для данной позиции
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          await this.applyMaskStyles(rect, image)
          
          // Добавляем маску в группу
          group.addChild(rect)
        }
      }
      
      console.log('✅ Прямоугольные маски созданы:', group.children.length)
    },
    
    async createTriangleMasks(group, cellWidth, cellHeight) {
      console.log('🔺 Создаем треугольные маски')
      
      // Создаем треугольники в шахматном порядке, используя gridRows и gridCols
      const viewWidth = this.canvasWidth
      const viewHeight = this.canvasHeight
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      
      // Вычисляем размеры треугольника
      const triangleHeight = cellHeight // Высота треугольника равна высоте ячейки
      const triangleBaseWidth = cellWidth * 2 // Основание треугольника равно 2 ячейкам
      
      // Увеличиваем треугольники по вертикали на 0.5% для устранения просветов
      const verticalMultiplier = 1.005 // Увеличиваем на 0.5%
      
      // Используем gridRows и gridCols для определения количества
      const numRows = this.gridRows
      
      // Для полного покрытия канваса вычисляем необходимое количество треугольников
      const canvasWidth = this.canvasWidth
      const trianglesNeededForFullWidth = Math.ceil(canvasWidth / triangleBaseWidth) + 2 // +2 для запаса
      const numTriangles = Math.max(trianglesNeededForFullWidth, 20) // Минимум 20 треугольников
      
      // Начинаем от левого края с половины основания первого треугольника
      const startX = -cellWidth * 0.5
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numTriangles; col++) {
          const x = startX + col * triangleBaseWidth + margin
          const y = row * triangleHeight + margin
          const isEven = (row + col) % 2 === 0
          
          let triangle
          if (isEven) {
            // Треугольник вершиной вверх
            triangle = new this.paperScope.Path({
              segments: [
                [x + (cellWidth - margin * 2) / 2, y], // вершина
                [x - (cellWidth - margin * 2) * 1.5125, y + (cellHeight - margin * 2) * verticalMultiplier], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y + (cellHeight - margin * 2) * verticalMultiplier] // правый угол основания
              ],
              closed: true
            })
            triangle.strokeJoin = 'miter' // Убираем скругление углов
          } else {
            // Треугольник основанием вверх
            triangle = new this.paperScope.Path({
              segments: [
                [x - (cellWidth - margin * 2) * 1.5125, y], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y], // правый угол основания
                [x + (cellWidth - margin * 2) / 2, y + (cellHeight - margin * 2) * verticalMultiplier] // вершина
              ],
              closed: true
            })
            triangle.strokeJoin = 'miter' // Убираем скругление углов
          }
          
          // Устанавливаем данные маски ПЕРЕД применением стилей
          triangle.data = { row, col: Math.floor(col), type: 'triangle', isEven }
          
          // Получаем изображение для данной позиции
          const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
          
          // Применяем настройки обводки и тени
          await this.applyMaskStyles(triangle, image)
          
          // Добавляем маску в группу
          group.addChild(triangle)
        }
      }
      
      console.log('✅ Треугольные маски созданы:', group.children.length)
    },
    
    async createDiamondMasks(group, cellWidth, cellHeight) {
      console.log('💎 Создаем ромбовидные маски')
      
      // Создаем ромбы в шахматном порядке, используя gridRows и gridCols
      const viewWidth = this.canvasWidth
      const viewHeight = this.canvasHeight
      
      // Применяем внешний отступ
      const margin = (this.externalMargin / 100) * Math.min(cellWidth, cellHeight)
      
      // Вычисляем размеры ромба
      const diamondWidth = cellWidth * 2
      const diamondHeight = cellHeight * 2
      
      // Используем gridRows и gridCols для определения количества
      const numRows = this.gridRows
      
      // Для полного покрытия канваса вычисляем необходимое количество ромбов
      const diamondsNeededForFullWidth = Math.ceil(this.canvasWidth / diamondWidth) + 2 // +2 для запаса
      const numDiamonds = Math.max(diamondsNeededForFullWidth, 16) // Минимум 16 ромбов
      
      // Начинаем от левого края с половины ширины первого ромба
      const startX = -cellWidth * 0.5
      // Начинаем сверху с половины высоты ромба за верхней границей
      const startY = -cellHeight * 0.5
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numDiamonds; col++) {
          const isEven = (row + col) % 2 === 0
          
          if (isEven) {
            // Ромб - по сути два треугольника, соединенные основаниями
            const x = startX + col * diamondWidth + margin
            const y = startY + row * diamondHeight + margin
            
            // Увеличиваем ромб на 0.5% для устранения просветов
            const sizeMultiplier = 1.005 // Увеличиваем на 0.5%
            const diamond = new this.paperScope.Path({
              segments: [
                [x + (cellWidth - margin * 2) / 2 * sizeMultiplier, y - (cellHeight - margin * 2) * 1.49592857723 * sizeMultiplier], // верхняя вершина
                [x + (cellWidth - margin * 2) * 2.487375 * sizeMultiplier, y + (cellHeight - margin * 2) / 2 * sizeMultiplier], // правая середина
                [x + (cellWidth - margin * 2) / 2 * sizeMultiplier, y + (cellHeight - margin * 2) * 2.49592857723 * sizeMultiplier], // нижняя вершина
                [x - (cellWidth - margin * 2) * 1.487375 * sizeMultiplier, y + (cellHeight - margin * 2) / 2 * sizeMultiplier] // левая середина
              ],
              closed: true
            })
            diamond.strokeJoin = 'miter' // Убираем скругление углов
            
            // Устанавливаем данные маски ПЕРЕД применением стилей
            diamond.data = { row, col: Math.floor(col), type: 'diamond', isEven }
            
            // Получаем изображение для данной позиции
            const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
            
            // Применяем настройки обводки и тени
            await this.applyMaskStyles(diamond, image)
            
            // Добавляем маску в группу
            group.addChild(diamond)
          }
        }
      }
      
      console.log('✅ Ромбовидные маски созданы:', group.children.length)
    },
    
    async createHexagonMasks(group, cellWidth, cellHeight) {
      console.log('⬡ Создаем шестиугольные маски')
      
      // Создаем шестиугольники с динамическим размером для правильного покрытия
      const totalWidth = this.canvasWidth
      const totalHeight = this.canvasHeight
      
      // Применяем внешний отступ - используем одинаковый отступ по обеим осям
      // Для шестигранников отступ должен быть одинаковым по вертикали и горизонтали
      const baseMargin = Math.min(cellWidth, cellHeight)
      const margin = (this.externalMargin / 100) * baseMargin
      
      // Вычисляем размеры шестиугольника
      const adjustedCols = this.gridCols + 1
      const adjustedRows = this.gridRows + 1
      
      // Размеры шестиугольника для плотного заполнения
      const hexWidth = (totalWidth * 1.5) / adjustedCols
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
      
      // Начинаем с отрицательных координат для правильного заполнения
      const startX = -hexWidth * 0.5
      const startY = -hexHeight * 0.5
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      // Используем gridRows и gridCols для определения количества
      const numRows = this.gridRows
      const numCols = this.gridCols
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const centerX = startX + col * hexWidth + hexWidth / 2 + margin
          const centerY = startY + row * hexHeight + hexHeight / 2 + margin
          
          // Смещение для плотного расположения (постоянное расстояние)
          const offsetX = row % 2 === 0 ? 0 : hexWidth * 0.5
          
          // Создаем неравносторонний шестиугольник через Path
          // Увеличиваем всю маску шестигранника на 0.5% для устранения просветов
          const sizeMultiplier = 1.005 // Увеличиваем на 0.5%
          
          // Применяем отступ к размерам шестигранника
          const adjustedHexWidth = hexWidth - margin * 2
          const adjustedHexHeight = hexHeight - margin * 2
          
          const hexagon = new this.paperScope.Path({
            segments: [
              // Верхняя вершина
              [centerX + offsetX, centerY - adjustedHexHeight * 0.663065 * sizeMultiplier],
              // Верхний правый угол
              [centerX + offsetX + adjustedHexWidth / 2 * sizeMultiplier, centerY - adjustedHexHeight * 0.3315325 * sizeMultiplier],
              // Нижний правый угол
              [centerX + offsetX + adjustedHexWidth / 2 * sizeMultiplier, centerY + adjustedHexHeight * 0.3315325 * sizeMultiplier],
              // Нижняя вершина
              [centerX + offsetX, centerY + adjustedHexHeight * 0.663065 * sizeMultiplier],
              // Нижний левый угол
              [centerX + offsetX - adjustedHexWidth / 2 * sizeMultiplier, centerY + adjustedHexHeight * 0.3315325 * sizeMultiplier],
              // Верхний левый угол
              [centerX + offsetX - adjustedHexWidth / 2 * sizeMultiplier, centerY - adjustedHexHeight * 0.3315325 * sizeMultiplier]
            ],
            closed: true
          })
          hexagon.strokeJoin = 'miter' // Убираем скругление углов
          
          // Устанавливаем данные маски ПЕРЕД применением стилей
          hexagon.data = { row, col, type: 'hexagon' }
          
          // Получаем изображение для данной позиции
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          await this.applyMaskStyles(hexagon, image)
          
          // Добавляем маску в группу
          group.addChild(hexagon)
        }
      }
      
      console.log('✅ Шестиугольные маски созданы:', group.children.length)
    },
    
    async applyMaskStyles(mask, image = null) {
      console.log('🎨 Применяем стили к маске:', {
        type: mask.data?.type,
        hasImage: !!image
      })
      
      // Проверяем, нужно ли отключить обводку и тень для изображений
      const shouldDisableStroke = image && image.disableStroke
      
      // Применяем настройки обводки
      if (shouldDisableStroke) {
        mask.strokeColor = 'transparent'
        mask.strokeWidth = 0
      } else {
        mask.strokeColor = this.strokeColor
        mask.strokeWidth = this.strokeWidth
      }
      
      if (image) {
        // Если есть изображение, скрываем маску и создаем растр
        mask.visible = false
        
        // Создаем растр из URL
        const raster = new this.paperScope.Raster(image.url)
        
        // Сразу скрываем оригинальный растр, чтобы он не перекрывал маски
        raster.visible = false
        
        // Ждем загрузки изображения через Promise
        await new Promise((resolve, reject) => {
          if (raster.loaded) {
            console.log('🖼️ Raster уже загружен, применяем сразу')
            resolve()
          } else {
            console.log('🖼️ Raster не загружен, ждем загрузки...')
            
            // Устанавливаем timeout на 5 секунд
            const timeout = setTimeout(() => {
              console.warn('⚠️ Timeout загрузки Raster, используем fallback')
              reject(new Error('Raster loading timeout'))
            }, 5000)
            
            raster.onLoad = () => {
              clearTimeout(timeout)
              console.log('🖼️ Raster загружен через onLoad')
              resolve()
            }
            
            raster.onError = (error) => {
              clearTimeout(timeout)
              console.error('❌ Ошибка загрузки Raster:', error)
              reject(error)
            }
          }
        })
        
        console.log('🎨 Начинаем обрезание изображения для маски')
        
        // Создаем временный canvas для обрезания изображения
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Получаем размеры маски
        const maskBounds = mask.bounds
        
        // Уменьшаем размер маски для обрезки на половину величины обводки
        const strokeInset = (this.strokeWidth || 0) / 2
        
        const clipWidth = Math.max(1, maskBounds.width - strokeInset * 2)
        const clipHeight = Math.max(1, maskBounds.height - strokeInset * 2)
        const clipOffsetX = strokeInset
        const clipOffsetY = strokeInset
        
        tempCanvas.width = maskBounds.width
        tempCanvas.height = maskBounds.height
        
        // Очищаем canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
        
        // Создаем путь маски на canvas
        tempCtx.save()
        tempCtx.beginPath()
        
        // Создаем путь в зависимости от типа маски
        if (mask.data && mask.data.type === 'rectangle') {
          tempCtx.rect(clipOffsetX, clipOffsetY, clipWidth, clipHeight)
        } else if (mask.data && mask.data.type === 'triangle') {
          // Для треугольников учитываем ориентацию
          const isInverted = (mask.data.row + mask.data.col) % 2 === 1
          
          if (isInverted) {
            // Перевернутый треугольник
            tempCtx.moveTo(clipOffsetX + clipWidth / 2, clipOffsetY + clipHeight)
            tempCtx.lineTo(clipOffsetX, clipOffsetY)
            tempCtx.lineTo(clipOffsetX + clipWidth, clipOffsetY)
          } else {
            // Обычный треугольник
            tempCtx.moveTo(clipOffsetX + clipWidth / 2, clipOffsetY)
            tempCtx.lineTo(clipOffsetX, clipOffsetY + clipHeight)
            tempCtx.lineTo(clipOffsetX + clipWidth, clipOffsetY + clipHeight)
          }
          tempCtx.closePath()
        } else if (mask.data && mask.data.type === 'diamond') {
          // Для ромбов создаем ромбовидный путь
          tempCtx.moveTo(clipOffsetX + clipWidth / 2, clipOffsetY)
          tempCtx.lineTo(clipOffsetX, clipOffsetY + clipHeight / 2)
          tempCtx.lineTo(clipOffsetX + clipWidth / 2, clipOffsetY + clipHeight)
          tempCtx.lineTo(clipOffsetX + clipWidth, clipOffsetY + clipHeight / 2)
          tempCtx.closePath()
        } else if (mask.data && mask.data.type === 'hexagon') {
          // Для шестигранников используем реальную геометрию маски
          if (mask.segments && mask.segments.length > 0) {
            const strokeHalf = strokeInset / 2
            
              // Первая точка
              const firstPoint = mask.segments[0].point
              const relativeFirstPoint = new this.paperScope.Point(
                firstPoint.x - maskBounds.x,
                firstPoint.y - maskBounds.y
              )
              tempCtx.moveTo(relativeFirstPoint.x + strokeHalf, relativeFirstPoint.y + strokeHalf)
              
              // Остальные точки
              for (let i = 1; i < mask.segments.length; i++) {
                const point = mask.segments[i].point
                const relativePoint = new this.paperScope.Point(
                  point.x - maskBounds.x,
                  point.y - maskBounds.y
                )
                tempCtx.lineTo(relativePoint.x + strokeHalf, relativePoint.y + strokeHalf)
              }
            tempCtx.closePath()
          } else {
            // Fallback для шестигранника
            tempCtx.rect(clipOffsetX, clipOffsetY, clipWidth, clipHeight)
          }
        } else {
          // Fallback для прямоугольников
          tempCtx.rect(clipOffsetX, clipOffsetY, clipWidth, clipHeight)
        }
        
        // Применяем обрезание
        tempCtx.clip()
        
        // Рисуем изображение на canvas с сохранением пропорций
        const imgWidth = raster.image.width
        const imgHeight = raster.image.height
        const canvasWidth = clipWidth
        const canvasHeight = clipHeight
        
        // Вычисляем масштаб для сохранения пропорций
        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight
        const scale = Math.max(scaleX, scaleY)
        
        // Вычисляем размеры масштабированного изображения
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        
        // Центрируем изображение в уменьшенной области
        const offsetX = clipOffsetX + (canvasWidth - scaledWidth) / 2
        const offsetY = clipOffsetY + (canvasHeight - scaledHeight) / 2
        
        tempCtx.drawImage(
          raster.image,
          offsetX, offsetY, scaledWidth, scaledHeight
        )
        
        tempCtx.restore()
        
        // Конвертируем canvas в dataURL
        const maskedImageUrl = tempCanvas.toDataURL()
        
        // Создаем новый растр с обрезанным изображением
        const maskedRaster = new this.paperScope.Raster(maskedImageUrl)
        
        // Ждем загрузки maskedRaster через Promise
        await new Promise((resolve, reject) => {
          if (maskedRaster.loaded) {
            console.log('🖼️ MaskedRaster уже загружен, применяем сразу')
            resolve()
          } else {
            console.log('🖼️ MaskedRaster не загружен, ждем загрузки...')
            
            // Устанавливаем timeout на 3 секунды
            const timeout = setTimeout(() => {
              console.warn('⚠️ Timeout загрузки MaskedRaster, используем fallback')
              reject(new Error('MaskedRaster loading timeout'))
            }, 3000)
            
            maskedRaster.onLoad = () => {
              clearTimeout(timeout)
              console.log('🖼️ MaskedRaster загружен через onLoad')
              resolve()
            }
            
            maskedRaster.onError = (error) => {
              clearTimeout(timeout)
              console.error('❌ Ошибка загрузки MaskedRaster:', error)
              reject(error)
            }
          }
        })
        
        // Устанавливаем позицию точно в центр маски
        maskedRaster.position = maskBounds.center
        
        // Копируем данные (но не стили обводки)
        maskedRaster.data = mask.data
        
        // ВАЖНО: Добавляем maskedRaster в активный слой проекта
        this.paperScope.project.activeLayer.addChild(maskedRaster)
        
        console.log('✅ Изображение применено к маске:', mask.data?.type)
      } else {
        // Если нет изображения, применяем базовую заливку
        mask.fillColor = '#f0f0f0'
      }
      
      // Увеличиваем счетчик отрисованных элементов
      this.incrementRenderedElements()
    },
    
    async addTextLayers() {
      console.log('📝 Добавляем текстовые слои:', this.textLayers.length)
      
      // TODO: Добавить логику для текстовых слоев
      // Пока что просто логируем
      for (const textLayer of this.textLayers) {
        console.log('📝 Текстовый слой:', textLayer)
      }
    },
    
    getImagesForGrid() {
      return this.uploadedImages.filter(img => img.useInGrid)
    },
    
    getImageForPosition(row, col, totalImages) {
      const gridImages = this.getImagesForGrid()
      
      if (gridImages.length === 0) {
        console.log('⚠️ Нет изображений для сетки')
        return null
      }
      
      // Вычисляем индекс изображения для позиции (row, col)
      const baseIndex = row * this.gridCols + col
      const imageIndex = baseIndex % gridImages.length
      
      const image = gridImages[imageIndex]
      console.log(`🖼️ Изображение для позиции [${row}, ${col}]:`, {
        baseIndex,
        imageIndex,
        hasImage: !!image,
        imageUrl: image?.url
      })
      
      return image
    },
    
    async saveImage() {
      console.log('💾 Сохраняем изображение')
      
      // Создаем data URL из canvas
      const canvas = this.$refs.saveCanvas
      const dataURL = canvas.toDataURL('image/png')
      
      // Создаем ссылку для скачивания
      const link = document.createElement('a')
      link.download = `grid-design-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataURL
      
      // Триггерим скачивание
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return {
        success: true,
        filename: link.download,
        size: {
          width: this.canvasWidth,
          height: this.canvasHeight
        }
      }
    }
  }
}
</script>

<style scoped>
.grid-save-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.save-btn.saving {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
