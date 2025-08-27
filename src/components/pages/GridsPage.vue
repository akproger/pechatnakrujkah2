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
      touchStartPos: null
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
    
    createRectangleMasks(group, cellWidth, cellHeight) {
      // Создаем параллелепипеды
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const x = col * cellWidth
          const y = row * cellHeight
          
          const rect = new paper.Path.Rectangle({
            point: [x, y],
            size: [cellWidth, cellHeight],
            strokeColor: '#dee2e6',
            strokeWidth: 1,
            fillColor: '#016527',
            fillOpacity: 0.3
          })
          
          rect.data = { row, col, type: 'rectangle' }
          this.addMaskInteractivity(rect)
          group.addChild(rect)
        }
      }
    },
    
    createTriangleMasks(group, cellWidth, cellHeight) {
      // Создаем треугольники в шахматном порядке, начинающиеся и заканчивающиеся вершинами
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Вычисляем количество полных треугольников, которые поместятся
      const triangleBaseWidth = cellWidth * 2 // Основание треугольника теперь равно 2 ячейкам
      const numTriangles = Math.ceil(viewWidth / triangleBaseWidth)
      
      // Начинаем от левого края с половины основания первого треугольника
      const startX = -cellWidth * 0.5
      
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col <= numTriangles; col++) {
          const x = startX + col * triangleBaseWidth
          const y = row * cellHeight
          const isEven = (row + col) % 2 === 0
          
          let triangle
          if (isEven) {
            // Треугольник вершиной вверх
            triangle = new paper.Path({
              segments: [
                [x + cellWidth / 2, y], // вершина
                [x - cellWidth * 1.5125, y + cellHeight], // левый угол основания (на 151.25% левее)
                [x + cellWidth * 2.5125, y + cellHeight] // правый угол основания (на 151.25% правее)
              ],
              closed: true
            })
          } else {
            // Треугольник основанием вверх
            triangle = new paper.Path({
              segments: [
                [x - cellWidth * 1.5125, y], // левый угол основания (на 151.25% левее)
                [x + cellWidth * 2.5125, y], // правый угол основания (на 151.25% правее)
                [x + cellWidth / 2, y + cellHeight] // вершина
              ],
              closed: true
            })
          }
          
          triangle.strokeColor = '#dee2e6'
          triangle.strokeWidth = 1
          triangle.fillColor = '#016527'
          triangle.fillOpacity = 0.3
          
          triangle.data = { row, col: Math.floor(col), type: 'triangle', isEven }
          this.addMaskInteractivity(triangle)
          group.addChild(triangle)
        }
      }
    },
    
    createDiamondMasks(group, cellWidth, cellHeight) {
      // Создаем ромбы в шахматном порядке, начинающиеся и заканчивающиеся вершинами
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Вычисляем количество ромбов, которые поместятся
      // Ромб по ширине занимает 2 ячейки (как основание треугольника)
      const diamondWidth = cellWidth * 2
      const diamondHeight = cellHeight * 2 // Высота ромба теперь в 2 раза больше
      const numDiamonds = Math.ceil(viewWidth / diamondWidth)
      const numRows = Math.ceil(viewHeight / diamondHeight)
      
      // Начинаем от левого края с половины ширины первого ромба
      const startX = -cellWidth * 0.5
      // Начинаем сверху с половины высоты ромба за верхней границей
      const startY = -cellHeight * 0.5
      
      for (let row = 0; row <= numRows; row++) {
        for (let col = 0; col <= numDiamonds; col++) {
          const isEven = (row + col) % 2 === 0
          
          if (isEven) {
            // Ромб - по сути два треугольника, соединенные основаниями
            const x = startX + col * diamondWidth
            const y = startY + row * diamondHeight
            
            const diamond = new paper.Path({
              segments: [
                [x + cellWidth / 2, y - cellHeight * 1.49592857723], // верхняя вершина (на 149.592857723% выше)
                [x + cellWidth * 2.487375, y + cellHeight / 2], // правая середина
                [x + cellWidth / 2, y + cellHeight * 2.49592857723], // нижняя вершина (на 149.592857723% ниже)
                [x - cellWidth * 1.487375, y + cellHeight / 2] // левая середина
              ],
              closed: true
            })
            
            diamond.strokeColor = '#dee2e6'
            diamond.strokeWidth = 1
            diamond.fillColor = '#016527'
            diamond.fillOpacity = 0.3
            
            diamond.data = { row, col: Math.floor(col), type: 'diamond', isEven }
            this.addMaskInteractivity(diamond)
            group.addChild(diamond)
          }
        }
      }
    },
    
    createHexagonMasks(group, cellWidth, cellHeight) {
      // Создаем шестиугольники с динамическим размером для правильного покрытия
      const totalWidth = paper.view.viewSize.width
      const totalHeight = paper.view.viewSize.height
      
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
          const centerX = startX + col * hexWidth + hexWidth / 2
          const centerY = startY + row * hexHeight + hexHeight / 2
          
          // Смещение для плотного расположения (постоянное расстояние)
          const offsetX = row % 2 === 0 ? 0 : hexWidth * 0.5
          
          // Создаем неравносторонний шестиугольник через Path
          const hexagon = new paper.Path({
            segments: [
              // Верхняя вершина
              [centerX + offsetX, centerY - hexHeight * 0.663065],
              // Верхний правый угол
              [centerX + offsetX + hexWidth / 2, centerY - hexHeight * 0.3315325],
              // Нижний правый угол
              [centerX + offsetX + hexWidth / 2, centerY + hexHeight * 0.3315325],
              // Нижняя вершина
              [centerX + offsetX, centerY + hexHeight * 0.663065],
              // Нижний левый угол
              [centerX + offsetX - hexWidth / 2, centerY + hexHeight * 0.3315325],
              // Верхний левый угол
              [centerX + offsetX - hexWidth / 2, centerY - hexHeight * 0.3315325]
            ],
            closed: true
          })
          
          hexagon.strokeColor = '#dee2e6'
          hexagon.strokeWidth = 1
          hexagon.fillColor = '#016527'
          hexagon.fillOpacity = 0.3
          
          hexagon.data = { row, col, type: 'hexagon' }
          this.addMaskInteractivity(hexagon)
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
