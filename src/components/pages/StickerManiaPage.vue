<template>
  <div class="sticker-mania-page">
    <!-- Лайтбокс выбора стикеров -->
    <StickerSelectionModal
      :is-visible="showSelectionModal"
      :sticker-masks="stickerMasks"
      @close="closeSelectionModal"
      @finish="handleSelectionFinish"
    />
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
            <div class="card-body" style="padding-left: 10px;">
              <div class="row align-items-center">
                <!-- Кнопка генерации стикеров -->
                <div class="col" style="padding: 0;">
                  <button 
                    @click="handleGenerateClick" 
                    class="btn btn-primary gen-sticker-button-1"
                    :disabled="isLoading"
                    style="background-color: #007bff; border-color: #007bff;"
                  >
                    <i class="bi bi-lightning-fill me-2"></i>
                    {{ isLoading ? 'Генерация...' : 'Генерировать стикеры' }}
                  </button>
                </div>
                
                <div class="col" style="padding: 0;">
                  <TextManager 
                    ref="textManager"
                    :canvas="$refs.testCanvas"
                    :paper-scope="paperScope"
                    @text-dialog-opened="onTextDialogOpened"
                    @text-dialog-closed="onTextDialogClosed"
                    @text-applied="onTextApplied"
                  />
                </div>
                
                <!-- Кнопка сохранения -->
                <div class="col" style="padding: 0;">
                  <HighQualitySaveButton
                    :save-function="saveCanvasForPrint"
                    :save-params="{}"
                    button-text="Сохранить в высоком качестве"
                    size="medium"
                    variant="primary"
                    @save-success="onSaveSuccess"
                    @save-error="onSaveError"
                    @show-notification="showNotification"
                  />
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
                  ref="testCanvas"
                  class="test-canvas"
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
                :source-canvas="$refs.testCanvas"
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
                :class="{ 'active': activeTab === 'text' }"
                id="text-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#text" 
                type="button" 
                role="tab" 
                aria-controls="text" 
                aria-selected="activeTab === 'text'"
                @click="activeTab = 'text'"
              >
                <i class="bi bi-type me-2"></i>
                Тексты
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
            
            <!-- Вкладка "Стикеры" - показывается только после генерации стикеров -->
            <li class="nav-item" role="presentation" v-if="stickers.length > 0">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'stickers' }"
                id="stickers-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#stickers" 
                type="button" 
                role="tab" 
                aria-controls="stickers" 
                aria-selected="activeTab === 'stickers'"
                @click="switchToStickersTab()"
              >
                <i class="bi bi-layer-group me-2"></i>
                Стикеры ({{ stickers.length }})
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
                              @change="generateOptimalStickers"
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

        <!-- Таб "Тексты" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'text' }" id="text" role="tabpanel" aria-labelledby="text-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Добавленные тексты</h5>
                </div>
                <div class="card-body">
                  <div v-if="createdTexts.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-type display-4 mb-3"></i>
                    <p>Пока не добавлено ни одного текста</p>
                    <p class="small">Нажмите на кнопку "Текст" над основным канвасом, затем кликните на канвас для добавления текста</p>
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
                        v-for="(text, index) in createdTexts" 
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
                            <div class="layer-name">{{ text.text || 'Пустой текст' }}</div>
                            <div class="layer-meta">
                            Шрифт: {{ text.font || 'Arial' }} | 
                            Размер: {{ text.fontSize || 16 }}px |
                            <span v-if="text.color">Цвет: {{ text.color }}</span>
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
                            @click="editTextLayer(text.layerIndex || (index + 1))"
                            title="Редактировать"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary btn-sm"
                            @click="toggleTextLayerVisibility(text.layerIndex || (index + 1))"
                            title="Показать/скрыть"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-outline-danger btn-sm"
                            @click="removeTextLayer(text.layerIndex || (index + 1))"
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
                          @change="generateOptimalStickers"
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
                          @input="updateStickerStyles"
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
                          @input="updateStickerStyles"
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
                          @input="updateStickerStyles"
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
                          @input="updateStickerStyles"
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
                          @input="updateStickerStyles"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Таб "Стикеры" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'stickers' }" id="stickers" role="tabpanel" aria-labelledby="stickers-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-layer-group me-2"></i>
                    Управление слоями стикеров
                  </h5>
      </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-12">
                      <p class="text-muted mb-3">
                        Стикеры расположены в порядке слоев (сверху вниз). Первый в списке = самый верхний слой. 
                        <i class="bi bi-info-circle me-1"></i>
                        Перетаскивайте слои для изменения их порядка или двойной клик на стикер на канвасе.
                      </p>
                      
                      <!-- Список слоев стикеров -->
                      <div class="sticker-layers-list">
                        <div 
                          v-for="(sticker, index) in stickers" 
                          :key="index"
                          class="sticker-layer-item"
                          :class="{ 
                            'active': selectedStickerIndex === index,
                            'dragging': draggedIndex === index,
                            'drag-over': dragOverIndex === index
                          }"
                          draggable="true"
                          @click="selectSticker(index)"
                          @dragstart="handleDragStart(index, $event)"
                          @dragend="handleDragEnd"
                          @dragover="handleDragOver(index, $event)"
                          @dragleave="handleDragLeave"
                          @drop="handleDrop(index, $event)"
                        >
                          <div class="layer-info">
                            <!-- Иконка перетаскивания -->
                            <div class="drag-handle">
                              <i class="bi bi-grip-vertical"></i>
                            </div>
                            
                            <!-- Превью стикера -->
                            <div class="sticker-preview">
                              <img 
                                v-if="stickerPreviews[`${sticker.mask}_${sticker.image}_${index}`]"
                                :src="stickerPreviews[`${sticker.mask}_${sticker.image}_${index}`]"
                                :alt="`Превью ${sticker.mask}`"
                                class="preview-image"
                                @error="handlePreviewError(index)"
                              />
                              <div 
                                v-else 
                                class="preview-placeholder"
                                :title="`Генерация превью для ${sticker.mask}...`"
                              >
                                <i class="bi bi-image"></i>
                              </div>
                            </div>
                            <div class="layer-number">{{ sticker.originalNumber }}</div>
                            <div class="layer-details">
                              <div class="layer-name">Стикер {{ sticker.originalNumber }}</div>
                              <div class="layer-position">
                                Позиция: ({{ Math.round(sticker.group.position.x) }}, {{ Math.round(sticker.group.position.y) }})
                              </div>
                            </div>
                          </div>
                          <div class="layer-actions">
                            <button 
                              class="btn btn-sm btn-outline-danger"
                              @click.stop="deleteSticker(index)"
                              title="Удалить стикер"
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
    </div>
  </div>
</template>

<script>
import paper from 'paper'
import { markRaw } from 'vue'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import StickerSelectionModal from '../StickerSelectionModal.vue'
import TextManager from '../TextManager.vue'
import HighQualitySaveButton from '../common/HighQualitySaveButton.vue'
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
  components: {
    ThreeDRenderer,
    StickerSelectionModal,
    TextManager,
    HighQualitySaveButton
  },
  data() {
    return {
      // Paper.js
      paperScope: null,
      maskItems: {},
      whiteOverlayLayer: null,
      isLoading: false,
      activeTab: 'shapes',
      showSelectionModal: false,
      isFirstTime: true,
      texts: [],
      textItems: [], // Массив для отслеживания текстовых элементов на канвасе
      htmlTextElements: [], // Массив для отслеживания HTML текстовых элементов
      activeTextElement: null, // Активный текстовый элемент для редактирования
      textControlStates: {}, // Состояния управления для каждого текста
      textBackgroundMap: {}, // ГЛОБАЛЬНАЯ КАРТА: textItem.id -> background
      createdTexts: [], // Массив добавленных текстов для отображения во вкладке "Тексты"
      
      // Система слоев для текстов
      textLayers: [], // Массив слоев с текстами
      nextLayerIndex: 200, // Следующий индекс слоя (кратный 10, начиная с 200)
      
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
      strokeWidth: 8, // Проценты (0-20)
      shadowBlur: 2, // Проценты (0-50)
      shadowOffsetX: 5, // Проценты (-50 до +50)
      shadowOffsetY: 5, // Проценты (-50 до +50)
      shadowOpacity: 40, // Проценты (0-100)
      
      // Управление стикерами
      selectedStickerIndex: -1,
      selectedItem: null, // Выбранный объект (стикер или текст)
      selectedItemType: null, // Тип выбранного объекта: 'sticker' или 'text'
      
      // Стикеры
      stickers: [],
      stickerPreviews: {}, // Хранилище превью стикеров
      coveragePercentage: 0,
      
      // Перетаскивание слоев
      draggedIndex: -1,
      dragOverIndex: -1,
      // Перетаскивание текстовых слоев
      draggedTextIndex: -1,
      dragOverTextIndex: -1,
      // Настройки генерации
      minStickerSize: 50, // Минимальный размер стикера (50% от базового)
      maxStickerSize: 150, // Максимальный размер стикера (150% от базового)
      baseStickerSize: 100, // Базовый размер стикера
      targetCoverage: 100, // Целевое покрытие в процентах (100%)
      maxIterations: 5000, // Максимальное количество попыток размещения
      overlapThreshold: 0.05, // Максимальное перекрытие (5%) - уменьшаем для более плотного размещения
      
      editingLayerIndex: null, // Индекс слоя, который редактируется
      previewUpdateTimeout: null, // Таймаут для debounce обновления превью
      tailUpdateTimeout: null, // Таймаут для debounce обновления хвоста
      previewUpdateFrame: null, // requestAnimationFrame для throttling обновления превью
      
      // Свойства для перетаскивания удалены - Paper.js управляет перетаскиванием автоматически
    }
  },
  computed: {
    
    // Размеры для превью канваса - логические размеры (без HiDPI)
    previewCanvasWidth() {
      if (!this.$refs.testCanvas) return 400
      // Используем логические размеры (стилевые), а не физические (canvas.width)
      const canvas = this.$refs.testCanvas
      const containerWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 400
      return containerWidth
    },
    previewCanvasHeight() {
      if (!this.$refs.testCanvas) return 300
      // Используем логические размеры (стилевые), а не физические (canvas.height)
      const canvas = this.$refs.testCanvas
      const containerWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 400
      const containerHeight = (containerWidth * 9) / 19
      return containerHeight
    }
  },
  mounted() {
    console.log('🚀 Компонент смонтирован')
      this.$nextTick(() => {
      console.log('🔄 DOM обновлен')
      // Даем больше времени на рендеринг DOM
      setTimeout(async () => {
        console.log('⏰ Таймаут истек, начинаем инициализацию')
        
        // Проверяем, что канвас существует
        const canvas = this.$refs.testCanvas
        if (!canvas) {
          console.log('❌ Канвас не найден после таймаута')
          return
        }
        console.log('✅ Канвас найден:', canvas)
        
        // Инициализируем Paper.js
        await this.initPaper()
        // Three.js теперь инициализируется через компонент ThreeDRenderer
      }, 200)
    })
  },
  beforeUnmount() {
    // Three.js ресурсы очищаются автоматически в компоненте ThreeDRenderer
    
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleCanvasResize)
    // Очищаем все обработчики resize
    window.removeEventListener('resize', () => {})
  },
  methods: {
    // Обработчики событий для кнопки сохранения
    onSaveSuccess(result) {
      console.log('✅ Сохранение завершено успешно:', result)
      this.showNotification({
        type: 'success',
        message: 'Файл успешно сохранен в высоком качестве!'
      })
    },
    
    onSaveError(error) {
      console.error('❌ Ошибка при сохранении:', error)
      this.showNotification({
        type: 'error',
        message: 'Ошибка при сохранении файла. Попробуйте еще раз.'
      })
    },
    
    showNotification(notification) {
      // Здесь можно добавить логику показа уведомлений
      // Например, через toast или другой компонент уведомлений
      console.log('📢 Уведомление:', notification)
      
      // Простое уведомление через alert (временное решение)
      if (notification.type === 'success') {
        alert('✅ ' + notification.message)
      } else if (notification.type === 'error') {
        alert('❌ ' + notification.message)
      }
    },

    // Рассчитывает умные bounds для области перетаскивания с учетом хвоста
    calculateSmartBounds(originalBounds, textData, mode) {
      const basePadding = 3 // Уменьшенный базовый отступ от обводки
      
      // Для режимов без хвоста используем минимальный отступ
      if (mode === 'standard' || mode === 'imageText') {
        // Используем минимальный отступ (сокращаем в 2 раза)
        return originalBounds.expand(basePadding)
      }
      
      // Для режимов с хвостом (conversation, thoughts)
      if (mode === 'conversation' || mode === 'thoughts') {
        const tailSize = Number(textData.tailSize) / 100
        const tailAngle = Number(textData.tailAngle)
        
        // Рассчитываем длину хвоста (более консервативно)
        const minDimension = Math.min(originalBounds.width, originalBounds.height)
        const tailLength = minDimension * 0.6 * tailSize // Уменьшенный коэффициент
        
        // Рассчитываем координаты крайней точки хвоста
        const centerX = originalBounds.center.x
        const centerY = originalBounds.center.y
        
        // Угол в радианах
        const angleRad = (tailAngle * Math.PI) / 180
        
        // Координаты крайней точки хвоста
        const tailEndX = centerX + Math.cos(angleRad) * tailLength
        const tailEndY = centerY + Math.sin(angleRad) * tailLength
        
        // Определяем, в какую сторону нужно расширить bounds
        let leftExpansion = basePadding
        let rightExpansion = basePadding
        let topExpansion = basePadding
        let bottomExpansion = basePadding
        
        // Если хвост выходит за границы, добавляем только необходимое расширение
        if (tailEndX < originalBounds.left) {
          leftExpansion = Math.min(Math.abs(tailEndX - originalBounds.left) + basePadding, 20) // Ограничиваем максимум
        }
        
        if (tailEndX > originalBounds.right) {
          rightExpansion = Math.min(Math.abs(tailEndX - originalBounds.right) + basePadding, 20)
        }
        
        if (tailEndY < originalBounds.top) {
          topExpansion = Math.min(Math.abs(tailEndY - originalBounds.top) + basePadding, 20)
        }
        
        if (tailEndY > originalBounds.bottom) {
          bottomExpansion = Math.min(Math.abs(tailEndY - originalBounds.bottom) + basePadding, 20)
        }
        
        // Создаем новые bounds с учетом расширения
        const newBounds = new this.paperScope.Rectangle(
          originalBounds.left - leftExpansion,
          originalBounds.top - topExpansion,
          originalBounds.width + leftExpansion + rightExpansion,
          originalBounds.height + topExpansion + bottomExpansion
        )
        
        console.log('🎯 Умные bounds для хвоста:', {
          originalBounds: originalBounds,
          tailEnd: { x: tailEndX, y: tailEndY },
          tailLength: tailLength,
          expansions: { left: leftExpansion, right: rightExpansion, top: topExpansion, bottom: bottomExpansion },
          newBounds: newBounds
        })
        
        return newBounds
      }
      
      // Fallback для неизвестных режимов
      return originalBounds.expand(basePadding)
    },

    // Сохранение холста в высоком разрешении для печати
    async saveCanvasForPrint() {
      console.log('🖨️ Начинаем сохранение холста для печати в 300 DPI')
      
      return new Promise(async (resolve, reject) => {
        try {
        const canvas = this.$refs.testCanvas
        if (!canvas) {
          console.error('❌ Основной холст не найден')
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

        // Обновляем актуальные позиции всех элементов перед сохранением
        console.log('🔄 Обновляем актуальные позиции элементов перед сохранением')
        this.updateAllElementPositions()

        // Создаем временный холст в высоком разрешении
        const printCanvas = document.createElement('canvas')
        printCanvas.width = printWidth
        printCanvas.height = printHeight
        const printCtx = printCanvas.getContext('2d')

        // Устанавливаем белый фон
        printCtx.fillStyle = '#FFFFFF'
        printCtx.fillRect(0, 0, printWidth, printHeight)

        // Настраиваем высокое качество рендеринга
        printCtx.imageSmoothingEnabled = true
        printCtx.imageSmoothingQuality = 'high'
        
        // Отладочная информация
        console.log('🔍 Отладочная информация для сохранения:')
        console.log('- textLayers:', this.textLayers.length, this.textLayers)
        console.log('- stickers:', this.stickers.length, this.stickers)
        console.log('- backgroundImage:', !!this.backgroundImage)
        
        // Создаем новый Paper.js canvas с высоким разрешением
        console.log('🎨 Создаем новый Paper.js canvas с высоким разрешением')
        
        if (this.paperScope && this.paperScope.project) {
          try {
            // Создаем временный canvas с высоким разрешением
            const tempHighResCanvas = document.createElement('canvas')
            tempHighResCanvas.width = printWidth
            tempHighResCanvas.height = printHeight
            tempHighResCanvas.style.width = canvasWidth + 'px'
            tempHighResCanvas.style.height = canvasHeight + 'px'
            
            console.log('📐 Создан временный canvas:', tempHighResCanvas.width, 'x', tempHighResCanvas.height)
            
            // Создаем новый Paper scope для высокого разрешения
            const tempPaperScope = new paper.PaperScope()
            tempPaperScope.setup(tempHighResCanvas)
            
            // Устанавливаем белый фон
            const whiteRect = new tempPaperScope.Rectangle(0, 0, printWidth, printHeight)
            const background = new tempPaperScope.Path.Rectangle(whiteRect)
            background.fillColor = '#FFFFFF'
            tempPaperScope.project.activeLayer.addChild(background)
            
        // Перерисовываем все элементы в высоком разрешении
        await this.redrawAllElementsInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight)
            
            // Обновляем view
            tempPaperScope.project.view.update()
            
            // Копируем результат на print canvas
            printCtx.drawImage(tempHighResCanvas, 0, 0)
            
            console.log('✅ Элементы перерисованы в высоком разрешении')
            
            // Очищаем временный scope
            tempPaperScope.project.clear()
            
          } catch (error) {
            console.error('❌ Ошибка при создании высокого разрешения:', error)
            
            // Fallback: простое масштабирование
            const paperCanvas = this.paperScope.project.view.element
            if (paperCanvas) {
              printCtx.drawImage(
                paperCanvas,
                0, 0, paperCanvas.width, paperCanvas.height,
                0, 0, printWidth, printHeight
              )
            } else {
              printCtx.drawImage(
                canvas,
                0, 0, canvasWidth, canvasHeight,
                0, 0, printWidth, printHeight
              )
            }
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
        const filename = `sticker-design-${new Date().toISOString().slice(0, 10)}.png`
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
              // Можно добавить toast уведомление
              console.log('🎉 Изображение сохранено в высоком качестве для печати!')
            })
          } else {
            console.error('❌ Ошибка при создании blob')
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
    
    // Обновление актуальных позиций всех элементов перед сохранением
    updateAllElementPositions() {
      console.log('🔄 Обновляем позиции стикеров и текстов')
      
      // Обновляем позиции стикеров
      this.stickers.forEach((sticker, index) => {
        if (sticker.group && sticker.group.position) {
          sticker.x = sticker.group.position.x
          sticker.y = sticker.group.position.y
          sticker.rotation = sticker.group.rotation || 0
          sticker.scaling = sticker.group.scaling || { x: 1, y: 1 }
          console.log(`📍 Стикер ${index + 1}: позиция (${sticker.x}, ${sticker.y}), поворот: ${sticker.rotation}°`)
        }
      })
      
      // Обновляем позиции текстовых слоев
      this.textLayers.forEach((layer, index) => {
        if (layer.layer && layer.layer.bounds) {
          layer.position = {
            x: layer.layer.bounds.center.x,
            y: layer.layer.bounds.center.y
          }
          console.log(`📍 Текстовый слой ${index + 1}: позиция (${layer.position.x}, ${layer.position.y})`)
        }
      })
      
      console.log('✅ Позиции всех элементов обновлены')
    },
    
    // Перерисовка всех элементов в высоком разрешении для печати
    async redrawAllElementsInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight) {
      console.log('🎨 Перерисовываем все элементы в высоком разрешении')
      console.log('📊 Статистика элементов:')
      console.log('- textLayers:', this.textLayers.length)
      console.log('- stickers:', this.stickers.length)
      console.log('- backgroundImage:', !!this.backgroundImage)
      
      try {
        // 1. Перерисовываем фоновое изображение если есть
        if (this.backgroundImage) {
          console.log('🖼️ Рисуем фоновое изображение')
          await this.redrawBackgroundInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight)
        } else {
          console.log('⚠️ Фоновое изображение отсутствует')
        }
        
        // 2. Перерисовываем все стикеры в правильном порядке слоев (сначала стикеры - они будут внизу)
        console.log(`🎭 Рисуем ${this.stickers.length} стикеров в правильном порядке слоев`)
        
        // Сортируем стикеры по их реальному z-index (порядку наложения на канвасе)
        const sortedStickers = [...this.stickers].sort((a, b) => {
          // Получаем реальный z-index из Paper.js группы
          const zIndexA = a.group ? a.group.index : 0
          const zIndexB = b.group ? b.group.index : 0
          return zIndexA - zIndexB // Сначала рисуем стикеры с меньшим z-index (они будут внизу)
        })
        
        for (let i = 0; i < sortedStickers.length; i++) {
          const sticker = sortedStickers[i]
          const originalIndex = this.stickers.indexOf(sticker)
          console.log(`🎭 Стикер ${originalIndex + 1} (z-index: ${sticker.group?.index || 0}, слой ${i + 1}):`, {
            mask: sticker.mask,
            image: sticker.image,
            position: sticker.group?.position,
            rotation: sticker.group?.rotation,
            zIndex: sticker.group?.index || 0,
            stickerMasksLength: this.stickerMasks?.length,
            stickerImagesLength: this.uploadedImages?.length
          })
          try {
            await this.redrawStickerInHighDPI(tempPaperScope, sticker, scale, this.stickerMasks, this.uploadedImages)
            console.log(`✅ Стикер ${originalIndex + 1} успешно обработан`)
          } catch (error) {
            console.error(`❌ Ошибка в стикере ${originalIndex + 1}:`, error)
          }
        }
        
        // 3. Перерисовываем все текстовые элементы с подложками (тексты сверху)
        console.log(`📝 Рисуем ${this.textLayers.length} текстовых слоев в правильном порядке`)
        
        // Сортируем текстовые слои по их реальному z-index (порядку наложения на канвасе)
        const sortedTextLayers = [...this.textLayers].sort((a, b) => {
          // Получаем z-index из Paper.js слоя, если он есть
          const aZIndex = a.layer?.index || a.id || 0
          const bZIndex = b.layer?.index || b.id || 0
          return aZIndex - bZIndex
        })
        
        console.log('📊 Порядок текстовых слоев при сохранении:', sortedTextLayers.map((layer, index) => ({
          originalIndex: this.textLayers.indexOf(layer),
          savedIndex: index,
          zIndex: layer.layer?.index || layer.id || 0,
          text: layer.textData?.text?.substring(0, 20) + '...'
        })))
        
        for (let i = 0; i < sortedTextLayers.length; i++) {
          const layer = sortedTextLayers[i]
          const originalIndex = this.textLayers.indexOf(layer)
          console.log(`📝 Слой ${originalIndex + 1} (z-index: ${layer.layer?.index || layer.id || 0}, сохранение ${i + 1}):`, {
            hasTextData: !!layer.textData,
            hasBackground: !!layer.textData?.backgroundMode,
            backgroundMode: layer.textData?.backgroundMode,
            text: layer.textData?.text,
            position: layer.position
          })
          try {
            await this.redrawTextLayerInHighDPI(tempPaperScope, layer, scale, canvasWidth, canvasHeight)
            console.log(`✅ Слой ${originalIndex + 1} успешно обработан`)
          } catch (error) {
            console.error(`❌ Ошибка в слое ${originalIndex + 1}:`, error)
          }
        }
        
        console.log('✅ Все элементы перерисованы в высоком разрешении')
      } catch (error) {
        console.error('❌ Ошибка при перерисовке элементов:', error)
      }
    },
    
    // Перерисовка фонового изображения в высоком разрешении
    async redrawBackgroundInHighDPI(tempPaperScope, scale, canvasWidth, canvasHeight) {
      if (!this.backgroundImage) return
      
      console.log('🖼️ Перерисовываем фоновое изображение')
      
      try {
        // Создаем Raster из фонового изображения
        const backgroundRaster = new tempPaperScope.Raster(this.backgroundImage)
        
        // Ждем загрузки изображения
        await new Promise((resolve) => {
          backgroundRaster.onLoad = resolve
        })
        
        // Позиционируем и масштабируем
        backgroundRaster.position = new tempPaperScope.Point(canvasWidth * scale / 2, canvasHeight * scale / 2)
        backgroundRaster.scale(scale)
        
        // Добавляем на слой
        tempPaperScope.project.activeLayer.addChild(backgroundRaster)
        
        console.log('✅ Фоновое изображение добавлено в высоком разрешении')
      } catch (error) {
        console.error('❌ Ошибка при перерисовке фонового изображения:', error)
      }
    },
    
    // Перерисовка текстового слоя в высоком разрешении
    async redrawTextLayerInHighDPI(tempPaperScope, layer, scale, canvasWidth, canvasHeight) {
      console.log(`📝 Перерисовываем текстовый слой: ${layer.textData?.text || 'без текста'}`)
      
      if (!layer.textData) {
        console.warn('⚠️ Нет данных текста для слоя')
        return
      }
      
      try {
        // Получаем размеры из оригинального элемента
        let bounds
        if (layer.backgroundItem && layer.backgroundItem.bounds) {
          bounds = layer.backgroundItem.bounds
        } else if (layer.layer && layer.layer.bounds) {
          bounds = layer.layer.bounds
        } else {
          // Используем примерные размеры если bounds недоступны
          bounds = {
            width: 200,
            height: 100,
            x: 0,
            y: 0
          }
        }
        
        console.log('📏 Размеры слоя:', bounds)
        
        // Создаем временный canvas для рендеринга в высоком разрешении
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Создаем canvas с высоким разрешением
        let backgroundWidth = layer.textData.backgroundWidth || 200
        let backgroundHeight = layer.textData.backgroundHeight || 80
        
        // Для режимов "image-text" и "standard" вычисляем реальные размеры текста
        if (layer.textData.backgroundMode === 'image-text' || layer.textData.backgroundMode === 'standard') {
          // Создаем временный контекст для измерения текста
          const tempCtxForMeasure = document.createElement('canvas').getContext('2d')
          tempCtxForMeasure.font = `${layer.textData.fontWeight || 'normal'} ${layer.textData.fontSize * scale}px ${layer.textData.font}`
          const textMetrics = tempCtxForMeasure.measureText(layer.textData.text)
          const textWidth = textMetrics.width
          const textHeight = layer.textData.fontSize * scale * layer.textData.lineHeight
          
          // Для режима "standard" добавляем внутренние отступы
          if (layer.textData.backgroundMode === 'standard') {
            const textPadding = (layer.textData.padding || 15) * scale // Масштабируем padding
            const textWidthWithPadding = textWidth + textPadding * 2 // Отступы слева и справа
            const textHeightWithPadding = textHeight + textPadding * 2 // Отступы сверху и снизу
            
            // Используем максимальный размер из переданных размеров подложки и реальных размеров текста с отступами
            backgroundWidth = Math.max(backgroundWidth, textWidthWithPadding / scale)
            backgroundHeight = Math.max(backgroundHeight, textHeightWithPadding / scale)
            
            console.log('⭐ Размеры для режима "standard" (высокое разрешение):', {
              originalBackground: `${layer.textData.backgroundWidth || 200}x${layer.textData.backgroundHeight || 80}`,
              textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
              textPadding: textPadding,
              textSizeWithPadding: `${textWidthWithPadding.toFixed(1)}x${textHeightWithPadding.toFixed(1)}`,
              finalBackground: `${backgroundWidth.toFixed(1)}x${backgroundHeight.toFixed(1)}`
            })
          } else {
            // Для режима "image-text" используем размеры без отступов
            backgroundWidth = Math.max(backgroundWidth, textWidth / scale)
            backgroundHeight = Math.max(backgroundHeight, textHeight / scale)
            
            console.log('🖼️ Размеры для режима "image-text":', {
              originalBackground: `${layer.textData.backgroundWidth || 200}x${layer.textData.backgroundHeight || 100}`,
              textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
              finalBackground: `${backgroundWidth.toFixed(1)}x${backgroundHeight.toFixed(1)}`
            })
          }
        }
        
        // Масштабируем размеры подложки
        const scaledBackgroundWidth = backgroundWidth * scale
        const scaledBackgroundHeight = backgroundHeight * scale
        
        // Вычисляем отступы для тени, обводки и хвоста
        const shadowPadding = layer.textData.shadow ? Math.min(layer.textData.shadowBlur + Math.abs(layer.textData.shadowOffsetX) + Math.abs(layer.textData.shadowOffsetY), 100) : 0
        const strokePadding = layer.textData.stroke ? layer.textData.strokeWidth / 2 : 0
        
        // Простой расчет отступов для всех режимов
        let padding = Math.max(shadowPadding, strokePadding) + 50 // Базовый отступ
        
        // Для режимов с хвостом добавляем дополнительные отступы
        if (layer.textData.backgroundMode === 'conversation' || layer.textData.backgroundMode === 'thoughts') {
          // Для режима "Разговор" и "Мысли" добавляем отступ для хвоста
          const tailSize = Number(layer.textData.tailSize || 100) / 100 // Используем 100 как значение по умолчанию
          const tailWidth = Number(layer.textData.tailWidth || 60) / 100 // Используем 60 как значение по умолчанию
          const minDimension = Math.min(scaledBackgroundWidth, scaledBackgroundHeight)
          const tailLength = minDimension * 1.25 * tailSize // Увеличиваем базовую длину хвоста
          const tailBaseWidth = minDimension * 0.3 * tailWidth
          
          // Учитываем толщину хвоста в отступах
          const tailThicknessPadding = tailBaseWidth * 2.0 // Увеличиваем отступ для толщины хвоста
          const tailTipPadding = tailLength * 1.0 // Увеличиваем отступ для кончика хвоста (было 0.5)
          const tailPadding = Math.max(
            tailLength * 4.0, // Еще больше увеличиваем отступ для длины хвоста (было 3.0)
            tailBaseWidth * 4.0, // Еще больше увеличиваем отступ для ширины хвоста (было 3.0)
            tailThicknessPadding, // Добавляем отступ для толщины хвоста
            tailTipPadding, // Добавляем отступ для кончика хвоста
            minDimension * 3.0 // Еще больше увеличиваем базовый отступ (было 2.5)
          )
          
          padding = Math.max(shadowPadding, strokePadding, tailPadding) + 200 // Максимально увеличиваем дополнительный отступ
        }
        
        // Вычисляем размеры с отступами
        const highResWidth = scaledBackgroundWidth + padding * 2
        const highResHeight = scaledBackgroundHeight + padding * 2
        
        tempCanvas.width = highResWidth
        tempCanvas.height = highResHeight
        
        console.log('📐 Canvas высокого разрешения:', highResWidth, 'x', highResHeight, 'отступы:', padding)
        
        // НЕ применяем scale к контексту - рисуем сразу в высоком разрешении
        
        // Рисуем подложку если есть (рисуем прямо на основном canvas)
        // Для режима "image-text" подложки быть не должно
        if (layer.textData.backgroundMode && layer.textData.backgroundMode !== 'image-text') {
          console.log('🎨 Рисуем подложку для текста в высоком разрешении')
          
          // Создаем временный слой для передачи в методы
          const tempLayer = {
            textData: layer.textData,
            bounds: {
              width: scaledBackgroundWidth,
              height: scaledBackgroundHeight
            }
          }
          
          // Рисуем подложку прямо на основном canvas в зависимости от режима
          // Сохраняем контекст и применяем отступы
          tempCtx.save()
          tempCtx.translate(padding, padding)
          
          if (layer.textData.backgroundMode === 'conversation') {
            await this.drawConversationBackgroundInHighDPI(tempCtx, tempLayer, scale)
          } else if (layer.textData.backgroundMode === 'standard') {
            await this.drawStandardBackgroundInHighDPI(tempCtx, tempLayer, scale)
          } else if (layer.textData.backgroundMode === 'thoughts') {
            await this.drawThoughtsBackgroundInHighDPI(tempCtx, tempLayer, scale)
          }
          
          // Восстанавливаем контекст
          tempCtx.restore()
          
          console.log('✅ Подложка нарисована:', layer.textData.backgroundColor, 'режим:', layer.textData.backgroundMode)
        } else if (layer.textData.backgroundMode === 'image-text') {
          console.log('🖼️ Режим "Текст с изображением" - подложка не нужна')
        } else {
          console.log('⚠️ У текста нет подложки')
        }
        
        // Рисуем текст в высоком разрешении
        console.log('✍️ Рисуем текст в высоком разрешении')
        this.drawTextInHighDPI(tempCtx, { 
          ...layer, 
          bounds: { width: highResWidth, height: highResHeight },
          textData: {
            ...layer.textData,
            fontSize: layer.textData.fontSize * scale  // Масштабируем размер шрифта
          }
        })
        
        // Создаем Raster из временного canvas
        const textRaster = new tempPaperScope.Raster(tempCanvas.toDataURL('image/png', 1.0))
        
        // Ждем загрузки
        await new Promise((resolve) => {
          textRaster.onLoad = resolve
        })
        
        // Позиционируем в высоком разрешении
        const position = layer.position || { x: 0, y: 0 }
        textRaster.position = new tempPaperScope.Point(
          position.x * scale,
          position.y * scale
        )
        
        console.log('📍 Позиция текста:', position, 'масштабированная:', position.x * scale, position.y * scale)
        
        // Добавляем на слой
        tempPaperScope.project.activeLayer.addChild(textRaster)
        
        console.log('✅ Текстовый слой добавлен в высоком разрешении:', textRaster.bounds)
      } catch (error) {
        console.error('❌ Ошибка при перерисовке текстового слоя:', error)
      }
    },
    
    // Перерисовка стикера в высоком разрешении - полное дублирование логики createOptimalSticker
    async redrawStickerInHighDPI(tempPaperScope, sticker, scale, stickerMasks, stickerImages) {
      console.log(`🎭 Перерисовываем стикер: ${sticker.mask} + ${sticker.image}`)
      console.log('🔍 Отладка в redrawStickerInHighDPI:', {
        stickerMasks: stickerMasks,
        stickerImages: stickerImages,
        stickerMasksLength: stickerMasks?.length,
        stickerImagesLength: stickerImages?.length,
        stickerMask: sticker.mask,
        stickerImage: sticker.image,
        originalRotation: sticker.group?.rotation,
        originalScaling: sticker.group?.scaling
      })

      try {
        // Проверяем наличие массивов
        if (!stickerMasks || !Array.isArray(stickerMasks)) {
          console.warn('⚠️ stickerMasks не определен или не является массивом:', stickerMasks)
          return
        }

        if (!stickerImages || !Array.isArray(stickerImages)) {
          console.warn('⚠️ stickerImages не определен или не является массивом:', stickerImages)
          return
        }

        // Находим маску и изображение
        const mask = stickerMasks.find(m => m.name === sticker.mask)
        const image = stickerImages.find(img => img.name === sticker.image)

        if (!mask || !image) {
          console.warn('⚠️ Маска или изображение не найдены для стикера:', {
            mask: mask ? 'найдена' : 'не найдена',
            image: image ? 'найдено' : 'не найдено',
            stickerMask: sticker.mask,
            stickerImage: sticker.image
          })
          return
        }

        // Получаем параметры стикера
        const x = sticker.group.position.x * scale
        const y = sticker.group.position.y * scale
        const size = sticker.size * scale
        const rotation = sticker.group.rotation || 0

        console.log(`🎨 Создаем стикер в высоком разрешении: ${mask.name} + ${image.name} в позиции (${x}, ${y}) размером ${size}`)

        // Загружаем SVG маску (как в createOptimalSticker)
        const svgResponse = await fetch(mask.url)
        const svgText = await svgResponse.text()

        // Импортируем SVG в временный scope
        const tempScope = new paper.PaperScope()
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 1000
        tempCanvas.height = 1000
        tempScope.setup(tempCanvas)

        const item = await new Promise((resolve, reject) => {
          tempScope.project.importSVG(svgText, {
            onLoad: (importedItem) => {
              resolve(importedItem)
            },
            onError: (error) => {
              reject(error)
            }
          })
        })

        // Масштабируем маску (поворот убран из генерации)
        const maskScale = size / 100 // Масштабируем под нужный размер
        item.scale(maskScale)
        // Поворот убран - стикеры создаются без поворота

        if (item.children && item.children.length > 0) {
          // Ищем путь в импортированном SVG
          let path = null
          
          // Рекурсивно ищем Path в импортированном SVG
          const findPath = (node) => {
            if (node.className === 'Path') {
              path = node
              return true
            }
            if (node.children) {
              for (let child of node.children) {
                if (findPath(child)) return true
              }
            }
            return false
          }
          
          findPath(item)
          
          if (!path) {
            console.log('⚠️ Не найден Path в SVG:', item)
            path = item.children[0]
          }

          // Создаем растр из изображения
          const raster = new tempPaperScope.Raster(image.url)
          raster.visible = false // Скрываем оригинальный растр
          
          await new Promise((resolve) => {
            raster.onLoad = resolve
          })

          console.log(`🖼️ Растр загружен: ${image.name}, размеры: ${raster.image.width}x${raster.image.height}`)
          
          // Создаем временный canvas для обрезки изображения
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          
          // Получаем размеры маски
          const maskBounds = path.bounds
          console.log(`📐 Размеры маски ${mask.name}: ${maskBounds.width}x${maskBounds.height}`)
          
          tempCanvas.width = maskBounds.width
          tempCanvas.height = maskBounds.height
          
          // Очищаем canvas
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          // Создаем путь маски на canvas
          tempCtx.save()
          tempCtx.beginPath()
          
          // Рисуем путь маски (как в createOptimalSticker)
          if (path.className === 'Path' && path.segments && path.segments.length > 0) {
            console.log('🔍 Сегменты пути:', path.segments.length)
            
            // Используем более точный способ отрисовки SVG пути
            if (path.pathData) {
              console.log('🎯 Используем pathData для точной отрисовки')
              
              // Парсим SVG path data и рисуем его на canvas
              const pathCommands = this.parseSVGPath(path.pathData)
              tempCtx.translate(-maskBounds.x, -maskBounds.y)
              
              // Устанавливаем fill-rule для правильной обработки отверстий
              tempCtx.fillRule = 'evenodd'
              
              // Используем ручную отрисовку для более точного контроля
              for (const command of pathCommands) {
                if (command.type === 'M') {
                  tempCtx.moveTo(command.x, command.y)
                } else if (command.type === 'L') {
                  tempCtx.lineTo(command.x, command.y)
                } else if (command.type === 'C') {
                  tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                } else if (command.type === 'Q') {
                  tempCtx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
                } else if (command.type === 'Z') {
                  tempCtx.closePath()
                }
              }
              tempCtx.clip()
              
              tempCtx.translate(maskBounds.x, maskBounds.y)
            } else {
              // Fallback на сегменты
              console.log('📐 Используем сегменты для отрисовки')
              
              // Первая точка
              const firstPoint = path.segments[0].point
              const relativeFirstPoint = new tempPaperScope.Point(
                firstPoint.x - maskBounds.x,
                firstPoint.y - maskBounds.y
              )
              tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
              
              // Остальные точки
              for (let i = 1; i < path.segments.length; i++) {
                const segment = path.segments[i]
                const relativePoint = new tempPaperScope.Point(
                  segment.point.x - maskBounds.x,
                  segment.point.y - maskBounds.y
                )
                tempCtx.lineTo(relativePoint.x, relativePoint.y)
              }
            }
          } else {
            console.log('⚠️ Нет сегментов в пути!')
          }
          
          tempCtx.closePath()
          tempCtx.clip()
          
          // Рисуем изображение на canvas с сохранением пропорций и поворотом
          const imgWidth = raster.image.width
          const imgHeight = raster.image.height
          const canvasWidth = maskBounds.width
          const canvasHeight = maskBounds.height
          
          // Вычисляем масштаб для заполнения всей площади стикера
          const scaleX = canvasWidth / imgWidth
          const scaleY = canvasHeight / imgHeight
          const imgScale = Math.max(scaleX, scaleY) // Используем Math.max для заполнения всей площади
          
          // Дополнительно увеличиваем масштаб для гарантированного заполнения
          const extraScale = 1.1 // Увеличиваем на 10% для гарантии заполнения
          const finalScale = imgScale * extraScale
          
          // Вычисляем размеры масштабированного изображения
          const scaledWidth = imgWidth * finalScale
          const scaledHeight = imgHeight * finalScale
          
          // Вычисляем смещение для центрирования
          const offsetX = (canvasWidth - scaledWidth) / 2
          const offsetY = (canvasHeight - scaledHeight) / 2
          
          // НЕ применяем поворот к изображению здесь - применим к группе позже
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
          console.log(`✂️ Создан обрезанный растр, размер dataURL: ${dataURL.length} символов`)
          const clippedRaster = new tempPaperScope.Raster(dataURL)
          
          await new Promise((resolve) => {
            clippedRaster.onLoad = resolve
          })

          console.log(`✅ Обрезанный растр загружен, позиционируем в (${x}, ${y})`)
          // Позиционируем обрезанный растр точно в центр маски
          clippedRaster.position = new tempPaperScope.Point(x, y)
          
          // Создаем контур для обводки
          const outlinePath = path.clone()
          outlinePath.position = new tempPaperScope.Point(x, y)
          
          // Применяем обводку к контуру (масштабируем параметры)
          const strokeWidthPixels = this.strokeWidth * scale // Масштабируем толщину обводки
          outlinePath.strokeColor = this.strokeColor
          outlinePath.strokeWidth = strokeWidthPixels
          outlinePath.fillColor = null
          
          // Создаем отдельную маску для тени (заполненная)
          const shadowPath = path.clone()
          shadowPath.position = new tempPaperScope.Point(x, y)
          // Используем shadowOpacity для прозрачности тени
          const shadowAlpha = this.shadowOpacity / 100
          shadowPath.fillColor = `rgba(0, 0, 0, ${shadowAlpha})` // Заполняем тень
          shadowPath.strokeColor = null
          
          // Применяем тень к заполненной маске (масштабируем параметры)
          shadowPath.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
          shadowPath.shadowBlur = this.shadowBlur * scale // Масштабируем размытость тени
          shadowPath.shadowOffset = new tempPaperScope.Point(
            this.shadowOffsetX * scale, // Масштабируем смещение тени по X
            this.shadowOffsetY * scale  // Масштабируем смещение тени по Y
          )
          
          // Создаем группу стикера (правильный порядок слоев)
          const stickerGroup = new tempPaperScope.Group()
          stickerGroup.addChild(shadowPath) // Тень внизу
          stickerGroup.addChild(clippedRaster) // Изображение посередине
          stickerGroup.addChild(outlinePath) // Обводка сверху
          
          // Поворот убран из генерации стикеров
          console.log('🔄 Стикер создан без поворота')
          
          // Добавляем группу в проект
          tempPaperScope.project.activeLayer.addChild(stickerGroup)
          
          // Очищаем временный scope
          tempScope.project.clear()
          
          console.log('✅ Полный стикер (с тенью, обводкой и изображением) добавлен в высоком разрешении')

        } else {
          console.warn('⚠️ Нет дочерних элементов в импортированном SVG')
        }

      } catch (error) {
        console.error('❌ Ошибка при перерисовке стикера:', error)
      }
    },
    
    
    // Рисование подложки в высоком разрешении
    async drawBackgroundInHighDPI(ctx, layer, scale = 1) {
      const textData = layer.textData
      console.log('🎨 drawBackgroundInHighDPI вызван:', {
        hasTextData: !!textData,
        hasBackground: textData?.hasBackground,
        backgroundMode: textData?.backgroundMode
      })
      
      if (!textData || !textData.backgroundMode) {
        console.log('⚠️ Нет данных подложки, выходим')
          return
        }
      
      console.log('🎨 Рисуем подложку в высоком разрешении')
      
      // Определяем режим подложки
      const mode = textData.backgroundMode || 'conversation'
      
      // Создаем подложку в зависимости от режима
      switch (mode) {
        case 'conversation':
          await this.drawConversationBackgroundInHighDPI(ctx, layer, scale)
          break
        case 'thoughts':
          await this.drawThoughtsBackgroundInHighDPI(ctx, layer, scale)
          break
        case 'standard':
          await this.drawStandardBackgroundInHighDPI(ctx, layer, scale)
          break
        case 'imageText':
          await this.drawImageTextBackgroundInHighDPI(ctx, layer, scale)
          break
        default:
          await this.drawStandardBackgroundInHighDPI(ctx, layer, scale)
      }
    },
    
    // Рисование подложки "Разговор" в высоком разрешении
    async drawConversationBackgroundInHighDPI(ctx, layer, scale = 1) {
      const textData = layer.textData
      
      // Размеры подложки (уже в высоком разрешении)
      const width = layer.bounds.width
      const height = layer.bounds.height
      
      console.log('📐 Размеры подложки conversation:', width, 'x', height)
      
      // Используем ту же логику, что и в canvas-превью режима "Текст 2"
      const centerX = width / 2
      const centerY = height / 2
      
      // Применяем тень если нужно
      if (textData.shadow) {
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale)
      }
      
      // Рисуем объединенную фигуру (подложка + хвост) с тенью
      this.drawCombinedShape(ctx, centerX, centerY, width, height, scale, textData.backgroundColor, true, textData)
      
      // Сбрасываем тень
      if (textData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Рисуем обводку если нужно (масштабируем толщину)
      if (textData.stroke && textData.strokeColor && textData.strokeWidth > 0) {
        ctx.strokeStyle = textData.strokeColor
        ctx.lineWidth = textData.strokeWidth * scale
        this.strokeCombinedShape(ctx, centerX, centerY, width, height, scale, textData)
      }
    },
    
    // Рисование подложки "Мысли" в высоком разрешении
    async drawThoughtsBackgroundInHighDPI(ctx, layer, scale = 1) {
      const textData = layer.textData
      
      // Размеры подложки (уже в высоком разрешении)
      const width = layer.bounds.width
      const height = layer.bounds.height
      
      console.log('🧠 Размеры подложки thoughts:', width, 'x', height)
      
      // Используем ту же логику, что и в canvas-превью режима "Текст 2"
      const centerX = width / 2
      const centerY = height / 2
      
      // Рисуем режим "Мысли" - овальная подложка с множественными хвостами
      // Используем правильную логику из buildThoughtsModePath с увеличенной толщиной обводки для высокого разрешения
      this.buildThoughtsModePath(ctx, centerX, centerY, width, height, scale, true, textData.backgroundColor, textData, true)
      
      console.log('✅ Подложка "Мысли" нарисована в высоком разрешении')
    },
    
    // Рисование стандартной подложки в высоком разрешении (точная копия логики превью)
    async drawStandardBackgroundInHighDPI(ctx, layer, scale = 1) {
      const textData = layer.textData
      
      // Размеры подложки (уже в высоком разрешении)
      const width = layer.bounds.width
      const height = layer.bounds.height
      
      console.log('📐 Размеры подложки standard:', width, 'x', height)
      
      // Используем центр для отрисовки (как в превью)
      const centerX = width / 2
      const centerY = height / 2
      
      // Рисуем тень если включена (точно как в превью)
      if (textData.shadow) {
        ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(textData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(textData.shadowOffsetY * scale)
      }
      
      // Рисуем простую прямоугольную подложку (точно как в превью)
      ctx.fillStyle = textData.backgroundColor || '#ffffff'
      ctx.fillRect(centerX - width/2, centerY - height/2, width, height)
      
      // Сбрасываем тень
      if (textData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена (точно как в превью)
      if (textData.stroke) {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = (textData.strokeWidth || 2) * scale
        ctx.strokeRect(centerX - width/2, centerY - height/2, width, height)
      }
      
      console.log('✅ Подложка "Стандарт" нарисована в высоком разрешении')
    },
    
    // Рисование подложки с изображением в высоком разрешении
    async drawImageTextBackgroundInHighDPI(ctx, layer, scale = 1) {
      const textData = layer.textData
      
      // Размеры подложки
      const width = layer.bounds.width
      const height = layer.bounds.height
      const centerX = width / 2
      const centerY = height / 2
      
      console.log('🖼️ Рисуем подложку "Текст с изображением" в высоком разрешении:', {
        size: `${width}x${height}`,
        scale: scale,
        hasImage: !!(textData.textImage && textData.cachedImage),
        text: textData.text
      })
      
      // Если есть изображение для заливки текста, рисуем текст с изображением
      if (textData.textImage && textData.cachedImage) {
        const img = textData.cachedImage
        
        // Вычисляем размеры текста для правильного позиционирования изображения
        ctx.font = `${textData.fontWeight} ${textData.fontSize * scale}px ${textData.font}`
        const textWidth = ctx.measureText(textData.text).width
        const textHeight = textData.fontSize * scale * textData.lineHeight
        
        // Используем точные размеры текста для изображения
        const drawWidth = textWidth
        const drawHeight = textHeight
        const drawX = centerX - drawWidth / 2
        const drawY = centerY - drawHeight / 2
        
        console.log('🖼️ Позиционирование изображения в высоком разрешении:', {
          textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
          drawArea: `${drawX.toFixed(1)}, ${drawY.toFixed(1)}, ${drawWidth.toFixed(1)}, ${drawHeight.toFixed(1)}`
        })
        
        // Рисуем изображение
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        
        // Создаем маску из текста
        ctx.globalCompositeOperation = 'destination-in'
        ctx.font = `${textData.fontWeight} ${textData.fontSize * scale}px ${textData.font}`
        ctx.textAlign = textData.textAlign || 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'white'
        this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize * scale, textData.lineHeight, textData)
        ctx.globalCompositeOperation = 'source-over'
      } else {
        // Если нет изображения, рисуем обычную подложку (как стандарт)
        console.log('🖼️ Нет изображения, рисуем стандартную подложку')
        await this.drawStandardBackgroundInHighDPI(ctx, layer, scale)
      }
    },
    
    // Рисование текста в высоком разрешении
    drawTextInHighDPI(ctx, layer) {
      const textData = layer.textData
      console.log('✍️ drawTextInHighDPI вызван:', {
        hasTextData: !!textData,
        text: textData?.text,
        fontSize: textData?.fontSize,
        font: textData?.font,
        backgroundMode: textData?.backgroundMode
      })
      
      if (!textData) {
        console.log('⚠️ Нет данных текста, выходим')
        return
      }
      
      // Настраиваем шрифт
      ctx.font = `${textData.fontWeight || 'normal'} ${textData.fontSize}px ${textData.font}`
      ctx.textAlign = textData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Центрируем текст
      const centerX = layer.bounds.width / 2
      const centerY = layer.bounds.height / 2
      
      // Для режима "Текст с изображением" рисуем текст с изображением или цветом
      if (textData.backgroundMode === 'image-text') {
        console.log('🖼️ Рисуем текст в режиме "Текст с изображением" в высоком разрешении')
        
        // Применяем тень к тексту если включена (для режима image-text тень применяется к самому тексту)
        if (textData.shadow) {
          ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur))
          ctx.shadowOffsetX = Math.round(textData.shadowOffsetX)
          ctx.shadowOffsetY = Math.round(textData.shadowOffsetY)
          ctx.globalAlpha = textData.shadowOpacity / 100
          
          // Рисуем тень текста
          this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight, textData)
          
          // Сбрасываем настройки тени
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          ctx.globalAlpha = 1
        }
        
        // Рисуем основной текст с поддержкой изображения
        if (textData.textImage && textData.cachedImage) {
          console.log('🖼️ Рисуем текст с изображением в высоком разрешении')
          const img = textData.cachedImage
          
          // Вычисляем размеры текста для правильного позиционирования изображения
          const textWidth = ctx.measureText(textData.text).width
          const textHeight = textData.fontSize * textData.lineHeight
          
          // Используем точные размеры текста для изображения
          const drawWidth = textWidth
          const drawHeight = textHeight
          const drawX = centerX - drawWidth / 2
          const drawY = centerY - drawHeight / 2
          
          console.log('🖼️ Позиционирование изображения в высоком разрешении:', {
            textSize: `${textWidth.toFixed(1)}x${textHeight.toFixed(1)}`,
            drawArea: `${drawX.toFixed(1)}, ${drawY.toFixed(1)}, ${drawWidth.toFixed(1)}, ${drawHeight.toFixed(1)}`
          })
          
          // Создаем временный канвас для текста с изображением
          const textCanvas = document.createElement('canvas')
          textCanvas.width = layer.bounds.width
          textCanvas.height = layer.bounds.height
          const textCtx = textCanvas.getContext('2d')
          
          // Рисуем изображение на временном канвасе
          textCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          
          // Создаем маску из текста
          textCtx.globalCompositeOperation = 'destination-in'
          textCtx.font = ctx.font
          textCtx.textAlign = ctx.textAlign
          textCtx.textBaseline = ctx.textBaseline
          textCtx.fillStyle = 'white'
          this.drawMultilineTextWithData(textCtx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight, textData)
          
          // Рисуем результат на основном канвасе
          ctx.drawImage(textCanvas, 0, 0)
        } else {
          // Если нет изображения, используем обычную заливку цветом
          console.log('🖼️ Рисуем текст без изображения в высоком разрешении')
          ctx.fillStyle = textData.textColor
          this.drawMultilineTextWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight, textData)
        }
        
        // Применяем обводку к тексту если включена (для режима image-text обводка применяется к самому тексту)
        if (textData.stroke) {
          ctx.strokeStyle = textData.strokeColor
          ctx.lineWidth = textData.strokeWidth * 2 // Увеличиваем толщину обводки в 2 раза для высокого разрешения
          this.drawMultilineTextStrokeWithData(ctx, textData.text, centerX, centerY, textData.fontSize, textData.lineHeight, textData)
        }
      } else {
        // Для других режимов рисуем обычный текст (без тени и обводки - они у подложки)
        console.log('📝 Рисуем обычный текст для режима:', textData.backgroundMode)
        ctx.fillStyle = textData.textColor
        
        // Разбиваем текст на строки
        const lines = textData.text.split('\n')
        const lineHeight = textData.lineHeight || textData.fontSize * 1.2
        
        // Центрируем текст
        const startY = centerY - (lines.length - 1) * lineHeight / 2
        
        // Рисуем каждую строку
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight
          ctx.fillText(line, centerX, y)
        })
      }
    },

    // Инициализация Paper.js
    async initPaper() {
      const canvas = this.$refs.testCanvas
      if (!canvas) {
        console.log('❌ Канвас не найден при инициализации')
        return
      }
      
      console.log('🎨 Инициализация Paper.js')
      
      this.paperScope = new paper.PaperScope()
      this.paperScope.setup(canvas)
      
      // Настраиваем стили выделения
      this.paperScope.settings.handleSize = 8
      this.paperScope.settings.hitTolerance = 5
      
      // Настраиваем стили выделения для красной рамки
      this.paperScope.settings.selectionStyle = {
        strokeColor: '#dc3545',
        strokeWidth: 2,
        dashArray: [5, 5],
        fillColor: null
      }
      
      // Устанавливаем размер канваса
      this.resizeCanvas()
      
      // Создаем белый слой-прослойку при инициализации
      await this.createWhiteOverlayLayer()
      
      // Добавляем обработчик изменения размера окна с debounce
      let resizeTimeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          this.handleCanvasResize()
        }, 100)
      })
      
      // Настраиваем инструменты Paper.js для перетаскивания
      this.setupPaperTools()
      
      console.log('✅ Paper.js инициализирован')
    },
    

    
    // Обработчик изменения размера окна
    async handleCanvasResize() {
      if (this.paperScope) {
        console.log('🔄 Изменение размера окна - обновляем канвас')
        this.resizeCanvas()
        await this.updateCanvasContent()
      }
    },
    
    // Изменение размера канваса
    resizeCanvas() {
      const canvas = this.$refs.testCanvas
      if (!canvas) {
        console.log('⚠️ Канвас не найден')
        return
      }
      
      if (!this.paperScope) {
        console.log('⚠️ PaperScope не инициализирован')
        return
      }
      
      // Получаем размер контейнера (.canvas-container)
      const container = canvas.parentElement
      if (!container) {
        console.log('⚠️ Контейнер не найден')
        return
      }
      
      const containerWidth = container.clientWidth
      const containerHeight = (containerWidth * 9) / 19
      
      console.log('📏 Размеры контейнера:', containerWidth, 'x', containerHeight)
      
      // Получаем devicePixelRatio для HiDPI поддержки
      const dpr = window.devicePixelRatio || 1
      console.log('🖥️ Device Pixel Ratio:', dpr)
      
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
      
      console.log('📐 Канвас изменен:', containerWidth, 'x', containerHeight)
    },
    
    // Обновление содержимого канваса при изменении размера
    async updateCanvasContent() {
      if (!this.paperScope) return
      
      // Скрываем все большие растры при изменении размера
      this.paperScope.project.activeLayer.children.forEach(child => {
        if (child.className === 'Raster' && child.bounds && 
            (child.bounds.width > 500 || child.bounds.height > 500)) {
          console.log('👁️ Скрываем большой растр при изменении размера:', child.bounds)
          child.visible = false
        }
      })
      
      // Пересчитываем позиции всех масок
      Object.keys(this.maskItems).forEach(maskName => {
        const maskItem = this.maskItems[maskName]
        if (maskItem && maskItem.parent) {
          // Получаем новые размеры канваса
          const canvasWidth = this.paperScope.view.viewSize.width
          const canvasHeight = this.paperScope.view.viewSize.height
          
          // Пересчитываем позицию (центр канваса)
          const newX = canvasWidth * 0.5
          const newY = canvasHeight * 0.5
          
          // Обновляем позицию группы маски
          maskItem.position = new this.paperScope.Point(newX, newY)
        }
      })
      
      // Пересоздаем белый слой-прослойку
      await this.createWhiteOverlayLayer()
      
      // Перерисовываем канвас
      this.paperScope.view.draw()
    },
    

    
    // Обработчик изменения чекбокса маски
    handleMaskChange(index, event) {
      const mask = this.stickerMasks[index]
      mask.selected = event.target.checked
      
      // НЕ обновляем канвас при выборе масок - только сохраняем состояние
      console.log(`🎭 Маска "${mask.name}" ${mask.selected ? 'выбрана' : 'отменена'}`)
    },
    
    // Добавить маску на канвас
    addMaskToCanvas(mask) {
      if (!this.paperScope) return Promise.resolve()
      
      return new Promise(async (resolve) => {
      
      console.log('Добавляем маску:', mask.name)
      
      // Загружаем SVG маску
      fetch(mask.url)
        .then(response => response.text())
        .then(svgText => {
          this.paperScope.project.importSVG(svgText, {
            onLoad: (item) => {
              item.scale(2)
              
              // Позиционируем в центре канваса
              const canvasWidth = this.paperScope.view.viewSize.width
              const canvasHeight = this.paperScope.view.viewSize.height
              const x = canvasWidth * 0.5
              const y = canvasHeight * 0.5
              item.position = new this.paperScope.Point(x, y)
              
              if (item.children && item.children.length > 0) {
                // Ищем путь в импортированном SVG
                let path = null
                
                // Рекурсивно ищем Path в импортированном SVG
                const findPath = (node) => {
                  if (node.className === 'Path') {
                    path = node
                    return true
                  }
                  if (node.children) {
                    for (let child of node.children) {
                      if (findPath(child)) return true
                    }
                  }
                  return false
                }
                
                findPath(item)
                
                if (!path) {
                  console.log('⚠️ Не найден Path в SVG:', item)
                  // Fallback - используем первый элемент
                  path = item.children[0]
                }
                
                console.log('🔍 Найден путь:', path.className, 'Сегменты:', path.segments ? path.segments.length : 'нет')
                
                // Проверяем есть ли загруженные изображения
                if (this.uploadedImages.length > 0) {
                  // Берем первое изображение
                  const image = this.uploadedImages[0]
                  
                  // Создаем растр из изображения
                  const raster = new this.paperScope.Raster(image.url)
                  raster.visible = false // Скрываем оригинальный растр
                  console.log('🖼️ Растр создан, visible = false')
                  
                  // НЕ перемещаем растр - оставляем его там, где он есть
                  console.log('📍 Оригинальный растр оставлен на месте')
                  
                  // Обработка загрузки растра (как в GridsPage)
                  raster.onLoad = () => {
                    console.log('🖼️ Растр загружен:', {
                      imageSize: { width: raster.image.width, height: raster.image.height },
                      rasterBounds: raster.bounds
                    })
                    
                    // Дополнительная проверка - убеждаемся что растр скрыт
                    if (raster.parent) {
                      raster.visible = false
                      console.log('👁️ Оригинальный растр скрыт в onLoad')
                    }
                    
                    // Создаем временный canvas для обрезки изображения
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    
                    // Получаем размеры маски
                    const maskBounds = path.bounds
                    console.log('📐 Размеры маски:', maskBounds)
                    
                    tempCanvas.width = maskBounds.width
                    tempCanvas.height = maskBounds.height
                    
                    // Очищаем canvas
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
                    
                    // Создаем путь маски на canvas
                    tempCtx.save()
                    tempCtx.beginPath()
                    
                    // Рисуем путь маски (как в GridsPage)
                    if (path.className === 'Path' && path.segments && path.segments.length > 0) {
                      console.log('🔍 Сегменты пути:', path.segments.length)
                      
                                                                      // Используем более точный способ отрисовки SVG пути
                        if (path.pathData) {
                          // Если есть pathData, используем его для более точной отрисовки
                          console.log('🎯 Используем pathData для точной отрисовки')
                          console.log('📄 pathData:', path.pathData)
                          
                          // Парсим SVG path data и рисуем его на canvas
                          const pathCommands = this.parseSVGPath(path.pathData)
                          console.log('🔧 Парсированные команды:', pathCommands)
                          console.log('🔧 Первые 3 команды:', pathCommands.slice(0, 3))
                        console.log('🔧 Последние 3 команды:', pathCommands.slice(-3))
                          tempCtx.translate(-maskBounds.x, -maskBounds.y)
                          
                          // Устанавливаем fill-rule для правильной обработки отверстий
                          tempCtx.fillRule = 'evenodd'
                          
                          // Используем ручную отрисовку для более точного контроля
                          console.log('🎨 Рисуем путь вручную')
                          
                          for (const command of pathCommands) {
                            if (command.type === 'M') {
                              tempCtx.moveTo(command.x, command.y)
                            } else if (command.type === 'L') {
                              tempCtx.lineTo(command.x, command.y)
                            } else if (command.type === 'C') {
                              tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                            } else if (command.type === 'Q') {
                              tempCtx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
                            } else if (command.type === 'Z') {
                              tempCtx.closePath()
                            }
                          }
                          tempCtx.clip()
                          
                          tempCtx.translate(maskBounds.x, maskBounds.y)
                      } else {
                        // Fallback на сегменты
                        console.log('📐 Используем сегменты для отрисовки')
                        
                        // Первая точка
                        const firstPoint = path.segments[0].point
                        const relativeFirstPoint = new this.paperScope.Point(
                          firstPoint.x - maskBounds.x,
                          firstPoint.y - maskBounds.y
                        )
                        tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
                        
                        // Остальные точки
                        let lastRelativePoint = relativeFirstPoint
                        for (let i = 1; i < path.segments.length; i++) {
                          const segment = path.segments[i]
                          const relativePoint = new this.paperScope.Point(
                            segment.point.x - maskBounds.x,
                            segment.point.y - maskBounds.y
                          )
                          tempCtx.lineTo(relativePoint.x, relativePoint.y)
                          lastRelativePoint = relativePoint
                        }
                        
                        console.log('📏 Первая точка:', relativeFirstPoint, 'Последняя точка:', lastRelativePoint)
                      }
                    } else {
                      console.log('⚠️ Нет сегментов в пути!')
                    }
                    
                    tempCtx.closePath()
                    
                    // Проверяем, что путь создан правильно
                    console.log('🔒 Путь закрыт, применяем clip()')
                    tempCtx.clip()
                    
                    // Рисуем изображение на canvas с сохранением пропорций
                    const imgWidth = raster.image.width
                    const imgHeight = raster.image.height
                    const canvasWidth = maskBounds.width
                    const canvasHeight = maskBounds.height
                    
                    // Вычисляем масштаб для заполнения всей площади
                    const scaleX = canvasWidth / imgWidth
                    const scaleY = canvasHeight / imgHeight
                    const scale = Math.max(scaleX, scaleY)
                    
                    // Вычисляем размеры масштабированного изображения
                    const scaledWidth = imgWidth * scale
                    const scaledHeight = imgHeight * scale
                    
                    // Центрируем изображение
                    const offsetX = (canvasWidth - scaledWidth) / 2
                    const offsetY = (canvasHeight - scaledHeight) / 2
                    
                    tempCtx.drawImage(
                      raster.image,
                      offsetX, offsetY, scaledWidth, scaledHeight
                    )
                    
                    tempCtx.restore()
                    
                    console.log('🎨 Изображение нарисовано на canvas:', {
                      offset: { x: offsetX, y: offsetY },
                      scaledSize: { width: scaledWidth, height: scaledHeight }
                    })
                    
                    // Конвертируем canvas в dataURL
                    const maskedImageUrl = tempCanvas.toDataURL()
                    console.log('📄 DataURL создан, длина:', maskedImageUrl.length)
                    
                    // Создаем новый растр с обрезанным изображением
                    const maskedRaster = new this.paperScope.Raster(maskedImageUrl)
                    console.log('🔄 Создан новый растр из dataURL')
                    
                    maskedRaster.onLoad = () => {
                      console.log('✅ Новый растр загружен:', {
                        bounds: maskedRaster.bounds,
                        visible: maskedRaster.visible
                      })
                      // Устанавливаем позицию точно в центр маски
                      maskedRaster.position = maskBounds.center
                      console.log('📍 Позиция растра установлена:', maskBounds.center)
                      
                      // Сохраняем родительскую группу и позицию маски
                      const parentGroup = item.parent
                      const maskIndex = parentGroup ? parentGroup.children.indexOf(item) : -1
                      
                      // Удаляем оригинальную маску (как в GridsPage)
                      if (item.parent) {
                        item.remove()
                        console.log('🗑️ Оригинальная маска удалена из проекта')
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
                      const outlinePath = path.clone()
                      outlinePath.fillColor = null
                      outlinePath.strokeColor = '#333'
                      outlinePath.strokeWidth = 3
                      outlinePath.position = maskBounds.center
                      
                      if (parentGroup) {
                        parentGroup.addChild(outlinePath)
                      }
                      
                      // Сохраняем ссылку на элемент
                      if (!this.testMaskItems) this.testMaskItems = {}
                      this.testMaskItems[mask.name] = maskedRaster
                      
                      console.log('Маска с изображением добавлена:', mask.name, 'Растр в проекте:', maskedRaster.parent !== null, 'Позиция:', maskedRaster.position)
                      
                      // Финальная проверка - убеждаемся что оригинальный растр скрыт
                      if (raster.parent) {
                        raster.visible = false
                        console.log('👁️ Оригинальный растр скрыт (финальная проверка)')
                      }
                      
                      this.paperScope.view.draw()
                      resolve()
                    }
                  }
                  
                  // Обработка ошибок загрузки растра (как в GridsPage)
                  raster.onError = () => {
                    console.log('❌ Ошибка загрузки изображения для маски:', mask.name)
                    // Если изображение не загрузилось, показываем маску с обычной заливкой
                    path.fillColor = '#ff4757'
                    path.strokeColor = '#333'
                    path.strokeWidth = 3
                    
                    // Сохраняем ссылку на элемент
                    if (!this.maskItems) this.maskItems = {}
                    this.maskItems[mask.name] = item
                    
                    resolve()
                  }
                } else {
                  // Если нет изображений, показываем обычную маску (как в GridsPage)
                  path.fillColor = '#ff4757'
                  path.strokeColor = '#333'
                  path.strokeWidth = 3
                  
                  // Сохраняем ссылку на элемент
                  if (!this.maskItems) this.maskItems = {}
                  this.maskItems[mask.name] = item
                  
                  console.log('Обычная маска добавлена:', mask.name)
                  this.paperScope.view.draw()
                  resolve()
                }
              }
            }
          })
        })
      })
    },
    
    // Удалить маску с канваса
    removeMaskFromCanvas(maskName) {
      if (this.maskItems && this.maskItems[maskName]) {
        console.log('🗑️ Удаляем маску:', maskName)
        
        const maskItem = this.maskItems[maskName]
        if (maskItem && maskItem.parent) {
          maskItem.remove()
          console.log('✅ Маска удалена из проекта')
        }
        delete this.maskItems[maskName]
        
        this.paperScope.view.draw()
      }
    },
    
    // Парсинг SVG path data
    parseSVGPath(pathData) {
      const commands = []
      const regex = /([MLHVCSQTAZmlhvcsqtaz])\s*([^MLHVCSQTAZmlhvcsqtaz]*)/g
      let match
      let currentX = 0
      let currentY = 0
      
      while ((match = regex.exec(pathData)) !== null) {
        const command = match[1]
        const isRelative = command === command.toLowerCase()
        const upperCommand = command.toUpperCase()
        const params = match[2].trim().split(/[\s,]+/).filter(p => p !== '').map(Number)
        
        if (upperCommand === 'M') {
          const x = isRelative ? currentX + params[0] : params[0]
          const y = isRelative ? currentY + params[1] : params[1]
          commands.push({ type: 'M', x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'L') {
          const x = isRelative ? currentX + params[0] : params[0]
          const y = isRelative ? currentY + params[1] : params[1]
          commands.push({ type: 'L', x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'V') {
          // Вертикальная линия
          const y = isRelative ? currentY + params[0] : params[0]
          commands.push({ type: 'L', x: currentX, y })
          currentY = y
        } else if (upperCommand === 'H') {
          // Горизонтальная линия
          const x = isRelative ? currentX + params[0] : params[0]
          commands.push({ type: 'L', x, y: currentY })
          currentX = x
        } else if (upperCommand === 'C') {
          const x1 = isRelative ? currentX + params[0] : params[0]
          const y1 = isRelative ? currentY + params[1] : params[1]
          const x2 = isRelative ? currentX + params[2] : params[2]
          const y2 = isRelative ? currentY + params[3] : params[3]
          const x = isRelative ? currentX + params[4] : params[4]
          const y = isRelative ? currentY + params[5] : params[5]
          commands.push({ type: 'C', x1, y1, x2, y2, x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'Q') {
          const x1 = isRelative ? currentX + params[0] : params[0]
          const y1 = isRelative ? currentY + params[1] : params[1]
          const x = isRelative ? currentX + params[2] : params[2]
          const y = isRelative ? currentY + params[3] : params[3]
          commands.push({ type: 'Q', x1, y1, x, y })
          currentX = x
          currentY = y
        } else if (upperCommand === 'Z') {
          commands.push({ type: 'Z' })
        }
      }
      
      return commands
    },
    
    // Обновление стилей существующих стикеров
    updateStickerStyles() {
      if (!this.paperScope || this.stickers.length === 0) return
      
      console.log('🎨 Обновляем стили стикеров...')
      
      for (const sticker of this.stickers) {
        if (sticker.group && sticker.group.children && sticker.group.children.length >= 3) {
          // Получаем элементы стикера
          const shadowPath = sticker.group.children[0] // Тень внизу
          const clippedRaster = sticker.group.children[1] // Изображение посередине
          const outlinePath = sticker.group.children[2] // Обводка сверху
          
          // Обновляем обводку
          if (outlinePath) {
            outlinePath.strokeColor = this.strokeColor
            outlinePath.strokeWidth = this.strokeWidth
          }
          
          // Обновляем тень
          if (shadowPath) {
            const shadowAlpha = this.shadowOpacity / 100
            shadowPath.fillColor = `rgba(0, 0, 0, ${shadowAlpha})`
            shadowPath.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
            shadowPath.shadowBlur = this.shadowBlur
            shadowPath.shadowOffset = new this.paperScope.Point(
              this.shadowOffsetX,
              this.shadowOffsetY
            )
          }
        }
      }
      
      // Перерисовываем канвас
      this.paperScope.view.draw()
      console.log('✅ Стили стикеров обновлены')
    },
    
    // Оптимальная генерация стикеров (5 итераций)
    async generateOptimalStickers() {
      if (!this.paperScope) {
        console.log('❌ PaperScope не инициализирован')
        return
      }
      
      // Проверяем, что есть выбранные маски и изображения
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      const selectedImages = this.uploadedImages.filter(img => img.useInStickers)
      
      if (selectedMasks.length === 0) {
        alert('Выберите хотя бы одну форму стикера')
        return
      }
      
      if (selectedImages.length === 0) {
        alert('Загрузите и выберите хотя бы одно изображение')
        return
      }
      
      this.isLoading = true
      
      // Очищаем канвас полностью
      this.paperScope.project.clear()
      
      // Создаем белый фон
      this.createWhiteBackground()
      
      // Очищаем существующие стикеры
      this.stickers.forEach(sticker => {
        if (sticker.group) {
          sticker.group.remove()
        }
      })
      this.stickers = []
      
      // Получаем размеры канваса
      const viewWidth = this.paperScope.view.viewSize.width
      const viewHeight = this.paperScope.view.viewSize.height
      
      console.log('🎯 Запуск 1 итерации генерации стикеров:', viewWidth, 'x', viewHeight)
      
      // Запускаем 1 итерацию генерации
      await this.runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight)
    },
    
    // Запуск множественных итераций генерации
    async runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight) {
      console.log('🚀 Запуск 1 итерации генерации...')
      
      try {
        // Итерация 1: Основная генерация
        console.log('📋 Итерация 1/1: Основная генерация')
        await this.runOptimalPlacement(selectedMasks, selectedImages, viewWidth, viewHeight)
        
        console.log('🎉 Генерация завершена!')
        console.log(`📊 Итоговое количество стикеров: ${this.stickers.length} (цель: 40 стикеров)`)
        
        // Финальное обновление
        this.paperScope.view.draw()
        
        // Обновляем 3D текстуру
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              this.$refs.threeRenderer.forceUpdate()
            }
            this.isLoading = false
          }, 300)
        })
        
      } catch (error) {
        console.error('❌ Ошибка при выполнении генерации:', error)
        this.isLoading = false
      }
    },
    

    
    // Алгоритм оптимального размещения стикеров
    async runOptimalPlacement(selectedMasks, selectedImages, viewWidth, viewHeight) {
      console.log('🚀 Запуск алгоритма оптимального размещения')
      
      // Создаем сетку для отслеживания покрытия
      const gridSize = 10 // Размер ячейки сетки
      const gridCols = Math.ceil(viewWidth / gridSize)
      const gridRows = Math.ceil(viewHeight / gridSize)
      const coverageGrid = Array(gridRows).fill().map(() => Array(gridCols).fill(false))
      
      let totalCovered = 0
      let iterations = 0
      let currentCoverage = 0
      
      // Функция для расчета покрытия
      const calculateCoverage = () => {
        let covered = 0
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            if (coverageGrid[row][col]) covered++
          }
        }
        return (covered / (gridRows * gridCols)) * 100
      }
      
      // Функция для обновления сетки покрытия (учитывает стикеры за границами канваса)
      const updateCoverageGrid = (x, y, size) => {
        const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
        const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
        const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
        const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
        
        // Проверяем, что есть хотя бы одна ячейка внутри канваса
        if (startCol <= endCol && startRow <= endRow) {
          for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              coverageGrid[row][col] = true
            }
          }
        }
      }
      
      // Функция для поиска лучшей позиции (улучшенная)
      const findBestPosition = (size) => {
        let bestX = 0, bestY = 0, bestScore = -1
        
        // Сначала ищем пустые области в сетке
        const emptyAreas = []
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            if (!coverageGrid[row][col]) {
              emptyAreas.push({ row, col })
            }
          }
        }
        
        // Если есть пустые области, приоритетно размещаем в них
        if (emptyAreas.length > 0) {
          // Выбираем случайную пустую область
          const randomEmptyArea = emptyAreas[Math.floor(Math.random() * emptyAreas.length)]
          const centerX = (randomEmptyArea.col + 0.5) * gridSize
          const centerY = (randomEmptyArea.row + 0.5) * gridSize
          
          // Пробуем разместить стикер в этой области
          for (let attempt = 0; attempt < 50; attempt++) {
            const x = centerX + (Math.random() - 0.5) * gridSize * 2
            const y = centerY + (Math.random() - 0.5) * gridSize * 2
            
            // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 10% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.1) {
              continue
            }
            
            // Проверяем перекрытие с существующими стикерами (разрешено перекрытие на 30%)
            if (this.checkOverlap(x, y, size)) { // checkOverlap уже учитывает 30% перекрытие
              continue
            }
            
            // Рассчитываем "полезность" этой позиции
            let score = 0
            const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
            const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
            const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
            const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
            
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                if (!coverageGrid[row][col]) {
                  score += 2 // Увеличенный бонус за покрытие пустой области
                } else {
                  score -= 0.2 // Увеличенный штраф за перекрытие
                }
              }
            }
            
            if (score > bestScore) {
              bestScore = score
              bestX = x
              bestY = y
            }
          }
        }
        
        // Если не нашли хорошую позицию в пустых областях, пробуем случайные
        if (bestScore <= 0) {
                       for (let attempt = 0; attempt < 30; attempt++) {
               // Расширяем область поиска за пределы канваса для лучшего заполнения
               const x = (Math.random() - 0.2) * viewWidth * 1.4 // -20% до +40% от ширины
               const y = (Math.random() - 0.2) * viewHeight * 1.4 // -20% до +40% от высоты
            
            // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 10% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.1) {
              continue
            }
            
            // Проверяем перекрытие с существующими стикерами (разрешено перекрытие на 30%)
            if (this.checkOverlap(x, y, size)) { // checkOverlap уже учитывает 30% перекрытие
              continue
            }
            
            // Рассчитываем "полезность" этой позиции
            let score = 0
            const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
            const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
            const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
            const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
            
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                if (!coverageGrid[row][col]) {
                  score += 1 // Бонус за покрытие пустой области
                } else {
                  score -= 0.1 // Штраф за перекрытие
                }
              }
            }
            
            if (score > bestScore) {
              bestScore = score
              bestX = x
              bestY = y
            }
          }
        }
        
        return bestScore > 0 ? { x: bestX, y: bestY } : null
      }
      
      // Основной цикл размещения (генерируем ровно 40 стикеров)
      while (this.stickers.length < 40 && iterations < this.maxIterations) {
        iterations++
        
        // Логируем прогресс каждые 100 итераций
        if (iterations % 100 === 0) {
          console.log(`🔄 Итерация ${iterations}: размещено ${this.stickers.length}/40 стикеров`)
        }
        
        // Выбираем размер стикера в зависимости от покрытия (увеличены минимальные размеры в 3 раза)
        let sizeMultiplier
        if (currentCoverage < 50) {
          // В начале используем большие стикеры для быстрого покрытия
          sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0
        } else if (currentCoverage < 80) {
          // В середине используем средние стикеры
          sizeMultiplier = 1.2 + Math.random() * 0.6 // 1.2 - 1.8
        } else {
          // В конце используем маленькие стикеры для заполнения пустот (увеличены в 3 раза)
          sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0 (было 0.5 - 1.0)
        }
        const size = this.baseStickerSize * sizeMultiplier
        
        // Ищем лучшую позицию
        const position = findBestPosition(size)
        
        if (position) {
          // Создаем стикер (теперь асинхронно)
          try {
            const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size, this.stickers.length + 1)
            
            if (sticker) {
              this.stickers.push(sticker)
              
              // Обновляем сетку покрытия
              updateCoverageGrid(position.x, position.y, size)
              
              // Пересчитываем покрытие
              currentCoverage = calculateCoverage()
              this.coveragePercentage = Math.round(currentCoverage)
              
              console.log(`📊 Итерация ${iterations}: ${this.stickers.length} стикеров, покрытие ${this.coveragePercentage}%`)
              
              // Обновляем отображение слоев стикеров для генерации превью
              this.updateStickerLayersDisplay()
            }
          } catch (error) {
            console.error('Ошибка создания стикера:', error)
          }
        }
        
        // Обновляем канвас каждые 10 стикеров
        if (this.stickers.length % 10 === 0) {
          this.paperScope.view.draw()
        }
      }
      
      if (this.stickers.length >= 100) {
        console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
      }
      console.log(`✅ Завершено: ${this.stickers.length} стикеров (цель: 40 стикеров), покрытие ${this.coveragePercentage}%`)
      
      // Статистика распределения масок и изображений
      this.logDistributionStats(selectedMasks, selectedImages)
      
      // Финальное обновление канваса
      this.paperScope.view.draw()
      
      // Переупорядочиваем стикеры в Paper.js согласно порядку в массиве
      this.reorderStickersInPaperJS()
      
      // Обновляем стили всех стикеров
      this.updateStickerStyles()
      
      // Обновляем 3D текстуру (но не устанавливаем isLoading = false, это делается в runMultipleGenerations)
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }, 300)
      })
    },
    
    // Добавление дополнительных стикеров
    async addMoreStickers() {
      console.log('🔄 Создаем новый слой со стикерами...')
      
      // Проверяем условия
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      const selectedImages = this.uploadedImages
      
      if (selectedMasks.length === 0 || selectedImages.length === 0) {
        console.log('⚠️ Нет выбранных масок или изображений')
        return
      }
      
      this.isLoading = true
      
      try {
        // Получаем размеры канваса
        const viewWidth = this.paperScope.view.viewSize.width
        const viewHeight = this.paperScope.view.viewSize.height
        
        console.log(`🎯 Создание нового слоя стикеров: ${viewWidth} x ${viewHeight}`)
        
        // Создаем новый слой - НЕ перемещаем существующие стикеры, новые будут поверх
        console.log('🔄 Создаем новый слой поверх существующих стикеров...')
        
        // Создаем сетку для отслеживания покрытия (пустая, так как не учитываем предыдущие стикеры)
        const gridSize = 10 // Размер ячейки сетки
        const gridCols = Math.ceil(viewWidth / gridSize)
        const gridRows = Math.ceil(viewHeight / gridSize)
        
        // Инициализируем пустую сетку покрытия (не учитываем существующие стикеры)
        const coverageGrid = Array(gridRows).fill().map(() => Array(gridCols).fill(false))
        
        // Функция для обновления сетки покрытия (учитывает стикеры за границами канваса)
        const updateCoverageGrid = (x, y, size) => {
          const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
          const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
          const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
          const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
          
          // Проверяем, что есть хотя бы одна ячейка внутри канваса
          if (startCol <= endCol && startRow <= endRow) {
            for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                coverageGrid[row][col] = true
              }
            }
          }
        }
        
        // Функция для расчета покрытия
        const calculateCoverage = () => {
          let coveredCells = 0
          let totalCells = 0
          
          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              totalCells++
              if (coverageGrid[row][col]) {
                coveredCells++
              }
            }
          }
          
          return (coveredCells / totalCells) * 100
        }
        
        let currentCoverage = 0 // Начинаем с 0, так как не учитываем предыдущие стикеры
        console.log(`📊 Начинаем новый слой с покрытием: ${Math.round(currentCoverage)}%`)
        
        // Функция для поиска лучшей позиции (не учитывает существующие стикеры)
        const findBestPosition = (size) => {
          let bestX = 0, bestY = 0, bestScore = -1
          
          // Ищем пустые области в сетке (только новые стикеры)
          const emptyAreas = []
          for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
              if (!coverageGrid[row][col]) {
                emptyAreas.push({ row, col })
              }
            }
          }
          
          if (emptyAreas.length === 0) {
            console.log('✅ Нет пустых областей для размещения')
            return null
          }
          
          // Сначала пробуем разместить в пустых областях
          for (let areaIndex = 0; areaIndex < Math.min(5, emptyAreas.length); areaIndex++) {
            const randomEmptyArea = emptyAreas[Math.floor(Math.random() * emptyAreas.length)]
            const centerX = (randomEmptyArea.col + 0.5) * gridSize
            const centerY = (randomEmptyArea.row + 0.5) * gridSize
             
             // Пробуем разместить стикер в этой области
             for (let attempt = 0; attempt < 30; attempt++) {
               const x = centerX + (Math.random() - 0.5) * gridSize * 1.5
               const y = centerY + (Math.random() - 0.5) * gridSize * 1.5
               
               // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
               // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
               const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
               if (overlapWithCanvas < 0.2) {
                 continue
               }
               
               // Проверяем перекрытие только с новыми стикерами (не учитываем существующие)
               if (this.checkOverlap(x, y, size, true)) { // excludeExisting = true - не проверяем существующие стикеры
                 continue
               }
               
               // Рассчитываем "полезность" этой позиции
               let score = 0
               const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
               const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
               const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
               const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
               
               for (let row = startRow; row <= endRow; row++) {
                 for (let col = startCol; col <= endCol; col++) {
                   if (!coverageGrid[row][col]) {
                     score += 4 // Увеличенный бонус за покрытие пустой области
                   } else {
                     score -= 0.2 // Уменьшенный штраф за перекрытие
                   }
                 }
               }
               
               if (score > bestScore) {
                 bestScore = score
                 bestX = x
                 bestY = y
               }
             }
           }
           
           // Если не нашли хорошую позицию в пустых областях, пробуем случайные
           if (bestScore <= 0) {
             console.log('🔄 Пробуем случайные позиции...')
             for (let attempt = 0; attempt < 30; attempt++) {
               // Расширяем область поиска за пределы канваса для лучшего заполнения
               const x = (Math.random() - 0.2) * viewWidth * 1.4 // -20% до +40% от ширины
               const y = (Math.random() - 0.2) * viewHeight * 1.4 // -20% до +40% от высоты
               
               // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
               // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
               const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
               if (overlapWithCanvas < 0.2) {
                 continue
               }
               
               // Проверка перекрытия для случайных позиций (только с новыми стикерами)
               if (this.checkOverlap(x, y, size, true)) { // excludeExisting = true - не проверяем существующие стикеры
                 continue
               }
               
               // Рассчитываем "полезность" этой позиции
               let score = 0
               const startCol = Math.max(0, Math.floor((x - size/2) / gridSize))
               const endCol = Math.min(gridCols - 1, Math.floor((x + size/2) / gridSize))
               const startRow = Math.max(0, Math.floor((y - size/2) / gridSize))
               const endRow = Math.min(gridRows - 1, Math.floor((y + size/2) / gridSize))
               
               for (let row = startRow; row <= endRow; row++) {
                 for (let col = startCol; col <= endCol; col++) {
                   if (!coverageGrid[row][col]) {
                     score += 2 // Бонус за покрытие пустой области
                   } else {
                     score -= 0.1 // Минимальный штраф за перекрытие
                   }
                 }
               }
               
               if (score > bestScore) {
                 bestScore = score
                 bestX = x
                 bestY = y
               }
             }
           }
           
           return bestScore > 0 ? { x: bestX, y: bestY } : null
         }
        
        // Генерируем новый слой стикеров (генерируем ровно 40 стикеров)
        let iterations = 0
        const maxIterations = 40 // Генерируем ровно 40 стикеров
        
        while (this.stickers.length < 40 && iterations < maxIterations) { // Генерируем ровно 40 стикеров
          iterations++
          
          // Выбираем размер стикера в зависимости от покрытия (увеличены минимальные размеры в 3 раза)
          let sizeMultiplier
          if (currentCoverage < 50) {
            // В начале используем большие стикеры для быстрого покрытия
            sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0
          } else if (currentCoverage < 70) {
            // В середине используем средние стикеры
            sizeMultiplier = 1.2 + Math.random() * 0.6 // 1.2 - 1.8
          } else {
            // В конце используем маленькие стикеры для заполнения пустот (увеличены в 3 раза)
            sizeMultiplier = 1.5 + Math.random() * 0.5 // 1.5 - 2.0 (было 0.5 - 1.0)
          }
          
          const size = this.baseStickerSize * sizeMultiplier
          
          // Ищем лучшую позицию
          const position = findBestPosition(size)
          
          if (position) {
            // Создаем стикер
            try {
              const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size, this.stickers.length + 1)
              
              if (sticker) {
                this.stickers.push(sticker)
                updateCoverageGrid(position.x, position.y, size)
                currentCoverage = calculateCoverage()
                this.coveragePercentage = Math.round(currentCoverage)
                
                console.log(`📊 Добавлен стикер ${iterations}: покрытие ${this.coveragePercentage}%`)
                
                // Обновляем отображение слоев стикеров для генерации превью
                this.updateStickerLayersDisplay()
              }
            } catch (error) {
              console.error('Ошибка создания стикера:', error)
            }
          } else {
            console.log(`❌ Не удалось найти позицию для стикера ${iterations}`)
            break // Прерываем цикл, если не можем найти позицию
          }
        }
        
        if (this.stickers.length >= 100) {
          console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
        }
        console.log(`✅ Создан новый слой: ${iterations} стикеров (цель: 40 стикеров), покрытие: ${this.coveragePercentage}%`)
        
        // Статистика распределения масок и изображений
        this.logDistributionStats(selectedMasks, selectedImages)
        
        // Обновляем канвас только один раз в конце
        this.paperScope.view.draw()
        
        // Переупорядочиваем стикеры в Paper.js согласно порядку в массиве
        this.reorderStickersInPaperJS()
        
        // Обновляем 3D текстуру
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.threeRenderer) {
              this.$refs.threeRenderer.forceUpdate()
            }
            this.isLoading = false
          }, 300)
        })
        
      } catch (error) {
        console.error('Ошибка при добавлении стикеров:', error)
        this.isLoading = false
      }
    },
    
    // Логирование статистики распределения масок и изображений
    logDistributionStats(selectedMasks, selectedImages) {
      console.log('📊 Статистика распределения стикеров:')
      
      // Подсчитываем использование масок
      const maskUsage = {}
      selectedMasks.forEach(mask => {
        maskUsage[mask.name] = 0
      })
      
      // Подсчитываем использование изображений
      const imageUsage = {}
      selectedImages.forEach(image => {
        imageUsage[image.name] = 0
      })
      
      // Подсчитываем комбинации
      const combinationUsage = {}
      
      this.stickers.forEach((sticker, index) => {
        maskUsage[sticker.mask]++
        imageUsage[sticker.image]++
        
        const combination = `${sticker.mask} + ${sticker.image}`
        combinationUsage[combination] = (combinationUsage[combination] || 0) + 1
      })
      
      console.log('🎭 Использование масок:')
      Object.entries(maskUsage).forEach(([mask, count]) => {
        const percentage = ((count / this.stickers.length) * 100).toFixed(1)
        console.log(`  ${mask}: ${count} раз (${percentage}%)`)
      })
      
      console.log('🖼️ Использование изображений:')
      Object.entries(imageUsage).forEach(([image, count]) => {
        const percentage = ((count / this.stickers.length) * 100).toFixed(1)
        console.log(`  ${image}: ${count} раз (${percentage}%)`)
      })
      
      console.log('🎨 Уникальные комбинации:')
      Object.entries(combinationUsage).forEach(([combination, count]) => {
        const percentage = ((count / this.stickers.length) * 100).toFixed(1)
        console.log(`  ${combination}: ${count} раз (${percentage}%)`)
      })
      
      console.log(`📈 Всего уникальных комбинаций: ${Object.keys(combinationUsage).length}/${selectedMasks.length * selectedImages.length}`)
    },
    
    // Создание оптимального стикера
    createOptimalSticker(masks, images, x, y, size, originalNumber) {
      // Поочередный выбор маски и изображения для равномерного распределения
      // Используем более сбалансированную логику распределения
      const totalCombinations = masks.length * images.length
      const combinationIndex = (originalNumber - 1) % totalCombinations
      
      const maskIndex = combinationIndex % masks.length
      const imageIndex = Math.floor(combinationIndex / masks.length) % images.length
      
      const selectedMask = masks[maskIndex]
      const selectedImage = images[imageIndex]
      
      console.log(`🎨 Создаем стикер ${originalNumber}: ${selectedMask.name} + ${selectedImage.name} в позиции (${x}, ${y}) размером ${size}`)
      console.log(`📊 Распределение: комбинация ${combinationIndex + 1}/${totalCombinations}, маска=${maskIndex}/${masks.length-1}, изображение=${imageIndex}/${images.length-1}`)
      
      // Убираем случайный поворот - стикеры создаются без поворота
      const rotation = 0
      
      return new Promise((resolve) => {
        // Загружаем SVG маску (как в addMaskToCanvas)
        fetch(selectedMask.url)
          .then(response => response.text())
          .then(svgText => {
            this.paperScope.project.importSVG(svgText, {
              onLoad: (item) => {
                // Масштабируем и позиционируем
                const scale = size / 100 // Масштабируем под нужный размер
                item.scale(scale)
                item.rotate(rotation)
                // НЕ позиционируем здесь - позиционируем после обрезки
                
                if (item.children && item.children.length > 0) {
                  // Ищем путь в импортированном SVG
                  let path = null
                  
                  // Рекурсивно ищем Path в импортированном SVG
                  const findPath = (node) => {
                    if (node.className === 'Path') {
                      path = node
                      return true
                    }
                    if (node.children) {
                      for (let child of node.children) {
                        if (findPath(child)) return true
                      }
                    }
                    return false
                  }
                  
                  findPath(item)
                  
                  if (!path) {
                    console.log('⚠️ Не найден Path в SVG:', item)
                    path = item.children[0]
                  }
                  
                  // Создаем растр из изображения (новый для каждого стикера)
                  const raster = new this.paperScope.Raster(selectedImage.url)
                  raster.visible = false // Скрываем оригинальный растр
                  
                  raster.onLoad = () => {
                    console.log(`🖼️ Растр загружен: ${selectedImage.name}, размеры: ${raster.image.width}x${raster.image.height}`)
                    
                    // Создаем временный canvas для обрезки изображения
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    
                    // Получаем размеры маски
                    const maskBounds = path.bounds
                    console.log(`📐 Размеры маски ${selectedMask.name}: ${maskBounds.width}x${maskBounds.height}`)
                    
                    tempCanvas.width = maskBounds.width
                    tempCanvas.height = maskBounds.height
                    
                    // Очищаем canvas
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
                    
                    // Создаем путь маски на canvas
                    tempCtx.save()
                    tempCtx.beginPath()
                    
                    // Рисуем путь маски (как в addMaskToCanvas)
                    if (path.className === 'Path' && path.segments && path.segments.length > 0) {
                      console.log('🔍 Сегменты пути:', path.segments.length)
                      
                      // Используем более точный способ отрисовки SVG пути
                      if (path.pathData) {
                        // Если есть pathData, используем его для более точной отрисовки
                        console.log('🎯 Используем pathData для точной отрисовки')
                        console.log('📄 pathData:', path.pathData)
                        
                        // Парсим SVG path data и рисуем его на canvas
                        const pathCommands = this.parseSVGPath(path.pathData)
                        console.log('🔧 Парсированные команды:', pathCommands)
                        console.log('🔧 Первые 3 команды:', pathCommands.slice(0, 3))
                        console.log('🔧 Последние 3 команды:', pathCommands.slice(-3))
                        tempCtx.translate(-maskBounds.x, -maskBounds.y)
                        
                        // Устанавливаем fill-rule для правильной обработки отверстий
                        tempCtx.fillRule = 'evenodd'
                        
                        // Используем ручную отрисовку для более точного контроля
                        console.log('🎨 Рисуем путь вручную')
                        
                        for (const command of pathCommands) {
                          if (command.type === 'M') {
                            tempCtx.moveTo(command.x, command.y)
                          } else if (command.type === 'L') {
                            tempCtx.lineTo(command.x, command.y)
                          } else if (command.type === 'C') {
                            tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                          } else if (command.type === 'Q') {
                            tempCtx.quadraticCurveTo(command.x1, command.y1, command.x, command.y)
                          } else if (command.type === 'Z') {
                            tempCtx.closePath()
                          }
                        }
                        tempCtx.clip()
                        
                        tempCtx.translate(maskBounds.x, maskBounds.y)
                      } else {
                        // Fallback на сегменты
                        console.log('📐 Используем сегменты для отрисовки')
                        
                        // Первая точка
                        const firstPoint = path.segments[0].point
                        const relativeFirstPoint = new this.paperScope.Point(
                          firstPoint.x - maskBounds.x,
                          firstPoint.y - maskBounds.y
                        )
                        tempCtx.moveTo(relativeFirstPoint.x, relativeFirstPoint.y)
                        
                        // Остальные точки
                        let lastRelativePoint = relativeFirstPoint
                        for (let i = 1; i < path.segments.length; i++) {
                          const segment = path.segments[i]
                          const relativePoint = new this.paperScope.Point(
                            segment.point.x - maskBounds.x,
                            segment.point.y - maskBounds.y
                          )
                          tempCtx.lineTo(relativePoint.x, relativePoint.y)
                          lastRelativePoint = relativePoint
                        }
                        
                        console.log('📏 Первая точка:', relativeFirstPoint, 'Последняя точка:', lastRelativePoint)
                      }
                    } else {
                      console.log('⚠️ Нет сегментов в пути!')
                    }
                    
                    tempCtx.closePath()
                    
                    // Проверяем, что путь создан правильно
                    console.log('🔒 Путь закрыт, применяем clip()')
                    tempCtx.clip()
                    
                    // Рисуем изображение на canvas с сохранением пропорций и поворотом
                    const imgWidth = raster.image.width
                    const imgHeight = raster.image.height
                    const canvasWidth = maskBounds.width
                    const canvasHeight = maskBounds.height
                    
                    // Вычисляем масштаб для заполнения всей площади стикера
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
                    
                    // Применяем поворот к изображению
                    tempCtx.save()
                    tempCtx.translate(canvasWidth / 2, canvasHeight / 2)
                    tempCtx.rotate((rotation * Math.PI) / 180)
                    tempCtx.translate(-canvasWidth / 2, -canvasHeight / 2)
                    
                    // Рисуем изображение
                    tempCtx.drawImage(
                      raster.image,
                      offsetX,
                      offsetY,
                      scaledWidth,
                      scaledHeight
                    )
                    
                    tempCtx.restore()
                    
                    tempCtx.restore()
                    
                    // Создаем новый растр из обрезанного изображения
                    const dataURL = tempCanvas.toDataURL('image/png')
                    console.log(`✂️ Создан обрезанный растр, размер dataURL: ${dataURL.length} символов`)
                    const clippedRaster = new this.paperScope.Raster(dataURL)
                    
                    clippedRaster.onLoad = () => {
                      console.log(`✅ Обрезанный растр загружен, позиционируем в (${x}, ${y})`)
                      // Позиционируем обрезанный растр точно в центр маски
                      clippedRaster.position = new this.paperScope.Point(x, y)
                      
                      // Создаем контур для обводки
                      const outlinePath = path.clone()
                      outlinePath.position = new this.paperScope.Point(x, y)
                      
                      // Применяем обводку к контуру (фиксированные параметры)
                      const strokeWidthPixels = this.strokeWidth // Фиксированная толщина обводки
                      outlinePath.strokeColor = this.strokeColor
                      outlinePath.strokeWidth = strokeWidthPixels
                      outlinePath.fillColor = null
                      
                      // Создаем отдельную маску для тени (заполненная)
                      const shadowPath = path.clone()
                      shadowPath.position = new this.paperScope.Point(x, y)
                      // Используем shadowOpacity для прозрачности тени
                      const shadowAlpha = this.shadowOpacity / 100
                      shadowPath.fillColor = `rgba(0, 0, 0, ${shadowAlpha})` // Заполняем тень
                      shadowPath.strokeColor = null
                      
                      // Применяем тень к заполненной маске
                      shadowPath.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
                      shadowPath.shadowBlur = this.shadowBlur // Фиксированная размытость тени
                      shadowPath.shadowOffset = new this.paperScope.Point(
                        this.shadowOffsetX, // Фиксированное смещение тени по X
                        this.shadowOffsetY  // Фиксированное смещение тени по Y
                      )
                      
                      // Создаем группу стикера (правильный порядок слоев)
                      const sticker = new this.paperScope.Group()
                      sticker.addChild(shadowPath) // Тень внизу
                      sticker.addChild(clippedRaster) // Изображение посередине
                      sticker.addChild(outlinePath) // Обводка сверху
                      
                      // Добавляем группу в проект
                      this.paperScope.project.activeLayer.addChild(sticker)
                      
                      // Удаляем оригинальный импортированный элемент
                      item.remove()
                      
                      resolve({
                        group: sticker,
                        x: x,
                        y: y,
                        size: size,
                        rotation: rotation,
                        mask: selectedMask.name,
                        image: selectedImage.name,
                        originalNumber: originalNumber
                      })
                    }
                  }
                } else {
                  resolve(null)
                }
              }
            })
          })
          .catch(error => {
            console.error('Ошибка загрузки SVG:', error)
            resolve(null)
          })
      })
    },
    
    // Создание белого фона
    createWhiteBackground() {
      if (!this.paperScope) return
      
      // Создаем белый прямоугольник на весь размер канваса
      const canvasSize = this.paperScope.view.viewSize
      const whiteRect = new this.paperScope.Path.Rectangle(
        new this.paperScope.Point(0, 0),
        new this.paperScope.Point(canvasSize.width, canvasSize.height)
      )
      
      whiteRect.fillColor = 'white'
      whiteRect.strokeColor = null
      
      // Добавляем в проект
      this.paperScope.project.activeLayer.addChild(whiteRect)
      
      console.log('⬜ Белый фон создан')
    },
    
    // Проверка перекрытия стикеров (разрешено перекрытие на 70%)
    checkOverlap(x, y, size, excludeExisting = false) {
      // Убираем margin для разрешения перекрытия
      const margin = 0 // Убираем минимальное расстояние между стикерами
      
      // Всегда проверяем перекрытие с существующими стикерами, если excludeExisting = false
      const stickersToCheck = excludeExisting ? this.stickers.slice(-10) : this.stickers // Проверяем только последние 10 стикеров для новых слоев
      
      for (const sticker of stickersToCheck) {
        // Используем данные стикера для проверки перекрытия
        const stickerX = sticker.x
        const stickerY = sticker.y
        const stickerSize = sticker.size
        
        // Разрешаем перекрытие на 70% (стикеры могут заходить друг на друга на 70%)
        const overlapThreshold = 0.7 // Допускаем 70% перекрытие
        
        const newBounds = {
          left: x - size/2 * (1 - overlapThreshold) - margin,
          top: y - size/2 * (1 - overlapThreshold) - margin,
          right: x + size/2 * (1 - overlapThreshold) + margin,
          bottom: y + size/2 * (1 - overlapThreshold) + margin
        }
        
        const stickerBounds = {
          left: stickerX - stickerSize/2 * (1 - overlapThreshold) - margin,
          top: stickerY - stickerSize/2 * (1 - overlapThreshold) - margin,
          right: stickerX + stickerSize/2 * (1 - overlapThreshold) + margin,
          bottom: stickerY + stickerSize/2 * (1 - overlapThreshold) + margin
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
    
    // Расчет перекрытия стикера с канвасом
    calculateCanvasOverlap(x, y, size, viewWidth, viewHeight) {
      // Границы стикера
      const stickerLeft = x - size/2
      const stickerRight = x + size/2
      const stickerTop = y - size/2
      const stickerBottom = y + size/2
      
      // Границы канваса
      const canvasLeft = 0
      const canvasRight = viewWidth
      const canvasTop = 0
      const canvasBottom = viewHeight
      
      // Находим область пересечения
      const overlapLeft = Math.max(stickerLeft, canvasLeft)
      const overlapRight = Math.min(stickerRight, canvasRight)
      const overlapTop = Math.max(stickerTop, canvasTop)
      const overlapBottom = Math.min(stickerBottom, canvasBottom)
      
      // Если нет пересечения, возвращаем 0
      if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
        return 0
      }
      
      // Площадь пересечения
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop)
      
      // Площадь стикера
      const stickerArea = size * size
      
      // Возвращаем долю перекрытия (от 0 до 1)
      return overlapArea / stickerArea
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
            
            // НЕ обновляем канвас при загрузке изображений - только генерируем стикеры
            const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
            if (selectedMasks.length > 0) {
              this.generateOptimalStickers()
            }
          }
          reader.readAsDataURL(file)
        }
      })
      
      event.target.value = ''
    },
    
    // Удаление изображения
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
      
      // НЕ обновляем канвас при удалении изображений - только генерируем стикеры
      const selectedMasks = this.stickerMasks.filter(mask => mask.selected)
      if (selectedMasks.length > 0 && this.uploadedImages.length > 0) {
        this.generateOptimalStickers()
      }
    },
    
    // Обновление канваса с изображениями
    updateCanvasWithImages() {
      if (!this.paperScope) return
      
      // Очищаем канвас
      this.paperScope.project.clear()
      
      // Последовательно создаем слои
      this.createLayersSequentially()
    },
    
    // Последовательное создание слоев
    async createLayersSequentially() {
      if (!this.paperScope) return
      
      console.log('🎨 Начинаем последовательное создание слоев')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 1. Создаем белый слой-прослойку (самый нижний)
      await this.createWhiteOverlayLayer()
      console.log('⬜ Белый слой создан')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 2. Добавляем все выбранные маски с изображениями
      const maskPromises = []
      this.stickerMasks.forEach(mask => {
        if (mask.selected) {
          maskPromises.push(this.addMaskToCanvas(mask))
        }
      })
      
      // Ждем завершения всех операций с масками
      await Promise.all(maskPromises)
      console.log('🎭 Все маски добавлены')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      console.log('✅ Все слои созданы последовательно')
      this.paperScope.view.draw()
      
      // Переупорядочиваем стикеры в Paper.js согласно порядку в массиве
      this.reorderStickersInPaperJS()
      
      console.log('🎨 Канвас перерисован')
    },
    
    // Создание белого слоя-прослойки
    async createWhiteOverlayLayer() {
      if (!this.paperScope) return
      
      // Удаляем старый слой-прослойку, если он существует
      if (this.whiteOverlayLayer) {
        this.whiteOverlayLayer.remove()
      }
      
      // Скрываем все большие растры перед созданием белого слоя
      this.paperScope.project.activeLayer.children.forEach(child => {
        if (child.className === 'Raster' && child.bounds && 
            (child.bounds.width > 500 || child.bounds.height > 500)) {
          console.log('👁️ Скрываем большой растр:', child.bounds)
          child.visible = false
        }
      })
      console.log('👁️ Все большие растры скрыты')
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Создаем белый прямоугольник на весь размер канваса
      const canvasSize = this.paperScope.view.viewSize
      const whiteRect = new this.paperScope.Path.Rectangle(
        new this.paperScope.Point(0, 0),
        new this.paperScope.Point(canvasSize.width, canvasSize.height)
      )
      
      whiteRect.fillColor = 'white'
      whiteRect.strokeColor = null
      
      // Создаем группу для слоя-прослойки
      this.whiteOverlayLayer = new this.paperScope.Group()
      this.whiteOverlayLayer.addChild(whiteRect)
      
      // Добавляем слой-прослойку в проект
      this.paperScope.project.activeLayer.addChild(this.whiteOverlayLayer)
      
      // Перемещаем слой-прослойку под все маски (но поверх больших фотографий)
      this.whiteOverlayLayer.sendToBack()
      
      console.log('🟦 Белый слой-прослойка создан')
      await new Promise(resolve => setTimeout(resolve, 10))
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
    
    // Обработчик клика на кнопку генерации
    handleGenerateClick() {
      if (this.isFirstTime) {
        // Первый раз - показываем лайтбокс
        this.showSelectionModal = true
      } else {
        // Последующие разы - запускаем генерацию напрямую
        this.generateOptimalStickers()
      }
    },
    
    // Закрытие лайтбокса
    closeSelectionModal() {
      this.showSelectionModal = false
    },
    
    // Обработка завершения выбора в лайтбоксе
    handleSelectionFinish(data) {
      console.log('🎯 Завершен выбор в лайтбоксе:', data)
      
      // Обновляем выбранные маски
      this.stickerMasks.forEach(mask => {
        mask.selected = data.selectedMasks.some(selectedMask => selectedMask.name === mask.name)
      })
      
      // Обновляем загруженные изображения
      this.uploadedImages = data.uploadedImages.map(img => ({
        ...img,
        useInStickers: true // Автоматически помечаем для использования в стикерах
      }))
      
      // Закрываем лайтбокс
      this.closeSelectionModal()
      
      // Помечаем, что это больше не первый раз
      this.isFirstTime = false
      
      // Запускаем генерацию стикеров
      this.$nextTick(() => {
        this.generateOptimalStickers()
      })
    },
    
    
    // Обновление канваса с текстами
    updateCanvasWithTexts() {
      console.log('🚀 updateCanvasWithTexts вызван')
      // Используем nextTick для безопасной обновления
      this.$nextTick(() => {
        console.log('🔄 nextTick выполнен')
        try {
          // Удаляем существующие HTML текстовые элементы
          this.htmlTextElements.forEach(element => {
            if (element && element.parentNode) {
              try {
                element.parentNode.removeChild(element)
              } catch (e) {
                console.warn('Не удалось удалить HTML текстовый элемент:', e)
              }
            }
          })
          this.htmlTextElements = [] // Очищаем массив
          
          // Удаляем существующие текстовые элементы с Paper.js канваса
          if (this.paperScope && this.paperScope.project) {
            this.paperScope.project.getItems({ className: 'TextItem' }).forEach(item => {
              if (item.data && item.data.isTextOverlay) {
                item.remove()
              }
            })
          }
          
          // Добавляем видимые тексты
          console.log('📊 Всего текстов в массиве:', this.texts.length)
          console.log('📊 Все тексты:', this.texts)
          const visibleTexts = this.texts.filter(text => text.visible)
          console.log('📝 Добавляем тексты на канвас:', visibleTexts.length, 'текстов')
          visibleTexts.forEach((text, index) => {
            console.log(`📝 Добавляем текст ${index + 1}:`, text.content)
            const textElement = this.addTextToPaperCanvas(text)
            if (textElement) {
              this.htmlTextElements.push(textElement)
              console.log(`✅ Текст ${index + 1} добавлен успешно`)
            } else {
              console.warn(`❌ Не удалось добавить текст ${index + 1}`)
            }
          })
          
          // Переупорядочиваем стикеры в Paper.js согласно порядку в массиве
          this.reorderStickersInPaperJS()
          
          // Принудительно обновляем 3D текстуру
          this.forceUpdate3DTexture()
        } catch (error) {
          console.error('❌ Ошибка при обновлении текстов на канвасе:', error)
        }
      })
    },
    
    // Добавление текста на Paper.js канвас
    addTextToPaperCanvas(text) {
      try {
        console.log('🎯 addTextToPaperCanvas вызван с параметрами:', {
          content: text.content,
          backgroundId: text.backgroundId,
          showWithoutBackground: text.showWithoutBackground,
          fontFamily: text.fontFamily,
          fontSize: text.fontSize,
          color: text.color,
          textAlign: text.textAlign
        })
        
        const canvas = this.$refs.testCanvas
        if (!canvas) {
          console.warn('Канвас не найден')
          return null
        }
        
        // Определяем стили подложки
        let backgroundStyle = 'transparent'
        let padding = '0'
        let borderRadius = '0'
        
        if (!text.showWithoutBackground && text.backgroundId) {
          if (text.backgroundId.startsWith('svg')) {
            // SVG подложки - используем простые CSS формы
            switch (text.backgroundId) {
              case 'svg001':
                backgroundStyle = '#D9D9D9'
                padding = '8px 12px'
                borderRadius = '0'
                break
              case 'svg002':
                backgroundStyle = '#D9D9D9'
                padding = '8px 12px'
                borderRadius = '21px'
                break
              case 'svg003':
                backgroundStyle = '#D9D9D9'
                padding = '8px 12px'
                borderRadius = '50%'
                break
              default:
                backgroundStyle = 'transparent'
            }
          } else {
            // Цветные подложки
            backgroundStyle = this.getBackgroundColor(text.backgroundId)
            padding = '8px 12px'
            borderRadius = '4px'
          }
        }
        
        // Создаем Paper.js TextItem
        if (!this.paperScope) {
          console.warn('Paper.js не инициализирован')
          return null
        }
        
        // Определяем позицию текста (случайная позиция в пределах канваса)
        const canvasWidth = this.paperScope.view.size.width
        const canvasHeight = this.paperScope.view.size.height
        
        // Случайная позиция с отступами от краев
        const centerX = 100 + Math.random() * (canvasWidth - 200)
        const centerY = 100 + Math.random() * (canvasHeight - 200)
        
        // Создаем текстовый элемент с правильной точкой привязки
        const textItem = new this.paperScope.PointText({
          point: new this.paperScope.Point(centerX, centerY),
          content: text.content || '',
          fontFamily: text.fontFamily || 'Arial',
          fontSize: text.fontSize || 24,
          fillColor: text.color || '#FF0000',
          justification: text.textAlign || 'center'
        })
        
        // Устанавливаем правильную точку привязки (центр текста)
        textItem.justification = 'center'
        textItem.point = new this.paperScope.Point(centerX, centerY)
        
        // Добавляем метаданные для идентификации
        textItem.data = {
          isTextOverlay: true,
          originalText: text
        }
        
        // Создаем подложку если нужно (с задержкой для корректных bounds)
        console.log('🔍 Проверяем условие создания подложки:', {
          showWithoutBackground: text.showWithoutBackground,
          backgroundId: text.backgroundId,
          condition1: !text.showWithoutBackground,
          condition2: !!text.backgroundId,
          finalCondition: !text.showWithoutBackground && text.backgroundId
        })
        
        console.log('🔍 ДЕТАЛЬНАЯ ПРОВЕРКА ТЕКСТА:', {
          text: text,
          textKeys: Object.keys(text),
          showWithoutBackground: text.showWithoutBackground,
          backgroundId: text.backgroundId,
          backgroundIdType: typeof text.backgroundId,
          backgroundIdTruthy: !!text.backgroundId,
          condition1: !text.showWithoutBackground,
          condition2: !!text.backgroundId,
          finalCondition: !text.showWithoutBackground && text.backgroundId
        })
        
        if (!text.showWithoutBackground && text.backgroundId) {
          console.log('🎨 Создаем подложку для текста:', text.content, 'backgroundId:', text.backgroundId)
          this.$nextTick(() => {
            if (textItem.bounds) {
              console.log('📐 Bounds доступны:', textItem.bounds)
              console.log('🎯 Вызываем createBackgroundForText с параметрами:', { text, textItem })
              const background = this.createBackgroundForText(text, textItem)
              console.log('🎯 Результат createBackgroundForText:', background)
              if (background) {
                // Перемещаем подложку под текст, но над остальными элементами
                background.bringToFront()
                textItem.bringToFront()
                
                // Устанавливаем правильный z-index для подложки
                background.data = background.data || {}
                background.data.isTextBackground = true
                background.data.textId = textItem.id
                
                // УБЕЖДАЕМСЯ, что подложка добавлена в проект Paper.js
                if (this.paperScope && this.paperScope.project) {
                  // Если подложка не в проекте, добавляем её
                  if (!background.parent) {
                    this.paperScope.project.addChild(background)
                    console.log('✅ Подложка добавлена в проект Paper.js')
                  }
                  
                  const allItems = this.paperScope.project.getItems()
                  console.log('📊 Всего элементов в проекте после создания подложки:', allItems.length)
                  allItems.forEach((item, index) => {
                    if (item.data) {
                      console.log(`🔍 Элемент ${index}:`, {
                        type: item.constructor.name,
                        data: item.data,
                        id: item.id,
                        parent: item.parent ? item.parent.name : 'Корневой слой'
                      })
                    }
                  })
                }
                
                console.log('✅ Подложка создана для текста:', text.content, 'z-index установлен')
                console.log('✅ Подложка добавлена в слой:', background.parent ? background.parent.name : 'Корневой слой')
                console.log('✅ ID подложки:', background.id)
                console.log('✅ Метаданные подложки:', background.data)
                
                // СОХРАНЯЕМ ПРЯМУЮ СВЯЗЬ С ПОДЛОЖКОЙ!
                this.textBackgroundMap[textItem.id] = background
                console.log('🔗 ПРЯМАЯ СВЯЗЬ: Подложка сохранена в карте для textItem.id:', textItem.id)
              } else {
                console.warn('❌ Не удалось создать подложку для текста:', text.content)
              }
            } else {
              console.warn('❌ Не удалось создать подложку - bounds недоступны')
            }
          })
        } else {
          console.log('ℹ️ Подложка не нужна для текста:', text.content, 'showWithoutBackground:', text.showWithoutBackground, 'backgroundId:', text.backgroundId)
          console.log('ℹ️ Причина:', {
            showWithoutBackground: text.showWithoutBackground,
            backgroundId: text.backgroundId,
            reason: text.showWithoutBackground ? 'showWithoutBackground = true' : (text.backgroundId ? 'backgroundId отсутствует' : 'backgroundId = null/undefined')
          })
        }
        
        // Перемещаем текст на передний план
        textItem.bringToFront()
        
        // Создаем HTML элемент для управления (видимый для событий)
        const textElement = document.createElement('div')
        textElement.className = 'canvas-text-overlay'
        
        // Получаем размеры и позицию текста из Paper.js
        const textBounds = textItem.bounds
        const textWidth = textBounds ? textBounds.width : 100
        const textHeight = textBounds ? textBounds.height : 30
        
        // Используем центр текста для позиционирования HTML элемента
        const textCenterX = textBounds ? textBounds.center.x : centerX
        const textCenterY = textBounds ? textBounds.center.y : centerY
        
        textElement.style.cssText = `
          position: absolute;
          top: ${textCenterY}px;
          left: ${textCenterX}px;
          transform: translate(-50%, -50%);
          width: ${textWidth}px;
          height: ${textHeight}px;
          pointer-events: auto;
          cursor: pointer;
          z-index: 1000;
          background-color: rgba(255, 0, 0, 0.1);
          border: 1px dashed rgba(255, 0, 0, 0.3);
        `
        
        console.log('📐 HTML элемент управления создан:', {
          width: textWidth,
          height: textHeight,
          centerX: centerX,
          centerY: centerY
        })
        
        // Добавляем уникальный ID для текста
        const textId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        textElement.dataset.textId = textId
        textElement.dataset.paperItemId = textItem.id
        
        // Инициализируем состояние управления
        this.textControlStates[textId] = {
          isActive: false,
          isMoving: false,
          isScaling: false,
          isRotating: false,
          hasChanges: false,
          originalTransform: '',
          startX: 0,
          startY: 0,
          startScale: 1,
          startRotation: 0,
          lastRotation: null,
          continuousRotation: 0,
          lastMouseX: null,
          paperItem: textItem,
          backgroundItem: null // ПРЯМАЯ СВЯЗЬ С ПОДЛОЖКОЙ!
        }
        
        // Добавляем обработчик клика
        textElement.addEventListener('click', (e) => {
          e.stopPropagation()
          if (this.handleTextClick) {
            this.handleTextClick(textElement, textId)
          } else {
            console.warn('Метод handleTextClick не найден')
          }
        })
        
        // Добавляем элемент в контейнер канваса
        const canvasContainer = canvas.parentElement
        if (canvasContainer) {
          canvasContainer.style.position = 'relative'
          canvasContainer.appendChild(textElement)
          
          console.log('📝 Текстовый элемент создан на Paper.js канвасе:', {
            content: textItem.content,
            fontSize: textItem.fontSize,
            color: textItem.fillColor,
            position: textItem.point
          })
          
          return textElement
        }
        
        return null
      } catch (error) {
        console.error('❌ Ошибка при добавлении HTML текста:', error)
        return null
      }
    },
    
    // Создание подложки для текста
    createBackgroundForText(text, textItem) {
      try {
        console.log('🎨 Создание подложки:', text.backgroundId, 'для текста:', text.content)
        console.log('🎯 МЕТОД createBackgroundForText ВЫЗВАН!')
        console.log('🎯 Параметры метода:', { text, textItem })
        console.log('🎯 Тип textItem:', textItem ? textItem.constructor.name : 'undefined')
        console.log('🎯 Тип textItem.bounds:', textItem?.bounds ? textItem.bounds.constructor.name : 'undefined')
        
        // ДИАГНОСТИКА paperScope
        console.log('🔍 ДИАГНОСТИКА paperScope в createBackgroundForText:')
        console.log('  - paperScope существует:', !!this.paperScope)
        console.log('  - Тип paperScope:', this.paperScope ? this.paperScope.constructor.name : 'undefined')
        console.log('  - project существует:', !!(this.paperScope && this.paperScope.project))
        console.log('  - Тип project:', this.paperScope && this.paperScope.project ? this.paperScope.project.constructor.name : 'undefined')
        console.log('  - activeLayer существует:', !!(this.paperScope && this.paperScope.project && this.paperScope.project.activeLayer))
        console.log('  - Тип activeLayer:', this.paperScope && this.paperScope.project && this.paperScope.project.activeLayer ? this.paperScope.project.activeLayer.constructor.name : 'undefined')
        
        if (!textItem || !textItem.bounds) {
          console.warn('Некорректный текстовый элемент для создания подложки')
          return null
        }
        
        const bounds = textItem.bounds
        console.log('📐 Границы текста:', bounds)
        
        // Проверяем, является ли подложка SVG
        if (text.backgroundId && text.backgroundId.startsWith('svg')) {
          console.log('🎨 Создаем SVG подложку:', text.backgroundId)
          const background = this.createSvgBackground(text.backgroundId, bounds)
          if (background) {
            background.data.textId = textItem.id
            console.log('✅ Установлен textId для SVG подложки:', textItem.id)
            console.log('✅ Финальные метаданные SVG подложки:', background.data)
            console.log('✅ SVG подложка создана и готова к добавлению в проект')
          }
          return background
        } else if (text.backgroundId && text.backgroundId !== 'none') {
          // Обычная цветная подложка
          const bgColor = this.getBackgroundColor(text.backgroundId)
          console.log('🎨 Создаем цветную подложку:', bgColor)
          if (bgColor) {
            // Создаем подложку с отступами
            const expandedBounds = bounds.expand(12)
            const background = new this.paperScope.Path.Rectangle({
              rectangle: expandedBounds,
              fillColor: bgColor,
              strokeColor: null
            })
            
            // Устанавливаем метаданные для идентификации
            background.data = {
              isTextBackground: true,
              textId: textItem.id
            }
            
            // ПРИНУДИТЕЛЬНО добавляем подложку в проект Paper.js
            if (this.paperScope) {
              // Проверяем доступные способы добавления
              console.log('🔍 Проверяем paperScope для цветной подложки:', {
                hasProject: !!this.paperScope.project,
                projectType: this.paperScope.project ? this.paperScope.project.constructor.name : 'undefined',
                hasActiveLayer: !!this.paperScope.project?.activeLayer,
                activeLayerType: this.paperScope.project?.activeLayer ? this.paperScope.project.activeLayer.constructor.name : 'undefined',
                paperScopeType: this.paperScope.constructor.name
              })
              
              // ДИАГНОСТИКА доступных методов
              if (this.paperScope.project) {
                console.log('🔍 Доступные методы у project:', Object.getOwnPropertyNames(this.paperScope.project))
                console.log('🔍 Доступные методы у project.__proto__:', Object.getOwnPropertyNames(this.paperScope.project.__proto__))
                console.log('🔍 Тип addChild:', typeof this.paperScope.project.addChild)
                console.log('🔍 Тип appendChild:', typeof this.paperScope.project.appendChild)
                console.log('🔍 Тип insertChild:', typeof this.paperScope.project.insertChild)
              }
              
              try {
                // ПРИОРИТЕТ: Добавляем в корневой проект для лучшей видимости
                if (this.paperScope.project) {
                  // В Paper.js 2 используем insertItem для добавления в корневой проект
                  if (typeof this.paperScope.project.insertItem === 'function') {
                    this.paperScope.project.insertItem(background)
                    console.log('✅ Цветная подложка добавлена через project.insertItem')
                  } else if (typeof this.paperScope.project.addChild === 'function') {
                    this.paperScope.project.addChild(background)
                    console.log('✅ Цветная подложка добавлена через project.addChild')
                  } else if (typeof this.paperScope.project.appendChild === 'function') {
                    this.paperScope.project.appendChild(background)
                    console.log('✅ Цветная подложка добавлена через project.appendChild')
                  } else {
                    // Fallback: через активный слой
                    if (this.paperScope.project?.activeLayer) {
                      this.paperScope.project.activeLayer.addChild(background)
                      console.log('✅ Цветная подложка добавлена через activeLayer.addChild')
                    } else {
                      // Последний fallback: напрямую в paperScope
                      this.paperScope.addChild(background)
                      console.log('✅ Цветная подложка добавлена напрямую в paperScope')
                    }
                  }
                }
                // Fallback: через активный слой
                else if (this.paperScope.project?.activeLayer) {
                  this.paperScope.project.activeLayer.addChild(background)
                  console.log('✅ Цветная подложка добавлена через активный слой')
                }
                // Fallback: напрямую в paperScope
                else {
                  this.paperScope.addChild(background)
                  console.log('✅ Цветная подложка добавлена напрямую в paperScope')
                }
              } catch (error) {
                console.error('❌ Ошибка при добавлении цветной подложки:', error)
              }
            }
            
            console.log('✅ Цветная подложка создана:', background, 'bounds:', expandedBounds)
            return background
          }
        }
        
        console.log('❌ Не удалось создать подложку')
        return null
      } catch (error) {
        console.error('❌ Ошибка при создании подложки для текста:', error)
        return null
      }
    },
    
    // Создание SVG подложки
    createSvgBackground(svgId, textBounds) {
      try {
        // ДИАГНОСТИКА paperScope
        console.log('🔍 ДИАГНОСТИКА paperScope в createSvgBackground:')
        console.log('  - paperScope существует:', !!this.paperScope)
        console.log('  - Тип paperScope:', this.paperScope ? this.paperScope.constructor.name : 'undefined')
        console.log('  - project существует:', !!(this.paperScope && this.paperScope.project))
        console.log('  - Тип project:', this.paperScope && this.paperScope.project ? this.paperScope.project.constructor.name : 'undefined')
        console.log('  - activeLayer существует:', !!(this.paperScope && this.paperScope.project && this.paperScope.project.activeLayer))
        console.log('  - Тип activeLayer:', this.paperScope && this.paperScope.project && this.paperScope.project.activeLayer ? this.paperScope.project.activeLayer.constructor.name : 'undefined')
        
        if (!textBounds || !textBounds.center || !textBounds.size) {
          console.warn('Некорректные границы для создания SVG подложки')
          return null
        }
        
        // Создаем простые геометрические формы вместо загрузки SVG
        const center = textBounds.center
        const size = textBounds.size.multiply(1.2) // Немного больше текста
        
        let background = null
        
        switch (svgId) {
          case 'svg001':
            // Прямоугольник
            background = new this.paperScope.Path.Rectangle({
              rectangle: new this.paperScope.Rectangle(
                center.subtract(size.divide(2)),
                center.add(size.divide(2))
              ),
              fillColor: '#D9D9D9',
              strokeColor: null
            })
            break
            
          case 'svg002':
            // Прямоугольник с закругленными углами
            background = new this.paperScope.Path.Rectangle({
              rectangle: new this.paperScope.Rectangle(
                center.subtract(size.divide(2)),
                center.add(size.divide(2))
              ),
              fillColor: '#D9D9D9',
              strokeColor: null
            })
            // Добавляем закругленные углы
            if (background && typeof background.smooth === 'function') {
              background.smooth()
            }
            break
            
          case 'svg003':
            // Эллипс
            background = new this.paperScope.Path.Ellipse({
              center: center,
              size: size,
              fillColor: '#D9D9D9',
              strokeColor: null
            })
            break
            
          default:
            return null
        }
        
                    // Устанавливаем метаданные для идентификации SVG подложки
            if (background) {
              background.data = {
                isTextBackground: true,
                textId: null // Будет установлено в createBackgroundForText
              }
              
                            // ПРИНУДИТЕЛЬНО добавляем SVG подложку в проект Paper.js
              if (this.paperScope) {
                // Проверяем доступные способы добавления
                console.log('🔍 Проверяем paperScope для SVG подложки:', {
                  hasProject: !!this.paperScope.project,
                  projectType: this.paperScope.project ? this.paperScope.project.constructor.name : 'undefined',
                  hasActiveLayer: !!this.paperScope.project?.activeLayer,
                  activeLayerType: this.paperScope.project?.activeLayer ? this.paperScope.project.activeLayer.constructor.name : 'undefined',
                  paperScopeType: this.paperScope.constructor.name
                })
                
                // ДИАГНОСТИКА доступных методов
                if (this.paperScope.project) {
                  console.log('🔍 Доступные методы у project для SVG:', Object.getOwnPropertyNames(this.paperScope.project))
                  console.log('🔍 Тип addChild для SVG:', typeof this.paperScope.project.addChild)
                  console.log('🔍 Тип appendChild для SVG:', typeof this.paperScope.project.appendChild)
                  console.log('🔍 Тип insertChild для SVG:', typeof this.paperScope.project.insertChild)
                }
                
                try {
                  // ПРИОРИТЕТ: Добавляем в корневой проект для лучшей видимости
                  if (this.paperScope.project) {
                    // В Paper.js 2 используем insertItem для добавления в корневой проект
                    if (typeof this.paperScope.project.insertItem === 'function') {
                      this.paperScope.project.insertItem(background)
                      console.log('✅ SVG подложка добавлена через project.insertItem')
                    } else if (typeof this.paperScope.project.addChild === 'function') {
                      this.paperScope.project.addChild(background)
                      console.log('✅ SVG подложка добавлена через project.addChild')
                    } else if (typeof this.paperScope.project.appendChild === 'function') {
                      this.paperScope.project.appendChild(background)
                      console.log('✅ SVG подложка добавлена через project.appendChild')
                    } else {
                      // Fallback: через активный слой
                      if (this.paperScope.project?.activeLayer) {
                        this.paperScope.project.activeLayer.addChild(background)
                        console.log('✅ SVG подложка добавлена через activeLayer.addChild')
                      } else {
                        // Последний fallback: напрямую в paperScope
                        this.paperScope.addChild(background)
                        console.log('✅ SVG подложка добавлена напрямую в paperScope')
                      }
                    }
                  }
                  // Fallback: через активный слой
                  else if (this.paperScope.project?.activeLayer) {
                    this.paperScope.project.activeLayer.addChild(background)
                    console.log('✅ SVG подложка добавлена через активный слой')
                  }
                  // Fallback: напрямую в paperScope
                  else {
                    this.paperScope.addChild(background)
                    console.log('✅ SVG подложка добавлена напрямую в paperScope')
                  }
                } catch (error) {
                  console.error('❌ Ошибка при добавлении SVG подложки:', error)
                }
              }
              
              console.log('✅ SVG подложка создана с метаданными:', background)
              console.log('✅ Метаданные SVG подложки:', background.data)
              console.log('✅ Тип SVG подложки:', background.constructor.name)
              console.log('✅ SVG подложка готова к возврату')
            }
        
        return background
      } catch (error) {
        console.error('❌ Ошибка при создании SVG подложки:', error)
        return null
      }
    },
    
    // Получение цвета подложки
    getBackgroundColor(backgroundId) {
      const backgrounds = {
        'white': '#ffffff',
        'black': '#000000',
        'gray': '#f8f9fa',
        'blue': '#e3f2fd',
        'green': '#e8f5e8',
        'yellow': '#fff8e1',
        'red': '#ffebee'
      }
      return backgrounds[backgroundId] || 'transparent'
    },
    
    // Создание текстовой маски с изображением
    createTextMask(text, textItem) {
      // Здесь будет логика создания маски из текста
      // Пока оставляем заглушку
      console.log('Создание текстовой маски:', text)
    },
    
    // Обработка клика по тексту
    handleTextClick(textElement, textId) {
      console.log('🎯 handleTextClick вызван:', textId)
      
      const state = this.textControlStates[textId]
      
      if (!state) {
        console.warn('Состояние не найдено для текста:', textId)
        return
      }
      
      // Если уже активно, деактивируем
      if (state.isActive) {
        this.deactivateTextControls(textId)
        return
      }
      
      // Активируем управление
      this.activateTextControls(textElement, textId)
    },
    
    // Активация элементов управления текстом
    activateTextControls(textElement, textId) {
      console.log('🎯 activateTextControls вызван:', textId)
      
      const state = this.textControlStates[textId]
      if (!state) {
        console.warn('Состояние не найдено для активации:', textId)
        return
      }
      
      // Деактивируем предыдущий активный элемент
      if (this.activeTextElement && this.activeTextElement !== textElement) {
        const prevId = this.activeTextElement.dataset.textId
        if (prevId) {
          this.deactivateTextControls(prevId)
        }
      }
      
      this.activeTextElement = textElement
      state.isActive = true
      
      // Сохраняем оригинальное состояние
      state.originalTransform = textElement.style.transform
      
      // Создаем элементы управления
      this.createTextControls(textElement, textId)
      
      console.log('🎯 Активированы элементы управления для текста:', textId)
    },
    
    // Деактивация элементов управления
    deactivateTextControls(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      state.isActive = false
      state.isMoving = false
      state.isScaling = false
      state.isRotating = false
      
      // Удаляем элементы управления
      this.removeTextControls(textId)
      
      if (this.activeTextElement && this.activeTextElement.dataset.textId === textId) {
        this.activeTextElement = null
      }
      
      console.log('🎯 Деактивированы элементы управления для текста:', textId)
    },
    
    // Создание элементов управления
    createTextControls(textElement, textId) {
      const controlsContainer = document.createElement('div')
      controlsContainer.className = 'text-controls'
      controlsContainer.dataset.textId = textId
      controlsContainer.style.cssText = `
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 1001;
        pointer-events: auto;
      `
      
      // Иконка перемещения
      const moveIcon = this.createControlIcon('bi-arrows-move', 'Перемещение', () => {
        this.toggleTextMove(textId)
      })
      
      // Иконка масштабирования
      const scaleIcon = this.createControlIcon('bi-arrows-angle-expand', 'Масштаб', () => {
        this.toggleTextScale(textId)
      })
      
      // Иконка поворота
      const rotateIcon = this.createControlIcon('bi-arrow-clockwise', 'Поворот', () => {
        this.toggleTextRotate(textId)
      })
      
      controlsContainer.appendChild(moveIcon)
      controlsContainer.appendChild(scaleIcon)
      controlsContainer.appendChild(rotateIcon)
      
      // Добавляем контейнер к текстовому элементу
      textElement.appendChild(controlsContainer)
      
      // Добавляем обработчик клика вне элемента для деактивации
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick)
      }, 100)
    },
    
    // Создание иконки управления
    createControlIcon(iconClass, title, onClick) {
      const icon = document.createElement('div')
      icon.className = `control-icon ${iconClass}`
      icon.title = title
      icon.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #007bff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `
      
      // Очищаем содержимое перед добавлением иконки
      icon.innerHTML = ''
      
      // Создаем иконку с CSS классом для ::before псевдоэлемента
      const iconElement = document.createElement('i')
      iconElement.className = `bi ${iconClass}`
      icon.appendChild(iconElement)
      icon.addEventListener('click', (e) => {
        e.stopPropagation()
        onClick()
      })
      
      // Hover эффект
      icon.addEventListener('mouseenter', () => {
        icon.style.backgroundColor = '#0056b3'
        icon.style.transform = 'scale(1.1)'
      })
      
      icon.addEventListener('mouseleave', () => {
        icon.style.backgroundColor = '#007bff'
        icon.style.transform = 'scale(1)'
      })
      
      return icon
    },
    
    // Удаление элементов управления
    removeTextControls(textId) {
      const controls = document.querySelector(`.text-controls[data-text-id="${textId}"]`)
      if (controls) {
        controls.remove()
      }
      
      // Удаляем обработчик клика вне элемента
      document.removeEventListener('click', this.handleOutsideClick)
    },
    
    // Обработка клика вне элемента
    handleOutsideClick(e) {
      if (this.activeTextElement && !this.activeTextElement.contains(e.target)) {
        const textId = this.activeTextElement.dataset.textId
        if (textId) {
          this.deactivateTextControls(textId)
        }
      }
    },
    
    // Переключение режима перемещения
    toggleTextMove(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      if (state.isMoving) {
        this.stopTextMove(textId)
      } else {
        this.startTextMove(textId)
      }
    },
    
    // Начало перемещения
    startTextMove(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      const textElement = this.htmlTextElements.find(el => el.dataset.textId === textId)
      if (!textElement) return
      
      state.isMoving = true
      state.isScaling = false
      state.isRotating = false
      
      // Скрываем элементы управления
      const controls = textElement.querySelector('.text-controls')
      if (controls) {
        controls.style.display = 'none'
      }
      
      // Добавляем обработчики мыши
      const handleMouseMove = (e) => {
        if (!state.isMoving) return
        
        const rect = textElement.parentElement.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        // Обновляем Paper.js элемент
        if (state.paperItem) {
          const paperPoint = new this.paperScope.Point(x, y)
          state.paperItem.position = paperPoint
          
          // Обновляем подложку если есть
          console.log('🔄 Обновление подложки при перемещении текста')
          this.updateTextBackground(state.paperItem)
          
          // Принудительно обновляем Paper.js view для синхронизации
          if (this.paperScope && this.paperScope.view) {
            this.paperScope.view.update()
            console.log('🔄 Paper.js view обновлен')
          }
          
          // Обновляем HTML элемент управления
          requestAnimationFrame(() => {
            textElement.style.left = `${x}px`
            textElement.style.top = `${y}px`
            textElement.style.transform = 'translate(-50%, -50%)'
            
            // Обновляем размеры HTML элемента под новый размер текста
            const textBounds = state.paperItem.bounds
            if (textBounds) {
              textElement.style.width = `${textBounds.width}px`
              textElement.style.height = `${textBounds.height}px`
            }
          })
          
          console.log('🔄 Перемещение текста:', { x, y })
        }
        
        state.hasChanges = true
        this.showApplyButton(textId)
      }
      
      const handleMouseUp = () => {
        state.isMoving = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        
        // Показываем элементы управления
        const controls = textElement.querySelector('.text-controls')
        if (controls) {
          controls.style.display = 'flex'
        }
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      console.log('🔄 Начато перемещение текста:', textId)
    },
    
    // Остановка перемещения
    stopTextMove(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      state.isMoving = false
      console.log('🔄 Остановлено перемещение текста:', textId)
      
      // Обновляем 3D модель после завершения перемещения
      this.forceUpdate3DTexture()
    },
    
    // Переключение режима масштабирования
    toggleTextScale(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      if (state.isScaling) {
        this.stopTextScale(textId)
      } else {
        this.startTextScale(textId)
      }
    },
    
    // Начало масштабирования
    startTextScale(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      const textElement = this.htmlTextElements.find(el => el.dataset.textId === textId)
      if (!textElement) return
      
      state.isScaling = true
      state.isMoving = false
      state.isRotating = false
      state.startScale = state.paperItem ? state.paperItem.fontSize : 24
      
      // Скрываем элементы управления
      const controls = textElement.querySelector('.text-controls')
      if (controls) {
        controls.style.display = 'none'
      }
      
      // Добавляем обработчики мыши
      const handleMouseMove = (e) => {
        if (!state.isScaling) return
        
        const rect = textElement.parentElement.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        const distance = Math.abs(e.clientY - centerY)
        
        // Более интуитивное масштабирование
        const baseDistance = 50 // базовая дистанция для масштабирования
        const scaleFactor = Math.max(0.3, Math.min(5, distance / baseDistance))
        const scale = Math.max(0.5, Math.min(3, scaleFactor))
        
        const newSize = state.startScale * scale
        
        // Обновляем Paper.js элемент
        if (state.paperItem) {
          state.paperItem.fontSize = newSize
          
          // Обновляем подложку если есть
          console.log('🔄 Обновление подложки при масштабировании текста')
          this.updateTextBackground(state.paperItem)
          
          // Принудительно обновляем Paper.js view для синхронизации
          if (this.paperScope && this.paperScope.view) {
            this.paperScope.view.update()
            console.log('🔄 Paper.js view обновлен')
          }
        }
        
        // Обновляем HTML элемент управления
        requestAnimationFrame(() => {
          textElement.style.fontSize = `${newSize}px`
          
          // Обновляем размеры HTML элемента под новый размер текста
          const textBounds = state.paperItem.bounds
          if (textBounds) {
            textElement.style.width = `${textBounds.width}px`
            textElement.style.height = `${textBounds.height}px`
          }
        })
        
        state.hasChanges = true
        this.showApplyButton(textId)
      }
      
      const handleMouseUp = () => {
        state.isScaling = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        
        // Показываем элементы управления
        const controls = textElement.querySelector('.text-controls')
        if (controls) {
          controls.style.display = 'flex'
        }
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      console.log('🔍 Начато масштабирование текста:', textId)
    },
    
    // Остановка масштабирования
    stopTextScale(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      state.isScaling = false
      console.log('🔍 Остановлено масштабирование текста:', textId)
      
      // Обновляем 3D модель после завершения масштабирования
      this.forceUpdate3DTexture()
    },
    
    // Переключение режима поворота
    toggleTextRotate(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      if (state.isRotating) {
        this.stopTextRotate(textId)
      } else {
        this.startTextRotate(textId)
      }
    },
    
    // Начало поворота
    startTextRotate(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      const textElement = this.htmlTextElements.find(el => el.dataset.textId === textId)
      if (!textElement) return
      
      state.isRotating = true
      state.isMoving = false
      state.isScaling = false
      state.startRotation = 0
      state.lastRotation = null
      state.continuousRotation = 0
      state.smoothedRotation = null
      state.lastMouseX = null
      
      // Скрываем элементы управления
      const controls = textElement.querySelector('.text-controls')
      if (controls) {
        controls.style.display = 'none'
      }
      
      // Создаем визуальный индикатор вращения
      const rotationIndicator = this.createRotationIndicator(textElement)
      textElement.appendChild(rotationIndicator)
      
      // Добавляем обработчики мыши
      const handleMouseMove = (e) => {
        if (!state.isRotating) return
        
        // Инициализируем при первом вызове
        if (state.lastMouseX === null) {
          state.lastMouseX = e.clientX
          
          // Получаем текущий угол поворота из Paper.js элемента
          let currentRotation = 0
          if (state.paperItem) {
            // Конвертируем радианы в градусы
            currentRotation = (state.paperItem.rotation * 180) / Math.PI
          } else {
            // Fallback к HTML элементу
            const currentTransform = textElement.style.transform
            if (currentTransform && currentTransform.includes('rotate')) {
              const match = currentTransform.match(/rotate\(([^)]+)deg\)/)
              if (match) {
                currentRotation = parseFloat(match[1]) || 0
              }
            }
          }
          
          // Устанавливаем начальные значения без изменений
          state.continuousRotation = currentRotation
          
          console.log('🔄 Инициализация вращения:', currentRotation, 'градусов')
          
          // Пропускаем первый кадр, чтобы избежать подскакивания
          return
        }
        
        // Вычисляем изменение позиции мыши по оси X
        const deltaX = e.clientX - state.lastMouseX
        
        // Чувствительность вращения (градусов на пиксель) - ОПТИМАЛЬНАЯ
        const sensitivity = 1.5
        
        // Вычисляем изменение угла на основе движения по X
        const deltaRotation = deltaX * sensitivity
        
        // Обновляем непрерывный угол
        state.continuousRotation += deltaRotation
        
        // Обновляем последнюю позицию мыши
        state.lastMouseX = e.clientX
        
        // Нормализуем только для отображения в индикаторе
        let displayRotation = state.continuousRotation % 360
        if (displayRotation < 0) displayRotation += 360
        
        // Обновляем визуальный индикатор
        this.updateRotationIndicator(rotationIndicator, displayRotation)
        
        // СИНХРОННО обновляем ВСЕ элементы с одним источником истины!
        const rotationInRadians = (state.continuousRotation * Math.PI) / 180
        
        // 1️⃣ СНАЧАЛА обновляем Paper.js элементы (текст и подложка)
        if (state.paperItem) {
          // Обновляем текст СИНХРОННО
          state.paperItem.rotation = rotationInRadians
          
          // Обновляем подложку СИНХРОННО
          console.log('🔄 Обновление подложки при вращении текста')
          this.updateTextBackground(state.paperItem, rotationInRadians)
          
          // ПРИНУДИТЕЛЬНО обновляем Paper.js view для синхронизации
          if (this.paperScope && this.paperScope.view) {
            this.paperScope.view.update()
            console.log('🔄 Paper.js view обновлен')
            
            // ДОПОЛНИТЕЛЬНАЯ ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ
            // Убеждаемся что все Paper.js элементы обновлены
            if (this.paperScope.project) {
              this.paperScope.project.view.update()
              console.log('🔄 Paper.js project view дополнительно обновлен')
            }
            
            // РАДИКАЛЬНОЕ РЕШЕНИЕ: Дополнительная принудительная синхронизация
            // Убеждаемся что все изменения применены
            setTimeout(() => {
              if (this.paperScope && this.paperScope.view) {
                this.paperScope.view.update()
                console.log('🔄 Paper.js view дополнительно обновлен через setTimeout')
              }
            }, 0)
          }
          
          console.log('🔄 Вращение текста и подложки:', {
            degrees: state.continuousRotation,
            radians: rotationInRadians,
            position: state.paperItem.position,
            textRotation: state.paperItem.rotation,
            textBounds: state.paperItem.bounds
          })
        }
        
        // 2️⃣ ПОТОМ СИНХРОННО обновляем HTML элемент управления
        const textBounds = state.paperItem.bounds
        if (textBounds) {
          const textCenterX = textBounds.center.x
          const textCenterY = textBounds.center.y
          
          // РАДИКАЛЬНОЕ РЕШЕНИЕ: Принудительная синхронизация через requestAnimationFrame
          requestAnimationFrame(() => {
            // ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ HTML элемента с тем же углом
            textElement.style.left = `${textCenterX}px`
            textElement.style.top = `${textCenterY}px`
            textElement.style.transform = `translate(-50%, -50%) rotate(${state.continuousRotation}deg)`
            
            // Обновляем размеры HTML элемента
            textElement.style.width = `${textBounds.width}px`
            textElement.style.height = `${textBounds.height}px`
            
            // ПРИНУДИТЕЛЬНО обновляем DOM для синхронизации
            textElement.offsetHeight // force reflow
            
            // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА СИНХРОНИЗАЦИИ
            // Убеждаемся что HTML элемент действительно обновился
            const computedStyle = window.getComputedStyle(textElement)
            const actualRotation = computedStyle.transform
            console.log('🔄 Проверка синхронизации HTML элемента:', {
              expectedRotation: `${state.continuousRotation}deg`,
              actualTransform: actualRotation,
              isSynchronized: actualRotation.includes(`rotate(${state.continuousRotation}deg)`)
            })
            
            console.log('🔄 HTML элемент ПРИНУДИТЕЛЬНО синхронизирован с Paper.js:', {
              x: textCenterX,
              y: textCenterY,
              width: textBounds.width,
              height: textBounds.height,
              rotation: state.continuousRotation,
              radians: rotationInRadians,
              htmlTransform: textElement.style.transform,
              htmlLeft: textElement.style.left,
              htmlTop: textElement.style.top
            })
          })
        }
        
        state.hasChanges = true
        this.showApplyButton(textId)
      }
      
      const handleMouseUp = () => {
        state.isRotating = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        
        // Удаляем визуальный индикатор
        if (rotationIndicator && rotationIndicator.parentNode) {
          rotationIndicator.parentNode.removeChild(rotationIndicator)
        }
        
        // Показываем элементы управления
        const controls = textElement.querySelector('.text-controls')
        if (controls) {
          controls.style.display = 'flex'
        }
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      console.log('🔄 Начато вращение текста:', textId)
    },
    
    // Остановка поворота
    stopTextRotate(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      state.isRotating = false
      console.log('🔄 Остановлено вращение текста:', textId)
      
      // Обновляем 3D модель после завершения вращения
      this.forceUpdate3DTexture()
    },
    
    // Показ кнопки "Применить"
    showApplyButton(textId) {
      const state = this.textControlStates[textId]
      if (!state || !state.hasChanges) return
      
      const textElement = this.htmlTextElements.find(el => el.dataset.textId === textId)
      if (!textElement) return
      
      // Удаляем существующую кнопку
      const existingButton = textElement.querySelector('.apply-button')
      if (existingButton) {
        existingButton.remove()
      }
      
      // Создаем кнопку "Применить"
      const applyButton = document.createElement('div')
      applyButton.className = 'apply-button'
      applyButton.innerHTML = '<i class="bi bi-check-lg"></i>'
      applyButton.title = 'Применить изменения'
      applyButton.style.cssText = `
        position: absolute;
        top: -40px;
        right: -40px;
        width: 32px;
        height: 32px;
        background-color: #28a745;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        z-index: 1002;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      `
      
      applyButton.addEventListener('click', (e) => {
        e.stopPropagation()
        this.applyTextChanges(textId)
      })
      
      // Hover эффект
      applyButton.addEventListener('mouseenter', () => {
        applyButton.style.backgroundColor = '#218838'
        applyButton.style.transform = 'scale(1.1)'
      })
      
      applyButton.addEventListener('mouseleave', () => {
        applyButton.style.backgroundColor = '#28a745'
        applyButton.style.transform = 'scale(1)'
      })
      
      textElement.appendChild(applyButton)
    },
    
    // Применение изменений
    applyTextChanges(textId) {
      const state = this.textControlStates[textId]
      if (!state) return
      
      state.hasChanges = false
      
      // Удаляем кнопку "Применить"
      const textElement = this.htmlTextElements.find(el => el.dataset.textId === textId)
      if (textElement) {
        const applyButton = textElement.querySelector('.apply-button')
        if (applyButton) {
          applyButton.remove()
        }
      }
      
      console.log('✅ Изменения применены для текста:', textId)
      
      // Обновляем 3D модель после применения изменений
      this.forceUpdate3DTexture()
    },
    
    // Создание визуального индикатора вращения
    createRotationIndicator(textElement) {
      const indicator = document.createElement('div')
      indicator.className = 'rotation-indicator'
      indicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150px;
        height: 30px;
        border: 2px solid #007bff;
        border-radius: 15px;
        background: rgba(0, 123, 255, 0.1);
        pointer-events: none;
        z-index: 1003;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      
      // Создаем центральную точку
      const centerPoint = document.createElement('div')
      centerPoint.className = 'rotation-center'
      centerPoint.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        background: #007bff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 3px rgba(0, 123, 255, 0.6);
        border: 1px solid white;
      `
      
      // Создаем текст с инструкцией
      const instruction = document.createElement('div')
      instruction.className = 'rotation-instruction'
      instruction.textContent = 'Двигайте мышь влево/вправо'
      instruction.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: #007bff;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      `
      
      indicator.appendChild(centerPoint)
      indicator.appendChild(instruction)
      
      return indicator
    },
    
    // Обновление визуального индикатора вращения
    updateRotationIndicator(indicator, angle) {
      // Простое обновление без анимации
      // Индикатор остается статичным
    },
    
    // Принудительное обновление 3D текстуры
    forceUpdate3DTexture() {
      this.$nextTick(() => {
        // Обновляем Paper.js view
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.update()
        }
        
        // Принудительно обновляем 3D текстуру с задержками
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }, 100)
        
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }, 300)
        
        setTimeout(() => {
          if (this.$refs.threeRenderer) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }, 500)
      })
    },
    
    // Обновление подложки текста при трансформациях - ПРЯМАЯ СВЯЗЬ!
    updateTextBackground(textItem, rotation = null) {
      if (!this.paperScope || !this.paperScope.project) return
      
      console.log('🔄 Обновление подложки для текста:', textItem.content, 'rotation:', rotation)
      console.log('🔄 ID текстового элемента:', textItem.id)
      
      // ПРЯМАЯ СВЯЗЬ: Получаем подложку из карты!
      const background = this.textBackgroundMap[textItem.id]
      
      if (background) {
        console.log('🎨 ПРЯМАЯ СВЯЗЬ: Подложка найдена в карте!', background)
        console.log('🎨 Тип подложки:', background.constructor.name)
        console.log('🎨 Текущие свойства подложки:', {
          bounds: background.bounds,
          position: background.position,
          rotation: background.rotation
        })
        
        // Получаем текущие границы текста
        const textBounds = textItem.bounds
        if (textBounds) {
          console.log('📐 Границы текста:', textBounds)
          console.log('📐 Позиция текста:', textItem.position)
          
          // Создаем новые границы с отступами
          const expandedBounds = textBounds.expand(12)
          console.log('📐 Расширенные границы подложки:', expandedBounds)
          
          // ПРИ ПОВОРОТЕ НЕ ОБНОВЛЯЕМ РАЗМЕРЫ ПОДЛОЖКИ - только позицию!
          if (rotation !== null) {
            // При повороте обновляем только позицию, сохраняя размеры
            console.log('🔄 ПОВОРОТ: Обновляем только позицию подложки, сохраняя размеры')
            background.position = expandedBounds.center
            background.rotation = rotation
            console.log('🔄 ПОВОРОТ: Обновлена позиция и ротация подложки')
          } else {
            // При перемещении обновляем размеры и позицию
            console.log('🔄 ПЕРЕМЕЩЕНИЕ: Обновляем размеры и позицию подложки')
            
            // Обновляем позицию и размер подложки правильно
            if (background instanceof this.paperScope.Path.Rectangle) {
              // Для прямоугольников обновляем rectangle
              console.log('🔄 Обновляем rectangle подложки с:', background.rectangle, 'на:', expandedBounds)
              background.rectangle = expandedBounds
              console.log('🔄 Обновлен rectangle подложки')
            } else if (background instanceof this.paperScope.Path.Ellipse) {
              // Для эллипсов обновляем center и size
              console.log('🔄 Обновляем center подложки с:', background.center, 'на:', expandedBounds.center)
              console.log('🔄 Обновляем size подложки с:', background.size, 'на:', expandedBounds.size)
              background.center = expandedBounds.center
              background.size = expandedBounds.size
              console.log('🔄 Обновлен center и size подложки')
            } else {
              // Для других типов используем bounds
              try {
                console.log('🔄 Обновляем bounds подложки с:', background.bounds, 'на:', expandedBounds)
                background.bounds = expandedBounds
                console.log('🔄 Обновлены bounds подложки')
              } catch (error) {
                console.warn('⚠️ Не удалось обновить bounds подложки:', error)
              }
            }
          }
          
          // Ротация уже применена выше в блоке "ПРИ ПОВОРОТЕ"
          // Дополнительно не применяем, чтобы избежать дублирования
          
          console.log('✅ Обновлена подложка для текста:', textItem.content, 'bounds:', expandedBounds)
          console.log('✅ Новые свойства подложки:', {
            bounds: background.bounds,
            position: background.position,
            rotation: background.rotation
          })
        }
      } else {
        console.warn('⚠️ Подложка не найдена в карте для текста:', textItem.content, 'ID:', textItem.id)
        console.warn('⚠️ Доступные записи в карте:', Object.keys(this.textBackgroundMap))
      }
    },
    
    // === РЕЖИМ ДОБАВЛЕНИЯ ТЕКСТА ===
    
    
    
    
    

    // Настройка инструментов Paper.js для перетаскивания
    setupPaperTools() {
      if (!this.paperScope) return
      
      // Создаем инструмент для перетаскивания
      const dragTool = new this.paperScope.Tool()
      
      let dragItem = null
      let offset = null
      let clickCount = 0
      let clickTimer = null
      let selectedItem = null // Выбранный объект
      
      // Функция для снятия выделения
      const clearSelection = () => {
        if (selectedItem) {
          selectedItem.selected = false
          selectedItem = null
          console.log('🎯 Выделение снято')
        }
        // Также снимаем выделение в Vue компоненте
        if (this.selectedItem) {
          this.selectedItem.selected = false
          this.selectedItem = null
          this.selectedItemType = null
          this.selectedStickerIndex = -1
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
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 10
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          
          // Проверяем, что это текстовый элемент или подложка
          const isTextItem = item.className === 'TextItem' || 
                           item.className === 'Group' || 
                           item.className === 'Raster' ||
                           (item.parent && item.parent.className === 'Layer') ||
                           (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
          
          if (isTextItem) {
            // Снимаем предыдущее выделение при начале перетаскивания
            clearSelection()
            
            // Если это элемент стикера (обводка, тень или изображение), перетаскиваем всю группу
            if (item.parent && item.parent.className === 'Group' && item.parent.children.length >= 3) {
              // Это стикер - перетаскиваем всю группу
              dragItem = item.parent
              console.log('🎯 Начато перетаскивание стикера (группы):', dragItem.className)
            } else {
              // Это обычный текстовый элемент
              dragItem = item
              console.log('🎯 Начато перетаскивание текстового элемента:', dragItem.className, dragItem.data)
            }
            
            offset = event.point.subtract(dragItem.position)
            dragItem.selected = true
          }
        }
      }
      
      dragTool.onMouseDrag = (event) => {
        if (dragItem) {
          // Обычное перемещение
          dragItem.position = event.point.subtract(offset)
          
          // Обновляем позицию в данных слоя для всех текстовых слоев
          const layerInfo = this.textLayers.find(layer => layer.backgroundItem === dragItem || layer.layer === dragItem)
          if (layerInfo) {
            layerInfo.position = { x: event.point.x, y: event.point.y }
            console.log('📍 Обновлена позиция слоя при перетаскивании:', {
              layerIndex: layerInfo.id,
              position: layerInfo.position
            })
          }
          
          // Обновляем позицию в диалоге, если элемент редактируется
          if (this.isEditingText && this.editingLayerIndex) {
            this.textDialogPosition = {
              x: event.point.x,
              y: event.point.y
            }
            
            // Обновляем превью с throttling для визуальной обратной связи
            this.updatePreviewCanvasThrottled()
          }
          
          // Перерисовываем рендер кружки при перемещении
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      dragTool.onMouseUp = (event) => {
        if (dragItem) {
          dragItem.selected = false
          console.log('🎯 Завершено перетаскивание Paper.js элемента')
          
          dragItem = null
          offset = null
          
          // Финальная перерисовка рендера кружки после завершения перемещения
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
          }
        }
      }
      
      // Обработчик двойного клика для перемещения стикеров на верхний слой
      dragTool.onDoubleClick = (event) => {
        console.log('🎯 Двойной клик зарегистрирован в точке:', event.point)
        
        const hitResult = this.paperScope.project.hitTest(event.point, {
          segments: true,
          stroke: true,
          fill: true,
          tolerance: 15 // Увеличиваем tolerance для лучшего обнаружения
        })
        
        if (hitResult && hitResult.item) {
          const item = hitResult.item
          console.log('🎯 Найден элемент при двойном клике:', {
            className: item.className,
            parent: item.parent ? item.parent.className : 'нет родителя',
            childrenCount: item.parent ? item.parent.children.length : 0,
            item: item
          })
          
          // Проверяем, что это стикер (группа с 3+ элементами)
          if (item.parent && item.parent.className === 'Group' && item.parent.children.length >= 3) {
            const stickerGroup = item.parent
            console.log('🎯 Двойной клик на стикер, перемещаем на верхний слой')
            
            // Перемещаем стикер на верхний слой
            stickerGroup.bringToFront()
            
            // Обновляем порядок в массиве стикеров
            const stickerIndex = this.stickers.findIndex(sticker => sticker.group === stickerGroup)
            if (stickerIndex !== -1) {
              // Перемещаем стикер в начало массива (позиция 0 = самый верхний слой)
              const [movedSticker] = this.stickers.splice(stickerIndex, 1)
              this.stickers.unshift(movedSticker)
              
              // Переупорядочиваем все стикеры в Paper.js
              this.reorderStickersInPaperJS()
              
              console.log(`✅ Стикер перемещен на верхний слой (позиция 0 в списке). Новый порядок: ${this.stickers.length} стикеров`)
              
              // Обновляем отображение слоев если вкладка "Стикеры" активна
              if (this.activeTab === 'stickers') {
                this.updateStickerLayersDisplay()
              }
              
              // Обновляем 3D рендер
              if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
                this.$refs.threeRenderer.forceUpdate()
              }
            } else {
              console.warn('⚠️ Стикер не найден в массиве stickers')
            }
          } else {
            console.log('ℹ️ Двойной клик не на стикер:', {
              isGroup: item.parent && item.parent.className === 'Group',
              childrenCount: item.parent ? item.parent.children.length : 0
            })
          }
        } else {
          console.log('ℹ️ Двойной клик не попал на элемент')
        }
      }
      
      // Активируем инструмент
      dragTool.activate()
      
      console.log('🎯 Paper.js инструменты для перетаскивания настроены')
    },
    
    // Методы для управления стикерами
    selectSticker(index) {
      // Снимаем предыдущее выделение
      if (this.selectedItem) {
        this.selectedItem.selected = false
        console.log('🎯 Снято предыдущее выделение при выборе стикера в списке')
      }
      
      this.selectedStickerIndex = index
      
      // Выделяем стикер на канвасе
      if (index >= 0 && index < this.stickers.length) {
        const sticker = this.stickers[index]
        if (sticker.group) {
          sticker.group.selected = true
          this.selectedItem = sticker.group
          this.selectedItemType = 'sticker'
          console.log('🎯 Выбран стикер:', index, 'на канвасе')
        }
      } else {
        this.selectedItem = null
        this.selectedItemType = null
        this.selectedStickerIndex = -1
      }
    },
    
    
    deleteSticker(index) {
      if (index >= 0 && index < this.stickers.length) {
        const sticker = this.stickers[index]
        
        // Удаляем стикер из Paper.js
        if (sticker.group) {
          sticker.group.remove()
        }
        
        // Удаляем стикер из массива
        this.stickers.splice(index, 1)
        
        // Снимаем выделение
        this.clearAllSelection()
        
        console.log(`✅ Стикер ${index} удален`)
        
        // Принудительно обновляем Vue для отображения изменений в списке слоев
        this.$forceUpdate()
        
        // Обновляем отображение
        this.updateStickerLayersDisplay()
        
        // Обновляем 3D рендер
        if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
          this.$refs.threeRenderer.forceUpdate()
        }
      }
    },
    
    updateStickerLayersDisplay() {
      // Метод для обновления отображения слоев стикеров
      // Вызывается при изменении порядка или удалении стикеров
      console.log('🔄 Обновление отображения слоев стикеров:', {
        totalStickers: this.stickers.length,
        selectedIndex: this.selectedStickerIndex,
        activeTab: this.activeTab
      })
      
      // Генерируем превью для стикеров, у которых их еще нет
      this.stickers.forEach((sticker, index) => {
        const previewKey = `${sticker.mask}_${sticker.image}_${index}`
        if (!this.stickerPreviews[previewKey]) {
          console.log(`🔄 Генерируем превью для стикера ${index}: ${sticker.mask} + ${sticker.image}`)
          this.generateStickerPreview(sticker).then(previewDataURL => {
            if (previewDataURL) {
              this.stickerPreviews[previewKey] = previewDataURL
              console.log(`🖼️ Превью создано для стикера ${index}: ${sticker.mask} + ${sticker.image}`)
              // Принудительно обновляем Vue для отображения нового превью
              this.$nextTick(() => {
                // Vue 3 автоматически отслеживает изменения в реактивных объектах
                console.log(`✅ Превью добавлено в реактивное хранилище: ${previewKey}`)
              })
            } else {
              console.warn(`⚠️ Не удалось создать превью для стикера ${index}`)
            }
          }).catch(error => {
            console.error(`❌ Ошибка создания превью для стикера ${index}:`, error)
          })
        }
      })
    },
    
    // Генерация превью стикера для списка слоев
    generateStickerPreview(sticker) {
      console.log('🎨 Начинаем генерацию превью для стикера:', {
        mask: sticker.mask,
        image: sticker.image,
        position: { x: sticker.x, y: sticker.y },
        size: sticker.size
      })
      
      return new Promise((resolve) => {
        // Создаем временный canvas для превью
        const previewCanvas = document.createElement('canvas')
        const previewCtx = previewCanvas.getContext('2d')
        
        // Размер превью
        const previewSize = 60
        previewCanvas.width = previewSize
        previewCanvas.height = previewSize
        
        // Находим маску и изображение
        const mask = this.stickerMasks.find(m => m.name === sticker.mask)
        const image = this.uploadedImages.find(img => img.name === sticker.image)
        
        console.log('🔍 Поиск данных для превью:', {
          stickerMask: sticker.mask,
          stickerImage: sticker.image,
          availableMasks: this.stickerMasks.map(m => m.name),
          availableImages: this.uploadedImages.map(img => img.name),
          foundMask: !!mask,
          foundImage: !!image
        })
        
        if (!mask || !image) {
          console.warn('⚠️ Не найдены маска или изображение для превью:', { 
            mask: sticker.mask, 
            image: sticker.image,
            availableMasks: this.stickerMasks.map(m => m.name),
            availableImages: this.uploadedImages.map(img => img.name)
          })
          resolve(null)
          return
        }
        
        // Загружаем SVG маску
        fetch(mask.url)
          .then(response => response.text())
          .then(svgText => {
            // Создаем временный Paper scope для импорта SVG
            const tempScope = new paper.PaperScope()
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = 200
            tempCanvas.height = 200
            tempScope.setup(tempCanvas)
            
            tempScope.project.importSVG(svgText, {
              onLoad: (item) => {
                // Находим путь в SVG
                let path = null
                const findPath = (node) => {
                  if (node.className === 'Path') {
                    path = node
                    return true
                  }
                  if (node.children) {
                    for (let child of node.children) {
                      if (findPath(child)) return true
                    }
                  }
                  return false
                }
                
                findPath(item)
                
                if (!path) {
                  path = item.children[0]
                }
                
                // Создаем растр из изображения
                const raster = new tempScope.Raster(image.url)
                raster.visible = false
                
                raster.onLoad = () => {
                  // Получаем размеры маски
                  const maskBounds = path.bounds
                  
                  // Создаем временный canvas для обрезки
                  const tempCanvas = document.createElement('canvas')
                  const tempCtx = tempCanvas.getContext('2d')
                  tempCanvas.width = maskBounds.width
                  tempCanvas.height = maskBounds.height
                  
                  // Очищаем canvas
                  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
                  
                  // Рисуем путь маски
                  tempCtx.save()
                  tempCtx.beginPath()
                  
                  if (path.pathData) {
                    const pathCommands = this.parseSVGPath(path.pathData)
                    tempCtx.translate(-maskBounds.x, -maskBounds.y)
                    tempCtx.fillRule = 'evenodd'
                    
                    for (const command of pathCommands) {
                      if (command.type === 'M') {
                        tempCtx.moveTo(command.x, command.y)
                      } else if (command.type === 'L') {
                        tempCtx.lineTo(command.x, command.y)
                      } else if (command.type === 'C') {
                        tempCtx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
                      } else if (command.type === 'Z') {
                        tempCtx.closePath()
                      }
                    }
                    
                    // Обрезаем изображение по маске
                    tempCtx.clip()
                    
                    // Рисуем изображение
                    const imgWidth = raster.image.width
                    const imgHeight = raster.image.height
                    const canvasWidth = maskBounds.width
                    const canvasHeight = maskBounds.height
                    
                    const scaleX = canvasWidth / imgWidth
                    const scaleY = canvasHeight / imgHeight
                    const scale = Math.max(scaleX, scaleY) * 1.1
                    
                    const scaledWidth = imgWidth * scale
                    const scaledHeight = imgHeight * scale
                    const offsetX = (canvasWidth - scaledWidth) / 2
                    const offsetY = (canvasHeight - scaledHeight) / 2
                    
                    tempCtx.drawImage(raster.image, offsetX, offsetY, scaledWidth, scaledHeight)
                  }
                  
                  tempCtx.restore()
                  
                  // Масштабируем на превью размер
                  previewCtx.save()
                  previewCtx.drawImage(tempCanvas, 0, 0, previewSize, previewSize)
                  previewCtx.restore()
                  
                  // Конвертируем в data URL
                  const previewDataURL = previewCanvas.toDataURL('image/png')
                  resolve(previewDataURL)
                }
              }
            })
          })
          .catch(error => {
            console.error('❌ Ошибка создания превью стикера:', error)
            resolve(null)
          })
      })
    },
    
    // Обработка ошибок загрузки превью
    handlePreviewError(index) {
      console.warn(`⚠️ Ошибка загрузки превью для стикера ${index}`)
      // Можно добавить логику для повторной генерации превью
    },
    
    // Переключение на вкладку стикеров
    switchToStickersTab() {
      this.activeTab = 'stickers'
      // Обновляем отображение слоев стикеров и генерируем превью
      this.$nextTick(() => {
        this.updateStickerLayersDisplay()
      })
    },
    
    // === МЕТОДЫ ПЕРЕТАСКИВАНИЯ СЛОЕВ ===
    
    // Начало перетаскивания
    handleDragStart(index, event) {
      this.draggedIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', event.target.outerHTML)
      
      // Добавляем класс для визуальной обратной связи
      event.target.style.opacity = '0.5'
      
      console.log(`🔄 Начато перетаскивание слоя ${index}`)
    },
    
    // Завершение перетаскивания
    handleDragEnd(event) {
      event.target.style.opacity = '1'
      this.draggedIndex = -1
      this.dragOverIndex = -1
      
      console.log('✅ Перетаскивание завершено')
    },
    
    // Перетаскивание над элементом
    handleDragOver(index, event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      
      if (index !== this.draggedIndex) {
        this.dragOverIndex = index
      }
    },
    
    // Покидание области перетаскивания
    handleDragLeave(event) {
      // Проверяем, что мы действительно покинули элемент (а не его дочерний элемент)
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.dragOverIndex = -1
      }
    },
    
    // Сброс слоя
    handleDrop(targetIndex, event) {
      event.preventDefault()
      
      if (this.draggedIndex === -1 || this.draggedIndex === targetIndex) {
        return
      }
      
      console.log(`🎯 Перемещение слоя с позиции ${this.draggedIndex} на позицию ${targetIndex}`)
      console.log(`📋 Новая логика: позиция ${targetIndex} = ${targetIndex === 0 ? 'самый верхний' : targetIndex === this.stickers.length - 1 ? 'самый нижний' : 'средний'} слой`)
      
      // Перемещаем стикер в массиве
      const draggedSticker = this.stickers[this.draggedIndex]
      this.stickers.splice(this.draggedIndex, 1)
      this.stickers.splice(targetIndex, 0, draggedSticker)
      
      // Обновляем индексы в Paper.js для корректного отображения слоев
      this.reorderStickersInPaperJS()
      
      // Обновляем выбранный индекс если необходимо
      if (this.selectedStickerIndex === this.draggedIndex) {
        this.selectedStickerIndex = targetIndex
      } else if (this.selectedStickerIndex > this.draggedIndex && this.selectedStickerIndex <= targetIndex) {
        this.selectedStickerIndex--
      } else if (this.selectedStickerIndex < this.draggedIndex && this.selectedStickerIndex >= targetIndex) {
        this.selectedStickerIndex++
      }
      
      // Обновляем превью
      this.updateStickerPreviews()
      
      // Обновляем 3D модель
      if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
        this.$refs.threeRenderer.forceUpdate()
      }
      
      // Сбрасываем состояния перетаскивания
      this.draggedIndex = -1
      this.dragOverIndex = -1
      
      console.log('✅ Слой успешно перемещен')
    },
    
    // Переупорядочивание стикеров в Paper.js
    reorderStickersInPaperJS() {
      console.log('🔄 Переупорядочивание стикеров в Paper.js...')
      
      // Сначала перемещаем все стикеры на задний план
      this.stickers.forEach((sticker, index) => {
        if (sticker.group) {
          sticker.group.sendToBack()
        }
      })
      
      // Затем перемещаем их в правильном порядке
      // Индекс 0 = самый верхний слой (первый в списке)
      // Индекс N = самый нижний слой (последний в списке)
      // Идем в обратном порядке, чтобы индекс 0 стал самым верхним
      for (let i = this.stickers.length - 1; i >= 0; i--) {
        const sticker = this.stickers[i]
        if (sticker.group) {
          sticker.group.bringToFront()
          console.log(`📌 Стикер ${i} (${sticker.mask}) - ${i === 0 ? 'самый верхний' : 'слой ' + i}`)
        }
      }
      
      // Обновляем Paper.js view
      if (this.paperScope && this.paperScope.view) {
        this.paperScope.view.update()
      }
      
      console.log('✅ Переупорядочивание стикеров завершено')
    },
    
    // ========== МЕТОДЫ ДЛЯ УПРАВЛЕНИЯ ТЕКСТОВЫМИ СЛОЯМИ ==========
    
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
      
      // Обновляем 3D модель
      if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
        this.$refs.threeRenderer.forceUpdate()
      }
      
      // Сбрасываем состояния перетаскивания
      this.draggedTextIndex = -1
      this.dragOverTextIndex = -1
      
      console.log('✅ Текстовый слой успешно перемещен')
    },
    
    // Перемещение текстового слоя на верхний уровень
    moveTextLayerToTop(index) {
      if (index >= 0 && index < this.textLayers.length) {
        // Перемещаем текстовый слой в начало массива (позиция 0 = самый верхний слой)
        const [movedLayer] = this.textLayers.splice(index, 1)
        this.textLayers.unshift(movedLayer)
        
        // Переупорядочиваем все текстовые слои в Paper.js
        this.reorderTextLayersInPaperJS()
        
        console.log(`✅ Текстовый слой ${index} перемещен на верхний слой (позиция 0 в списке)`)
        
        // Обновляем 3D модель
        if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
          this.$refs.threeRenderer.forceUpdate()
        }
      }
    },
    
    // Обновление превью после изменения порядка
    updateStickerPreviews() {
      // Очищаем старые превью
      this.stickerPreviews = {}
      
      // Генерируем новые превью в правильном порядке
      this.$nextTick(() => {
        this.updateStickerLayersDisplay()
      })
    },
    
    // Глобальный метод для снятия выделения
    clearAllSelection() {
      if (this.selectedItem) {
        this.selectedItem.selected = false
        this.selectedItem = null
        this.selectedItemType = null
        this.selectedStickerIndex = -1
        console.log('🎯 Все выделения сняты')
      }
    },
    
    // Обновление выбранного стикера в списке слоев
    updateSelectedStickerInLayers(selectedGroup) {
      const stickerIndex = this.stickers.findIndex(sticker => sticker.group === selectedGroup)
      if (stickerIndex !== -1) {
        this.selectedStickerIndex = stickerIndex
        console.log('🎯 Выбранный стикер обновлен в слоях:', stickerIndex, '(верхний слой = индекс 0)')
      } else {
        this.selectedStickerIndex = -1
        console.warn('⚠️ Выбранный стикер не найден в массиве stickers')
      }
    },
    
    // Обработчик одинарного клика для выбора объектов
    handleSingleClick(event, clearSelection) {
      console.log('🎯 Обработка одинарного клика в точке:', event.point)
      
      const hitResult = this.paperScope.project.hitTest(event.point, {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 15
      })
      
      if (hitResult && hitResult.item) {
        const item = hitResult.item
        
        // Проверяем, что это текстовый элемент или стикер
        const isTextItem = item.className === 'TextItem' || 
                         item.className === 'Group' || 
                         item.className === 'Raster' ||
                         (item.parent && item.parent.className === 'Layer') ||
                         (item.data && (item.data.isTextOverlay || item.data.isTextBackground))
        
        if (isTextItem) {
          // Определяем, что выбираем (стикер или текстовый элемент)
          let targetItem = item
          let isSticker = false
          
          if (item.parent && item.parent.className === 'Group' && item.parent.children.length >= 3) {
            // Это стикер - выбираем всю группу
            targetItem = item.parent
            isSticker = true
            console.log('🎯 Выбран стикер (группа):', targetItem.className)
          } else {
            // Это обычный текстовый элемент
            console.log('🎯 Выбран текстовый элемент:', targetItem.className, targetItem.data)
          }
          
          // Снимаем предыдущее выделение только если выбираем другой объект
          if (this.selectedItem && this.selectedItem !== targetItem) {
            this.selectedItem.selected = false
            console.log('🎯 Снято предыдущее выделение')
          }
          
          // Выделяем новый объект
          targetItem.selected = true
          
          // Сохраняем ссылку на выбранный объект
          this.selectedItem = targetItem
          this.selectedItemType = isSticker ? 'sticker' : 'text'
          
          // Обновляем отображение слоев если вкладка "Стикеры" активна
          if (isSticker && this.activeTab === 'stickers') {
            this.updateSelectedStickerInLayers(targetItem)
          }
          
          console.log('✅ Объект выбран:', {
            type: isSticker ? 'sticker' : 'text',
            className: targetItem.className
          })
        } else {
          // Клик не на текстовый элемент - снимаем выделение
          clearSelection()
          console.log('ℹ️ Клик не на текстовый элемент, выделение снято')
        }
      } else {
        // Клик в пустое место - снимаем выделение
        clearSelection()
        this.selectedItem = null
        this.selectedItemType = null
        console.log('ℹ️ Клик в пустое место, выделение снято')
      }
    },
    
    // Обработчик двойного клика для стикеров
    handleDoubleClick(event) {
      console.log('🎯 Обработка двойного клика в точке:', event.point)
      
      // Снимаем выделение при двойном клике
      this.clearAllSelection()
      
      const hitResult = this.paperScope.project.hitTest(event.point, {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 15
      })
      
      if (hitResult && hitResult.item) {
        const item = hitResult.item
        console.log('🎯 Найден элемент при двойном клике:', {
          className: item.className,
          parent: item.parent ? item.parent.className : 'нет родителя',
          childrenCount: item.parent ? item.parent.children.length : 0
        })
        
        // Проверяем, что это стикер (группа с 3+ элементами)
        if (item.parent && item.parent.className === 'Group' && item.parent.children.length >= 3) {
          const stickerGroup = item.parent
          console.log('🎯 Двойной клик на стикер, перемещаем на верхний слой')
          
          // Перемещаем стикер на верхний слой
          stickerGroup.bringToFront()
          
          // Обновляем порядок в массиве стикеров
          const stickerIndex = this.stickers.findIndex(sticker => sticker.group === stickerGroup)
          if (stickerIndex !== -1) {
            // Перемещаем стикер в начало массива (верхний слой)
            const [movedSticker] = this.stickers.splice(stickerIndex, 1)
            this.stickers.unshift(movedSticker)
            
            console.log(`✅ Стикер перемещен на верхний слой. Новый порядок: ${this.stickers.length} стикеров`)
            
            // Обновляем индекс выбранного стикера (теперь он на позиции 0)
            this.selectedStickerIndex = 0
            
            // Принудительно обновляем Vue для отображения изменений в списке слоев
            this.$forceUpdate()
            
            // Обновляем отображение слоев если вкладка "Стикеры" активна
            if (this.activeTab === 'stickers') {
              this.updateStickerLayersDisplay()
            }
            
            // Обновляем 3D рендер
            if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
              this.$refs.threeRenderer.forceUpdate()
            }
          } else {
            console.warn('⚠️ Стикер не найден в массиве stickers')
          }
        } else if (item.className === 'Raster' || item.className === 'Group') {
          // Проверяем, что это текстовый слой
          const textLayerIndex = this.textLayers.findIndex(layer => layer.layer === item || layer.backgroundItem === item)
          if (textLayerIndex !== -1) {
            console.log('🎯 Двойной клик на текстовый слой, перемещаем на верхний слой')
            
            // Перемещаем текстовый слой в начало массива (верхний слой)
            const [movedLayer] = this.textLayers.splice(textLayerIndex, 1)
            this.textLayers.unshift(movedLayer)
            
            // Переупорядочиваем все текстовые слои в Paper.js
            this.reorderTextLayersInPaperJS()
            
            console.log(`✅ Текстовый слой перемещен на верхний слой. Новый порядок: ${this.textLayers.length} слоев`)
            
            // Принудительно обновляем Vue для отображения изменений в списке слоев
            this.$forceUpdate()
            
            // Обновляем 3D рендер
            if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
              this.$refs.threeRenderer.forceUpdate()
            }
          } else {
            console.log('ℹ️ Двойной клик не на текстовый слой')
          }
        } else {
          console.log('ℹ️ Двойной клик не на стикер или текстовый слой')
        }
      } else {
        console.log('ℹ️ Двойной клик не попал на элемент')
      }
    },


    // === МЕТОДЫ ОБРАБОТКИ СОБЫТИЙ TEXTMANAGER ===

    // Обработчик открытия диалога TextManager
    onTextDialogOpened() {
      console.log('📝 TextManager: диалог открыт')
      // Можно добавить дополнительную логику при открытии диалога
    },

    // Обработчик закрытия диалога TextManager
    onTextDialogClosed() {
      console.log('📝 TextManager: диалог закрыт')
      // Можно добавить дополнительную логику при закрытии диалога
    },

    // Обработчик применения текста из TextManager
    onTextApplied(event) {
      console.log('📝 TextManager: применение текста', event)
      
      const { textData, mode, position, isEditing, editingLayerIndex } = event
      
      if (isEditing && editingLayerIndex !== null) {
        // Редактирование существующего текста - обновляем существующий слой
        this.updateExistingTextLayer(editingLayerIndex, textData, position, mode)
      } else {
        // Создание нового текста
        this.applyTextToCanvas(textData, position, mode)
      }
    },
    
    
    
    // Обновление превью канваса
    updatePreviewCanvas() {
      console.log('🔄 Обновление превью канваса, активная вкладка:', this.textDialogActiveTab)
      
      // Обновляем превью канвасы только если диалог открыт
      if (this.showTextDialog) {
                // Обновляем все превью канвасы
          this.updateSinglePreviewCanvas(this.$refs.previewCanvas)
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasThoughts)
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasStandard)
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasImageText)
      
      // Принудительно обновляем активную вкладку
      if (this.textDialogActiveTab === 'thoughts') {
        console.log('🧠 Принудительное обновление режима "Мысли"')
        this.$nextTick(() => {
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasThoughts)
        })
      } else if (this.textDialogActiveTab === 'standard') {
        console.log('⭐ Принудительное обновление режима "Стандарт"')
        this.$nextTick(() => {
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasStandard)
        })
      } else if (this.textDialogActiveTab === 'image-text') {
        console.log('🖼️ Принудительное обновление режима "Текст с изображением"')
          console.log('🔍 Проверка ref previewCanvasImageText:', {
            ref: this.$refs.previewCanvasImageText,
            exists: !!this.$refs.previewCanvasImageText
          })
        this.$nextTick(() => {
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasImageText)
        })
        }
      } else {
        console.log('⚠️ Диалог закрыт, пропускаем обновление превью канвасов')
      }
    },
    
    // Настройка HiDPI для превью канваса
    setupPreviewCanvasHiDPI(previewCanvas) {
      if (!previewCanvas) return
      
      const dpr = window.devicePixelRatio || 1
      
      // ИСПРАВЛЕНИЕ: Используем фиксированные размеры из computed свойств
      // Это предотвращает изменение размеров при переключении вкладок
      const fixedWidth = this.previewCanvasWidth
      const fixedHeight = this.previewCanvasHeight
      
      // Устанавливаем физические размеры с учетом HiDPI
      previewCanvas.width = fixedWidth * dpr
      previewCanvas.height = fixedHeight * dpr
      
      // Устанавливаем логические размеры (фиксированные)
      previewCanvas.style.width = fixedWidth + 'px'
      previewCanvas.style.height = fixedHeight + 'px'
      
      // Масштабируем контекст
      const ctx = previewCanvas.getContext('2d')
      ctx.scale(dpr, dpr)
      
      console.log('🖥️ Настройка HiDPI для превью канваса (ФИКСИРОВАННЫЕ размеры):', {
        logicalSize: `${fixedWidth}x${fixedHeight}`,
        physicalSize: `${previewCanvas.width}x${previewCanvas.height}`,
        dpr: dpr,
        note: 'Используем фиксированные размеры для предотвращения изменений при переключении вкладок'
      })
    },
    
    // Обновление одного превью канваса
    updateSinglePreviewCanvas(previewCanvas) {
      const mainCanvas = this.$refs.testCanvas
      
      if (!previewCanvas || !mainCanvas) {
        console.log('⚠️ Канвасы не найдены для превью', {
          previewCanvas: !!previewCanvas,
          mainCanvas: !!mainCanvas,
          previewCanvasRef: previewCanvas,
          mainCanvasRef: mainCanvas
        })
        return
      }
      
      // Настраиваем HiDPI для превью канваса
      this.setupPreviewCanvasHiDPI(previewCanvas)
      
      console.log('🔄 Обновление превью канваса')
      console.log('🎯 textDialogPosition:', this.textDialogPosition)
      console.log('🎯 textDialogData.text:', this.textDialogData.text)
      
      // Получаем контекст превью канваса
      const previewCtx = previewCanvas.getContext('2d')
      
      // Получаем размеры канваса (используем стили, так как getBoundingClientRect может вернуть 0)
      let canvasWidth = parseFloat(previewCanvas.style.width) || previewCanvas.width / (window.devicePixelRatio || 1)
      let canvasHeight = parseFloat(previewCanvas.style.height) || previewCanvas.height / (window.devicePixelRatio || 1)
      
      // Если размеры все еще нулевые, используем размеры основного канваса
      if (canvasWidth === 0 || canvasHeight === 0) {
        const container = mainCanvas.parentElement
        if (container) {
          canvasWidth = container.clientWidth
          canvasHeight = (canvasWidth * 9) / 19
        }
      }
      
      // Очищаем превью
      previewCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      
      // При редактировании отключаем редактируемый слой перед скриншотом
      let editingLayer = null
      if (this.isEditingText && this.editingLayerIndex) {
        editingLayer = this.textLayers.find(layer => layer.id === this.editingLayerIndex)
        if (editingLayer && editingLayer.layer) {
          editingLayer.layer.visible = false
          console.log('👁️ Отключаем редактируемый слой для скриншота:', this.editingLayerIndex)
          
          // Обновляем Paper.js канвас после отключения слоя
          this.paperScope.view.draw()
        }
      }
      
      // Копируем содержимое основного канваса в превью
      previewCtx.drawImage(mainCanvas, 0, 0, canvasWidth, canvasHeight)
      
      // Включаем обратно редактируемый слой после скриншота
      if (editingLayer && editingLayer.layer) {
        editingLayer.layer.visible = true
        console.log('👁️ Включаем обратно редактируемый слой:', this.editingLayerIndex)
        
        // Обновляем Paper.js канвас после включения слоя
        this.paperScope.view.draw()
      }
      
      // Определяем, какой это канвас и соответствует ли он активной вкладке
      let currentCanvasTab = null
      if (previewCanvas === this.$refs.previewCanvas) {
        currentCanvasTab = 'conversation'
      } else if (previewCanvas === this.$refs.previewCanvasThoughts) {
        currentCanvasTab = 'thoughts'
      } else if (previewCanvas === this.$refs.previewCanvasStandard) {
        currentCanvasTab = 'standard'
      } else if (previewCanvas === this.$refs.previewCanvasImageText) {
        currentCanvasTab = 'image-text'
      }
      
      console.log('🎯 updateSinglePreviewCanvas:', {
        activeTab: this.textDialogActiveTab,
        currentCanvasTab: currentCanvasTab,
        shouldUpdate: currentCanvasTab === this.textDialogActiveTab,
        hasPosition: !!this.textDialogPosition,
        position: this.textDialogPosition ? `${this.textDialogPosition.x}, ${this.textDialogPosition.y}` : 'null',
        hasText: !!this.textDialogData.text,
        text: this.textDialogData.text || 'empty'
      })
      
      // Обновляем только соответствующий активной вкладке канвас
      if (currentCanvasTab === this.textDialogActiveTab && this.textDialogPosition) {
        if (this.textDialogData.text) {
          // Показываем введенный текст
        if (this.textDialogActiveTab === 'thoughts') {
          console.log('🧠 ВЫЗЫВАЕМ РЕЖИМ "МЫСЛИ"')
          this.drawTextPreviewOnCanvasThoughtsMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'standard') {
          console.log('⭐ ВЫЗЫВАЕМ РЕЖИМ "СТАНДАРТ"')
          this.drawTextPreviewOnCanvasStandardMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'image-text') {
          console.log('🖼️ ВЫЗЫВАЕМ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ"')
          this.drawTextPreviewOnCanvasImageTextMode(previewCtx, previewCanvas)
        } else {
          console.log('💬 ВЫЗЫВАЕМ РЕЖИМ "РАЗГОВОР"')
          this.drawTextPreviewOnCanvas(previewCtx, previewCanvas)
        }
        } else {
        // Показываем дефолтный текст "Текст" на дефолтной подложке
        console.log('📝 ВЫЗЫВАЕМ ДЕФОЛТНЫЙ ТЕКСТ')
        if (this.textDialogActiveTab === 'thoughts') {
          this.drawDefaultTextPreviewOnCanvasThoughtsMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'standard') {
          this.drawDefaultTextPreviewOnCanvasStandardMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'image-text') {
          this.drawDefaultTextPreviewOnCanvasImageTextMode(previewCtx, previewCanvas)
        } else {
          this.drawDefaultTextPreviewOnCanvas(previewCtx, previewCanvas)
          }
        }
      }
      
      console.log('✅ Превью канваса обновлено')
    },
    
    // Отрисовка текста с подложкой на превью канвасе
    drawTextPreviewOnCanvas(ctx, canvas) {
      if (!this.textDialogPosition || !this.textDialogData.text) return
      
      console.log('🎨 Отрисовка текста на превью:', this.textDialogData.text)
      console.log('🎯 Параметры хвоста в начале метода:', {
        tailSize: this.textDialogData.tailSize,
        tailWidth: this.textDialogData.tailWidth,
        tailAngle: this.textDialogData.tailAngle
      })
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1 // Убираем масштабирование
      
      // ЛОГИРОВАНИЕ для отладки - МЕТОД 1
      const rect = canvas.getBoundingClientRect()
      console.log('🎨 ОТРИСОВКА МЕТОД 1:', {
        previewScale: previewScale.toFixed(3),
        previewCanvasPhysical: `${canvas.width}x${canvas.height}`,
        previewCanvasLogical: `${rect.width}x${rect.height}`,
        position: `${previewX}, ${previewY}`
      })
      
      // Настройки текста БЕЗ масштабирования - МЕТОД 1
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = this.textDialogData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, this.textDialogData.text, fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Размеры подложки (адаптированные под превью)
      const backgroundWidth = Math.max(
        this.textDialogData.backgroundWidth, 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        this.textDialogData.backgroundHeight, 
        textHeight + padding * 2
      )
      
      // Позиция подложки (центрируем относительно точки клика)
      const bgX = previewX - backgroundWidth / 2
      const bgY = previewY - backgroundHeight / 2
      
      // Сначала рисуем тень если включена (применяется к объединенной фигуре)
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = this.textDialogData.shadowBlur
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY
      }
      
      // Рисуем объединенную фигуру (подложка + хвост) с тенью
      this.drawCombinedShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, backgroundColor, true)
      
      // Сбрасываем тень
      if (this.textDialogData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена (применяется к объединенной фигуре)
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth
        this.strokeCombinedShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale)
      }
      
      // Рисуем текст с поддержкой переноса строк
      ctx.fillStyle = textColor
      this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      
      console.log('✅ Текст с подложкой отрисован на превью')
    },
    
    // ⭐ РЕЖИМ "СТАНДАРТ" - отрисовка без хвоста
    drawTextPreviewOnCanvasStandardMode(ctx, canvas) {
      if (!this.textDialogPosition || !this.textDialogData.text) return
      
      console.log('⭐ Отрисовка текста в режиме "Стандарт" без хвоста:', this.textDialogData.text)
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = this.textDialogData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, this.textDialogData.text, fontSize, this.textDialogData.lineHeight)
      
      // Размеры подложки (адаптированные под превью)
      const bgWidth = this.textDialogData.backgroundWidth
      const bgHeight = this.textDialogData.backgroundHeight
      
      // Рисуем подложку БЕЗ хвоста (только прямоугольник)
      this.drawStandardModeShape(ctx, previewX, previewY, bgWidth, bgHeight, previewScale, backgroundColor)
      
      // Рисуем текст с поддержкой переноса строк
      ctx.fillStyle = textColor
      this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      
      console.log('✅ Текст в режиме "Стандарт" отрисован без хвоста')
    },
    
    // Отрисовка формы для режима "Стандарт" (только прямоугольник, без хвоста)
    drawStandardModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor) {
      console.log('⭐ Отрисовка формы "Стандарт" - только прямоугольник без хвоста')
      
      // Сначала рисуем тень если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor
        ctx.shadowBlur = this.textDialogData.shadowBlur * scale
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX * scale
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY * scale
        ctx.globalAlpha = this.textDialogData.shadowOpacity / 100
        
        // Рисуем тень
        ctx.fillStyle = backgroundColor
        ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1
      }
      
      // Затем рисуем основную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // В конце применяем обводку если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth * scale
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      }
      
      console.log('✅ Форма "Стандарт" отрисована - только прямоугольник')
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
    
    // 🧠 РЕЖИМ "МЫСЛИ" - новая архитектура суперподложки
    // Отрисовка овальной подложки с множественными овальными хвостами
    drawThoughtsModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true) {
      console.log('🧠 Отрисовка режима "Мысли" - овальная подложка с множественными хвостами')
      
      // Рисуем каждый овал отдельно, чтобы избежать создания общего пути
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor)
      
      console.log('✅ Режим "Мысли" отрисован - только овалы, без треугольников!')
    },
    
    // 🧠 РЕЖИМ "МЫСЛИ" с переданными данными
    drawThoughtsModeShapeWithData(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true, textData = null) {
      console.log('🧠 Отрисовка режима "Мысли" с переданными данными - овальная подложка с множественными хвостами')
      
      // Рисуем каждый овал отдельно, чтобы избежать создания общего пути
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor, textData)
      
      console.log('✅ Режим "Мысли" отрисован с переданными данными - только овалы, без треугольников!')
    },
    
    // Метод для режима "Мысли" - овальная подложка с множественными хвостами
    drawTextPreviewOnCanvasThoughtsMode(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('🧠 ТЕСТИРОВАНИЕ РЕЖИМА "МЫСЛИ" - овальная подложка')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Настройки текста
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = this.textDialogData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, this.textDialogData.text, fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Размеры подложки - используем тот же подход, что и в режиме "Разговор"
      const backgroundWidth = Math.max(
        this.textDialogData.backgroundWidth, 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        this.textDialogData.backgroundHeight, 
        textHeight + padding * 2
      )
      
      console.log('🧠 Размеры подложки режима "Мысли":', {
        backgroundWidth: backgroundWidth,
        backgroundHeight: backgroundHeight,
        textWidth: textWidth,
        textHeight: textHeight,
        padding: padding,
        previewScale: previewScale
      })
      
      // Рисуем режим "Мысли" - овальная подложка с множественными хвостами
      this.drawThoughtsModeShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, backgroundColor, true, true)
      
      // Рисуем текст с поддержкой переноса строк
      ctx.fillStyle = textColor
      this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      
      console.log('✅ Режим "Мысли" отрисован на превью')
    },
    
    // Дефолтная подложка для режима "Мысли" - без треугольника
    drawDefaultTextPreviewOnCanvasThoughtsMode(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('🧠 ДЕФОЛТНАЯ подложка режима "Мысли" - овальная без треугольника')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Размеры дефолтной подложки - увеличиваем для лучшей видимости
      const backgroundWidth = 200
      const backgroundHeight = 80
      
      console.log('🧠 Дефолтная подложка - параметры:', {
        backgroundWidth: backgroundWidth,
        backgroundHeight: backgroundHeight,
        previewScale: previewScale,
        drawTail: true
      })
      
      // Рисуем режим "Мысли" - основной овал + хвост (всегда показываем хвост в режиме "Мысли")
      this.drawThoughtsModeShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, '#f0f0f0', false, true)
      
      // Рисуем дефолтный текст "Текст"
      ctx.font = `400 24px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#333'
      ctx.fillText('Текст', previewX, previewY)
      
      console.log('✅ Дефолтная подложка режима "Мысли" отрисована')
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
    
    // Упрощенный метод для режима "Мысли" - без сложной математики
    
    // Вспомогательный метод для отрисовки овала
    drawOval(ctx, centerX, centerY, width, height) {
      // Используем эллипс для отрисовки овала
      ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI)
    },
    
    // Вспомогательный метод для расчета размеров многострочного текста
    calculateMultilineTextSize(ctx, text, fontSize, lineHeight = 1.2) {
      const lines = text.split('\n')
      ctx.font = `${this.textDialogData.fontWeight} ${fontSize}px ${this.textDialogData.font}`
      
      let maxWidth = 0
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line)
        maxWidth = Math.max(maxWidth, textMetrics.width)
      })
      
      const totalHeight = lines.length * fontSize * lineHeight
      
      return { width: maxWidth, height: totalHeight }
    },
    
    // Метод для отрисовки многострочного текста с поддержкой переноса строк
    drawMultilineText(ctx, text, x, y, fontSize, lineHeight = 1.2) {
      // Разбиваем текст на строки по символу \n
      const lines = text.split('\n')
      
      // Устанавливаем размер шрифта
      ctx.font = `${this.textDialogData.fontWeight} ${fontSize}px ${this.textDialogData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = this.textDialogData.textAlign
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
        const lineY = startY + (index * lineSpacing)
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if (this.textDialogData.textAlign === 'left') {
          lineX = x - maxTextWidth / 2
        } else if (this.textDialogData.textAlign === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        ctx.fillText(line, lineX, lineY)
      })
    },
    
    // Отрисовка обводки многострочного текста
    drawMultilineTextStroke(ctx, text, x, y, fontSize, lineHeight = 1.2) {
      // Разбиваем текст на строки по символу \n
      const lines = text.split('\n')
      
      // Устанавливаем размер шрифта
      ctx.font = `${this.textDialogData.fontWeight} ${fontSize}px ${this.textDialogData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = this.textDialogData.textAlign
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
        const lineY = startY + (index * lineSpacing)
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if (this.textDialogData.textAlign === 'left') {
          lineX = x - maxTextWidth / 2
        } else if (this.textDialogData.textAlign === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        ctx.strokeText(line, lineX, lineY)
      })
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
      // Разбиваем текст на строки по символу \n
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
    
    // Обводка режима "Мысли"
    strokeThoughtsModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // Создаем путь для обводки
      ctx.beginPath()
      
      // Строим путь для режима "Мысли"
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, true, this.textDialogData.backgroundColor)
      
      // Обводим фигуру
      ctx.stroke()
    },
    
    // Отрисовка дефолтного текста "Текст" на превью канвасе
    drawDefaultTextPreviewOnCanvas(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('🎨 Отрисовка дефолтного текста на превью')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые - МЕТОД 2
      const previewScale = 1 // Убираем масштабирование
      
      // ЛОГИРОВАНИЕ для отладки - МЕТОД 2
      const rect = canvas.getBoundingClientRect()
      console.log('🎨 ОТРИСОВКА МЕТОД 2:', {
        previewScale: previewScale.toFixed(3),
        previewCanvasPhysical: `${canvas.width}x${canvas.height}`,
        previewCanvasLogical: `${rect.width}x${rect.height}`,
        position: `${previewX}, ${previewY}`
      })
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = this.textDialogData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, 'Текст', fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Размеры подложки (адаптированные под превью)
      const backgroundWidth = Math.max(
        this.textDialogData.backgroundWidth, 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        this.textDialogData.backgroundHeight, 
        textHeight + padding * 2
      )
      
      // Позиция подложки (центрируем относительно точки клика)
      const bgX = previewX - backgroundWidth / 2
      const bgY = previewY - backgroundHeight / 2
      
      // Рисуем подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(bgX, bgY, backgroundWidth, backgroundHeight)
      
      // Сначала рисуем тень если включена (применяется к объединенной фигуре)
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = this.textDialogData.shadowBlur
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY
      }
      
      // Рисуем объединенную фигуру (подложка + хвост) с тенью
      this.drawCombinedShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, backgroundColor, true)
      
      // Сбрасываем тень
      if (this.textDialogData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена (применяется к объединенной фигуре)
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth
        this.strokeCombinedShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale)
      }
      
      // Рисуем текст
      ctx.fillStyle = textColor
      ctx.fillText('Текст', previewX, previewY)
      
      console.log('✅ Дефолтный текст с подложкой отрисован на превью')
    },
    
    // ⭐ РЕЖИМ "СТАНДАРТ" - дефолтный текст без хвоста
    drawDefaultTextPreviewOnCanvasStandardMode(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('⭐ Отрисовка дефолтного текста в режиме "Стандарт" без хвоста')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = this.textDialogData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, 'Текст', fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Размеры подложки (адаптированные под превью)
      const backgroundWidth = Math.max(
        this.textDialogData.backgroundWidth, 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        this.textDialogData.backgroundHeight, 
        textHeight + padding * 2
      )
      
      // Рисуем подложку БЕЗ хвоста (только прямоугольник)
      this.drawStandardModeShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, backgroundColor)
      
      // Рисуем текст
      ctx.fillStyle = textColor
      ctx.fillText('Текст', previewX, previewY)
      
      console.log('✅ Дефолтный текст в режиме "Стандарт" отрисован без хвоста')
    },
    
    // 🖼️ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ" - отрисовка без подложки, тень и обводка к тексту
    drawTextPreviewOnCanvasImageTextMode(ctx, canvas) {
      if (!this.textDialogPosition || !this.textDialogData.text) return
      
      console.log('🖼️ Отрисовка текста в режиме "Текст с изображением" без подложки:', this.textDialogData.text)
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Применяем тень к тексту если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor
        ctx.shadowBlur = this.textDialogData.shadowBlur * previewScale
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX * previewScale
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY * previewScale
        ctx.globalAlpha = this.textDialogData.shadowOpacity / 100
        
        // Рисуем тень текста
        this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1
      }
      
      // Рисуем основной текст с поддержкой переноса строк
      if (this.textDialogData.textImage && this.textDialogDataImageText.cachedImage) {
        // Если есть изображение, используем его как маску для заливки текста
        const img = this.textDialogDataImageText.cachedImage
        
        // Создаем временный канвас для текста с изображением
        const textCanvas = document.createElement('canvas')
        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        const textCtx = textCanvas.getContext('2d')
        
        // Вычисляем размеры текста для правильного позиционирования изображения
        const textWidth = ctx.measureText(this.textDialogData.text).width
        const textHeight = this.textDialogData.fontSize * previewScale * this.textDialogData.lineHeight
        
        // Вычисляем правильные пропорции изображения
        const imgAspectRatio = img.width / img.height
        const textAspectRatio = textWidth / textHeight
        
        let drawWidth, drawHeight, drawX, drawY
        
        if (imgAspectRatio > textAspectRatio) {
          // Изображение шире - подгоняем по высоте
          drawHeight = textHeight
          drawWidth = drawHeight * imgAspectRatio
          drawX = previewX - drawWidth / 2
          drawY = previewY - textHeight / 2
        } else {
          // Изображение выше - подгоняем по ширине
          drawWidth = textWidth
          drawHeight = drawWidth / imgAspectRatio
          drawX = previewX - textWidth / 2
          drawY = previewY - drawHeight / 2
        }
        
        // Рисуем изображение на временном канвасе
        textCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        
        // Создаем маску из текста
        textCtx.globalCompositeOperation = 'destination-in'
        textCtx.font = ctx.font
        textCtx.textAlign = ctx.textAlign
        textCtx.textBaseline = ctx.textBaseline
        textCtx.fillStyle = 'white'
        this.drawMultilineText(textCtx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
        
        // Рисуем результат на основном канвасе
        ctx.drawImage(textCanvas, 0, 0)
      } else {
        // Если нет изображения, используем обычную заливку цветом
        ctx.fillStyle = textColor
        this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      }
      
      // Применяем обводку к тексту если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth * previewScale
        this.drawMultilineTextStroke(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      }
      
      console.log('✅ Текст в режиме "Текст с изображением" отрисован без подложки')
    },
    
    // Отрисовка формы для режима "Текст с изображением" (только прямоугольник, без хвоста)
    drawImageTextModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor) {
      console.log('🖼️ Отрисовка формы "Текст с изображением" - только прямоугольник без хвоста')
      
      // Сначала рисуем тень если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor
        ctx.shadowBlur = this.textDialogData.shadowBlur * scale
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX * scale
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY * scale
        ctx.globalAlpha = this.textDialogData.shadowOpacity / 100
        
        // Рисуем тень
        ctx.fillStyle = backgroundColor
        ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1
      }
      
      // Затем рисуем основную подложку
      ctx.fillStyle = backgroundColor
      ctx.fillRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      
      // В конце применяем обводку если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth * scale
        ctx.strokeRect(centerX - bgWidth/2, centerY - bgHeight/2, bgWidth, bgHeight)
      }
      
      console.log('✅ Форма "Текст с изображением" отрисована - только прямоугольник')
    },
    
    // 🖼️ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ" - дефолтный текст без подложки
    drawDefaultTextPreviewOnCanvasImageTextMode(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('🖼️ Отрисовка дефолтного текста в режиме "Текст с изображением" без подложки')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogData.fontSize
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Применяем тень к тексту если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor
        ctx.shadowBlur = this.textDialogData.shadowBlur * previewScale
        ctx.shadowOffsetX = this.textDialogData.shadowOffsetX * previewScale
        ctx.shadowOffsetY = this.textDialogData.shadowOffsetY * previewScale
        ctx.globalAlpha = this.textDialogData.shadowOpacity / 100
        
        // Рисуем тень текста
        ctx.fillText('Текст', previewX, previewY)
        
        // Сбрасываем настройки тени
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1
      }
      
      // Рисуем основной текст
      if (this.textDialogData.textImage && this.textDialogDataImageText.cachedImage) {
        // Если есть изображение, используем его как маску для заливки текста (как в основном канвасе)
        const img = this.textDialogDataImageText.cachedImage
        
        // Создаем временный канвас для текста с изображением
        const textCanvas = document.createElement('canvas')
        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        const textCtx = textCanvas.getContext('2d')
        
        // Вычисляем размеры дефолтного текста для правильного позиционирования изображения
        const textWidth = ctx.measureText('Текст').width
        const textHeight = this.textDialogData.fontSize * previewScale * this.textDialogData.lineHeight
        
        // Используем точные размеры текста для изображения (как в основном канвасе)
        const drawWidth = textWidth
        const drawHeight = textHeight
        const drawX = previewX - drawWidth / 2
        const drawY = previewY - drawHeight / 2
        
        // Рисуем изображение на временном канвасе
        textCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        
        // Создаем маску из текста (destination-in как в основном канвасе)
        textCtx.globalCompositeOperation = 'destination-in'
        textCtx.font = ctx.font
        textCtx.textAlign = ctx.textAlign
        textCtx.textBaseline = ctx.textBaseline
        textCtx.fillStyle = 'white'
        textCtx.fillText('Текст', previewX, previewY)
        
        // Рисуем результат на основном канвасе
        ctx.drawImage(textCanvas, 0, 0)
      } else {
        // Если нет изображения, используем обычную заливку цветом
        ctx.fillStyle = textColor
        ctx.fillText('Текст', previewX, previewY)
      }
      
      // Применяем обводку к тексту если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = this.textDialogData.strokeWidth * previewScale
        ctx.strokeText('Текст', previewX, previewY)
      }
      
      console.log('✅ Дефолтный текст в режиме "Текст с изображением" отрисован без подложки')
    },
    
    // Отрисовка хвоста (острого треугольника с прямым углом)
    drawTail(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      console.log('🎨 Начинаем отрисовку хвоста:', { centerX, centerY, bgWidth, bgHeight, scale })
      
      // Параметры хвоста - приводим к числам и устанавливаем минимумы
      const tailSize = Math.max(0.1, Number(this.textDialogData.tailSize) / 100) // Минимум 10% от размера подложки
      const tailWidth = Math.max(0.1, Number(this.textDialogData.tailWidth) / 100) // Минимум 10% от размера подложки
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180 // Угол в радианах
      
      console.log('📐 Параметры хвоста:', { 
        tailSize: this.textDialogData.tailSize, 
        tailWidth: this.textDialogData.tailWidth, 
        tailAngle: this.textDialogData.tailAngle,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        tailAngleRad: tailAngle
      })
      
      // Размеры хвоста (управляются ползунками)
      // Длина хвоста - привязываем к минимальному размеру подложки
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * tailSize // Длина хвоста от минимального размера
      
      // Ширина основания - ограничиваем минимальным размером подложки
      const maxBaseWidth = minDimension * 0.8 // Максимум 80% от минимального размера
      const tailBaseWidth = Math.min(minDimension * tailWidth, maxBaseWidth)
      
      console.log('📏 Размеры хвоста:', { 
        tailLength, 
        tailBaseWidth, 
        bgHeight, 
        bgWidth, 
        minDimension,
        maxBaseWidth,
        actualTailWidth: tailBaseWidth
      })
      
      // НОВАЯ ЛОГИКА: Прямой угол хвоста в центре подложки
      const rightAngleX = centerX // Прямой угол в центре подложки
      const rightAngleY = centerY
      
      // Вычисляем координаты острой вершины хвоста (выходит из центра подложки)
      const sharpPointX = centerX + tailLength * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * Math.sin(tailAngle)
      
      // Вычисляем координаты основания хвоста (перпендикулярно к направлению хвоста)
      const baseAngle = tailAngle + Math.PI / 2 // Перпендикулярный угол
      const basePoint1X = centerX + (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint1Y = centerY + (tailBaseWidth / 2) * Math.sin(baseAngle)
      const basePoint2X = centerX - (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint2Y = centerY - (tailBaseWidth / 2) * Math.sin(baseAngle)
      
      console.log('📍 Координаты хвоста:', {
        rightAngle: { x: rightAngleX, y: rightAngleY },
        sharpPoint: { x: sharpPointX, y: sharpPointY },
        basePoint1: { x: basePoint1X, y: basePoint1Y },
        basePoint2: { x: basePoint2X, y: basePoint2Y }
      })
      
      // Рисуем треугольник хвоста
      ctx.beginPath()
      ctx.moveTo(rightAngleX, rightAngleY) // Прямой угол (центр подложки)
      ctx.lineTo(basePoint1X, basePoint1Y) // Первая точка основания
      ctx.lineTo(sharpPointX, sharpPointY) // Острая вершина
      ctx.lineTo(basePoint2X, basePoint2Y) // Вторая точка основания
      ctx.closePath()
      
      // Заполняем хвост цветом подложки
      ctx.fillStyle = this.textDialogData.backgroundColor
      ctx.fill()
      
      console.log('✅ Хвост отрисован успешно')
    },
    
    // Отрисовка объединенной фигуры (подложка + хвост) как единое целое
    drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
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
    
    // Построение пути для суперподложки (подложка + хвост как единая фигура)
    buildUnifiedShapePath(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // Параметры хвоста
      const tailSize = Number(this.textDialogData.tailSize) / 100 // От 100% до 300%
      const tailWidth = Number(this.textDialogData.tailWidth) / 100 // От 40% до 100%
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * 1.25 // Базовая длина хвоста (125% от минимального размера - увеличен в 2.5 раза)
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      // Вычисляем точку пересечения линии хвоста с границей подложки
      const intersectionPoint = this.getTailIntersectionWithBackground(
        centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight
      )
      
      if (intersectionPoint) {
        // Создаем суперподложку с хвостом
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   intersectionPoint, tailAngle, tailLength, tailWidth, this.textDialogData)
      } else {
        // Если нет пересечения, рисуем обычную подложку
        this.buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight)
      }
    },
    
    // Вычисление точки пересечения линии хвоста с границей подложки
    getTailIntersectionWithBackground(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight) {
      // Линия хвоста: от центра подложки под углом tailAngle
      const lineStartX = centerX
      const lineStartY = centerY
      const lineEndX = centerX + 1000 * Math.cos(tailAngle) // Достаточно длинная линия
      const lineEndY = centerY + 1000 * Math.sin(tailAngle)
      
      // Проверяем пересечение с каждой стороной подложки
      const sides = [
        // Верхняя сторона
        { x1: bgX, y1: bgY, x2: bgX + bgWidth, y2: bgY },
        // Правая сторона
        { x1: bgX + bgWidth, y1: bgY, x2: bgX + bgWidth, y2: bgY + bgHeight },
        // Нижняя сторона
        { x1: bgX + bgWidth, y1: bgY + bgHeight, x2: bgX, y2: bgY + bgHeight },
        // Левая сторона
        { x1: bgX, y1: bgY + bgHeight, x2: bgX, y2: bgY }
      ]
      
      // Собираем ВСЕ пересечения
      const allIntersections = []
      
      for (const side of sides) {
        const intersection = this.getLineIntersection(
          lineStartX, lineStartY, lineEndX, lineEndY,
          side.x1, side.y1, side.x2, side.y2
        )
        
        if (intersection) {
          // Проверяем, что точка пересечения находится на стороне подложки
          if (this.isPointOnLineSegment(intersection.x, intersection.y, side.x1, side.y1, side.x2, side.y2)) {
            allIntersections.push(intersection)
          }
        }
      }
      
      if (allIntersections.length > 0) {
        // ВЫБИРАЕМ БЛИЖАЙШУЮ К УГЛУ ТОЧКУ ПЕРЕСЕЧЕНИЯ
        let selectedIntersection = allIntersections[0]
        let minDistance = Infinity
        
        // Вычисляем расстояния до всех углов
        const corners = [
          { name: 'Левый верхний', x: bgX, y: bgY },
          { name: 'Правый верхний', x: bgX + bgWidth, y: bgY },
          { name: 'Правый нижний', x: bgX + bgWidth, y: bgY + bgHeight },
          { name: 'Левый нижний', x: bgX, y: bgY + bgHeight }
        ]
        
        for (const intersection of allIntersections) {
          for (const corner of corners) {
            const distance = Math.sqrt(
              Math.pow(intersection.x - corner.x, 2) +
              Math.pow(intersection.y - corner.y, 2)
            )
            if (distance < minDistance) {
              minDistance = distance
              selectedIntersection = intersection
            }
          }
        }
        
        console.log('🎯 Выбрана БЛИЖАЙШАЯ К УГЛУ точка пересечения:', selectedIntersection)
        console.log('📍 Минимальное расстояние до угла:', minDistance.toFixed(2))
        console.log('📍 Все найденные пересечения:', allIntersections)
        console.log('---')
        return selectedIntersection
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
    
    // Построение пути суперподложки с хвостом
    buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                           intersectionPoint, tailAngle, tailLength, tailWidth, textData = null, scale = 1) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
      // Вычисляем параметры хвоста
      // Используем переданный tailWidth (уже в процентах от 0 до 1) или берем из данных
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
      ctx.beginPath()
      ctx.rect(bgX, bgY, bgWidth, bgHeight)
      ctx.closePath()
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
      
      // Если хвост точно выходит из угла, используем специальную логику
      if (isTopLeft || isTopRight || isBottomRight || isBottomLeft) {
        // Масштабируем ширину хвоста пропорционально разрешению для сохранения
        const tailWidthPixels = tailWidthPercent * 50 * scale // Формула из TextManager.vue с масштабированием
        console.log('🔍 buildCornerTailSuperPath DEBUG:', {
          tailWidthPercent,
          tailWidthPixels,
          scale,
          formula: 'tailWidthPercent * 50 * scale'
        })
        this.buildExactCornerTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                         intersectionPoint, sharpPointX, sharpPointY, 
                                         isTopLeft, isTopRight, isBottomRight, isBottomLeft, 
                                         tailWidthPixels)
        return
      }
      
      // Если хвост выходит НЕ точно из угла, а рядом с углом, используем старую логику
      // Вычисляем точки хвоста НА СТОРОНАХ ПРЯМОУГОЛЬНИКА
      // Масштабируем ширину хвоста пропорционально разрешению для сохранения
      const tailWidthPixels = tailWidthPercent * 50 * scale // Формула из TextManager.vue с масштабированием
      console.log('🔍 buildCornerTailSuperPath (non-exact) DEBUG:', {
        tailWidthPercent,
        tailWidthPixels,
        scale,
        formula: 'tailWidthPercent * 50 * scale'
      })
      
      // Сбрасываем флаги углов для второй проверки
      isTopLeft = false
      isTopRight = false
      isBottomRight = false
      isBottomLeft = false
      
      // Определяем, какой это угол (с большей толерантностью)
      const cornerTolerance = 10
      if (Math.abs(intersectionPoint.x - bgX) < cornerTolerance && Math.abs(intersectionPoint.y - bgY) < cornerTolerance) {
        isTopLeft = true
      } else if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < cornerTolerance && Math.abs(intersectionPoint.y - bgY) < cornerTolerance) {
        isTopRight = true
      } else if (Math.abs(intersectionPoint.x - (bgX + bgWidth)) < cornerTolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < cornerTolerance) {
        isBottomRight = true
      } else if (Math.abs(intersectionPoint.x - bgX) < cornerTolerance && Math.abs(intersectionPoint.y - (bgY + bgHeight)) < cornerTolerance) {
        isBottomLeft = true
      }
      
      if (isTopLeft) {
        // Левый верхний угол - точки на верхней стороне
        let point1X = bgX + tailWidthPixels
        let point1Y = bgY
        let point2X = bgX + tailWidthPixels * 2
        let point2Y = bgY
        
        // Проверяем, не выходит ли точка2 за правую границу
        if (point2X > bgX + bgWidth) {
          // Переходим на правую сторону и продолжаем движение вниз
          point2X = bgX + bgWidth
          point2Y = bgY + ((bgX + tailWidthPixels * 2) - (bgX + bgWidth))
        }
        
        // Строим путь: левый верхний угол → точка1 → острая вершина → точка2 → правый верхний угол → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (isTopRight) {
        // Правый верхний угол - точки на верхней стороне
        let point1X = bgX + bgWidth - tailWidthPixels * 2
        let point1Y = bgY
        let point2X = bgX + bgWidth - tailWidthPixels
        let point2Y = bgY
        
        // Проверяем, не выходит ли точка1 за левую границу
        if (point1X < bgX) {
          // Переходим на левую сторону и продолжаем движение вниз
          point1X = bgX
          point1Y = bgY + (bgX - (bgX + bgWidth - tailWidthPixels * 2))
        }
        
        // Строим путь: левый верхний угол → правый верхний угол → точка1 → острая вершина → точка2 → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (isBottomRight) {
        // Правый нижний угол - точки на правой стороне
        let point1X = bgX + bgWidth
        let point1Y = bgY + bgHeight - tailWidthPixels * 2
        let point2X = bgX + bgWidth
        let point2Y = bgY + bgHeight - tailWidthPixels
        
        // Проверяем, не выходит ли точка1 за верхнюю границу
        if (point1Y < bgY) {
          // Переходим на верхнюю сторону и продолжаем движение влево
          point1X = bgX + bgWidth - (bgY - (bgY + bgHeight - tailWidthPixels * 2))
          point1Y = bgY
        }
        
        // Строим путь: левый верхний угол → верхняя сторона → правый верхний угол → правая сторона → точка1 → острая вершина → точка2 → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (isBottomLeft) {
        // Левый нижний угол - точки на левой стороне
        let point1X = bgX
        let point1Y = bgY + bgHeight - tailWidthPixels
        let point2X = bgX
        let point2Y = bgY + bgHeight - tailWidthPixels * 2
        
        // Проверяем, не выходит ли точка2 за верхнюю границу
        if (point2Y < bgY) {
          // Переходим на верхнюю сторону и продолжаем движение вправо
          point2X = bgX + (bgY - (bgY + bgHeight - tailWidthPixels))
          point2Y = bgY
        }
        
        // Строим путь: левый верхний угол → верхняя сторона → правый верхний угол → правая сторона → нижняя сторона → точка1 → острая вершина → точка2 → левая сторона
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX, bgY)
      }
    },
    
    // Построение пути суперподложки с хвостом точно из угла
    buildExactCornerTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                 intersectionPoint, sharpPointX, sharpPointY, 
                                 isTopLeft, isTopRight, isBottomRight, isBottomLeft, 
                                 tailWidthPixels) {
      
      if (isTopLeft) {
        // Хвост точно из левого верхнего угла
        // Точка1 на центральной линии хвоста (место пересечения с гранью)
        // Точка2 на левой грани со смещением от пересечения
        const point1X = bgX + tailWidthPixels
        const point1Y = bgY
        const point2X = bgX
        const point2Y = bgY + tailWidthPixels
        
        console.log('🔺 isTopLeft - Точки:')
        console.log('  A (угол):', {x: bgX, y: bgY})
        console.log('  D (угол):', {x: bgX, y: bgY + bgHeight})
        console.log('  point1 (HR):', {x: point1X, y: point1Y})
        console.log('  HE (вершина):', {x: sharpPointX, y: sharpPointY})
        console.log('  point2 (HL):', {x: point2X, y: point2Y})
        
        // Строим путь: левый верхний угол A → точка1 (HR) → острая вершина HE → точка2 (HL) → левая сторона → остальные стороны
        ctx.moveTo(bgX, bgY)  // A
        ctx.lineTo(point1X, point1Y)  // HR (на центральной линии)
        ctx.lineTo(sharpPointX, sharpPointY)  // HE
        ctx.lineTo(point2X, point2Y)  // HL
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX, bgY)  // A (замыкаем)
        
      } else if (isTopRight) {
        // Хвост точно из правого верхнего угла
        // Точка1 на центральной линии хвоста (место пересечения с гранью)
        // Точка2 на правой грани со смещением от пересечения
        const point1X = bgX + bgWidth - tailWidthPixels
        const point1Y = bgY
        const point2X = bgX + bgWidth
        const point2Y = bgY + tailWidthPixels
        
        console.log('🔺 isTopRight - Точки:')
        console.log('  B (угол):', {x: bgX + bgWidth, y: bgY})
        console.log('  C (угол):', {x: bgX + bgWidth, y: bgY + bgHeight})
        console.log('  point1 (HR):', {x: point1X, y: point1Y})
        console.log('  HE (вершина):', {x: sharpPointX, y: sharpPointY})
        console.log('  point2 (HL):', {x: point2X, y: point2Y})
        
        // Строим путь: правый верхний угол B → точка1 (HR) → острая вершина HE → точка2 (HL) → правая сторона → остальные стороны
        ctx.moveTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(point1X, point1Y)  // HR (на центральной линии)
        ctx.lineTo(sharpPointX, sharpPointY)  // HE
        ctx.lineTo(point2X, point2Y)  // HL
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B (замыкаем)
        
      } else if (isBottomRight) {
        // Хвост точно из правого нижнего угла
        // Точка1 на центральной линии хвоста (место пересечения с гранью)
        // Точка2 на нижней грани со смещением от пересечения
        const point1X = bgX + bgWidth
        const point1Y = bgY + bgHeight - tailWidthPixels
        const point2X = bgX + bgWidth - tailWidthPixels
        const point2Y = bgY + bgHeight
        
        console.log('🔺 isBottomRight - Точки:')
        console.log('  C (угол):', {x: bgX + bgWidth, y: bgY + bgHeight})
        console.log('  B (угол):', {x: bgX + bgWidth, y: bgY})
        console.log('  point1 (HR):', {x: point1X, y: point1Y})
        console.log('  HE (вершина):', {x: sharpPointX, y: sharpPointY})
        console.log('  point2 (HL):', {x: point2X, y: point2Y})
        
        // Строим путь: правый нижний угол C → точка1 (HR) → острая вершина HE → точка2 (HL) → нижняя сторона → остальные стороны
        ctx.moveTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(point1X, point1Y)  // HR (на центральной линии)
        ctx.lineTo(sharpPointX, sharpPointY)  // HE
        ctx.lineTo(point2X, point2Y)  // HL
        ctx.lineTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C (замыкаем)
        
      } else if (isBottomLeft) {
        // Хвост точно из левого нижнего угла
        // Точка1 на центральной линии хвоста (место пересечения с гранью)
        // Точка2 на нижней грани со смещением от пересечения
        const point1X = bgX
        const point1Y = bgY + bgHeight - tailWidthPixels
        const point2X = bgX + tailWidthPixels
        const point2Y = bgY + bgHeight
        
        console.log('🔺 isBottomLeft - Точки:')
        console.log('  A (угол):', {x: bgX, y: bgY})
        console.log('  D (угол):', {x: bgX, y: bgY + bgHeight})
        console.log('  point1 (HR):', {x: point1X, y: point1Y})
        console.log('  HE (вершина):', {x: sharpPointX, y: sharpPointY})
        console.log('  point2 (HL):', {x: point2X, y: point2Y})
        
        // Строим путь: левый нижний угол D → точка1 (HR) → острая вершина HE → точка2 (HL) → нижняя сторона → остальные стороны
        ctx.moveTo(bgX, bgY + bgHeight)  // D
        ctx.lineTo(point1X, point1Y)     // HR (на центральной линии)
        ctx.lineTo(sharpPointX, sharpPointY)  // HE
        ctx.lineTo(point2X, point2Y)     // HL
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)  // C
        ctx.lineTo(bgX + bgWidth, bgY)  // B
        ctx.lineTo(bgX, bgY)  // A
        ctx.lineTo(bgX, bgY + bgHeight)  // D (замыкаем)
      }
    },
    
    // Построение пути суперподложки с хвостом со стороны (не из угла)
    buildSideTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                          intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent, scale = 1) {
      // Вычисляем точки хвоста НА СТОРОНАХ ПРЯМОУГОЛЬНИКА
      // tailWidth теперь в процентах от 40% до 100%
      // Масштабируем ширину хвоста пропорционально разрешению для сохранения
      const tailWidthPixels = tailWidthPercent * 50 * scale // Формула из TextManager.vue с масштабированием
      console.log('🔍 buildSideTailSuperPath DEBUG:', {
        tailWidthPercent,
        tailWidthPixels,
        scale,
        formula: 'tailWidthPercent * 50 * scale'
      })
      
      if (tailSide === 'top') {
        // Хвост выходит сверху - точки на верхней стороне
        let point1X = intersectionPoint.x - tailWidthPixels
        let point1Y = bgY
        let point2X = intersectionPoint.x + tailWidthPixels
        let point2Y = bgY
        
        // Проверяем, не выходит ли точка1 за левую границу
        if (point1X < bgX) {
          // Переходим на левую сторону и продолжаем движение вниз
          point1X = bgX
          point1Y = bgY + (bgX - (intersectionPoint.x - tailWidthPixels))
        }
        
        // Проверяем, не выходит ли точка2 за правую границу
        if (point2X > bgX + bgWidth) {
          // Переходим на правую сторону и продолжаем движение вниз
          point2X = bgX + bgWidth
          point2Y = bgY + ((intersectionPoint.x + tailWidthPixels) - (bgX + bgWidth))
        }
        
        // Строим путь: левый верхний угол → точка1 → острая вершина → точка2 → правый верхний угол → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (tailSide === 'right') {
        // Хвост выходит справа - точки на правой стороне
        let point1X = bgX + bgWidth
        let point1Y = intersectionPoint.y - tailWidthPixels
        let point2X = bgX + bgWidth
        let point2Y = intersectionPoint.y + tailWidthPixels
        
        // Проверяем, не выходит ли точка1 за верхнюю границу
        if (point1Y < bgY) {
          // Переходим на верхнюю сторону и продолжаем движение влево
          point1X = bgX + bgWidth - (bgY - (intersectionPoint.y - tailWidthPixels))
          point1Y = bgY
        }
        
        // Проверяем, не выходит ли точка2 за нижнюю границу
        if (point2Y > bgY + bgHeight) {
          // Переходим на нижнюю сторону и продолжаем движение влево
          point2X = bgX + bgWidth - ((intersectionPoint.y + tailWidthPixels) - (bgY + bgHeight))
          point2Y = bgY + bgHeight
        }
        
        // Строим путь: левый верхний угол → верхняя сторона → правый верхний угол → точка1 → острая вершина → точка2 → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (tailSide === 'bottom') {
        // Хвост выходит снизу - точки на нижней стороне
        let point1X = intersectionPoint.x + tailWidthPixels
        let point1Y = bgY + bgHeight
        let point2X = intersectionPoint.x - tailWidthPixels
        let point2Y = bgY + bgHeight
        
        // Проверяем, не выходит ли точка1 за правую границу
        if (point1X > bgX + bgWidth) {
          // Переходим на правую сторону и продолжаем движение вверх
          point1X = bgX + bgWidth
          point1Y = bgY + bgHeight - ((intersectionPoint.x + tailWidthPixels) - (bgX + bgWidth))
        }
        
        // Проверяем, не выходит ли точка2 за левую границу
        if (point2X < bgX) {
          // Переходим на левую сторону и продолжаем движение вверх
          point2X = bgX
          point2Y = bgY + bgHeight - (bgX - (intersectionPoint.x - tailWidthPixels))
        }
        
        // Строим путь: левый верхний угол → верхняя сторона → правый верхний угол → правая сторона → точка1 → острая вершина → точка2 → остальные стороны
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(bgX, bgY)
        
      } else if (tailSide === 'left') {
        // Хвост выходит слева - точки на левой стороне
        let point1X = bgX
        let point1Y = intersectionPoint.y + tailWidthPixels
        let point2X = bgX
        let point2Y = intersectionPoint.y - tailWidthPixels
        
        // Проверяем, не выходит ли точка1 за нижнюю границу
        if (point1Y > bgY + bgHeight) {
          // Переходим на нижнюю сторону и продолжаем движение вправо
          point1X = bgX + ((intersectionPoint.y + tailWidthPixels) - (bgY + bgHeight))
          point1Y = bgY + bgHeight
        }
        
        // Проверяем, не выходит ли точка2 за верхнюю границу
        if (point2Y < bgY) {
          // Переходим на верхнюю сторону и продолжаем движение вправо
          point2X = bgX + (bgY - (intersectionPoint.y - tailWidthPixels))
          point2Y = bgY
        }
        
        // Строим путь: левый верхний угол → верхняя сторона → правый верхний угол → правая сторона → нижняя сторона → точка1 → острая вершина → точка2 → левая сторона
        ctx.moveTo(bgX, bgY)
        ctx.lineTo(bgX + bgWidth, bgY)
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight)
        ctx.lineTo(bgX, bgY + bgHeight)
        ctx.lineTo(point1X, point1Y)
        ctx.lineTo(sharpPointX, sharpPointY)
        ctx.lineTo(point2X, point2Y)
        ctx.lineTo(bgX, bgY)
      }
    },
    

    
    // Добавление хвоста к существующему пути (для объединенной фигуры)
    addTailToPath(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // Параметры хвоста - приводим к числам и устанавливаем минимумы
      const tailSize = Math.max(0.1, Number(this.textDialogData.tailSize) / 100)
      const tailWidth = Math.max(0.1, Number(this.textDialogData.tailWidth) / 100)
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста
      // Длина хвоста - привязываем к минимальному размеру подложки
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * tailSize // Длина хвоста от минимального размера
      
      // Ширина основания - ограничиваем минимальным размером подложки
      const maxBaseWidth = minDimension * 0.8 // Максимум 80% от минимального размера
      const tailBaseWidth = Math.min(minDimension * tailWidth, maxBaseWidth)
      
      // Прямой угол хвоста в центре подложки
      const rightAngleX = centerX
      const rightAngleY = centerY
      
      // Вычисляем координаты острой вершины хвоста
      const sharpPointX = centerX + tailLength * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * Math.sin(tailAngle)
      
      // Вычисляем координаты основания хвоста
      const baseAngle = tailAngle + Math.PI / 2
      const basePoint1X = centerX + (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint1Y = centerY + (tailBaseWidth / 2) * Math.sin(baseAngle)
      const basePoint2X = centerX - (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint2Y = centerY - (tailBaseWidth / 2) * Math.sin(baseAngle)
      
      // Добавляем хвост к существующему пути
      ctx.moveTo(rightAngleX, rightAngleY)
      ctx.lineTo(basePoint1X, basePoint1Y)
      ctx.lineTo(sharpPointX, sharpPointY)
      ctx.lineTo(basePoint2X, basePoint2Y)
      ctx.closePath()
    },
    
    // Обводка объединенной фигуры (подложка + хвост) как единое целое
    strokeCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
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
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
      // Параметры хвоста
      const tailAngle = Number(currentTextData.tailAngle) * Math.PI / 180
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      // Вычисляем точку пересечения ОДИН РАЗ
      const intersectionPoint = this.getTailIntersectionWithBackground(
        centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight
      )
      
      console.log('🎯 КЭШИРОВАННАЯ точка пересечения:', intersectionPoint)
      return intersectionPoint
    },
    
    // Построение пути для суперподложки с кэшированной точкой пересечения
    buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection, textData = null) {
      // Используем переданные данные или данные по умолчанию
      const currentTextData = textData || this.textDialogData
      
      // Параметры хвоста
      const tailSize = Number(currentTextData.tailSize) / 100 // От 100% до 300%
      const tailWidth = Number(currentTextData.tailWidth) / 100 // От 40% до 100% (уже в правильном формате)
      const tailAngle = Number(currentTextData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (точно как в превью)
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * 1.25 // Базовая длина хвоста (как в превью)
      
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
    
    // Обводка хвоста
    strokeTail(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // Параметры хвоста - приводим к числам и устанавливаем минимумы
      const tailSize = Math.max(0.1, Number(this.textDialogData.tailSize) / 100)
      const tailWidth = Math.max(0.1, Number(this.textDialogData.tailWidth) / 100)
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста (управляются ползунками)
      // Длина хвоста - привязываем к минимальному размеру подложки
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * tailSize // Длина хвоста от минимального размера
      
      // Ширина основания - ограничиваем минимальным размером подложки
      const maxBaseWidth = minDimension * 0.8 // Максимум 80% от минимального размера
      const tailBaseWidth = Math.min(minDimension * tailWidth, maxBaseWidth)
      
      // НОВАЯ ЛОГИКА: Прямой угол хвоста в центре подложки
      const rightAngleX = centerX // Прямой угол в центре подложки
      const rightAngleY = centerY
      
      // Вычисляем координаты острой вершины хвоста (выходит из центра подложки)
      const sharpPointX = centerX + tailLength * Math.cos(tailAngle)
      const sharpPointY = centerY + tailLength * Math.sin(tailAngle)
      
      // Вычисляем координаты основания хвоста (перпендикулярно к направлению хвоста)
      const baseAngle = tailAngle + Math.PI / 2
      const basePoint1X = centerX + (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint1Y = centerY + (tailBaseWidth / 2) * Math.sin(baseAngle)
      const basePoint2X = centerX - (tailBaseWidth / 2) * Math.cos(baseAngle)
      const basePoint2Y = centerY - (tailBaseWidth / 2) * Math.sin(baseAngle)
      
      // Рисуем обводку хвоста
      ctx.beginPath()
      ctx.moveTo(rightAngleX, rightAngleY)
      ctx.lineTo(basePoint1X, basePoint1Y)
      ctx.lineTo(sharpPointX, sharpPointY)
      ctx.lineTo(basePoint2X, basePoint2Y)
      ctx.closePath()
      
      // Обводим хвост
      ctx.stroke()
    },
    
    // Применение текста на канвас с созданием слоя
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
      layerIndex = this.nextLayerIndex
      this.nextLayerIndex += 10 // Следующий слой будет на 10 больше
      console.log('➕ Создание нового слоя:', layerIndex)
      
      // Создаем новый слой в Paper.js
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
      
      // Добавляем в список созданных текстов для отображения во вкладке (тоже в начало)
      const newText = {
        id: layerIndex,
        text: textData.text || 'Пустой текст',
        font: textData.font || 'Arial',
        fontSize: textData.fontSize || 16,
        color: textData.textColor || '#000000',
        fontWeight: textData.fontWeight || 'normal',
        textAlign: textData.textAlign || 'left',
        mode: mode,
        layerIndex: layerIndex,
          createdAt: new Date().toISOString(),
          hasTextInRaster: !!textData.text // Флаг что текст включен в Raster
      }
      
      // Добавляем новый текст в начало списка (позиция 0 = самый верхний слой)
      this.createdTexts.unshift(newText)
      console.log('📝 Новый текст добавлен в слой:', layerInfo)
      
      // Обновляем 3D модель с небольшой задержкой для корректного отображения
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DModel()
          console.log('🔄 3D модель обновлена с задержкой для корректного отображения')
        }, 100)
      })
      
      // Активируем вкладку "Тексты" для показа добавленного текста
      this.activeTab = 'text'
      console.log('🔄 Активирована вкладка "Тексты"')
      
      // Закрываем диалог TextManager
      const textManager = this.$refs.textManager
      if (textManager && typeof textManager.closeDialog === 'function') {
        textManager.closeDialog()
      }
    },
    
    // Создание текстового элемента на слое
    createTextItemOnLayer(layer, layerIndex) {
      if (!this.textDialogPosition || !this.paperScope) return null
      
      console.log('📝 Создание текстового элемента на слое:', layerIndex)
      
      const x = this.textDialogPosition.x
      const y = this.textDialogPosition.y
      
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      // Создаем текстовый элемент БЕЗ масштабирования
      const textItem = new this.paperScope.PointText(new this.paperScope.Point(x, y))
      
      // Настройки текста БЕЗ масштабирования
      textItem.content = this.textDialogData.text || 'Текст'
      textItem.fontSize = this.textDialogData.fontSize || 24
      textItem.fontFamily = this.textDialogData.font || 'Arial'
      textItem.fillColor = this.textDialogData.textColor || '#000000'
      textItem.justification = this.getJustificationFromAlign(this.textDialogData.textAlign || 'center')
      
      // Центрируем текст точно по координатам подложки (как в превью)
      textItem.point = new this.paperScope.Point(x, y)
      
      console.log('📝 Создание текстового элемента БЕЗ масштабирования:', {
        previewScale,
        fontSize: textItem.fontSize,
        position: `${x}, ${y}`,
        content: textItem.content,
        justification: textItem.justification,
        textAlign: this.textDialogData.textAlign || 'center'
      })
      
      // Метаданные
      textItem.data = {
        isTextOverlay: true,
        layerIndex: layerIndex,
        mode: this.textDialogActiveTab
      }
      
      // Убеждаемся, что текст видим
      textItem.visible = true
      textItem.opacity = 1
      
      // Добавляем свойства для перетаскивания
      textItem.data = {
        layerIndex: layerIndex,
        mode: this.textDialogActiveTab,
        isDraggable: true
      }
      
      // Добавляем на слой
      layer.addChild(textItem)
      
      // Принудительно перемещаем текст на передний план слоя
      textItem.bringToFront()
      
      console.log('✅ Текстовый элемент создан:', textItem)
      return textItem
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
    
    // Создание подложки "Разговор" напрямую в Paper.js
    createConversationBackgroundPaperJS(layer, x, y, layerIndex) {
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Создание подложки "Разговор" в Paper.js С масштабированием:', {
        previewScale,
        originalWidth: this.textDialogData.backgroundWidth || 200,
        scaledWidth: backgroundWidth,
        originalHeight: this.textDialogData.backgroundHeight || 80,
        scaledHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Используем существующие методы из превью для создания суперподложки
      const backgroundItem = this.createBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor)
      
      if (!backgroundItem) {
        console.error('❌ Не удалось создать подложку из логики превью')
        return null
      }
      
      // Метаданные
      backgroundItem.data = {
        isTextBackground: true,
        layerIndex: layerIndex,
        mode: this.textDialogActiveTab
      }
      
      layer.addChild(backgroundItem)
      
      return backgroundItem
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
        tempCanvas.width = canvasWidth // Физический размер = логический размер (как в превью)
        tempCanvas.height = canvasHeight
        tempCanvas.style.width = canvasWidth + 'px'
        tempCanvas.style.height = canvasHeight + 'px'
        
        const tempCtx = tempCanvas.getContext('2d')
        // НЕ масштабируем контекст - рисуем в тех же координатах, что и превью
        
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
        
        // Рисуем объединенную фигуру в центре канваса (точно как в превью)
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
          tempCtx.lineWidth = currentTextData.strokeWidth // Логические координаты
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
          originalTextData: textData
        })
        
        if (currentTextData.text && currentTextData.text.trim() !== '') {
          console.log('✅ Добавляем текст в Raster с тенью:', {
            hasShadow: currentTextData.shadow,
            shadowColor: currentTextData.shadowColor,
            shadowBlur: currentTextData.shadowBlur
          })
          this.drawTextInRasterWithData(tempCtx, canvasWidth/2, canvasHeight/2, backgroundWidth, backgroundHeight, currentTextData, 1)
        } else {
          console.log('⚠️ Текст не добавлен в Raster - текст отсутствует или пустой')
        }
        
        // Конвертируем Canvas в Paper.js Raster
        const raster = new this.paperScope.Raster(tempCanvas)
        // Позиционируем Raster так, чтобы центр суперподложки был в точке (x, y)
        // Центр канваса находится в (canvasWidth/2, canvasHeight/2)
        // Центр суперподложки внутри канваса в (x + offsetX, y + offsetY)
        // Нужно сдвинуть Raster так, чтобы (x + offsetX, y + offsetY) оказалось в (x, y)
        // ПРОСТАЯ математика: позиционируем Raster так, чтобы центр суперподложки был в (x, y)
        // Центр суперподложки внутри tempCanvas: (canvasWidth/2, canvasHeight/2) - теперь в центре!
        // Позиционируем Raster так, чтобы его центр был в (x, y)
        raster.position = new this.paperScope.Point(x, y)
        
        // НЕ масштабируем Raster - рисуем в логических координатах
        
        // НЕ устанавливаем bounds для Raster - пусть Paper.js сам определит границы
        // Это предотвращает создание дополнительного прямоугольника
        
        console.log('🎯 Raster создан с правильными размерами (Conversation):', {
          canvasSize: `${canvasWidth}x${canvasHeight}`,
          originalPosition: `${x}, ${y}`,
          offset: `${offsetX}, ${offsetY}`,
          rasterPosition: `${x}, ${y}`,
          rasterScaling: 'none (логические координаты)',
          note: 'Raster позиционируется в целевую позицию'
        })
        
        // Проверяем математику
        const checkCenter = `${x + canvasWidth/2}, ${y + canvasHeight/2}`
        const checkSuperCenter = `${x + canvasWidth/2 + ((canvasWidth/2) - canvasWidth/2)}, ${y + canvasHeight/2 + ((canvasHeight/2) - canvasHeight/2)}`
        
        console.log('🧮 ПРОВЕРКА математики позиционирования:', {
          step1: 'Целевая позиция центра суперподложки',
          target: `${x}, ${y}`,
          step2: 'Центр суперподложки внутри tempCanvas',
          drawnCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step3: 'Центр tempCanvas',
          tempCanvasCenter: `${canvasWidth/2}, ${canvasHeight/2}`,
          step4: 'Смещение центра суперподложки относительно центра tempCanvas',
          centerOffset: '0, 0',
          step5: 'Позиция Raster (центр)',
          rasterPos: `${x}, ${y}`,
          step6: 'Проверка: центр tempCanvas в позиции Raster',
          checkCenter: checkCenter,
          step7: 'Проверка: центр суперподложки',
          checkSuperCenter: checkSuperCenter,
          step8: 'ОЖИДАЕМОЕ: центр суперподложки должен быть равен target',
          expected: checkSuperCenter === `${x}, ${y}` ? '✅ ПРАВИЛЬНО' : '❌ НЕПРАВИЛЬНО'
        })
        
        console.log('✅ Подложка создана из логики превью с высоким качеством:', {
          position: `${x}, ${y}`,
          size: `${backgroundWidth}x${backgroundHeight}`,
          mode: this.textDialogActiveTab,
          canvasResolution: `${tempCanvas.width}x${tempCanvas.height}`,
          logicalSize: `${canvasWidth}x${canvasHeight}`,
          dpr: dpr,
          rasterScale: `${(1 / dpr).toFixed(3)}x`
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
          const tailLength = minDimension * 1.25 // Базовая длина хвоста (как в основном методе)
          const tailBaseWidth = minDimension * 0.3 * tailWidth
          
          // Угол хвоста в радианах
          const angleRad = (tailAngle * Math.PI) / 180
          
          // Координаты конца хвоста
          const tailEndX = x + Math.cos(angleRad) * tailLength
          const tailEndY = y + Math.sin(angleRad) * tailLength
          
          // Координаты основания хвоста (учитываем ширину)
          const tailBaseHalfWidth = tailBaseWidth / 2
          const perpendicularAngle = angleRad + Math.PI / 2
          const base1X = x + Math.cos(perpendicularAngle) * tailBaseHalfWidth
          const base1Y = y + Math.sin(perpendicularAngle) * tailBaseHalfWidth
          const base2X = x - Math.cos(perpendicularAngle) * tailBaseHalfWidth
          const base2Y = y - Math.sin(perpendicularAngle) * tailBaseHalfWidth
          
          // Расширяем границы с учетом всех точек хвоста + увеличенный отступ для кончика
          const tailPadding = Math.max(tailLength * 0.2, 20) // 20% от длины хвоста или минимум 20px
          
          // Дополнительный отступ в направлении хвоста для кончика + тени
          const tailTipPadding = Math.max(tailLength * 0.1, 15) // 10% от длины хвоста или минимум 15px
          const tipX = tailEndX + Math.cos(angleRad) * tailTipPadding
          const tipY = tailEndY + Math.sin(angleRad) * tailTipPadding
          
          // Учитываем тень для хвоста (если включена)
          let shadowPaddingForTail = 0
          if (textData.shadow) {
            const shadowOffsetX = Number(textData.shadowOffsetX) || 0
            const shadowOffsetY = Number(textData.shadowOffsetY) || 0
            const shadowBlur = Number(textData.shadowBlur) || 0
            
            // Рассчитываем, насколько тень может выходить за пределы хвоста
            const shadowInTailDirection = Math.abs(Math.cos(angleRad) * shadowOffsetX + Math.sin(angleRad) * shadowOffsetY)
            shadowPaddingForTail = Math.max(shadowInTailDirection + shadowBlur, 10)
          }
          
          // Финальная точка с учетом тени
          const finalTipX = tipX + Math.cos(angleRad) * shadowPaddingForTail
          const finalTipY = tipY + Math.sin(angleRad) * shadowPaddingForTail
          
          minX = Math.min(minX, tailEndX, base1X, base2X, finalTipX) - tailPadding
          maxX = Math.max(maxX, tailEndX, base1X, base2X, finalTipX) + tailPadding
          minY = Math.min(minY, tailEndY, base1Y, base2Y, finalTipY) - tailPadding
          maxY = Math.max(maxY, tailEndY, base1Y, base2Y, finalTipY) + tailPadding
        }
        
        // Учитываем тень если включена
        if (textData.shadow) {
          const shadowOffsetX = Number(textData.shadowOffsetX) || 0
          const shadowOffsetY = Number(textData.shadowOffsetY) || 0
          const shadowBlur = Number(textData.shadowBlur) || 0
          
          // Тень расширяет границы
          minX = Math.min(minX, minX + shadowOffsetX - shadowBlur)
          maxX = Math.max(maxX, maxX + shadowOffsetX + shadowBlur)
          minY = Math.min(minY, minY + shadowOffsetY - shadowBlur)
          maxY = Math.max(maxY, maxY + shadowOffsetY + shadowBlur)
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
    
    // Отрисовка текста в Raster (точно как в превью)
    drawTextInRaster(ctx, x, y, backgroundWidth, backgroundHeight) {
      try {
        console.log('🎨 Начинаем отрисовку текста в Raster:', {
          text: this.textDialogData.text,
          position: `${x}, ${y}`,
          backgroundSize: `${backgroundWidth}x${backgroundHeight}`
        })
        
        // Настройки текста (точно как в превью)
        const fontSize = this.textDialogData.fontSize
        const fontFamily = this.textDialogData.font
        const fontWeight = this.textDialogData.fontWeight
        const textColor = this.textDialogData.textColor
        
        console.log('🎨 Настройки текста:', {
          fontSize,
          fontFamily,
          fontWeight,
          textColor
        })
        
        // Устанавливаем стиль шрифта (точно как в превью)
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = textColor
        
        console.log('🎨 Контекст настроен:', {
          font: ctx.font,
          textAlign: ctx.textAlign,
          textBaseline: ctx.textBaseline,
          fillStyle: ctx.fillStyle
        })
        
        // Рисуем текст с поддержкой переноса строк (точно как в превью)
        this.drawMultilineText(ctx, this.textDialogData.text, x, y, fontSize, this.textDialogData.lineHeight)
        
        console.log('✅ Текст добавлен в Raster:', {
          position: `${x}, ${y}`,
          content: this.textDialogData.text,
          fontSize: fontSize,
          fontFamily: fontFamily
        })
        
      } catch (error) {
        console.error('❌ Ошибка добавления текста в Raster:', error)
      }
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
        // if (textData.shadow) {
        //   ctx.shadowColor = textData.shadowColor + Math.round(textData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        //   ctx.shadowBlur = Math.max(1, Math.round(textData.shadowBlur))
        //   ctx.shadowOffsetX = Math.round(textData.shadowOffsetX)
        //   ctx.shadowOffsetY = Math.round(textData.shadowOffsetY)
        // }
        
        console.log('🎨 Контекст настроен:', {
          font: ctx.font,
          textAlign: ctx.textAlign,
          textBaseline: ctx.textBaseline,
          fillStyle: ctx.fillStyle,
          shadow: 'none (тень применяется к подложке)'
        })
        
        // Рисуем текст с поддержкой переноса строк (HiDPI)
        this.drawMultilineTextWithData(ctx, textData.text, x, y, fontSize, textData.lineHeight, textData)
        
        // Тень не применяется к тексту, поэтому сброс не нужен
        
        console.log('✅ Текст добавлен в Raster:', {
          position: `${x}, ${y}`,
          content: textData.text,
          fontSize: fontSize,
          fontFamily: fontFamily
        })
        
      } catch (error) {
        console.error('❌ Ошибка добавления текста в Raster:', error)
      }
    },
    
    // Создание стандартной подложки используя логику из превью
    createStandardBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
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
        
        // Создаем область перетаскивания для правильного выделения
        // Ждем пока Paper.js вычислит bounds
          setTimeout(() => {
          const rasterBounds = raster.bounds
          if (rasterBounds) {
            // Рассчитываем правильные bounds с учетом хвоста
            const expandedBounds = this.calculateSmartBounds(rasterBounds, currentTextData, 'standard')
            console.log('🎯 Создаем область перетаскивания для Raster (Standard):', {
              originalBounds: rasterBounds,
              expandedBounds: expandedBounds
            })
            
            // Устанавливаем правильные bounds для области перетаскивания
            raster.bounds = expandedBounds
      } else {
            console.warn('⚠️ Не удалось получить bounds для Raster (Standard)')
          }
        }, 0)
        
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
    
    // Расчет крайних точек для режима "Мысли" с учетом хвостов
    calculateExtremePointsForThoughtsMode(x, y, backgroundWidth, backgroundHeight, textData) {
      // Центр подложки
      const centerX = x
      const centerY = y
      
      // Половины размеров подложки
      const halfWidth = backgroundWidth / 2
      const halfHeight = backgroundHeight / 2
      
      // Изначальные границы - это основной овал
      let minX = centerX - halfWidth
      let maxX = centerX + halfWidth
      let minY = centerY - halfHeight
      let maxY = centerY + halfHeight
      
      // Параметры хвоста из настроек
      const tailSize = Number(textData.tailSize) / 100 // Длина хвоста (от 100% до 750%)
      const tailWidth = Number(textData.tailWidth) / 100 // Ширина хвоста (от 40% до 100%)
      const tailAngle = Number(textData.tailAngle) * Math.PI / 180
      
      console.log('🧠 Параметры хвоста для расчета границ:', {
        tailSize: tailSize,
        tailWidth: tailWidth,
        tailAngle: tailAngle,
        tailAngleDegrees: textData.tailAngle
      })
      
      // Вычисляем длину хвоста (используем ту же логику что и в превью)
      const minDimension = Math.min(backgroundWidth, backgroundHeight)
      const tailLength = minDimension * tailSize
      
      // Вычисляем ширину хвоста в пикселях (как в превью)
      const tailWidthPixels = minDimension * tailWidth
      
      // В режиме "Мысли" хвост состоит из множественных овалов
      // Нужно учесть максимальное расстояние до самого дальнего овала
      const maxOvalDistance = tailLength // Самый дальний овал находится на расстоянии tailLength
      
      // Координаты самого дальнего овала
      const maxOvalX = centerX + maxOvalDistance * Math.cos(tailAngle)
      const maxOvalY = centerY + maxOvalDistance * Math.sin(tailAngle)
      
      // Размер самого большого овала (в режиме "Мысли" используется sizeMultiplier = 1.2)
      const maxOvalWidth = tailWidthPixels * 1.2
      const maxOvalHeight = maxOvalWidth * 0.7
      
      // Расширяем границы с учетом самого дальнего и самого большого овала
      minX = Math.min(minX, maxOvalX - maxOvalWidth/2)
      maxX = Math.max(maxX, maxOvalX + maxOvalWidth/2)
      minY = Math.min(minY, maxOvalY - maxOvalHeight/2)
      maxY = Math.max(maxY, maxOvalY + maxOvalHeight/2)
      
      // Добавляем отступы для тени и обводки
      const shadowPadding = textData.shadow ? Math.max(
        Math.abs(textData.shadowOffsetX) + textData.shadowBlur,
        Math.abs(textData.shadowOffsetY) + textData.shadowBlur,
        5
      ) : 0
      
      const strokePadding = textData.stroke ? (textData.strokeWidth / 2 + 2) : 0
      const totalPadding = Math.max(shadowPadding, strokePadding)
      
      // Расширяем границы с учетом отступов
      minX -= totalPadding
      maxX += totalPadding
      minY -= totalPadding
      maxY += totalPadding
      
      console.log('🧠 Результат расчета границ режима "Мысли":', {
        originalBounds: {
          minX: centerX - halfWidth,
          maxX: centerX + halfWidth,
          minY: centerY - halfHeight,
          maxY: centerY + halfHeight
        },
        maxOvalPoint: { x: maxOvalX, y: maxOvalY },
        tailLength: tailLength,
        tailWidthPixels: tailWidthPixels,
        shadowPadding: shadowPadding,
        strokePadding: strokePadding,
        totalPadding: totalPadding,
        finalBounds: { minX, maxX, minY, maxY }
      })
      
      return { minX, maxX, minY, maxY }
    },

    // Создание подложки "Мысли" используя существующую логику из превью
    createThoughtsBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor, textData) {
      // Используем переданные данные напрямую
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
        
        // Применяем тень если включена (для суперподложки)
        if (currentTextData.shadow) {
          tempCtx.shadowColor = currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          tempCtx.shadowBlur = Math.max(1, Math.round(currentTextData.shadowBlur * backgroundScale))
          tempCtx.shadowOffsetX = Math.round(currentTextData.shadowOffsetX * backgroundScale)
          tempCtx.shadowOffsetY = Math.round(currentTextData.shadowOffsetY * backgroundScale)
        }
        
        console.log('🔍 Применение тени к контексту:', {
          shadowColor: currentTextData.shadow ? (currentTextData.shadowColor + Math.round(currentTextData.shadowOpacity * 2.55).toString(16).padStart(2, '0')) : 'none',
          shadowBlur: currentTextData.shadow ? Math.max(1, Math.round(currentTextData.shadowBlur * backgroundScale)) : 'none',
          shadowOffsetX: currentTextData.shadow ? Math.round(currentTextData.shadowOffsetX * backgroundScale) : 'none',
          shadowOffsetY: currentTextData.shadow ? Math.round(currentTextData.shadowOffsetY * backgroundScale) : 'none',
          backgroundScale: backgroundScale,
          textScale: textScale,
          originalData: currentTextData.shadow ? currentTextData : 'none'
        })
        
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
        console.error('❌ Ошибка создания подложки "Мысли" из логики превью:', error)
        // Fallback на простой овал
        const ellipse = new this.paperScope.Path.Ellipse({
          center: [x, y],
          size: [backgroundWidth, backgroundHeight]
        })
        ellipse.fillColor = backgroundColor
        return ellipse
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
        const shadowPadding = currentTextData.shadow ? Math.min(currentTextData.shadowBlur + Math.abs(currentTextData.shadowOffsetX) + Math.abs(currentTextData.shadowOffsetY), 100) : 0
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
          tempCtx.shadowOffsetX = currentTextData.shadowOffsetX
          tempCtx.shadowOffsetY = currentTextData.shadowOffsetY
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
    
    // Создание объединенного пути для подложки "Разговор" (подложка + хвост как единая фигура)
    createUnifiedConversationPath(centerX, centerY, bgWidth, bgHeight) {
      try {
        // Параметры хвоста (используем ту же логику, что и в превью)
        const tailSize = Number(this.textDialogData.tailSize) / 100 // От 100% до 300%
        const tailWidth = Number(this.textDialogData.tailWidth) / 100 // От 40% до 100%
        const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
        
        // Размеры хвоста
        const minDimension = Math.min(bgWidth, bgHeight)
        const tailLength = minDimension * 1.25 // Базовая длина хвоста
        
        // Позиция подложки
        const bgX = centerX - bgWidth / 2
        const bgY = centerY - bgHeight / 2
        
        // Вычисляем точку пересечения линии хвоста с границей подложки
        const intersectionPoint = this.getTailIntersectionWithBackgroundPaperJS(
          centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight
        )
        
        if (!intersectionPoint) {
          // Если нет пересечения, создаем простую прямоугольную подложку
          return new this.paperScope.Path.Rectangle(
            new this.paperScope.Point(bgX, bgY),
            new this.paperScope.Point(bgX + bgWidth, bgY + bgHeight)
          )
        }
        
        // Создаем объединенный путь
        const path = new this.paperScope.Path()
        
        // Вычисляем параметры хвоста
        const tailWidthPercent = Number(this.textDialogData.tailWidth) / 100
        const tailSizePercent = Number(this.textDialogData.tailSize) / 100
        
        // Острая вершина хвоста
        const sharpPointX = centerX + tailLength * tailSizePercent * Math.cos(tailAngle)
        const sharpPointY = centerY + tailLength * tailSizePercent * Math.sin(tailAngle)
        
        // Определяем, с какой стороны подложки выходит хвост
        const tailSide = this.getTailSideFromIntersectionPaperJS(intersectionPoint, bgX, bgY, bgWidth, bgHeight)
        
        // Проверяем, находится ли точка пересечения в углу подложки
        const isCorner = this.isIntersectionAtCornerPaperJS(intersectionPoint, bgX, bgY, bgWidth, bgHeight)
        
        if (isCorner) {
          // Если хвост выходит из угла, строим специальный путь
          this.buildCornerTailSuperPathPaperJS(path, bgX, bgY, bgWidth, bgHeight, 
                                            intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent)
        } else {
          // Обычный путь для стороны
          this.buildSideTailSuperPathPaperJS(path, bgX, bgY, bgWidth, bgHeight, 
                                          intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent)
        }
        
        path.closed = true
        return path
        
      } catch (error) {
        console.error('❌ Ошибка создания объединенного пути:', error)
        // Fallback на простой прямоугольник
        return new this.paperScope.Path.Rectangle(
          new this.paperScope.Point(centerX - bgWidth / 2, centerY - bgHeight / 2),
          new this.paperScope.Point(centerX + bgWidth / 2, centerY + bgHeight / 2)
        )
      }
    },
    
    // Создание подложки "Стандарт" напрямую в Paper.js
    createStandardBackgroundPaperJS(layer, x, y, layerIndex) {
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Создание подложки "Стандарт" в Paper.js С масштабированием:', {
        previewScale,
        originalWidth: this.textDialogData.backgroundWidth || 200,
        scaledWidth: backgroundWidth,
        originalHeight: this.textDialogData.backgroundHeight || 80,
        scaledHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Используем существующие методы из превью для создания подложки
      const backgroundItem = this.createStandardBackgroundFromPreviewLogic(x, y, backgroundWidth, backgroundHeight, backgroundColor)
      
      if (!backgroundItem) {
        console.error('❌ Не удалось создать стандартную подложку из логики превью')
        return null
      }
      
      // Метаданные
      backgroundItem.data = {
        isTextBackground: true,
        layerIndex: layerIndex,
        mode: this.textDialogActiveTab
      }
      
      layer.addChild(backgroundItem)
      
      return backgroundItem
    },
    
    // Создание подложки "Мысли" напрямую в Paper.js
    createThoughtsBackgroundPaperJS(layer, x, y, layerIndex) {
      // БЕЗ масштабирования - размеры канвасов одинаковые
      const previewScale = 1
      
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Создание подложки "Мысли" в Paper.js С масштабированием:', {
        previewScale,
        originalWidth: this.textDialogData.backgroundWidth || 200,
        scaledWidth: backgroundWidth,
        originalHeight: this.textDialogData.backgroundHeight || 80,
        scaledHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Создаем эллипс
      const ellipse = new this.paperScope.Path.Ellipse({
        center: new this.paperScope.Point(x, y),
        size: new this.paperScope.Size(backgroundWidth, backgroundHeight)
      })
      ellipse.fillColor = backgroundColor
      
      // Применяем тень если включена (с масштабированием)
      if (this.textDialogData.shadow) {
        ellipse.shadowColor = this.textDialogData.shadowColor || '#000000'
        ellipse.shadowBlur = Math.max(1, Math.round((this.textDialogData.shadowBlur || 1) * previewScale))
        ellipse.shadowOffset = new this.paperScope.Point(
          Math.round((this.textDialogData.shadowOffsetX || 8) * previewScale),
          Math.round((this.textDialogData.shadowOffsetY || 8) * previewScale)
        )
      }
      
      // Применяем обводку если включена (с масштабированием)
      if (this.textDialogData.stroke) {
        ellipse.strokeColor = this.textDialogData.strokeColor || '#000000'
        ellipse.strokeWidth = Math.max(1, Math.round((this.textDialogData.strokeWidth || 2) * previewScale))
      }
      
      // Метаданные
      ellipse.data = {
        isTextBackground: true,
        layerIndex: layerIndex,
        mode: this.textDialogActiveTab
      }
      
      // Добавляем на слой
      layer.addChild(ellipse)
      
      return ellipse
    },
    
    // Отрисовка подложки "Разговор" на Canvas API (точная копия логики превью)
    drawConversationBackgroundOnCanvas(ctx, x, y) {
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Отрисовка подложки "Разговор" на Canvas API БЕЗ масштабирования:', {
        originalWidth: backgroundWidth,
        originalHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Рисуем объединенную фигуру (подложка + хвост) БЕЗ масштабирования
      this.drawCombinedShape(ctx, x, y, backgroundWidth, backgroundHeight, 1, backgroundColor, true)
      
      // Добавляем обводку если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor || '#000000'
        ctx.lineWidth = this.textDialogData.strokeWidth || 2
        this.strokeCombinedShape(ctx, x, y, backgroundWidth, backgroundHeight, 1)
      }
    },
    
    // Отрисовка подложки "Стандарт" на Canvas API (точная копия логики превью)
    drawStandardBackgroundOnCanvas(ctx, x, y) {
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Отрисовка подложки "Стандарт" на Canvas API БЕЗ масштабирования:', {
        originalWidth: backgroundWidth,
        originalHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Рисуем подложку БЕЗ хвоста (только прямоугольник) БЕЗ масштабирования
      this.drawStandardModeShape(ctx, x, y, backgroundWidth, backgroundHeight, 1, backgroundColor)
    },
    
    // Отрисовка подложки "Мысли" на Canvas API (точная копия логики превью)
    drawThoughtsBackgroundOnCanvas(ctx, x, y) {
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      const backgroundColor = this.textDialogData.backgroundColor || '#ffffff'
      
      console.log('🎨 Отрисовка подложки "Мысли" на Canvas API БЕЗ масштабирования:', {
        originalWidth: backgroundWidth,
        originalHeight: backgroundHeight,
        position: `${x}, ${y}`
      })
      
      // Рисуем режим "Мысли" - овальная подложка с множественными хвостами БЕЗ масштабирования
      this.drawThoughtsModeShape(ctx, x, y, backgroundWidth, backgroundHeight, 1, backgroundColor, true, true)
    },
    
    
    // Конвертация выравнивания текста в Paper.js justification
    getJustificationFromAlign(align) {
      switch (align) {
        case 'left': return 'left'
        case 'center': return 'center'
        case 'right': return 'right'
        case 'justify': return 'left' // Paper.js не поддерживает justify
        default: return 'center'
      }
    },
    
    // Обновление 3D модели
    update3DModel() {
      if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
        this.$refs.threeRenderer.forceUpdate()
        console.log('🔄 3D модель обновлена')
      } else {
        console.log('⚠️ ThreeDRenderer не готов для обновления')
      }
    },
    
    // Удаление текстового слоя
    removeTextLayer(layerIndex) {
      console.log('🗑️ Удаление текстового слоя:', layerIndex)
      
      // Находим слой в массиве
      const layerIndex_inArray = this.textLayers.findIndex(layer => layer.id === layerIndex)
      if (layerIndex_inArray === -1) {
        console.log('❌ Слой не найден:', layerIndex)
        return
      }
      
      const layerInfo = this.textLayers[layerIndex_inArray]
      
      // Удаляем слой из Paper.js
      if (layerInfo.layer) {
        layerInfo.layer.remove()
        console.log('✅ Слой удален из Paper.js')
      }
      
      // Удаляем из массива слоев
      this.textLayers.splice(layerIndex_inArray, 1)
      
      // Удаляем из списка созданных текстов
      const textIndex = this.createdTexts.findIndex(text => text.layerIndex === layerIndex)
      if (textIndex !== -1) {
        this.createdTexts.splice(textIndex, 1)
        console.log('✅ Текст удален из списка')
      }
      
      // Обновляем 3D модель с небольшой задержкой
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DModel()
          console.log('🔄 3D модель обновлена после удаления слоя')
        }, 100)
      })
      
      console.log('✅ Текстовый слой полностью удален')
    },
    
    // Редактирование текстового слоя через компонент TextManager
    editTextLayer(layerIndex) {
      console.log('✏️ Редактирование текстового слоя через TextManager:', layerIndex)
      
      // Находим слой
      const layerInfo = this.textLayers.find(layer => layer.id === layerIndex)
      if (!layerInfo) {
        console.log('❌ Слой не найден:', layerIndex)
        return
      }
      
      // Получаем компонент TextManager
      const textManager = this.$refs.textManager
      if (!textManager) {
        console.log('❌ Компонент TextManager не найден')
        return
      }
      
      // Получаем актуальную позицию из Paper.js элемента
      let actualPosition = { ...layerInfo.position }
      if (layerInfo.backgroundItem && layerInfo.backgroundItem.position) {
        actualPosition = {
          x: layerInfo.backgroundItem.position.x,
          y: layerInfo.backgroundItem.position.y
        }
        console.log('📍 Актуальная позиция из Paper.js:', actualPosition)
      } else {
        console.log('📍 Используем сохраненную позицию:', actualPosition)
      }
      
      // Устанавливаем позицию для компонента TextManager
      this.textDialogPosition = actualPosition
      
      // Устанавливаем позицию в компоненте TextManager для отображения на превью
      textManager.currentDragPosition = actualPosition
      
      // Обновляем сохраненную позицию в layerInfo
      layerInfo.position = actualPosition
      
      // Глубокое копирование всех данных
      const dataCopy = JSON.parse(JSON.stringify(layerInfo.textData))
      
      // Специальная обработка для режима "Текст с изображением" - копируем cachedImage отдельно
      if (layerInfo.mode === 'image-text' && layerInfo.textData?.cachedImage) {
        dataCopy.cachedImage = layerInfo.textData.cachedImage
        console.log('🖼️ Копируем cachedImage для редактирования:', {
          hasImage: !!layerInfo.textData.cachedImage,
          imageSize: layerInfo.textData.cachedImage ? `${layerInfo.textData.cachedImage.width}x${layerInfo.textData.cachedImage.height}` : 'none'
        })
      }
      
      // Заполняем данные в компоненте TextManager в зависимости от режима
      switch (layerInfo.mode) {
        case 'conversation':
          Object.assign(textManager.textDialogDataConversation, dataCopy)
          break
        case 'thoughts':
          Object.assign(textManager.textDialogDataThoughts, dataCopy)
          break
        case 'standard':
          Object.assign(textManager.textDialogDataStandard, dataCopy)
          break
        case 'image-text':
          Object.assign(textManager.textDialogDataImageText, dataCopy)
          break
      }
      
      // Устанавливаем режим редактирования в компоненте TextManager
      textManager.isEditingText = true
      textManager.editingLayerIndex = layerIndex
      textManager.textDialogActiveTab = layerInfo.mode // Открываем в той же вкладке
      
      // Открываем диалог в компоненте TextManager
      textManager.showTextDialog = true
      
      console.log('✅ Режим редактирования активирован через TextManager:', {
        layerIndex: layerIndex,
        mode: layerInfo.mode,
        text: layerInfo.textData.text
      })
    },
    
    // Обновление существующего текстового слоя при редактировании
    updateExistingTextLayer(layerIndex, textData, position, mode) {
      console.log('🔄 Обновление существующего текстового слоя:', {
        layerIndex,
        mode,
        originalMode: this.textLayers.find(layer => layer.id === layerIndex)?.mode
      })
      
      // Находим слой
      const layerInfo = this.textLayers.find(layer => layer.id === layerIndex)
      if (!layerInfo) {
        console.log('❌ Слой не найден:', layerIndex)
        return
      }
      
      // Сохраняем оригинальный режим для правильного сохранения
      const originalMode = layerInfo.mode
      
      // Удаляем старый слой
      if (layerInfo.layer) {
        layerInfo.layer.remove()
      }
      
      // Создаем новый слой с теми же параметрами
      const textLayer = new this.paperScope.Layer()
      textLayer.name = `textLayer_${layerIndex}`
      textLayer.data = { layerIndex: layerIndex }
      
      // Создаем подложку с включенным текстом на слое
      const backgroundItem = this.createBackgroundItemOnLayer(textLayer, layerIndex, textData, position, originalMode)
      
      // Обновляем информацию о слое
      layerInfo.layer = textLayer
      layerInfo.backgroundItem = backgroundItem
      layerInfo.textItem = null
      
      // Глубокое копирование данных текста с сохранением cachedImage для режима "image-text"
      const updatedTextData = { ...textData }
      if (originalMode === 'image-text' && textData.cachedImage) {
        updatedTextData.cachedImage = textData.cachedImage
        console.log('🖼️ Сохраняем cachedImage при обновлении слоя:', {
          hasImage: !!textData.cachedImage,
          imageSize: textData.cachedImage ? `${textData.cachedImage.width}x${textData.cachedImage.height}` : 'none'
        })
      }
      
      layerInfo.textData = { 
        ...updatedTextData,
        backgroundMode: originalMode
      }
      layerInfo.position = { ...position }
      // Режим остается оригинальным
      
      console.log('✅ Существующий слой обновлен:', {
        layerIndex,
        originalMode,
        newPosition: position
      })
      
      // Обновляем 3D модель с задержками для корректного отображения изменений
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
            console.log('🔄 3D модель обновлена после редактирования текста')
          }
        }, 100)
        
        setTimeout(() => {
          if (this.$refs.threeRenderer && this.$refs.threeRenderer.forceUpdate) {
            this.$refs.threeRenderer.forceUpdate()
            console.log('🔄 3D модель обновлена повторно после редактирования текста')
          }
        }, 300)
        
        // Также обновляем Paper.js view
        if (this.paperScope && this.paperScope.view) {
          this.paperScope.view.update()
          console.log('🔄 Paper.js view обновлен после редактирования текста')
        }
      })
    },
    
    // Оптимизированное обновление превью с debounce для улучшения производительности
    updatePreviewCanvasOptimized() {
      // Очищаем предыдущий таймаут
      if (this.previewUpdateTimeout) {
        clearTimeout(this.previewUpdateTimeout)
      }
      
        // Устанавливаем новый таймаут для debounce
        this.previewUpdateTimeout = setTimeout(() => {
      this.updatePreviewCanvas()
          this.previewUpdateTimeout = null
        }, 100) // Увеличено для лучшей производительности при перетаскивании
    },
    
    // Специальное оптимизированное обновление для параметров хвоста
    updatePreviewCanvasTailOptimized() {
      // Очищаем предыдущий таймаут для хвоста
      if (this.tailUpdateTimeout) {
        clearTimeout(this.tailUpdateTimeout)
      }
      
      // Устанавливаем новый таймаут с меньшей задержкой для хвоста
      this.tailUpdateTimeout = setTimeout(() => {
        this.updatePreviewCanvas()
        this.tailUpdateTimeout = null
      }, 16) // ~60fps для плавного изменения хвоста
    },
    
    // Оптимизированное обновление превью с throttling через requestAnimationFrame
    updatePreviewCanvasThrottled() {
      // Отменяем предыдущий requestAnimationFrame
      if (this.previewUpdateFrame) {
        cancelAnimationFrame(this.previewUpdateFrame)
      }
      
      // Используем requestAnimationFrame для плавного обновления
      this.previewUpdateFrame = requestAnimationFrame(() => {
        this.updatePreviewCanvas()
        this.previewUpdateFrame = null
      })
    },
    
    // Переключение видимости текстового слоя
    toggleTextLayerVisibility(layerIndex) {
      console.log('👁️ Переключение видимости слоя:', layerIndex)
      
      // Находим слой
      const layerInfo = this.textLayers.find(layer => layer.id === layerIndex)
      if (!layerInfo) {
        console.log('❌ Слой не найден:', layerIndex)
        return
      }
      
      // Переключаем видимость
      if (layerInfo.layer) {
        layerInfo.layer.visible = !layerInfo.layer.visible
        console.log('✅ Видимость слоя изменена:', layerInfo.layer.visible)
      }
      
      // Обновляем 3D модель с небольшой задержкой
      this.$nextTick(() => {
        setTimeout(() => {
          this.update3DModel()
          console.log('🔄 3D модель обновлена после изменения видимости слоя')
        }, 100)
      })
    },
    
    // Получение отображаемого имени режима
    getModeDisplayName(mode) {
      const modeNames = {
        'conversation': 'Разговор',
        'standard': 'Стандарт',
        'thoughts': 'Мысли',
        'image-text': 'Текст с изображением'
      }
      return modeNames[mode] || mode
    },
    
    // === МЕТОДЫ ПЕРЕТАСКИВАНИЯ ===
    
    // Простое перетаскивание на превью канвасах
    startPreviewDrag(event) {
      if (!this.textDialogPosition) return
      
      const canvas = event.target
      const rect = canvas.getBoundingClientRect()
      const startX = event.clientX - rect.left
      const startY = event.clientY - rect.top
      
      // Проверяем, кликнули ли по тексту/подложке
      if (this.isClickOnSuperBackground(startX, startY)) {
        console.log('🎯 Начато перетаскивание на превью канвасе')
        
        // Сохраняем начальную позицию диалога
        const startDialogX = this.textDialogPosition.x
        const startDialogY = this.textDialogPosition.y
        
        const handleMouseMove = (e) => {
          const currentX = e.clientX - rect.left
          const currentY = e.clientY - rect.top
          
          const deltaX = currentX - startX
          const deltaY = currentY - startY
          
          // Обновляем позицию диалога относительно начальной позиции
          this.textDialogPosition = {
            x: startDialogX + deltaX,
            y: startDialogY + deltaY
          }
          
          // Обновляем превью с throttling для плавной визуальной обратной связи
          this.updatePreviewCanvasThrottled()
        }
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          console.log('🎯 Завершено перетаскивание на превью канвасе')
        }
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    },
    
    // Проверка клика по тексту (для режима "Текст с изображением")
    isClickOnText(clickX, clickY) {
      if (!this.textDialogPosition) {
        console.log('❌ textDialogPosition не определен в isClickOnText')
        return false
      }
      
      // Координаты остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.textDialogPosition.x
      const previewY = this.textDialogPosition.y
      const previewScale = 1.2
      
      // Вычисляем размеры текста точно так же, как в отрисовке
      const fontSize = this.textDialogData.fontSize
      const text = this.textDialogData.text || 'Текст'
      
      // Создаем временный контекст для измерения текста
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.font = `${this.textDialogData.fontWeight} ${fontSize}px ${this.textDialogData.font}`
      
      // Измеряем размеры многострочного текста точно так же, как в отрисовке
      const textSize = this.calculateMultilineTextSize(tempCtx, text, fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Вычисляем границы текста с учетом выравнивания
      // В отрисовке используется textAlign = 'center' и textBaseline = 'middle'
      let left, right, top, bottom
      
      if (this.textDialogData.textAlign === 'left') {
        left = previewX - textWidth / 2
        right = left + textWidth
      } else if (this.textDialogData.textAlign === 'right') {
        right = previewX + textWidth / 2
        left = right - textWidth
      } else {
        // center (по умолчанию)
        left = previewX - textWidth / 2
        right = previewX + textWidth / 2
      }
      
      // textBaseline = 'middle' означает, что Y - это центр текста
      top = previewY - textHeight / 2
      bottom = previewY + textHeight / 2
      
      // Проверяем, находится ли клик в пределах текста
      const isInside = clickX >= left && clickX <= right && clickY >= top && clickY <= bottom
      
      console.log('🖼️ Проверка клика по тексту:')
      console.log('  clickX:', clickX, 'clickY:', clickY)
      console.log('  previewX:', previewX, 'previewY:', previewY)
      console.log('  textAlign:', this.textDialogData.textAlign)
      console.log('  textBounds:', { left, top, right, bottom })
      console.log('  textSize:', { width: textWidth, height: textHeight })
      console.log('  fontSize:', fontSize, 'previewScale:', previewScale)
      console.log('  ИТОГОВЫЙ РЕЗУЛЬТАТ:', isInside)
      
      return isInside
    },
    
    // Проверка, кликнули ли мы по суперподложке или тексту
    isClickOnSuperBackground(clickX, clickY) {
      if (!this.textDialogPosition) {
        console.log('❌ textDialogPosition не определен в isClickOnSuperBackground')
        return false
      }
      
      // Для режима "Текст с изображением" проверяем клик по тексту, а не по подложке
      if (this.textDialogActiveTab === 'image-text') {
        return this.isClickOnText(clickX, clickY)
      }
      
      // Получаем размеры суперподложки
      const bgWidth = this.textDialogData.backgroundWidth
      const bgHeight = this.textDialogData.backgroundHeight
      
      // Размеры канвасов одинаковые, масштабирование не нужно
      const previewScale = 1.2
      
      // Масштабированные размеры подложки (используем тот же масштаб)
      const scaledBgWidth = Math.round(bgWidth * previewScale)
      const scaledBgHeight = Math.round(bgHeight * previewScale)
      
      // Прямое вычисление границ суперподложки в координатах превью
      const left = this.textDialogPosition.x - scaledBgWidth / 2
      const top = this.textDialogPosition.y - scaledBgHeight / 2
      const right = left + scaledBgWidth
      const bottom = top + scaledBgHeight
      
      // Проверяем, находится ли клик в пределах суперподложки
      const isInside = clickX >= left && clickX <= right && clickY >= top && clickY <= bottom
      
      // Детальная отладка
      console.log('🎯 Проверка клика по суперподложке - ЕДИНЫЙ МАСШТАБ:')
      console.log('  clickX:', clickX, 'clickY:', clickY)
      console.log('  left:', left, 'top:', top, 'right:', right, 'bottom:', bottom)
      console.log('  bgWidth:', bgWidth, 'bgHeight:', bgHeight)
      console.log('  scaledBgWidth:', scaledBgWidth, 'scaledBgHeight:', scaledBgHeight)
      console.log('  previewScale:', previewScale)
      console.log('  X проверка:', `${clickX} >= ${left} && ${clickX} <= ${right} =`, clickX >= left && clickX <= right)
      console.log('  Y проверка:', `${clickY} >= ${top} && ${clickY} <= ${bottom} =`, clickY >= top && clickY <= bottom)
      console.log('  ИТОГОВЫЙ РЕЗУЛЬТАТ:', isInside)
      
      return isInside
    },
    
    // Обработка загрузки изображения для текста
    handleTextImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.textDialogData.textImage = e.target.result
          // Предварительно загружаем изображение для кэширования
          const img = new Image()
          img.onload = () => {
            this.textDialogDataImageText.cachedImage = img
            this.$nextTick(() => {
              this.updatePreviewCanvasOptimized()
            })
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    // Удаление изображения для текста
    clearTextImage() {
      this.textDialogData.textImage = null
      this.textDialogDataImageText.cachedImage = null
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    
    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ PAPER.JS ===
    
    // Вычисление точки пересечения линии хвоста с границей подложки (Paper.js версия)
    getTailIntersectionWithBackgroundPaperJS(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight) {
      // Линия хвоста: от центра подложки под углом tailAngle
      const lineStartX = centerX
      const lineStartY = centerY
      const lineEndX = centerX + 1000 * Math.cos(tailAngle) // Достаточно длинная линия
      const lineEndY = centerY + 1000 * Math.sin(tailAngle)
      
      // Проверяем пересечение с каждой стороной подложки
      const sides = [
        // Верхняя сторона
        { x1: bgX, y1: bgY, x2: bgX + bgWidth, y2: bgY },
        // Правая сторона
        { x1: bgX + bgWidth, y1: bgY, x2: bgX + bgWidth, y2: bgY + bgHeight },
        // Нижняя сторона
        { x1: bgX + bgWidth, y1: bgY + bgHeight, x2: bgX, y2: bgY + bgHeight },
        // Левая сторона
        { x1: bgX, y1: bgY + bgHeight, x2: bgX, y2: bgY }
      ]
      
      // Собираем ВСЕ пересечения
      const allIntersections = []
      
      for (const side of sides) {
        const intersection = this.getLineIntersectionPaperJS(
          lineStartX, lineStartY, lineEndX, lineEndY,
          side.x1, side.y1, side.x2, side.y2
        )
        
        if (intersection) {
          // Проверяем, что точка пересечения находится на стороне подложки
          if (this.isPointOnLineSegmentPaperJS(intersection.x, intersection.y, side.x1, side.y1, side.x2, side.y2)) {
            allIntersections.push(intersection)
          }
        }
      }
      
      if (allIntersections.length > 0) {
        // ВЫБИРАЕМ БЛИЖАЙШУЮ К УГЛУ ТОЧКУ ПЕРЕСЕЧЕНИЯ
        let selectedIntersection = allIntersections[0]
        let minDistance = Infinity
        
        // Вычисляем расстояния до всех углов
        const corners = [
          { name: 'Левый верхний', x: bgX, y: bgY },
          { name: 'Правый верхний', x: bgX + bgWidth, y: bgY },
          { name: 'Правый нижний', x: bgX + bgWidth, y: bgY + bgHeight },
          { name: 'Левый нижний', x: bgX, y: bgY + bgHeight }
        ]
        
        for (const intersection of allIntersections) {
          for (const corner of corners) {
            const distance = Math.sqrt(
              Math.pow(intersection.x - corner.x, 2) +
              Math.pow(intersection.y - corner.y, 2)
            )
            if (distance < minDistance) {
              minDistance = distance
              selectedIntersection = intersection
            }
          }
        }
        
        return selectedIntersection
      }
      
      return null
    },
    
    // Вычисление пересечения двух линий (Paper.js версия)
    getLineIntersectionPaperJS(x1, y1, x2, y2, x3, y3, x4, y4) {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(denom) < 1e-10) return null // Линии параллельны
      
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
    
    // Проверка, находится ли точка на отрезке (Paper.js версия)
    isPointOnLineSegmentPaperJS(px, py, x1, y1, x2, y2) {
      const crossProduct = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1)
      if (Math.abs(crossProduct) > 1e-10) return false
      
      const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)
      const squaredLength = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
      
      return dotProduct >= 0 && dotProduct <= squaredLength
    },
    
    // Определение стороны подложки, с которой выходит хвост (Paper.js версия)
    getTailSideFromIntersectionPaperJS(intersection, bgX, bgY, bgWidth, bgHeight) {
      const tolerance = 1
      
      if (Math.abs(intersection.y - bgY) < tolerance) return 'top'
      if (Math.abs(intersection.y - (bgY + bgHeight)) < tolerance) return 'bottom'
      if (Math.abs(intersection.x - bgX) < tolerance) return 'left'
      if (Math.abs(intersection.x - (bgX + bgWidth)) < tolerance) return 'right'
      
      return 'unknown'
    },
    
    // Проверка, находится ли точка пересечения в углу (Paper.js версия)
    isIntersectionAtCornerPaperJS(intersection, bgX, bgY, bgWidth, bgHeight) {
      const tolerance = 5
      
      const corners = [
        { x: bgX, y: bgY }, // Левый верхний
        { x: bgX + bgWidth, y: bgY }, // Правый верхний
        { x: bgX + bgWidth, y: bgY + bgHeight }, // Правый нижний
        { x: bgX, y: bgY + bgHeight } // Левый нижний
      ]
      
      for (const corner of corners) {
        const distance = Math.sqrt(
          Math.pow(intersection.x - corner.x, 2) +
          Math.pow(intersection.y - corner.y, 2)
        )
        if (distance < tolerance) return true
      }
      
      return false
    },
    
    // Построение пути для углового хвоста (Paper.js версия)
    buildCornerTailSuperPathPaperJS(path, bgX, bgY, bgWidth, bgHeight, intersection, sharpPointX, sharpPointY, tailSide, tailWidthPercent) {
      // Простая реализация для углового хвоста
      const baseWidth = Math.min(bgWidth, bgHeight) * tailWidthPercent * 0.3
      
      // Точки основания хвоста
      const basePoint1X = intersection.x - baseWidth / 2
      const basePoint1Y = intersection.y
      const basePoint2X = intersection.x + baseWidth / 2
      const basePoint2Y = intersection.y
      
      // Строим путь
      path.moveTo(bgX, bgY)
      path.lineTo(bgX + bgWidth, bgY)
      path.lineTo(bgX + bgWidth, bgY + bgHeight)
      path.lineTo(bgX, bgY + bgHeight)
      path.lineTo(bgX, bgY)
      
      // Добавляем хвост
      path.moveTo(basePoint1X, basePoint1Y)
      path.lineTo(sharpPointX, sharpPointY)
      path.lineTo(basePoint2X, basePoint2Y)
    },
    
    // Построение пути для бокового хвоста (Paper.js версия)
    buildSideTailSuperPathPaperJS(path, bgX, bgY, bgWidth, bgHeight, intersection, sharpPointX, sharpPointY, tailSide, tailWidthPercent) {
      // Простая реализация для бокового хвоста
      const baseWidth = Math.min(bgWidth, bgHeight) * tailWidthPercent * 0.3
      
      // Точки основания хвоста
      const basePoint1X = intersection.x - baseWidth / 2
      const basePoint1Y = intersection.y
      const basePoint2X = intersection.x + baseWidth / 2
      const basePoint2Y = intersection.y
      
      // Строим путь
      path.moveTo(bgX, bgY)
      path.lineTo(bgX + bgWidth, bgY)
      path.lineTo(bgX + bgWidth, bgY + bgHeight)
      path.lineTo(bgX, bgY + bgHeight)
      path.lineTo(bgX, bgY)
      
      // Добавляем хвост
      path.moveTo(basePoint1X, basePoint1Y)
      path.lineTo(sharpPointX, sharpPointY)
      path.lineTo(basePoint2X, basePoint2Y)
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

/* Стили для элементов управления текстом */
.text-controls {
  animation: fadeIn 0.3s ease;
}

.control-icon {
  transition: all 0.2s ease;
}

.control-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.apply-button {
  animation: bounceIn 0.3s ease;
}

.apply-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* Стили для индикатора вращения */
.rotation-indicator {
  animation: fadeInScale 0.3s ease;
}

.rotation-instruction {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}




.text-dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.text-dialog-header .btn-close {
  filter: invert(1);
  opacity: 0.8;
}

.text-dialog-header .btn-close:hover {
  opacity: 1;
}

/* Стили для кнопок-табов в заголовке */
.text-dialog-mode-tabs {
  display: flex;
  gap: 2px;
  margin-left: 15px;
  align-self: flex-end;
  margin-bottom: -21px;
}

.text-dialog-mode-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: none !important;
  border-bottom: 3px solid transparent !important;
  padding: 8px 16px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  border-radius: 4px 4px 0 0 !important;
  transition: all 0.2s ease !important;
  display: flex;
  align-items: center;
  position: relative;
}

.text-dialog-mode-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.text-dialog-mode-btn.active {
  background: white !important;
  color: #333 !important;
  border-bottom-color: white !important;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
}

/* Контейнер для стилей шрифта и выравнивания */
.font-style-align-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Разделитель между стилями и выравниванием */
.style-align-divider {
  width: 1px;
  height: 24px;
  background-color: #dee2e6;
}

/* Скрываем настройки межстрочного интервала */
.form-group:has(label[for*="lineHeight"]) {
  display: none !important;
}

/* Стили для кнопок цветов */
.color-buttons {
  display: flex;
  gap: 8px;
}

.color-button-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-icon {
  font-size: 16px;
  color: #6c757d;
  width: 16px;
  text-align: center;
}

.color-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  padding: 0;
}

.color-btn:hover {
  background-color: #e9ecef !important;
  border-color: #adb5bd !important;
}

.color-preview {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #dee2e6;
  z-index: 2;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}

/* Стили для кнопок стилей шрифта */
.font-weight-buttons {
  display: flex;
  gap: 4px;
}

.font-weight-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.font-weight-btn:hover {
  background-color: #e9ecef !important;
  border-color: #adb5bd !important;
}

.font-weight-btn.active {
  background-color: #007bff !important;
  border-color: #007bff !important;
  color: white !important;
}

.font-weight-btn i {
  font-size: 16px;
}

/* Стили для кнопок выравнивания текста */
.text-align-buttons {
  display: flex;
  gap: 4px;
}

.text-align-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.text-align-btn:hover {
  background-color: #e9ecef !important;
  border-color: #adb5bd !important;
}

.text-align-btn.active {
  background-color: #007bff !important;
  border-color: #007bff !important;
  color: white !important;
}

.text-align-btn i {
  font-size: 16px;
}

.text-dialog-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  /* Убираем ограничения высоты для правильной прокрутки */
  max-height: none;
  /* Поддерживаем sticky позиционирование */
  position: relative;
}

.text-dialog-tabs {
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 0;
  padding: 0 24px;
}

.text-dialog-tabs .nav-link {
  border: none;
  border-radius: 0;
  color: #6c757d;
  font-weight: 500;
  padding: 12px 20px;
  margin-right: 4px;
}

.text-dialog-tabs .nav-link.active {
  color: #667eea;
  border-bottom: 2px solid #667eea;
  background: transparent;
}

.text-dialog-tabs .nav-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.parameters-block {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 24px 0 24px;
  border: 1px solid #e9ecef;
  /* Убираем ограничение высоты для правильной прокрутки */
  max-height: none;
  overflow-y: visible;
}

/* Область с полем ввода и превью */
    .text-input-preview-area {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      height: auto;
      min-height: fit-content;
      /* Закрепляем область при скролле */
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
      padding: 20px;
      border: 0;
      margin: 0 0 24px 0;
      /* Убираем тень */
      box-shadow: none;
    }

/* Секция поля ввода текста */
.text-input-section {
  flex: 0 0 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-input-section textarea {
  flex: 1;
  resize: none;
  min-height: calc(20em + .75rem + calc(var(--bs-border-width) * 2));
}

/* Секция превью */
.text-preview-section {
  flex: 1;
  min-width: 0;
}

/* Контейнер с кнопкой "Параметры" */
.mb-3 {
  padding: 0 20px;
}

.text-preview {
  background: #fff;
  border: none;
  border-radius: 0;
  padding: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  /* Автоматическая высота под размер канваса */
  width: 100%;
  height: auto;
  min-height: fit-content;
}

.preview-canvas {
  width: 100%;
  height: auto;
  border: none;
  border-radius: 0;
  background: white;
  /* Обеспечиваем правильное соотношение сторон */
  max-width: 100%;
  display: block;
  /* Убираем ограничения высоты */
  max-height: none;
  /* Добавляем тень */
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, .15);
  /* Улучшаем качество рендеринга для высокого разрешения */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.text-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  width: 100%;
}

.text-dialog-footer .btn {
  padding: 10px 24px;
  font-weight: 500;
  border-radius: 6px;
  width: 50%;
}

.form-control-color {
  width: 60px;
  height: 38px;
  padding: 4px;
  border-radius: 4px;
}

.form-range {
  position: relative;
  bottom: -7px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .text-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .text-dialog-body {
    padding: 16px;
  }
  
  .text-dialog-header {
    padding: 16px 20px;
  }
  
  .text-dialog-mode-tabs {
    flex-wrap: wrap;
    gap: 2px;
    margin-left: 10px;
  }
  
  .text-dialog-mode-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
  
  .font-weight-btn {
    width: 36px;
    height: 36px;
  }
  
  .font-weight-btn i {
    font-size: 14px;
  }
  
  .text-align-btn {
    width: 36px;
    height: 36px;
  }
  
  .text-align-btn i {
    font-size: 14px;
  }
  
  /* На мобильных устройствах элементы располагаются вертикально */
  .font-style-align-container {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .style-align-divider {
    width: 100%;
    height: 1px;
  }
  
  .color-buttons {
    gap: 6px;
  }
  
  .color-button-group {
    gap: 3px;
  }
  
  .color-icon {
    font-size: 14px;
    width: 14px;
  }
  
  .color-btn {
    width: 36px;
    height: 36px;
  }
  
  .color-preview {
    width: 10px;
    height: 10px;
  }
  
  .text-dialog-footer {
    padding: 12px 0;
  }
  
  /* На мобильных устройствах элементы располагаются вертикально */
  .text-input-preview-area {
    flex-direction: column;
    gap: 16px;
    /* На мобильных устройствах sticky может не работать корректно */
    position: relative;
    top: auto;
  }
  
  .text-input-section {
    flex: none;
    width: 100%;
    min-width: auto;
    height: auto;
  }
  
  .text-preview-section {
    width: 100%;
  }
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

.test-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  box-shadow: 4px 4px 12px 0 rgba(0,0,0,.15);
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

.card {
  border-radius: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
}

.card-body {
  padding: 1rem;
}

.card-body.p-0 {
  padding: 0 !important;
}
.control-icon:before {
  display: none !important;
}

/* Стили для вкладки "Стикеры" */
.sticker-layers-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.sticker-layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sticker-layer-item:hover {
  background-color: #f8f9fa;
}

.sticker-layer-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.sticker-layer-item:last-child {
  border-bottom: none;
}

/* Стили для перетаскивания */
.sticker-layer-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.sticker-layer-item.drag-over {
  border-top: 3px solid #2196f3;
  background-color: #e3f2fd;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.sticker-layer-item:hover {
  background-color: #f8f9fa;
  cursor: grab;
}

.sticker-layer-item.dragging:hover {
  cursor: grabbing;
}

.layer-info {
  display: flex;
  align-items: center;
  flex: 1;
}

/* Иконка перетаскивания */
.drag-handle {
  margin-right: 8px;
  color: #6c757d;
  cursor: grab;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.drag-handle:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.drag-handle i {
  font-size: 14px;
}

/* Превью стикера */
.sticker-preview {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 18px;
  background-color: #f8f9fa;
}

.layer-number {
  width: 32px;
  height: 32px;
  background-color: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-right: 12px;
}

.layer-details {
  flex: 1;
}

.layer-name {
  font-weight: 500;
  color: #212529;
  margin-bottom: 2px;
}

.layer-position {
  font-size: 12px;
  color: #6c757d;
}

.layer-actions {
  display: flex;
  gap: 8px;
}

.layer-actions .btn {
  padding: 4px 8px;
  font-size: 12px;
}

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

/* Стили для красной рамки выделения Paper.js */
:deep(.paper-selection) {
  stroke: #dc3545 !important;
  stroke-width: 2 !important;
  fill: none !important;
  stroke-dasharray: 5, 5 !important;
  animation: dash 1s linear infinite !important;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

/* Стили для ручек изменения размера */
:deep(.paper-handle) {
  fill: #dc3545 !important;
  stroke: #ffffff !important;
  stroke-width: 2 !important;
}

/* Стили для кнопки генерации стикеров */
.gen-sticker-button-1 {
  width: 240px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

</style>
