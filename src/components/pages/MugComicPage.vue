<template>
  <div class="mug-comic-page">
    <div class="container">
      <!-- Заголовок страницы -->
      <div class="row">
        <div class="col top-header">
          <h2 class="page-title mt-3 mb-0">Кружка-комикс</h2>
          <p class="text-muted mb-2 mt-1">Инструмент для создания комиксов на кружках</p>
        </div>
      </div>
      
    <!-- Диалог выбора цвета 8x8 -->
    <div v-if="showColorPicker" class="color-picker-backdrop" @click.self="closeColorPicker">
      <div class="color-picker-dialog" @click.stop>
        <div class="color-grid">
          <div 
            v-for="(c, idx) in paletteColors" 
            :key="`cp-mug-${idx}`" 
            class="color-swatch" 
            :style="{ background: c }"
            @click="applyPickedColor(c)"
          ></div>
        </div>
      </div>
    </div>

      <!-- Кнопки управления -->
      <div class="row mb-4 main-part">
        <div class="col-12" style="width: 66.66666667%;">
          <div class="card">
            <div class="card-body" style="padding-left: 10px;">
              <div class="row align-items-center">
                
                <!-- Панель инструментов -->
                <div class="col-auto" style="padding: 0; margin-right: 20px;">
                  <div class="tools-panel">
                    <button 
                      class="tool-button"
                      :class="{ 'active': activeTool === 'mask' || maskMode }"
                      @click="toggleMaskMode"
                      title="Рисование масок"
                    >
                      <i class="bi bi-bounding-box"></i>
                    </button>
                    <button 
                      class="tool-button"
                      @click="openTextManager"
                      title="Добавить текст"
                    >
                      <i class="bi bi-type"></i>
                    </button>
                    <button 
                      class="tool-button"
                      @click="triggerSave"
                      title="Сохранить"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </div>
                
                <div class="col" style="padding: 0;">
                  <TextManager 
                    ref="textManager"
                    :canvas="$refs.comicCanvas"
                    :paper-scope="paperScope"
                    @text-dialog-opened="onTextDialogOpened"
                    @text-dialog-closed="onTextDialogClosed"
                    @text-applied="onTextApplied"
                  />
                </div>
                
                <div class="col" style="padding: 0;">
                  <GridSaveCanvas
                    ref="saveCanvas"
                    :grid-cols="1"
                    :grid-rows="1"
                    :mask-type="'rectangle'"
                    :uploaded-images="[]"
                    :stroke-color="strokeColor"
                    :stroke-width="strokeWidthPx"
                    :external-margin="0"
                    :shadow-blur="0"
                    :shadow-offset-x="0"
                    :shadow-offset-y="0"
                    :shadow-opacity="0"
                    :solid-background-color="'#ffffff'"
                    :solid-background-opacity="100"
                    :background-image="backgroundImage"
                    :enable-background-image="!!backgroundImage"
                    :text-layers="textLayers"
                    :user-masks="userMasks"
                    :mask-images="maskImages"
                    :main-canvas-width="paperScope?.view?.viewSize?.width || 0"
                    :main-canvas-height="paperScope?.view?.viewSize?.height || 0"
                    :hide-button="true"
                    @save-start="onSaveStart"
                    @save-success="onSaveSuccess"
                    @save-error="onSaveError"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Canvas область и 3D превью -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body p-0">
              <div class="canvas-container">
                <canvas 
                  ref="comicCanvas"
                  class="comic-canvas"
                  @click="onCanvasClick"
                  @mousemove="onCanvasMouseMove"
                  @dragover="onCanvasDragOver"
                  @drop="onCanvasDrop"
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
        
        <!-- 3D превью перенесён в боковую панель -->
      </div>
      
      
      
      
      <!-- Правая панель настроек -->
      <aside class="settings-panel" :class="{ 'collapsed': !isSettingsPanelOpen }">
        <div class="settings-panel-content">
          <!-- Заголовок панели -->
          <div class="settings-panel-header">
            <div class="settings-panel-title">
              <i class="bi bi-gear"></i>
              <span class="settings-text">Настройки</span>
            </div>
            <button 
              class="btn-toggle" 
              @click="isSettingsPanelOpen = !isSettingsPanelOpen"
              aria-label="Свернуть/развернуть панель настроек"
            >
              <i class="bi" :class="isSettingsPanelOpen ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
            </button>
          </div>
          
          <!-- Вертикальные табы -->
          <div class="settings-panel-body">
            <div class="vertical-tabs">
              <!-- Кнопки табов -->
              <div class="vertical-tabs-nav">
                <button
                  v-for="tab in settingsTabs"
                  :key="tab.id"
                  class="vertical-tab-button"
                  :class="{ 'active': activeSettingsTab === tab.id }"
                  @click="activeSettingsTab = activeSettingsTab === tab.id ? null : tab.id"
                >
                  <i :class="tab.icon"></i>
                  <span class="tab-text">{{ tab.title }}</span>
                </button>
              </div>

              <!-- Контент табов -->
              <div class="vertical-tabs-content" v-if="activeSettingsTab">
                <!-- Таб "Изображения" -->
                <div v-show="activeSettingsTab === 'images'" class="tab-content-panel">
                  <!-- Загрузка изображений -->
                  <div class="mb-3">
                    <input 
                      type="file" 
                      ref="settingsImageInput"
                      @change="handleImageUpload" 
                      multiple
                      accept="image/*"
                      class="d-none"
                    >
                    <button 
                      @click="$refs.settingsImageInput.click()" 
                      class=" img-upload-btn"
                      :disabled="uploadedImages.length >= 10"
                    >
                      <i class="bi bi-cloud-upload me-2"></i>
                      <span v-if="uploadedImages.length >= 10">
                        Максимальное количество изображений загружено
                      </span>
                      <span v-else-if="uploadedImages.length === 0">
                        Загрузить изображения (до 10)
                      </span>
                      <span v-else>
                        Добавить изображения (осталось {{ 10 - uploadedImages.length }})
                      </span>
                    </button>
                  </div>
                  
                  <!-- Список загруженных изображений -->
                  <div v-if="uploadedImages.length > 0" class="uploaded-images">
                    <h6 class="text-muted mb-3">Загруженные изображения</h6>
                    <div class="row g-2">
                      <div 
                        v-for="(image, index) in uploadedImages" 
                        :key="index"
                        class="col-6"
                      >
                        <div 
                          class="position-relative"
                          draggable="true"
                          @dragstart="onImageDragStart($event, image)"
                          @dragend="onImageDragEnd"
                        >
                          <img 
                            :src="image.url" 
                            :alt="image.name"
                            class="img-fluid rounded border"
                            style="max-height: 80px; width: 100%; object-fit: cover;"
                            draggable="false"
                          >
                          <button 
                            @click="removeImage(index)"
                            class="btn btn-sm position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center"
                            style="width: 20px; height: 20px; padding: 0; border-radius: 50%; background-color: #dc3545; border: none; color: white;"
                          >
                            <i class="bi bi-x" style="font-size: 12px; line-height: 1;"></i>
                          </button>
                        </div>
                        <small class="text-muted d-block mt-1 text-truncate">{{ image.name }}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Таб "Тексты" -->
                <div v-show="activeSettingsTab === 'texts'" class="tab-content-panel">
                  <div v-if="textLayers.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-type display-4 mb-3"></i>
                    <p>Пока не добавлено ни одного текста</p>
                    <p class="small">Нажмите на кнопку "Текст" над основным канвасом, затем кликните на канвас для добавления текста</p>
                  </div>
                  <div v-else>
                    <div class="mb-3">
                      <p class="text-muted mb-3">
                        Текстовые слои расположены в порядке слоев (сверху вниз). Первый в списке = самый верхний слой.
                        <i class="bi bi-info-circle ms-1"></i>
                        Перетаскивайте слои для изменения их порядка.
                      </p>
                    </div>
                    <!-- Список текстовых слоев с возможностью перетаскивания -->
                    <div class="text-layers-list">
                      <div 
                        v-for="(layer, index) in textLayers" 
                        :key="layer.id || index" 
                        class="text-layer-item"
                        :class="{ 'dragging': draggedTextIndex === index, 'drag-over': dragOverTextIndex === index }"
                        draggable="true"
                        @dragstart="handleTextDragStart(index, $event)"
                        @dragend="handleTextDragEnd"
                        @dragover="handleTextDragOver(index, $event)"
                        @dragleave="handleTextDragLeave"
                        @drop="handleTextDrop(index, $event)"
                      >
                        <div class="layer-info">
                          <div class="drag-handle"><i class="bi bi-grip-vertical"></i></div>
                          <div class="layer-details">
                            <div class="layer-name">{{ layer.text || layer.textData?.text || 'Пустой текст' }}</div>
                            <div class="layer-meta">
                              Шрифт: {{ layer.font || layer.textData?.font || 'Arial' }} |
                              Размер: {{ layer.fontSize || layer.textData?.fontSize || 16 }}px |
                              <span v-if="layer.fillColor || layer.textData?.color">Цвет: {{ layer.fillColor || layer.textData?.color }}</span>
                            </div>
                            <div class="layer-number">Слой #{{ index + 1 }}</div>
                          </div>
                        </div>
                        <div class="layer-actions">
                          <button type="button" class="btn btn-outline-primary btn-sm" @click="editTextLayer(layer.id)" title="Редактировать">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button type="button" class="btn btn-outline-danger btn-sm" @click="deleteTextLayer(index)" title="Удалить">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Таб "Рамки пользователя" -->
                <div v-show="activeSettingsTab === 'userFrames'" class="tab-content-panel">
                  <h6 class="text-muted mb-3">Пользовательские маски</h6>
                  <div class="user-masks-container">
                    <div v-if="userMasks.length === 0" class="text-center text-muted py-4">
                      <i class="bi bi-palette fs-1"></i>
                      <p class="mt-2">Нет созданных масок</p>
                      <small>Используйте инструмент рисования масок для создания контуров</small>
                    </div>
                    <div v-else class="masks-list">
                      <div 
                        v-for="(mask, index) in userMasks" 
                        :key="mask.id"
                        class="mask-item-full"
                        :class="{ active: selectedMask === mask.id, 'dragging': draggedMaskIndex === index, 'drag-over': dragOverMaskIndex === index }"
                        @click="selectMask(mask.id)"
                        draggable="true"
                        @dragstart="handleMaskDragStart(index, $event)"
                        @dragend="handleMaskDragEnd"
                        @dragover="handleMaskDragOver(index, $event)"
                        @dragleave="handleMaskDragLeave"
                        @drop="handleMaskDrop(index, $event)"
                      >
                        <div class="mask-header">
                          <div class="mask-preview">
                            <canvas :ref="`maskPreview${mask.id}`" width="80" height="50"></canvas>
                          </div>
                          <div class="mask-info">
                            <div class="mask-name">{{ mask.name || `Маска ${index + 1}` }}</div>
                          </div>
                        </div>
                        <div class="mask-controls mt-2">
                          <!-- Цвет обводки -->
                          <div class="form-group mb-2">
                            <label class="form-label small">Цвет обводки</label>
                            <button 
                              type="button"
                              class="btn d-flex align-items-center justify-content-center p-0 mt-1 color-chooser"
                              @click.stop="openColorPicker({ type: 'mask', id: mask.id, field: 'strokeColor' })"
                            >
                              <span :style="{ width: '16px', height: '16px', display: 'inline-block', borderRadius: '3px', background: (mask.strokeColor || '#000000') }"></span>
                            </button>
                          </div>

                          <!-- Толщина обводки -->
                          <div class="form-group mb-2">
                            <label class="form-label small">Толщина обводки: {{ mask.strokeWidth || 0 }}%</label>
                            <div class="control-scale" role="group">
                              <div
                                v-for="pct in 10"
                                :key="`um-sw-${mask.id}-${(pct-1)*2}`"
                                class="control-cell"
                                :class="{ 'selected': ((pct-1)*2) <= (mask.strokeWidth || 0) }"
                                :title="`${(pct-1)*2}%`"
                                @click.stop="setUserMaskStrokeWidth(mask, (pct-1)*2)"
                              ></div>
                            </div>
                          </div>

                          <!-- Цвет фона -->
                          <div class="form-group mb-2">
                            <label class="form-label small">Цвет фона</label>
                            <button 
                              type="button"
                              class="btn d-flex align-items-center justify-content-center p-0 mt-1 color-chooser"
                              @click.stop="openColorPicker({ type: 'mask', id: mask.id, field: 'fillColor' })"
                            >
                              <span :style="{ width: '16px', height: '16px', display: 'inline-block', borderRadius: '3px', background: (mask.fillColor || '#ffffff') }"></span>
                            </button>
                          </div>
                        </div>
                        <div class="mask-actions">
                          <button 
                            class="btn btn-sm btn-outline-danger" 
                            @click.stop="deleteUserMask(mask.id)"
                            title="Удалить маску"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Таб "Настройки" -->
                <div v-show="activeSettingsTab === 'settings'" class="tab-content-panel">
                  <div class="row g-3">
                    <!-- Обводка -->
                    <div class="col-12">
                      <h3 class="settings-subheader">Подложка</h3>
                      <div class="form-group">
                        <label class="form-label">Цвет обводки</label>
                        <button 
                          type="button"
                          class="btn d-flex align-items-center justify-content-center p-0 mt-2 color-chooser"
                          @click="openColorPicker('stroke')"
                        >
                          <span :style="{ width: '20px', height: '20px', display: 'inline-block', borderRadius: '4px', background: strokeColor }"></span>
                        </button>
                      </div>
                      <div class="form-group mt-2">
                        <label class="form-label">Толщина обводки: {{ strokeWidth }}%</label>
                        <div class="control-scale" role="group">
                          <div
                            v-for="pct in 10"
                            :key="`sw-mug-${(pct-1)*2}`"
                            class="control-cell"
                            :class="{ 'selected': ((pct-1)*2) <= strokeWidth }"
                            :title="`${(pct-1)*2}%`"
                            @click="setStrokeWidthPct((pct-1)*2)"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Фон основного поля -->
                    <div class="col-12">
                      <div class="form-group">
                        <label class="form-label">Цвет фона</label>
                        <button 
                          type="button"
                          class="btn d-flex align-items-center justify-content-center p-0 mt-2 color-chooser"
                          @click="openColorPicker('background')"
                        >
                          <span :style="{ width: '20px', height: '20px', display: 'inline-block', borderRadius: '4px', background: backgroundColor }"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
<script>
import paper from 'paper'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import TextManager from '../TextManager.vue'
import GridSaveCanvas from '../common/GridSaveCanvas.vue'

export default {
  name: 'MugComicPage',
  components: {
    ThreeDRenderer,
    TextManager,
    GridSaveCanvas
  },
  data() {
    return {
      // Canvas и Paper.js
      paperScope: null,
      isLoading: false,
      baseRectangle: null, // Базовый прямоугольник на canvas
      
      // Инструменты
      activeTool: null,
      
      // Вкладки
      activeTab: 'images',
      
      // Правая панель настроек
      isSettingsPanelOpen: true,
      activeSettingsTab: 'images',
      settingsTabs: [
        { id: 'images', title: 'Изображения', icon: 'bi-images' },
        { id: 'texts', title: 'Тексты', icon: 'bi-type' },
        { id: 'userFrames', title: 'Рамки пользователя', icon: 'bi-bounding-box' },
        { id: 'settings', title: 'Настройки', icon: 'bi-gear' }
      ],
      
      // Изображения
      uploadedImages: [],
      
      // Фоновое изображение
      backgroundImage: null,
      showColorPicker: false,
      colorPickerTarget: null, // 'stroke' | 'background'
      paletteColors: [
        '#000000','#333333','#666666','#999999','#CCCCCC','#EFEFEF','#FFFFFF','#FF0000',
        '#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#800000','#808000','#008080',
        '#800080','#008000','#000080','#C0C0C0','#FFA500','#A52A2A','#B8860B','#2F4F4F',
        '#DC143C','#FF1493','#00CED1','#20B2AA','#4169E1','#1E90FF','#87CEEB','#ADD8E6',
        '#90EE90','#32CD32','#228B22','#006400','#B22222','#FF8C00','#FFD700','#EEE8AA',
        '#ADFF2F','#7CFC00','#98FB98','#66CDAA','#48D1CC','#40E0D0','#5F9EA0','#4682B4',
        '#6A5ACD','#7B68EE','#9370DB','#BA55D3','#FF69B4','#DB7093','#CD5C5C','#F08080',
        '#FA8072','#E9967A','#D2691E','#8B4513','#708090','#2E8B57','#3CB371','#8FBC8F'
      ],
      backgroundRaster: null,
      canvasBackgroundRect: null,
      
      // Текстовые слои
      textLayers: [],
      nextTextLayerId: 100, // Начальный ID для текстовых слоёв
      // DnD состояния для списка текстов (как в StickerMania)
      draggedTextIndex: null,
      dragOverTextIndex: null,
      // Временное скрытие редактируемого слоя при открытии редактора
      editingLayerTempHidden: null,
      
      // Настройки обводки
      strokeColor: '#000000',
      strokeWidth: 8, // Проценты (0-18), дефолт 8%
      
      // Настройки фона основного поля
      backgroundColor: '#ffffff',
      
      // Система масок
      maskMode: false, // Режим рисования масок
      maskPoints: [], // Точки текущей маски
      maskLine: null, // Временная линия маски
      userMasks: [], // Пользовательские маски
      selectedMask: null, // Выбранная маска
      // DnD для списка масок
      draggedMaskIndex: null,
      dragOverMaskIndex: null,
      nextMaskId: 1, // Следующий ID для масок
      nextMaskLayerIndex: 100, // Индекс слоя масок начинается со 100 и растет
      maskPointElements: [], // Визуальные элементы точек маски для удаления
      
      // Привязка изображений к маскам
      maskImages: {}, // Объект для хранения привязанных изображений {maskId: imageData}
      
      // Проверка пересечений
      hasIntersection: false, // Есть ли пересечение
      intersectionPoint: null, // Точка пересечения для подсветки
      intersectionWarning: null, // Визуальное предупреждение о пересечении
      redClickPoint: null, // Красная точка клика при пересечении
      magneticSnapIndicator: null, // Индикация примагничивания к первой точке
      
      
      // Настройки скальпеля
      scalpelWidth: 2 // Ширина разреза в пикселях
    }
  },
  computed: {
    // Рассчитываем толщину обводки в пикселях от размера основного поля
    strokeWidthPx() {
      if (!this.baseRectangle || !this.paperScope) return 0
      
      // Берём минимальный размер (ширина или высота) основного поля
      const bounds = this.baseRectangle.bounds
      const minDimension = Math.min(bounds.width, bounds.height)
      
      // Вычисляем толщину обводки как процент от минимального размера
      return (this.strokeWidth / 100) * minDimension
    },
    
  },
  watch: {
    strokeColor() {
      this.updateBaseRectangle()
    },
    strokeWidth() {
      this.updateBaseRectangle()
    },
    backgroundColor() {
      this.updateBaseRectangle()
    }
  },
  mounted() {
    this.initPaperCanvas()
    
    // Инициализируем табы для правой панели
    this.initializeTabs()
    
    // Отрисуем превью масок после первого рендера
    this.$nextTick(() => {
      try { this.refreshMaskPreviews && this.refreshMaskPreviews() } catch (e) {}
    })
    
    // Добавляем обработчик изменения размера окна для пропорционального масштабирования
    window.addEventListener('resize', this.handleCanvasResize)
  },
  beforeUnmount() {
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleCanvasResize)
    
    if (this.paperScope) {
      this.paperScope.remove()
      this.paperScope = null
    }
  },
  methods: {
    // ====== Применение стилей маски на канвасе и обновление 3D ======
    getStrokeWidthPxForMask(pct) {
      if (!this.baseRectangle || !this.paperScope) return 0
      const bounds = this.baseRectangle.bounds
      const minDimension = Math.min(bounds.width, bounds.height)
      return (Math.max(0, Math.min(100, pct || 0)) / 100) * minDimension
    },
    updateMaskAppearance(mask) {
      if (!mask || !this.paperScope) return
      const strokeColor = mask.strokeColor || '#000000'
      const strokeWidthVal = mask.strokeWidth || 0
      // Обновляем визуальный путь в тех же единицах, что и раньше (значение маски)
      if (mask.visualPath) {
        try {
          mask.visualPath.strokeColor = strokeColor
          mask.visualPath.strokeWidth = strokeWidthVal
        } catch (e) {}
      }
      if (mask.maskGroup && Array.isArray(mask.maskGroup.children)) {
        try {
          mask.maskGroup.children.forEach(ch => {
            if (!ch) return
            if (typeof ch.strokeColor !== 'undefined') ch.strokeColor = strokeColor
            if (typeof ch.strokeWidth !== 'undefined') ch.strokeWidth = strokeWidthVal
          })
        } catch (e) {}
      }
      if (this.paperScope?.view) this.paperScope.view.update()
      this.update3DTexture()
    },
    deleteUserMask(maskId) {
      // Удаляем маску из массива
      const idx = this.userMasks.findIndex(m => m.id === maskId)
      if (idx !== -1) {
        const mask = this.userMasks[idx]
        // Удаляем визуальный путь
        if (mask && mask.visualPath && typeof mask.visualPath.remove === 'function') {
          try { mask.visualPath.remove() } catch (e) {}
          mask.visualPath = null
        }
        // Удаляем группу маски (если рисовали сложный контур с растрами)
        if (mask && mask.maskGroup && typeof mask.maskGroup.remove === 'function') {
          try { mask.maskGroup.remove() } catch (e) {}
          mask.maskGroup = null
        }
        // Удаляем возможные растр-элементы, если хранили
        if (mask && mask.raster && typeof mask.raster.remove === 'function') {
          try { mask.raster.remove() } catch (e) {}
          mask.raster = null
        }
        if (mask && mask.clippedRaster && typeof mask.clippedRaster.remove === 'function') {
          try { mask.clippedRaster.remove() } catch (e) {}
          mask.clippedRaster = null
        }
        // Удаляем из хранилища изображений
        if (this.maskImages && this.maskImages[maskId]) {
          delete this.maskImages[maskId]
        }
        this.userMasks.splice(idx, 1)
        // Перестроим порядок слоёв
        this.reindexUserMasksByOrder()
        // Обновим превью
        try { this.refreshMaskPreviews && this.refreshMaskPreviews() } catch (e) {}
        // Обновим канвас
        if (this.paperScope?.view) {
          this.enforceLayerOrder()
          this.paperScope.view.update()
        }
        // Обновим текстуру 3D модели
        this.update3DTexture()
        console.log('🗑️ Маска удалена:', maskId)
      }
    },
    setUserMaskStrokeWidth(mask, pct) {
      const v = Math.max(0, Math.min(18, pct))
      this.$set ? this.$set(mask, 'strokeWidth', v) : (mask.strokeWidth = v)
      // обновим предпросмотр маски
      try { this.refreshMaskPreviews && this.refreshMaskPreviews() } catch (e) {}
      // применим на канвасе и 3D
      this.updateMaskAppearance(mask)
    },
    setStrokeWidthPct(pct) {
      const v = Math.max(0, Math.min(18, pct))
      this.strokeWidth = v
      this.updateBaseRectangle()
    },
    openColorPicker(target) {
      this.colorPickerTarget = target
      this.showColorPicker = true
    },
    closeColorPicker() {
      this.showColorPicker = false
      this.colorPickerTarget = null
    },
    applyPickedColor(color) {
      // Глобальные поля страницы
      if (this.colorPickerTarget === 'stroke') {
        this.strokeColor = color
        this.updateBaseRectangle()
      } else if (this.colorPickerTarget === 'background') {
        this.backgroundColor = color
        this.updateBaseRectangle()
      // Настройки конкретной пользовательской маски
      } else if (this.colorPickerTarget && this.colorPickerTarget.type === 'mask') {
        const { id, field } = this.colorPickerTarget
        const mask = this.userMasks.find(m => m.id === id)
        if (mask) {
          this.$set ? this.$set(mask, field, color) : (mask[field] = color)
          try { this.refreshMaskPreviews && this.refreshMaskPreviews() } catch (e) {}
          // Применяем изменения к Paper.js и 3D
          this.updateMaskAppearance(mask)
        }
      }
      this.closeColorPicker()
    },
    // Инициализация табов для правой панели
    initializeTabs() {
      const tabs = [
        { id: 'images', title: 'Изображения', icon: 'bi bi-images' },
        { id: 'texts', title: 'Тексты', icon: 'bi bi-type' },
        { id: 'userFrames', title: 'Рамки пользователя', icon: 'bi bi-bounding-box' },
        { id: 'settings', title: 'Настройки', icon: 'bi bi-gear' }
      ]
      
      // Передаем табы в App.vue через событие
      this.$emit('set-page-tabs', tabs, this.activeTab || 'images')
    },
    
    // Обработчик изменения таба
    onTabChange(tabId) {
      this.activeTab = tabId
      console.log(`🔄 Переключение на таб: ${tabId}`)
    },
    
      // ====== Drag & Drop масок ======
      handleMaskDragStart(index, event) {
        this.draggedMaskIndex = index
        try { event.dataTransfer.effectAllowed = 'move' } catch (e) {}
      },
      handleMaskDragEnd() {
        this.draggedMaskIndex = null
        this.dragOverMaskIndex = null
        // После изменения порядка — пересчитаем индексы слоёв и применим в Paper.js
        this.reindexUserMasksByOrder()
      },
      handleMaskDragOver(index, event) {
        event.preventDefault()
        this.dragOverMaskIndex = index
        try { event.dataTransfer.dropEffect = 'move' } catch (e) {}
      },
      handleMaskDragLeave() {
        this.dragOverMaskIndex = null
      },
      handleMaskDrop(targetIndex) {
        if (this.draggedMaskIndex === null || targetIndex === this.draggedMaskIndex) return
        const dragged = this.userMasks[this.draggedMaskIndex]
        this.userMasks.splice(this.draggedMaskIndex, 1)
        this.userMasks.splice(targetIndex, 0, dragged)
        this.draggedMaskIndex = targetIndex
        // Пересчитать индексы и применить порядок
        this.reindexUserMasksByOrder()
        this.$forceUpdate?.()
      },
      
      // ====== Обработка изменения размера канваса ======
      handleCanvasResize() {
        if (this.paperScope) {
          console.log('🔄 Изменение размера окна - обновляем канвас MugComicPage')
          this.resizeCanvas()
          this.updateCanvasContent()
        }
      },
      
      resizeCanvas() {
        const canvas = this.$refs.comicCanvas
        if (!canvas) {
          console.log('⚠️ Канвас не найден в MugComicPage')
          return
        }
        
        if (!this.paperScope) {
          console.log('⚠️ PaperScope не инициализирован в MugComicPage')
          return
        }
        
        // Получаем размер контейнера (.canvas-container)
        const container = canvas.parentElement
        if (!container) {
          console.log('⚠️ Контейнер не найден в MugComicPage')
          return
        }
        
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        
        console.log('📏 Размеры контейнера MugComicPage:', containerWidth, 'x', containerHeight)
        
        // Получаем devicePixelRatio для HiDPI поддержки
        const dpr = window.devicePixelRatio || 1
        console.log('🖥️ Device Pixel Ratio MugComicPage:', dpr)
        
        // Устанавливаем размеры канваса с учетом HiDPI
        canvas.width = containerWidth * dpr
        canvas.height = containerHeight * dpr
        canvas.style.width = containerWidth + 'px'
        canvas.style.height = containerHeight + 'px'
        
        // Масштабируем контекст для HiDPI
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        
        // Обновляем размер view в Paper.js (логические размеры, не физические)
        this.paperScope.view.viewSize = new this.paperScope.Size(containerWidth, containerHeight)
        
        console.log('📐 Канвас MugComicPage изменен:', containerWidth, 'x', containerHeight)
      },
      
      updateCanvasContent() {
        if (!this.paperScope) return
        
        // Пересчитываем позиции всех текстовых слоев
        this.textLayers.forEach((textLayer, index) => {
          if (textLayer && textLayer.parent) {
            // Получаем новые размеры канваса
            const canvasWidth = this.paperScope.view.viewSize.width
            const canvasHeight = this.paperScope.view.viewSize.height
            
            // Пересчитываем позицию (центр канваса)
            const newX = canvasWidth * 0.5
            const newY = canvasHeight * 0.5
            
            // Обновляем позицию текстового слоя
            textLayer.position = new this.paperScope.Point(newX, newY)
          }
        })
        
        // Перерисовываем канвас
        this.paperScope.view.draw()
      },
      
      reindexUserMasksByOrder() {
        // Верх списка = выше слой. Присваиваем большие layerIndex более верхним
        let idx = 100
        for (let i = this.userMasks.length - 1; i >= 0; i--) {
          this.userMasks[i].layerIndex = idx
          idx += 10
        }
        this.enforceLayerOrder()
        if (this.paperScope?.view) this.paperScope.view.update()
      },
      // ====== Drag & Drop текстовых слоёв (по аналогии со StickerMania) ======
      handleTextDragStart(index, event) {
        this.draggedTextIndex = index
        event.dataTransfer.effectAllowed = 'move'
        try { event.dataTransfer.setData('text/plain', String(index)) } catch (e) {}
      },
      handleTextDragEnd() {
        this.draggedTextIndex = null
        this.dragOverTextIndex = null
        // Обновляем порядок в Paper.js после возможного перемещения
        this.reorderTextLayersInPaperJS()
        // Обновляем 3D превью
        this.update3DTexture()
      },
      handleTextDragOver(index, event) {
        event.preventDefault()
        this.dragOverTextIndex = index
        event.dataTransfer.dropEffect = 'move'
      },
      handleTextDragLeave() {
        this.dragOverTextIndex = null
      },
      handleTextDrop(targetIndex, event) {
        event.preventDefault()
        if (this.draggedTextIndex === null || targetIndex === this.draggedTextIndex) return
        const dragged = this.textLayers[this.draggedTextIndex]
        this.textLayers.splice(this.draggedTextIndex, 1)
        this.textLayers.splice(targetIndex, 0, dragged)
        this.draggedTextIndex = targetIndex
        // Перестроить порядок отображения
        this.reorderTextLayersInPaperJS()
        // Принудительно обновим Vue-рендер списка
        this.$forceUpdate?.()
        // Обновим 3D
        this.update3DTexture()
      },
      reorderTextLayersInPaperJS() {
      // Сначала отправим все текстовые слои назад
      this.textLayers.forEach(layer => {
        if (layer && layer.layer && layer.layer.sendToBack) {
          layer.layer.sendToBack()
        }
      })
      // Затем в порядке массива поднимаем наверх, где 0-й элемент = самый верхний
      for (let i = this.textLayers.length - 1; i >= 0; i--) {
        const layer = this.textLayers[i]
        if (layer && layer.layer && layer.layer.bringToFront) {
          layer.layer.bringToFront()
        }
      }
        // Гарантируем, что фоновое изображение всегда внизу
        if (this.backgroundRaster && this.backgroundRaster.sendToBack) {
          this.backgroundRaster.sendToBack()
        }
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.update()
        }
      },

    // ====== Превью масок в списке слоёв ======
    refreshMaskPreviews() {
      if (!Array.isArray(this.userMasks) || this.userMasks.length === 0) return
      for (const mask of this.userMasks) {
        this.renderMaskPreview(mask)
      }
    },
    renderMaskPreview(mask) {
      try {
        const canvasRef = this.$refs[`maskPreview${mask.id}`]
        const canvas = Array.isArray(canvasRef) ? canvasRef[0] : canvasRef
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width
        const H = canvas.height
        ctx.clearRect(0, 0, W, H)

        // Берём актуальные точки фигуры
        const points = []
        if (mask && mask.visualPath && mask.visualPath.segments && mask.visualPath.segments.length >= 3) {
          mask.visualPath.segments.forEach(seg => points.push({ x: seg.point.x, y: seg.point.y }))
        } else if (Array.isArray(mask?.points) && mask.points.length >= 3) {
          mask.points.forEach(p => points.push({ x: p.x, y: p.y }))
        } else {
          return
        }

        // Вычисляем границы
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const p of points) {
          if (p.x < minX) minX = p.x
          if (p.y < minY) minY = p.y
          if (p.x > maxX) maxX = p.x
          if (p.y > maxY) maxY = p.y
        }
        const bw = Math.max(1, maxX - minX)
        const bh = Math.max(1, maxY - minY)

        // Масштаб к превью с небольшим отступом
        const padding = 6
        const sx = (W - padding * 2) / bw
        const sy = (H - padding * 2) / bh
        const s = Math.min(sx, sy)
        const offsetX = (W - bw * s) / 2 - minX * s
        const offsetY = (H - bh * s) / 2 - minY * s

        // Толщина обводки пропорциональна масштабу
        const baseStroke = mask.strokeWidth || 1
        const previewStroke = Math.max(1, Math.round(baseStroke * s))
        // Если у маски нет strokeColor — используем чёрный по умолчанию
        const strokeColor = mask.strokeColor || '#000000'

        // Сначала — заливка изображением, если есть
        const imgInfo = this.maskImages ? this.maskImages[mask.id] : null
        if (imgInfo && imgInfo.url) {
          // Построим путь и включим clip
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(points[0].x * s + offsetX, points[0].y * s + offsetY)
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * s + offsetX, points[i].y * s + offsetY)
          }
          ctx.closePath()
          ctx.clip()

          const img = new Image()
          img.onload = () => {
            const innerW = bw * s
            const innerH = bh * s
            const scaleX = innerW / img.width
            const scaleY = innerH / img.height
            const coverScale = Math.max(scaleX, scaleY)
            const drawW = Math.round(img.width * coverScale)
            const drawH = Math.round(img.height * coverScale)
            const dx = Math.round(minX * s + offsetX + (innerW - drawW) / 2)
            const dy = Math.round(minY * s + offsetY + (innerH - drawH) / 2)
            ctx.drawImage(img, dx, dy, drawW, drawH)
            ctx.restore()

            // Обводка поверх
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(points[0].x * s + offsetX, points[0].y * s + offsetY)
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x * s + offsetX, points[i].y * s + offsetY)
            }
            ctx.closePath()
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = previewStroke
            ctx.stroke()
            ctx.restore()
          }
          img.src = imgInfo.url
          return
        }

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(points[0].x * s + offsetX, points[0].y * s + offsetY)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * s + offsetX, points[i].y * s + offsetY)
        }
        ctx.closePath()
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = previewStroke
        ctx.stroke()
        ctx.restore()
      } catch (e) {
        console.error('❌ Ошибка рендера превью маски:', e)
      }
    },
    // ========== Инициализация Paper.js ==========
    initPaperCanvas() {
      const canvas = this.$refs.comicCanvas
      if (!canvas) {
        console.error('Canvas не найден')
        return
      }

      // Создаём новый scope для Paper.js
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Эмитим событие готовности canvas для 3D превью
      this.$emit('canvas-ready', canvas)
      
      // Получаем размер контейнера (.canvas-container)
      const container = canvas.parentElement
      if (!container) {
        console.log('⚠️ Контейнер не найден')
        return
      }

      // Контейнер использует padding-bottom для соотношения сторон 19:9
      const width = container.offsetWidth
      const height = container.offsetHeight
      
      // Устанавливаем размер Paper.js view
      this.paperScope.view.viewSize = new this.paperScope.Size(width, height)
      
      // Устанавливаем белый фон (за всем)
      this.canvasBackgroundRect = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: null, // без заливки, не перекрывает содержимое
        strokeColor: null
      })
      try {
        this.canvasBackgroundRect.locked = true
        this.canvasBackgroundRect.data = this.canvasBackgroundRect.data || {}
        this.canvasBackgroundRect.data.isCanvasBackground = true
        this.canvasBackgroundRect.name = 'canvasBackgroundRect'
      } catch (e) {}
      this.canvasBackgroundRect.sendToBack()
      
      // Создаём базовый прямоугольник размером с canvas
      this.createBaseRectangle(width, height)
      
      // Настраиваем инструменты Paper.js для перетаскивания
      this.setupPaperTools()
      
      console.log('Paper.js canvas инициализирован:', width, 'x', height)
      
      // Обновляем 3D модель в боковой панели
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateSideMenu3D()
        }, 500)
      })
    },

    // ========== Создание базового прямоугольника ==========
    createBaseRectangle(width, height) {
      if (!this.paperScope) return

      // Рассчитываем начальную толщину обводки
      const minDimension = Math.min(width, height)
      const initialStrokeWidth = (this.strokeWidth / 100) * minDimension

      // Создаём фоновое изображение, если оно загружено
      if (this.backgroundImage) {
        this.createBackgroundImage(width, height)
      }

      // Создаём прямоугольник размером с весь canvas
      this.baseRectangle = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: this.backgroundColor, // Цвет фона основного поля
        strokeColor: this.strokeColor,
        strokeWidth: initialStrokeWidth
      })
      
      // Устанавливаем острые углы для чётких линий
      this.baseRectangle.strokeJoin = 'miter'
      this.baseRectangle.strokeCap = 'butt'
      
      console.log('✅ Базовый прямоугольник создан:', {
        size: `${width}x${height}`,
        strokeColor: this.strokeColor,
        strokeWidth: initialStrokeWidth,
        hasBackground: !!this.backgroundImage
      })

      // После создания базового прямоугольника — зафиксируем порядок слоев
      this.enforceLayerOrder()
    },

    // Создание фонового изображения
    createBackgroundImage(width, height) {
      if (!this.backgroundImage || !this.paperScope) return

      // Удаляем предыдущий фон, если есть
      if (this.backgroundRaster && this.backgroundRaster.remove) {
        this.backgroundRaster.remove()
        this.backgroundRaster = null
      }

      // Создаём Paper.js Raster из изображения
      const backgroundRaster = new this.paperScope.Raster(this.backgroundImage)
      
      backgroundRaster.onLoad = () => {
        // Масштабируем изображение пропорционально, чтобы покрыть весь прямоугольник
        const scaleX = width / backgroundRaster.bounds.width
        const scaleY = height / backgroundRaster.bounds.height
        const scale = Math.max(scaleX, scaleY) // Используем больший масштаб для покрытия
        
        backgroundRaster.scaling = new this.paperScope.Point(scale, scale)
        
        // Центрируем изображение
        backgroundRaster.position = new this.paperScope.Point(width / 2, height / 2)
        
        // Перемещаем фоновое изображение в самый низ
        backgroundRaster.sendToBack()
        this.backgroundRaster = backgroundRaster

        // Делаем фон фиксированным и не перетаскиваемым
        try {
          backgroundRaster.locked = true
          backgroundRaster.data = backgroundRaster.data || {}
          backgroundRaster.data.isBackground = true
          backgroundRaster.name = 'backgroundRaster'
        } catch (e) { /* ignore */ }
        
        console.log('✅ Фоновое изображение добавлено:', {
          originalSize: `${backgroundRaster.bounds.width}x${backgroundRaster.bounds.height}`,
          scale: scale,
          position: backgroundRaster.position
        })
      }
    },

    // ========== Обновление базового прямоугольника ==========
    updateBaseRectangle() {
      if (!this.baseRectangle || !this.paperScope) return

      // Обновляем стили обводки
      this.baseRectangle.strokeColor = this.strokeColor
      this.baseRectangle.strokeWidth = this.strokeWidthPx
      
      // Обновляем цвет фона
      this.baseRectangle.fillColor = this.backgroundColor
      
      // Перерисовываем view
      this.paperScope.view.update()
      
      // Обновляем 3D модель
      this.update3DTexture()
      
      console.log('🔄 Базовый прямоугольник обновлён:', {
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidthPx,
        backgroundColor: this.backgroundColor
      })
    },

    // ========== Обновление 3D текстуры ==========
    update3DTexture() {
      // Ждём следующий фрейм для обновления canvas
      this.$nextTick(() => {
        if (this.$refs.threeRenderer && this.$refs.threeRenderer.updateTexture) {
          this.$refs.threeRenderer.updateTexture()
        }
      })
    },

    // ====== Гарантируем правильный порядок слоев: baseRectangle (низ) -> backgroundRaster -> остальные ======
    enforceLayerOrder() {
      if (!this.paperScope) return

      // 0) Фон всегда в самом низу
      if (this.canvasBackgroundRect && this.canvasBackgroundRect.sendToBack) {
        this.canvasBackgroundRect.sendToBack()
      }
      if (this.backgroundRaster && this.backgroundRaster.sendToBack) {
        this.backgroundRaster.sendToBack()
      }

      // 1) Базовый прямоугольник сразу над фоном
      if (this.baseRectangle) {
        if (this.backgroundRaster && this.baseRectangle.insertAbove) {
          this.baseRectangle.insertAbove(this.backgroundRaster)
        } else if (this.baseRectangle.sendToBack) {
          this.baseRectangle.sendToBack()
        }
      }

      // 2) Пользовательские маски — между базовым прямоугольником и текстами
      if (Array.isArray(this.userMasks) && this.userMasks.length) {
        // Сортируем маски по layerIndex по убыванию (сначала самые новые/верхние)
        const sortedMasks = [...this.userMasks].sort((a, b) => (b.layerIndex || 0) - (a.layerIndex || 0))
        for (let i = 0; i < sortedMasks.length; i++) {
          const mask = sortedMasks[i]
          const maskItem = mask?.maskGroup || mask?.visualPath
          if (maskItem && this.baseRectangle && maskItem.insertAbove) {
            maskItem.insertAbove(this.baseRectangle)
          }
        }
      }

      // 3) Текстовые слои — выше всех масок. Сохраняем упорядочивание согласно списку
      if (typeof this.reorderTextLayersInPaperJS === 'function') {
        this.reorderTextLayersInPaperJS()
      }

      if (this.paperScope.view) {
        this.paperScope.view.update()
      }
    },

    // ========== Настройка инструментов Paper.js для перетаскивания ==========
    setupPaperTools() {
      if (!this.paperScope) return
      
      // Создаем инструмент для перетаскивания
      const dragTool = new this.paperScope.Tool()
      
      let dragItem = null
      let offset = null
      let clickCount = 0
      let clickTimer = null
      
      // Функция для снятия выделения
      const clearSelection = () => {
        if (dragItem) {
          dragItem.selected = false
          dragItem = null
          console.log('🎯 Выделение снято')
        }
      }
      
      dragTool.onMouseDown = (event) => {
        // Обработка двойного клика
        clickCount++
        
        if (clickCount === 1) {
          clickTimer = setTimeout(() => {
            // Одинарный клик - выбираем объект
            this.handleSingleClick(event, clearSelection)
            clickCount = 0
          }, 300) // 300ms для двойного клика
        } else if (clickCount === 2) {
          clearTimeout(clickTimer)
          clickCount = 0
          
          // Обрабатываем двойной клик
          this.handleDoubleClick(event)
          return // Не продолжаем с обычной логикой перетаскивания
        }
        
        // Ищем элемент под курсором
        if (!this.paperScope.project) {
          console.warn('⚠️ paperScope.project не найден')
          return
        }
        
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 10
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          
          // Проверяем, что это текстовый элемент или подложка (не базовый прямоугольник)
          const isBaseRectangle = item === this.baseRectangle
          const isBackground = item === this.backgroundRaster || item.data?.isBackground
          const isTextItem = !isBaseRectangle && (
            item.className === 'TextItem' || 
            item.className === 'Group' || 
            item.className === 'Raster' ||
            (item.parent && item.parent.className === 'Layer') ||
            (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
          )
          
          if (isTextItem && !isBackground) {
            // Снимаем предыдущее выделение при начале перетаскивания
            clearSelection()
            
            // Это текстовый элемент
            dragItem = item
            // console.log('🎯 Начато перетаскивание текстового элемента:', dragItem.className, dragItem.data)
            
            offset = event.point.subtract(dragItem.position)
            dragItem.selected = true
          }
        }
      }
      
      dragTool.onMouseDrag = (event) => {
        if (dragItem && this.paperScope && this.paperScope.project) {
          // Обычное перемещение
          dragItem.position = event.point.subtract(offset)
          
          // Обновляем 3D модель в боковой панели
          this.updateSideMenu3D()
          
          // Обновляем позицию в данных слоя для всех текстовых слоев
          const layerInfo = this.textLayers.find(layer => layer.raster === dragItem || layer.backgroundItem === dragItem || layer.layer === dragItem)
          if (layerInfo) {
            layerInfo.position = { x: dragItem.position.x, y: dragItem.position.y }
            console.log('📍 Обновлена позиция слоя при перетаскивании:', {
              layerIndex: layerInfo.id,
              position: layerInfo.position
            })
          }
          
          // Перерисовываем рендер кружки при перемещении
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      dragTool.onMouseUp = (event) => {
        if (dragItem && this.paperScope && this.paperScope.project) {
          dragItem.selected = false
          // console.log('🎯 Завершено перетаскивание Paper.js элемента')
          
          // Обновляем 3D модель в боковой панели
          this.updateSideMenu3D()
          
          // Находим соответствующий слой и фиксируем итоговую позицию ЦЕНТРА объекта
          const layerInfo = this.textLayers.find(layer => layer.raster === dragItem || layer.backgroundItem === dragItem || layer.layer === dragItem)
          if (layerInfo) {
            layerInfo.position = { x: dragItem.position.x, y: dragItem.position.y }
            console.log('📌 Финальная фиксация позиции слоя после перетаскивания:', {
              id: layerInfo.id,
              position: layerInfo.position
            })
          }

          dragItem = null
          offset = null
          
          // Финальная перерисовка рендера кружки после завершения перемещения
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      // Обработчик двойного клика для редактирования текстовых элементов
      dragTool.onDoubleClick = (event) => {
        console.log('🎯 Двойной клик зарегистрирован в точке:', event.point)
        
        if (!this.paperScope || !this.paperScope.project) {
          console.warn('⚠️ paperScope.project не найден при двойном клике')
          return
        }
        
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 15 // Увеличиваем tolerance для лучшего обнаружения
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          
          // Проверяем, что это текстовый элемент (не базовый прямоугольник)
          const isBaseRectangle = item === this.baseRectangle
          const isBackground = item === this.backgroundRaster || item.data?.isBackground
          const isTextItem = !isBaseRectangle && (
            item.className === 'TextItem' || 
            item.className === 'Group' || 
            item.className === 'Raster' ||
            (item.parent && item.parent.className === 'Layer') ||
            (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
          )
          
          if (isTextItem && !isBackground) {
            // Находим соответствующий текстовый слой
            const layerInfo = this.textLayers.find(layer => layer.raster === item || layer.backgroundItem === item || layer.layer === item)
            if (layerInfo) {
              // Открываем диалог редактирования по id слоя
              this.editTextLayer(layerInfo.id)
              console.log('✏️ Открыто редактирование текстового слоя:', layerInfo.id)
            }
          }
        }
      }
      
      console.log('✅ Инструменты Paper.js настроены для перетаскивания')
    },

    // Обработка одинарного клика
    handleSingleClick(event, clearSelection) {
      // Обработка кликов в режиме скальпеля
      if (this.scalpelMode) {
        this.handleScalpelClick(event)
        return
      }
      
      // Здесь можно добавить логику для одинарного клика
      console.log('🖱️ Одинарный клик в точке:', event.point)
    },
    
    // Обработка клика в режиме скальпеля
    handleScalpelClick(event) {
      console.log('🔪 Клик скальпеля в точке:', event.point)
      
      // Добавляем точку
      this.scalpelPoints.push({
        x: event.point.x,
        y: event.point.y
      })
      
      console.log('📍 Точка добавлена. Всего точек:', this.scalpelPoints.length)
      
      // Обновляем линию
      this.updateScalpelLine()
    },

    // Обработка двойного клика
    handleDoubleClick(event) {
      // Логика двойного клика уже реализована в setupPaperTools
      console.log('🖱️ Двойной клик в точке:', event.point)
    },

    // ========== Управление изображениями ==========
    handleImageUpload(event) {
      const files = event.target.files
      if (!files || files.length === 0) return

      const remainingSlots = 10 - this.uploadedImages.length
      const filesToProcess = Array.from(files).slice(0, remainingSlots)

      filesToProcess.forEach(file => {
        if (!file.type.startsWith('image/')) {
          console.warn('Файл не является изображением:', file.name)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          this.uploadedImages.push({
            name: file.name,
            url: e.target.result,
            file: file
          })
        }
        reader.readAsDataURL(file)
      })

      // Очищаем input для повторной загрузки
      event.target.value = ''
    },

    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },


    removeBackground() {
      this.backgroundImage = null
      console.log('🗑️ Фоновое изображение удалено')
      if (this.backgroundRaster && this.backgroundRaster.remove) {
        this.backgroundRaster.remove()
        this.backgroundRaster = null
      }
      this.updateCanvasWithBackground()
      this.enforceLayerOrder()
      
      // Принудительно обновляем 3D модель после удаления фона
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateSideMenu3D()
        }, 100)
      })
    },

    // Установка фона из перетаскиваемого изображения
    setBackgroundFromImage(image) {
      this.backgroundImage = image.url
      console.log('✅ Фоновое изображение установлено из перетаскивания:', image.name)
      // Делаем фон основной подложки прозрачным, чтобы видеть изображение
      this.backgroundColor = 'rgba(0,0,0,0)'
      this.updateCanvasWithBackground()
      this.enforceLayerOrder()
      
      // Принудительно обновляем 3D модель после установки фона
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateSideMenu3D()
        }, 100)
      })
    },

    updateCanvasWithBackground() {
      if (this.paperScope && this.paperScope.view) {
        // Очищаем canvas
        this.paperScope.project.clear()
        
        // Пересоздаем базовый прямоугольник с фоновым изображением
        const canvasWidth = this.paperScope.view.viewSize.width
        const canvasHeight = this.paperScope.view.viewSize.height
        this.createBaseRectangle(canvasWidth, canvasHeight)
        
        // Восстанавливаем текстовые слои на канвасе (так как проект очищали)
        if (typeof this.restoreTextLayers === 'function') {
          this.restoreTextLayers()
        }
        
        // Обновляем canvas
        this.paperScope.view.update()
      this.enforceLayerOrder()
        
        // Обновляем 3D модель
        this.$nextTick(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.updateTexture()
          }
        })
      }
    },

    // Восстановление текстовых слоёв после очистки проекта/перерисовки
    restoreTextLayers() {
      if (!this.paperScope || !Array.isArray(this.textLayers)) return
      const activeLayer = this.paperScope.project?.activeLayer
      if (!activeLayer) return
      
      this.textLayers.forEach((layer) => {
        try {
          if (layer && layer.layer) {
            // Пере-добавляем существующую группу/элемент слоя на сцену
            activeLayer.addChild(layer.layer)
            if (layer.position && layer.layer.position) {
              layer.layer.position = new this.paperScope.Point(layer.position.x, layer.position.y)
            }
          } else if (layer && layer.textData) {
            // Пересоздаём, если нет ссылки на элемент
            const recreatedRaster = this.createBackgroundWithText(layer.textData, layer.position || { x: 0, y: 0 }, layer.mode)
            if (recreatedRaster) {
              const group = new this.paperScope.Group()
              group.addChild(recreatedRaster)
              group.position = new this.paperScope.Point((layer.position?.x) || recreatedRaster.position.x, (layer.position?.y) || recreatedRaster.position.y)
              activeLayer.addChild(group)
              layer.layer = group
              layer.raster = recreatedRaster
            }
          }
        } catch (e) {
          console.warn('⚠️ Ошибка восстановления текстового слоя', e)
        }
      })
      
      // Сохраняем порядок слоёв
      if (typeof this.reorderTextLayersInPaperJS === 'function') {
        this.reorderTextLayersInPaperJS()
      }
      if (typeof this.enforceLayerOrder === 'function') {
        this.enforceLayerOrder()
      }
    },

    // ========== Управление масками ==========
    toggleMaskMode() {
      if (this.maskMode) {
        // Завершаем создание маски
        this.finishMask()
      } else {
        // Активируем режим рисования масок
        this.activateMaskMode()
      }
    },
    
    activateMaskMode() {
      this.maskMode = true
      this.maskPoints = []
      this.maskLine = null
      this.activeTool = 'mask'
      console.log('🎭 Режим рисования масок активирован')
    },
    
    finishMask() {
      if (this.maskPoints.length < 3) {
        console.warn('⚠️ Недостаточно точек для создания маски (минимум 3)')
        this.maskMode = false
        this.activeTool = null
        return
      }
      
      console.log('🎭 Завершаем создание маски:', this.maskPoints.length, 'точек')
      
      // Создаем маску
      const mask = {
        id: this.nextMaskId++,
        layerIndex: this.nextMaskLayerIndex,
        points: [...this.maskPoints],
        createdAt: new Date(),
        name: `Маска ${this.userMasks.length + 1}`,
        fillColor: '#f0f0f0', // Светло-серый по умолчанию
        strokeColor: '#000000', // Черный по умолчанию
        strokeWidth: 16, // 16% по умолчанию
        isDragging: false, // Флаг перетаскивания
        dragStart: null // Начальная точка перетаскивания
      }
      
      // Инкрементируем индекс для следующей маски (больше = выше среди масок)
      this.nextMaskLayerIndex += 10
      
      // Добавляем в начало списка масок
      this.userMasks.unshift(mask)
      // Перерисуем превью новой маски
      this.$nextTick(() => { try { this.renderMaskPreview && this.renderMaskPreview(mask) } catch (e) {} })
      
      
      // Создаем визуальную маску на canvas
      this.createMaskVisual(mask)
      // Применяем начальные стили, чтобы толщина совпала в пикселях с основной рамкой
      this.updateMaskAppearance(mask)
      
      // Сбрасываем режим
      this.maskMode = false
      this.activeTool = null
      this.maskPoints = []
      this.clearMaskLine()
    },
    
    performScalpelCut() {
      console.log('🔪 Выполняем разрез по точкам:', this.scalpelPoints)
      
      // Продлеваем линию до края прямоугольника
      const extendedPoints = this.extendLineToRectangleEdges()
      console.log('📏 Продленная линия:', extendedPoints)
      
      // Создаем линию разреза и проверяем её свойства
      const cutLine = this.createCutLine(extendedPoints)
      console.log('🔍 Свойства линии разреза:', {
        closed: cutLine.closed,
        segments: cutLine.segments.length,
        strokeWidth: cutLine.strokeWidth,
        bounds: cutLine.bounds.toString()
      })
      
      // Применяем разрез
      this.cutRectangleWithLine(extendedPoints)
    },
    
    extendLineToRectangleEdges() {
      if (this.scalpelPoints.length < 2) {
        return this.scalpelPoints
      }
      
      const canvasWidth = this.paperScope.view.viewSize.width
      const canvasHeight = this.paperScope.view.viewSize.height
      
      // Получаем границы прямоугольника
      const rectBounds = {
        left: 0,
        top: 0,
        right: canvasWidth,
        bottom: canvasHeight
      }
      
      const extendedPoints = [...this.scalpelPoints]
      
      // Продлеваем первую точку
      if (this.scalpelPoints.length >= 2) {
        const firstPoint = this.scalpelPoints[0]
        const secondPoint = this.scalpelPoints[1]
        
        // Вектор от второй точки к первой
        const direction = {
          x: firstPoint.x - secondPoint.x,
          y: firstPoint.y - secondPoint.y
        }
        
        // Нормализуем вектор
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
        if (length > 0) {
          direction.x /= length
          direction.y /= length
        }
        
        // Находим пересечение с границами прямоугольника
        const extendedFirst = this.findIntersectionWithRectangle(
          firstPoint, direction, rectBounds
        )
        
        if (extendedFirst) {
          extendedPoints[0] = extendedFirst
        }
      }
      
      // Продлеваем последнюю точку
      if (this.scalpelPoints.length >= 2) {
        const lastPoint = this.scalpelPoints[this.scalpelPoints.length - 1]
        const prevPoint = this.scalpelPoints[this.scalpelPoints.length - 2]
        
        // Вектор от предпоследней точки к последней
        const direction = {
          x: lastPoint.x - prevPoint.x,
          y: lastPoint.y - prevPoint.y
        }
        
        // Нормализуем вектор
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
        if (length > 0) {
          direction.x /= length
          direction.y /= length
        }
        
        // Находим пересечение с границами прямоугольника
        const extendedLast = this.findIntersectionWithRectangle(
          lastPoint, direction, rectBounds
        )
        
        if (extendedLast) {
          extendedPoints[extendedPoints.length - 1] = extendedLast
        }
      }
      
      return extendedPoints
    },
    
    findIntersectionWithRectangle(point, direction, rectBounds) {
      // Находим пересечение луча с границами прямоугольника
      const intersections = []
      
      // Проверяем пересечение с левой границей
      if (direction.x !== 0) {
        const t = (rectBounds.left - point.x) / direction.x
        if (t > 0) {
          const y = point.y + t * direction.y
          if (y >= rectBounds.top && y <= rectBounds.bottom) {
            intersections.push({ x: rectBounds.left, y, t })
          }
        }
      }
      
      // Проверяем пересечение с правой границей
      if (direction.x !== 0) {
        const t = (rectBounds.right - point.x) / direction.x
        if (t > 0) {
          const y = point.y + t * direction.y
          if (y >= rectBounds.top && y <= rectBounds.bottom) {
            intersections.push({ x: rectBounds.right, y, t })
          }
        }
      }
      
      // Проверяем пересечение с верхней границей
      if (direction.y !== 0) {
        const t = (rectBounds.top - point.y) / direction.y
        if (t > 0) {
          const x = point.x + t * direction.x
          if (x >= rectBounds.left && x <= rectBounds.right) {
            intersections.push({ x, y: rectBounds.top, t })
          }
        }
      }
      
      // Проверяем пересечение с нижней границей
      if (direction.y !== 0) {
        const t = (rectBounds.bottom - point.y) / direction.y
        if (t > 0) {
          const x = point.x + t * direction.x
          if (x >= rectBounds.left && x <= rectBounds.right) {
            intersections.push({ x, y: rectBounds.bottom, t })
          }
        }
      }
      
      // Выбираем ближайшее пересечение
      if (intersections.length > 0) {
        const closest = intersections.reduce((min, current) => 
          current.t < min.t ? current : min
        )
        return { x: closest.x, y: closest.y }
      }
      
      return null
    },
    
    cutRectangleWithLine(extendedPoints) {
      console.log('✂️ Разрезаем прямоугольник по линии:', extendedPoints)
      
      if (!this.baseRectangle) {
        console.warn('⚠️ Базовый прямоугольник не найден')
        return
      }
      
      try {
        // Создаем линию разреза
        const cutLine = this.createCutLine(extendedPoints)
        
        // Временно показываем линию разреза на canvas
        this.showCutLineTemporarily(cutLine)
        
        // Разрезаем прямоугольник
        const result = this.splitRectangleWithLine(this.baseRectangle, cutLine)
        
        if (result && result.length > 0) {
          // Удаляем старый прямоугольник
          this.baseRectangle.remove()
          
          // Создаем новые фигуры
          this.createNewShapes(result)
          
          console.log('✅ Прямоугольник разрезан на', result.length, 'частей')
        } else {
          console.warn('⚠️ Не удалось разрезать прямоугольник')
        }
        
      } catch (error) {
        console.error('❌ Ошибка при разрезании:', error)
      }
    },
    
    showCutLineTemporarily(cutLine) {
      // Показываем линию разреза на canvas для отладки
      const debugLine = cutLine.clone()
      debugLine.strokeColor = '#00ff00' // Зеленый цвет для отладки
      debugLine.strokeWidth = 3
      debugLine.dashArray = [5, 5]
      
      // Добавляем на canvas
      this.paperScope.project.activeLayer.addChild(debugLine)
      
      // Удаляем через 2 секунды
      setTimeout(() => {
        if (debugLine && debugLine.remove) {
          debugLine.remove()
        }
      }, 2000)
      
      console.log('🔍 Показана отладочная линия разреза (зеленая пунктирная)')
    },
    
    createCutLine(points) {
      console.log('🔪 Создаем линию разреза из', points.length, 'точек')
      
      // Альтернативный метод: создаем линию как серию сегментов
      if (points.length < 2) {
        console.warn('⚠️ Недостаточно точек для создания линии')
        return null
      }
      
      // Создаем путь из точек (НЕ замкнутый)
      const path = new this.paperScope.Path()
      
      // Добавляем первую точку
      const firstPoint = new this.paperScope.Point(points[0].x, points[0].y)
      path.add(firstPoint)
      console.log(`📍 Первая точка:`, firstPoint.toString())
      
      // Добавляем остальные точки
      for (let i = 1; i < points.length; i++) {
        const point = new this.paperScope.Point(points[i].x, points[i].y)
        path.add(point)
        console.log(`📍 Точка ${i}:`, point.toString())
      }
      
      // КРИТИЧЕСКИ ВАЖНО: НЕ закрываем путь
      path.closed = false
      
      // Дополнительная проверка - убеждаемся что путь не замкнут
      if (path.closed) {
        console.warn('⚠️ Путь оказался замкнутым, принудительно открываем')
        path.closed = false
      }
      
      // Делаем линию толще для лучшего разрезания
      path.strokeWidth = this.scalpelWidth
      path.strokeColor = '#ff0000'
      
      // Дополнительные настройки для предотвращения замыкания
      path.strokeCap = 'butt'
      path.strokeJoin = 'miter'
      
      console.log('🔪 Создана линия разреза:', {
        points: points.length,
        closed: path.closed,
        strokeWidth: path.strokeWidth,
        segments: path.segments.length,
        bounds: path.bounds.toString()
      })
      
      return path
    },
    
    splitRectangleWithLine(rectangle, cutLine) {
      try {
        console.log('🔪 Начинаем разрезание прямоугольника')
        console.log('🔍 Свойства прямоугольника:', {
          bounds: rectangle.bounds.toString(),
          closed: rectangle.closed,
          segments: rectangle.segments.length
        })
        
        // Создаем расширенную линию для лучшего разрезания
        const expandedLine = this.createExpandedCutLine(cutLine)
        
        console.log('🔍 Свойства расширенной линии:', {
          bounds: expandedLine.bounds.toString(),
          closed: expandedLine.closed,
          segments: expandedLine.segments.length,
          strokeWidth: expandedLine.strokeWidth
        })
        
        // Пробуем разные методы разрезания
        let result = null
        
        // Метод 1: subtract
        try {
          console.log('🔄 Пробуем метод subtract')
          result = rectangle.subtract(expandedLine)
          if (result && result.children && result.children.length > 0) {
            console.log('✅ Subtract успешен, получено', result.children.length, 'частей')
            return result.children
          }
        } catch (error) {
          console.warn('⚠️ Subtract не сработал:', error.message)
        }
        
        // Метод 2: divide
        try {
          console.log('🔄 Пробуем метод divide')
          result = rectangle.divide(expandedLine)
          if (result && result.children && result.children.length > 0) {
            console.log('✅ Divide успешен, получено', result.children.length, 'частей')
            return result.children
          }
        } catch (error) {
          console.warn('⚠️ Divide не сработал:', error.message)
        }
        
        // Метод 3: intersect с маской
        try {
          console.log('🔄 Пробуем метод intersect с маской')
          return this.alternativeSplitMethod(rectangle, cutLine)
        } catch (error) {
          console.warn('⚠️ Intersect не сработал:', error.message)
        }
        
        // Если ничего не сработало, создаем простой разрез
        console.log('🔄 Все методы не сработали, создаем простой разрез')
        return this.createSimpleCut(rectangle, cutLine)
        
      } catch (error) {
        console.error('❌ Критическая ошибка при разрезании:', error)
        return this.createSimpleCut(rectangle, cutLine)
      }
    },
    
    createExpandedCutLine(cutLine) {
      // Создаем расширенную линию для лучшего разрезания
      const expandedLine = cutLine.clone()
      
      // Увеличиваем толщину линии
      expandedLine.strokeWidth = Math.max(this.scalpelWidth * 2, 4)
      
      // Делаем линию более заметной для алгоритма разрезания
      expandedLine.strokeColor = '#ff0000'
      
      console.log('🔪 Создана расширенная линия разреза:', {
        strokeWidth: expandedLine.strokeWidth,
        closed: expandedLine.closed
      })
      
      return expandedLine
    },
    
    alternativeSplitMethod(rectangle, cutLine) {
      // Альтернативный метод разрезания
      console.log('🔄 Используем альтернативный метод разрезания')
      
      try {
        // Создаем копию прямоугольника
        const rectCopy = rectangle.clone()
        
        // Создаем расширенную линию для разрезания
        const expandedLine = this.createExpandedCutLine(cutLine)
        
        // Пробуем использовать unite для создания маски
        const mask = this.createCutMask(expandedLine)
        
        // Применяем маску
        const result = rectCopy.intersect(mask)
        
        if (result && result.children && result.children.length > 0) {
          console.log('✅ Альтернативный метод успешен, получено', result.children.length, 'частей')
          return result.children
        }
        
        // Если и это не сработало, создаем простой разрез
        console.log('🔄 Создаем простой разрез')
        return this.createSimpleCut(rectangle, cutLine)
        
      } catch (error) {
        console.error('❌ Ошибка в альтернативном методе:', error)
        return this.createSimpleCut(rectangle, cutLine)
      }
    },
    
    createSimpleCut(rectangle, cutLine) {
      // Простой метод разрезания - создаем две части
      console.log('🔪 Создаем простой разрез')
      
      try {
        const rectCopy = rectangle.clone()
        
        // Создаем две части на основе линии
        const parts = this.splitRectangleByLine(rectCopy, cutLine)
        
        return parts
        
      } catch (error) {
        console.error('❌ Ошибка в простом разрезе:', error)
        return [rectangle.clone()]
      }
    },
    
    splitRectangleByLine(rectangle, cutLine) {
      // Разделяем прямоугольник по линии
      const bounds = rectangle.bounds
      const parts = []
      
      try {
        // Создаем две части: левую и правую от линии
        const leftPart = this.createLeftPart(rectangle, cutLine, bounds)
        const rightPart = this.createRightPart(rectangle, cutLine, bounds)
        
        if (leftPart) parts.push(leftPart)
        if (rightPart) parts.push(rightPart)
        
        return parts.length > 0 ? parts : [rectangle.clone()]
        
      } catch (error) {
        console.error('❌ Ошибка при разделении:', error)
        return [rectangle.clone()]
      }
    },
    
    createLeftPart(rectangle, cutLine, bounds) {
      // Создаем левую часть от линии
      try {
        const leftRect = new this.paperScope.Path.Rectangle({
          point: [bounds.left, bounds.top],
          size: [bounds.width / 2, bounds.height]
        })
        
        leftRect.strokeColor = this.strokeColor
        leftRect.strokeWidth = this.strokeWidthPx
        leftRect.fillColor = null
        
        return leftRect
        
      } catch (error) {
        console.error('❌ Ошибка при создании левой части:', error)
        return null
      }
    },
    
    createRightPart(rectangle, cutLine, bounds) {
      // Создаем правую часть от линии
      try {
        const rightRect = new this.paperScope.Path.Rectangle({
          point: [bounds.left + bounds.width / 2, bounds.top],
          size: [bounds.width / 2, bounds.height]
        })
        
        rightRect.strokeColor = this.strokeColor
        rightRect.strokeWidth = this.strokeWidthPx
        rightRect.fillColor = null
        
        return rightRect
        
      } catch (error) {
        console.error('❌ Ошибка при создании правой части:', error)
        return null
      }
    },
    
    createCutMask(cutLine) {
      // Создаем маску для разрезания
      const canvasWidth = this.paperScope.view.viewSize.width
      const canvasHeight = this.paperScope.view.viewSize.height
      
      // Создаем прямоугольник-маску
      const mask = new this.paperScope.Path.Rectangle({
        point: [0, 0],
        size: [canvasWidth, canvasHeight]
      })
      
      // Вычитаем линию разреза
      try {
        const result = mask.subtract(cutLine)
        return result
      } catch (error) {
        console.warn('⚠️ Ошибка при создании маски:', error)
        return mask
      }
    },
    
    createNewShapes(shapes) {
      console.log('🔧 Создаем новые фигуры из', shapes.length, 'частей')
      
      if (!shapes || shapes.length === 0) {
        console.warn('⚠️ Нет частей для создания фигур')
        return
      }
      
      // Создаем новые фигуры из результата разрезания
      const newShapes = []
      
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]
        
        console.log(`🔍 Обрабатываем часть ${i + 1}:`, {
          bounds: shape.bounds.toString(),
          closed: shape.closed,
          segments: shape.segments ? shape.segments.length : 'N/A'
        })
        
        // Настраиваем стиль новой фигуры
        shape.fillColor = null // Без заливки
        shape.strokeColor = this.strokeColor
        shape.strokeWidth = this.strokeWidthPx
        shape.strokeJoin = 'miter'
        shape.strokeCap = 'butt'
        
        // Убеждаемся что часть не замкнута (если это не нужно)
        if (shape.closed && shape.segments && shape.segments.length > 2) {
          console.log(`⚠️ Часть ${i + 1} замкнута, это может быть проблемой`)
        }
        
        // Добавляем в активный слой
        this.paperScope.project.activeLayer.addChild(shape)
        
        newShapes.push(shape)
      }
      
      // Обновляем базовый прямоугольник (теперь это массив фигур)
      this.baseRectangle = newShapes[0] // Для совместимости
      
      // Обновляем 3D модель
      this.update3DModel()
      
      console.log('✅ Создано', newShapes.length, 'новых фигур')
    },
    
    updateScalpelLine() {
      // Удаляем предыдущую линию
      this.clearScalpelLine()
      
      if (this.scalpelPoints.length < 2) {
        return
      }
      
      // Создаем путь из точек
      const path = new this.paperScope.Path()
      
      // Добавляем первую точку
      path.add(new this.paperScope.Point(this.scalpelPoints[0].x, this.scalpelPoints[0].y))
      
      // Добавляем остальные точки
      for (let i = 1; i < this.scalpelPoints.length; i++) {
        path.add(new this.paperScope.Point(this.scalpelPoints[i].x, this.scalpelPoints[i].y))
      }
      
      // Настраиваем стиль линии
      path.strokeColor = '#ff0000' // Красный цвет
      path.strokeWidth = 2
      path.dashArray = [10, 5] // Пунктирная линия
      
      // Сохраняем ссылку на линию
      this.scalpelLine = path
      
      console.log('🔴 Красная пунктирная линия обновлена:', this.scalpelPoints.length, 'точек')
    },
    
    clearScalpelLine() {
      if (this.scalpelLine) {
        this.scalpelLine.remove()
        this.scalpelLine = null
      }
    },

    // ========== Управление текстом ==========
    openTextManager() {
      if (this.$refs.textManager) {
        this.$refs.textManager.openDialog()
      }
    },

    onTextDialogOpened() {
      // Диалог открыт — фон уже без редактируемого слоя
      console.log('Диалог текста открыт')
    },

    onTextDialogClosed() {
      // Возвращаем видимость редактируемого слоя, если скрывали
      if (this.editingLayerTempHidden) {
        this.editingLayerTempHidden.visible = true
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.draw()
        }
        this.editingLayerTempHidden = null
      }
      console.log('Диалог текста закрыт')
    },

    onTextApplied(event) {
      console.log('📝 TextManager: применение текста в MugComicPage', event)
      
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
      
      // Обновляем 3D модель
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DTexture()
          console.log('🔄 3D модель обновлена после применения текста')
        }, 100)
      })
    },

    // Применение нового текста на canvas (копия из GridsPage)
    applyTextToCanvas(textData, position, mode) {
      console.log('✅ Применение текста на канвас:', textData)
      
      // Добавляем backgroundMode в textData, если его нет
      if (!textData.backgroundMode) {
        textData.backgroundMode = mode
        console.log('🔧 Добавлен backgroundMode:', mode)
      }
      
      // Масштабируем координаты из канвас-превью (856x405) в основной канвас
      const previewCanvasWidth = 856
      const previewCanvasHeight = 405
      const mainCanvasWidth = this.paperScope.view.viewSize.width
      const mainCanvasHeight = this.paperScope.view.viewSize.height
      
      const scaleX = mainCanvasWidth / previewCanvasWidth
      const scaleY = mainCanvasHeight / previewCanvasHeight
      
      const scaledPosition = {
        x: position.x * scaleX,
        y: position.y * scaleY
      }
      
      console.log('🎯 Координаты для применения (с масштабированием):', {
        original: { x: position.x, y: position.y },
        scaled: { x: scaledPosition.x, y: scaledPosition.y },
        previewCanvas: `${previewCanvasWidth}x${previewCanvasHeight}`,
        mainCanvas: `${mainCanvasWidth}x${mainCanvasHeight}`,
        scale: `${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`,
        mode: mode
      })
      
      // Создаем новый слой
      const layerIndex = this.nextTextLayerId
      this.nextTextLayerId += 10
      
      const textLayer = new this.paperScope.Layer()
      textLayer.name = `textLayer_${layerIndex}`
      
      // Создаём фоновый канвас с текстом и подложкой
      const backgroundRaster = this.createBackgroundWithText(textData, scaledPosition, mode)
      
      if (backgroundRaster) {
        textLayer.addChild(backgroundRaster)
        
        // Сохраняем информацию о слое
        const layerInfo = {
          id: layerIndex,
          layer: textLayer,
          textData: textData,
          position: scaledPosition,
          mode: mode,
          raster: backgroundRaster
        }
        
        // Новые тексты в начало списка, чтобы визуально были сверху
        this.textLayers.unshift(layerInfo)
      this.reorderTextLayersInPaperJS()
      this.enforceLayerOrder()
        
        console.log('✅ Текстовый слой создан:', layerInfo)
        
        // Обновляем 3D модель в боковой панели
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateSideMenu3D()
          }, 500)
        })
      }
    },
    // ========== МЕТОДЫ СОЗДАНИЯ ПОДЛОЖЕК (СКОПИРОВАНО 1 В 1 ИЗ GridsPage) ==========
    
    // Создание подложки с текстом - вызывает нужный метод в зависимости от режима
    createBackgroundWithText(textData, position, mode) {
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
      
      return backgroundItem
    },

    // Обновление существующего текстового слоя
    updateExistingTextLayer(layerIndex, textData, position, mode) {
      console.log('🔄 Обновление существующего текстового слоя:', layerIndex)
      
      // Добавляем backgroundMode в textData, если его нет
      if (!textData.backgroundMode) {
        textData.backgroundMode = mode
        console.log('🔧 Добавлен backgroundMode:', mode)
      }
      
      // Ищем слой по id, как в StickerMania
      let layerInfo = this.textLayers.find(layer => layer.id === layerIndex)
      if (!layerInfo) {
        // Fallback на позицию массива
        layerInfo = this.textLayers[layerIndex]
      }
      if (!layerInfo) {
        console.error('❌ Слой не найден:', layerIndex)
        return
      }
      
      // Удаляем старый raster
      if (layerInfo.raster) {
        try { layerInfo.raster.remove() } catch (e) {}
      }
      
      // Масштабируем позицию из превью в основной канвас
      const previewCanvasWidth = 856
      const previewCanvasHeight = 405
      const mainCanvasWidth = this.paperScope.view.viewSize.width
      const mainCanvasHeight = this.paperScope.view.viewSize.height
      const scaleX = mainCanvasWidth / previewCanvasWidth
      const scaleY = mainCanvasHeight / previewCanvasHeight
      const scaledPosition = { x: position.x * scaleX, y: position.y * scaleY }
      
      // Создаём новый raster и добавляем в существующий слой
      const newRaster = this.createBackgroundWithText(textData, scaledPosition, mode)
      if (newRaster) {
        if (layerInfo.layer && layerInfo.layer.addChild) {
          layerInfo.layer.addChild(newRaster)
        }
        layerInfo.textData = { ...textData }
        layerInfo.position = scaledPosition
        layerInfo.mode = mode
        layerInfo.raster = newRaster
        console.log('✅ Текстовый слой обновлён:', { id: layerInfo.id, pos: scaledPosition, mode })
      }
      
      // Перерисовываем и выравниваем порядок
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.update()
      }
      this.reorderTextLayersInPaperJS()
      this.enforceLayerOrder()
      this.$forceUpdate?.()
      this.update3DTexture()
    },
    // КОПИЯ ИЗ GridsPage - начало блока методов создания подложек

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
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        
        // Добавляем отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textSize.width + textPadding * 2
        const textHeightWithPadding = textSize.height + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        console.log('📏 Расчет размеров подложки с учетом текста:', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textSize.width.toFixed(1)}x${textSize.height.toFixed(1)}`,
          textPadding: textPadding,
          textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`
        })
        
        // Вычисляем точные координаты крайних точек суперподложки с учетом реальных размеров
        const extremePoints = this.calculateExtremePointsForSuperBackground(x, y, actualBackgroundWidth, actualBackgroundHeight, currentTextData)
        
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
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
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
        } else if (currentTextData.backgroundMode === 'image-text') {
          console.log('🖼️ Режим "Текст с изображением": тень отключена для подложки (тень только у текста)')
        }
        
        // Рисуем объединенную фигуру в центре канваса (логические координаты) с реальными размерами
        this.drawCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, actualBackgroundWidth, actualBackgroundHeight, 1, backgroundColor, true, currentTextData)
        
        // Сбрасываем тень
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена (логические координаты)
        if (currentTextData.stroke) {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth // Логические координаты (как в StickerManiaPage)
          this.strokeCombinedShape(tempCtx, canvasWidth/2, canvasHeight/2, actualBackgroundWidth, actualBackgroundHeight, 1, currentTextData)
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
        if (currentTextData.textImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: !!currentTextData.cachedImage,
            imageSize: currentTextData.cachedImage ? `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}` : 'нет изображения'
          })
          
          // Если есть изображение, используем его как маску для заливки текста
          if (currentTextData.cachedImage) {
            const img = currentTextData.cachedImage
            
            // Создаем временный канвас для текста с изображением с ЛОГИЧЕСКИМИ размерами
            const textCanvas = document.createElement('canvas')
            textCanvas.width = canvasWidth // Логический размер (без HiDPI!)
            textCanvas.height = canvasHeight
            textCanvas.style.width = canvasWidth + 'px' // Логический размер
            textCanvas.style.height = canvasHeight + 'px'
            const textCtx = textCanvas.getContext('2d')
            // НЕ масштабируем контекст - работаем в логических координатах!
            
            // Сначала рисуем тень для текста с изображением если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // ИСПРАВЛЕНО: Рисуем тень текста на textCtx с теми же координатами, что и маска
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // Используем те же координаты, что и для маски (scaledTextX, scaledTextY)
              console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА ТЕНИ:', {
                context: 'textCtx',
                canvasSize: `${textCanvas.width}x${textCanvas.height}`,
                fontSize: currentTextData.fontSize || 24,
                fontWeight: currentTextData.fontWeight || 'normal',
                font: currentTextData.font || 'Arial',
                coordinates: `${scaledTextX}, ${scaledTextY}`,
                textAlign: currentTextData.textAlign || 'center',
                textBaseline: 'middle',
                ctxFont: textCtx.font,
                ctxTextAlign: textCtx.textAlign,
                ctxTextBaseline: textCtx.textBaseline
              })
              this.drawMultilineTextWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
            
            // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
            const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
            const textWidth = textSize.width
            const textHeight = textSize.height
            
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
            this.drawMultilineTextWithData(textCtx, currentTextData.text, canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            // Рисуем результат на основном канвасе
            tempCtx.drawImage(textCanvas, 0, 0)
            
            console.log('✅ Текст с изображением добавлен в Raster')
          } else {
            // Если нет изображения, рисуем обычный текст в режиме "Текст с изображением"
            console.log('📝 Рисуем текст в режиме "Текст с изображением" без изображения')
            
            // Сначала рисуем тень если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              tempCtx.shadowOffsetX = currentTextData.shadowOffsetX
              tempCtx.shadowOffsetY = currentTextData.shadowOffsetY
              tempCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              tempCtx.textAlign = currentTextData.textAlign || 'center'
              tempCtx.textBaseline = 'middle'
              tempCtx.fillStyle = currentTextData.shadowColor
              // ИСПРАВЛЕНО: Используем те же координаты, что и для маски
              this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              tempCtx.shadowColor = 'transparent'
              tempCtx.shadowBlur = 0
              tempCtx.shadowOffsetX = 0
              tempCtx.shadowOffsetY = 0
              tempCtx.globalAlpha = 1
            }
            
            // Настраиваем стили текста (точно как в превью)
            tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
            tempCtx.textAlign = currentTextData.textAlign || 'center'
            tempCtx.textBaseline = 'middle'
            tempCtx.fillStyle = currentTextData.textColor || '#000000'
            
            // Рисуем текст в центре канваса с поддержкой переносов строк
            this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            console.log('✅ Текст в режиме "Текст с изображением" без изображения добавлен в Raster')
          }
        } else {
          // Обычный текст без изображения (как в превью)
          console.log('📝 Рисуем обычный текст без изображения')
          
          // Настраиваем стили текста (точно как в превью)
          tempCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
          tempCtx.textAlign = currentTextData.textAlign || 'center'
          tempCtx.textBaseline = 'middle'
          tempCtx.fillStyle = currentTextData.textColor || '#000000'
          
          // Рисуем текст в центре канваса с поддержкой переносов строк
          this.drawMultilineTextWithData(tempCtx, currentTextData.text || 'Текст', canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
          
          console.log('✅ Обычный текст добавлен в Raster')
        }
        
        // Применяем обводку к тексту если включена (поверх всего)
        // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
        if (currentTextData.stroke && currentTextData.backgroundMode === 'image-text') {
          tempCtx.strokeStyle = currentTextData.strokeColor
          tempCtx.lineWidth = currentTextData.strokeWidth * 1 // previewScale = 1
          this.drawMultilineTextStrokeWithData(tempCtx, currentTextData.text, canvasWidth/2, canvasHeight/2, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
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
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
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
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
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

    // НОВОЕ: Создание растра из готового канваса
    createRasterFromSavedCanvas(savedCanvas, x, y) {
      console.log('🎯 Создание растра из готового канваса')
      
      try {
        // Создаем растр из готового канваса
        const raster = new this.paperScope.Raster(savedCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Устанавливаем правильное масштабирование для HiDPI
        const dpr = window.devicePixelRatio || 1
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('✅ Растр создан из готового канваса:', {
          position: `${x}, ${y}`,
          canvasSize: `${savedCanvas.width}x${savedCanvas.height}`,
          scaling: `1/${dpr}, 1/${dpr}`,
          note: 'Используем готовый канвас - размеры должны быть правильными!'
        })
        
        return raster
      } catch (error) {
        console.error('❌ Ошибка создания растра из готового канваса:', error)
        return null
      }
    },
    // Создание подложки "Текст с изображением" используя существующую логику из превью
    createImageTextBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
      const currentTextData = textData
      
      // НОВОЕ: Если есть готовый канвас, используем его
      if (currentTextData.savedCanvas) {
        console.log('🎯 Используем готовый канвас из TextManager')
        return this.createRasterFromSavedCanvas(currentTextData.savedCanvas, x, y)
      }
      
      try {
        // ИСПРАВЛЕНО: Определяем переменные в самом начале блока try
        const previewCanvasWidth = 856  // Размер превью канваса из TextManager
        const previewCanvasHeight = 405
        
        // Создаем временный Canvas размером только подложки + отступы
        const dpr = window.devicePixelRatio || 1
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
        // Добавляем внутренние отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textWidth + textPadding * 2
        const textHeightWithPadding = textHeight + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
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
        
        // УПРОЩЕНО: Используем простой масштабный коэффициент
        const scaleX = previewCanvasWidth / canvasWidth
        const scaleY = previewCanvasHeight / canvasHeight
        const scaledTextX = canvasCenterX * scaleX
        const scaledTextY = canvasCenterY * scaleY
        
        console.log('🎯 УПРОЩЕННОЕ МАСШТАБИРОВАНИЕ:', {
          previewCanvas: `${previewCanvasWidth}x${previewCanvasHeight}`,
          tempCanvas: `${canvasWidth}x${canvasHeight}`,
          scale: `${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`,
          center: `${canvasCenterX}x${canvasCenterY}`,
          scaled: `${scaledTextX.toFixed(1)}x${scaledTextY.toFixed(1)}`,
          note: 'Простое пропорциональное масштабирование!'
        })
        
        // Устанавливаем стиль шрифта (как в превью)
        const fontSize = currentTextData.fontSize
        const fontFamily = currentTextData.font
        const fontWeight = currentTextData.fontWeight
        const textColor = currentTextData.textColor
        
        tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        tempCtx.textAlign = currentTextData.textAlign || 'center'
        tempCtx.textBaseline = 'middle'
        
        // 1. СНАЧАЛА рисуем тень (если включена) - она должна быть под основным текстом
        // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
          tempCtx.shadowColor = currentTextData.shadowColor
          tempCtx.shadowBlur = currentTextData.shadowBlur
          tempCtx.shadowOffsetX = currentTextData.shadowOffsetX * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.shadowOffsetY = currentTextData.shadowOffsetY * 2 // Умножаем на 2 для переноса на основной канвас
          tempCtx.globalAlpha = currentTextData.shadowOpacity / 100
          
          // Рисуем тень текста
          // ИСПРАВЛЕНО: Используем те же координаты, что и для маски
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
          
          // Сбрасываем настройки тени
          tempCtx.shadowColor = 'transparent'
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
          tempCtx.globalAlpha = 1
        }
        
        // ИСПРАВЛЕНО: Переменные уже определены в начале блока try
        
        // ВАЖНО: Координаты должны быть относительно временного канваса, а не основного!
        // Временный канвас имеет размеры превью (856x405)
        const textCanvasCenterX = previewCanvasWidth / 2
        const textCanvasCenterY = previewCanvasHeight / 2
        
        // Создаем временный канвас для текста с изображением с размерами превью
        const textCanvas = document.createElement('canvas')
        textCanvas.width = previewCanvasWidth // Используем размеры превью
        textCanvas.height = previewCanvasHeight
        textCanvas.style.width = previewCanvasWidth + 'px'
        textCanvas.style.height = previewCanvasHeight + 'px'
        const textCtx = textCanvas.getContext('2d')
        // НЕ масштабируем контекст - работаем в логических координатах!
        
        // 2. ЗАТЕМ рисуем основной текст с поддержкой изображения (как в превью)
        if (currentTextData.textImage) {
          console.log('🖼️ Рисуем текст с изображением:', {
            text: currentTextData.text,
            hasImage: !!currentTextData.cachedImage,
            imageSize: currentTextData.cachedImage ? `${currentTextData.cachedImage.width}x${currentTextData.cachedImage.height}` : 'нет изображения'
          })
          
          // Если есть изображение, используем его как маску для заливки текста
          if (currentTextData.cachedImage) {
            const img = currentTextData.cachedImage
            
            // Сначала рисуем тень для текста с изображением если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // ИСПРАВЛЕНО: Используем те же координаты, что и для маски (scaledTextX, scaledTextY)
              this.drawMultilineTextWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
          
          // Вычисляем размеры текста для правильного позиционирования изображения (логические координаты)
          const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
          const textWidth = textSize.width
          const textHeight = textSize.height
          
          // Используем точные размеры текста для изображения
          // Изображение должно точно заполнить область текста
          const drawWidth = textWidth
          const drawHeight = textHeight
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
            canvasCenter: `${textCanvasCenterX}, ${textCanvasCenterY}`,
            containerSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
            dpr: dpr,
            fontSize: currentTextData.fontSize,
            lineHeight: currentTextData.lineHeight,
            note: 'ИСПРАВЛЕНО: Используем размеры превью для совместимости с TextManager'
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
            containerSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
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
          
          // ОТЛАДКА: Сохраняем состояние после рисования изображения
          console.log('🖼️ ОТЛАДКА: Изображение нарисовано на textCanvas')
          
          // Создаем маску из текста (логические координаты относительно временного канваса)
          textCtx.globalCompositeOperation = 'destination-in'
          textCtx.font = `${currentTextData.fontWeight} ${currentTextData.fontSize || 24}px ${currentTextData.font}`
          textCtx.textAlign = 'center' // Всегда центрируем для маски
          textCtx.textBaseline = 'middle'
          textCtx.fillStyle = 'white'
          
          // Создаем копию данных текста с принудительным центрированием для маски
          const maskTextData = { ...currentTextData, textAlign: 'center' }
          
          // ИСПРАВЛЕНО: Маска должна создаваться в тех же координатах, что и тень!
          // Тень рисуется в координатах canvasCenterX, canvasCenterY относительно tempCanvas
          // Маска должна создаваться в тех же координатах относительно textCanvas
          // После масштабирования textCanvas на tempCanvas координаты совпадут
          const maskCenterX = scaledTextX
          const maskCenterY = scaledTextY
          
          console.log('🖼️ ОТЛАДКА: Детальный расчет позиции маски (ИСПРАВЛЕНО):', {
            drawX: drawX,
            drawY: drawY,
            drawWidth: drawWidth,
            drawHeight: drawHeight,
            maskCenterX: maskCenterX,
            maskCenterY: maskCenterY,
            scaledTextX: scaledTextX,
            scaledTextY: scaledTextY,
            calculation: {
              maskCenterX_calc: `scaledTextX = ${maskCenterX}`,
              maskCenterY_calc: `scaledTextY = ${maskCenterY}`,
              note: 'Маска теперь в тех же координатах, что и тень!'
            }
          })
          
          console.log('🖼️ ОТЛАДКА: Создаем маску с данными (ИСПРАВЛЕНО):', {
            text: currentTextData.text,
            fontSize: currentTextData.fontSize,
            lineHeight: currentTextData.lineHeight,
            textAlign: maskTextData.textAlign,
            imagePosition: `${drawX}, ${drawY}`,
            imageSize: `${drawWidth}, ${drawHeight}`,
            maskPosition: `${maskCenterX}, ${maskCenterY}`,
            oldPosition: `${textCanvasCenterX}, ${textCanvasCenterY}`,
            note: 'Маска теперь в координатах scaledTextX, scaledTextY для совпадения с тенью!'
          })
          
          // ИСПРАВЛЕНО: Используем drawMultilineTextWithData с размером шрифта, соответствующим тени
          // Маска должна создаваться с тем же размером шрифта, что и тень
          // ИСПРАВЛЕНО: Создаем маску с тем же размером шрифта, что и тень
          console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА МАСКИ:', {
            context: 'textCtx',
            canvasSize: `${textCanvas.width}x${textCanvas.height}`,
            fontSize: currentTextData.fontSize || 24,
            fontWeight: currentTextData.fontWeight || 'normal',
            font: currentTextData.font || 'Arial',
            coordinates: `${maskCenterX}, ${maskCenterY}`,
            textAlign: maskTextData.textAlign,
            globalCompositeOperation: textCtx.globalCompositeOperation,
            ctxFont: textCtx.font,
            ctxTextAlign: textCtx.textAlign,
            ctxTextBaseline: textCtx.textBaseline,
            ctxFillStyle: textCtx.fillStyle
          })
          
          // ИСПРАВЛЕНО: Увеличиваем размер шрифта для маски, чтобы после масштабирования он совпал с тенью
          const maskFontSize = (currentTextData.fontSize || 24) * (canvasWidth / previewCanvasWidth)
          
          console.log('🎯 ИСПРАВЛЕНИЕ РАЗМЕРА ШРИФТА ДЛЯ МАСКИ:', {
            originalFontSize: currentTextData.fontSize || 24,
            scaleFactor: (canvasWidth / previewCanvasWidth).toFixed(3),
            maskFontSize: maskFontSize.toFixed(1),
            canvasWidth: canvasWidth,
            previewCanvasWidth: previewCanvasWidth,
            note: 'Маска теперь будет того же размера, что и тень!'
          })
          
          this.drawMultilineTextWithData(textCtx, currentTextData.text, maskCenterX, maskCenterY, maskFontSize, currentTextData.lineHeight, maskTextData)
          
          // Сбрасываем режим композиции
          textCtx.globalCompositeOperation = 'source-over'
          
          console.log('🖼️ ОТЛАДКА: Маска создана, рисуем на основном канвасе')
          
          // ОТЛАДКА: Проверяем, что получилось на textCanvas
          console.log('🖼️ ОТЛАДКА: Состояние textCanvas после создания маски:', {
            textCanvasSize: `${textCanvas.width}x${textCanvas.height}`,
            globalCompositeOperation: textCtx.globalCompositeOperation,
            note: 'Проверяем, что маска создана правильно'
          })
          
          // Рисуем результат на основном канвасе (полный размер)
          // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
          const scaleX = canvasWidth / previewCanvasWidth
          const scaleY = canvasHeight / previewCanvasHeight
          tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
          
          console.log('🖼️ Маска с изображением нарисована (ЛОГИЧЕСКИЕ размеры):', {
            textCanvasSize: `${textCanvas.width}x${textCanvas.height}`,
            tempCanvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
            textCanvasLogicalSize: `${previewCanvasWidth}x${previewCanvasHeight}`,
            dpr: dpr,
            note: 'textCanvas использует размеры превью - растр будет правильного размера!'
          })
          } else {
            // Если нет изображения, рисуем обычный текст в режиме "Текст с изображением"
            console.log('📝 Рисуем текст в режиме "Текст с изображением" без изображения')
            
            // Сначала рисуем тень если включена
            // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
            if (currentTextData.shadow && currentTextData.backgroundMode === 'image-text') {
              textCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
              textCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur))
              textCtx.shadowOffsetX = currentTextData.shadowOffsetX
              textCtx.shadowOffsetY = currentTextData.shadowOffsetY
              textCtx.globalAlpha = currentTextData.shadowOpacity / 100
              
              // Рисуем тень текста
              textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
              textCtx.textAlign = currentTextData.textAlign || 'center'
              textCtx.textBaseline = 'middle'
              textCtx.fillStyle = currentTextData.shadowColor
              // Используем координаты, которые после масштабирования будут соответствовать canvasCenterX, canvasCenterY
              this.drawMultilineTextWithData(textCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
              
              // Сбрасываем настройки тени
              textCtx.shadowColor = 'transparent'
              textCtx.shadowBlur = 0
              textCtx.shadowOffsetX = 0
              textCtx.shadowOffsetY = 0
              textCtx.globalAlpha = 1
            }
            
            // Настраиваем стили текста (точно как в превью)
            textCtx.font = `${currentTextData.fontWeight || 'normal'} ${currentTextData.fontSize || 24}px ${currentTextData.font || 'Arial'}`
            textCtx.textAlign = currentTextData.textAlign || 'center'
            textCtx.textBaseline = 'middle'
            textCtx.fillStyle = currentTextData.textColor || '#000000'
            
            // Рисуем текст в центре канваса с поддержкой переносов строк
            // Используем те же координаты, что и для тени
            this.drawMultilineTextWithData(textCtx, currentTextData.text || 'Текст', scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight || 1.2, currentTextData)
            
            // Рисуем результат на основном канвасе
            // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
            tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
            
            console.log('✅ Текст в режиме "Текст с изображением" без изображения добавлен в Raster')
          }
        } else {
          // Если нет изображения, используем обычную заливку цветом
          console.log('🖼️ Рисуем текст без изображения:', {
            text: currentTextData.text,
            textColor: textColor,
            fontSize: currentTextData.fontSize,
            position: `${textCanvasCenterX}, ${textCanvasCenterY}`
          })
          tempCtx.fillStyle = textColor
          this.drawMultilineTextWithData(tempCtx, currentTextData.text, canvasCenterX, canvasCenterY, currentTextData.fontSize * 1, currentTextData.lineHeight, currentTextData)
        }
        
        // 3. НАКОНЕЦ применяем обводку к тексту если включена (поверх всего)
        if (currentTextData.stroke) {
          // Если это режим "Текст с изображением", рисуем обводку на textCtx и переносим на tempCtx
          if (currentTextData.textImage) {
            textCtx.strokeStyle = currentTextData.strokeColor
            textCtx.lineWidth = currentTextData.strokeWidth * 1 // previewScale = 1
            // ИСПРАВЛЕНО: Создаем обводку с тем же размером шрифта, что и тень
            console.log('🖼️ ОТЛАДКА: Рисуем обводку с параметрами:', {
              fontSize: currentTextData.fontSize || 24,
              fontWeight: currentTextData.fontWeight || 'normal',
              font: currentTextData.font || 'Arial',
              coordinates: `${scaledTextX}, ${scaledTextY}`,
              strokeWidth: currentTextData.strokeWidth
            })
            
            this.drawMultilineTextStrokeWithData(textCtx, currentTextData.text, scaledTextX, scaledTextY, currentTextData.fontSize || 24, currentTextData.lineHeight, currentTextData)
            
            // Переносим обводку на основной канвас
            // Масштабируем textCanvas (размеры превью) на tempCanvas (размеры с HiDPI)
            tempCtx.drawImage(textCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight, 0, 0, canvasWidth, canvasHeight)
          } else {
            // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
            // Для других режимов обводка у текста не применяется
            console.log('📝 Режим не "Текст с изображением": обводка у текста отключена')
          }
        }
        
        // Конвертируем Canvas в Paper.js Raster
        // ИСПРАВЛЕНО: Используем tempCanvas для правильных размеров с HiDPI масштабированием
        const raster = new this.paperScope.Raster(tempCanvas)
        raster.position = new this.paperScope.Point(x, y)
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку tempCanvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        // Создаем область перетаскивания для правильного выделения
        // Ждем пока Paper.js вычислит bounds
        setTimeout(() => {
          const rasterBounds = raster.bounds
          if (rasterBounds) {
            // Рассчитываем правильные bounds с учетом хвоста
            const expandedBounds = this.calculateSmartBounds(rasterBounds, currentTextData, 'imageText')
            console.log('🎯 Создаем область перетаскивания для Raster (ImageText):', {
              originalBounds: rasterBounds,
              expandedBounds: expandedBounds
            })
            
            // Устанавливаем правильные bounds для области перетаскивания
            raster.bounds = expandedBounds
          } else {
            console.warn('⚠️ Не удалось получить bounds для Raster (ImageText)')
          }
        }, 0)
        
        console.log('🎯 Raster создан с правильными размерами (ImageText):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `1/${dpr}, 1/${dpr} (с HiDPI масштабированием)`,
          padding: padding
        })
        
        console.log('✅ Подложка "Текст с изображением" создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `1/${dpr}x (с HiDPI масштабированием)`,
          textData: {
            text: currentTextData.text,
            fontSize: currentTextData.fontSize,
            textColor: currentTextData.textColor,
            fontWeight: currentTextData.fontWeight,
            font: currentTextData.font,
            hasImage: !!currentTextData.textImage,
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
        
        // Вычисляем реальные размеры текста с учетом переносов строк
        const textSize = this.calculateMultilineTextSize(currentTextData.text, currentTextData.fontSize, currentTextData.lineHeight, currentTextData)
        const textWidth = textSize.width
        const textHeight = textSize.height
        
        // Добавляем внутренние отступы к размерам текста
        const textPadding = currentTextData.padding || 15
        const textWidthWithPadding = textWidth + textPadding * 2
        const textHeightWithPadding = textHeight + textPadding * 2
        
        // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
        const actualBackgroundWidth = Math.max(backgroundWidth, textWidthWithPadding)
        const actualBackgroundHeight = Math.max(backgroundHeight, textHeightWithPadding)
        
        console.log('📏 Расчет размеров подложки с учетом текста (режим "Мысли"):', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
          textPadding: textPadding,
          textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`
        })
        
        // Добавляем отступы для тени и обводки
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX) + Math.abs(currentTextData.shadowOffsetY), 100) : 0
        const strokePadding = currentTextData.stroke ? (currentTextData.strokeWidth / 2 + 2) : 0
        
        // Рассчитываем отступ для хвоста на основе максимальной длины хвоста
        const maxTailSize = 7.5 // Максимальный размер хвоста (750%)
        const minDimension = Math.min(actualBackgroundWidth, actualBackgroundHeight)
        const maxTailLength = minDimension * maxTailSize
        const tailPadding = Math.max(100, maxTailLength * 0.2) // 20% от максимальной длины хвоста, минимум 100px
        
        const canvasWidth = actualBackgroundWidth + shadowPadding + strokePadding + tailPadding
        const canvasHeight = actualBackgroundHeight + shadowPadding + strokePadding + tailPadding
        
        console.log('📏 Расчет размеров канваса (с учетом текста):', {
          originalBackground: `${backgroundWidth}x${backgroundHeight}`,
          actualBackground: `${actualBackgroundWidth.toFixed(1)}x${actualBackgroundHeight.toFixed(1)}`,
          shadowPadding: shadowPadding,
          strokePadding: strokePadding,
          maxTailLength: maxTailLength.toFixed(1),
          tailPadding: tailPadding.toFixed(1),
          canvasSize: `${canvasWidth.toFixed(1)}x${canvasHeight.toFixed(1)}`,
          note: 'Используем реальные размеры с учетом текста и хвоста'
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
        
        // Используем реальные размеры подложки с учетом текста
        const backgroundScale = 1.0 // Используем полный размер подложки
        const textScale = 1.0 // Используем полный размер текста
        const scaledBackgroundWidth = actualBackgroundWidth * backgroundScale
        const scaledBackgroundHeight = actualBackgroundHeight * backgroundScale
        
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
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        console.log('🧠 ЛОГ: createThoughtsBackgroundFromPreviewLogic - проверяем тень:', {
          hasShadow: !!currentTextData.shadow,
          shadowValue: currentTextData.shadow,
          backgroundMode: currentTextData.backgroundMode,
          isImageText: currentTextData.backgroundMode === 'image-text',
          willApplyShadow: currentTextData.shadow && currentTextData.backgroundMode !== 'image-text'
        })
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * backgroundScale))
          // ИСПРАВЛЕНИЕ: Для режима "Мысли" сдвиг тени умножаем на 2 при переносе на основной канвас
          if (currentTextData.backgroundMode === 'thoughts') {
            console.log('🧠 ЛОГ: createThoughtsBackgroundFromPreviewLogic - применяем тень:', {
              originalOffsetX: currentTextData.shadowOffsetX,
              originalOffsetY: currentTextData.shadowOffsetY,
              backgroundScale: backgroundScale,
              resultOffsetX: Math.round(currentTextData.shadowOffsetX * backgroundScale * 2),
              resultOffsetY: Math.round(currentTextData.shadowOffsetY * backgroundScale * 2),
              backgroundMode: currentTextData.backgroundMode
            })
            tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale * 2)
            tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale * 2)
          } else {
            tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale)
            tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale)
          }
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
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
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
        
        // Масштабируем Raster чтобы сохранить тот же логический размер
        // Поскольку Canvas имеет высокое разрешение (dpr), нам нужно уменьшить масштаб
        raster.scaling = new this.paperScope.Point(1 / dpr, 1 / dpr)
        
        console.log('🎯 Raster создан с правильными размерами (Thoughts):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          originalPosition: `${x}, ${y}`,
          offset: `${offsetX}, ${offsetY}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: `${(1 / dpr).toFixed(3)}x`,
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
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      console.log('🧠 ЛОГ: buildThoughtsModePath - проверяем тень:', {
        hasShadow: !!currentTextData.shadow,
        shadowValue: currentTextData.shadow,
        backgroundMode: currentTextData.backgroundMode,
        isImageText: currentTextData.backgroundMode === 'image-text',
        willApplyShadow: currentTextData.shadow && currentTextData.backgroundMode !== 'image-text'
      })
      if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
        ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        // ИСПРАВЛЕНИЕ: Для режима "Мысли" умножаем размытие и смещение тени на 2
        ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale * 2))
        ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale * 2)
        ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale * 2)
      }
      
      ctx.beginPath()
      this.drawOval(ctx, centerX, centerY, bgWidth, bgHeight)
      ctx.fillStyle = backgroundColor || currentTextData.backgroundColor
      ctx.fill()
      
      // Сбрасываем тень
      if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена
      if (currentTextData.stroke) {
        ctx.strokeStyle = currentTextData.strokeColor
        ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale))
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
        // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
        if (currentTextData.shadow && currentTextData.backgroundMode !== 'image-text') {
          ctx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          // ИСПРАВЛЕНИЕ: Для режима "Мысли" умножаем размытие и смещение тени на 2
          ctx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * scale * 2))
          ctx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * scale * 2)
          ctx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * scale * 2)
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
        
        // Добавляем обводку если включена (такая же толщина как у основного овала)
        if (currentTextData.stroke) {
          ctx.strokeStyle = currentTextData.strokeColor
          ctx.lineWidth = Math.max(1, Math.round(currentTextData.strokeWidth * scale))
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
      const tailWidthPercent = Number(currentTextData.tailWidth) / 100
      const tailSizePercent = Number(currentTextData.tailSize) / 100
      
      console.log('🔍 buildUnifiedShapePathWithCache DEBUG:', {
        tailSize: currentTextData.tailSize,
        tailWidth: currentTextData.tailWidth,
        tailSizePercent: tailSizePercent,
        tailWidthPercent: tailWidthPercent,
        minDimension: Math.min(bgWidth, bgHeight),
        tailLength: Math.min(bgWidth, bgHeight) * 1.25,
        scale: scale
      })
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      if (cachedIntersection) {
        // Создаем суперподложку с хвостом используя КЭШИРОВАННУЮ точку
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   cachedIntersection, currentTextData.tailAngle * Math.PI / 180, Math.min(bgWidth, bgHeight) * 1.25, tailWidthPercent, currentTextData, scale)
      } else {
        // Если нет пересечения, рисуем обычную подложку
        this.buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight)
      }
    },
    
    // Построение пути суперподложки с хвостом
    buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                           intersectionPoint, tailAngle, tailLength, tailWidthPercent, textData = null, scale = 1) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData
      
      // Вычисляем параметры хвоста
      const tailWidthPixels = tailWidthPercent * 50 * scale * 2
      
      // Острая вершина хвоста (используем переданный tailLength с учетом tailSize)
      const sharpPointX = centerX + tailLength * Number(currentTextData.tailSize) / 100 * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * Number(currentTextData.tailSize) / 100 * Math.sin(tailAngle)
      
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
      
      console.log('🔍 [getTailIntersectionWithBackground] Параметры:', {
        centerX, centerY, tailEndX, tailEndY,
        bgLeft, bgTop, bgRight, bgBottom,
        sides
      })
      
      // Собираем ВСЕ пересечения
      const allIntersections = []
      
      for (const side of sides) {
        console.log('🔍 [getTailIntersectionWithBackground] Проверяем сторону:', side)
        
        const intersection = this.getLineIntersectionByCoords(
          centerX, centerY, tailEndX, tailEndY,
          side.x1, side.y1, side.x2, side.y2
        )
        
        if (intersection) {
          // Проверяем, что точка пересечения находится на отрезке
          if (this.isPointOnLineSegment(intersection.x, intersection.y, side.x1, side.y1, side.x2, side.y2)) {
            allIntersections.push(intersection)
          }
        }
      }
      
      // Возвращаем ближайшую точку пересечения
      if (allIntersections.length > 0) {
        let closestIntersection = allIntersections[0]
        let minDistance = Math.sqrt(Math.pow(closestIntersection.x - centerX, 2) + Math.pow(closestIntersection.y - centerY, 2))
        
        for (let i = 1; i < allIntersections.length; i++) {
          const distance = Math.sqrt(Math.pow(allIntersections[i].x - centerX, 2) + Math.pow(allIntersections[i].y - centerY, 2))
          if (distance < minDistance) {
            minDistance = distance
            closestIntersection = allIntersections[i]
          }
        }
        
        return closestIntersection
      }
      
      return null
    },
    
    // Вычисление пересечения двух линий (8 параметров)
    getLineIntersectionByCoords(x1, y1, x2, y2, x3, y3, x4, y4) {
      console.log('🔍 [getLineIntersectionByCoords] Параметры:', { x1, y1, x2, y2, x3, y3, x4, y4 })
      
      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(den) < 1e-10) {
        console.log('🔍 [getLineIntersectionByCoords] Линии параллельны')
        return null // Линии параллельны
      }
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den
      
      console.log('🔍 [getLineIntersectionByCoords] Результат:', { t, u, den })
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const result = {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        }
        console.log('🔍 [getLineIntersectionByCoords] Пересечение найдено:', result)
        return result
      }
      
      console.log('🔍 [getLineIntersectionByCoords] Пересечение не найдено')
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
      
      // Рисуем тень только для режима "Текст с изображением"
      if (textData.shadow && textData.backgroundMode === 'image-text') {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = textData.shadowBlur || 10
        ctx.shadowOffsetX = textData.shadowOffsetX || 5
        ctx.shadowOffsetY = textData.shadowOffsetY || 5
      } else {
        // Сбрасываем тень для других режимов
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      
      // Рисуем обводку если есть
      // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
      if (textData.stroke && textData.backgroundMode === 'image-text') {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
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
      
      // Рисуем тень только для режима "Текст с изображением" (с масштабированием)
      if (textData.shadow && textData.backgroundMode === 'image-text') {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = (textData.shadowBlur || 10) * scale
        ctx.shadowOffsetX = (textData.shadowOffsetX || 5) * scale
        ctx.shadowOffsetY = (textData.shadowOffsetY || 5) * scale
      } else {
        // Сбрасываем тень для других режимов
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize * scale, textData.lineHeight || 1.2, textData)
      
      // Рисуем обводку если есть (с масштабированием)
      // ИСПРАВЛЕНИЕ: Обводка у текста применяется только для режима "Текст с изображением"
      if (textData.stroke && textData.backgroundMode === 'image-text') {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = (textData.strokeWidth || 3) * scale
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize * scale, textData.lineHeight || 1.2, textData)
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
        
        // Применяем тень только для режима "Текст с изображением"
        if (textData.shadow && textData.backgroundMode === 'image-text') {
          ctx.shadowColor = textData.shadowColor || '#000000'
          ctx.shadowBlur = (textData.shadowBlur || 10) * dpr
          ctx.shadowOffsetX = (textData.shadowOffsetX || 5) * dpr
          ctx.shadowOffsetY = (textData.shadowOffsetY || 5) * dpr
        } else {
          // Сбрасываем тень для других режимов
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        console.log('🎨 Контекст настроен:', {
          font: ctx.font,
          textAlign: ctx.textAlign,
          textBaseline: ctx.textBaseline,
          fillStyle: ctx.fillStyle,
          shadowApplied: textData.shadow && textData.backgroundMode === 'image-text'
        })
        
        // Рисуем текст с поддержкой переноса строк и выравнивания
        this.drawMultilineTextWithData(ctx, textData.text, x, y, fontSize, textData.lineHeight, textData)
        
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
    // Расчет размеров многострочного текста
    calculateMultilineTextSize(text, fontSize, lineHeight = 1.2, textData) {
      if (!text) return { width: 0, height: 0 }
      
      const lines = text.split('\n')
      
      // Принудительно преобразуем fontSize и lineHeight в числа
      const numericFontSize = Number(fontSize)
      const numericLineHeight = Number(lineHeight)
      
      // Создаем временный контекст для измерения
      const tempCtx = document.createElement('canvas').getContext('2d')
      tempCtx.font = `${textData.fontWeight || 'normal'} ${numericFontSize}px ${textData.font || 'Arial'}`
      
      // Вычисляем максимальную ширину текста
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = tempCtx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Вычисляем общую высоту текста
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? numericFontSize : lines.length * numericFontSize * numericLineHeight
      
      return {
        width: maxTextWidth,
        height: totalTextHeight
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
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        // ИСПРАВЛЕНИЕ: Для режима "Стандарт" умножаем размытие и смещение тени на 2
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale * 2))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale * 2)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale * 2)
        
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
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем обводку каждой строки
      lines.forEach((line, index) => {
        // Для однострочного текста позиция строки просто y, для многострочного - с учетом lineHeight
        const lineY = lines.length === 1 ? y : startY + (index * fontSize * lineHeight) + fontSize / 2
        
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
      
      // ОТЛАДКА: Логируем параметры для всех элементов
      console.log('🔍 ДЕТАЛЬНАЯ ОТЛАДКА drawMultilineTextWithData:', {
        text: text,
        x: x,
        y: y,
        fontSize: fontSize,
        lineHeight: lineHeight,
        textAlign: textData.textAlign,
        fontWeight: textData.fontWeight,
        font: textData.font,
        globalCompositeOperation: ctx.globalCompositeOperation,
        ctxFont: ctx.font,
        ctxTextAlign: ctx.textAlign,
        ctxTextBaseline: ctx.textBaseline,
        ctxFillStyle: ctx.fillStyle,
        canvasSize: `${ctx.canvas.width}x${ctx.canvas.height}`
      })
      
      // Если это режим с изображением, запрещаем перенос текста
      let processedText = text
      if (textData.textImage && textData.cachedImage) {
        processedText = processedText.replace(/\n/g, ' ')
        console.log('🖼️ Запрещен перенос текста в режиме с изображением:', {
          original: text,
          processed: processedText
        })
      }
      
      const lines = processedText.split('\n')
      
      // Устанавливаем размер шрифта (используем fontSize как есть, масштабирование применяется на уровне вызова)
      ctx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Вычисляем межстрочный интервал
      const lineSpacing = fontSize * lineHeight
      
      // Вычисляем общую высоту текста для центрирования по вертикали
      // Для однострочного текста используем только fontSize, для многострочного - с lineHeight
      const totalTextHeight = lines.length === 1 ? fontSize : lines.length * fontSize * lineHeight
      const startY = y - totalTextHeight / 2
      
      // Вычисляем максимальную ширину текста для центрирования по горизонтали
      let maxTextWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxTextWidth = Math.max(maxTextWidth, textMetrics.width)
      })
      
      // Рисуем каждую строку
      lines.forEach((line, index) => {
        // Для однострочного текста позиция строки просто y, для многострочного - с учетом lineHeight
        const lineY = lines.length === 1 ? y : startY + (index * fontSize * lineHeight) + fontSize / 2
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if ((textData.textAlign || 'center') === 'left') {
          lineX = x - maxTextWidth / 2
        } else if ((textData.textAlign || 'center') === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        // ОТЛАДКА: Логируем каждую строку для маски
        if (ctx.globalCompositeOperation === 'destination-in') {
          console.log(`🖼️ ОТЛАДКА: Рисуем строку ${index + 1} для маски:`, {
            line: line,
            lineX: lineX.toFixed(1),
            lineY: lineY.toFixed(1),
            textAlign: textData.textAlign
          })
        }
        
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

    // Расчет крайних точек для суперподложки (с учетом хвоста, тени, обводки)
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
          const strokePadding = strokeWidth / 2 + 5
          
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

    calculateSmartBounds(originalBounds, textData, mode) {
      return originalBounds // Упрощенная версия, просто возвращаем оригинальные bounds
    },

    // КОПИЯ ИЗ GridsPage - конец блока методов создания подложек
 
  
    editTextLayer(index) {
      // Редактирование текста: переносим текущие данные и позицию в TextManager (как в StickerMania)
      const layerInfo = this.textLayers.find(layer => layer.id === index) || this.textLayers[index]
      if (!layerInfo) return

      const textManager = this.$refs.textManager
      if (!textManager) return

      // Актуальная позиция из Paper.js
      let actualPosition = { ...(layerInfo.position || { x: 0, y: 0 }) }
      if (layerInfo.layer && layerInfo.layer.position) {
        actualPosition = {
          x: layerInfo.layer.position.x,
          y: layerInfo.layer.position.y
        }
      } else if (layerInfo.raster && layerInfo.raster.position) {
        actualPosition = {
          x: layerInfo.raster.position.x,
          y: layerInfo.raster.position.y
        }
      }

      // Устанавливаем позицию в редакторе
      textManager.currentDragPosition = actualPosition
      // Обновляем сохраненную позицию слоя
      layerInfo.position = actualPosition

      // Копируем текущие данные текста
      const dataCopy = JSON.parse(JSON.stringify(layerInfo.textData || {}))

      // Заполняем данные по активному режиму
      switch (layerInfo.mode) {
        case 'conversation':
          if (textManager.textDialogDataConversation) Object.assign(textManager.textDialogDataConversation, dataCopy)
          break
        case 'thoughts':
          if (textManager.textDialogDataThoughts) Object.assign(textManager.textDialogDataThoughts, dataCopy)
          break
        case 'standard':
          if (textManager.textDialogDataStandard) Object.assign(textManager.textDialogDataStandard, dataCopy)
          break
        case 'image-text':
          if (textManager.textDialogDataImageText) Object.assign(textManager.textDialogDataImageText, dataCopy)
          break
      }

      // Режим редактирования в TextManager
      textManager.isEditingText = true
      textManager.editingLayerIndex = layerInfo.id
      if (textManager.textDialogActiveTab !== undefined) {
        textManager.textDialogActiveTab = layerInfo.mode
      }

      // Временно скрываем редактируемый слой на канвасе
      if (layerInfo.layer) {
        this.editingLayerTempHidden = layerInfo.layer
        this.editingLayerTempHidden.visible = false
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.draw()
        }
      }

      // Открываем диалог редактирования через спец-метод, как в StickerMania
      if (typeof textManager.editTextLayer === 'function') {
        textManager.editTextLayer(layerInfo.textData, actualPosition, layerInfo.mode, layerInfo.id)
      } else if (typeof textManager.openDialog === 'function') {
        // Fallback: но предпочтителен editTextLayer
        textManager.openDialog(layerInfo.textData, layerInfo.id)
      } else {
        textManager.showTextDialog = true
      }
    },

    deleteTextLayer(index) {
      if (confirm('Удалить этот текстовый слой?')) {
        const layerInfo = this.textLayers[index]
        
        // Удаляем Paper.js слой
        if (layerInfo && layerInfo.layer) {
          layerInfo.layer.remove()
        }
        
        // Удаляем из массива
        this.textLayers.splice(index, 1)
        
        // Обновляем 3D модель
        this.update3DTexture()
      this.enforceLayerOrder()
      }
    },

    // Сохранение canvas для печати (300 DPI)
    async saveCanvasForPrint() {
      console.log('🖨️ Начинаем сохранение холста для печати в 300 DPI')
      
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = this.$refs.comicCanvas
          if (!canvas) {
            console.error('❌ Основной холст не найден')
            reject(new Error('Холст не найден'))
            return
          }

          // Параметры для печати (300 DPI - стандарт для качественной печати)
          const printDPI = 300
          const screenDPI = 96 // Стандартный DPI экрана
          
          // Получаем размеры холста
          const canvasWidth = canvas.width
          const canvasHeight = canvas.height
          
          // Вычисляем размеры для печати (увеличиваем в 3.125 раза для 300 DPI)
          const printWidth = Math.round(canvasWidth * (printDPI / screenDPI))
          const printHeight = Math.round(canvasHeight * (printDPI / screenDPI))
          const scale = printDPI / screenDPI
          
          console.log('📏 Размеры для печати:', {
            original: `${canvasWidth}x${canvasHeight}`,
            print: `${printWidth}x${printHeight}`,
            scale: scale.toFixed(2)
          })

          // Создаем временный холст в высоком разрешении
          const printCanvas = document.createElement('canvas')
          printCanvas.width = printWidth
          printCanvas.height = printHeight
          const printCtx = printCanvas.getContext('2d')

          // Настраиваем высокое качество рендеринга
          printCtx.imageSmoothingEnabled = true
          printCtx.imageSmoothingQuality = 'high'
          
          // Отладочная информация
          console.log('🔍 Отладочная информация для сохранения:')
          console.log('- textLayers:', this.textLayers.length, this.textLayers)
          
          // Создаем новый Paper.js canvas с высоким разрешением
          console.log('🎨 Создаем новый Paper.js canvas с высоким разрешением')
          
          if (this.paperScope && this.paperScope.project) {
            try {
              // Создаем временный PaperScope с высоким разрешением
              const tempPaperScope = new paper.PaperScope()
              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = printWidth
              tempCanvas.height = printHeight
              // ВАЖНО: Устанавливаем стили для правильного масштабирования
              tempCanvas.style.width = canvasWidth + 'px'
              tempCanvas.style.height = canvasHeight + 'px'
              tempPaperScope.setup(tempCanvas)
              
              // Создаем белый фон в tempPaperScope
              const whiteBackground = new tempPaperScope.Path.Rectangle({
                point: [0, 0],
                size: [printWidth, printHeight]
              })
              whiteBackground.fillColor = '#FFFFFF'
              whiteBackground.name = 'whiteBackground'
              tempPaperScope.project.activeLayer.addChild(whiteBackground)
              
              // Перерисовываем все элементы в высоком разрешении
              await this.redrawAllElementsInHighDPI(tempPaperScope, scale, printWidth, printHeight)
              
              // Ждем загрузки всех изображений с timeout
              await new Promise(resolve => {
                let attempts = 0
                const maxAttempts = 50 // 5 секунд максимум
                
                const checkLoaded = () => {
                  attempts++
                  const allRasters = tempPaperScope.project.getItems({ class: tempPaperScope.Raster })
                  const loadedRasters = allRasters.filter(raster => raster.loaded)
                  console.log('🔍 Проверка загрузки изображений:', {
                    attempt: attempts,
                    total: allRasters.length,
                    loaded: loadedRasters.length,
                    allLoaded: allRasters.length === loadedRasters.length,
                    maxAttempts
                  })
                  
                  if (allRasters.length === loadedRasters.length || attempts >= maxAttempts) {
                    if (attempts >= maxAttempts) {
                      console.warn('⚠️ Timeout ожидания загрузки изображений, продолжаем с загруженными')
                    }
                    resolve()
                  } else {
                    setTimeout(checkLoaded, 100)
                  }
                }
                checkLoaded()
              })
              
              // ВАЖНО: Обновляем view после создания всех элементов
              tempPaperScope.view.update()
              
              // Копируем результат на printCanvas
              printCtx.drawImage(tempCanvas, 0, 0)
              
              // Очищаем временный PaperScope
              tempPaperScope.project.clear()
              
            } catch (error) {
              console.error('❌ Ошибка при создании высокого разрешения:', error)
              
              // Fallback: простое масштабирование
              printCtx.drawImage(
                canvas,
                0, 0, canvasWidth, canvasHeight,
                0, 0, printWidth, printHeight
              )
            }
          } else {
            console.error('❌ Paper.js project не найден')
            // Fallback: простое масштабирование HTML canvas
            printCtx.drawImage(
              canvas,
              0, 0, canvasWidth, canvasHeight,
              0, 0, printWidth, printHeight
            )
          }

          // Создаем ссылку для скачивания
          const filename = `mug-comic-${new Date().toISOString().slice(0, 10)}.png`
          const link = document.createElement('a')
          link.download = filename
          
          // Конвертируем в blob с высоким качеством
          printCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              link.href = url
              
              // Запускаем скачивание
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              // Очищаем URL
              URL.revokeObjectURL(url)
              
              console.log('✅ Файл успешно сохранен:', link.download)
              
              // Показываем уведомление пользователю
              this.$nextTick(() => {
                console.log('🎉 Изображение сохранено в высоком качестве для печати!')
              })
            } else {
              console.error('❌ Ошибка при создании blob')
              reject(new Error('Ошибка при создании файла'))
            }
          }, 'image/png', 1.0) // Максимальное качество

          resolve({
            success: true,
            filename: filename,
            size: { width: printWidth, height: printHeight },
            scale: scale
          })

        } catch (error) {
          console.error('❌ Ошибка при сохранении холста:', error)
          reject(error)
        }
      })
    },
    
    // Перерисовка всех элементов в высоком разрешении для печати
    async redrawAllElementsInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight) {
      console.log('🎨 Перерисовываем все элементы в высоком разрешении')
      console.log('📊 Статистика элементов:')
      console.log('- textLayers:', this.textLayers.length)
      console.log('- userMasks:', this.userMasks.length)
      
      try {
        // 1. Рисуем базовый прямоугольник (обводку) в высоком разрешении
        console.log('🔍 Отладка обводки:', {
          baseRectangle: !!this.baseRectangle,
          strokeWidth: this.strokeWidth,
          strokeWidthPx: this.strokeWidthPx,
          strokeColor: this.strokeColor,
          scale: scale
        })
        
        if (this.baseRectangle && this.strokeWidth > 0) {
          console.log('🖼️ Рисуем базовый прямоугольник в высоком разрешении')
          const rect = new tempPaperScope.Path.Rectangle({
            point: [0, 0],
            size: [canvasWidth, canvasHeight],
            strokeColor: this.strokeColor,
            strokeWidth: Math.round(this.strokeWidthPx * scale)
          })
          rect.strokeCap = 'butt'
          rect.strokeJoin = 'miter'
          tempPaperScope.project.activeLayer.addChild(rect)
          console.log('✅ Базовый прямоугольник добавлен:', rect.bounds)
        } else {
          console.log('⚠️ Базовый прямоугольник не рисуется:', {
            baseRectangle: !!this.baseRectangle,
            strokeWidth: this.strokeWidth
          })
        }
        
        // 2. Перерисовываем все пользовательские маски (до текстов)
        try {
          const sortedMasks = [...this.userMasks].sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0))
          for (const mask of sortedMasks) {
            await this.redrawMaskInHighDPI(tempPaperScope, mask, scale)
          }
          console.log('✅ Все маски перерисованы в высоком разрешении')
        } catch (e) {
          console.error('❌ Ошибка при перерисовке масок в высоком разрешении:', e)
        }

        // 3. Перерисовываем все текстовые элементы с подложками
        console.log(`📝 Рисуем ${this.textLayers.length} текстовых слоев в правильном порядке`)
        
        // Сортируем текстовые слои по их реальному z-index (порядку наложения на канвасе)
        const sortedTextLayers = [...this.textLayers].sort((a, b) => {
          // Получаем z-index из Paper.js слоя, если он есть
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
        
        for (let i = 0; i < sortedTextLayers.length; i++) {
          const layer = sortedTextLayers[i]
          const originalIndex = this.textLayers.indexOf(layer)
          
          console.log(`📝 Текстовый слой ${originalIndex + 1} (z-index: ${layer.layer?.index || layer.id || 0}, слой ${i + 1}):`, {
            id: layer.id,
            text: layer.textData?.text,
            mode: layer.mode,
            position: layer.position,
            zIndex: layer.layer?.index || layer.id || 0
          })
          
          try {
            await this.redrawTextLayerInHighDPIForPaper(tempPaperScope, layer, scale)
            console.log(`✅ Текстовый слой ${originalIndex + 1} успешно обработан`)
          } catch (error) {
            console.error(`❌ Ошибка в текстовом слое ${originalIndex + 1}:`, error)
          }
        }
        
        console.log('✅ Все элементы перерисованы в высоком разрешении')
        
      } catch (error) {
        console.error('❌ Ошибка при перерисовке элементов в высоком разрешении:', error)
        throw error
      }
    },

    // Перерисовать пользовательскую маску в высоком разрешении (с учетом 300 DPI)
    async redrawMaskInHighDPI(tempPaperScope, mask, scale) {
      if (!mask) return

      // Источник точек: ПРИОРИТЕТ strokePath (он всегда в актуальной позиции в составе группы),
      // затем актуальный visualPath (если он ещё существует), иначе исходные points с попыткой смещения
      const points = []
      if (mask.strokePath && mask.strokePath.segments && mask.strokePath.segments.length >= 3) {
        // Координаты детей группы могут быть в локальной системе координат группы — переводим в глобальные через globalMatrix
        for (const seg of mask.strokePath.segments) {
          try {
            const gp = mask.strokePath.globalMatrix.transformPoint(seg.point)
            points.push({ x: gp.x, y: gp.y })
          } catch (e) {
            try {
              const gp2 = mask.strokePath.localToGlobal(seg.point)
              points.push({ x: gp2.x, y: gp2.y })
            } catch (e2) {
              points.push({ x: seg.point.x, y: seg.point.y })
            }
          }
        }
      } else if (mask.visualPath && mask.visualPath.segments && mask.visualPath.segments.length >= 3) {
        for (const seg of mask.visualPath.segments) {
          try {
            const gp = mask.visualPath.globalMatrix.transformPoint(seg.point)
            points.push({ x: gp.x, y: gp.y })
          } catch (e) {
            try {
              const gp2 = mask.visualPath.localToGlobal(seg.point)
              points.push({ x: gp2.x, y: gp2.y })
            } catch (e2) {
              points.push({ x: seg.point.x, y: seg.point.y })
            }
          }
        }
      } else if (Array.isArray(mask.points) && mask.points.length >= 3) {
        // Фолбэк: исходные точки + текущее смещение
        let deltaX = 0, deltaY = 0
        try {
          const currentCenter = (mask.maskGroup?.bounds?.center) || (mask.strokePath?.bounds?.center) || (mask.visualPath?.bounds?.center)
          // Если есть сохранённый центр маски (в момент создания), используем его как базовый, иначе fallback к текущему
          const baseCenter = (mask.center) ? new tempPaperScope.Point(mask.center.x, mask.center.y) : currentCenter
          if (currentCenter && baseCenter) {
            deltaX = currentCenter.x - baseCenter.x
            deltaY = currentCenter.y - baseCenter.y
          }
        } catch (e) {}
        for (const p of mask.points) {
          points.push({ x: p.x + deltaX, y: p.y + deltaY })
        }
      } else {
        return
      }

      // Строим путь маски в HiDPI координатах
      const hiPath = new tempPaperScope.Path()
      for (const p of points) {
        hiPath.add(new tempPaperScope.Point(p.x * scale, p.y * scale))
      }
      hiPath.closed = true

      // Логи центров/границ перед HiDPI клипом
      try {
        const grpC = mask.maskGroup?.globalMatrix?.transformPoint(mask.maskGroup.bounds.center)
        console.log('📐 [HiDPI] centers', {
          id: mask.id,
          pointsCount: points.length,
          hiPathCenter: { x: hiPath.bounds.center.x, y: hiPath.bounds.center.y },
          groupCenterGlobal: grpC ? { x: grpC.x, y: grpC.y } : null
        })
      } catch (e) {}

      // Доп. коррекция: выравниваем центр hiPath с глобальным центром mask.maskGroup (если есть)
      try {
        if (mask.maskGroup && mask.maskGroup.bounds && mask.maskGroup.globalMatrix) {
          const grpCenterGlobal = mask.maskGroup.globalMatrix.transformPoint(mask.maskGroup.bounds.center)
          const hiCenter = hiPath.bounds.center
          // delta в координатах исходного пространства → умножаем на scale для hiPath
          const deltaX = (grpCenterGlobal.x - (hiCenter.x / scale)) * scale
          const deltaY = (grpCenterGlobal.y - (hiCenter.y / scale)) * scale
          if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
            hiPath.translate(new tempPaperScope.Point(deltaX, deltaY))
          }
        }
      } catch (e) { /* ignore alignment errors */ }

      // Если к маске привязано изображение — создаем обрезанное изображение в HiDPI
      const image = this.maskImages?.[mask.id]
      if (image) {
        // Создаем временный canvas по размерам маски
        const bounds = hiPath.bounds
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = Math.max(1, Math.round(bounds.width))
        tempCanvas.height = Math.max(1, Math.round(bounds.height))

        // Рисуем клип пути
        tempCtx.save()
        tempCtx.beginPath()
        // Переносим путь в (0,0)
        tempCtx.translate(-bounds.x, -bounds.y)
        // Аппроксимация fill по сегментам
        const segments = hiPath.segments || []
        if (segments.length) {
          tempCtx.moveTo(segments[0].point.x, segments[0].point.y)
          for (let i = 1; i < segments.length; i++) {
            tempCtx.lineTo(segments[i].point.x, segments[i].point.y)
          }
          tempCtx.closePath()
        }
        tempCtx.clip()

        // Загружаем изображение и вписываем его с покрытием
        await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            // Масштаб, чтобы покрыть tempCanvas целиком
            const scaleX = tempCanvas.width / img.width
            const scaleY = tempCanvas.height / img.height
            const coverScale = Math.max(scaleX, scaleY)
            const drawW = img.width * coverScale
            const drawH = img.height * coverScale
            const offsetX = (tempCanvas.width - drawW) / 2
            const offsetY = (tempCanvas.height - drawH) / 2
            tempCtx.drawImage(img, offsetX, offsetY, drawW, drawH)
            tempCtx.restore()
            resolve()
          }
          img.src = image.url
        })

        // Создаем Raster и позиционируем по центру hiPath
        const clippedRaster = new tempPaperScope.Raster(tempCanvas.toDataURL('image/png'))
        await new Promise((resolve) => { clippedRaster.onLoad = resolve })
        clippedRaster.position = hiPath.bounds.center
        tempPaperScope.project.activeLayer.addChild(clippedRaster)

        // Обводка поверх (масштабируем толщину)
        if (mask.strokeColor && (mask.strokeWidth || 0) > 0) {
          const stroke = hiPath.clone()
          stroke.fillColor = null
          stroke.strokeColor = mask.strokeColor
          stroke.strokeWidth = (mask.strokeWidth || 0) * scale
          tempPaperScope.project.activeLayer.addChild(stroke)
        }

        // Не рисуем заливку отдельно, т.к. она изображением
        return
      }

      // Случай без изображения: заливаем цветом и рисуем обводку
      if (mask.fillColor) {
        const fillPath = hiPath.clone()
        try { fillPath.fillColor = new tempPaperScope.Color(mask.fillColor) } catch (e) { fillPath.fillColor = mask.fillColor }
        fillPath.strokeColor = null
        tempPaperScope.project.activeLayer.addChild(fillPath)
      }
      if (mask.strokeColor && (mask.strokeWidth || 0) > 0) {
        const stroke = hiPath.clone()
        stroke.fillColor = null
        try { stroke.strokeColor = new tempPaperScope.Color(mask.strokeColor) } catch (e) { stroke.strokeColor = mask.strokeColor }
        stroke.strokeWidth = (mask.strokeWidth || 0) * scale
        tempPaperScope.project.activeLayer.addChild(stroke)
      }
    },

    // Перерисовка текстового слоя в высоком разрешении для Paper.js (КОПИЯ 1 в 1 из GridsPage)
    async redrawTextLayerInHighDPIForPaper(tempPaperScope, layerInfo, scale) {
      console.log('📝 Перерисовываем текстовый слой:', layerInfo.id)
      
      try {
        if (layerInfo.textData && layerInfo.textData.backgroundMode === 'image-text') {
          await this.drawImageTextLayerInHighDPI(tempPaperScope, layerInfo, scale)
          return
        }
        // Создаем временный canvas для рендеринга в высоком разрешении
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Получаем размеры из оригинального элемента
        let bounds
        if (layerInfo.backgroundItem && layerInfo.backgroundItem.bounds) {
          bounds = layerInfo.backgroundItem.bounds
        } else {
          // Используем примерные размеры
          bounds = {
            width: 200,
            height: 100,
            x: 0,
            y: 0
          }
        }
        
        console.log('📏 Размеры слоя:', bounds)
        
        // Создаем canvas с высоким разрешением
        let backgroundWidth = layerInfo.textData.backgroundWidth || 200
        let backgroundHeight = layerInfo.textData.backgroundHeight || 80
        
        // Вычисляем размеры в высоком разрешении
        const scaledBackgroundWidth = backgroundWidth * scale
        const scaledBackgroundHeight = backgroundHeight * scale
        const highResWidth = Math.max(scaledBackgroundWidth, 200 * scale)
        const highResHeight = Math.max(scaledBackgroundHeight, 100 * scale)
        
        // Устанавливаем размеры canvas
        tempCanvas.width = highResWidth
        tempCanvas.height = highResHeight
        
        // Добавляем отступы для тени и обводки
        const padding = Math.max(20 * scale, 20)
        const totalWidth = highResWidth + padding * 2
        const totalHeight = highResHeight + padding * 2
        
        tempCanvas.width = totalWidth
        tempCanvas.height = totalHeight
        
        // Настраиваем контекст для высокого качества
        tempCtx.imageSmoothingEnabled = true
        tempCtx.imageSmoothingQuality = 'high'
        
        // Рисуем подложку в высоком разрешении
        console.log('🎨 Рисуем подложку для текста в высоком разрешении')
        
        // Сохраняем контекст и применяем отступы
        tempCtx.save()
        tempCtx.translate(padding, padding)
        
        // Создаем временный слой для передачи в методы
        const tempLayer = {
          textData: layerInfo.textData,
          bounds: {
            width: scaledBackgroundWidth,
            height: scaledBackgroundHeight
          }
        }
        
        // Рисуем подложку в зависимости от режима
        if (layerInfo.textData.backgroundMode === 'conversation') {
          console.log('💬 Рисуем подложку "Разговор" в высоком разрешении')
          await this.drawConversationBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'standard') {
          console.log('📋 Рисуем подложку "Стандарт" в высоком разрешении')
          await this.drawStandardBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'thoughts') {
          console.log('💭 Рисуем подложку "Мысли" в высоком разрешении')
          await this.drawThoughtsBackgroundInHighDPI(tempCtx, tempLayer, scale)
        } else if (layerInfo.textData.backgroundMode === 'image-text') {
          console.log('🖼️ Рисуем подложку "Текст с изображением" в высоком разрешении')
          await this.drawImageTextBackgroundInHighDPI(tempCtx, tempLayer, scale)
        }
        
        // Восстанавливаем контекст
        tempCtx.restore()
        
        // Рисуем текст в высоком разрешении
        console.log('✍️ Рисуем текст в высоком разрешении')
        this.drawTextInHighDPI(tempCtx, { 
          ...layerInfo, 
          bounds: { width: highResWidth, height: highResHeight },
          textData: {
            ...layerInfo.textData,
            fontSize: layerInfo.textData.fontSize * scale  // Масштабируем размер шрифта
          }
        })
        
        // Создаем Raster из временного canvas
        const textRaster = new tempPaperScope.Raster(tempCanvas.toDataURL('image/png', 1.0))
        
        // Ждем загрузки
        await new Promise((resolve) => {
          textRaster.onLoad = resolve
        })
        
        // Позиционируем в высоком разрешении
        const position = layerInfo.position || { x: 0, y: 0 }
        const scaledX = position.x * scale
        const scaledY = position.y * scale
        
        console.log('📍 Позиция текста:', {
          original: position,
          scaled: { x: scaledX, y: scaledY },
          canvasSize: { width: tempPaperScope.view.element.width, height: tempPaperScope.view.element.height },
          textSize: { width: textRaster.bounds.width, height: textRaster.bounds.height }
        })
        
        textRaster.position = new tempPaperScope.Point(scaledX, scaledY)
        
        // Добавляем на слой
        tempPaperScope.project.activeLayer.addChild(textRaster)
        
        console.log('✅ Текстовый слой добавлен в высоком разрешении:', textRaster.bounds)
        
      } catch (error) {
        console.error('❌ Ошибка при перерисовке текстового слоя:', error)
        throw error
      }
    },

    // Отрисовка подложки "Разговор" для высокого разрешения
    drawCombinedShapeForHighDPI(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData) {
      // Используем существующий метод drawCombinedShape
      this.drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData)
    },

    // Отрисовка подложки "Мысли" для высокого разрешения
    drawThoughtsModeShapeForHighDPI(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData) {
      // Используем существующий метод buildThoughtsModePath
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, textData)
    },

    // Методы отрисовки для высокого разрешения
    async drawConversationBackgroundInHighDPI(ctx, layer, scale) {
      console.log('💬 Рисуем подложку "Разговор" в высоком разрешении')
      
      const textData = layer.textData
      const backgroundColor = textData.backgroundColor || '#FFFFFF'
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      const bgWidth = layer.bounds.width
      const bgHeight = layer.bounds.height
      
      console.log('💬 Параметры подложки "Разговор" в высоком разрешении:', {
        centerX,
        centerY,
        bgWidth,
        bgHeight,
        scale,
        backgroundColor,
        hasShadow: !!textData.shadow,
        hasStroke: !!textData.stroke,
        backgroundMode: textData.backgroundMode
      })
      
      // Используем ту же логику, что и в drawConversationModeShapeWithData, но с масштабированием для высокого разрешения
      // Сначала рисуем тень если включена
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        console.log('🌫️ Рисуем тень для подложки "Разговор" в высоком разрешении')
        const shadowBlur = (textData.shadowBlur || 10) * scale
        const shadowOffsetX = (textData.shadowOffsetX || 0) * scale
        const shadowOffsetY = (textData.shadowOffsetY || 0) * scale
        const shadowOpacity = textData.shadowOpacity || 0.3
        
        ctx.save()
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`
        ctx.shadowBlur = shadowBlur
        ctx.shadowOffsetX = shadowOffsetX
        ctx.shadowOffsetY = shadowOffsetY
        
        // Рисуем подложку "Разговор" с тенью
        this.drawConversationModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, true, textData)
        ctx.restore()
      } else {
        // Рисуем подложку "Разговор" без тени
        this.drawConversationModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, false, textData)
      }
      
      // Рисуем обводку если включена
      if (textData.stroke) {
        console.log('🖊️ Рисуем обводку для подложки "Разговор" в высоком разрешении')
        const strokeWidth = (textData.strokeWidth || 2) * scale
        const strokeColor = textData.strokeColor || '#000000'
        
        ctx.save()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Рисуем обводку подложки "Разговор"
        this.drawConversationModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, 'transparent', false, textData)
        ctx.restore()
      }
      
      console.log('✅ Подложка "Разговор" полностью нарисована в высоком разрешении')
    },

    async drawStandardBackgroundInHighDPI(ctx, layer, scale) {
      console.log('📝 Рисуем подложку "Стандарт" в высоком разрешении')
      
      const textData = layer.textData
      const backgroundColor = textData.backgroundColor || '#FFFFFF'
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      const bgWidth = layer.bounds.width
      const bgHeight = layer.bounds.height
      
      console.log('📝 Параметры подложки "Стандарт" в высоком разрешении:', {
        centerX,
        centerY,
        bgWidth,
        bgHeight,
        scale,
        backgroundColor,
        hasShadow: !!textData.shadow,
        hasStroke: !!textData.stroke,
        backgroundMode: textData.backgroundMode
      })
      
      // Используем ту же логику, что и в drawStandardModeShapeWithData, но с масштабированием для высокого разрешения
      // Сначала рисуем тень если включена
      // ИСПРАВЛЕНИЕ: Тень у подложки применяется для режимов "Разговор", "Мысли", "Стандарт", но НЕ для "Текст с изображением"
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        console.log('📝 Применяем тень к подложке "Стандарт" в высоком разрешении')
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale)
        
        // Рисуем тень
        ctx.fillStyle = backgroundColor
        ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        console.log('✅ Тень подложки "Стандарт" нарисована в высоком разрешении')
      }
      
      // Затем рисуем основную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // В конце применяем обводку если включена
      if (textData.stroke) {
        console.log('📝 Применяем обводку к подложке "Стандарт" в высоком разрешении')
        ctx.strokeStyle = textData.strokeColor
        ctx.lineWidth = textData.strokeWidth * scale
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        console.log('✅ Обводка подложки "Стандарт" нарисована в высоком разрешении')
      }
      
      console.log('✅ Подложка "Стандарт" полностью нарисована в высоком разрешении')
    },

    async drawThoughtsBackgroundInHighDPI(ctx, layer, scale) {
      console.log('🧠 Рисуем подложку "Мысли" в высоком разрешении')
      
      const textData = layer.textData
      const backgroundColor = textData.backgroundColor || '#FFFFFF'
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      const bgWidth = layer.bounds.width
      const bgHeight = layer.bounds.height
      
      console.log('🧠 Параметры подложки "Мысли" в высоком разрешении:', {
        centerX,
        centerY,
        bgWidth,
        bgHeight,
        scale,
        backgroundColor,
        hasShadow: !!textData.shadow,
        hasStroke: !!textData.stroke,
        backgroundMode: textData.backgroundMode
      })
      
      // Используем ту же логику, что и в drawThoughtsModeShapeWithData, но с масштабированием для высокого разрешения
      // Сначала рисуем тень если включена
      if (textData.shadow && textData.backgroundMode !== 'image-text') {
        console.log('🌫️ Рисуем тень для подложки "Мысли" в высоком разрешении')
        const shadowBlur = (textData.shadowBlur || 10) * scale
        const shadowOffsetX = (textData.shadowOffsetX || 0) * scale
        const shadowOffsetY = (textData.shadowOffsetY || 0) * scale
        const shadowOpacity = textData.shadowOpacity || 0.3
        
        ctx.save()
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`
        ctx.shadowBlur = shadowBlur
        ctx.shadowOffsetX = shadowOffsetX
        ctx.shadowOffsetY = shadowOffsetY
        
        // Рисуем овальную подложку с тенью
        this.drawThoughtsModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, true, true, textData)
        ctx.restore()
      } else {
        // Рисуем овальную подложку без тени
        this.drawThoughtsModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, false, true, textData)
      }
      
      // Рисуем обводку если включена
      if (textData.stroke) {
        console.log('🖊️ Рисуем обводку для подложки "Мысли" в высоком разрешении')
        const strokeWidth = (textData.strokeWidth || 2) * scale
        const strokeColor = textData.strokeColor || '#000000'
        
        ctx.save()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Рисуем обводку овальной подложки
        this.drawThoughtsModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, 'transparent', false, true, textData)
        ctx.restore()
      }
      
      console.log('✅ Подложка "Мысли" полностью нарисована в высоком разрешении')
    },

    async drawImageTextBackgroundInHighDPI(ctx, layer, scale) {
      console.log('🖼️ Рисуем подложку "Текст с изображением" в высоком разрешении')
      
      const textData = layer.textData
      const backgroundColor = textData.backgroundColor || '#FFFFFF'
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      const bgWidth = layer.bounds.width
      const bgHeight = layer.bounds.height
      
      console.log('🖼️ Параметры подложки "Текст с изображением" в высоком разрешении:', {
        centerX,
        centerY,
        bgWidth,
        bgHeight,
        scale,
        backgroundColor,
        hasShadow: !!textData.shadow,
        hasStroke: !!textData.stroke,
        backgroundMode: textData.backgroundMode
      })
      
      // Для режима "Текст с изображением" тень применяется только к тексту, не к подложке
      // Рисуем простую прямоугольную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // Рисуем обводку если включена
      if (textData.stroke) {
        console.log('🖊️ Рисуем обводку для подложки "Текст с изображением" в высоком разрешении')
        const strokeWidth = (textData.strokeWidth || 2) * scale
        const strokeColor = textData.strokeColor || '#000000'
        
        ctx.save()
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Рисуем обводку прямоугольной подложки
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        ctx.restore()
      }
      
      console.log('✅ Подложка "Текст с изображением" полностью нарисована в высоком разрешении')
    },

    drawTextInHighDPI(ctx, layer) {
      const textData = layer.textData
      console.log('✍️ drawTextInHighDPI вызван:', {
        hasTextData: !!textData,
        text: textData?.text,
        fontSize: textData?.fontSize,
        font: textData?.font,
        backgroundMode: textData?.backgroundMode,
        hasShadow: !!textData?.shadow,
        hasStroke: !!textData?.stroke
      })
      
      if (!textData) {
        console.log('⚠️ Нет данных текста, выходим')
        return
      }
      
      // Сохраняем оригинальные значения для восстановления
      const originalShadow = textData.shadow
      const originalStroke = textData.stroke
      
      // ИСПРАВЛЕНИЕ: Тень у текста применяется только для режима "Текст с изображением"
      // НЕ изменяем оригинальные данные, используем локальную переменную
      let textShadow = textData.shadow
      if (textData.backgroundMode !== 'image-text' && textData.shadow) {
        console.log(`📝 Режим "${textData.backgroundMode}": отключаем тень для текста (тень только для "Текст с изображением")`)
        textShadow = false
      }
      
      // Настраиваем шрифт
      ctx.font = `${textData.fontWeight || 'normal'} ${textData.fontSize}px ${textData.font}`
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = textData.textColor || '#000000'
      
      // Центрируем текст
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      
      // Применяем тень к тексту только для режима "Текст с изображением"
      if (textData.backgroundMode === 'image-text' && textShadow) {
        console.log('📝 Применяем тень к тексту в режиме "Текст с изображением"')
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY)
      }
      
      // Рисуем текст с поддержкой переносов строк
      this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      
      // Сбрасываем тень
      if (textData.backgroundMode === 'image-text' && textData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Применяем обводку к тексту только для режима "Текст с изображением"
      if (textData.backgroundMode === 'image-text' && textData.stroke) {
        console.log('📝 Применяем обводку к тексту в режиме "Текст с изображением"')
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 3
        this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight || 1.2, textData)
      }
      
      // Восстанавливаем оригинальные значения
      textData.shadow = originalShadow
      textData.stroke = originalStroke
      
      console.log('✅ Текст нарисован в высоком разрешении:', {
        text: textData.text,
        fontSize: textData.fontSize,
        position: { x: centerX, y: centerY },
        backgroundMode: textData.backgroundMode,
        shadowApplied: textData.backgroundMode === 'image-text' && originalShadow,
        strokeApplied: textData.backgroundMode === 'image-text' && originalStroke
      })
    },

    async drawImageTextLayerInHighDPI(tempPaperScope, layerInfo, scale) {
      const textData = layerInfo.textData || {}
      const position = layerInfo.position || { x: 0, y: 0 }
      const x = position.x * scale
      const y = position.y * scale

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = tempPaperScope.view.element.width
      tempCanvas.height = tempPaperScope.view.element.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

      const img = textData.cachedImage || null
      const scaledFontSize = (textData.fontSize || 24) * scale
      tempCtx.font = `${textData.fontWeight || 'normal'} ${scaledFontSize}px ${textData.font || 'Arial'}`

      const lines = String(textData.text || '').split('\n')
      let maxWidth = 0
      lines.forEach(line => { const w = tempCtx.measureText(line).width; if (w > maxWidth) maxWidth = w })
      const textWidth = maxWidth
      const textHeight = lines.length === 1 ? scaledFontSize : lines.length * scaledFontSize * (textData.lineHeight || 1.2)

      if (img) {
        const widthScale = textWidth / img.width
        const heightScale = textHeight / img.height
        const imageScale = Math.max(widthScale, heightScale) * 1.2
        const scaledImageWidth = img.width * imageScale
        const scaledImageHeight = img.height * imageScale
        const drawX = x - scaledImageWidth / 2
        const drawY = y - scaledImageHeight / 2
        tempCtx.drawImage(img, drawX, drawY, scaledImageWidth, scaledImageHeight)
      }

      tempCtx.globalCompositeOperation = 'destination-in'
      tempCtx.textAlign = textData.textAlign || 'center'
      tempCtx.textBaseline = 'middle'
      tempCtx.fillStyle = '#000'
      const totalTextHeight = lines.length === 1 ? scaledFontSize : lines.length * scaledFontSize * (textData.lineHeight || 1.2)
      const startY = y - totalTextHeight / 2
      lines.forEach((line, index) => {
        const lineY = lines.length === 1 ? y : startY + (index * scaledFontSize * (textData.lineHeight || 1.2)) + scaledFontSize / 2
        tempCtx.fillText(line, x, lineY)
      })
      tempCtx.globalCompositeOperation = 'source-over'

      if (textData.stroke) {
        tempCtx.strokeStyle = textData.strokeColor || '#000'
        tempCtx.lineWidth = (textData.strokeWidth || 2) * scale
        lines.forEach((line, index) => {
          const lineY = lines.length === 1 ? y : startY + (index * scaledFontSize * (textData.lineHeight || 1.2)) + scaledFontSize / 2
          tempCtx.strokeText(line, x, lineY)
        })
      }

      const imageDataURL = tempCanvas.toDataURL('image/png', 1.0)
      const raster = new tempPaperScope.Raster(imageDataURL)
      await new Promise((resolve, reject) => { raster.onLoad = resolve; raster.onError = reject })
      raster.position = new tempPaperScope.Point(x, y)
      tempPaperScope.project.activeLayer.addChild(raster)
    },

    // Триггер сохранения из панели инструментов
    triggerSave() {
      // Перед сохранением НОРМАЛИЗУЕМ координаты всех пользовательских масок
      try { this.normalizeUserMasksForSave() } catch (e) { /* no-op */ }

      // Дадим Vue применить изменения в пропсах дочернего GridSaveCanvas
      this.$nextTick(() => {
        if (this.$refs.saveCanvas && this.$refs.saveCanvas.handleSaveWithLog) {
          this.$refs.saveCanvas.handleSaveWithLog()
        }
      })
    },

    // Обновление 3D модели в боковой панели
    updateSideMenu3D() {
      try {
        // Ищем SideMenu через корневой компонент
        const app = this.$root
        const sideMenu = app?.$refs?.sideMenu
        // Лог вызова отключён для снижения шума в консоли
        
        if (sideMenu) {
          const canvas = this.$refs.comicCanvas
          // console.log('🔍 Canvas найден (MugComic):', { canvas: !!canvas, width: canvas?.width, height: canvas?.height })
          
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            // Обновляем canvas в боковой панели
            sideMenu.setSourceCanvas(canvas)
            // console.log('✅ 3D модель в боковой панели обновлена (MugComic)')
          } else {
            // console.warn('⚠️ Canvas не готов или не найден в MugComicPage:', { canvas: !!canvas, width: canvas?.width, height: canvas?.height })
            // Повторяем попытку через 200мс
            setTimeout(() => {
              this.updateSideMenu3D()
            }, 200)
          }
        } else {
          // console.warn('⚠️ SideMenu не найден через $root (MugComic)')
        }
      } catch (error) {
        console.error('❌ Ошибка обновления 3D модели (MugComic):', error)
      }
    },

    // Обработчики событий кнопки сохранения
    onSaveStart() {
      console.log('🔄 Начало сохранения')
      console.log('📊 Данные для сохранения:', {
        textLayers: this.textLayers,
        textLayersCount: this.textLayers.length,
        strokeColor: this.strokeColor,
        strokeWidthPx: this.strokeWidthPx
      })
    },

    // Нормализация масок перед сохранением: записываем актуальные ГЛОБАЛЬНЫЕ точки и центр
    normalizeUserMasksForSave() {
      if (!Array.isArray(this.userMasks) || this.userMasks.length === 0) return
      for (const mask of this.userMasks) {
        try {
          // Пытаемся взять точки из strokePath (чаще всего актуальнее), иначе из visualPath
          const sourcePath = (mask.strokePath && mask.strokePath.segments && mask.strokePath.segments.length >= 3)
            ? mask.strokePath
            : (mask.visualPath && mask.visualPath.segments && mask.visualPath.segments.length >= 3)
              ? mask.visualPath
              : null

          if (sourcePath) {
            const newPoints = []
            for (const seg of sourcePath.segments) {
              let gp
              try {
                gp = sourcePath.globalMatrix ? sourcePath.globalMatrix.transformPoint(seg.point) : sourcePath.localToGlobal(seg.point)
              } catch (e) {
                gp = sourcePath.localToGlobal ? sourcePath.localToGlobal(seg.point) : seg.point
              }
              newPoints.push({ x: gp.x, y: gp.y })
            }
            if (newPoints.length >= 3) {
              mask.points = newPoints
            }
          } else if (Array.isArray(mask.points) && mask.points.length >= 3) {
            // Если нет путей, но есть points — дополнительно сдвинем на delta группы, если группа есть
            if (mask.maskGroup && mask.maskGroup.bounds && mask.maskGroup.globalMatrix) {
              const grpC = mask.maskGroup.globalMatrix.transformPoint(mask.maskGroup.bounds.center)
              const baseC = (mask.center && typeof mask.center.x === 'number' && typeof mask.center.y === 'number') ? mask.center : grpC
              const dx = grpC.x - baseC.x
              const dy = grpC.y - baseC.y
              if ((Math.abs(dx) + Math.abs(dy)) > 0) {
                mask.points = mask.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
              }
            }
          }

          // Обновляем сохранённый центр
          try {
            if (mask.maskGroup && mask.maskGroup.bounds && mask.maskGroup.globalMatrix) {
              const gc = mask.maskGroup.globalMatrix.transformPoint(mask.maskGroup.bounds.center)
              mask.center = { x: gc.x, y: gc.y }
            } else if (mask.visualPath && mask.visualPath.bounds) {
              mask.center = { x: mask.visualPath.bounds.center.x, y: mask.visualPath.bounds.center.y }
            }
          } catch (_) {}
        } catch (_) {}
      }
    },

    onSaveSuccess(result) {
      console.log('✅ Файл успешно сохранён:', result)
      
      // ИСПРАВЛЕНИЕ: НЕ обновляем основной канвас после сохранения, чтобы избежать появления лишних элементов
      // setTimeout(() => {
      //   if (this.paperScope && this.paperScope.view) {
      //     this.paperScope.view.update()
      //     console.log('🔄 Основной канвас обновлен после сохранения')
      //   }
      // }, 100)
      
      // Обновляем 3D модель после сохранения
      this.$nextTick(() => {
        if (this.$refs.threeRenderer) {
          this.$refs.threeRenderer.updateTexture()
          // console.log('🔄 3D модель обновлена после сохранения')
        }
      })
    },

    onSaveError(error) {
      console.error('❌ Ошибка при сохранении:', error)
      
      // Принудительно обновляем основной канвас даже при ошибке
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.update()
        console.log('🔄 Основной канвас обновлен после ошибки сохранения')
      }
    },

    showNotification(message) {
      console.log('📢', message)
    },

    // ========== 3D Renderer callbacks ==========
    onThreeInitialized() {
      console.log('ThreeDRenderer инициализирован')
    },

    onTextureUpdated() {
      // Texture обновлена
    },

    onTextureError(error) {
      console.error('Ошибка обновления текстуры:', error)
    },
    
    // ========== Обработчики событий canvas ==========
    onCanvasClick(event) {
      if (!this.maskMode) return
      
      const rect = this.$refs.comicCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Конвертируем координаты в Paper.js
      const point = new this.paperScope.Point(x, y)
      
      // Проверяем пересечение перед добавлением точки
      const intersection = this.checkLineIntersection(point)
      if (intersection) {
        console.log('🚫 Пересечение обнаружено, точка не добавлена')
        this.hasIntersection = true
        this.intersectionPoint = intersection
        
        // Показываем красную точку клика
        this.showRedClickPoint(point)
        
        // Показываем крестик в месте пересечения
        this.showIntersectionCross(intersection)
        return
      }
      
      // Сбрасываем состояние пересечения
      this.hasIntersection = false
      this.intersectionPoint = null
      this.hideIntersectionWarning()
      this.hideRedClickPoint()
      
      // Проверяем замыкание контура (магнит к первой точке)
      if (this.maskPoints.length >= 3) {
        const firstPoint = this.maskPoints[0]
        const distance = point.getDistance(firstPoint)
        
        if (distance <= 15) { // Магнит 15px
          console.log('🎯 Примагничивание к первой точке! Расстояние:', distance.toFixed(2))
          console.log('🎭 Контур замкнут!')
          this.finishMask()
          return
        }
      }
      
      // Добавляем точку
      this.maskPoints.push({ x: point.x, y: point.y })
      
      // Создаем визуальную точку
      this.createMaskPoint(point)
      
      // Обновляем линию
      this.updateMaskLine()
      
      
      console.log('📍 Добавлена точка маски:', point.toString())
    },
    
    onCanvasMouseMove(event) {
      // Удаляем красные метки при движении мыши
      this.hideRedClickPoint()
      this.hideIntersectionWarning()
      
      if (!this.maskMode || this.maskPoints.length === 0) return
      
      const rect = this.$refs.comicCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const point = new this.paperScope.Point(x, y)
      
      // Проверяем примагничивание к первой точке
      if (this.maskPoints.length >= 3) {
        const firstPoint = this.maskPoints[0]
        const distance = point.getDistance(firstPoint)
        
        if (distance <= 15) {
          // Показываем индикацию примагничивания
          this.showMagneticSnap(firstPoint)
        } else {
          // Скрываем индикацию примагничивания
          this.hideMagneticSnap()
        }
      }
      
      // Обновляем временную линию
      this.updateMaskLine(point)
    },
    
    updateMaskLine(hoverPoint) {
      // Удаляем предыдущую временную линию, если есть
      if (this.maskLine) {
        this.maskLine.remove()
        this.maskLine = null
      }
      
      if (!this.paperScope || !this.paperScope.project) return
      if (!this.maskPoints || this.maskPoints.length === 0) return
      
      // Создаем новый путь
      const path = new this.paperScope.Path()
      path.strokeColor = '#0066cc'
      path.strokeWidth = 2
      path.dashArray = [5, 5]
      path.closed = false
      
      // Добавляем точки текущего контура
      for (const p of this.maskPoints) {
        path.add(new this.paperScope.Point(p.x, p.y))
      }
      
      // Если есть точка наведения — добавляем ее как временную
      if (hoverPoint) {
        path.add(new this.paperScope.Point(hoverPoint.x, hoverPoint.y))
      }
      
      this.paperScope.project.activeLayer.addChild(path)
      this.maskLine = path
    },
    
    createMaskPoint(point) {
      if (!this.paperScope || !this.paperScope.project) return
      
      // Создаем синюю точку
      const circle = new this.paperScope.Path.Circle(point, 4)
      circle.fillColor = '#0066cc'
      circle.strokeColor = '#004499'
      circle.strokeWidth = 1
      
      // Добавляем на canvas
      this.paperScope.project.activeLayer.addChild(circle)
      
      // Сохраняем ссылку для удаления
      this.maskPointElements.push(circle)
      
      console.log('📍 Создана точка маски:', point.toString())
    },
    
    createMaskVisual(mask) {
      if (!this.paperScope || !this.paperScope.project) return
      
      // Создаем путь из точек маски
      const path = new this.paperScope.Path()
      
      for (const point of mask.points) {
        path.add(new this.paperScope.Point(point.x, point.y))
      }
      
      // Замыкаем контур
      path.closed = true
      
      // Настраиваем стиль
      path.fillColor = mask.fillColor
      path.strokeColor = mask.strokeColor
      path.strokeWidth = mask.strokeWidth
      
      // Добавляем на canvas
      this.paperScope.project.activeLayer.addChild(path)
      
      // Сохраняем ссылку на визуальный путь
      mask.visualPath = path
      // Сохраняем центр маски для последующего позиционирования при сохранении
      try {
        if (path && path.bounds && path.bounds.center) {
          mask.center = { x: path.bounds.center.x, y: path.bounds.center.y }
        }
      } catch (e) {}
      
      // Очищаем вспомогательные элементы
      this.clearAllMaskElements()
      
      console.log('🎭 Создана визуальная маска:', mask.id)
      this.enforceLayerOrder()
      // Обновим превью после создания визуального пути
      this.$nextTick(() => { try { this.renderMaskPreview && this.renderMaskPreview(mask) } catch (e) {} })
    },
    
    selectMask(maskId) {
      this.selectedMask = maskId
      console.log('🎭 Выбрана маска:', maskId)
    },
    
    // ========== Обработчики drag and drop для изображений ==========
    onImageDragStart(event, image) {
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'image',
        image: image
      }))
      event.dataTransfer.effectAllowed = 'copy'
      // console.log('🖼️ Начато перетаскивание изображения:', image.name)
    },
    
    onImageDragEnd() {
      // console.log('🖼️ Завершено перетаскивание изображения')
    },
    
    onCanvasDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    
    onCanvasDrop(event) {
      event.preventDefault()
      
      try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        
        if (data.type === 'image') {
          const image = data.image
          const rect = this.$refs.comicCanvas.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top
          
          // Находим маску под курсором
          const mask = this.findMaskAtPoint(x, y)
          
          if (mask) {
            this.attachImageToMask(mask.id, image)
            console.log('🖼️ Изображение привязано к маске:', mask.id)
          } else {
            // Если маска не найдена, применяем изображение как фон
            this.setBackgroundFromImage(image)
            // Делаем фон базового прямоугольника прозрачным, чтобы растр был виден
            this.backgroundColor = 'rgba(0,0,0,0)'
            this.updateBaseRectangle()
            console.log('🖼️ Изображение применено как фон:', image.name)
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке drop:', error)
      }
    },
    
    findMaskAtPoint(x, y) {
      // Находим маску под указанной точкой
      for (const mask of this.userMasks) {
        if (mask.visualPath && mask.visualPath.contains(new this.paperScope.Point(x, y))) {
          return mask
        }
      }
      return null
    },
    
    attachImageToMask(maskId, image) {
      // Привязываем изображение к маске
      this.maskImages[maskId] = image
      
      // Обновляем визуальную маску с изображением
      this.updateMaskWithImage(maskId)

      // Обновим превью соответствующей маски
      try {
        const mask = this.userMasks.find(m => m.id === maskId)
        if (mask) {
          this.$nextTick(() => { try { this.renderMaskPreview && this.renderMaskPreview(mask) } catch (e) {} })
        }
      } catch (e) {}
      
      // Обновляем 3D модель
      setTimeout(() => {
        this.update3DTexture()
      }, 100)
      
      console.log('🖼️ Изображение привязано к маске:', maskId, image.name)
    },
    
    updateMaskWithImage(maskId) {
      const mask = this.userMasks.find(m => m.id === maskId)
      const image = this.maskImages[maskId]
      
      if (mask && mask.visualPath && image) {
        // 1. Скрываем visualPath (он нужен только для обрезки)
        mask.visualPath.visible = false
        
        // 2. Создаем обводку ПЕРЕД созданием группы
        this.createMaskStroke(mask)
        
        // 3. Создаем группу из всех слоев (как в стикерах)
        this.createMaskGroup(mask)
        
        // 4. Создаем обрезанное изображение и добавляем в группу (как в стикерах)
        this.createClippedImageForMask(mask, mask.maskGroup)
        
        console.log('🎨 Маска обновлена с изображением:', image.name)
        this.enforceLayerOrder()
        
        // Обновляем 3D модель в боковой панели
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateSideMenu3D()
          }, 500)
        })
      }
    },
    
    detachImageFromMask(maskId) {
      // Отменяем привязку изображения к маске
      delete this.maskImages[maskId]
      
      // Восстанавливаем цветовую заливку и обводку
      const mask = this.userMasks.find(m => m.id === maskId)
      if (mask && mask.visualPath) {
        // Синхронизируем позицию visualPath с текущей позицией группы/обводки
        try {
          let targetCenter = null
          if (mask.maskGroup && mask.maskGroup.bounds) {
            targetCenter = mask.maskGroup.bounds.center
          } else if (mask.strokePath && mask.strokePath.bounds) {
            targetCenter = mask.strokePath.bounds.center
          }
          if (targetCenter) {
            mask.visualPath.position = new this.paperScope.Point(targetCenter.x, targetCenter.y)
          }
        } catch (e) {
          console.warn('⚠️ Не удалось синхронизировать позицию visualPath при отвязке изображения:', e)
        }
        
        // Удаляем слой изображения если есть
        if (mask.imageLayer) {
          mask.imageLayer.remove()
          mask.imageLayer = null
        }
        
        // Удаляем отдельную обводку если есть
        if (mask.strokePath) {
          mask.strokePath.remove()
          mask.strokePath = null
        }
        
        // Удаляем группу если есть
        if (mask.maskGroup) {
          mask.maskGroup.remove()
          mask.maskGroup = null
        }
        
        // Восстанавливаем простую цветовую заливку с обводкой
        mask.visualPath.fillColor = mask.fillColor
        mask.visualPath.strokeColor = mask.strokeColor
        mask.visualPath.strokeWidth = mask.strokeWidth
        
        // ВАЖНО: Делаем visualPath видимым и добавляем обратно на канвас
        mask.visualPath.visible = true
        if (!mask.visualPath.parent) {
          this.paperScope.project.activeLayer.addChild(mask.visualPath)
        }
        
        console.log('🎨 Восстановлена цветовая заливка маски:', maskId)
      }
      
      // Обновляем 3D модель
      setTimeout(() => {
        this.update3DTexture()
      }, 100)
      
      console.log('🖼️ Привязка изображения отменена для маски:', maskId)
      this.enforceLayerOrder()
    },
    
    createMaskStroke(mask) {
      console.log('🎨 [createMaskStroke] Создаем обводку для маски:', mask.id)
      console.log('🎨 [createMaskStroke] Исходные точки маски:', mask.points)
      
      // Удаляем предыдущую обводку если есть
      if (mask.strokePath) {
        mask.strokePath.remove()
      }
      
      // Создаем обводку поверх изображения, используя ТЕКУЩИЕ координаты visualPath (учитывают переносы)
      if (mask.strokeColor && mask.strokeWidth > 0) {
        const strokePath = new this.paperScope.Path()
        const sourceSegments = (mask.visualPath && mask.visualPath.segments && mask.visualPath.segments.length >= 3)
          ? mask.visualPath.segments.map(seg => seg.point)
          : (mask.points || []).map(p => new this.paperScope.Point(p.x, p.y))

        for (let i = 0; i < sourceSegments.length; i++) {
          const pt = sourceSegments[i]
          strokePath.add(new this.paperScope.Point(pt.x, pt.y))
        }

        strokePath.closed = true
        strokePath.strokeColor = mask.strokeColor
        strokePath.strokeWidth = mask.strokeWidth
        strokePath.fillColor = null
        mask.strokePath = strokePath
        try {
          const sc = strokePath.bounds.center
          const gc = mask.maskGroup?.globalMatrix?.transformPoint(mask.maskGroup.bounds.center)
          console.log('🎨 [createMaskStroke] centers', { strokeCenter: { x: sc.x, y: sc.y }, groupCenterGlobal: gc ? { x: gc.x, y: gc.y } : null })
        } catch (e) {}
      }
    },
    
    createImageLayer(mask, image) {
      // НЕ создаем слой изображения здесь - будем создавать обрезанное изображение отдельно
      console.log('🎨 Создание слоя изображения пропущено - будет создано обрезанное изображение')
      
      // Удаляем предыдущий слой изображения если есть
      if (mask.imageLayer) {
        mask.imageLayer.remove()
        mask.imageLayer = null
      }
    },
    
    createMaskGroup(mask) {
      // Удаляем предыдущую группу если есть
      if (mask.maskGroup) {
        mask.maskGroup.remove()
      }
      
      // Создаем группу (будет содержать только обрезанное изображение и обводку)
      const group = new this.paperScope.Group()
      
      // НЕ добавляем фон (visualPath) - он нужен только для обрезки
      
      // НЕ добавляем обводку сразу - добавим её поверх изображения позже
      console.log('🎨 [createMaskGroup] Создаем пустую группу (обводка будет добавлена поверх изображения)')
      
      console.log('🎨 [createMaskGroup] Группа создана с обводкой, будет заполнена обрезанным изображением')
      
      // Логируем границы группы
      console.log('🎨 [createMaskGroup] Границы группы:', group.bounds)
      console.log('🎨 [createMaskGroup] Размеры группы:', group.bounds.width, 'x', group.bounds.height)
      
      // Делаем группу перетаскиваемой
      group.onMouseDown = (event) => {
        this.startDraggingMask(mask, event)
        try {
          const gc = group.globalMatrix.transformPoint(group.bounds.center)
          const sc = mask.strokePath?.bounds?.center
          console.log('🟡 [MaskDrag] DOWN', { id: mask.id, groupCenterGlobal: { x: gc.x, y: gc.y }, strokeCenter: sc ? { x: sc.x, y: sc.y } : null })
        } catch (e) {}
      }
      
      group.onMouseDrag = (event) => {
        this.dragMask(mask, event)
        // Логи в процессе перетаскивания отключены, чтобы не зашумлять консоль
      }
      
      group.onMouseUp = (event) => {
        this.stopDraggingMask(mask, event)
        try {
          const gc = group.globalMatrix.transformPoint(group.bounds.center)
          const sc = mask.strokePath?.bounds?.center
          console.log('🟡 [MaskDrag] UP', { id: mask.id, groupCenterGlobal: { x: gc.x, y: gc.y }, strokeCenter: sc ? { x: sc.x, y: sc.y } : null })
        } catch (e) {}
      }
      
      // Сохраняем ссылку на группу
      mask.maskGroup = group
      // Обновляем центр маски от группы
      try {
        if (group && group.bounds && group.bounds.center) {
          mask.center = { x: group.bounds.center.x, y: group.bounds.center.y }
        }
      } catch (e) {}
      
      console.log('🎨 Группа сохранена в маске:', mask.id, 'с', group.children.length, 'элементами')
      
      // Добавляем группу на canvas
      this.paperScope.project.activeLayer.addChild(group)
      
      console.log('🎨 Создана группа для маски:', mask.id, 'слоев:', group.children.length)
      this.enforceLayerOrder()
    },
    
    // ========== Методы для перетаскивания масок ==========
    startDraggingMask(mask, event) {
      mask.isDragging = true
      mask.dragStart = event.point
      // console.log('🎭 Начато перетаскивание маски:', mask.id)
    },
    
    dragMask(mask, event) {
      if (mask.isDragging && mask.dragStart) {
        const delta = event.point.subtract(mask.dragStart)
        
        // Перемещаем всю группу (только один раз!)
        if (mask.maskGroup) {
          mask.maskGroup.position = mask.maskGroup.position.add(delta)
          // Лог позиции во время перетаскивания отключён
        }
        
        // Обновляем 3D модель в боковой панели
        this.updateSideMenu3D()
        
        // Обновляем точки маски для всех слоев
        for (let i = 0; i < mask.points.length; i++) {
          mask.points[i].x += delta.x
          mask.points[i].y += delta.y
        }
        
        // НЕ обновляем слои - они уже в группе и перемещаются вместе с ней
        // Лог служебного статуса отключён
        
        mask.dragStart = event.point
        // Лог процесса перетаскивания отключён
      }
    },
    
    stopDraggingMask(mask, event) {
      mask.isDragging = false
      mask.dragStart = null
      console.log('🎯 UP маски (финал):', mask.id)

      // После финального положения — денормализуем координаты mask.points по смещению группы
      try {
        if (mask.maskGroup && mask.maskGroup.bounds && mask.maskGroup.globalMatrix) {
          const groupCenterGlobal = mask.maskGroup.globalMatrix.transformPoint(mask.maskGroup.bounds.center)
          const prevCenter = (mask.center && typeof mask.center.x === 'number' && typeof mask.center.y === 'number')
            ? mask.center
            : groupCenterGlobal
          const dx = groupCenterGlobal.x - prevCenter.x
          const dy = groupCenterGlobal.y - prevCenter.y
          if ((Math.abs(dx) + Math.abs(dy)) > 0) {
            if (Array.isArray(mask.points)) {
              mask.points = mask.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
            }
            mask.center = { x: groupCenterGlobal.x, y: groupCenterGlobal.y }
          }
        } else if (mask.visualPath && mask.visualPath.bounds) {
          // Фолбэк: если нет группы, берём центр из visualPath
          mask.center = { x: mask.visualPath.bounds.center.x, y: mask.visualPath.bounds.center.y }
        }
      } catch (e) {
        // no-op
      }
      
      // Обновляем 3D модель в боковой панели
      this.updateSideMenu3D()
      
      // Фиксируем актуальный центр после перетаскивания
      try {
        const c = (mask.maskGroup?.bounds?.center) || (mask.strokePath?.bounds?.center) || (mask.visualPath?.bounds?.center)
        if (c) {
          mask.center = { x: c.x, y: c.y }
        }
      } catch (e) {}
    },
    
    updateMaskVisualPath(mask) {
      console.log('🔍 [updateMaskVisualPath] НЕ создаем новый visualPath при перетаскивании')
      console.log('🔍 [updateMaskVisualPath] visualPath нужен только для обрезки, не для отображения')
      
      // НЕ создаем новый visualPath - он нужен только для обрезки
      // и не должен отображаться на canvas
      return
    },
    
    updateMaskSettings(mask) {
      console.log('🎨 Обновлены настройки маски:', mask.id, {
        fillColor: mask.fillColor,
        strokeColor: mask.strokeColor,
        strokeWidth: mask.strokeWidth
      })
      
      // Если уже есть группа и обрезанное изображение — обновляем только обводку
      if (mask && mask.maskGroup && mask.imageLayer) {
        if (mask.strokePath) {
          mask.strokePath.strokeColor = mask.strokeColor
          mask.strokePath.strokeWidth = mask.strokeWidth
        } else {
          // если по какой-то причине обводка отсутствует — создаем и добавляем поверх
          this.createMaskStroke(mask)
          if (mask.strokePath && mask.maskGroup) {
            mask.maskGroup.addChild(mask.strokePath)
          }
        }
        // обновляем 3D текстуру и выходим без пересоздания растров
        setTimeout(() => {
          this.update3DTexture()
        }, 100)
        return
      }
      
      // Обновляем визуальную маску на canvas
      if (mask.visualPath) {
        // Если к маске привязано изображение, используем его как заливку
        if (this.maskImages[mask.id]) {
          const image = this.maskImages[mask.id]
          const img = new Image()
          img.onload = () => {
            const pattern = new this.paperScope.Raster(img)
            
            // Устанавливаем размер паттерна под размер маски
            const maskBounds = mask.visualPath.bounds
            pattern.position = maskBounds.center
            pattern.size = maskBounds.size
            
            mask.visualPath.fillColor = pattern
            
            // Создаем отдельный слой для обводки поверх изображения
            this.createMaskStroke(mask)
            
            // Создаем группу из маски, изображения и обводки
            this.createMaskGroup(mask)
          }
          img.src = image.url
        } else {
          // Обычная цветовая заливка
          mask.visualPath.fillColor = mask.fillColor
          mask.visualPath.strokeColor = mask.strokeColor
          mask.visualPath.strokeWidth = mask.strokeWidth
        }
      }
      
      
      // Обновляем изображение на 3D модели с небольшой задержкой
      // чтобы canvas успел обновиться
      setTimeout(() => {
        this.update3DTexture()
      }, 100)
    },
    
    deleteMask(maskId) {
      const index = this.userMasks.findIndex(mask => mask.id === maskId)
      if (index !== -1) {
        const mask = this.userMasks[index]
        
        // Удаляем все элементы маски с canvas
        if (mask.visualPath) {
          mask.visualPath.remove()
        }
        if (mask.maskGroup) {
          mask.maskGroup.remove()
        }
        if (mask.strokePath) {
          mask.strokePath.remove()
        }
        
        // Удаляем связанное изображение
        if (this.maskImages[maskId]) {
          delete this.maskImages[maskId]
        }
        
        this.userMasks.splice(index, 1)
        
        
        console.log('🗑️ Маска удалена:', maskId)
        
        // Обновляем порядок слоев и 3D модель
        this.enforceLayerOrder()
        this.update3DTexture()
        
        // Обновляем превью масок
        this.$nextTick(() => {
          try {
            this.refreshMaskPreviews && this.refreshMaskPreviews()
          } catch (e) {
            console.warn('Ошибка обновления превью масок:', e)
          }
        })
      }
    },
    
    clearMaskLine() {
      if (this.maskLine) {
        this.maskLine.remove()
        this.maskLine = null
      }
    },
    
    clearAllMaskElements() {
      // Очищаем все визуальные элементы маски
      this.clearMaskLine()
      
      // Удаляем предупреждение о пересечении
      this.hideIntersectionWarning()
      
      // Удаляем красную точку клика
      this.hideRedClickPoint()
      
      // Удаляем индикацию примагничивания
      this.hideMagneticSnap()
      
      // Удаляем все синие точки по сохраненным ссылкам
      this.maskPointElements.forEach(element => {
        if (element && element.remove) {
          element.remove()
        }
      })
      
      // Очищаем массив ссылок
      this.maskPointElements = []
    },
    
    clearAllMaskPoints() {
      // Удаляем все синие точки построения контура по сохраненным ссылкам
      this.maskPointElements.forEach(element => {
        if (element && element.remove) {
          element.remove()
        }
      })
      
      // Очищаем массив ссылок
      this.maskPointElements = []
      
      // Очищаем массив точек
      this.maskPoints = []
    },
    
    checkLineIntersection(newPoint) {
      // Проверяем пересечение нового отрезка с уже нарисованными
      if (this.maskPoints.length < 2) return false
      
      console.log('🔍 [checkLineIntersection] Проверяем пересечение для точки:', newPoint)
      console.log('🔍 [checkLineIntersection] Текущие точки маски:', this.maskPoints)
      
      const lastPoint = this.maskPoints[this.maskPoints.length - 1]
      if (!lastPoint) {
        console.log('❌ [checkLineIntersection] Последняя точка маски не найдена')
        return false
      }
      
      const newSegment = {
        start: lastPoint,
        end: newPoint
      }
      
      console.log('🔍 [checkLineIntersection] Новый сегмент:', newSegment)
      
      // Проверяем пересечение с каждым существующим отрезком
      for (let i = 0; i < this.maskPoints.length - 1; i++) {
        const startPoint = this.maskPoints[i]
        const endPoint = this.maskPoints[i + 1]
        
        if (!startPoint || !endPoint) {
          console.log('❌ [checkLineIntersection] Пропускаем сегмент с отсутствующими точками:', { i, startPoint, endPoint })
          continue
        }
        
        const existingSegment = {
          start: startPoint,
          end: endPoint
        }
        
        console.log('🔍 [checkLineIntersection] Существующий сегмент:', existingSegment)
        
        // Пропускаем соседние отрезки
        if (i === this.maskPoints.length - 2) continue
        
        const intersection = this.getLineIntersection(newSegment, existingSegment)
        if (intersection) {
          console.log('🚫 Обнаружено пересечение!', intersection)
          return intersection
        }
      }
      
      return false
    },
    
    getLineIntersection(seg1, seg2) {
      // Алгоритм проверки пересечения двух отрезков
      console.log('🔍 [getLineIntersection] Проверяем пересечение:', { seg1, seg2 })
      
      // Проверяем, что все точки существуют
      if (!seg1 || !seg2 || !seg1.start || !seg1.end || !seg2.start || !seg2.end) {
        console.log('❌ [getLineIntersection] Отсутствуют необходимые точки:', {
          seg1Exists: !!seg1,
          seg2Exists: !!seg2,
          seg1Start: !!seg1?.start,
          seg1End: !!seg1?.end,
          seg2Start: !!seg2?.start,
          seg2End: !!seg2?.end
        })
        return false
      }
      
      const x1 = seg1.start.x, y1 = seg1.start.y
      const x2 = seg1.end.x, y2 = seg1.end.y
      const x3 = seg2.start.x, y3 = seg2.start.y
      const x4 = seg2.end.x, y4 = seg2.end.y
      
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(denom) < 1e-10) return false // Параллельные линии
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
      
      // Проверяем, что пересечение находится внутри обоих отрезков
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        }
      }
      
      return false
    },
    
    showIntersectionWarning(intersection) {
      // Создаем красную точку предупреждения
      if (this.paperScope && this.paperScope.project) {
        const warningPoint = new this.paperScope.Path.Circle({
          center: new this.paperScope.Point(intersection.x, intersection.y),
          radius: 8,
          fillColor: '#ff0000',
          strokeColor: '#ffffff',
          strokeWidth: 2
        })
        
        this.paperScope.project.activeLayer.addChild(warningPoint)
        
        // Сохраняем ссылку для удаления
        this.intersectionWarning = warningPoint
        
        // Автоматически удаляем через 2 секунды
        setTimeout(() => {
          this.hideIntersectionWarning()
        }, 2000)
      }
    },
    
    hideIntersectionWarning() {
      if (this.intersectionWarning) {
        this.intersectionWarning.remove()
        this.intersectionWarning = null
      }
    },
    
    showMagneticSnap(point) {
      // Удаляем предыдущую индикацию
      this.hideMagneticSnap()
      
      // Создаем зеленый круг вокруг первой точки
      const circle = new this.paperScope.Path.Circle({
        center: point,
        radius: 15,
        strokeColor: '#00ff00',
        strokeWidth: 2,
        dashArray: [5, 5]
      })
      
      // Добавляем на canvas
      this.paperScope.project.activeLayer.addChild(circle)
      
      // Сохраняем ссылку
      this.magneticSnapIndicator = circle
      
      console.log('🧲 Показана индикация примагничивания')
    },
    
    hideMagneticSnap() {
      if (this.magneticSnapIndicator) {
        this.magneticSnapIndicator.remove()
        this.magneticSnapIndicator = null
      }
    },
    
    // Создание обрезанного изображения по принципу стикеров
    createClippedImageForMask(mask, group) {
      const image = this.maskImages[mask.id]
      if (!image) {
        console.log('⚠️ Изображение не найдено для маски:', mask.id)
        return
      }
      
      console.log('🎨 Создаем обрезанное изображение для маски:', mask.id)
      
      // Создаем растр из изображения
      const raster = new this.paperScope.Raster(image.url)
      raster.visible = false // Скрываем оригинальный растр
      
      raster.onLoad = () => {
        console.log(`🖼️ Растр загружен: ${image.name}, размеры: ${raster.image.width}x${raster.image.height}`)
        
        // Глобальные точки текущего контура (strokePath приоритетно)
        const segs = (mask.strokePath && mask.strokePath.segments && mask.strokePath.segments.length >= 3)
          ? mask.strokePath.segments.map(s => { try { const p = mask.strokePath.globalMatrix.transformPoint(s.point); return { x: p.x, y: p.y } } catch (e) { return { x: s.point.x, y: s.point.y } } })
          : (mask.visualPath && mask.visualPath.segments && mask.visualPath.segments.length >= 3)
            ? mask.visualPath.segments.map(s => { try { const p = mask.visualPath.globalMatrix.transformPoint(s.point); return { x: p.x, y: p.y } } catch (e) { return { x: s.point.x, y: s.point.y } } })
            : (mask.points || [])
        if (segs.length < 3) return
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const p of segs) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y }
        const width = Math.max(1, Math.round(maxX - minX))
        const height = Math.max(1, Math.round(maxY - minY))
        const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
        
        // Создаем временный canvas для обрезки изображения
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = width
        tempCanvas.height = height
        tempCtx.clearRect(0, 0, width, height)
        
        // Клип по глобальным точкам, приведенным к локальным координатам tempCanvas
        tempCtx.save()
        tempCtx.beginPath()
        tempCtx.moveTo(segs[0].x - minX, segs[0].y - minY)
        for (let i = 1; i < segs.length; i++) {
          tempCtx.lineTo(segs[i].x - minX, segs[i].y - minY)
        }
        tempCtx.closePath()
        tempCtx.clip()
        
        // Рисуем изображение с cover
        const imgWidth = raster.image.width
        const imgHeight = raster.image.height
        const scaleX = width / imgWidth
        const scaleY = height / imgHeight
        const coverScale = Math.max(scaleX, scaleY)
        const drawW = imgWidth * coverScale
        const drawH = imgHeight * coverScale
        const dx = (width - drawW) / 2
        const dy = (height - drawH) / 2
        tempCtx.drawImage(raster.image, dx, dy, drawW, drawH)
        tempCtx.restore()
        
        // Создаем новый растр и позиционируем по глобальному центру
        const dataURL = tempCanvas.toDataURL('image/png')
        const clippedRaster = new this.paperScope.Raster(dataURL)
        clippedRaster.onLoad = () => {
          clippedRaster.position = new this.paperScope.Point(center.x, center.y)
          if (mask.imageLayer) mask.imageLayer.remove()
          mask.imageLayer = clippedRaster
          if (group && group.parent) {
            group.addChild(clippedRaster)
            if (mask.strokePath) group.addChild(mask.strokePath)
            if (mask.visualPath && mask.visualPath.parent) mask.visualPath.remove()
          } else {
            this.paperScope.project.activeLayer.addChild(clippedRaster)
          }
        }
      }
    },
    // Создание обрезанного изображения при обновлении
    createClippedImageForMaskUpdate(mask, imagePath) {
      const image = this.maskImages[mask.id]
      if (!image) {
        console.log('⚠️ Изображение не найдено для маски при обновлении:', mask.id)
        return
      }
      
      console.log('🎨 Создаем обрезанное изображение при обновлении для маски:', mask.id)
      
      // Создаем растр из изображения
      const raster = new this.paperScope.Raster(image.url)
      raster.visible = false // Скрываем оригинальный растр
      
      raster.onLoad = () => {
        console.log(`🖼️ Растр загружен при обновлении: ${image.name}, размеры: ${raster.image.width}x${raster.image.height}`)
        
        // Создаем временный canvas для обрезки изображения
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Получаем размеры маски
        const maskBounds = mask.visualPath.bounds
        console.log(`📐 Размеры маски при обновлении: ${maskBounds.width}x${maskBounds.height}`)
        
        tempCanvas.width = maskBounds.width
        tempCanvas.height = maskBounds.height
        
        // Очищаем canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
        
        // Создаем путь маски на canvas
        tempCtx.save()
        tempCtx.beginPath()
        
        // Рисуем путь маски (используем сегменты)
        if (mask.visualPath.segments && mask.visualPath.segments.length > 0) {
          console.log('🔍 Сегменты пути при обновлении:', mask.visualPath.segments.length)
          
          // Первая точка
          const firstPoint = mask.visualPath.segments[0].point
          const relativeFirstPoint = new this.paperScope.Point(
            firstPoint.x - maskBounds.x,
            firstPoint.y - maskBounds.y
          )
          tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
          
          // Остальные точки
          for (let i = 1; i < mask.visualPath.segments.length; i++) {
            const segment = mask.visualPath.segments[i]
            const relativePoint = new this.paperScope.Point(
              segment.point.x - maskBounds.x,
              segment.point.y - maskBounds.y
            )
            tempCtx.lineTo(relativePoint.x, relativePoint.y)
          }
        }
        
        tempCtx.closePath()
        tempCtx.clip()
        
        // Рисуем изображение на canvas с сохранением пропорций
        const imgWidth = raster.image.width
        const imgHeight = raster.image.height
        const canvasWidth = maskBounds.width
        const canvasHeight = maskBounds.height
        
        // Вычисляем масштаб для заполнения всей площади
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
        
        // Рисуем изображение
        tempCtx.drawImage(
          raster.image,
          offsetX,
          offsetY,
          scaledWidth,
          scaledHeight
        )
        
        tempCtx.restore()
        
        // Создаем новый растр из обрезанного изображения
        const dataURL = tempCanvas.toDataURL('image/png')
        console.log(`✂️ Создан обрезанный растр при обновлении, размер dataURL: ${dataURL.length} символов`)
        const clippedRaster = new this.paperScope.Raster(dataURL)
        
        clippedRaster.onLoad = () => {
          console.log(`✅ Обрезанный растр загружен при обновлении, позиционируем в центре маски`)
          
          // Позиционируем обрезанный растр в центре маски
          clippedRaster.position = maskBounds.center
          
          // Заменяем старое изображение на обрезанное
          if (mask.imageLayer) {
            mask.imageLayer.remove()
          }
          mask.imageLayer = clippedRaster
          
          console.log('🎨 Обрезанное изображение обновлено')
        }
      }
    },
    
    showRedClickPoint(point) {
      // Удаляем предыдущую красную точку
      this.hideRedClickPoint()
      
      // Создаем красную квадратную точку клика (4x4 пикселя как синие)
      if (this.paperScope && this.paperScope.project) {
        const redPoint = new this.paperScope.Path.Rectangle({
          point: [point.x - 2, point.y - 2],
          size: [4, 4]
        })
        
        redPoint.fillColor = '#ff0000'
        redPoint.strokeColor = '#cc0000'
        redPoint.strokeWidth = 1
        
        this.paperScope.project.activeLayer.addChild(redPoint)
        this.redClickPoint = redPoint
        
        // Удаляем сразу после следующего клика или движения мыши
        // Не оставляем висящими на холсте
      }
    },
    
    hideRedClickPoint() {
      if (this.redClickPoint) {
        this.redClickPoint.remove()
        this.redClickPoint = null
      }
    },
    
    showIntersectionCross(intersection) {
      // Удаляем предыдущий крестик
      this.hideIntersectionWarning()
      
      if (this.paperScope && this.paperScope.project) {
        const center = new this.paperScope.Point(intersection.x, intersection.y)
        const size = 8
        
        // Создаем крестик повернутый на 45 градусов (диагональный)
        const cross = new this.paperScope.Group()
        
        // Диагональная линия крестика (слева-сверху вправо-вниз)
        const line1 = new this.paperScope.Path.Line({
          from: new this.paperScope.Point(center.x - size, center.y - size),
          to: new this.paperScope.Point(center.x + size, center.y + size),
          strokeColor: '#ff0000',
          strokeWidth: 3
        })
        
        // Диагональная линия крестика (слева-снизу вправо-вверх)
        const line2 = new this.paperScope.Path.Line({
          from: new this.paperScope.Point(center.x - size, center.y + size),
          to: new this.paperScope.Point(center.x + size, center.y - size),
          strokeColor: '#ff0000',
          strokeWidth: 3
        })
        
        cross.addChild(line1)
        cross.addChild(line2)
        
        this.paperScope.project.activeLayer.addChild(cross)
        this.intersectionWarning = cross
        
        // Удаляем сразу после следующего клика или движения мыши
        // Не оставляем висящими на холсте
      }
    },
    
    removeLastMaskPoint() {
      // Удаляем последнюю визуальную точку с canvas
      if (this.paperScope && this.paperScope.project) {
        const items = this.paperScope.project.activeLayer.children
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i]
          if (item.fillColor && item.fillColor.toCSS() === '#0066cc') {
            item.remove()
            break // Удаляем только одну точку
          }
        }
      }
    },
    
  }
}
</script>

<style lang="scss" scoped>
/* Палитра цветов 8x8 как на странице Сетки */
.color-picker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.color-picker-dialog {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 24px);
  grid-auto-rows: 24px;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #cfd4da;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
}

.color-swatch:hover {
  transform: scale(1.06);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  border-color: #adb5bd;
}

.color-chooser{
  box-shadow: 2px 2px 6px 0 rgba(0,0,0,.2);
}

/* Горизонтальная шкала выбора значений (как на странице Сетки) */
.control-scale {
  display: flex;
  width: 100%;
  height: 32px; /* по требованию */
  gap: 1px;
}

.control-scale .control-cell {
  flex: 1;
  width: 20px;
  height: 16px;
  border: none;
  border-radius: 3px;
  background: #efefef;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.control-scale .control-cell:hover {
  background: #87ceeb;
  border-color: initial;
}

.control-scale .control-cell.selected {
  background: #87ceeb; /* голубой */
  border-color: rgb(13, 110, 253);
}
.mug-comic-page {
  // Пустой блок для scope
}

/* Стили из StickerManiaPage */
.page-title {
  color: #495057;
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

.comic-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  box-shadow: 4px 4px 12px 0 rgba(255,255,255,.15);
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

/* Стили для всех кнопок над основным канвасом */
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

.canvas-button * {
  color: white !important;
}

.canvas-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.text-button {
  width: auto;
  margin-left: 20px;
}

/* Панель инструментов */
.tools-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  height: 48px; /* Та же высота, что и кнопка "Текст" */
}

.tool-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  border-radius: 6px !important;
  background: white !important;
  color: #495057 !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease, color 0.2s ease !important;
  font-size: 18px !important;
}

.tool-button:hover:not(:disabled) {
  background: rgb(13, 110, 253) !important;
  color: white !important;
}

.tool-button.active {
  background: rgb(13, 110, 253) !important;
  color: white !important;
}

.tool-button:disabled {
  background: #e9ecef !important;
  color: #adb5bd !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
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
  color: rgb(13, 110, 253);
  background-color: transparent;
  border-bottom-color: #dee2e6;
}

.nav-tabs .nav-link.active {
  color: rgb(13, 110, 253);
  background-color: transparent;
  border-bottom-color: rgb(13, 110, 253);
}

.nav-tabs .nav-link i {
  font-size: 1.1rem;
}

.card {
  border-radius: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
}

.card-body {
  padding: 0;
}

.card-body.p-0 {
  padding: 0 !important;
}

.btn-primary {
  background-color: #0d70fd;
  border-color: transparent;
  
  &:hover {
    background-color: #2a7ff8;
    border-color: transparent;
  }
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

.form-check-input:checked {
  background-color: #016527;
  border-color: #016527;
}
.preview-contaner{
  width: fit-content;
}

/* Отступ для строки табов */
.tabs-row {
  margin-top: 0.5rem;
}

/* Стили вкладки "Тексты" (как в StickerMania) */
.text-layers-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
}
.text-layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.text-layer-item.dragging {
  opacity: 0.7;
  border-style: dashed;
}
.text-layer-item.drag-over {
  background: #eef6ff;
  border-color: #b6d4fe;
}
.layer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.drag-handle {
  width: 18px;
  color: #6c757d;
  cursor: grab;
  display: flex;
  align-items: center;
}
.layer-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.layer-name {
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.layer-meta {
  font-size: 12px;
  color: #6c757d;
}
.layer-number {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
}
.layer-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* Адаптивность */
@media (max-width: 767.98px) {
  .page-title {
    font-size: 1.5rem;
  }

  .canvas-button {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
}

@media (max-width: 575.98px) {
  .page-title {
    font-size: 1.3rem;
  }
}

/* Стили для масок */
.user-masks-container {
  min-height: 200px;
}

.masks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.mask-item-full {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  padding: 15px;
}

.mask-item-full:hover {
  border-color: #016527;
  box-shadow: 0 2px 8px rgba(1, 101, 39, 0.1);
}

.mask-item-full.active {
  border-color: #016527;
  background: #f8f9fa;
}

.mask-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.mask-preview {
  width: 80px;
  height: 50px;
  margin-right: 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.mask-preview canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mask-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mask-name {
  font-weight: 500;
  color: #495057;
  font-size: 1.1rem;
}

.mask-actions {
  display: flex;
  gap: 5px;
}

.mask-actions .btn {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.mask-settings {
  border-top: 1px solid #dee2e6;
  padding-top: 15px;
}
.mask-settings .form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 5px;
}

.mask-settings .form-control-sm {
  font-size: 0.8rem;
}

.mask-settings .form-range-sm {
  height: 0.5rem;
}

/* Правая панель настроек */
.page-layout {
  display: flex;
  position: relative;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1050;
  pointer-events: auto;
  background: #fff;
  box-shadow: 0 0 12px 0 rgba(0,0,0,.15);
  transition: all 0.3s ease;
}

.settings-panel-content {
  position: relative;
  width: 280px;
  background: #fff;
  color: #333;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  height: 100vh;
}

.settings-panel.collapsed .settings-panel-content {
  width: 52px;
}

.settings-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
  background: #f8f9fa;
}

.settings-panel-title {
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  margin-top: 11px;
}

.settings-panel-title i {
  font-size: 18px;
  margin-right: 8px;
}

.settings-text {
  transition: opacity 0.3s ease;
}

.settings-panel.collapsed .settings-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.btn-toggle {
  background: transparent;
  color: #333;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  position: relative;
  left: -5px;
}

.btn-toggle:hover {
  color: #222;
}

.btn-toggle i {
  font-size: 16px;
}

.settings-panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Вертикальные табы */
.vertical-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vertical-tabs-nav {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.vertical-tab-button {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.vertical-tab-button i {
  font-size: 16px;
  margin-right: 8px;
  width: 16px;
  flex-shrink: 0;
}

.vertical-tab-button .tab-text {
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.vertical-tab-button:hover {
  background: rgba(0,0,0,0.05);
  color: #333;
}

.vertical-tab-button.active {
  background: #e3f2fd;
  color: #1976d2;
  border-right: 3px solid #1976d2;
}

.settings-panel.collapsed .vertical-tab-button {
  padding: 12px 8px;
  justify-content: center;
}

.settings-panel.collapsed .vertical-tab-button .tab-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.settings-panel.collapsed .vertical-tab-button i {
  margin-right: 0;
}

.vertical-tabs-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tab-content-panel {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-panel.collapsed .vertical-tabs-content {
  display: none;
}

.placeholder-content {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Стили для текстовых слоев */
.text-layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s ease;
}

.text-layer-item:hover {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.text-layer-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.text-layer-item.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.layer-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  margin-right: 12px;
  color: #999;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.layer-details {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.layer-number {
  font-size: 11px;
  color: #999;
}

.layer-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.layer-actions .btn {
  padding: 4px 8px;
  font-size: 12px;
}

/* Стили для пользовательских масок */
.user-masks-container {
  width: 100%;
}

.masks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mask-item-full {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-direction: column;
  position: relative;
}

.mask-item-full:hover {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.mask-item-full.active {
  border-color: #007bff;
  background: #e3f2fd;
}

.mask-item-full.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.mask-item-full.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.mask-header {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.mask-preview {
  margin-right: 12px;
  flex-shrink: 0;
  background: #fff;
}

.mask-preview canvas {
  border-radius: 4px;
}

.mask-info {
  flex: 1;
  min-width: 0;
}

.mask-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mask-meta {
  font-size: 12px;
  color: #666;
}

.mask-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  position: absolute;
  right: 30px;
  background: #fff;
  right: 12px;
  top: 19px;
}

.mask-actions .btn {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  background: #000;
  color: #fff;
  width: 32px;
  height: 32px;
}

/* Стили для загруженных изображений */
.uploaded-images .row {
  margin: 0 -4px;
}

.uploaded-images .col-6 {
  padding: 0 4px;
  margin-bottom: 12px;
}.color-chooser{
  box-shadow: 2px 2px 6px 0 rgba(0,0,0,.2);
}
.settings-subheader{
  padding: 6px;
  background: #d5f2d2;
  width: 100%;
  text-align: center;
  color: #fff;
  margin-bottom: 10px;
  border-radius: 4px;
  margin-top: 10px;
  color: #000;
  font-size: 18px;
}
.mask-item-full active{
  display: flex;
  flex-direction: column !important;
  align-items: flex-start;
  position: relative;
}
.top-header{
  position: fixed;
  width: 100%;
  background: #fff;
  left: 0;
  top: 0;
  text-align: center;
  box-shadow: 0 0 10px 0 rgba(0,0,0,.1);
}
.main-part{
  position: relative;
  padding-top: 110px;
}
</style>