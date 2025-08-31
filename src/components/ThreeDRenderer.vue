<template>
  <div class="three-d-renderer">
    <div class="preview-container">
      <canvas ref="threeCanvas" class="three-canvas"></canvas>
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
      resizeHandler: null
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
      handler(newCanvas) {
        if (newCanvas && this.autoUpdate) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.updateTexture()
            }, 100)
          })
        }
      },
      deep: true
    }
  },
  methods: {
    // Инициализация Three.js
    initThreeJS() {
      const canvas = this.$refs.threeCanvas
      if (!canvas) return
      
      console.log('🎨 Инициализация Three.js компонента')
      
      // Создаем сцену
      this.threeInstance.scene = markRaw(new THREE.Scene())
      
      // Создаем камеру
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      const aspect = rect.width / rect.height
      
      this.threeInstance.camera = markRaw(new THREE.PerspectiveCamera(75, aspect, 0.1, 1000))
      this.threeInstance.camera.position.set(0, 0, 15)
      
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
      
      this.isInitialized = true
      console.log('✅ Three.js компонент инициализирован')
      
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
      
      console.log('🔍 Отладка области печати:')
      console.log('  - Радиус кружки:', this.mugRadius)
      console.log('  - Радиус поверхности печати:', printSurfaceRadius)
      console.log('  - Высота кружки:', printSurfaceHeight)
      console.log('  - Окружность цилиндра:', cylinderCircumference)
      console.log('  - Максимальная ширина печати:', maxPrintWidth)
      console.log('  - Соотношение сторон:', targetRatio)
      
      // Определяем размеры области печати
      let printWidth, printHeight
      if (maxPrintWidth > cylinderCircumference) {
        printWidth = cylinderCircumference
        printHeight = cylinderCircumference / targetRatio
        console.log('  - Используем полную окружность')
      } else {
        printWidth = maxPrintWidth
        printHeight = printSurfaceHeight
        console.log('  - Используем ограниченную ширину')
      }
      
      console.log('  - Итоговая ширина печати:', printWidth)
      console.log('  - Итоговая высота печати:', printHeight)
      
      // Вычисляем углы для области печати
      const angleWidth = (printWidth / cylinderCircumference) * Math.PI * 2
      const angleStart = -angleWidth / 2
      const angleEnd = angleWidth / 2
      
      console.log('  - Ширина угла (радианы):', angleWidth)
      console.log('  - Начальный угол:', angleStart)
      console.log('  - Конечный угол:', angleEnd)
      
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
      
      console.log('  - Количество вершин:', vertices.length / 3)
      console.log('  - Количество UV координат:', uvs.length / 2)
      console.log('  - Количество индексов:', indices.length)
      console.log('  - Первые UV координаты:', uvs.slice(0, 10))
      console.log('  - Последние UV координаты:', uvs.slice(-10))
      
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
      this.threeInstance.mugGroup.rotation.y += this.rotationSpeed
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
    
    // Обновление текстуры
    updateTexture() {
      if (!this.threeInstance.printSurface) {
        console.log('🔸 Поверхность печати не найдена')
        return
      }
      
      // Получаем canvas с изображением
      const sourceCanvas = this.sourceCanvas || this.$parent.$refs.testCanvas || this.$parent.$refs.paperCanvas
      if (!sourceCanvas) {
        console.log('🔸 Source canvas не найден')
        return
      }
      
      // Проверяем, что canvas имеет размеры и готов к рендерингу
      if (sourceCanvas.width === 0 || sourceCanvas.height === 0) {
        console.log('🔸 Canvas еще не готов, откладываем обновление')
        setTimeout(() => {
          this.updateTexture()
        }, 100)
        return
      }
      
      try {
        console.log('🔍 Отладка текстуры:')
        console.log('  - Размеры source canvas:', sourceCanvas.width, 'x', sourceCanvas.height)
        console.log('  - Размеры области печати:', this.threeInstance.printSurface.geometry.boundingBox)
        
        // Создаем текстуру из canvas с высоким качеством
        const texture = markRaw(new THREE.CanvasTexture(sourceCanvas))
        texture.needsUpdate = true
        
        // Ждем, пока текстура загрузится
        texture.addEventListener('load', () => {
          console.log('✅ Текстура загружена успешно')
        })
        
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
        
        console.log('  - Текстура применена к материалу')
        console.log('  - Размеры текстуры:', texture.image ? `${texture.image.width}x${texture.image.height}` : 'не загружена')
        console.log('✅ Текстура обновлена успешно')
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
      this.rotationSpeed = speed
    },
    
    pauseRotation() {
      this.rotationSpeed = 0
    },
    
    resumeRotation() {
      this.rotationSpeed = 0.01
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
  height: 0;
  padding-bottom: 100%; /* Квадратное соотношение для 3D превью */
  position: relative;
  background: transparent;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
