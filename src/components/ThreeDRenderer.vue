<template>
  <div class="three-d-renderer">
    <div class="preview-container">
      <canvas ref="threeCanvas" class="three-canvas"></canvas>
    </div>
    <div class="rotation-controls">
      <button 
        @click="toggleAutoRotation" 
        class="rotation-toggle-btn"
        :class="{ 
          'disabled': !isAutoRotationEnabled
        }"
      >
        {{ isAutoRotationEnabled ? 'Остановить вращение' : 'Запустить вращение' }}
      </button>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { markRaw } from 'vue'

export default {
  name: 'ThreeDRenderer',
  props: {
    // Canvas для создания текстуры
    sourceCanvas: {
      type: Object,
      default: null
    },
    // Автоматическое обновление текстуры при изменении sourceCanvas
    autoUpdate: {
      type: Boolean,
      default: true
    },
    // Скорость вращения (радианы в секунду)
    rotationSpeed: {
      type: Number,
      default: 0.01
    },
    // Размер кружки
    mugRadius: {
      type: Number,
      default: 4
    },
    mugHeight: {
      type: Number,
      default: 9.5
    },
    // Соотношение сторон области печати
    printAspectRatio: {
      type: Number,
      default: 19/9
    }
  },
  data() {
    return {
      threeInstance: markRaw({
        scene: null,
        camera: null,
        renderer: null,
        cylinder: null,
        printSurface: null,
        mugGroup: null,
        animationId: null
      }),
      isInitialized: false,
      resizeHandler: null,
      // Состояние мыши для интерактивного вращения
      mouseState: {
        isMouseOver: false,
        isDragging: false,
        lastMouseX: 0,
        dragSensitivity: 0.01, // Чувствительность перетаскивания
        autoRotationSpeed: 0.01, // Скорость автоматического вращения
        currentRotationSpeed: 0.01 // Текущая скорость вращения
      },
      // Ссылки на методы для правильной очистки обработчиков
      mouseHandlers: {
        mouseEnter: null,
        mouseLeave: null,
        mouseDown: null,
        mouseMove: null,
        mouseUp: null
      },
      // Состояние автоматического вращения (управляется кнопкой)
      isAutoRotationEnabled: true
    }
  },
  mounted() {
    this.initThreeJS()
  },
  beforeUnmount() {
    this.cleanupThreeJS()
  },
  watch: {
    sourceCanvas: {
      handler(newCanvas, oldCanvas) {
        // console.log('🔄 sourceCanvas watcher сработал:', { newCanvas, oldCanvas, autoUpdate: this.autoUpdate })
        if (newCanvas && this.autoUpdate) {
          this.$nextTick(() => {
            setTimeout(() => {
              // console.log('⏰ Вызываем updateTexture через таймаут')
              this.updateTexture()
            }, 100)
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // Инициализация Three.js
    initThreeJS() {
      const canvas = this.$refs.threeCanvas
      if (!canvas) return
      
      // console.log('🎨 Инициализация Three.js компонента')
      
      // Создаем сцену
      this.threeInstance.scene = markRaw(new THREE.Scene())
      
      // Создаем камеру
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      const aspect = rect.width / rect.height
      
      this.threeInstance.camera = markRaw(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000))
      this.threeInstance.camera.position.set(0, 0, 23)
      
      // Создаем рендерер с высоким качеством
      this.threeInstance.renderer = markRaw(new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true,
        preserveDrawingBuffer: true
      }))
      
      // Настраиваем рендерер для лучшего отображения цветов
      this.threeInstance.renderer.toneMapping = THREE.NoToneMapping
      this.threeInstance.renderer.outputColorSpace = THREE.SRGBColorSpace
      
      // Устанавливаем размеры с учетом device pixel ratio
      const devicePixelRatio = window.devicePixelRatio || 1
      const targetWidth = rect.width * devicePixelRatio
      const targetHeight = rect.height * devicePixelRatio
      
      this.threeInstance.renderer.setSize(targetWidth, targetHeight, false)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      this.threeInstance.renderer.setClearColor(0xf8f9fa, 0)
      this.threeInstance.renderer.setPixelRatio(devicePixelRatio)
      
      // Создаем цилиндр (кружка)
      const radius = this.mugRadius
      const height = this.mugHeight
      const radialSegments = 64
      const heightSegments = 16
      
      const geometry = markRaw(new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, true))
      
      // Создаем белый материал для кружки
      const cylinderMaterial = markRaw(new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true
      }))
      
      // Создаем группу для объединения кружки и поверхности печати
      this.threeInstance.mugGroup = markRaw(new THREE.Group())
      
      // Увеличиваем масштаб группы в 2 раза
      this.threeInstance.mugGroup.scale.set(2, 2, 2)
      
      this.threeInstance.scene.add(this.threeInstance.mugGroup)
      
      // Добавляем кружку в группу
      this.threeInstance.cylinder = markRaw(new THREE.Mesh(geometry, cylinderMaterial))
      this.threeInstance.mugGroup.add(this.threeInstance.cylinder)
      
      // Создаем кастомную геометрию для области печати
      this.createPrintSurface()
      
      // Анимация вращения
      this.animate()
      
      // Обработчик изменения размера
      this.resizeHandler = this.handleResize.bind(this)
      window.addEventListener('resize', this.resizeHandler)
      
      // Добавляем обработчики мыши для интерактивного вращения
      this.setupMouseControls()
      
      this.isInitialized = true
      // console.log('✅ Three.js компонент инициализирован')
      
      // Убеждаемся, что автоматическое вращение запущено по умолчанию
      this.mouseState.autoRotationSpeed = 0.01
      this.mouseState.currentRotationSpeed = 0.01
      
      // Эмитим событие готовности
      this.$emit('initialized')
    },
    
    // Создание поверхности печати
    createPrintSurface() {
      const printSurfaceRadius = this.mugRadius + 0.02
      const printSurfaceHeight = this.mugHeight
      
      // Вычисляем размеры области печати с учетом соотношения
      const cylinderCircumference = 2 * Math.PI * printSurfaceRadius
      const targetRatio = 19 / 9 // Используем фиксированное соотношение как в оригинале
      const maxPrintWidth = printSurfaceHeight * targetRatio
      
      // Подробные отладочные логи отключены
      
      // Определяем размеры области печати
      let printWidth, printHeight
      if (maxPrintWidth > cylinderCircumference) {
        printWidth = cylinderCircumference
        printHeight = cylinderCircumference / targetRatio
        // console.log('  - Используем полную окружность')
      } else {
        printWidth = maxPrintWidth
        printHeight = printSurfaceHeight
        // console.log('  - Используем ограниченную ширину')
      }
      
      // console.log('  - Итоговая ширина печати:', printWidth)
      // console.log('  - Итоговая высота печати:', printHeight)
      
      // Вычисляем углы для области печати
      const angleWidth = (printWidth / cylinderCircumference) * Math.PI * 2
      const angleStart = -angleWidth / 2
      const angleEnd = angleWidth / 2
      
      // console.log('  - Ширина угла (радианы):', angleWidth)
      // console.log('  - Начальный угол:', angleStart)
      // console.log('  - Конечный угол:', angleEnd)
      
      // Создаем кастомную геометрию
      const printSurfaceGeometry = markRaw(new THREE.BufferGeometry())
      
      // Создаем вершины для прямоугольной области печати
      const vertices = []
      const uvs = []
      const indices = []
      
      // Количество сегментов для создания плавной поверхности
      const segmentsX = 32
      const segmentsY = 16
      
      // Создаем сетку вершин
      for (let y = 0; y <= segmentsY; y++) {
        for (let x = 0; x <= segmentsX; x++) {
          const angle = angleStart + (x / segmentsX) * (angleEnd - angleStart)
          const heightPos = (y / segmentsY - 0.5) * printSurfaceHeight
          
          // Позиция вершины
          const xPos = printSurfaceRadius * Math.cos(angle)
          const zPos = printSurfaceRadius * Math.sin(angle)
          const yPos = heightPos
          
          vertices.push(xPos, yPos, zPos)
          
          // UV координаты (исправляем разворот на 180 градусов)
          const u = 1 - (x / segmentsX) // Инвертируем по горизонтали
          const v = 1 - (y / segmentsY) // Инвертируем по вертикали
          uvs.push(u, v)
        }
      }
      
      // console.log('  - Количество вершин:', vertices.length / 3)
      // console.log('  - Количество UV координат:', uvs.length / 2)
      // console.log('  - Количество индексов:', indices.length)
      // console.log('  - Первые UV координаты:', uvs.slice(0, 10))
      // console.log('  - Последние UV координаты:', uvs.slice(-10))
      
      // Создаем индексы для треугольников (правильный порядок для внешней стороны)
      for (let y = 0; y < segmentsY; y++) {
        for (let x = 0; x < segmentsX; x++) {
          const a = y * (segmentsX + 1) + x
          const b = y * (segmentsX + 1) + x + 1
          const c = (y + 1) * (segmentsX + 1) + x
          const d = (y + 1) * (segmentsX + 1) + x + 1
          
          // Изменяем порядок для правильной ориентации
          indices.push(a, c, b)
          indices.push(b, c, d)
        }
      }
      
      // Устанавливаем атрибуты геометрии
      printSurfaceGeometry.setAttribute('position', markRaw(new THREE.Float32BufferAttribute(vertices, 3)))
      printSurfaceGeometry.setAttribute('uv', markRaw(new THREE.Float32BufferAttribute(uvs, 2)))
      printSurfaceGeometry.setIndex(markRaw(indices))
      printSurfaceGeometry.computeVertexNormals()
      printSurfaceGeometry.computeBoundingBox()
      
      // Создаем материал для поверхности печати
      const printSurfaceMaterial = markRaw(new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        depthTest: false
      }))
      
      // Создаем поверхность печати
      this.threeInstance.printSurface = markRaw(new THREE.Mesh(printSurfaceGeometry, printSurfaceMaterial))
      this.threeInstance.mugGroup.add(this.threeInstance.printSurface)
    },
    
    // Анимация
    animate() {
      this.threeInstance.animationId = requestAnimationFrame(this.animate.bind(this))
      
      // Используем динамическую скорость вращения
      const currentSpeed = this.mouseState.isMouseOver ? 0 : this.mouseState.currentRotationSpeed
      this.threeInstance.mugGroup.rotation.y += currentSpeed
      
      this.threeInstance.renderer.render(this.threeInstance.scene, this.threeInstance.camera)
    },
    
    // Обработчик изменения размера
    handleResize() {
      const canvas = this.$refs.threeCanvas
      if (!canvas || !this.threeInstance.renderer || !this.threeInstance.camera) return
      
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      const aspect = rect.width / rect.height
      
      this.threeInstance.camera.aspect = aspect
      this.threeInstance.camera.updateProjectionMatrix()
      
      const devicePixelRatio = window.devicePixelRatio || 1
      const targetWidth = rect.width * devicePixelRatio
      const targetHeight = rect.height * devicePixelRatio
      
      this.threeInstance.renderer.setSize(targetWidth, targetHeight, false)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    },
    
    // Настройка обработчиков мыши для интерактивного вращения
    setupMouseControls() {
      const canvas = this.$refs.threeCanvas
      if (!canvas) return
      
      // Сохраняем ссылки на методы для правильной очистки
      this.mouseHandlers.mouseEnter = this.handleMouseEnter.bind(this)
      this.mouseHandlers.mouseLeave = this.handleMouseLeave.bind(this)
      this.mouseHandlers.mouseDown = this.handleMouseDown.bind(this)
      this.mouseHandlers.mouseMove = this.handleMouseMove.bind(this)
      this.mouseHandlers.mouseUp = this.handleMouseUp.bind(this)
      
      // Добавляем обработчики событий
      canvas.addEventListener('mouseenter', this.mouseHandlers.mouseEnter)
      canvas.addEventListener('mouseleave', this.mouseHandlers.mouseLeave)
      canvas.addEventListener('mousedown', this.mouseHandlers.mouseDown)
      canvas.addEventListener('mousemove', this.mouseHandlers.mouseMove)
      canvas.addEventListener('mouseup', this.mouseHandlers.mouseUp)
      
      // Обработчик отпускания мыши вне области (для случая, когда мышь выходит за границы)
      document.addEventListener('mouseup', this.mouseHandlers.mouseUp)
      
      // console.log('🖱️ Обработчики мыши для 3D модели настроены')
    },
    
    // Обработчик входа мыши в область
    handleMouseEnter(event) {
      this.mouseState.isMouseOver = true
      
      // Останавливаем вращение при наведении
      this.mouseState.currentRotationSpeed = 0
      
      // console.log('🖱️ Мышь над 3D моделью - вращение остановлено')
    },
    
    // Обработчик выхода мыши из области
    handleMouseLeave(event) {
      this.mouseState.isMouseOver = false
      this.mouseState.isDragging = false
      
      // Отключаем автоматическое вращение при уводе мыши
      this.isAutoRotationEnabled = false
      this.mouseState.autoRotationSpeed = 0
      this.mouseState.currentRotationSpeed = 0
      
      // console.log('🖱️ Мышь покинула 3D модель - автоматическое вращение отключено')
    },
    
    // Обработчик нажатия мыши
    handleMouseDown(event) {
      if (!this.mouseState.isMouseOver) return
      
      this.mouseState.isDragging = true
      this.mouseState.lastMouseX = event.clientX
      
      // Изменяем курсор
      const canvas = this.$refs.threeCanvas
      canvas.style.cursor = 'grabbing'
      
      // console.log('🖱️ Начато перетаскивание 3D модели')
    },
    
    // Обработчик движения мыши
    handleMouseMove(event) {
      if (!this.mouseState.isDragging) return
      
      const deltaX = event.clientX - this.mouseState.lastMouseX
      const rotationDelta = deltaX * this.mouseState.dragSensitivity
      
      // Применяем вращение к модели
      this.threeInstance.mugGroup.rotation.y += rotationDelta
      
      // Обновляем позицию мыши для следующего кадра
      this.mouseState.lastMouseX = event.clientX
      
      // console.log(`🖱️ Перетаскивание: deltaX=${deltaX.toFixed(2)}, rotation=${rotationDelta.toFixed(4)}`)
    },
    
    // Обработчик отпускания мыши
    handleMouseUp(event) {
      if (!this.mouseState.isDragging) return
      
      this.mouseState.isDragging = false
      
      // Возвращаем обычный курсор
      const canvas = this.$refs.threeCanvas
      canvas.style.cursor = 'grab'
      
      // console.log('🖱️ Перетаскивание завершено')
    },
    
    // Обновление текстуры
    updateTexture() {
      if (!this.threeInstance.printSurface) {
      // console.log('🔸 Поверхность печати не найдена')
        return
      }
      
      // Получаем canvas с изображением
      const sourceCanvas = this.sourceCanvas
      // console.log('🎨 updateTexture вызван, sourceCanvas:', sourceCanvas)
      
      if (!sourceCanvas) {
        // console.log('🔸 Source canvas не найден в prop')
        return
      }
      
      // Проверяем, что canvas имеет размеры и готов к рендерингу
      if (sourceCanvas.width === 0 || sourceCanvas.height === 0) {
        // console.log('🔸 Canvas еще не готов, откладываем обновление')
        setTimeout(() => {
          this.updateTexture()
        }, 100)
        return
      }
      
      try {
        // Подробные логи текстуры отключены
        
        // Создаем текстуру из canvas с высоким качеством
        const texture = markRaw(new THREE.CanvasTexture(sourceCanvas))
        texture.needsUpdate = true
        
        // Ждем, пока текстура загрузится
        // texture.addEventListener('load', () => { console.log('✅ Текстура загружена успешно') })
        
        // Настраиваем параметры текстуры для высокого качества и насыщенных цветов
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBAFormat
        texture.colorSpace = THREE.SRGBColorSpace
        texture.flipY = false // Предотвращаем переворот текстуры
        
        // Создаем материал с текстурой для насыщенных цветов
        const material = markRaw(new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true,
          opacity: 1.0,
          color: 0xffffff, // Белый цвет для сохранения оригинальных цветов
          toneMapped: false // Отключаем tone mapping для сохранения яркости
        }))
        
        // Обновляем материал поверхности печати
        if (this.threeInstance.printSurface.material) {
          this.threeInstance.printSurface.material.dispose()
        }
        this.threeInstance.printSurface.material = material
        
        // console.log('  - Текстура применена к материалу')
        // console.log('  - Размеры текстуры:', texture.image ? `${texture.image.width}x${texture.image.height}` : 'не загружена')
        // console.log('✅ Текстура обновлена успешно')
        this.$emit('texture-updated')
      } catch (error) {
        console.error('❌ Ошибка при обновлении текстуры:', error)
        this.$emit('texture-error', error)
      }
    },
    
    // Публичные методы для внешнего управления
    forceUpdate() {
      this.updateTexture()
    },
    
    setRotationSpeed(speed) {
      this.mouseState.autoRotationSpeed = speed
      this.mouseState.currentRotationSpeed = speed
    },
    
    pauseRotation() {
      this.mouseState.autoRotationSpeed = 0
      this.mouseState.currentRotationSpeed = 0
    },
    
    resumeRotation() {
      this.mouseState.autoRotationSpeed = 0.01
      this.mouseState.currentRotationSpeed = 0.01
    },
    
    // Переключение автоматического вращения кнопкой
    toggleAutoRotation() {
      this.isAutoRotationEnabled = !this.isAutoRotationEnabled
      
      if (this.isAutoRotationEnabled) {
        // Включаем автоматическое вращение
        this.mouseState.autoRotationSpeed = 0.01
        // Запускаем вращение сразу (независимо от положения мыши)
        this.mouseState.currentRotationSpeed = 0.01
        // console.log('🔄 Автоматическое вращение включено кнопкой')
      } else {
        // Выключаем автоматическое вращение
        this.mouseState.autoRotationSpeed = 0
        this.mouseState.currentRotationSpeed = 0
        // console.log('⏹️ Автоматическое вращение выключено кнопкой')
      }
    },
    
    // Очистка обработчиков мыши
    cleanupMouseControls() {
      const canvas = this.$refs.threeCanvas
      if (!canvas) return
      
      // Удаляем все обработчики событий мыши, используя сохраненные ссылки
      if (this.mouseHandlers.mouseEnter) {
        canvas.removeEventListener('mouseenter', this.mouseHandlers.mouseEnter)
      }
      if (this.mouseHandlers.mouseLeave) {
        canvas.removeEventListener('mouseleave', this.mouseHandlers.mouseLeave)
      }
      if (this.mouseHandlers.mouseDown) {
        canvas.removeEventListener('mousedown', this.mouseHandlers.mouseDown)
      }
      if (this.mouseHandlers.mouseMove) {
        canvas.removeEventListener('mousemove', this.mouseHandlers.mouseMove)
      }
      if (this.mouseHandlers.mouseUp) {
        canvas.removeEventListener('mouseup', this.mouseHandlers.mouseUp)
        document.removeEventListener('mouseup', this.mouseHandlers.mouseUp)
      }
      
      // Очищаем ссылки
      this.mouseHandlers = {
        mouseEnter: null,
        mouseLeave: null,
        mouseDown: null,
        mouseMove: null,
        mouseUp: null
      }
      
      // console.log('🖱️ Обработчики мыши для 3D модели удалены')
    },
    
    // Очистка ресурсов
    cleanupThreeJS() {
      if (this.threeInstance.animationId) {
        cancelAnimationFrame(this.threeInstance.animationId)
        this.threeInstance.animationId = null
      }
      
      if (this.threeInstance.renderer) {
        this.threeInstance.renderer.dispose()
        this.threeInstance.renderer = null
      }
      
      if (this.threeInstance.cylinder) {
        this.threeInstance.cylinder.geometry.dispose()
        if (this.threeInstance.cylinder.material) {
          this.threeInstance.cylinder.material.dispose()
        }
        this.threeInstance.cylinder = null
      }
      
      if (this.threeInstance.printSurface) {
        this.threeInstance.printSurface.geometry.dispose()
        if (this.threeInstance.printSurface.material) {
          this.threeInstance.printSurface.material.dispose()
        }
        this.threeInstance.printSurface = null
      }
      
      if (this.threeInstance.mugGroup) {
        this.threeInstance.mugGroup.clear()
        this.threeInstance.mugGroup = null
      }
      
      this.threeInstance.scene = null
      this.threeInstance.camera = null
      
      // Удаляем обработчик изменения размера
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }
      
      // Удаляем обработчики мыши
      this.cleanupMouseControls()
    }
  }
}
</script>

<style scoped>
.three-d-renderer {
  width: 100%;
  height: 100%;
}

.preview-container {
  width: 100%;
  height: 300px;
  padding-bottom: 100%;
  position: relative;
  background: url('@/assets/images/cup-bg.png') #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: hidden;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 8px;
  }
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab; /* Курсор для перетаскивания */
}

.preview-container > canvas {
  position: relative;
  top: 0;
}

.rotation-controls {
  position: relative;
  top: -16px;
  margin-top: 0;
  text-align: center;
  padding: 15px;
}

.rotation-toggle-btn {
  background: #0e6ffd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.rotation-toggle-btn:hover:not(.disabled) {
  background:rgb(47, 130, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.rotation-toggle-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.rotation-toggle-btn.disabled {
  background:rgb(117, 33, 196);
  opacity: 0.7;
  cursor: pointer;
}

.rotation-toggle-btn.disabled:hover {
  background:rgb(117, 33, 196);
  transform: none;
  box-shadow: none;
}


.three-canvas:active {
  cursor: grabbing; /* Курсор при активном перетаскивании */
}
</style>
