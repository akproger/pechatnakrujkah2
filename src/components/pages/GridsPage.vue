<template>
  <div class="grids-page">
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="row">
        <div class="col">
          <h2 class="page-title">Сетки</h2>
          <p class="text-muted">Инструмент для создания массива масок</p>
        </div>
      </div>
      
      <!-- Вкладки и ползунки управления -->
      <div class="row mb-2">
        <div class="col-12" style="width: 66.66666667%;">
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <!-- Вкладки по типам масок -->
                <div class="col">
                  <div class="btn-group" role="group" aria-label="Типы масок">
                    <input type="radio" class="btn-check" name="maskType" id="rectangle" value="rectangle" v-model="maskType">
                    <label class="btn btn-outline-primary" for="rectangle" title="Параллелепипеды">
                      <i class="bi bi-square"></i>
                    </label>
                    
                    <input type="radio" class="btn-check" name="maskType" id="triangle" value="triangle" v-model="maskType">
                    <label class="btn btn-outline-primary" for="triangle" title="Треугольники">
                      <i class="bi bi-triangle"></i>
                    </label>
                    
                    <input type="radio" class="btn-check" name="maskType" id="hexagon" value="hexagon" v-model="maskType">
                    <label class="btn btn-outline-primary" for="hexagon" title="Шестиугольники">
                      <i class="bi bi-hexagon"></i>
                    </label>
                    
                    <input type="radio" class="btn-check" name="maskType" id="diamond" value="diamond" v-model="maskType">
                    <label class="btn btn-outline-primary" for="diamond" title="Ромбы">
                      <i class="bi bi-diamond"></i>
                    </label>
                  </div>
                </div>
                
                <!-- Ползунки управления -->
                <div class="d-flex gap-4 ms-auto" style="width: 330px;">
                  <div class="form-group mb-0" style="width: 150px;">
                    <div class="form-label mb-1" style="text-align: left;">Строки: {{ gridRows }}</div>
                    <input 
                      type="range" 
                      class="form-range" 
                      id="gridRowsSlider"
                      v-model.number="gridRows"
                      min="1" 
                      max="10" 
                      step="1"
                    >
                  </div>
                  
                  <div class="form-group mb-0" style="width: 150px;">
                    <div class="form-label mb-1" style="text-align: left;">Столбцы: {{ gridCols }}</div>
                    <input 
                      type="range" 
                      class="form-range" 
                      id="gridColsSlider"
                      v-model.number="gridCols"
                      min="1" 
                      max="20" 
                      step="1"
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
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
                  @touchstart="handleTouchStart"
                  @touchmove="handleTouchMove"
                  @touchend="handleTouchEnd"
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
      
      <!-- Табы управления -->
      <div class="row mt-4">
        <div class="col-12">
          <ul class="nav nav-tabs" id="gridsTab" role="tablist">
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
                <i class="bi bi-palette me-2"></i>
                Фон
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Контент табов -->
      <div class="tab-content" id="gridsTabContent">
        <!-- Таб "Настройки" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'settings' }" id="settings" role="tabpanel" aria-labelledby="settings-tab">
          <div class="row mt-3">
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
                    
                    <!-- Тень -->
                    <div class="col-md-4">
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
                        >
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Позиция X: {{ shadowOffsetX }}%</label>
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
                        <label class="form-label">Позиция Y: {{ shadowOffsetY }}%</label>
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
        </div>
        
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
                          <div class="d-flex gap-3 mt-2">
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :id="'image-' + index"
                                v-model="image.useInGrid"
                                @change="handleUseInGridChange(index, $event)"
                              >
                              <label class="form-check-label d-flex align-items-center" :for="'image-' + index" title="Использовать в сетке">
                                <i class="bi bi-grid-3x3-gap me-1"></i>
                              </label>
                            </div>
                            
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :id="'disable-stroke-' + index"
                                v-model="image.disableStroke"
                                @change="handleDisableStrokeChange(index, $event)"
                              >
                              <label class="form-check-label d-flex align-items-center" :for="'disable-stroke-' + index" title="Отключить обводку и тень для этого изображения">
                                <i class="bi bi-border me-1"></i>
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
        
        <!-- Таб "Фон" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'background' }" id="background" role="tabpanel" aria-labelledby="background-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <!-- Первый столбец: Изображение фона и солидная заливка -->
                    <div class="col-md-6">
                      <!-- Загрузка изображения фона -->
                      <h6 class="text-muted mb-3">Изображение фона</h6>
                      <div class="form-group">
                        <input 
                          type="file" 
                          ref="backgroundImageInput"
                          @change="handleBackgroundImageUpload" 
                          accept="image/*"
                          class="d-none"
                        >
                        <button 
                          @click="$refs.backgroundImageInput.click()" 
                          class="btn btn-outline-primary"
                          style="background-color: #6f42c1; border: none; color: white;"
                        >
                          <i class="bi bi-image me-2"></i>
                          {{ backgroundImage ? 'Заменить фон' : 'Загрузить фоновое изображение' }}
                        </button>
                        <button 
                          v-if="backgroundImage"
                          @click="removeBackgroundImage" 
                          class="btn btn-outline-danger ms-2"
                          style="background-color: #dc3545; border: none; color: white;"
                        >
                          <i class="bi bi-trash me-2"></i>
                          Удалить фон
                        </button>
                      </div>
                      
                      <!-- Чекбокс для включения изображения фона -->
                      <div class="form-check mt-3">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="enableBackgroundImage"
                          v-model="enableBackgroundImage"
                          :disabled="!backgroundImage"
                        >
                        <label class="form-check-label" for="enableBackgroundImage">
                          Включить фоновое изображение
                        </label>
                      </div>
                      
                      <!-- Превью фонового изображения -->
                      <div v-if="backgroundImage" class="mt-3">
                        <img 
                          :src="backgroundImage" 
                          alt="Фоновое изображение" 
                          class="img-fluid rounded"
                          style="max-height: 150px; object-fit: contain;"
                        >
                      </div>
                      
                      <!-- Солидная заливка -->
                      <h6 class="text-muted mb-3 mt-4">Солидная заливка</h6>
                      
                      <!-- Чекбокс для включения солидной заливки -->
                      <div class="form-check mb-3">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="enableSolidBackground"
                          v-model="enableSolidBackground"
                        >
                        <label class="form-check-label" for="enableSolidBackground">
                          Включить солидную заливку
                        </label>
                      </div>
                      
                      <div class="form-group">
                        <label class="form-label">Цвет заливки</label>
                        <input 
                          type="color" 
                          class="form-control form-control-color" 
                          v-model="solidBackgroundColor"
                          title="Выберите цвет заливки"
                        >
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Прозрачность: {{ solidBackgroundOpacity }}%</label>
                        <input 
                          type="range" 
                          class="form-range" 
                          v-model.number="solidBackgroundOpacity"
                          min="0" 
                          max="100" 
                          step="1"
                        >
                      </div>
                    </div>
                    
                    <!-- Второй столбец: Градиентная заливка -->
                    <div class="col-md-6">
                      <h6 class="text-muted mb-3">Градиентная заливка</h6>
                      
                      <!-- Чекбокс для включения градиентной заливки -->
                      <div class="form-check mb-3">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="enableGradientBackground"
                          v-model="enableGradientBackground"
                        >
                        <label class="form-check-label" for="enableGradientBackground">
                          Включить градиентную заливку
                        </label>
                      </div>
                      
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="form-label">Цвет 1</label>
                            <input 
                              type="color" 
                              class="form-control form-control-color" 
                              v-model="gradientColor1"
                              title="Выберите первый цвет градиента"
                            >
                          </div>
                          <div class="form-group mt-2">
                            <label class="form-label">Прозрачность 1: {{ gradientOpacity1 }}%</label>
                            <input 
                              type="range" 
                              class="form-range" 
                              v-model.number="gradientOpacity1"
                              min="0" 
                              max="100" 
                              step="1"
                            >
                          </div>
                        </div>
                        
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="form-label">Цвет 2</label>
                            <input 
                              type="color" 
                              class="form-control form-control-color" 
                              v-model="gradientColor2"
                              title="Выберите второй цвет градиента"
                            >
                          </div>
                          <div class="form-group mt-2">
                            <label class="form-label">Прозрачность 2: {{ gradientOpacity2 }}%</label>
                            <input 
                              type="range" 
                              class="form-range" 
                              v-model.number="gradientOpacity2"
                              min="0" 
                              max="100" 
                              step="1"
                            >
                          </div>
                        </div>
                        
                        <div class="col-12">
                          <div class="form-group">
                            <label class="form-label">Угол: {{ gradientAngle }}°</label>
                            <input 
                              type="range" 
                              class="form-range" 
                              v-model.number="gradientAngle"
                              min="0" 
                              max="360" 
                              step="1"
                            >
                          </div>
                          
                          <div class="form-group mt-3">
                            <label class="form-label">Превью градиента</label>
                            <div 
                              class="gradient-preview"
                              style="width: 100%; height: 80px; border-radius: 8px;"
                            ></div>
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
      

    </div>
  </div>
</template>

<script>
import paper from 'paper'
import * as THREE from 'three'
import { markRaw } from 'vue'

export default {
  name: 'GridsPage',
  data() {
    return {
      // Настройки для каждого типа сетки
      gridSettings: {
        rectangle: { rows: 3, cols: 5 },
        triangle: { rows: 2, cols: 20 },
        hexagon: { rows: 4, cols: 8 },
        diamond: { rows: 4, cols: 16 }
      },
      maskType: 'rectangle',
      paperScope: null,
      selectedCell: null,
      touchStartPos: null,
      // Дополнительные настройки
      externalMargin: 0, // Проценты (0-50)
      strokeColor: '#000000',
      strokeWidth: 0, // Проценты (0-20)
      shadowBlur: 0, // Проценты (0-50)
      shadowOffsetX: 0, // Проценты (-50 до +50)
      shadowOffsetY: 0, // Проценты (-50 до +50)
      shadowOpacity: 50, // Проценты (0-100)
      activeTab: 'settings', // По умолчанию открыт таб "Настройки"
      uploadedImages: [],
      
      // Настройки фона
      backgroundImage: null, // URL фонового изображения
      solidBackgroundColor: '#ffffff', // Цвет солидной заливки
      solidBackgroundOpacity: 100, // Прозрачность солидной заливки (0-100)
      gradientColor1: '#ffffff', // Первый цвет градиента
      gradientColor2: '#cccccc', // Второй цвет градиента
      gradientOpacity1: 100, // Прозрачность первого цвета градиента (0-100)
      gradientOpacity2: 100, // Прозрачность второго цвета градиента (0-100)
      gradientAngle: 0, // Угол наклона градиента (0-360)
      
      // Состояния включения слоев фона
      enableBackgroundImage: false, // Включить фоновое изображение
      enableSolidBackground: false, // Включить солидную заливку
      enableGradientBackground: false, // Включить градиентную заливку
      isLoading: false, // Состояние загрузки для прелоадера
      // Three.js данные
      threeInstance: markRaw({
        scene: null,
        camera: null,
        renderer: null,
        cylinder: null,
        printSurface: null,
        mugGroup: null,
        texture: null,
        animationId: null
      })
    }
  },
  
  computed: {
    // Получаем текущие настройки строк и столбцов для выбранного типа сетки
    gridRows: {
      get() {
        return this.gridSettings[this.maskType].rows
      },
      set(value) {
        this.gridSettings[this.maskType].rows = value
      }
    },
    gridCols: {
      get() {
        return this.gridSettings[this.maskType].cols
      },
      set(value) {
        this.gridSettings[this.maskType].cols = value
      }
    },
    
    // Конвертируем проценты в пиксели для различных настроек
    strokeWidthPx() {
      // Базовый размер для расчета процентов (средний размер маски)
      const baseSize = 80 // базовый размер в пикселях для обводки
      return (this.strokeWidth / 100) * baseSize
    },
    
    shadowBlurPx() {
      const baseSize = 60 // базовый размер для размытия тени
      return (this.shadowBlur / 100) * baseSize
    },
    
    shadowOffsetXPx() {
      const baseSize = 40 // базовый размер для смещения тени по X
      return (this.shadowOffsetX / 100) * baseSize
    },
    
    shadowOffsetYPx() {
      const baseSize = 40 // базовый размер для смещения тени по Y
      return (this.shadowOffsetY / 100) * baseSize
    },
    
    // Градиент для фона
    gradientBackground() {
      const color1 = this.hexToRgba(this.gradientColor1, this.gradientOpacity1 / 100)
      const color2 = this.hexToRgba(this.gradientColor2, this.gradientOpacity2 / 100)
      return `linear-gradient(${this.gradientAngle}deg, ${color1}, ${color2})`
    }
  },
  
  watch: {
    // Автоматическое применение изменений ползунков
    'gridSettings': {
      handler() {
        this.generateGrid()
      },
      deep: true
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
    
    // Настройки фона
    backgroundImage() {
      this.generateGrid()
    },
    solidBackgroundColor() {
      this.generateGrid()
    },
    solidBackgroundOpacity() {
      this.generateGrid()
    },
    gradientColor1() {
      this.generateGrid()
      this.updateGradientPreview()
    },
    gradientColor2() {
      this.generateGrid()
      this.updateGradientPreview()
    },
    gradientOpacity1() {
      this.generateGrid()
      this.updateGradientPreview()
    },
    gradientOpacity2() {
      this.generateGrid()
      this.updateGradientPreview()
    },
    gradientAngle() {
      this.generateGrid()
      this.updateGradientPreview()
    },
    
    // Состояния включения слоев фона
    enableBackgroundImage() {
      this.generateGrid()
    },
    enableSolidBackground() {
      this.generateGrid()
    },
    enableGradientBackground() {
      this.generateGrid()
    },

    // Обновляем сетку при изменении изображений
    uploadedImages: {
      handler() {
        this.generateGrid()
        // Также обновляем Three.js текстуру с увеличенной задержкой
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateThreeTexture()
          }, 500) // Увеличили задержку с 300 до 500мс
        })
      },
      deep: true
    }
  },
  mounted() {
    // Показываем прелоадер при инициализации
    this.isLoading = true
    
    this.initPaper()
    
    // Инициализируем Three.js с небольшой задержкой
    this.$nextTick(() => {
      setTimeout(() => {
        this.initThreeJS()
      }, 200)
    })
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
      
      // Обработчик изменения размера Three.js canvas
      window.addEventListener('resize', this.resizeThreeCanvas)
    },
    
    // Динамический расчет толщины обводки в зависимости от размера маски
    getStrokeWidthForMask(maskBounds) {
      if (!maskBounds) {
        // Fallback к базовому размеру
        const baseSize = 80
        return (this.strokeWidth / 100) * baseSize
      }
      
      // Используем меньшую сторону маски как базовый размер для более точного расчета
      const minDimension = Math.min(maskBounds.width, maskBounds.height)
      return (this.strokeWidth / 100) * minDimension
    },
    
    createBackgroundLayer() {
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Создаем группу для фоновых слоев
      const backgroundGroup = new paper.Group()
      backgroundGroup.name = 'background'
      
      let layersAdded = 0
      
      // Слой 1: Фоновое изображение (самый нижний)
      if (this.enableBackgroundImage && this.backgroundImage) {
        try {
          const backgroundRaster = new paper.Raster(this.backgroundImage)
          backgroundRaster.onLoad = () => {
            // Масштабируем изображение под размер canvas
            const scale = Math.max(viewWidth / backgroundRaster.width, viewHeight / backgroundRaster.height)
            backgroundRaster.scale(scale)
            
            // Центрируем изображение
            backgroundRaster.position = new paper.Point(viewWidth / 2, viewHeight / 2)
            
            // Устанавливаем прозрачность
            backgroundRaster.opacity = 1
            
            // Помещаем в группу ПЕРЕД другими слоями (как самый нижний)
            backgroundGroup.insertChild(0, backgroundRaster)
            layersAdded++
            
            // Добавляем группу в проект, если это первый слой
            if (layersAdded === 1) {
              paper.project.addChild(backgroundGroup)
            }
            
            paper.view.draw()
          }
        } catch (error) {
          console.error('Ошибка загрузки фонового изображения:', error)
        }
      }
      
      // Слой 2: Солидная заливка (средний слой)
      if (this.enableSolidBackground) {
        const solidBackground = new paper.Path.Rectangle(0, 0, viewWidth, viewHeight)
        solidBackground.fillColor = this.hexToRgba(this.solidBackgroundColor, this.solidBackgroundOpacity / 100)
        backgroundGroup.addChild(solidBackground)
        layersAdded++
        
        // Добавляем группу в проект, если это первый слой
        if (layersAdded === 1) {
          paper.project.addChild(backgroundGroup)
        }
      }
      
      // Слой 3: Градиентная заливка (самый верхний из фоновых)
      if (this.enableGradientBackground) {
        const gradientBackground = new paper.Path.Rectangle(0, 0, viewWidth, viewHeight)
        
        // Создаем градиент
        const gradient = new paper.Gradient()
        const color1 = new paper.Color(this.gradientColor1)
        color1.alpha = this.gradientOpacity1 / 100
        const color2 = new paper.Color(this.gradientColor2)
        color2.alpha = this.gradientOpacity2 / 100
        
        gradient.add(0, color1)
        gradient.add(1, color2)
        
        // Создаем паттерн с градиентом
        const linearGradient = new paper.GradientColor(gradient, {
          origin: new paper.Point(0, 0),
          destination: new paper.Point(
            Math.cos(this.gradientAngle * Math.PI / 180) * viewWidth,
            Math.sin(this.gradientAngle * Math.PI / 180) * viewHeight
          )
        })
        
        gradientBackground.fillColor = linearGradient
        backgroundGroup.addChild(gradientBackground)
        layersAdded++
        console.log('Градиентная заливка добавлена как слой', layersAdded)
        
        // Добавляем группу в проект, если это первый слой
        if (layersAdded === 1) {
          paper.project.addChild(backgroundGroup)
        }
      }
      
      // Добавляем группу в проект, если есть фоновые слои и она еще не добавлена
      if (layersAdded === 0 && (this.enableBackgroundImage || this.enableSolidBackground || this.enableGradientBackground)) {
        paper.project.addChild(backgroundGroup)
      }
    },
    
    getPastelColor(index) {
      // Расширенный массив пастельных цветов
      const pastelColors = [
        // Розовые оттенки
        '#FFB3BA', '#FFC3CA', '#FFD3DA', '#FFB5C2', '#FFC5D2',
        // Зеленые оттенки
        '#BAFFC9', '#CAFFD9', '#DAFFE9', '#B5FFC5', '#C5FFD5',
        // Голубые оттенки
        '#BAE1FF', '#CAF1FF', '#DAF9FF', '#B5E1FF', '#C5F1FF',
        // Желтые оттенки
        '#FFFFBA', '#FFFFCA', '#FFFFDA', '#FFF5B5', '#FFF5C5',
        // Фиолетовые оттенки
        '#DCB5FF', '#ECC5FF', '#FCD5FF', '#D5B5FF', '#E5C5FF',
        // Оранжевые оттенки
        '#FFDFBA', '#FFEFCA', '#FFFFDA', '#FFD5B5', '#FFE5C5',
        // Мятные оттенки
        '#B5FFDC', '#C5FFEC', '#D5FFFC', '#B5F5DC', '#C5F5EC',
        // Розовые оттенки (дополнительные)
        '#FFB5E6', '#FFC5F6', '#FFD5FF', '#FFB5DC', '#FFC5EC',
        // Синие оттенки
        '#B5E6FF', '#C5F6FF', '#D5FFFF', '#B5E1FF', '#C5F1FF',
        // Лаймовые оттенки
        '#E6FFB5', '#F6FFC5', '#FFFFD5', '#E1FFB5', '#F1FFC5',
        // Персиковые оттенки
        '#FFE6B5', '#FFF6C5', '#FFFFD5', '#FFE1B5', '#FFF1C5',
        // Аквамариновые оттенки
        '#B5FFE6', '#C5FFF6', '#D5FFFF', '#B5F5E6', '#C5F5F6',
        // Лавандовые оттенки
        '#E6B5FF', '#F6C5FF', '#FFD5FF', '#E1B5FF', '#F1C5FF',
        // Малиновые оттенки
        '#FFB5DC', '#FFC5EC', '#FFD5FC', '#FFB5E1', '#FFC5F1',
        // Небесные оттенки
        '#B5D4FF', '#C5E4FF', '#D5F4FF', '#B5E1FF', '#C5F1FF',
        // Салатовые оттенки
        '#D4FFB5', '#E4FFC5', '#F4FFD5', '#E1FFB5', '#F1FFC5',
        // Бежевые оттенки
        '#FFD4B5', '#FFE4C5', '#FFF4D5', '#FFE1B5', '#FFF1C5',
        // Изумрудные оттенки
        '#B5FFD4', '#C5FFE4', '#D5FFF4', '#B5F5E1', '#C5F5F1',
        // Аметистовые оттенки
        '#D4B5FF', '#E4C5FF', '#F4D5FF', '#E1B5FF', '#F1C5FF',
        // Коралловые оттенки
        '#FFB5B5', '#FFC5C5', '#FFD5D5', '#FFB5E1', '#FFC5F1',
        // Дополнительные пастельные
        '#E8D5FF', '#D5E8FF', '#FFE8D5', '#D5FFE8', '#E8FFD5',
        '#F8E5FF', '#E5F8FF', '#FFF8E5', '#E5FFF8', '#F8FFE5'
      ]
      
      return pastelColors[index % pastelColors.length]
    },
    
    resizeCanvas() {
      const canvas = this.$refs.paperCanvas
      const container = canvas.parentElement.parentElement // Получаем canvas-container
      const rect = container.getBoundingClientRect()
      
      // Увеличиваем разрешение canvas для высокого качества текстуры
      const devicePixelRatio = window.devicePixelRatio || 1
      const targetWidth = rect.width * devicePixelRatio * 2 // Увеличиваем в 2 раза для высокого качества
      const targetHeight = (targetWidth * 9) / 19
      
      // Устанавливаем соотношение сторон 19:9 с высоким разрешением
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      // Устанавливаем CSS размер для отображения
      canvas.style.width = rect.width + 'px'
      canvas.style.height = (rect.width * 9) / 19 + 'px'
      
      if (this.paperScope) {
        paper.view.viewSize = new paper.Size(canvas.width, canvas.height)
        this.generateGrid()
      }
    },
    
    generateGrid() {
      if (!this.paperScope) return
      
      // Показываем прелоадер
      this.isLoading = true
      
      paper.project.clear()
      
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      const cellWidth = viewWidth / this.gridCols
      const cellHeight = viewHeight / this.gridRows
      
      // Создаем фоновые слои
      this.createBackgroundLayer()
      
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
      
      // Обновляем текстуру Three.js после отрисовки сетки с увеличенной задержкой
      this.$nextTick(() => {
        // Увеличиваем задержку для гарантии полной отрисовки canvas
        setTimeout(() => {
          this.updateThreeTexture()
          // Скрываем прелоадер после обновления текстуры
          this.isLoading = false
        }, 500) // Увеличили задержку с 300 до 500мс
      })
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
              useInGrid: false,
              disableStroke: false
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
    
    handleUseInGridChange(index, event) {
      // Обновляем состояние использования в сетке
      this.uploadedImages[index].useInGrid = event.target.checked
      
      // Перегенерируем сетку
      this.generateGrid()
    },
    
    handleDisableStrokeChange(index, event) {
      // Обновляем состояние отключения обводки и тени
      this.uploadedImages[index].disableStroke = event.target.checked
      
      // Перегенерируем сетку
      this.generateGrid()
    },
    
    // Методы для работы с фоном
    handleBackgroundImageUpload(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.backgroundImage = e.target.result
          this.enableBackgroundImage = true
        }
        reader.readAsDataURL(file)
      }
      
      // Очищаем input для возможности повторной загрузки того же файла
      event.target.value = ''
    },
    
    removeBackgroundImage() {
      this.backgroundImage = null
      this.enableBackgroundImage = false
    },
    
    hexToRgba(hex, alpha) {
      // Убираем # если есть
      hex = hex.replace('#', '')
      
      // Парсим RGB значения
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    
    updateGradientPreview() {
      // Обновляем превью градиента
      this.$nextTick(() => {
        const preview = document.querySelector('.gradient-preview')
        if (preview) {
          preview.style.background = this.gradientBackground
        }
      })
    },
    
    // Методы для работы с фоном
    handleBackgroundImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.backgroundImage = e.target.result
          // Автоматически включаем чекбокс при загрузке изображения
          this.enableBackgroundImage = true
        }
        reader.readAsDataURL(file)
      }
      // Очищаем input
      event.target.value = ''
    },
    
    removeBackgroundImage() {
      this.backgroundImage = null
      this.enableBackgroundImage = false // Отключаем чекбокс при удалении изображения
    },
    
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    
    updateGradientPreview() {
      this.$nextTick(() => {
        const previewElement = document.querySelector('.gradient-preview')
        if (previewElement) {
          previewElement.style.background = this.gradientBackground
        }
      })
    },
    
    createBackgroundLayer() {
      const viewWidth = paper.view.viewSize.width
      const viewHeight = paper.view.viewSize.height
      
      // Создаем основной слой фона
      const backgroundGroup = new paper.Group()
      backgroundGroup.name = 'background'
      
      // Слой 1: Фоновое изображение (самый нижний)
      if (this.backgroundImage && this.enableBackgroundImage) {
        const bgRaster = new paper.Raster(this.backgroundImage)
        bgRaster.name = 'backgroundImage'
        bgRaster.onLoad = () => {
          // Масштабируем изображение под размер канваса
          const scaleX = viewWidth / bgRaster.bounds.width
          const scaleY = viewHeight / bgRaster.bounds.height
          const scale = Math.max(scaleX, scaleY) // Сохраняем пропорции
          
          bgRaster.scale(scale)
          bgRaster.position = paper.view.center
          
          // Добавляем в группу фона
          backgroundGroup.addChild(bgRaster)
          paper.view.update()
        }
      }
      
      // Слой 2: Солидная заливка (поверх изображения)
      if (this.enableSolidBackground && this.solidBackgroundOpacity > 0) {
        const solidRect = new paper.Path.Rectangle({
          point: [0, 0],
          size: [viewWidth, viewHeight]
        })
        solidRect.name = 'solidBackground'
        
        const solidColor = this.hexToRgba(this.solidBackgroundColor, this.solidBackgroundOpacity / 100)
        solidRect.fillColor = solidColor
        
        // Добавляем в группу фона
        backgroundGroup.addChild(solidRect)
      }
      
      // Слой 3: Градиентная заливка (самый верхний из фонов)
      if (this.enableGradientBackground && (this.gradientOpacity1 > 0 || this.gradientOpacity2 > 0)) {
        // Создаем градиент через Canvas API
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = viewWidth
        canvas.height = viewHeight
        
        // Создаем линейный градиент с учетом угла
        const angleInRadians = (this.gradientAngle * Math.PI) / 180
        const x1 = 0
        const y1 = 0
        const x2 = viewWidth * Math.cos(angleInRadians)
        const y2 = viewHeight * Math.sin(angleInRadians)
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, this.hexToRgba(this.gradientColor1, this.gradientOpacity1 / 100))
        gradient.addColorStop(1, this.hexToRgba(this.gradientColor2, this.gradientOpacity2 / 100))
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, viewWidth, viewHeight)
        
        // Создаем растр из градиента
        const gradientRaster = new paper.Raster(canvas.toDataURL())
        gradientRaster.name = 'gradientBackground'
        gradientRaster.bounds = new paper.Rectangle(0, 0, viewWidth, viewHeight)
        
        // Добавляем в группу фона
        backgroundGroup.addChild(gradientRaster)
      }
      
      return backgroundGroup
    },
    
    getImagesForGrid() {
      return this.uploadedImages.filter(img => img.useInGrid)
    },
    
      getImageForPosition(row, col, totalImages) {
    // Отображаем изображение во всех масках
    const gridImages = this.getImagesForGrid()
    if (gridImages.length === 0) {
      return null
    }
    
    // Вычисляем индекс изображения для позиции (row, col)
    // Смещаем начало каждой строки для равномерного распределения
    // Используем большее смещение для лучшего распределения
    const baseIndex = row * this.gridCols + col
    const offset = row * 2 // Увеличиваем смещение
    const imageIndex = (baseIndex + offset) % gridImages.length
    
    return gridImages[imageIndex]
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
    
    applyMaskStyles(mask, image = null) {
      // Проверяем, нужно ли отключить обводку и тень для изображений
      const shouldDisableStroke = image && image.disableStroke
      
      // Применяем настройки обводки
      if (shouldDisableStroke) {
        mask.strokeColor = 'transparent'
        mask.strokeWidth = 0
      } else {
        mask.strokeColor = this.strokeColor
        // Используем динамический расчет толщины обводки в зависимости от размера маски
        mask.strokeWidth = this.getStrokeWidthForMask(mask.bounds)
      }
      
      if (image) {
        // Если есть изображение, скрываем маску и создаем растр
        mask.visible = false
        
        // Создаем растр из URL
        const raster = new paper.Raster(image.url)
        
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
          
          // Уменьшаем размер маски для обрезки на величину обводки
          const strokeInset = this.getStrokeWidthForMask(maskBounds) || 0
          
          // Стандартное уменьшение маски для обрезки на величину обводки
          const clipWidth = Math.max(1, maskBounds.width - strokeInset * 2)
          const clipHeight = Math.max(1, maskBounds.height - strokeInset * 2)
          const clipOffsetX = strokeInset
          const clipOffsetY = strokeInset
          
          tempCanvas.width = maskBounds.width
          tempCanvas.height = maskBounds.height
          
          // Очищаем canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          // Создаем путь маски на canvas
          tempCtx.save() // Сохраняем состояние
          tempCtx.beginPath()
          
          // Для прямоугольников создаем прямоугольный путь
          if (mask.data && mask.data.type === 'rectangle') {
            tempCtx.rect(clipOffsetX, clipOffsetY, clipWidth, clipHeight)
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
              tempCtx.moveTo(clipOffsetX + clipWidth / 2, clipOffsetY + clipHeight) // Нижняя точка
              tempCtx.lineTo(clipOffsetX, clipOffsetY) // Левый верхний угол
              tempCtx.lineTo(clipOffsetX + clipWidth, clipOffsetY) // Правый верхний угол
            } else {
              // Обычный треугольник - верхний угол, затем левый и правый нижние углы
              tempCtx.moveTo(clipOffsetX + clipWidth / 2, clipOffsetY) // Верхняя точка
              tempCtx.lineTo(clipOffsetX, clipOffsetY + clipHeight) // Левый нижний угол
              tempCtx.lineTo(clipOffsetX + clipWidth, clipOffsetY + clipHeight) // Правый нижний угол
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
            // Для шестигранников используем реальную геометрию маски, но уменьшенную на половину обводки
            tempCtx.beginPath()
            
            if (mask.segments && mask.segments.length > 0) {
              // Создаем уменьшенную копию реальной геометрии шестигранника
              const strokeHalf = strokeInset / 2
              
              // Первая точка
              const firstPoint = mask.segments[0].point
              const relativeFirstPoint = new paper.Point(
                firstPoint.x - maskBounds.x,
                firstPoint.y - maskBounds.y
              )
              
              // Уменьшаем размер на половину обводки
              const scaledX = relativeFirstPoint.x * ((maskBounds.width - strokeInset) / maskBounds.width) + strokeHalf
              const scaledY = relativeFirstPoint.y * ((maskBounds.height - strokeInset) / maskBounds.height) + strokeHalf
              
              tempCtx.moveTo(scaledX, scaledY)
              
              // Остальные точки
              for (let i = 1; i < mask.segments.length; i++) {
                const segment = mask.segments[i]
                const relativePoint = new paper.Point(
                  segment.point.x - maskBounds.x,
                  segment.point.y - maskBounds.y
                )
                
                // Уменьшаем размер на половину обводки
                const scaledPointX = relativePoint.x * ((maskBounds.width - strokeInset) / maskBounds.width) + strokeHalf
                const scaledPointY = relativePoint.y * ((maskBounds.height - strokeInset) / maskBounds.height) + strokeHalf
                
                tempCtx.lineTo(scaledPointX, scaledPointY)
              }
            } else {
              // Fallback - создаем шестигранник с уменьшенным размером
              const hexPoints = this.getHexagonPoints(clipWidth, clipHeight)
              tempCtx.moveTo(hexPoints[0].x + clipOffsetX, hexPoints[0].y + clipOffsetY)
              for (let i = 1; i < hexPoints.length; i++) {
                tempCtx.lineTo(hexPoints[i].x + clipOffsetX, hexPoints[i].y + clipOffsetY)
              }
            }
            
            tempCtx.closePath()
            
            console.log('🔷 Использована реальная геометрия шестигранника:', {
              segmentsCount: mask.segments ? mask.segments.length : 0,
              strokeHalf: strokeInset / 2
            })
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
          const scale = Math.max(scaleX, scaleY) // Используем Math.max чтобы изображение заполнило всю область
          
          // Вычисляем размеры масштабированного изображения
          const scaledWidth = imgWidth * scale
          const scaledHeight = imgHeight * scale
          
          // Центрируем изображение в уменьшенной области
          const offsetX = clipOffsetX + (canvasWidth - scaledWidth) / 2
          const offsetY = clipOffsetY + (canvasHeight - scaledHeight) / 2
          
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
            
            // Копируем данные (но не стили обводки)
            maskedRaster.data = mask.data
            
            // Применяем тень
            this.applyShadowToRaster(maskedRaster, image.disableStroke)
            
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
            
            // Создаем обводку поверх изображения
            if (!image.disableStroke && this.strokeWidth && this.strokeWidth > 0 && this.strokeColor) {
              this.createStrokeOverImage(maskedRaster, mask, parentGroup)
            }
            
            // Обновляем view
            paper.view.update()
            
            console.log('✅ Обрезанное изображение создано и добавлено:', {
              maskedRasterVisible: maskedRaster.visible,
              maskedRasterBounds: maskedRaster.bounds,
              parentGroupChildren: parentGroup ? parentGroup.children.length : 'no parent',
              hasStroke: !!(this.strokeWidth && this.strokeWidth > 0 && this.strokeColor)
            })
          }
        }
        
        raster.onError = () => {
          // Если изображение не загрузилось, показываем маску с обычной заливкой
          mask.visible = true
          const colorIndex = Math.floor(Math.random() * 80)
          mask.fillColor = this.getPastelColor(colorIndex)
          mask.fillOpacity = 0.3
          this.applyShadowToPath(mask, image.disableStroke) // Передаем свойство disableStroke
        }
        
      } else {
        // Обычная заливка без изображения
        const colorIndex = Math.floor(Math.random() * 80)
        mask.fillColor = this.getPastelColor(colorIndex)
        mask.fillOpacity = 0.3
        
        // Применяем настройки тени
        this.applyShadowToPath(mask, false) // Передаем false, так как это маска без изображения
      }
    },
    
    applyShadowToPath(path, disableStroke = false) {
      // Проверяем, нужно ли отключить тень для изображений
      const shouldDisableShadow = disableStroke
      
      // Применяем настройки тени к Path
      if (!shouldDisableShadow && (this.shadowBlur > 0 || this.shadowOffsetX !== 0 || this.shadowOffsetY !== 0)) {
        const shadowColor = new paper.Color(0, 0, 0, this.shadowOpacity / 100)
        path.shadowColor = shadowColor
        path.shadowBlur = this.shadowBlurPx
        path.shadowOffset = new paper.Point(this.shadowOffsetXPx, this.shadowOffsetYPx)
        
        // Принудительно обновляем отображение
        path.shadowColor = shadowColor
      } else {
        path.shadowColor = null
        path.shadowBlur = 0
        path.shadowOffset = null
      }
    },
    
    applyShadowToRaster(raster, disableStroke = false) {
      // Проверяем, нужно ли отключить тень для изображений
      const shouldDisableShadow = disableStroke
      
      // Применяем настройки тени к Raster
      if (!shouldDisableShadow && (this.shadowBlur > 0 || this.shadowOffsetX !== 0 || this.shadowOffsetY !== 0)) {
        const shadowColor = new paper.Color(0, 0, 0, this.shadowOpacity / 100)
        raster.shadowColor = shadowColor
        raster.shadowBlur = this.shadowBlurPx
        raster.shadowOffset = new paper.Point(this.shadowOffsetXPx, this.shadowOffsetYPx)
        
        // Принудительно обновляем отображение
        raster.shadowColor = shadowColor
      } else {
        raster.shadowColor = null
        raster.shadowBlur = 0
        raster.shadowOffset = null
      }
    },
    
    createStrokeOverImage(raster, originalMask, parentGroup) {
      // Создаем обводку поверх изображения, используя реальные сегменты маски
      let strokePath = null
      
      if (originalMask.data && originalMask.data.type === 'rectangle') {
        // Создаем прямоугольную обводку внутри маски
        const bounds = raster.bounds
        const inset = this.strokeWidthPx / 2
        strokePath = new paper.Path.Rectangle({
          point: [bounds.left + inset, bounds.top + inset],
          size: [bounds.width - this.strokeWidthPx, bounds.height - this.strokeWidthPx]
        })
      } else if (originalMask.data && originalMask.data.type === 'triangle') {
        // Создаем треугольную обводку внутри маски
        const bounds = raster.bounds
        const inset = this.strokeWidthPx / 2
        const isInverted = (originalMask.data.row + originalMask.data.col) % 2 === 1
        
        if (isInverted) {
          // Перевернутый треугольник
          strokePath = new paper.Path([
            new paper.Point(bounds.center.x, bounds.bottom - inset),
            new paper.Point(bounds.left + inset, bounds.top + inset),
            new paper.Point(bounds.right - inset, bounds.top + inset)
          ])
        } else {
          // Обычный треугольник
          strokePath = new paper.Path([
            new paper.Point(bounds.center.x, bounds.top + inset),
            new paper.Point(bounds.left + inset, bounds.bottom - inset),
            new paper.Point(bounds.right - inset, bounds.bottom - inset)
          ])
        }
        strokePath.closePath()
      } else if (originalMask.data && originalMask.data.type === 'diamond') {
        // Создаем ромбовидную обводку внутри маски
        const bounds = raster.bounds
        const inset = this.strokeWidthPx / 2
        strokePath = new paper.Path([
          new paper.Point(bounds.center.x, bounds.top + inset),
          new paper.Point(bounds.left + inset, bounds.center.y),
          new paper.Point(bounds.center.x, bounds.bottom - inset),
          new paper.Point(bounds.right - inset, bounds.center.y)
        ])
        strokePath.closePath()
      } else if (originalMask.data && originalMask.data.type === 'hexagon') {
        // Создаем шестиугольную обводку внутри маски
        if (originalMask.segments && originalMask.segments.length > 0) {
          // Используем реальные сегменты маски с отступом внутрь
          const inset = this.strokeWidthPx / 2
          const points = originalMask.segments.map(segment => {
            const point = segment.point
            const center = raster.bounds.center
            const direction = point.subtract(center).normalize()
            return point.subtract(direction.multiply(inset))
          })
          strokePath = new paper.Path(points)
          strokePath.closePath()
        } else {
                  // Fallback - создаем идеальный шестиугольник с отступом
        const bounds = raster.bounds
        const strokeWidth = this.getStrokeWidthForMask(bounds)
        const inset = strokeWidth / 2
        const hexPoints = this.getHexagonPoints(bounds.width - strokeWidth, bounds.height - strokeWidth)
        const points = hexPoints.map(p => new paper.Point(bounds.left + inset + p.x, bounds.top + inset + p.y))
          strokePath = new paper.Path(points)
          strokePath.closePath()
        }
      }
      
      if (strokePath) {
        // Настраиваем обводку
        strokePath.fillColor = null
        strokePath.strokeColor = this.strokeColor
        strokePath.strokeWidth = this.getStrokeWidthForMask(raster.bounds)
        
        // Настраиваем соединение линий для четких углов
        strokePath.strokeJoin = 'miter' // Острые углы
        strokePath.strokeCap = 'butt'   // Прямые концы
        
        // Добавляем обводку в ту же группу поверх изображения
        if (parentGroup) {
          parentGroup.addChild(strokePath)
        }
        
        console.log('🎨 Создана обводка поверх изображения:', {
          strokeType: originalMask.data ? originalMask.data.type : 'unknown',
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          strokeJoin: strokePath.strokeJoin,
          strokeCap: strokePath.strokeCap,
          isInverted: originalMask.data && originalMask.data.type === 'triangle' ? 
            (originalMask.data.row + originalMask.data.col) % 2 === 1 : false,
          segmentsCount: originalMask.segments ? originalMask.segments.length : 0
        })
      }
    },
    
    createRectangleMasks(group, cellWidth, cellHeight) {
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
      
      // Получаем изображения для сетки
      const gridImages = this.getImagesForGrid()
      
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const x = col * cellWidth + margin - xOffset
          const y = row * cellHeight + margin - yOffset
          
          const rect = new paper.Path.Rectangle({
            point: [x, y],
            size: [adjustedWidth, adjustedHeight]
          })
          rect.strokeJoin = 'miter' // Убираем скругление углов
          
          // Получаем изображение для данной позиции
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(rect, image)
          
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
      
      // Увеличиваем треугольники по вертикали на 0.5% для устранения просветов
      const verticalMultiplier = 1.005 // Увеличиваем на 0.5%
      
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
                [x - (cellWidth - margin * 2) * 1.5125, y + (cellHeight - margin * 2) * verticalMultiplier], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y + (cellHeight - margin * 2) * verticalMultiplier] // правый угол основания
              ],
              closed: true
            })
            triangle.strokeJoin = 'miter' // Убираем скругление углов
          } else {
            // Треугольник основанием вверх
            triangle = new paper.Path({
              segments: [
                [x - (cellWidth - margin * 2) * 1.5125, y], // левый угол основания
                [x + (cellWidth - margin * 2) * 2.5125, y], // правый угол основания
                [x + (cellWidth - margin * 2) / 2, y + (cellHeight - margin * 2) * verticalMultiplier] // вершина
              ],
              closed: true
            })
            triangle.strokeJoin = 'miter' // Убираем скругление углов
          }
          
          // Получаем изображение для данной позиции
          const gridImages = this.getImagesForGrid()
          const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(triangle, image)
          
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
            
            // Увеличиваем ромб на 0.5% для устранения просветов
            const sizeMultiplier = 1.005 // Увеличиваем на 0.5%
            const diamond = new paper.Path({
              segments: [
                [x + (cellWidth - margin * 2) / 2 * sizeMultiplier, y - (cellHeight - margin * 2) * 1.49592857723 * sizeMultiplier], // верхняя вершина
                [x + (cellWidth - margin * 2) * 2.487375 * sizeMultiplier, y + (cellHeight - margin * 2) / 2 * sizeMultiplier], // правая середина
                [x + (cellWidth - margin * 2) / 2 * sizeMultiplier, y + (cellHeight - margin * 2) * 2.49592857723 * sizeMultiplier], // нижняя вершина
                [x - (cellWidth - margin * 2) * 1.487375 * sizeMultiplier, y + (cellHeight - margin * 2) / 2 * sizeMultiplier] // левая середина
              ],
              closed: true
            })
            diamond.strokeJoin = 'miter' // Убираем скругление углов
            
            // Получаем изображение для данной позиции
            const gridImages = this.getImagesForGrid()
            const image = this.getImageForPosition(row, Math.floor(col), gridImages.length)
            
            // Применяем настройки обводки и тени
            this.applyMaskStyles(diamond, image)
            
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
      
      // Применяем внешний отступ - используем одинаковый отступ по обеим осям
      // Для шестигранников отступ должен быть одинаковым по вертикали и горизонтали
      const baseMargin = Math.min(cellWidth, cellHeight)
      const margin = (this.externalMargin / 100) * baseMargin
      
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
      
      // Примечание: увеличение высоты не помогает, поэтому используем уменьшение отступа в сегментах
      
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
          // Увеличиваем всю маску шестигранника на 0.5% для устранения просветов
          const sizeMultiplier = 1.005 // Увеличиваем на 0.5%
          
          // Применяем отступ к размерам шестигранника
          const adjustedHexWidth = hexWidth - margin * 2
          const adjustedHexHeight = hexHeight - margin * 2
          
          const hexagon = new paper.Path({
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
          
          // Получаем изображение для данной позиции
          const gridImages = this.getImagesForGrid()
          const image = this.getImageForPosition(row, col, gridImages.length)
          
          // Применяем настройки обводки и тени
          this.applyMaskStyles(hexagon, image)
          
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
        mask.strokeWidth = 0
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
      window.removeEventListener('resize', this.resizeThreeCanvas)
      
      if (this.paperScope) {
        // В Paper.js v0.12 нет метода remove для глобального объекта
        paper.project.clear()
        this.paperScope = null
      }
      
      // Очистка Three.js
      this.cleanupThreeJS()
    },
    
    initThreeJS() {
      const canvas = this.$refs.threeCanvas
      if (!canvas) return
      
      // Создаем сцену
      this.threeInstance.scene = new THREE.Scene()
      
      // Создаем камеру
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      const aspect = rect.width / rect.height
      
      this.threeInstance.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
      this.threeInstance.camera.position.set(0, 0, 15)
      
      // Создаем рендерер с высоким качеством
      this.threeInstance.renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true,
        preserveDrawingBuffer: true
      })
      
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
      const radius = 4 // Диаметр 8, радиус 4
      const height = 9.5
      const radialSegments = 64 // Увеличили количество радиальных сегментов для сглаживания
      const heightSegments = 16 // Увеличили количество сегментов по высоте
      
      const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, true)
      
      // Создаем белый материал для кружки
      const cylinderMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: false, // Убираем прозрачность
        opacity: 1.0,
        depthWrite: true,
        depthTest: true
      })
      
      // Создаем группу для объединения кружки и поверхности печати
      this.threeInstance.mugGroup = new THREE.Group()
      this.threeInstance.scene.add(this.threeInstance.mugGroup)
      
      // Добавляем кружку в группу
      this.threeInstance.cylinder = new THREE.Mesh(geometry, cylinderMaterial)
      this.threeInstance.mugGroup.add(this.threeInstance.cylinder)
      
      // Создаем кастомную геометрию для области печати (прямоугольник, обернутый вокруг кружки)
      const printSurfaceRadius = radius + 0.02 // Увеличили радиус для предотвращения просвечивания
      const printSurfaceHeight = height
      
      // Вычисляем размеры области печати с учетом соотношения 19:9
      const cylinderCircumference = 2 * Math.PI * printSurfaceRadius
      const targetRatio = 19 / 9
      const maxPrintWidth = printSurfaceHeight * targetRatio
      
      // Определяем размеры области печати
      let printWidth, printHeight
      if (maxPrintWidth > cylinderCircumference) {
        printWidth = cylinderCircumference
        printHeight = cylinderCircumference / targetRatio
      } else {
        printWidth = maxPrintWidth
        printHeight = printSurfaceHeight
      }
      
      // Вычисляем углы для области печати
      const angleWidth = (printWidth / cylinderCircumference) * Math.PI * 2
      const angleStart = -angleWidth / 2 // Центрируем область печати
      const angleEnd = angleWidth / 2
      
      // Создаем кастомную геометрию
      const printSurfaceGeometry = new THREE.BufferGeometry()
      
      // Создаем вершины для прямоугольной области печати
      const vertices = []
      const uvs = []
      const indices = []
      
      // Количество сегментов для создания плавной поверхности
      const segmentsX = 32 // Увеличили для более плавной поверхности
      const segmentsY = 16 // Увеличили для более плавной поверхности
      
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
      printSurfaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      printSurfaceGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
      printSurfaceGeometry.setIndex(indices)
      printSurfaceGeometry.computeVertexNormals()
      
      // UV координаты уже настроены правильно в кастомной геометрии
      
      // Создаем материал для поверхности печати
      const printSurfaceMaterial = new THREE.MeshBasicMaterial({ 
        map: null, // Будем устанавливать текстуру позже
        transparent: true,
        opacity: 1.0,
        side: THREE.FrontSide
      })
      
      this.threeInstance.printSurface = new THREE.Mesh(printSurfaceGeometry, printSurfaceMaterial)
      this.threeInstance.mugGroup.add(this.threeInstance.printSurface)
      
      // Запускаем анимацию вращения
      this.animate()
      
      // Обновляем текстуру при изменении сетки
      this.updateThreeTexture()
      
      // Скрываем прелоадер после полной инициализации
      this.isLoading = false
    },
    
    animate() {
      if (!this.threeInstance.renderer || !this.threeInstance.scene || !this.threeInstance.camera) return
      
      this.threeInstance.animationId = requestAnimationFrame(() => this.animate())
      
      if (this.threeInstance.mugGroup) {
        this.threeInstance.mugGroup.rotation.y += 0.01 // Медленное вращение группы
      }
      
      this.threeInstance.renderer.render(this.threeInstance.scene, this.threeInstance.camera)
    },
    
    updateThreeTexture() {
      if (!this.threeInstance.printSurface) {
        console.log('🔸 Поверхность печати не найдена')
        return
      }
      
      // Получаем canvas с сеткой
      const paperCanvas = this.$refs.paperCanvas
      if (!paperCanvas) {
        console.log('🔸 Paper canvas не найден')
        return
      }
      
      // Проверяем, что canvas имеет размеры и готов к рендерингу
      if (paperCanvas.width === 0 || paperCanvas.height === 0) {
        console.log('🔸 Canvas еще не готов, откладываем обновление')
        setTimeout(() => {
          this.updateThreeTexture()
        }, 100)
        return
      }
      
      try {
        // Создаем текстуру из canvas с высоким качеством
        const texture = new THREE.CanvasTexture(paperCanvas)
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
        const material = new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true,
          opacity: 1.0,
          color: 0xffffff, // Белый цвет для сохранения оригинальных цветов
          toneMapped: false // Отключаем tone mapping для сохранения яркости
        })
        
        // Обновляем материал поверхности печати
        if (this.threeInstance.printSurface.material) {
          this.threeInstance.printSurface.material.dispose()
        }
        this.threeInstance.printSurface.material = material
        
        console.log('✅ Текстура обновлена успешно')
      } catch (error) {
        console.error('❌ Ошибка при обновлении текстуры:', error)
      }
    },
    
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
    },
    
    resizeThreeCanvas() {
      if (!this.threeInstance.renderer || !this.threeInstance.camera) return
      
      const canvas = this.$refs.threeCanvas
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      
      // Увеличиваем разрешение Three.js canvas для высокого качества
      const devicePixelRatio = window.devicePixelRatio || 1
      const targetWidth = rect.width * devicePixelRatio
      const targetHeight = rect.height * devicePixelRatio
      
      this.threeInstance.camera.aspect = rect.width / rect.height
      this.threeInstance.camera.updateProjectionMatrix()
      
      this.threeInstance.renderer.setSize(targetWidth, targetHeight, false)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
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
  
  .container {
    > div {
      margin-bottom: 0;
    }
  }
}

.paper-canvas {
  width: 100%;
  height: 100%;
  border: none;
  cursor: crosshair;
  touch-action: none; // Отключаем стандартные touch события браузера
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, .15);
  background: #fff;
  
  &:focus {
    outline: none;
  }
}

.canvas-container {
  width: 100%;
  height: 0;
  padding-bottom: 47.37%; // Соотношение сторон 19:9 (9/19 * 100%)
  position: relative;
  
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.preview-container {
  width: 100%;
  height: 0;
  padding-bottom: 100%; // Квадратное соотношение для 3D превью
  position: relative;
  
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f8f9fa;
    border-radius: 8px;
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

/* Стили для иконок масок */
.btn-group .btn {
  padding: 0.5rem 1rem;
  
  i {
    font-size: 1.1rem;
  }
}

/* Стили для ползунков управления */
.form-group .form-label {
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-range {
  width: 100% !important;
}

/* Стили для иконки в чекбоксе */
.form-check-label i {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: .12rem !important;
}

.form-check-input:checked + .form-check-label i {
  color: #016527;
  margin-top: .12rem !important;
}

/* Стили для кнопки добавления изображений */
.btn[style*="background-color: #0d6efd"] {
  &:hover:not(:disabled) {
    background-color: #0b5ed7 !important;
    color: white !important;
  }
  
  &:disabled {
    background-color: #6c757d !important;
    color: #adb5bd !important;
  }
}

/* Стили для прелоадера */
.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 767.98px) {
  .grids-page {
    .card-body {
      padding: 1rem;
    }
  }
  
  .row.g-3 > .col-6 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 575.98px) {
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

/* Стили для градиентного превью */
.gradient-preview {
  background: linear-gradient(to right, #ffffff, #cccccc);
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>

