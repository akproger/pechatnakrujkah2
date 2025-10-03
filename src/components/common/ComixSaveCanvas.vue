<template>
  <div class="comix-save-canvas">
    <!-- Кнопка сохранения -->
    <button 
      @click.prevent="handleSaveWithLog" 
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
          {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
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
  name: 'ComixSaveCanvas',
  props: {
    // Настройки основного прямоугольника
    strokeColor: {
      type: String,
      default: '#000000'
    },
    strokeWidth: {
      type: Number,
      default: 0
    },
    // Настройки фона
    solidBackgroundColor: {
      type: String,
      default: '#ffffff'
    },
    solidBackgroundOpacity: {
      type: Number,
      default: 100
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
      
      console.log('🎨 ComixSaveCanvas Paper.js инициализирован')
    },

    async handleSaveWithLog() {
      console.log('🖨️ Начинаем сохранение комикса в высоком разрешении')
      console.log('📊 Параметры сохранения:', {
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidth,
        textLayers: this.textLayers.length,
        canvasSize: `${this.canvasWidth}x${this.canvasHeight}`
      })
      
      await this.handleSave()
    },

    async handleSave() {
      if (this.isSaving) {
        console.log('⚠️ Сохранение уже в процессе')
        return
      }

      this.isSaving = true
      this.$emit('save-start')

      try {
        console.log('🔄 Начинаем процесс сохранения')
        
        // Очищаем проект
        this.paperScope.project.clear()
        
        // Создаем основной прямоугольник с обводкой
        await this.createMainRectangle()
        
        // Ждем отрисовки элементов
        await this.waitForElementsToRender()
        
        // Добавляем текстовые слои
        await this.addTextLayers()
        
        // Ждем загрузки всех изображений
        await this.waitForImagesToLoad()
        
        // Обновляем view
        this.paperScope.view.update()
        
        // Сохраняем изображение
        const result = await this.saveImage()
        
        console.log('✅ Сохранение завершено успешно')
        this.$emit('save-success', result)
        
      } catch (error) {
        console.error('❌ Ошибка при сохранении:', error)
        this.$emit('save-error', error)
      } finally {
        this.isSaving = false
      }
    },

    // Создание основного прямоугольника с обводкой
    async createMainRectangle() {
      console.log('🖼️ Создаем основной прямоугольник с обводкой')
      
      // Создаем фоновый слой
      this.createBackgroundLayer()
      
      // Создаем основной прямоугольник с обводкой
      if (this.strokeWidth > 0) {
        console.log('🔲 Рисуем обводку основного прямоугольника')
        const mainRect = new this.paperScope.Path.Rectangle({
          point: [0, 0],
          size: [this.canvasWidth, this.canvasHeight],
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth
        })
        mainRect.strokeCap = 'square'
        mainRect.strokeJoin = 'miter'
        this.paperScope.project.activeLayer.addChild(mainRect)
        
        console.log('✅ Основной прямоугольник с обводкой создан:', {
          size: `${this.canvasWidth}x${this.canvasHeight}`,
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth
        })
      } else {
        console.log('⚠️ Обводка отключена (strokeWidth = 0)')
      }
    },

    // Создание фонового слоя
    createBackgroundLayer() {
      console.log('🎨 Создаем фоновый слой')
      
      const background = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [this.canvasWidth, this.canvasHeight],
        fillColor: this.solidBackgroundColor
      })
      
      this.paperScope.project.activeLayer.addChild(background)
      console.log('✅ Фоновый слой создан')
    },

    // Ждем отрисовки элементов
    async waitForElementsToRender() {
      console.log('⏳ Ждем отрисовки элементов')
      
      return new Promise((resolve) => {
        let attempts = 0
        const maxAttempts = 50
        
        const checkRendering = () => {
          attempts++
          
          if (attempts >= maxAttempts) {
            console.log('⚠️ Достигнуто максимальное количество попыток ожидания')
            resolve()
            return
          }
          
          // Проверяем, что все элементы отрисованы
          const allItems = this.paperScope.project.getItems()
          const renderedItems = allItems.filter(item => item.visible !== false)
          
          if (renderedItems.length >= allItems.length) {
            console.log('✅ Все элементы отрисованы')
            resolve()
          } else {
            setTimeout(checkRendering, 100)
          }
        }
        
        checkRendering()
      })
    },

    // Добавление текстовых слоев
    async addTextLayers() {
      console.log('📝 Добавляем текстовые слои (новый подход):', this.textLayers.length)
      console.log('📝 Размеры канваса:', { width: this.canvasWidth, height: this.canvasHeight })
      console.log('📝 Детали текстовых слоев:', this.textLayers.map(layer => ({
        id: layer.id,
        hasBackgroundItem: !!layer.backgroundItem,
        hasBounds: !!layer.backgroundItem?.bounds,
        backgroundMode: layer.textData?.backgroundMode,
        text: layer.textData?.text,
        position: layer.position,
        textData: layer.textData
      })))
      
      if (!this.textLayers || this.textLayers.length === 0) {
        console.log('📝 Нет текстовых слоев для добавления')
        return
      }
      
      // ИСПРАВЛЕНИЕ: Дополнительная задержка для стабилизации всех типов сеток
      console.log('📝 Дополнительная задержка для стабилизации текстовых слоев')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Сортируем текстовые слои по их реальному z-index (порядку наложения на канвасе)
      const sortedTextLayers = [...this.textLayers].sort((a, b) => {
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
      
      // ИСПРАВЛЕННЫЙ ПОДХОД: Используем Paper.js для создания отдельных слоев
      console.log('📝 Создаем отдельные Paper.js слои для каждого текстового слоя')
      
      for (let i = 0; i < sortedTextLayers.length; i++) {
        const layer = sortedTextLayers[i]
        const originalIndex = this.textLayers.indexOf(layer)
        
        console.log(`📝 Создаем Paper.js слой для текстового слоя ${originalIndex + 1} (z-index: ${layer.layer?.index || layer.id || 0}):`, {
          id: layer.id,
          text: layer.textData?.text,
          mode: layer.mode,
          position: layer.position,
          zIndex: layer.layer?.index || layer.id || 0,
          backgroundMode: layer.textData?.backgroundMode
        })
        
        try {
          // Создаем Paper.js слой для этого текстового слоя
          await this.createPaperTextLayer(layer)
          console.log(`✅ Paper.js слой для текстового слоя ${originalIndex + 1} создан`)
        } catch (error) {
          console.error(`❌ Ошибка при создании Paper.js слоя для текстового слоя ${originalIndex + 1}:`, error)
        }
      }
      
      console.log('✅ Все текстовые слои добавлены в высоком разрешении (новый подход)')
    },
    
    // Перерисовка текстового слоя в высоком разрешении
    // ИСПРАВЛЕННЫЙ ПОДХОД: Создаем Paper.js слой для каждого текстового слоя
    async createPaperTextLayer(layerInfo) {
      console.log('📝 Создаем Paper.js слой для текстового слоя:', layerInfo.id)
      console.log('📝 Полные данные слоя:', layerInfo)
      
      try {
        // Получаем данные текста
        const textData = layerInfo.textData
        if (!textData) {
          console.warn('⚠️ Нет данных текста для слоя:', layerInfo.id)
          return
        }
        
        console.log('📝 Данные текста:', textData)
        
        // Позиция текста
        const position = layerInfo.position || { x: 0, y: 0 }
        
        // Масштабируем позицию для высокого разрешения
        // В MugComicPage позиции уже масштабированы от превью (856x405) к основному канвасу
        // Здесь нужно только масштабировать для высокого разрешения (300 DPI)
        const printDPI = 300
        const screenDPI = 96
        const scale = printDPI / screenDPI
        
        const scaledX = position.x * scale
        const scaledY = position.y * scale
        
        console.log('📍 Позиционирование текста в Paper.js:', {
          original: position,
          scale: scale,
          scaled: { x: scaledX, y: scaledY },
          canvasSize: `${this.canvasWidth}x${this.canvasHeight}`,
          backgroundMode: textData.backgroundMode,
          text: textData.text
        })
        
        // Создаем Paper.js элементы в зависимости от режима
        console.log('🎯 Выбираем режим создания слоя:', textData.backgroundMode)
        if (textData.backgroundMode === 'conversation') {
          console.log('🎯 Создаем слой для режима "Разговор"')
          await this.createConversationPaperLayer(scaledX, scaledY, textData, scale)
        } else if (textData.backgroundMode === 'thoughts') {
          console.log('🎯 Создаем слой для режима "Мысли"')
          await this.createThoughtsPaperLayer(scaledX, scaledY, textData, scale)
        } else if (textData.backgroundMode === 'standard') {
          console.log('🎯 Создаем слой для режима "Стандарт"')
          await this.createStandardPaperLayer(scaledX, scaledY, textData, scale)
        } else if (textData.backgroundMode === 'image-text') {
          console.log('🎯 Создаем слой для режима "Текст с изображением"')
          await this.createImageTextPaperLayer(scaledX, scaledY, textData, scale)
        } else {
          console.warn('⚠️ Неизвестный режим фона:', textData.backgroundMode)
        }
        
        console.log('✅ Paper.js слой для текстового слоя создан:', layerInfo.id)
        
      } catch (error) {
        console.error('❌ Ошибка при создании Paper.js слоя:', error)
        throw error
      }
    },

    // Создание слоя для режима "Разговор"
    async createConversationPaperLayer(x, y, textData, scale) {
      console.log('💬 Создаем Paper.js слой для режима "Разговор"')
      
      // Создаем временный канвас для измерения текста
      const measureCanvas = document.createElement('canvas')
      const measureCtx = measureCanvas.getContext('2d')
      measureCtx.font = `${textData.fontWeight || 'normal'} ${textData.fontSize}px ${textData.font || 'Arial'}`
      
      // Вычисляем размеры текста
      const textSize = this.calculateMultilineTextSize(measureCtx, textData.text, textData.fontSize, textData.lineHeight)
      const textPadding = textData.padding || 15
      const textWidthWithPadding = textSize.width + textPadding * 2
      const textHeightWithPadding = textSize.height + textPadding * 2
      
      // Используем пользовательские настройки размеров подложки или размеры на основе текста
      const userBackgroundWidth = textData.backgroundWidth || 200
      const userBackgroundHeight = textData.backgroundHeight || 80
      const backgroundWidth = Math.max(userBackgroundWidth, textWidthWithPadding)
      const backgroundHeight = Math.max(userBackgroundHeight, textHeightWithPadding)
      
      // Масштабируем размеры
      const scaledBackgroundWidth = backgroundWidth * scale
      const scaledBackgroundHeight = backgroundHeight * scale
      const scaledFontSize = textData.fontSize * scale
      
      // ПОЛНАЯ ЛОГИКА ИЗ buildSuperBackgroundPath
      // Параметры хвоста (точно как в GridsPage.vue)
      const tailSize = Number(textData.tailSize) / 100 // От 100% до 300%
      const tailWidth = Number(textData.tailWidth) / 100 // От 40% до 100%
      const tailAngle = Number(textData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (точно как в buildUnifiedShapePathWithCache)
      const minDimension = Math.min(scaledBackgroundWidth, scaledBackgroundHeight)
      const tailLength = minDimension * 1.25 // Базовая длина хвоста
      
      // Позиция подложки
      const bgX = x - scaledBackgroundWidth / 2
      const bgY = y - scaledBackgroundHeight / 2
      
      console.log('🔍 Параметры хвоста для Paper.js:', {
        tailSize: textData.tailSize,
        tailWidth: textData.tailWidth,
        tailAngle: textData.tailAngle,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        minDimension: minDimension,
        tailLength: tailLength,
        scale: scale,
        bgX: bgX,
        bgY: bgY
      })
      
      // Вычисляем точку пересечения хвоста с границей подложки
      const intersectionPoint = this.getTailIntersectionWithBackgroundPaperJS(
        x, y, tailAngle, bgX, bgY, scaledBackgroundWidth, scaledBackgroundHeight
      )
      
      console.log('🔍 Отладка геометрии хвоста:', {
        centerX: x,
        centerY: y,
        tailAngle: tailAngle,
        tailAngleDegrees: (tailAngle * 180 / Math.PI).toFixed(1),
        bgX: bgX,
        bgY: bgY,
        bgWidth: scaledBackgroundWidth,
        bgHeight: scaledBackgroundHeight,
        intersectionPoint: intersectionPoint,
        tailSize: textData.tailSize,
        tailWidth: textData.tailWidth,
        tailLength: tailLength
      })
      
      let effectiveIntersection = intersectionPoint
      // РЕЗЕРВ: если пересечение не найдено (часто у углов), берём ближайшую точку на границе
      if (!effectiveIntersection) {
        const fallback = this.getClosestIntersectionFromCenterToSharpPoint(
          x, y,
          x + Math.cos(tailAngle) * tailLength,
          y + Math.sin(tailAngle) * tailLength,
          bgX, bgY, scaledBackgroundWidth, scaledBackgroundHeight
        )
        if (fallback) {
          console.log('🛟 Fallback-пересечение для хвоста найдено:', fallback)
          effectiveIntersection = fallback
        }
      }

      if (effectiveIntersection) {
        // Создаем объединенную фигуру с хвостом (точно как в buildSuperBackgroundPath)
        const combinedPath = this.createUnifiedConversationPathPaperJS(
          x, y, scaledBackgroundWidth, scaledBackgroundHeight, 
          effectiveIntersection, tailAngle, tailLength, tailWidth, textData, scale
        )
        
        // Применяем тень к подложке
        if (textData.shadow) {
          // Создаем цвет тени с учетом прозрачности
          const shadowColor = new this.paperScope.Color(textData.shadowColor)
          shadowColor.alpha = (textData.shadowOpacity || 50) / 100 // По умолчанию 50% прозрачности
          combinedPath.shadowColor = shadowColor
          combinedPath.shadowBlur = textData.shadowBlur || 10
          combinedPath.shadowOffset = new this.paperScope.Point(
            textData.shadowOffsetX || 0,
            textData.shadowOffsetY || 0
          )
        }
        
        // Применяем обводку к подложке
        if (textData.stroke) {
          combinedPath.strokeColor = textData.strokeColor || '#000000'
          combinedPath.strokeWidth = textData.strokeWidth || 2
        }
        
        // Устанавливаем заливку
        combinedPath.fillColor = textData.backgroundColor || '#FFFFFF'
        
        // Добавляем на слой
        this.paperScope.project.activeLayer.addChild(combinedPath)
        
        console.log('✅ Объединенная фигура "Разговор" создана:', combinedPath.bounds)
      } else {
        console.warn('⚠️ Не удалось найти пересечение хвоста с границей подложки')
        // Создаем простой прямоугольник без хвоста
        const simpleRect = new this.paperScope.Path.Rectangle({
          point: [bgX, bgY],
          size: [scaledBackgroundWidth, scaledBackgroundHeight],
          fillColor: textData.backgroundColor || '#FFFFFF'
        })
        
        if (textData.stroke) {
          simpleRect.strokeColor = textData.strokeColor || '#000000'
          simpleRect.strokeWidth = textData.strokeWidth || 2
        }
        
        this.paperScope.project.activeLayer.addChild(simpleRect)
        console.log('✅ Простой прямоугольник "Разговор" создан:', simpleRect.bounds)
      }
      
      // Создаем текст
      await this.createTextElement(x, y, textData, scale)
    },

    // Создание слоя для режима "Мысли"
    async createThoughtsPaperLayer(x, y, textData, scale) {
      console.log('🧠 Создаем Paper.js слой для режима "Мысли"')
      console.log('🧠 Параметры режима "Мысли":', {
        x, y, scale,
        text: textData.text,
        backgroundColor: textData.backgroundColor,
        tailSize: textData.tailSize,
        tailWidth: textData.tailWidth,
        tailAngle: textData.tailAngle,
        shadow: textData.shadow,
        stroke: textData.stroke,
        userBackgroundWidth: textData.backgroundWidth,
        userBackgroundHeight: textData.backgroundHeight,
        padding: textData.padding
      })
      
      // Вычисляем размеры текста (точно как в режиме "Разговор")
      const textSize = this.calculateMultilineTextSize(textData.text, textData.fontSize, textData.lineHeight, textData)
      const textPadding = textData.padding || 15
      const textWidthWithPadding = textSize.width + textPadding * 2
      const textHeightWithPadding = textSize.height + textPadding * 2
      
      // Используем пользовательские настройки размеров подложки или размеры на основе текста
      const userBackgroundWidth = textData.backgroundWidth || 200
      const userBackgroundHeight = textData.backgroundHeight || 80
      const backgroundWidth = Math.max(userBackgroundWidth, textWidthWithPadding)
      const backgroundHeight = Math.max(userBackgroundHeight, textHeightWithPadding)
      
      // Масштабируем размеры (точно как в режиме "Разговор")
      const scaledBackgroundWidth = backgroundWidth * scale
      const scaledBackgroundHeight = backgroundHeight * scale
      const scaledFontSize = textData.fontSize * scale
      
      console.log('🧠 Размеры подложки режима "Мысли":', {
        textSize: `${textSize.width.toFixed(1)}x${textSize.height.toFixed(1)}`,
        textPadding: textPadding,
        textWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
        userBackground: `${userBackgroundWidth}x${userBackgroundHeight}`,
        finalBackground: `${backgroundWidth.toFixed(1)}x${backgroundHeight.toFixed(1)}`,
        scaledBackground: `${scaledBackgroundWidth.toFixed(1)}x${scaledBackgroundHeight.toFixed(1)}`,
        scale: scale
      })
      
      // ПОЛНАЯ ЛОГИКА ИЗ buildThoughtsModePath
      // Параметры хвоста (точно как в GridsPage.vue)
      const tailSize = Number(textData.tailSize) / 100 // Длина хвоста (от 100% до 750%)
      const tailWidth = Number(textData.tailWidth) / 100 // Ширина хвоста (от 40% до 100%)
      const tailAngle = Number(textData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (используем ту же логику что и в превью)
      const minDimension = Math.min(scaledBackgroundWidth, scaledBackgroundHeight)
      const tailLength = minDimension * tailSize * 1.25 // Масштабируем длину хвоста
      
      // Позиция подложки
      const bgX = x - scaledBackgroundWidth / 2
      const bgY = y - scaledBackgroundHeight / 2
      
      console.log('🧠 Параметры хвоста для режима "Мысли":', {
        tailSize: textData.tailSize,
        tailWidth: textData.tailWidth,
        tailAngle: textData.tailAngle,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        minDimension: minDimension,
        tailLength: tailLength,
        scale: scale,
        bgX: bgX,
        bgY: bgY
      })
      
      // Создаем овальную подложку с хвостом
      const thoughtsPath = this.createThoughtsModePathPaperJS(
        x, y, scaledBackgroundWidth, scaledBackgroundHeight,
        tailAngle, tailLength, tailWidth, textData, scale
      )
      
      // Применяем тень к подложке
      if (textData.shadow) {
        const shadowColor = new this.paperScope.Color(textData.shadowColor)
        shadowColor.alpha = (textData.shadowOpacity || 50) / 100
        thoughtsPath.shadowColor = shadowColor
        thoughtsPath.shadowBlur = (textData.shadowBlur || 10) * scale * 2 // x2 множитель для "Мысли"
        thoughtsPath.shadowOffset = new this.paperScope.Point(
          (textData.shadowOffsetX || 0) * scale * 2, // x2 множитель для "Мысли"
          (textData.shadowOffsetY || 0) * scale * 2  // x2 множитель для "Мысли"
        )
      }
      
      // Применяем обводку к подложке
      if (textData.stroke) {
        thoughtsPath.strokeColor = textData.strokeColor || '#000000'
        thoughtsPath.strokeWidth = (textData.strokeWidth || 2) * scale
      }
      
      // Устанавливаем заливку
      thoughtsPath.fillColor = textData.backgroundColor || '#FFFFFF'
      
      // Добавляем на слой
      this.paperScope.project.activeLayer.addChild(thoughtsPath)
      
      console.log('✅ Подложка "Мысли" создана:', thoughtsPath.bounds)
      
      // Создаем текст
      await this.createTextElement(x, y, textData, scale)
    },

    // Создание слоя для режима "Стандарт"
    async createStandardPaperLayer(x, y, textData, scale) {
      console.log('📝 Создаем Paper.js слой для режима "Стандарт"')
      
      // Вычисляем размеры текста
      const textSize = this.calculateMultilineTextSize(textData.text, textData.fontSize, textData.lineHeight, textData)
      const textPadding = textData.padding || 15
      const textWidthWithPadding = textSize.width + textPadding * 2
      const textHeightWithPadding = textSize.height + textPadding * 2
      
      // Используем пользовательские настройки размеров подложки
      const userBackgroundWidth = textData.backgroundWidth || 200
      const userBackgroundHeight = textData.backgroundHeight || 80
      const backgroundWidth = Math.max(userBackgroundWidth, textWidthWithPadding)
      const backgroundHeight = Math.max(userBackgroundHeight, textHeightWithPadding)
      
      // Масштабируем размеры
      const scaledBackgroundWidth = backgroundWidth * scale
      const scaledBackgroundHeight = backgroundHeight * scale
      
      // Позиция подложки
      const bgX = x - scaledBackgroundWidth / 2
      const bgY = y - scaledBackgroundHeight / 2
      
      // Создаем прямоугольную подложку
      const standardRect = new this.paperScope.Path.Rectangle({
        point: [bgX, bgY],
        size: [scaledBackgroundWidth, scaledBackgroundHeight],
        fillColor: textData.backgroundColor || '#FFFFFF'
      })
      
      // Применяем тень к подложке
      if (textData.shadow) {
        const shadowColor = new this.paperScope.Color(textData.shadowColor)
        shadowColor.alpha = (textData.shadowOpacity || 50) / 100
        standardRect.shadowColor = shadowColor
        standardRect.shadowBlur = (textData.shadowBlur || 10) * scale * 2 // x2 множитель для "Стандарт"
        standardRect.shadowOffset = new this.paperScope.Point(
          (textData.shadowOffsetX || 0) * scale * 2, // x2 множитель для "Стандарт"
          (textData.shadowOffsetY || 0) * scale * 2  // x2 множитель для "Стандарт"
        )
      }
      
      // Применяем обводку к подложке
      if (textData.stroke) {
        standardRect.strokeColor = textData.strokeColor || '#000000'
        standardRect.strokeWidth = (textData.strokeWidth || 2) * scale
      }
      
      // Добавляем на слой
      this.paperScope.project.activeLayer.addChild(standardRect)
      
      console.log('✅ Подложка "Стандарт" создана:', standardRect.bounds)
      
      // Создаем текст
      await this.createTextElement(x, y, textData, scale)
    },

    // Создание слоя для режима "Текст с изображением"
    async createImageTextPaperLayer(x, y, textData, scale) {
      console.log('🖼️ Создаем Paper.js слой для режима "Текст с изображением"')
      
      // Создаем изображение
      if (textData.backgroundImage) {
        const imageRaster = new this.paperScope.Raster(textData.backgroundImage)
        
        await new Promise((resolve) => {
          imageRaster.onLoad = () => {
            // Масштабируем изображение
            const scaledWidth = textData.backgroundWidth * scale
            const scaledHeight = textData.backgroundHeight * scale
            
            imageRaster.position = new this.paperScope.Point(x, y)
            imageRaster.scaling = new this.paperScope.Point(
              scaledWidth / imageRaster.bounds.width,
              scaledHeight / imageRaster.bounds.height
            )
            
            this.paperScope.project.activeLayer.addChild(imageRaster)
            console.log('✅ Изображение добавлено:', imageRaster.bounds)
            resolve()
          }
        })
      }
      
      // Создаем текст
      await this.createTextElement(x, y, textData, scale)
    },

    // Создание текстового элемента
    async createTextElement(x, y, textData, scale) {
      console.log('✍️ Создаем текстовый элемент')
      
      const textPoint = new this.paperScope.Point(x, y)
      const textItem = new this.paperScope.PointText(textPoint)
      
      // Настраиваем текст
      textItem.content = textData.text
      textItem.fontSize = textData.fontSize * scale
      textItem.fontFamily = textData.font || 'Arial'
      textItem.fontWeight = textData.fontWeight || 'normal'
      textItem.fillColor = textData.color || '#000000'
      
      // Выравнивание текста
      textItem.justification = 'center'
      
      // Применяем тень к тексту (только для режима "image-text")
      if (textData.backgroundMode === 'image-text' && textData.shadow) {
        const shadowColor = new this.paperScope.Color(textData.shadowColor)
        shadowColor.alpha = (textData.shadowOpacity || 50) / 100
        textItem.shadowColor = shadowColor
        textItem.shadowBlur = (textData.shadowBlur || 10) * scale
        textItem.shadowOffset = new this.paperScope.Point(
          (textData.shadowOffsetX || 0) * scale,
          (textData.shadowOffsetY || 0) * scale
        )
      }
      
      // Применяем обводку к тексту (только для режима "image-text")
      if (textData.backgroundMode === 'image-text' && textData.stroke) {
        textItem.strokeColor = textData.strokeColor || '#000000'
        textItem.strokeWidth = (textData.strokeWidth || 2) * scale
      }
      
      // Добавляем на слой
      this.paperScope.project.activeLayer.addChild(textItem)
      
      console.log('✅ Текстовый элемент создан:', textItem.bounds)
    },

    // Ждем загрузки всех изображений
    async waitForImagesToLoad() {
      console.log('⏳ Ждем загрузки всех изображений')
      
      return new Promise((resolve) => {
        let attempts = 0
        const maxAttempts = 50
        
        const checkImages = () => {
          attempts++
          
          if (attempts >= maxAttempts) {
            console.log('⚠️ Достигнуто максимальное количество попыток ожидания изображений')
            resolve()
            return
          }
          
          const allRasters = this.paperScope.project.getItems({ class: this.paperScope.Raster })
          const loadedRasters = allRasters.filter(raster => raster.loaded)
          
          if (allRasters.length === loadedRasters.length) {
            console.log('✅ Все изображения загружены')
            resolve()
          } else {
            setTimeout(checkImages, 100)
          }
        }
        
        checkImages()
      })
    },

    // Сохранение изображения
    async saveImage() {
      console.log('💾 Сохраняем изображение')
      
      const canvas = this.$refs.saveCanvas
      const filename = `comix-${new Date().toISOString().slice(0, 10)}.png`
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a')
            link.download = filename
            const url = URL.createObjectURL(blob)
            link.href = url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            console.log('✅ Изображение сохранено:', filename)
            resolve({ success: true, filename: filename })
          } else {
            reject(new Error('Ошибка при создании файла'))
          }
        }, 'image/png', 1.0)
      })
    },

    // Вспомогательные методы (копируем из GridSaveCanvas)
    calculateMultilineTextSize(ctx, text, fontSize, lineHeight) {
      if (!text || typeof text !== 'string') {
        console.error('❌ Ошибка в calculateMultilineTextSize: text не является строкой:', text)
        return { width: 0, height: 0 }
      }
      
      const lines = text.split('\n')
      
      let maxWidth = 0
      lines.forEach(line => {
        const metrics = ctx.measureText(line)
        maxWidth = Math.max(maxWidth, metrics.width)
      })
      
      return {
        width: maxWidth,
        height: lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      }
    },

    getTailIntersectionWithBackgroundPaperJS(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight) {
      // Вычисляем точку пересечения линии хвоста с границей подложки
      const lineLength = Math.max(bgWidth, bgHeight) * 2 // Достаточно длинная линия
      const endX = centerX + lineLength * Math.cos(tailAngle)
      const endY = centerY + lineLength * Math.sin(tailAngle)
      
      console.log('🔍 Поиск пересечения хвоста:', {
        centerX, centerY, tailAngle: (tailAngle * 180 / Math.PI).toFixed(1),
        endX, endY, lineLength,
        bgX, bgY, bgWidth, bgHeight
      })
      
      // Проверяем пересечение с каждой стороной прямоугольника
      const intersections = []
      
      // Верхняя сторона
      const topIntersection = this.getLineIntersection(centerX, centerY, endX, endY, bgX, bgY, bgX + bgWidth, bgY)
      if (topIntersection && this.isPointOnLineSegment(topIntersection, bgX, bgY, bgX + bgWidth, bgY)) {
        intersections.push(topIntersection)
      }
      
      // Правая сторона
      const rightIntersection = this.getLineIntersection(centerX, centerY, endX, endY, bgX + bgWidth, bgY, bgX + bgWidth, bgY + bgHeight)
      if (rightIntersection && this.isPointOnLineSegment(rightIntersection, bgX + bgWidth, bgY, bgX + bgWidth, bgY + bgHeight)) {
        intersections.push(rightIntersection)
      }
      
      // Нижняя сторона
      const bottomIntersection = this.getLineIntersection(centerX, centerY, endX, endY, bgX, bgY + bgHeight, bgX + bgWidth, bgY + bgHeight)
      if (bottomIntersection && this.isPointOnLineSegment(bottomIntersection, bgX, bgY + bgHeight, bgX + bgWidth, bgY + bgHeight)) {
        intersections.push(bottomIntersection)
      }
      
      // Левая сторона
      const leftIntersection = this.getLineIntersection(centerX, centerY, endX, endY, bgX, bgY, bgX, bgY + bgHeight)
      if (leftIntersection && this.isPointOnLineSegment(leftIntersection, bgX, bgY, bgX, bgY + bgHeight)) {
        intersections.push(leftIntersection)
      }
      
      // Возвращаем ближайшую точку пересечения
      if (intersections.length > 0) {
        let closestIntersection = intersections[0]
        let minDistance = Math.sqrt(Math.pow(closestIntersection.x - centerX, 2) + Math.pow(closestIntersection.y - centerY, 2))
        
        for (let i = 1; i < intersections.length; i++) {
          const distance = Math.sqrt(Math.pow(intersections[i].x - centerX, 2) + Math.pow(intersections[i].y - centerY, 2))
          if (distance < minDistance) {
            minDistance = distance
            closestIntersection = intersections[i]
          }
        }
        
        console.log('✅ Найдено пересечение:', closestIntersection)
        return closestIntersection
      }
      
      console.log('❌ Пересечение не найдено')
      return null
    },

    getClosestIntersectionFromCenterToSharpPoint(centerX, centerY, sharpPointX, sharpPointY, bgX, bgY, bgWidth, bgHeight) {
      // Проверяем пересечение с каждой стороной прямоугольника
      const intersections = []
      
      // Верхняя сторона
      const topIntersection = this.getLineIntersection(centerX, centerY, sharpPointX, sharpPointY, bgX, bgY, bgX + bgWidth, bgY)
      if (topIntersection && this.isPointOnLineSegment(topIntersection, bgX, bgY, bgX + bgWidth, bgY)) {
        intersections.push(topIntersection)
      }
      
      // Правая сторона
      const rightIntersection = this.getLineIntersection(centerX, centerY, sharpPointX, sharpPointY, bgX + bgWidth, bgY, bgX + bgWidth, bgY + bgHeight)
      if (rightIntersection && this.isPointOnLineSegment(rightIntersection, bgX + bgWidth, bgY, bgX + bgWidth, bgY + bgHeight)) {
        intersections.push(rightIntersection)
      }
      
      // Нижняя сторона
      const bottomIntersection = this.getLineIntersection(centerX, centerY, sharpPointX, sharpPointY, bgX, bgY + bgHeight, bgX + bgWidth, bgY + bgHeight)
      if (bottomIntersection && this.isPointOnLineSegment(bottomIntersection, bgX, bgY + bgHeight, bgX + bgWidth, bgY + bgHeight)) {
        intersections.push(bottomIntersection)
      }
      
      // Левая сторона
      const leftIntersection = this.getLineIntersection(centerX, centerY, sharpPointX, sharpPointY, bgX, bgY, bgX, bgY + bgHeight)
      if (leftIntersection && this.isPointOnLineSegment(leftIntersection, bgX, bgY, bgX, bgY + bgHeight)) {
        intersections.push(leftIntersection)
      }
      
      // Возвращаем ближайшую точку пересечения к центру
      if (intersections.length > 0) {
        let closestIntersection = intersections[0]
        let minDistance = Math.sqrt(Math.pow(closestIntersection.x - centerX, 2) + Math.pow(closestIntersection.y - centerY, 2))
        
        for (let i = 1; i < intersections.length; i++) {
          const distance = Math.sqrt(Math.pow(intersections[i].x - centerX, 2) + Math.pow(intersections[i].y - centerY, 2))
          if (distance < minDistance) {
            minDistance = distance
            closestIntersection = intersections[i]
          }
        }
        
        return closestIntersection
      }
      
      return null
    },

    getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(denom) < 1e-10) return null // Параллельные линии
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        }
      }
      return null
    },

    isPointOnLineSegment(point, x1, y1, x2, y2) {
      const minX = Math.min(x1, x2)
      const maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2)
      const maxY = Math.max(y1, y2)
      
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    },

    createUnifiedConversationPathPaperJS(centerX, centerY, bgWidth, bgHeight, intersection, tailAngle, tailLength, tailWidth, textData, scale) {
      // Создание объединенной фигуры с хвостом для режима "Разговор"
      // Пока что создаем простой прямоугольник, потом добавим хвост
      return new this.paperScope.Path.Rectangle({
        point: [centerX - bgWidth/2, centerY - bgHeight/2],
        size: [bgWidth, bgHeight],
        fillColor: textData.backgroundColor || '#FFFFFF'
      })
    },

    createThoughtsModePathPaperJS(centerX, centerY, bgWidth, bgHeight, tailAngle, tailLength, tailWidth, textData, scale) {
      // Создание овальной фигуры с хвостом для режима "Мысли"
      // Пока что создаем простой овал, потом добавим хвост
      return new this.paperScope.Path.Ellipse({
        center: [centerX, centerY],
        size: [bgWidth, bgHeight],
        fillColor: textData.backgroundColor || '#FFFFFF'
      })
    }
  }
}
</script>

<style scoped>
.comix-save-canvas {
  display: inline-block;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.save-icon {
  width: 16px;
  height: 16px;
}

.btn-text {
  font-family: inherit;
}
</style>
