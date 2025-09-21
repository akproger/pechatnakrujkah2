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
            <!-- Кнопка добавления текста -->
            <div class="card-header">
              <div class="d-flex justify-content-start">
                <button 
                  @click="openTextDialog" 
                  class="btn canvas-button"
                >
                  <i class="bi bi-type me-2"></i>
                  Текст 2
                </button>
              </div>
            </div>
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
              <ThreeDRenderer 
                ref="threeRenderer"
                :source-canvas="$refs.paperCanvas"
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
                    <!-- Столбец: Изображение фона и солидная заливка -->
                    <div class="col-12">
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
                      
                      <!-- Радиокнопка для выбора фонового изображения -->
                      <div class="form-check mt-3">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          id="backgroundImage"
                          name="backgroundType"
                          value="image"
                          v-model="backgroundType"
                          :disabled="!backgroundImage"
                        >
                        <label class="form-check-label" for="backgroundImage">
                          Фоновое изображение
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
                      
                      <!-- Радиокнопка для выбора солидной заливки -->
                      <div class="form-check mb-3">
                        <input 
                          class="form-check-input" 
                          type="radio" 
                          id="backgroundSolid"
                          name="backgroundType"
                          value="solid"
                          v-model="backgroundType"
                        >
                        <label class="form-check-label" for="backgroundSolid">
                          Солидная заливка
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
                <div class="card-header">
                  <h5 class="card-title mb-0">Добавленные тексты</h5>
                </div>
                <div class="card-body">
                  <div v-if="textLayers.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-type display-4 mb-3"></i>
                    <p>Пока не добавлено ни одного текста</p>
                    <p class="small">Нажмите на кнопку "Текст 2" над основным канвасом, затем кликните на канвас для добавления текста</p>
                  </div>
                  <div v-else>
                    <div class="mb-3">
                      <p class="text-muted mb-3">
                        Текстовые слои расположены в порядке слоев (сверху вниз). Первый в списке = самый верхний слой. 
                        <i class="bi bi-info-circle me-1"></i>
                        Перетаскивайте слои для изменения их порядка или двойной клик на текст на канвасе.
                      </p>
                    </div>
                    <!-- Список текстовых слоев с возможностью перетаскивания -->
                    <div class="text-layers-list">
                      <div 
                        v-for="(text, index) in textLayers" 
                        :key="text.id || index" 
                        class="text-layer-item"
                        :class="{ 
                          'dragging': draggedTextIndex === index,
                          'drag-over': dragOverTextIndex === index
                        }"
                        draggable="true"
                        @dragstart="handleTextDragStart(index, $event)"
                        @dragend="handleTextDragEnd"
                        @dragover="handleTextDragOver(index, $event)"
                        @dragleave="handleTextDragLeave"
                        @drop="handleTextDrop(index, $event)"
                      >
                        <div class="layer-info">
                          <!-- Иконка перетаскивания -->
                          <div class="drag-handle">
                            <i class="bi bi-grip-vertical"></i>
      </div>
      
                          <!-- Информация о слое -->
                          <div class="layer-details">
                            <div class="layer-name">{{ text.textData?.text || 'Пустой текст' }}</div>
                            <div class="layer-meta">
                            Шрифт: {{ text.textData?.font || 'Arial' }} | 
                            Размер: {{ text.textData?.fontSize || 16 }}px |
                            <span v-if="text.textData?.textColor">Цвет: {{ text.textData.textColor }}</span>
                              <span v-if="text.mode"> | Режим: {{ getModeDisplayName(text.mode) }}</span>
                        </div>
                            <div class="layer-number">Слой #{{ text.layerIndex || (index + 1) }}</div>
                          </div>
                        </div>
                        
                        <!-- Действия со слоем -->
                        <div class="layer-actions">
                          <button 
                            type="button" 
                            class="btn btn-outline-primary btn-sm"
                            @click="editTextLayer(index)"
                            title="Редактировать"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary btn-sm"
                            @click="toggleTextLayerVisibility(index)"
                            title="Показать/скрыть"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-danger btn-sm"
                            @click="deleteTextLayer(index)"
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
    
    <!-- TextManager компонент -->
    <TextManager 
      ref="textManager"
      :canvas="$refs.paperCanvas"
      :paper-scope="paperScope"
      @text-dialog-opened="onTextDialogOpened"
      @text-dialog-closed="onTextDialogClosed"
      @text-applied="onTextApplied"
    />
  </div>
</template>

<script>
import paper from 'paper'
import * as THREE from 'three'
import { markRaw } from 'vue'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import TextManager from '../TextManager.vue'

export default {
  name: 'GridsPage',
  components: {
    ThreeDRenderer,
    TextManager
  },
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

      
      // Выбор типа фона (только один может быть активен)
      backgroundType: 'solid', // 'none', 'image', 'solid', 'gradient'
      
      // Состояния включения слоев фона (удалено - теперь используются computed свойства)
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
      }),
      
      // Текстовые слои
      textLayers: [],
      selectedTextLayerIndex: -1,
      nextTextLayerId: 1,
      
      // Переменные для перетаскивания текстовых слоев
      draggedTextIndex: -1,
      dragOverTextIndex: -1,
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
    

    
    // Computed свойства для синхронизации backgroundType с отдельными флагами
    enableBackgroundImage: {
      get() {
        return this.backgroundType === 'image'
      },
      set(value) {
        this.backgroundType = value ? 'image' : 'none'
      }
    },
    
    enableSolidBackground: {
      get() {
        return this.backgroundType === 'solid'
      },
      set(value) {
        this.backgroundType = value ? 'solid' : 'none'
      }
    },
    

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

    
    // Состояния включения слоев фона
    enableBackgroundImage() {
      this.generateGrid()
    },
    enableSolidBackground() {
      this.generateGrid()
    },


    // Обновляем сетку при изменении изображений
    uploadedImages: {
      handler() {
        this.generateGrid()
        // Также обновляем Three.js текстуру с увеличенной задержкой
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              this.$refs.threeRenderer.forceUpdate()
            }
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
    
    // Three.js теперь инициализируется через компонент ThreeDRenderer
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
      
      // Очищаем текстовые слои
      this.textLayers = []
      this.selectedTextLayerIndex = -1
      this.nextTextLayerId = 1
      
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
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
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
              useInGrid: true, // Сразу помечаем для размещения в сетке
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
          
          // Уменьшаем размер маски для обрезки на половину величины обводки
          // (чтобы изображение уходило под контур обводки по всем сторонам)
          const strokeInset = (this.getStrokeWidthForMask(maskBounds) || 0) / 2
          
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
      if (this.$refs.threeRenderer) {
        this.$refs.threeRenderer.forceUpdate()
      }
      
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
          if (this.$refs.threeRenderer) {
          this.$refs.threeRenderer.forceUpdate()
        }
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
    
    // Обработчики событий ThreeDRenderer
    onThreeInitialized() {
      console.log('✅ ThreeDRenderer инициализирован')
    },
    
    onTextureUpdated() {
      console.log('✅ Текстура ThreeDRenderer обновлена')
    },
    
    onTextureError(error) {
      console.error('❌ Ошибка текстуры ThreeDRenderer:', error)
    },
    
    // Методы для работы с текстами
    openTextDialog() {
      const textManager = this.$refs.textManager
      if (textManager) {
        textManager.openDialog()
      }
    },
    
    onTextDialogOpened() {
      console.log('📝 TextManager: диалог открыт в GridsPage')
    },
    
    onTextDialogClosed() {
      console.log('📝 TextManager: диалог закрыт в GridsPage')
    },
    
    onTextApplied(event) {
      console.log('📝 TextManager: применение текста в GridsPage', event)
      
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
      
      // Обновляем 3D модель с небольшой задержкой для корректного отображения
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DModel()
          console.log('🔄 3D модель обновлена после применения текста')
        }, 100)
      })
    },
    
    applyTextToCanvas(textData, position, mode) {
      if (!position || !this.paperScope) return
      
      console.log('✅ Применение текста на канвас:', textData)
      console.log('🎯 Координаты для применения:', {
        x: position.x,
        y: position.y,
        mode: mode,
        isEditing: false,
        editingLayerIndex: null
      })
      
      let layerIndex
      let textLayer
      
      // РЕЖИМ СОЗДАНИЯ: Создаем новый слой
      layerIndex = this.nextTextLayerId
      this.nextTextLayerId += 10 // Следующий слой будет на 10 больше
      console.log('➕ Создание нового слоя:', layerIndex)
      
      // Создаем новый слой в Paper.js (используем paperScope как в StickerManiaPage)
      textLayer = new this.paperScope.Layer()
      textLayer.name = `textLayer_${layerIndex}`
      
      // Устанавливаем z-index для слоя (чем больше индекс, тем выше слой)
      textLayer.data = { layerIndex: layerIndex }
      
      // Создаем подложку с включенным текстом на слое
      const backgroundItem = this.createBackgroundItemOnLayer(textLayer, layerIndex, textData, position, mode)
      
      // Текст уже включен в Raster подложки, отдельный текстовый элемент не нужен
      const textItem = null // Текст включен в backgroundItem
      
      console.log('✅ Создана подложка с включенным текстом:', {
        backgroundType: backgroundItem ? backgroundItem.type : 'none',
        hasText: !!textData.text
      })
      
      // РЕЖИМ СОЗДАНИЯ: Добавляем новую информацию
      const layerInfo = {
        id: layerIndex,
        layer: textLayer,
        textItem: textItem,
        backgroundItem: backgroundItem,
        textData: { 
          ...textData,
          backgroundMode: mode // Добавляем backgroundMode для сохранения
        }, // Используем переданные данные
        position: { ...position }, // Используем переданную позицию
        mode: mode, // Используем переданный режим
        createdAt: new Date().toISOString()
      }
      
      // Добавляем новый текстовый слой в начало массива (позиция 0 = самый верхний слой)
      this.textLayers.unshift(layerInfo)
      
      // Переупорядочиваем текстовые слои в Paper.js согласно порядку в массиве
      this.reorderTextLayersInPaperJS()
      
      // Активируем вкладку "Тексты"
      this.activeTab = 'texts'
      
      console.log('📝 Новый текст добавлен:', layerInfo)
      
      // Обновляем канвас
      this.paperScope.view.draw()
    },
    
    updateExistingTextLayer(layerIndex, textData, position, mode) {
      if (layerIndex >= 0 && layerIndex < this.textLayers.length) {
        const textLayer = this.textLayers[layerIndex]
        
        // Удаляем старый элемент
        if (textLayer.backgroundItem) {
          textLayer.backgroundItem.remove()
        }
        
        // Создаем новый слой с обновленными данными
        const layerId = textLayer.id
        const layer = new this.paperScope.Layer()
        layer.name = `textLayer_${layerId}`
        layer.data = { layerIndex: layerId }
        
        // Создаем новую подложку с обновленными данными
        const backgroundItem = this.createBackgroundItemOnLayer(layer, layerId, textData, position, mode)
        
        // Обновляем информацию о текстовом слое
        textLayer.layer = layer
        textLayer.backgroundItem = backgroundItem
        textLayer.textData = textData
        textLayer.position = position
        textLayer.mode = mode
        
        console.log('📝 Текстовый слой обновлен:', textLayer)
        
        // Переупорядочиваем текстовые слои
        this.reorderTextLayersInPaperJS()
        
        // Обновляем канвас
        this.paperScope.view.draw()
        
        // Обновляем 3D модель с задержкой для корректного отображения изменений
        this.$nextTick(() => {
          setTimeout(() => {
            this.update3DModel()
            console.log('🔄 3D модель обновлена после редактирования текста')
          }, 100)
        })
      }
    },
    
    selectTextLayer(index) {
      this.selectedTextLayerIndex = index
      console.log('📝 Выбран текстовый слой:', index)
    },
    
    editTextLayer(index) {
      if (index >= 0 && index < this.textLayers.length) {
        const textLayer = this.textLayers[index]
        
        // Открываем диалог TextManager для редактирования
        const textManager = this.$refs.textManager
        if (textManager) {
          textManager.editTextLayer(textLayer.textData, textLayer.position, textLayer.mode, index)
        }
      }
    },
    
    deleteTextLayer(index) {
      if (index >= 0 && index < this.textLayers.length) {
        const textLayer = this.textLayers[index]
        
        // Удаляем слой из Paper.js
        if (textLayer.layer) {
          textLayer.layer.remove()
        }
        
        // Удаляем из массива
        this.textLayers.splice(index, 1)
        
        // Обновляем выбранный индекс
        if (this.selectedTextLayerIndex >= this.textLayers.length) {
          this.selectedTextLayerIndex = this.textLayers.length - 1
        }
        
        console.log('📝 Текстовый слой удален:', index)
        
        // Обновляем канвас
        this.paperScope.view.draw()
        
        // Обновляем 3D модель с небольшой задержкой
        this.$nextTick(() => {
          setTimeout(() => {
            this.update3DModel()
            console.log('🔄 3D модель обновлена после удаления текста')
          }, 100)
        })
      }
    },
    
    getJustificationFromAlign(align) {
      switch (align) {
        case 'left': return 'left'
        case 'right': return 'right'
        case 'center': 
        default: return 'center'
      }
    },
    
    // Вычисление крайних точек суперподложки (прямоугольник + хвост)
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
          const strokePadding = strokeWidth / 2 + 5 // Добавляем 5px для безопасности
          
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
        // Fallback на простой прямоугольник
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
    
    // Переупорядочивание текстовых слоев в Paper.js
    reorderTextLayersInPaperJS() {
      console.log('🔄 Переупорядочивание текстовых слоев в Paper.js...')
      
      // Сначала перемещаем все текстовые слои на задний план
      this.textLayers.forEach((layer, index) => {
        if (layer.layer) {
          layer.layer.sendToBack()
        }
      })
      
      // Затем перемещаем их в правильном порядке
      // Индекс 0 = самый верхний слой (первый в списке)
      // Индекс N = самый нижний слой (последний в списке)
      // Идем в обратном порядке, чтобы индекс 0 стал самым верхним
      for (let i = this.textLayers.length - 1; i >= 0; i--) {
        const layer = this.textLayers[i]
        if (layer.layer) {
          layer.layer.bringToFront()
          console.log(`📌 Текстовый слой ${i} - ${i === 0 ? 'самый верхний' : 'слой ' + i}`)
        }
      }
      
      // Обновляем Paper.js view
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.update()
      }
      
      console.log('✅ Переупорядочивание текстовых слоев завершено')
      
      // Обновляем 3D модель с небольшой задержкой
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DModel()
          console.log('🔄 3D модель обновлена после переупорядочивания текстовых слоев')
        }, 100)
      })
    },
    
    // Создание подложки на слое (используем Paper.js напрямую для точного контроля размеров)
    createBackgroundItemOnLayer(layer, layerIndex, textData, position, mode) {
      if (!position || !this.paperScope) return null
      
      console.log('🎨 Создание подложки на слое через Paper.js:', layerIndex)
      
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
      
      // Добавляем подложку на слой если она создана
      if (backgroundItem) {
        backgroundItem.data = {
          isTextBackground: true,
          layerIndex: layerIndex,
          mode: mode
        }
        layer.addChild(backgroundItem)
      }
      
      console.log('✅ Подложка создана через Paper.js:', {
        backgroundItem: backgroundItem,
        position: `${x}, ${y}`,
        mode: mode
      })
      return backgroundItem
    },
    
    // Создание текстового элемента на слое
    createTextItemOnLayer(layer, layerIndex, textData, position, mode) {
      if (!position || !this.paperScope) return null
      
      console.log('📝 Создание текстового элемента на слое:', layerIndex)
      
      const x = position.x
      const y = position.y
      
      const textItem = new this.paperScope.PointText(new this.paperScope.Point(x, y))
      
      textItem.content = textData.text || 'Текст'
      textItem.fontSize = textData.fontSize || 24
      textItem.fontFamily = textData.font || 'Arial'
      textItem.fillColor = textData.textColor || '#000000'
      textItem.justification = this.getJustificationFromAlign(textData.textAlign || 'center')
      
      textItem.point = new this.paperScope.Point(x, y)
      
      textItem.data = {
        isTextOverlay: true,
        layerIndex: layerIndex,
        mode: mode,
        isDraggable: true
      }
      
      textItem.visible = true
      textItem.opacity = 1
      
      // Добавляем на слой
      layer.addChild(textItem)
      
      // Принудительно перемещаем текст на передний план слоя
      textItem.bringToFront()
      
      console.log('✅ Текстовый элемент создан:', textItem)
      return textItem
    },
    
    
    // Создание подложки используя существующую логику из превью
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
        
        // Вычисляем точные координаты крайних точек суперподложки
        const extremePoints = this.calculateExtremePointsForSuperBackground(x, y, backgroundWidth, backgroundHeight, currentTextData)
        
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
        if (currentTextData.shadow) {
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
        }
        
        // Рисуем объединенную фигуру в центре канваса (логические координаты)
        this.drawCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, backgroundWidth, backgroundHeight, 1, backgroundColor, true, currentTextData)
        
        // Сбрасываем тень
        if (currentTextData.shadow) {
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена (логические координаты)
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth // Логические координаты (как в StickerManiaPage)
          this.strokeCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, backgroundWidth, backgroundHeight, 1, currentTextData)
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
        if (currentTextData.textImage && currentTextData.cachedImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: true,
            imageSize: `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}`
          })
          // Если есть изображение, используем его как маску для заливки текста
          const img = currentTextData.cachedImage
          
          // Создаем временный канвас для текста с изображением с ЛОГИЧЕСКИМИ размерами
          const textCanvas = document.createElement('canvas')
          textCanvas.width = canvasWidth // Логический размер (без HiDPI!)
          textCanvas.height = canvasHeight
          textCanvas.style.width = canvasWidth + 'px' // Логический размер
          textCanvas.style.height = canvasHeight + 'px'
          const textCtx = textCanvas.getContext('2d')
          // НЕ масштабируем контекст - работаем в логических координатах!
          
          // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
          const textWidth = tempCtx.measureText(currentTextData.text).width
          const textHeight = currentTextData.fontSize * 1 * currentTextData.lineHeight
          
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
          textCtx.fillText(currentTextData.text, canvasWidth/2, canvasHeight/2)
          
          // Рисуем результат на основном канвасе
          tempCtx.drawImage(textCanvas, 0, 0)
          
          console.log('✅ Текст с изображением добавлен в Raster')
        } else {
          // Обычный текст без изображения (как в превью)
          console.log('📝 Рисуем обычный текст без изображения')
          
          // Настраиваем стили текста (точно как в превью)
          tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
          tempCtx.textAlign = currentTextData.textAlign || 'center'
          tempCtx.textBaseline = 'middle'
          tempCtx.fillStyle = currentTextData.textColor || '#000000'
          
          // Рисуем текст в центре канваса
          tempCtx.fillText(currentTextData.text || 'Текст', canvasWidth/2, canvasHeight/2)
          
          console.log('✅ Обычный текст добавлен в Raster')
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
        
        // Вычисляем реальные размеры текста для правильного размера канваса
        const tempCtxForMeasure = document.createElement('canvas').getContext('2d')
        tempCtxForMeasure.font = `${currentTextData.fontWeight} ${currentTextData.fontSize}px ${currentTextData.font}`
        const textMetrics = tempCtxForMeasure.measureText(currentTextData.text)
        const textWidth = textMetrics.width
        const textHeight = currentTextData.fontSize * currentTextData.lineHeight
        
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
        if (currentTextData.shadow) {
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

    // Создание подложки "Текст с изображением" используя существующую логику из превью
    createImageTextBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
      const currentTextData = textData
      
      try {
        
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        // Вычисляем реальные размеры текста для правильного размера канваса
        const tempCtxForMeasure = document.createElement('canvas').getContext('2d')
        tempCtxForMeasure.font = `${currentTextData.fontWeight} ${currentTextData.fontSize}px ${currentTextData.font}`
        const textMetrics = tempCtxForMeasure.measureText(currentTextData.text)
        const textWidth = textMetrics.width
        const textHeight = currentTextData.fontSize * currentTextData.lineHeight
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidth)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeight)
        
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
        
        // Устанавливаем стиль шрифта (как в превью)
        const fontSize = currentTextData.fontSize
        const fontFamily = currentTextData.font
        const fontWeight = currentTextData.fontWeight
        const textColor = currentTextData.textColor
        
        tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        tempCtx.textAlign = currentTextData.textAlign || 'center'
        tempCtx.textBaseline = 'middle'
        
        // 1. СНАЧАЛА рисуем тень (если включена) - она должна быть под основным текстом
        if (currentTextData.shadow) {
          tempCtx.shadowColor = currentTextData.shadowColor
          tempCtx.shadowBlur = currentTextData.shadowBlur
          tempCtx.shadowOffsetX = currentTextData.shadowOffsetX * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.shadowOffsetY = currentTextData.shadowOffsetY * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.globalAlpha = currentTextData.shadowOpacity / 100
          
          // Рисуем тень текста
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, canvasCenterX, canvasCenterY, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
          
          // Сбрасываем настройки тени
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
          tempCtx.globalAlpha = 1
        }
        
        // 2. ЗАТЕМ рисуем основной текст с поддержкой изображения (как в превью)
        if (currentTextData.textImage && currentTextData.cachedImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: true,
            imageSize: `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}`
          })
          // Если есть изображение, используем его как маску для заливки текста
          const img = currentTextData.cachedImage
          
          // Создаем временный канвас для текста с изображением с ЛОГИЧЕСКИМИ размерами
          const textCanvas = document.createElement('canvas')
          textCanvas.width = canvasWidth // Логический размер (без HiDPI!)
          textCanvas.height = canvasHeight
          textCanvas.style.width = canvasWidth + 'px' // Логический размер
          textCanvas.style.height = canvasHeight + 'px'
          const textCtx = textCanvas.getContext('2d')
          // НЕ масштабируем контекст - работаем в логических координатах!
          
          // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
          const textWidth = tempCtx.measureText(currentTextData.text).width
          const textHeight = currentTextData.fontSize * 1 * currentTextData.lineHeight
          
          // Используем точные размеры текста для изображения
          // Изображение должно точно заполнить область текста
          const drawWidth = textWidth
          const drawHeight = textHeight
          
          // ВАЖНО: Координаты должны быть относительно временного канваса, а не основного!
          // Временный канвас имеет размеры canvasWidth x canvasHeight
          const textCanvasCenterX = canvasWidth / 2
          const textCanvasCenterY = canvasHeight / 2
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
            canvasCenter: `${canvasCenterX}, ${canvasCenterY}`,
            containerSize: `${canvasWidth}x${canvasHeight}`,
            dpr: dpr,
            fontSize: currentTextData.fontSize,
            lineHeight: currentTextData.lineHeight
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
            containerSize: `${canvasWidth}x${canvasHeight}`,
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
          
          // Создаем маску из текста (логические координаты относительно временного канваса)
          textCtx.globalCompositeOperation = 'destination-in'
          textCtx.font = `${currentTextData.fontWeight} ${currentTextData.fontSize}px ${currentTextData.font}`
          textCtx.textAlign = currentTextData.textAlign || 'center'
          textCtx.textBaseline = 'middle'
          textCtx.fillStyle = 'white'
          this.drawMultilineTextWithData(textCtx, currentTextData.text, textCanvasCenterX, textCanvasCenterY, currentTextData.fontSize * 1, currentTextData.lineHeight, currentTextData)
          
          // Рисуем результат на основном канвасе (полный размер)
          tempCtx.drawImage(textCanvas, 0, 0)
          
          console.log('🖼️ Маска с изображением нарисована (ЛОГИЧЕСКИЕ размеры):', {
            textCanvasSize: `${textCanvas.width}x${textCanvas.height}`,
            tempCanvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
            tempCanvasLogicalSize: `${canvasWidth}x${canvasHeight}`,
            dpr: dpr,
            note: 'Временный канвас теперь использует логические размеры - растр будет правильного размера!'
          })
      } else {
          // Если нет изображения, используем обычную заливку цветом
          console.log('🖼️ Рисуем текст без изображения:', {
            text: currentTextData.text,
            textColor: textColor,
            fontSize: currentTextData.fontSize,
            position: `${canvasCenterX}, ${canvasCenterY}`
          })
          tempCtx.fillStyle = textColor
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, canvasCenterX, canvasCenterY, currentTextData.fontSize * 1, currentTextData.lineHeight, currentTextData)
        }
        
        // 3. НАКОНЕЦ применяем обводку к тексту если включена (поверх всего)
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth * 1 // previewScale = 1
          this.drawMultilineTextStrokeWithData(tempCtx, currentTextData.text, canvasCenterX, canvasCenterY, currentTextData.fontSize * 1, currentTextData.lineHeight, currentTextData)
        }
        
        // Конвертируем Canvas в Paper.js Raster
        const raster = new this.paperScope.Raster(tempCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку Canvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('🎯 Raster создан с правильными размерами (ImageText):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `${1 / dpr}, ${1 / dpr}`,
          padding: padding
        })
        
        console.log('✅ Подложка "Текст с изображением" создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `${(1 / dpr).toFixed(3)}x`,
          textData: {
            text: currentTextData.text,
            fontSize: currentTextData.fontSize,
            textColor: currentTextData.textColor,
            fontWeight: currentTextData.fontWeight,
            font: currentTextData.font,
            hasImage: !!(currentTextData.textImage && currentTextData.cachedImage),
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
        
        // Используем фиксированные размеры канваса (как в других режимах)
        // Добавляем отступы для тени и обводки
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX) + Math.abs(currentTextData.shadowOffsetY), 100) : 0
        const strokePadding = currentTextData.stroke ? (currentTextData.strokeWidth / 2 + 2) : 0
        const tailPadding = 50 // Отступ для хвоста
        
        const canvasWidth = backgroundWidth + shadowPadding + strokePadding + tailPadding
        const canvasHeight = backgroundHeight + shadowPadding + strokePadding + tailPadding
        
        console.log('📏 Расчет размеров канваса (фиксированные размеры):', {
          backgroundSize: `${backgroundWidth}x${backgroundHeight}`,
          shadowPadding: shadowPadding,
          strokePadding: strokePadding,
          tailPadding: tailPadding,
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          note: 'Используем фиксированные размеры как в других режимах'
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
        
        // ЭКСПЕРИМЕНТ: Суперподложка правильного размера, только текст уменьшаем
        const backgroundScale = 0.5 // Суперподложка правильного размера
        const textScale = 0.5 // Текст правильного размера
        const scaledBackgroundWidth = backgroundWidth * backgroundScale
        const scaledBackgroundHeight = backgroundHeight * backgroundScale
        
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
        if (currentTextData.shadow) {
          tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * backgroundScale))
          tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale)
          tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale)
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
        if (currentTextData.shadow) {
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
        
        console.log('🎯 Raster создан с правильными размерами (Thoughts):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          originalPosition: `${x}, ${y}`,
          offset: `${offsetX}, ${offsetY}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: 'none (логические координаты)',
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
      if (currentTextData.shadow) {
        ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale)
      }
      
      ctx.beginPath()
      this.drawOval(ctx, centerX, centerY, bgWidth, bgHeight)
      ctx.fillStyle = backgroundColor || currentTextData.backgroundColor
      ctx.fill()
      
      // Сбрасываем тень
      if (currentTextData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена (толще для высокого разрешения)
      if (currentTextData.stroke) {
        ctx.strokeStyle = currentTextData.strokeColor
        // Для высокого разрешения делаем обводку в 2 раза толще
        const strokeMultiplier = isHighDPI ? 0.98 : 0.49
        ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale * strokeMultiplier))
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
        if (currentTextData.shadow) {
          ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale))
          ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale)
          ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale)
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
        
        // Добавляем обводку если включена (толще для высокого разрешения)
        if (currentTextData.stroke) {
          ctx.strokeStyle = currentTextData.strokeColor
          // Для высокого разрешения делаем обводку в 2 раза толще
          const strokeMultiplier = isHighDPI ? 0.98 : 0.49
          ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale * strokeMultiplier))
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
      const tailSize = Number(currentTextData.tailSize) / 100 // От 100% до 300%
      const tailWidth = Number(currentTextData.tailWidth) / 100 // От 40% до 100% (уже в правильном формате)
      const tailAngle = Number(currentTextData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (точно как в StickerManiaPage для основного канваса)
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * 1.25 // Базовая длина хвоста (как в StickerManiaPage)
      
      console.log('🔍 buildUnifiedShapePathWithCache DEBUG:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        minDimension: minDimension,
        tailLength: tailLength,
        scale: scale
      })
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      if (cachedIntersection) {
        // Создаем суперподложку с хвостом используя КЭШИРОВАННУЮ точку
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   cachedIntersection, tailAngle, tailLength, tailWidth, currentTextData, scale)
      } else {
        // Если нет пересечения, рисуем обычную подложку
        this.buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight)
      }
    },
    
    // Построение пути суперподложки с хвостом
    buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                           intersectionPoint, tailAngle, tailLength, tailWidth, textData = null, scale = 1) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // Вычисляем параметры хвоста
      const tailWidthPercent = tailWidth !== undefined ? tailWidth : (Number(currentTextData.tailWidth) / 100)
      const tailSizePercent = Number(currentTextData.tailSize) / 100
      
      console.log('🔍 buildSuperBackgroundPath DEBUG:', {
        passedTailWidth: tailWidth,
        currentTextDataTailWidth: currentTextData.tailWidth,
        finalTailWidthPercent: tailWidthPercent,
        tailSizePercent,
        scale
      })
      
      // Острая вершина хвоста (используем переданный tailLength с учетом tailSize)
      const sharpPointX = centerX + tailLength * tailSizePercent * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * tailSizePercent * Math.sin(tailAngle)
      
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
      
      for (const side of sides) {
        const intersection = this.getLineIntersection(
          centerX, centerY, tailEndX, tailEndY,
          side.x1, side.y1, side.x2, side.y2
        )
        
        if (intersection) {
          // Проверяем, что точка пересечения находится на отрезке
          if (this.isPointOnLineSegment(intersection.x, intersection.y, side.x1, side.y1, side.x2, side.y2)) {
            return intersection
          }
        }
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
      
      // Рисуем тень если есть
      if (textData.shadow) {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = textData.shadowBlur || 10
        ctx.shadowOffsetX = textData.shadowOffsetX || 5
        ctx.shadowOffsetY = textData.shadowOffsetY || 5
      }
      
      ctx.fillText(textData.text, centerX, centerY)
      
      // Рисуем обводку если есть
      if (textData.stroke) {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        ctx.strokeText(textData.text, centerX, centerY)
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
      
      // Рисуем тень если есть (с масштабированием)
      if (textData.shadow) {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = (textData.shadowBlur || 10) * scale
        ctx.shadowOffsetX = (textData.shadowOffsetX || 5) * scale
        ctx.shadowOffsetY = (textData.shadowOffsetY || 5) * scale
      }
      
      ctx.fillText(textData.text, centerX, centerY)
      
      // Рисуем обводку если есть (с масштабированием)
      if (textData.stroke) {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = (textData.strokeWidth || 3) * scale
        ctx.strokeText(textData.text, centerX, centerY)
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
        
        // НЕ применяем тень к тексту - тень должна быть у подложки
        
        console.log('🎨 Контекст настроен:', {
          font: ctx.font,
          textAlign: ctx.textAlign,
          textBaseline: ctx.textBaseline,
          fillStyle: ctx.fillStyle
        })
        
        // Рисуем текст с поддержкой переноса строк
        this.drawMultilineText(ctx, textData.text, x, y, fontSize, textData.lineHeight)
        
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
      if (textData.shadow) {
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale * 2) // Добавляем множитель x2 для смещения
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale * 2) // Добавляем множитель x2 для смещения
        
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
      const totalTextHeight = lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем обводку каждой строки
      lines.forEach((line, index) => {
        const lineY = startY + (index * fontSize * lineHeight) + fontSize / 2
        
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
      
      const lines = text.split('\n')
      
      // Устанавливаем размер шрифта (используем fontSize как есть, масштабирование применяется на уровне вызова)
      ctx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Вычисляем межстрочный интервал
      const lineSpacing = fontSize * lineHeight
      
      // Вычисляем общую высоту текста для центрирования по вертикали
      const totalTextHeight = lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем каждую строку
      lines.forEach((line, index) => {
        const lineY = startY + (index * fontSize * lineHeight) + fontSize / 2
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if ((textData.textAlign || 'center') === 'left') {
          lineX = x - maxTextWidth / 2
        } else if ((textData.textAlign || 'center') === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
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
    update3DModel() {
      if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
        this.$refs.threeRenderer.forceUpdate()
        console.log('🔄 3D модель обновлена')
      } else {
        console.log('⚠️ ThreeDRenderer не готов для обновления')
      }
    },

    getModeDisplayName(mode) {
      const modeNames = {
        'standard': 'Стандарт',
        'conversation': 'Разговор',
        'thoughts': 'Мысли',
        'image-text': 'Текст с изображением'
      }
      return modeNames[mode] || mode
    },

    // Обработчики перетаскивания для текстовых слоев
    handleTextDragStart(index, event) {
      this.draggedTextIndex = index
      event.dataTransfer.effectAllowed = 'move'
      console.log(`🖱️ Начато перетаскивание текстового слоя ${index}`)
    },
    
    handleTextDragEnd() {
      this.draggedTextIndex = -1
      this.dragOverTextIndex = -1
      console.log('🖱️ Завершено перетаскивание текстового слоя')
    },
    
    handleTextDragOver(index, event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      
      if (this.draggedTextIndex !== index) {
        this.dragOverTextIndex = index
      }
    },
    
    handleTextDragLeave() {
      this.dragOverTextIndex = -1
    },
    
    // Сброс текстового слоя
    handleTextDrop(targetIndex, event) {
      event.preventDefault()
      
      if (this.draggedTextIndex === -1 || this.draggedTextIndex === targetIndex) {
        return
      }
      
      console.log(`🎯 Перемещение текстового слоя с позиции ${this.draggedTextIndex} на позицию ${targetIndex}`)
      console.log(`📋 Новая логика: позиция ${targetIndex} = ${targetIndex === 0 ? 'самый верхний' : targetIndex === this.textLayers.length - 1 ? 'самый нижний' : 'средний'} слой`)
      
      // Перемещаем текстовый слой в массиве
      const draggedLayer = this.textLayers[this.draggedTextIndex]
      this.textLayers.splice(this.draggedTextIndex, 1)
      this.textLayers.splice(targetIndex, 0, draggedLayer)
      
      // Обновляем индексы в Paper.js для корректного отображения слоев
      this.reorderTextLayersInPaperJS()
      
      // Сбрасываем состояния перетаскивания
      this.draggedTextIndex = -1
      this.dragOverTextIndex = -1
      
      console.log('✅ Текстовый слой успешно перемещен')
    },

    // Переключение видимости текстового слоя
    toggleTextLayerVisibility(index) {
      const layer = this.textLayers[index]
      if (layer && layer.layer) {
        layer.layer.visible = !layer.layer.visible
        console.log(`👁️ Видимость слоя ${index}: ${layer.layer.visible ? 'включена' : 'выключена'}`)
        
        // Обновляем 3D модель с небольшой задержкой
        this.$nextTick(() => {
          setTimeout(() => {
            this.update3DModel()
            console.log('🔄 3D модель обновлена после изменения видимости текста')
          }, 100)
        })
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
  background: transparent;
  
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

/* Стили для кнопки "Текст 2" */
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

.canvas-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.canvas-button * {
  color: white !important;
}

/* Стили для текстовых слоев */
/* Стили для вкладки "Тексты" */
.text-layers-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.text-layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.text-layer-item:hover {
  background-color: #f8f9fa;
}

.text-layer-item:last-child {
  border-bottom: none;
}

/* Стили для перетаскивания текстовых слоев */
.text-layer-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.text-layer-item.drag-over {
  border-top: 3px solid #28a745;
  background-color: #e8f5e8;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.text-layer-item:hover {
  background-color: #f8f9fa;
  cursor: grab;
}

.text-layer-item.dragging:hover {
  cursor: grabbing;
}

/* Стили для информации о текстовом слое */
.text-layer-item .layer-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.text-layer-item .layer-details {
  flex: 1;
  margin-left: 12px;
}

.text-layer-item .layer-name {
  font-weight: 500;
  color: #212529;
  margin-bottom: 2px;
  font-size: 14px;
}

.text-layer-item .layer-meta {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 2px;
}

.text-layer-item .layer-number {
  font-weight: 600;
  color: #28a745;
  font-size: 12px;
  background-color: #e8f5e8;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 100px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-layer-item .layer-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.text-layer-item .layer-actions .btn {
  padding: 4px 8px;
  font-size: 12px;
}

</style>

