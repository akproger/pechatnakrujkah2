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
                    class="btn btn-primary"
                    :disabled="isLoading"
                    style="background-color: #007bff; border-color: #007bff;"
                  >
                    <i class="bi bi-lightning-fill me-2"></i>
                    {{ isLoading ? 'Генерация...' : 'Сгенерировать стикеры' }}
                  </button>
                </div>
                
                <!-- Кнопка добавления текста -->
                <div class="col" style="padding: 0;">
                  <button 
                    @click="activateTextMode" 
                    class="btn btn-success"
                    :class="{ 'btn-warning': isTextModeActive }"
                    style="background-color: #28a745; border-color: #28a745;"
                  >
                    <i class="bi bi-type me-2"></i>
                    {{ isTextModeActive ? 'Отменить' : 'Текст' }}
                  </button>
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
      
      <!-- Диалог добавления текста -->
      <div v-if="showTextDialog" class="text-dialog-overlay" @click="closeTextDialog">
        <div class="text-dialog" @click.stop>
          <div class="text-dialog-header">
            <div class="d-flex align-items-center w-100">
              <h5 class="text-dialog-title mb-0">
                Добавить текст
              </h5>
              
              <!-- Табы-переключатели режимов -->
              <div class="text-dialog-mode-tabs">
                <button 
                  class="btn btn-sm text-dialog-mode-btn" 
                  :class="{ 'active': textDialogActiveTab === 'conversation' }"
                  @click="textDialogActiveTab = 'conversation'"
                >
                  <i class="bi bi-chat-dots me-1"></i>
                  Разговор
                </button>
                <button 
                  class="btn btn-sm text-dialog-mode-btn" 
                  :class="{ 'active': textDialogActiveTab === 'thoughts' }"
                  @click="textDialogActiveTab = 'thoughts'"
                >
                  <i class="bi bi-lightbulb me-1"></i>
                  Мысли
                </button>
                <button 
                  class="btn btn-sm text-dialog-mode-btn" 
                  :class="{ 'active': textDialogActiveTab === 'standard' }"
                  @click="textDialogActiveTab = 'standard'"
                >
                  <i class="bi bi-square me-1"></i>
                  Стандарт
                </button>
                <button 
                  class="btn btn-sm text-dialog-mode-btn" 
                  :class="{ 'active': textDialogActiveTab === 'image-text' }"
                  @click="textDialogActiveTab = 'image-text'"
                >
                  <i class="bi bi-image me-1"></i>
                  Текст с изображением
                </button>
              </div>
              
              <div class="ms-auto">
                <button type="button" class="btn-close" @click="closeTextDialog"></button>
              </div>
            </div>
          </div>
          
          <div class="text-dialog-body">
            
            <!-- Содержимое вкладок -->
            <div class="tab-content">
              <!-- Вкладка "Разговор" -->
              <div class="tab-pane" :class="{ 'active': textDialogActiveTab === 'conversation' }">
                <!-- Область с полем ввода и превью (закреплена) -->
                <div class="text-input-preview-area">
                  <!-- Поле ввода текста (слева) -->
                  <div class="text-input-section">
                    <textarea 
                      id="textInput"
                      v-model="textDialogData.text"
                      class="form-control"
                      rows="6"
                      placeholder="Введите текст..."
                    ></textarea>
                    
                    <!-- Кнопки управления -->
                    <div class="text-dialog-footer">
                      <button type="button" class="btn btn-secondary" @click="closeTextDialog">
                        Отмена
                      </button>
                      <button type="button" class="btn btn-primary" @click="applyTextToCanvas">
                        Применить
                      </button>
                    </div>
                  </div>
                  
                  <!-- Превью текста с подложкой (справа) -->
                  <div class="text-preview-section">
                    <div class="text-preview">
                      <canvas 
                        ref="previewCanvas" 
                        class="preview-canvas"
                        :width="previewCanvasWidth"
                        :height="previewCanvasHeight"
                        @mousedown="startDragging"
                      ></canvas>
                    </div>
                  </div>
                </div>
                
                <!-- Кнопка параметров -->
                
                <!-- Блок параметров (скрыт по умолчанию) -->
                <div class="parameters-block">
                  
                  <!-- Шрифт и размер -->
                  <div class="form-group mb-3">
                    <div class="row g-2">
                      <div class="col-6">
                        <select id="fontSelect" v-model="textDialogData.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <input 
                          type="range" 
                          id="fontSize" 
                          v-model="textDialogData.fontSize" 
                          class="form-range" 
                          min="12" 
                          max="72" 
                          step="1"
                          :title="`Размер: ${textDialogData.fontSize}px`"
                        >
                      </div>
                    </div>
                  </div>
                  
                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'normal' }"
                        @click="textDialogData.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bold' }"
                        @click="textDialogData.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bolder' }"
                        @click="textDialogData.fontWeight = 'bolder'"
                        title="Полужирный"
                      >
                        <i class="bi bi-type-h1"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'italic' }"
                        @click="textDialogData.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Выравнивание текста -->
                  <div class="form-group mb-3">
                    <div class="text-align-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'left' }"
                        @click="textDialogData.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'center' }"
                        @click="textDialogData.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'right' }"
                        @click="textDialogData.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Цвет текста -->
                  <div class="form-group mb-3">
                    <label for="textColor" class="form-label">Цвет текста:</label>
                    <input type="color" id="textColor" v-model="textDialogData.textColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Цвет подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundColor" class="form-label">Цвет подложки:</label>
                    <input type="color" id="backgroundColor" v-model="textDialogData.backgroundColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Размер хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailSize" class="form-label">Размер хвоста: {{ textDialogData.tailSize }}%</label>
                    <input 
                      type="range" 
                      id="tailSize" 
                      v-model="textDialogData.tailSize" 
                      class="form-range" 
                      min="100" 
                      max="750" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Ширина хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailWidth" class="form-label">Ширина хвоста: {{ textDialogData.tailWidth }}%</label>
                    <input 
                      type="range" 
                      id="tailWidth" 
                      v-model="textDialogData.tailWidth" 
                      class="form-range" 
                      min="40" 
                      max="100" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Угол хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailAngle" class="form-label">Угол хвоста: {{ textDialogData.tailAngle }}°</label>
                    <input 
                      type="range" 
                      id="tailAngle" 
                      v-model="textDialogData.tailAngle" 
                      class="form-range" 
                      min="0" 
                      max="359" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Ширина подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundWidth" class="form-label">Ширина подложки: {{ textDialogData.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      id="backgroundWidth" 
                      v-model="textDialogData.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Высота подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundHeight" class="form-label">Высота подложки: {{ textDialogData.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      id="backgroundHeight" 
                      v-model="textDialogData.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Отступ от краев -->
                  <div class="form-group mb-3">
                    <label for="padding" class="form-label">Отступ от краев: {{ textDialogData.padding }}px</label>
                    <input 
                      type="range" 
                      id="padding" 
                      v-model="textDialogData.padding" 
                      class="form-range" 
                      min="2" 
                      max="15" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Межстрочный интервал -->
                  <div class="form-group mb-3">
                    <label for="lineHeight" class="form-label">Межстрочный интервал: {{ textDialogData.lineHeight }}</label>
                    <input 
                      type="range" 
                      id="lineHeight" 
                      v-model="textDialogData.lineHeight" 
                      class="form-range" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1"
                    >
                  </div>
                  
                  <!-- Обводка -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="stroke" v-model="textDialogData.stroke" class="form-check-input">
                      <label for="stroke" class="form-check-label">Обводка</label>
                    </div>
                    
                    <!-- Параметры обводки (показываются только если обводка включена) -->
                    <div v-if="textDialogData.stroke" class="ms-4">
                      <!-- Толщина обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeWidth" class="form-label">Толщина обводки: {{ textDialogData.strokeWidth }}px</label>
                        <input 
                          type="range" 
                          id="strokeWidth" 
                          v-model="textDialogData.strokeWidth" 
                          class="form-range" 
                          min="1" 
                          max="10" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Цвет обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeColor" class="form-label">Цвет обводки:</label>
                        <input type="color" id="strokeColor" v-model="textDialogData.strokeColor" class="form-control form-control-color">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Тень -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="shadow" v-model="textDialogData.shadow" class="form-check-input">
                      <label for="shadow" class="form-check-label">Тень</label>
                    </div>
                    
                    <!-- Параметры тени (показываются только если тень включена) -->
                    <div v-if="textDialogData.shadow" class="ms-4">
                      <!-- Цвет тени -->
                      <div class="form-group mb-3">
                        <label for="shadowColor" class="form-label">Цвет тени:</label>
                        <input type="color" id="shadowColor" v-model="textDialogData.shadowColor" class="form-control form-control-color">
                      </div>
                      
                      <!-- Прозрачность тени -->
                      <div class="form-group mb-3">
                        <label for="shadowOpacity" class="form-label">Прозрачность тени: {{ textDialogData.shadowOpacity }}%</label>
                        <input 
                          type="range" 
                          id="shadowOpacity" 
                          v-model="textDialogData.shadowOpacity" 
                          class="form-range" 
                          min="10" 
                          max="100" 
                          step="5"
                        >
                      </div>
                      
                      <!-- Смещение тени по X -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetX" class="form-label">Смещение по X: {{ textDialogData.shadowOffsetX }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetX" 
                          v-model="textDialogData.shadowOffsetX" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Смещение тени по Y -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetY" class="form-label">Смещение по Y: {{ textDialogData.shadowOffsetY }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetY" 
                          v-model="textDialogData.shadowOffsetY" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Размытие тени -->
                      <div class="form-group mb-3">
                        <label for="shadowBlur" class="form-label">Размытие тени: {{ textDialogData.shadowBlur }}px</label>
                        <input 
                          type="range" 
                          id="shadowBlur" 
                          v-model="textDialogData.shadowBlur" 
                          class="form-range" 
                          min="0" 
                          max="20" 
                          step="1"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Вкладка "Стандарт" -->
              <div class="tab-pane" :class="{ 'active': textDialogActiveTab === 'standard' }">
                <!-- Область с полем ввода и превью (закреплена) -->
                <div class="text-input-preview-area">
                  <!-- Поле ввода текста (слева) -->
                  <div class="text-input-section">
                    <textarea 
                      id="textInputStandard"
                      v-model="textDialogData.text"
                      class="form-control"
                      rows="6"
                      placeholder="Введите текст..."
                    ></textarea>
                    
                    <!-- Кнопки управления -->
                    <div class="text-dialog-footer">
                      <button type="button" class="btn btn-secondary" @click="closeTextDialog">
                        Отмена
                      </button>
                      <button type="button" class="btn btn-primary" @click="applyTextToCanvas">
                        Применить
                      </button>
                    </div>
                  </div>
                  
                  <!-- Превью текста с подложкой (справа) -->
                  <div class="text-preview-section">
                    <div class="text-preview">
                      <canvas 
                        ref="previewCanvasStandard" 
                        class="preview-canvas"
                        :width="previewCanvasWidth"
                        :height="previewCanvasHeight"
                        @mousedown="startDragging"
                      ></canvas>
                    </div>
                  </div>
                </div>
                
                <!-- Кнопка параметров -->
                
                <!-- Блок параметров (скрыт по умолчанию) -->
                <div class="parameters-block">
                  
                  <!-- Шрифт и размер -->
                  <div class="form-group mb-3">
                    <div class="row g-2">
                      <div class="col-6">
                        <select id="fontSelectStandard" v-model="textDialogData.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <input 
                          type="range" 
                          id="fontSizeStandard" 
                          v-model="textDialogData.fontSize" 
                          class="form-range" 
                          min="12" 
                          max="72" 
                          step="1"
                          :title="`Размер: ${textDialogData.fontSize}px`"
                        >
                      </div>
                    </div>
                  </div>
                  
                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'normal' }"
                        @click="textDialogData.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bold' }"
                        @click="textDialogData.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bolder' }"
                        @click="textDialogData.fontWeight = 'bolder'"
                        title="Полужирный"
                      >
                        <i class="bi bi-type-h1"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'italic' }"
                        @click="textDialogData.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Выравнивание текста -->
                  <div class="form-group mb-3">
                    <div class="text-align-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'left' }"
                        @click="textDialogData.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'center' }"
                        @click="textDialogData.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'right' }"
                        @click="textDialogData.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Цвет текста -->
                  <div class="form-group mb-3">
                    <label for="textColorStandard" class="form-label">Цвет текста:</label>
                    <input type="color" id="textColorStandard" v-model="textDialogData.textColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Цвет подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundColorStandard" class="form-label">Цвет подложки:</label>
                    <input type="color" id="backgroundColorStandard" v-model="textDialogData.backgroundColor" class="form-control form-control-color">
                  </div>
                  
                  
                  <!-- Ширина подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundWidthStandard" class="form-label">Ширина подложки: {{ textDialogData.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      id="backgroundWidthStandard" 
                      v-model="textDialogData.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Высота подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundHeightStandard" class="form-label">Высота подложки: {{ textDialogData.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      id="backgroundHeightStandard" 
                      v-model="textDialogData.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Отступ от краев -->
                  <div class="form-group mb-3">
                    <label for="paddingStandard" class="form-label">Отступ от краев: {{ textDialogData.padding }}px</label>
                    <input 
                      type="range" 
                      id="paddingStandard" 
                      v-model="textDialogData.padding" 
                      class="form-range" 
                      min="2" 
                      max="15" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Межстрочный интервал -->
                  <div class="form-group mb-3">
                    <label for="lineHeightStandard" class="form-label">Межстрочный интервал: {{ textDialogData.lineHeight }}</label>
                    <input 
                      type="range" 
                      id="lineHeightStandard" 
                      v-model="textDialogData.lineHeight" 
                      class="form-range" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1"
                    >
                  </div>
                  
                  <!-- Обводка -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="strokeStandard" v-model="textDialogData.stroke" class="form-check-input">
                      <label for="strokeStandard" class="form-check-label">Обводка</label>
                    </div>
                    
                    <!-- Параметры обводки (показываются только если обводка включена) -->
                    <div v-if="textDialogData.stroke" class="ms-4">
                      <!-- Толщина обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeWidthStandard" class="form-label">Толщина обводки: {{ textDialogData.strokeWidth }}px</label>
                        <input 
                          type="range" 
                          id="strokeWidthStandard" 
                          v-model="textDialogData.strokeWidth" 
                          class="form-range" 
                          min="1" 
                          max="10" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Цвет обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeColorStandard" class="form-label">Цвет обводки:</label>
                        <input type="color" id="strokeColorStandard" v-model="textDialogData.strokeColor" class="form-control form-control-color">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Тень -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="shadowStandard" v-model="textDialogData.shadow" class="form-check-input">
                      <label for="shadowStandard" class="form-check-label">Тень</label>
                    </div>
                    
                    <!-- Параметры тени (показываются только если тень включена) -->
                    <div v-if="textDialogData.shadow" class="ms-4">
                      <!-- Цвет тени -->
                      <div class="form-group mb-3">
                        <label for="shadowColorStandard" class="form-label">Цвет тени:</label>
                        <input type="color" id="shadowColorStandard" v-model="textDialogData.shadowColor" class="form-control form-control-color">
                      </div>
                      
                      <!-- Прозрачность тени -->
                      <div class="form-group mb-3">
                        <label for="shadowOpacityStandard" class="form-label">Прозрачность тени: {{ textDialogData.shadowOpacity }}%</label>
                        <input 
                          type="range" 
                          id="shadowOpacityStandard" 
                          v-model="textDialogData.shadowOpacity" 
                          class="form-range" 
                          min="10" 
                          max="100" 
                          step="5"
                        >
                      </div>
                      
                      <!-- Смещение тени по X -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetXStandard" class="form-label">Смещение по X: {{ textDialogData.shadowOffsetX }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetXStandard" 
                          v-model="textDialogData.shadowOffsetX" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Смещение тени по Y -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetYStandard" class="form-label">Смещение по Y: {{ textDialogData.shadowOffsetY }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetYStandard" 
                          v-model="textDialogData.shadowOffsetY" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Размытие тени -->
                      <div class="form-group mb-3">
                        <label for="shadowBlurStandard" class="form-label">Размытие тени: {{ textDialogData.shadowBlur }}px</label>
                        <input 
                          type="range" 
                          id="shadowBlurStandard" 
                          v-model="textDialogData.shadowBlur" 
                          class="form-range" 
                          min="0" 
                          max="20" 
                          step="1"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Вкладка "Текст с изображением" -->
              <div class="tab-pane" :class="{ 'active': textDialogActiveTab === 'image-text' }">
                <!-- Область с полем ввода и превью (закреплена) -->
                <div class="text-input-preview-area">
                  <!-- Поле ввода текста (слева) -->
                  <div class="text-input-section">
                    <textarea 
                      id="textInputImageText"
                      v-model="textDialogData.text"
                      class="form-control"
                      rows="6"
                      placeholder="Введите текст..."
                    ></textarea>
                    
                    <!-- Кнопки управления -->
                    <div class="text-dialog-footer">
                      <button type="button" class="btn btn-secondary" @click="closeTextDialog">
                        Отмена
                      </button>
                      <button type="button" class="btn btn-primary" @click="applyTextToCanvas">
                        Применить
                      </button>
                    </div>
                  </div>
                  
                  <!-- Превью текста с подложкой (справа) -->
                  <div class="text-preview-section">
                    <div class="text-preview">
                      <canvas 
                        ref="previewCanvasImageText" 
                        class="preview-canvas"
                        :width="previewCanvasWidth"
                        :height="previewCanvasHeight"
                        @mousedown="startDragging"
                      ></canvas>
                    </div>
                  </div>
                </div>
                
                <!-- Кнопка параметров -->
                
                <!-- Блок параметров (скрыт по умолчанию) -->
                <div class="parameters-block">
                  
                  <!-- Шрифт и размер -->
                  <div class="form-group mb-3">
                    <div class="row g-2">
                      <div class="col-6">
                        <select id="fontSelectImageText" v-model="textDialogData.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <input 
                          type="range" 
                          id="fontSizeImageText" 
                          v-model="textDialogData.fontSize" 
                          class="form-range" 
                          min="12" 
                          max="200" 
                          step="1"
                          :title="`Размер: ${textDialogData.fontSize}px`"
                        >
                      </div>
                    </div>
                  </div>
                  
                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'normal' }"
                        @click="textDialogData.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bold' }"
                        @click="textDialogData.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bolder' }"
                        @click="textDialogData.fontWeight = 'bolder'"
                        title="Полужирный"
                      >
                        <i class="bi bi-type-h1"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'italic' }"
                        @click="textDialogData.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Выравнивание текста -->
                  <div class="form-group mb-3">
                    <div class="text-align-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'left' }"
                        @click="textDialogData.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'center' }"
                        @click="textDialogData.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'right' }"
                        @click="textDialogData.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Цвет текста -->
                  <div class="form-group mb-3">
                    <label for="textColorImageText" class="form-label">Цвет текста:</label>
                    <input type="color" id="textColorImageText" v-model="textDialogData.textColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Изображение для текста -->
                  <div class="form-group mb-3">
                    <label for="textImageImageText" class="form-label">Изображение для текста:</label>
                    <input 
                      type="file" 
                      id="textImageImageText" 
                      @change="handleTextImageUpload" 
                      accept="image/*" 
                      class="form-control"
                    >
                    <div v-if="textDialogData.textImage" class="mt-2">
                      <img :src="textDialogData.textImage" alt="Предпросмотр" style="max-width: 100px; max-height: 100px; border: 1px solid #ccc;">
                      <button type="button" @click="clearTextImage" class="btn btn-sm btn-outline-danger ms-2">Удалить</button>
                    </div>
                  </div>
                  
                  <!-- Межстрочный интервал -->
                  <div class="form-group mb-3">
                    <label for="lineHeightImageText" class="form-label">Межстрочный интервал: {{ textDialogData.lineHeight }}</label>
                    <input 
                      type="range" 
                      id="lineHeightImageText" 
                      v-model="textDialogData.lineHeight" 
                      class="form-range" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1"
                    >
                  </div>
                  
                  <!-- Обводка -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="strokeImageText" v-model="textDialogData.stroke" class="form-check-input">
                      <label for="strokeImageText" class="form-check-label">Обводка</label>
                    </div>
                    
                    <!-- Параметры обводки (показываются только если обводка включена) -->
                    <div v-if="textDialogData.stroke" class="ms-4">
                      <!-- Толщина обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeWidthImageText" class="form-label">Толщина обводки: {{ textDialogData.strokeWidth }}px</label>
                        <input 
                          type="range" 
                          id="strokeWidthImageText" 
                          v-model="textDialogData.strokeWidth" 
                          class="form-range" 
                          min="1" 
                          max="10" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Цвет обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeColorImageText" class="form-label">Цвет обводки:</label>
                        <input type="color" id="strokeColorImageText" v-model="textDialogData.strokeColor" class="form-control form-control-color">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Тень -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="shadowImageText" v-model="textDialogData.shadow" class="form-check-input">
                      <label for="shadowImageText" class="form-check-label">Тень</label>
                    </div>
                    
                    <!-- Параметры тени (показываются только если тень включена) -->
                    <div v-if="textDialogData.shadow" class="ms-4">
                      <!-- Цвет тени -->
                      <div class="form-group mb-3">
                        <label for="shadowColorImageText" class="form-label">Цвет тени:</label>
                        <input type="color" id="shadowColorImageText" v-model="textDialogData.shadowColor" class="form-control form-control-color">
                      </div>
                      
                      <!-- Прозрачность тени -->
                      <div class="form-group mb-3">
                        <label for="shadowOpacityImageText" class="form-label">Прозрачность тени: {{ textDialogData.shadowOpacity }}%</label>
                        <input 
                          type="range" 
                          id="shadowOpacityImageText" 
                          v-model="textDialogData.shadowOpacity" 
                          class="form-range" 
                          min="0" 
                          max="100" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Смещение тени по X -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetXImageText" class="form-label">Смещение тени по X: {{ textDialogData.shadowOffsetX }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetXImageText" 
                          v-model="textDialogData.shadowOffsetX" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Смещение тени по Y -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetYImageText" class="form-label">Смещение тени по Y: {{ textDialogData.shadowOffsetY }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetYImageText" 
                          v-model="textDialogData.shadowOffsetY" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Размытие тени -->
                      <div class="form-group mb-3">
                        <label for="shadowBlurImageText" class="form-label">Размытие тени: {{ textDialogData.shadowBlur }}px</label>
                        <input 
                          type="range" 
                          id="shadowBlurImageText" 
                          v-model="textDialogData.shadowBlur" 
                          class="form-range" 
                          min="0" 
                          max="20" 
                          step="1"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Вкладка "Мысли" -->
              <div class="tab-pane" :class="{ 'active': textDialogActiveTab === 'thoughts' }">
                <!-- Область с полем ввода и превью (закреплена) -->
                <div class="text-input-preview-area">
                  <!-- Поле ввода текста (слева) -->
                  <div class="text-input-section">
                    <textarea 
                      id="textInputThoughts"
                      v-model="textDialogData.text"
                      class="form-control"
                      rows="6"
                      placeholder="Введите мысли..."
                    ></textarea>
                    
                    <!-- Кнопки управления -->
                    <div class="text-dialog-footer">
                      <button type="button" class="btn btn-secondary" @click="closeTextDialog">
                        Отмена
                      </button>
                      <button type="button" class="btn btn-primary" @click="applyTextToCanvas">
                        Применить
                      </button>
                    </div>
                  </div>
                  
                  <!-- Превью текста с подложкой (справа) -->
                  <div class="text-preview-section">
                    <div class="text-preview">
                      <canvas 
                        ref="previewCanvasThoughts" 
                        class="preview-canvas"
                        :width="previewCanvasWidth"
                        :height="previewCanvasHeight"
                        @mousedown="startDragging"
                      ></canvas>
                    </div>
                  </div>
                </div>
                
                <!-- Кнопка параметров -->
                
                <!-- Блок параметров (скрыт по умолчанию) -->
                <div class="parameters-block">
                  
                  <!-- Шрифт и размер -->
                  <div class="form-group mb-3">
                    <div class="row g-2">
                      <div class="col-6">
                        <select id="fontSelectThoughts" v-model="textDialogData.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <input 
                          type="range" 
                          id="fontSizeThoughts" 
                          v-model="textDialogData.fontSize" 
                          class="form-range" 
                          min="12" 
                          max="72" 
                          step="1"
                          :title="`Размер: ${textDialogData.fontSize}px`"
                        >
                      </div>
                    </div>
                  </div>
                  
                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'normal' }"
                        @click="textDialogData.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bold' }"
                        @click="textDialogData.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'bolder' }"
                        @click="textDialogData.fontWeight = 'bolder'"
                        title="Полужирный"
                      >
                        <i class="bi bi-type-h1"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogData.fontWeight === 'italic' }"
                        @click="textDialogData.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Выравнивание текста -->
                  <div class="form-group mb-3">
                    <div class="text-align-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'left' }"
                        @click="textDialogData.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'center' }"
                        @click="textDialogData.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogData.textAlign === 'right' }"
                        @click="textDialogData.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Цвет текста -->
                  <div class="form-group mb-3">
                    <label for="textColorThoughts" class="form-label">Цвет текста:</label>
                    <input type="color" id="textColorThoughts" v-model="textDialogData.textColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Цвет подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundColorThoughts" class="form-label">Цвет подложки:</label>
                    <input type="color" id="backgroundColorThoughts" v-model="textDialogData.backgroundColor" class="form-control form-control-color">
                  </div>
                  
                  <!-- Размер хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailSizeThoughts" class="form-label">Размер хвоста: {{ textDialogData.tailSize }}%</label>
                    <input 
                      type="range" 
                      id="tailSizeThoughts" 
                      v-model="textDialogData.tailSize" 
                      class="form-range" 
                      min="100" 
                      max="750" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Ширина хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailWidthThoughts" class="form-label">Ширина хвоста: {{ textDialogData.tailWidth }}%</label>
                    <input 
                      type="range" 
                      id="tailWidthThoughts" 
                      v-model="textDialogData.tailWidth" 
                      class="form-range" 
                      min="40" 
                      max="100" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Угол хвоста -->
                  <div class="form-group mb-3">
                    <label for="tailAngleThoughts" class="form-label">Угол хвоста: {{ textDialogData.tailAngle }}°</label>
                    <input 
                      type="range" 
                      id="tailAngleThoughts" 
                      v-model="textDialogData.tailAngle" 
                      class="form-range" 
                      min="0" 
                      max="359" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Ширина подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundWidthThoughts" class="form-label">Ширина подложки: {{ textDialogData.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      id="backgroundWidthThoughts" 
                      v-model="textDialogData.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Высота подложки -->
                  <div class="form-group mb-3">
                    <label for="backgroundHeightThoughts" class="form-label">Высота подложки: {{ textDialogData.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      id="backgroundHeightThoughts" 
                      v-model="textDialogData.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  
                  <!-- Отступ от краев -->
                  <div class="form-group mb-3">
                    <label for="paddingThoughts" class="form-label">Отступ от краев: {{ textDialogData.padding }}px</label>
                    <input 
                      type="range" 
                      id="paddingThoughts" 
                      v-model="textDialogData.padding" 
                      class="form-range" 
                      min="2" 
                      max="15" 
                      step="1"
                    >
                  </div>
                  
                  <!-- Межстрочный интервал -->
                  <div class="form-group mb-3">
                    <label for="lineHeightThoughts" class="form-label">Межстрочный интервал: {{ textDialogData.lineHeight }}</label>
                    <input 
                      type="range" 
                      id="lineHeightThoughts" 
                      v-model="textDialogData.lineHeight" 
                      class="form-range" 
                      min="1.0" 
                      max="2.0" 
                      step="0.1"
                    >
                  </div>
                  
                  <!-- Обводка -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="strokeThoughts" v-model="textDialogData.stroke" class="form-check-input">
                      <label for="strokeThoughts" class="form-check-label">Обводка</label>
                    </div>
                    
                    <!-- Параметры обводки (показываются только если обводка включена) -->
                    <div v-if="textDialogData.stroke" class="ms-4">
                      <!-- Толщина обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeWidthThoughts" class="form-label">Толщина обводки: {{ textDialogData.strokeWidth }}px</label>
                        <input 
                          type="range" 
                          id="strokeWidthThoughts" 
                          v-model="textDialogData.strokeWidth" 
                          class="form-range" 
                          min="1" 
                          max="10" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Цвет обводки -->
                      <div class="form-group mb-3">
                        <label for="strokeColorThoughts" class="form-label">Цвет обводки:</label>
                        <input type="color" id="strokeColorThoughts" v-model="textDialogData.strokeColor" class="form-control form-control-color">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Тень -->
                  <div class="form-group mb-3">
                    <div class="form-check mb-2">
                      <input type="checkbox" id="shadowThoughts" v-model="textDialogData.shadow" class="form-check-input">
                      <label for="shadowThoughts" class="form-check-label">Тень</label>
                    </div>
                    
                    <!-- Параметры тени (показываются только если тень включена) -->
                    <div v-if="textDialogData.shadow" class="ms-4">
                      <!-- Цвет тени -->
                      <div class="form-group mb-3">
                        <label for="shadowColorThoughts" class="form-label">Цвет тени:</label>
                        <input type="color" id="shadowColorThoughts" v-model="textDialogData.shadowColor" class="form-control form-control-color">
                      </div>
                      
                      <!-- Прозрачность тени -->
                      <div class="form-group mb-3">
                        <label for="shadowOpacityThoughts" class="form-label">Прозрачность тени: {{ textDialogData.shadowOpacity }}%</label>
                        <input 
                          type="range" 
                          id="shadowOpacityThoughts" 
                          v-model="textDialogData.shadowOpacity" 
                          class="form-range" 
                          min="10" 
                          max="100" 
                          step="5"
                        >
                      </div>
                      
                      <!-- Смещение тени по X -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetXThoughts" class="form-label">Смещение по X: {{ textDialogData.shadowOffsetX }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetXThoughts" 
                          v-model="textDialogData.shadowOffsetX" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Смещение тени по Y -->
                      <div class="form-group mb-3">
                        <label for="shadowOffsetYThoughts" class="form-label">Смещение по Y: {{ textDialogData.shadowOffsetY }}px</label>
                        <input 
                          type="range" 
                          id="shadowOffsetYThoughts" 
                          v-model="textDialogData.shadowOffsetY" 
                          class="form-range" 
                          min="-20" 
                          max="20" 
                          step="1"
                        >
                      </div>
                      
                      <!-- Размытие тени -->
                      <div class="form-group mb-3">
                        <label for="shadowBlurThoughts" class="form-label">Размытие тени: {{ textDialogData.shadowBlur }}px</label>
                        <input 
                          type="range" 
                          id="shadowBlurThoughts" 
                          v-model="textDialogData.shadowBlur" 
                          class="form-range" 
                          min="0" 
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
                Текст
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

        <!-- Таб "Текст" -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'text' }" id="text" role="tabpanel" aria-labelledby="text-tab">
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <TextEditor 
                    v-model="texts"
                    @texts-changed="handleTextsChanged"
                    @text-visibility-changed="handleTextVisibilityChanged"
                    @text-deleted="handleTextDeleted"
                  />
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
      </div>
    </div>
  </div>
</template>

<script>
import paper from 'paper'
import { markRaw } from 'vue'
import ThreeDRenderer from '../ThreeDRenderer.vue'
import StickerSelectionModal from '../StickerSelectionModal.vue'
import TextEditor from '../TextEditor.vue'
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
    TextEditor
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
      
      // Стикеры
      stickers: [],
      coveragePercentage: 0,
      // Настройки генерации
      minStickerSize: 50, // Минимальный размер стикера (50% от базового)
      maxStickerSize: 150, // Максимальный размер стикера (150% от базового)
      baseStickerSize: 100, // Базовый размер стикера
      targetCoverage: 100, // Целевое покрытие в процентах (100%)
      maxIterations: 2000, // Максимальное количество попыток размещения
      overlapThreshold: 0.05, // Максимальное перекрытие (5%) - уменьшаем для более плотного размещения
      
      // Режим добавления текста
      isTextModeActive: false, // Активен ли режим добавления текста
      showTextDialog: false, // Показать ли диалог добавления текста
      textDialogPosition: null, // Позиция для размещения текста
      textDialogActiveTab: 'conversation', // Активная вкладка в диалоге текста (conversation/thoughts)
      // Данные для каждой вкладки отдельно
      textDialogDataConversation: {
        text: '',
        font: 'Arial',
        fontWeight: 'normal',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        tailSize: 145,
        tailWidth: 40,
        tailAngle: 45,
        backgroundWidth: 200,
        backgroundHeight: 100,
        padding: 4,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowOffsetX: 8,
        shadowOffsetY: 8,
        shadowBlur: 1
      },
      
      textDialogDataThoughts: {
        text: '',
        font: 'Arial',
        fontWeight: 'normal',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        tailSize: 145,
        tailWidth: 40,
        tailAngle: 45,
        backgroundWidth: 200,
        backgroundHeight: 100,
        padding: 4,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowOffsetX: 8,
        shadowOffsetY: 8,
        shadowBlur: 1
      },
      
      textDialogDataStandard: {
        text: '',
        font: 'Arial',
        fontWeight: 'normal',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        backgroundWidth: 200,
        backgroundHeight: 100,
        padding: 4,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowOffsetX: 8,
        shadowOffsetY: 8,
        shadowBlur: 1
      },
      
      textDialogDataImageText: {
        text: '',
        font: 'Arial',
        fontWeight: 'bold',
        fontSize: 135,
        textColor: '#FFFFFF',
        textImage: null,
        cachedImage: null,
        padding: 4,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 4,
        strokeColor: '#FFFFFF',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 85,
        shadowOffsetX: 11,
        shadowOffsetY: 6,
        shadowBlur: 1
      },
      
      // Свойства для перетаскивания
      isDragging: false, // Активно ли перетаскивание
      dragStartPosition: null, // Начальная позиция перетаскивания
      dragOffset: { x: 0, y: 0 }, // Смещение при перетаскивании
      originalTextPosition: null, // Оригинальная позиция текста
      canStopDragging: false, // Можно ли остановить перетаскивание
      mouseUpAdded: false // Добавлен ли обработчик mouseup
    }
  },
  computed: {
    // Получаем данные для активной вкладки
    textDialogData() {
      switch (this.textDialogActiveTab) {
        case 'conversation':
          return this.textDialogDataConversation
        case 'thoughts':
          return this.textDialogDataThoughts
        case 'standard':
          return this.textDialogDataStandard
        case 'image-text':
          return this.textDialogDataImageText
        default:
          return this.textDialogDataConversation
      }
    },
    
    // Размеры для превью канваса с соотношением сторон 19:9 (разрешение увеличено в 3 раза)
    previewCanvasWidth() {
      if (!this.$refs.testCanvas) return 1200
      // Ограничиваем максимальную ширину для превью (в 3 раза больше)
      const mainWidth = this.$refs.testCanvas.width || 400
      return Math.min(mainWidth * 3, 1200)
    },
    previewCanvasHeight() {
      if (!this.$refs.testCanvas) return 570
      // Вычисляем высоту на основе ширины с соотношением 19:9 (в 3 раза больше)
      const width = this.previewCanvasWidth
      return Math.round((width * 9) / 19)
    }
  },
  watch: {
    // Автоматически обновляем превью при изменении любых параметров текста
    'textDialogData.text'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.fontSize'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.fontWeight'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.font'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.textColor'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.backgroundColor'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.backgroundWidth'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.backgroundHeight'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.padding'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.stroke'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadow'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.strokeWidth'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.strokeColor'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadowColor'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadowOpacity'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadowOffsetX'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadowOffsetY'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.shadowBlur'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.tailSize'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.tailWidth'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.tailAngle'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.textAlign'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.lineHeight'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    'textDialogData.textImage'() {
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    
    // Вотчер для переключения вкладок
    'textDialogActiveTab'() {
      console.log('🔄 Переключение вкладки на:', this.textDialogActiveTab)
      
      // Принудительно обновляем превью при переключении
      this.$nextTick(() => {
        console.log('🔄 Принудительное обновление после переключения вкладки')
        this.updatePreviewCanvas()
        
        // Дополнительное обновление для режима "Мысли"
        if (this.textDialogActiveTab === 'thoughts') {
          console.log('🧠 Дополнительное обновление режима "Мысли"')
          this.$nextTick(() => {
            this.updateSinglePreviewCanvas(this.$refs.previewCanvasThoughts)
          })
        }
      })
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
      
      // Добавляем обработчик клика по канвасу для режима текста
      canvas.addEventListener('click', this.handleCanvasClick)
      
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
      
      // Устанавливаем размеры канваса
      canvas.width = containerWidth
      canvas.height = containerHeight
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      

      
      // Обновляем размер view в Paper.js
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
      
      console.log('🎯 Запуск 5 итераций генерации стикеров:', viewWidth, 'x', viewHeight)
      
      // Запускаем 5 итераций генерации
      await this.runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight)
    },
    
    // Запуск множественных итераций генерации
    async runMultipleGenerations(selectedMasks, selectedImages, viewWidth, viewHeight) {
      console.log('🚀 Запуск 5 итераций генерации...')
      
      try {
        // Итерация 1: Основная генерация
        console.log('📋 Итерация 1/5: Основная генерация')
        await this.runOptimalPlacement(selectedMasks, selectedImages, viewWidth, viewHeight)
        
        // Итерации 2-5: Дополнительные слои
        for (let iteration = 2; iteration <= 5; iteration++) {
          console.log(`📋 Итерация ${iteration}/5: Дополнительный слой`)
          
          // Проверяем общий лимит стикеров (максимум 100)
          if (this.stickers.length >= 100) {
            console.log(`🛑 Достигнут общий лимит стикеров: ${this.stickers.length}/100`)
            break
          }
          
          // Небольшая пауза между итерациями для стабильности
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Запускаем addMoreStickers для создания нового слоя
          await this.addMoreStickers()
          
          // Обновляем прогресс
          console.log(`✅ Итерация ${iteration}/5 завершена. Всего стикеров: ${this.stickers.length}`)
        }
        
        console.log('🎉 Все итерации генерации завершены!')
        console.log(`📊 Итоговое количество стикеров: ${this.stickers.length} (максимум 100 - 20 на итерацию)`)
        
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
        console.error('❌ Ошибка при выполнении множественных итераций:', error)
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
          for (let attempt = 0; attempt < 20; attempt++) {
            const x = centerX + (Math.random() - 0.5) * gridSize * 2
            const y = centerY + (Math.random() - 0.5) * gridSize * 2
            
            // Разрешаем стикерам выходить за границы канваса для лучшего заполнения
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.2) {
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
            // Проверяем только минимальное перекрытие с канвасом (хотя бы 20% стикера должно быть внутри)
            const overlapWithCanvas = this.calculateCanvasOverlap(x, y, size, viewWidth, viewHeight)
            if (overlapWithCanvas < 0.2) {
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
      
      // Основной цикл размещения (ограничиваем 20 стикерами на итерацию и общим лимитом 100)
      while (currentCoverage < this.targetCoverage && iterations < this.maxIterations && this.stickers.length < 20 && this.stickers.length < 100) {
        iterations++
        
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
            const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size)
            
            if (sticker) {
              this.stickers.push(sticker)
              
              // Обновляем сетку покрытия
              updateCoverageGrid(position.x, position.y, size)
              
              // Пересчитываем покрытие
              currentCoverage = calculateCoverage()
              this.coveragePercentage = Math.round(currentCoverage)
              
              console.log(`📊 Итерация ${iterations}: ${this.stickers.length} стикеров, покрытие ${this.coveragePercentage}%`)
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
      console.log(`✅ Завершено: ${this.stickers.length} стикеров (максимум 20), покрытие ${this.coveragePercentage}%`)
      
      // Финальное обновление канваса
      this.paperScope.view.draw()
      
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
             for (let attempt = 0; attempt < 15; attempt++) {
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
        
        // Генерируем новый слой стикеров (ограничиваем 20 стикерами на итерацию)
        let iterations = 0
        const maxIterations = 20 // Ограничиваем количество стикеров в новом слое
        
        while (currentCoverage < 80 && iterations < maxIterations && this.stickers.length < 100) { // Останавливаемся на 80% покрытии, 20 стикерах или общем лимите 100
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
              const sticker = await this.createOptimalSticker(selectedMasks, selectedImages, position.x, position.y, size)
              
              if (sticker) {
                this.stickers.push(sticker)
                updateCoverageGrid(position.x, position.y, size)
                currentCoverage = calculateCoverage()
                this.coveragePercentage = Math.round(currentCoverage)
                
                console.log(`📊 Добавлен стикер ${iterations}: покрытие ${this.coveragePercentage}%`)
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
        console.log(`✅ Создан новый слой: ${iterations} стикеров (максимум 20), покрытие: ${this.coveragePercentage}%`)
        
        // Обновляем канвас только один раз в конце
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
        console.error('Ошибка при добавлении стикеров:', error)
        this.isLoading = false
      }
    },
    
    // Создание оптимального стикера
    createOptimalSticker(masks, images, x, y, size) {
      // Случайная маска
      const randomMask = masks[Math.floor(Math.random() * masks.length)]
      // Случайное изображение
      const randomImage = images[Math.floor(Math.random() * images.length)]
      
      console.log(`🎨 Создаем стикер: ${randomMask.name} + ${randomImage.name} в позиции (${x}, ${y}) размером ${size}`)
      
      // Случайный поворот для лучшего покрытия
      const rotation = Math.random() * 360
      
      return new Promise((resolve) => {
        // Загружаем SVG маску (как в addMaskToCanvas)
        fetch(randomMask.url)
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
                  const raster = new this.paperScope.Raster(randomImage.url)
                  raster.visible = false // Скрываем оригинальный растр
                  
                  raster.onLoad = () => {
                    console.log(`🖼️ Растр загружен: ${randomImage.name}, размеры: ${raster.image.width}x${raster.image.height}`)
                    
                    // Создаем временный canvas для обрезки изображения
                    const tempCanvas = document.createElement('canvas')
                    const tempCtx = tempCanvas.getContext('2d')
                    
                    // Получаем размеры маски
                    const maskBounds = path.bounds
                    console.log(`📐 Размеры маски ${randomMask.name}: ${maskBounds.width}x${maskBounds.height}`)
                    
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
                        mask: randomMask.name,
                        image: randomImage.name
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
    
    // Проверка перекрытия стикеров (разрешено перекрытие на 30%)
    checkOverlap(x, y, size, excludeExisting = false) {
      // Убираем margin для разрешения перекрытия
      const margin = 0 // Убираем минимальное расстояние между стикерами
      
      // Если excludeExisting = true, не проверяем перекрытие с существующими стикерами
      const stickersToCheck = excludeExisting ? [] : this.stickers
      
      for (const sticker of stickersToCheck) {
        // Используем данные стикера для проверки перекрытия
        const stickerX = sticker.x
        const stickerY = sticker.y
        const stickerSize = sticker.size
        
        // Разрешаем перекрытие на 30% (стикеры могут заходить друг на друга на 30%)
        const overlapThreshold = 0.3 // Допускаем 30% перекрытие
        
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
    
    // Обработка изменения текстов
    handleTextsChanged(texts) {
      console.log('🔄 handleTextsChanged вызван с текстами:', texts)
      this.texts = texts
      console.log('📝 Массив текстов обновлен, вызываем updateCanvasWithTexts')
      this.updateCanvasWithTexts()
      
      // Дополнительно обновляем 3D текстуру
      this.forceUpdate3DTexture()
    },
    
    // Обработка изменения видимости текста
    handleTextVisibilityChanged(text) {
      // Обновляем канвас с текстами
      this.updateCanvasWithTexts()
      
      // Принудительно обновляем 3D текстуру
      this.forceUpdate3DTexture()
    },
    
    // Обработка удаления текста
    handleTextDeleted(deletedText) {
      // Находим и удаляем HTML элемент с канваса
      const textElement = this.htmlTextElements.find(el => {
        return el.textContent === deletedText.content
      })
      
      if (textElement) {
        // Удаляем элемент из DOM
        if (textElement.parentNode) {
          textElement.parentNode.removeChild(textElement)
        }
        
        // Удаляем из массива отслеживания
        const index = this.htmlTextElements.indexOf(textElement)
        if (index > -1) {
          this.htmlTextElements.splice(index, 1)
        }
        
        // Удаляем состояние управления
        const textId = textElement.dataset.textId
        if (textId && this.textControlStates[textId]) {
          delete this.textControlStates[textId]
        }
        
        console.log('🗑️ Текст удален с канваса:', deletedText.content)
      }
      
      // Обновляем канвас
      this.updateCanvasWithTexts()
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
    
    // Активация режима добавления текста
    activateTextMode() {
      this.isTextModeActive = !this.isTextModeActive
      console.log('🔄 Режим добавления текста:', this.isTextModeActive ? 'активирован' : 'деактивирован')
      
      if (this.isTextModeActive) {
        // Добавляем курсор-указатель для канваса
        const canvas = this.$refs.testCanvas
        if (canvas) {
          canvas.style.cursor = 'crosshair'
        }
      } else {
        // Возвращаем обычный курсор
        const canvas = this.$refs.testCanvas
        if (canvas) {
          canvas.style.cursor = 'default'
        }
        
        // Закрываем диалог если он открыт
        this.showTextDialog = false
        this.textDialogPosition = null
      }
    },
    
    // Обработчик клика по канвасу в режиме текста
    handleCanvasClick(event) {
      if (!this.isTextModeActive) return
      
      console.log('🖱️ Клик по канвасу в режиме текста')
      
      // Получаем позицию клика относительно канваса
      const canvas = this.$refs.testCanvas
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Конвертируем в координаты Paper.js
      const point = new this.paperScope.Point(x, y)
      
      console.log('📍 Позиция клика:', { x, y, point })
      
      // Сохраняем позицию и открываем диалог
      this.textDialogPosition = point
      this.showTextDialog = true
      
      // Деактивируем режим текста
      this.isTextModeActive = false
      
      // Возвращаем обычный курсор
      canvas.style.cursor = 'default'
      
      // Обновляем превью сразу после открытия диалога
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },
    
    // Закрытие диалога добавления текста
    closeTextDialog() {
      this.showTextDialog = false
      this.textDialogPosition = null
      this.resetTextDialogData()
    },
    
    // Сброс данных диалога
    resetTextDialogData() {
      this.textDialogData = {
        text: '',
        font: 'Arial',
        fontWeight: 'normal',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        tailSize: 145,
        tailWidth: 40,
        tailAngle: 45,
        backgroundWidth: 200,
        backgroundHeight: 100,
        padding: 12,
        stroke: false,
        shadow: false
      }
    },
    
    
    // Обновление превью канваса
    updatePreviewCanvas() {
      console.log('🔄 Обновление превью канваса, активная вкладка:', this.textDialogActiveTab)
      
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
        this.$nextTick(() => {
          this.updateSinglePreviewCanvas(this.$refs.previewCanvasImageText)
        })
      }
    },
    
    // Обновление одного превью канваса
    updateSinglePreviewCanvas(previewCanvas) {
      const mainCanvas = this.$refs.testCanvas
      
      if (!previewCanvas || !mainCanvas) {
        console.log('⚠️ Канвасы не найдены для превью')
        return
      }
      
      console.log('🔄 Обновление превью канваса')
      console.log('🎯 textDialogPosition:', this.textDialogPosition)
      console.log('🎯 textDialogData.text:', this.textDialogData.text)
      
      // Получаем контекст превью канваса
      const previewCtx = previewCanvas.getContext('2d')
      
      // Очищаем превью
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
      
      // Копируем содержимое основного канваса в превью
      previewCtx.drawImage(mainCanvas, 0, 0, previewCanvas.width, previewCanvas.height)
      
      // Добавляем текст с подложкой в зависимости от активной вкладки
      console.log('🎯 updateSinglePreviewCanvas - активная вкладка:', this.textDialogActiveTab)
      
      if (this.textDialogPosition && this.textDialogData.text) {
        if (this.textDialogActiveTab === 'thoughts') {
          // 🧠 РЕЖИМ "МЫСЛИ" - используем специальный метод
          console.log('🧠 ВЫЗЫВАЕМ РЕЖИМ "МЫСЛИ"')
          this.drawTextPreviewOnCanvasThoughtsMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'standard') {
          // ⭐ РЕЖИМ "СТАНДАРТ" - используем специальный метод без хвоста
          console.log('⭐ ВЫЗЫВАЕМ РЕЖИМ "СТАНДАРТ"')
          this.drawTextPreviewOnCanvasStandardMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'image-text') {
          // 🖼️ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ" - используем специальный метод без хвоста
          console.log('🖼️ ВЫЗЫВАЕМ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ"')
          this.drawTextPreviewOnCanvasImageTextMode(previewCtx, previewCanvas)
        } else {
          // 💬 РЕЖИМ "РАЗГОВОР" - используем обычный метод
          console.log('💬 ВЫЗЫВАЕМ РЕЖИМ "РАЗГОВОР"')
          this.drawTextPreviewOnCanvas(previewCtx, previewCanvas)
        }
      } else if (this.textDialogPosition) {
        // Показываем дефолтный текст "Текст" на дефолтной подложке
        console.log('📝 ВЫЗЫВАЕМ ДЕФОЛТНЫЙ ТЕКСТ')
        if (this.textDialogActiveTab === 'thoughts') {
          // 🧠 РЕЖИМ "МЫСЛИ" - дефолтная подложка без треугольника
          this.drawDefaultTextPreviewOnCanvasThoughtsMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'standard') {
          // ⭐ РЕЖИМ "СТАНДАРТ" - дефолтная подложка без хвоста
          this.drawDefaultTextPreviewOnCanvasStandardMode(previewCtx, previewCanvas)
        } else if (this.textDialogActiveTab === 'image-text') {
          // 🖼️ РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ" - дефолтная подложка без хвоста
          this.drawDefaultTextPreviewOnCanvasImageTextMode(previewCtx, previewCanvas)
        } else {
          // 💬 РЕЖИМ "РАЗГОВОР" - обычная дефолтная подложка
          this.drawDefaultTextPreviewOnCanvas(previewCtx, previewCanvas)
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
      
      // Конвертируем координаты клика в координаты превью канваса
      // Используем динамическое масштабирование для точной синхронизации - МЕТОД 1
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // ВРЕМЕННО используем фиксированный масштаб для стабильности размеров - МЕТОД 1
      const previewScale = 1.2 // Фиксированный масштаб для стабильности размеров
      
      // ЛОГИРОВАНИЕ масштаба для отладки - МЕТОД 1
      console.log('🎨 МАСШТАБ ОТРИСОВКИ МЕТОД 1:', {
        scaleX: scaleX.toFixed(3),
        scaleY: scaleY.toFixed(3),
        previewScale: previewScale.toFixed(3),
        mainCanvas: `${mainWidth}x${mainHeight}`,
        previewCanvas: `${canvas.width}x${canvas.height}`
      })
      
      // Настройки текста (адаптированные под превью) - МЕТОД 1
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = Math.round(this.textDialogData.padding * previewScale)
      
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
        Math.round(this.textDialogData.backgroundWidth * previewScale), 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        Math.round(this.textDialogData.backgroundHeight * previewScale), 
        textHeight + padding * 2
      )
      
      // Позиция подложки (центрируем относительно точки клика)
      const bgX = previewX - backgroundWidth / 2
      const bgY = previewY - backgroundHeight / 2
      
      // Сначала рисуем тень если включена (применяется к объединенной фигуре)
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur * previewScale))
        ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX * previewScale)
        ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY * previewScale)
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
        ctx.lineWidth = Math.max(1, Math.round(this.textDialogData.strokeWidth * previewScale))
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
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Настройки текста (адаптированные под превью)
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = Math.round(this.textDialogData.padding * previewScale)
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, this.textDialogData.text, fontSize, this.textDialogData.lineHeight)
      
      // Размеры подложки (адаптированные под превью)
      const bgWidth = Math.round(this.textDialogData.backgroundWidth * previewScale)
      const bgHeight = Math.round(this.textDialogData.backgroundHeight * previewScale)
      
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
    
    // 🧠 РЕЖИМ "МЫСЛИ" - новая архитектура суперподложки
    // Отрисовка овальной подложки с множественными овальными хвостами
    drawThoughtsModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true) {
      console.log('🧠 Отрисовка режима "Мысли" - овальная подложка с множественными хвостами')
      
      // Рисуем каждый овал отдельно, чтобы избежать создания общего пути
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor)
      
      console.log('✅ Режим "Мысли" отрисован - только овалы, без треугольников!')
    },
    
    // Метод для режима "Мысли" - овальная подложка с множественными хвостами
    drawTextPreviewOnCanvasThoughtsMode(ctx, canvas) {
      if (!this.textDialogPosition) return
      
      console.log('🧠 ТЕСТИРОВАНИЕ РЕЖИМА "МЫСЛИ" - овальная подложка')
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Настройки текста
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = Math.round(this.textDialogData.padding * previewScale)
      
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
        Math.round(this.textDialogData.backgroundWidth * previewScale), 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        Math.round(this.textDialogData.backgroundHeight * previewScale), 
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
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Размеры дефолтной подложки - увеличиваем для лучшей видимости
      const backgroundWidth = Math.round(200 * previewScale)
      const backgroundHeight = Math.round(100 * previewScale)
      
      console.log('🧠 Дефолтная подложка - параметры:', {
        backgroundWidth: backgroundWidth,
        backgroundHeight: backgroundHeight,
        previewScale: previewScale,
        drawTail: true
      })
      
      // Рисуем режим "Мысли" - основной овал + хвост (всегда показываем хвост в режиме "Мысли")
      this.drawThoughtsModeShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, '#f0f0f0', false, true)
      
      // Рисуем дефолтный текст "Текст"
      ctx.font = `400 ${Math.round(24 * previewScale)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#333'
      ctx.fillText('Текст', previewX, previewY)
      
      console.log('✅ Дефолтная подложка режима "Мысли" отрисована')
    },
    
    // Построение пути для режима "Мысли" - ПРОСТАЯ ЛОГИКА
    buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail = true, backgroundColor) {
      // 1️⃣ Рисуем основной овал (подложка) с тенью если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur * scale))
        ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX * scale)
        ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY * scale)
      }
      
      ctx.beginPath()
      this.drawOval(ctx, centerX, centerY, bgWidth, bgHeight)
      ctx.fillStyle = this.textDialogData.backgroundColor
      ctx.fill()
      
      // Сбрасываем тень
      if (this.textDialogData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor
        ctx.lineWidth = Math.max(1, Math.round(this.textDialogData.strokeWidth * scale))
        ctx.stroke()
      }
      
      // Если не нужно рисовать хвост (для дефолтной подложки), выходим
      if (!drawTail) {
        console.log('🧠 Режим "Мысли" - только основной овал, хвост не рисуем')
        return
      }
      
      // Параметры хвоста из настроек
      const tailSize = Number(this.textDialogData.tailSize) / 100 // Длина хвоста (от 100% до 300%)
      const tailWidth = Number(this.textDialogData.tailWidth) / 100 // Ширина хвоста (от 40% до 100%)
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * tailSize // Длина хвоста
      const maxTailWidth = minDimension * tailWidth // Максимальная ширина хвоста
      
      console.log('🧠 Параметры хвоста:', {
        tailSize: this.textDialogData.tailSize,
        tailWidth: this.textDialogData.tailWidth,
        tailAngle: this.textDialogData.tailAngle,
        tailSizePercent: tailSize,
        tailWidthPercent: tailWidth,
        tailAngleDeg: (tailAngle * 180 / Math.PI).toFixed(1),
        tailLength: tailLength.toFixed(1),
        maxTailWidth: maxTailWidth.toFixed(1),
        minDimension: minDimension.toFixed(1)
      })
      
      // Проверяем, что параметры хвоста не слишком маленькие
      if (tailLength < 10 || maxTailWidth < 5) {
        console.log('⚠️ Параметры хвоста слишком маленькие, используем минимальные значения')
        const minTailLength = Math.max(10, minDimension * 0.3)
        const minTailWidth = Math.max(5, minDimension * 0.2)
        console.log('🧠 Скорректированные параметры:', {
          tailLength: minTailLength.toFixed(1),
          maxTailWidth: minTailWidth.toFixed(1)
        })
      }
      
      // 2️⃣ ПРОСТАЯ ЛОГИКА: рисуем овалы хвоста по прямой линии от центра
      // Упрощенная логика: рисуем только 2 овала (большой и маленький)
      const tailCount = 2
      
      console.log('🧠 Количество овалов хвоста:', tailCount)
      
      // 3️⃣ Отступ от основного овала (минимальный, чтобы не соприкасались)
      const offsetFromMain = maxTailWidth * 0.1 // Уменьшаем отступ для лучшей видимости
      
      // 4️⃣ Рисуем овалы хвоста с правильным расположением (2 овала)
      for (let i = 0; i < tailCount; i++) {
        // Позиция овалов: маленький в конце, большой на 35% длины хвоста от маленького
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
        
        // Размер овала (только 2 овала)
        let sizeMultiplier
        if (i === 0) {
          // Первый овал (большой) - увеличиваем на 60%
          sizeMultiplier = 1.6 // 1.0 + 60% = 1.6
        } else {
          // Второй овал (маленький) - базовый размер
          sizeMultiplier = 1.0
        }
        
        const ovalWidth = maxTailWidth * sizeMultiplier
        const ovalHeight = ovalWidth * 0.7 // Увеличиваем соотношение сторон для лучшей видимости
        
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
        if (this.textDialogData.shadow) {
          ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur * scale))
          ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX * scale)
          ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY * scale)
        }
        
        // Рисуем овал хвоста с собственным заполнением
        ctx.beginPath()
        this.drawOval(ctx, ovalX, ovalY, ovalWidth, ovalHeight)
        ctx.fillStyle = this.textDialogData.backgroundColor
        ctx.fill()
        
        // Сбрасываем тень
        if (this.textDialogData.shadow) {
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена
        if (this.textDialogData.stroke) {
          ctx.strokeStyle = this.textDialogData.strokeColor
          ctx.lineWidth = Math.max(1, Math.round(this.textDialogData.strokeWidth * scale))
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
      const totalTextHeight = (lines.length - 1) * lineSpacing
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
      const totalTextHeight = (lines.length - 1) * lineSpacing
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
      
      // Конвертируем координаты клика в координаты превью канваса - МЕТОД 2
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // ВРЕМЕННО используем фиксированный масштаб для стабильности размеров - МЕТОД 2
      const previewScale = 1.2 // Фиксированный масштаб для стабильности размеров
      
      // ЛОГИРОВАНИЕ масштаба для отладки - МЕТОД 2
      console.log('🎨 МАСШТАБ ОТРИСОВКИ МЕТОД 2:', {
        scaleX: scaleX.toFixed(3),
        scaleY: scaleY.toFixed(3),
        previewScale: previewScale.toFixed(3),
        mainCanvas: `${mainWidth}x${mainHeight}`,
        previewCanvas: `${canvas.width}x${canvas.height}`
      })
      
      // Настройки текста (адаптированные под превью)
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = Math.round(this.textDialogData.padding * previewScale)
      
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
        Math.round(this.textDialogData.backgroundWidth * previewScale), 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        Math.round(this.textDialogData.backgroundHeight * previewScale), 
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
        ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur * previewScale))
        ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX * previewScale)
        ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY * previewScale)
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
        ctx.lineWidth = Math.max(1, Math.round(this.textDialogData.strokeWidth * previewScale))
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
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Настройки текста (адаптированные под превью)
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const fontFamily = this.textDialogData.font
      const fontWeight = this.textDialogData.fontWeight
      const textColor = this.textDialogData.textColor
      const backgroundColor = this.textDialogData.backgroundColor
      const padding = Math.round(this.textDialogData.padding * previewScale)
      
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
        Math.round(this.textDialogData.backgroundWidth * previewScale), 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        Math.round(this.textDialogData.backgroundHeight * previewScale), 
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
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Настройки текста (адаптированные под превью)
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
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
      
      // Конвертируем координаты клика в координаты превью канваса
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      
      // Вычисляем масштаб с учетом соотношения сторон
      const scaleX = canvas.width / mainWidth
      const scaleY = canvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      
      // Используем фиксированный масштаб для стабильности размеров
      const previewScale = 1.2
      
      // Настройки текста (адаптированные под превью)
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
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
        // Если есть изображение, используем его как маску для заливки текста
        const img = this.textDialogDataImageText.cachedImage
        
        // Создаем временный канвас для текста с изображением
        const textCanvas = document.createElement('canvas')
        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        const textCtx = textCanvas.getContext('2d')
        
        // Вычисляем размеры текста для правильного позиционирования изображения
        const textWidth = ctx.measureText('Текст').width
        const textHeight = this.textDialogData.fontSize * previewScale
        
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
    drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false) {
      // КЭШИРУЕМ точку пересечения для использования в strokeCombinedShape
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight)
      
      // Создаем путь для объединенной фигуры по внешним границам
      ctx.beginPath()
      
      // Строим объединенную фигуру как единый путь с кэшированной точкой
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection)
      
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
                                   intersectionPoint, tailAngle, tailLength, tailWidth)
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
                           intersectionPoint, tailAngle, tailLength, tailWidth) {
      // Вычисляем параметры хвоста
      const tailWidthPercent = Number(this.textDialogData.tailWidth) / 100
      const tailSizePercent = Number(this.textDialogData.tailSize) / 100
      
      // Острая вершина хвоста (tailSize теперь от 100% до 300%)
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
                                    intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent)
      } else {
        // Обычный путь для стороны
        this.buildSideTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                  intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent)
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
                            intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent) {
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
        const tailWidthPixels = tailWidthPercent * 50 // Увеличено в 2.5 раза (было 20)
        this.buildExactCornerTailSuperPath(ctx, bgX, bgY, bgWidth, bgHeight, 
                                         intersectionPoint, sharpPointX, sharpPointY, 
                                         isTopLeft, isTopRight, isBottomRight, isBottomLeft, 
                                         tailWidthPixels)
        return
      }
      
      // Если хвост выходит НЕ точно из угла, а рядом с углом, используем старую логику
      // Вычисляем точки хвоста НА СТОРОНАХ ПРЯМОУГОЛЬНИКА
      const tailWidthPixels = tailWidthPercent * 50 // Увеличено в 2.5 раза (было 20)
      
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
                          intersectionPoint, sharpPointX, sharpPointY, tailSide, tailWidthPercent) {
      // Вычисляем точки хвоста НА СТОРОНАХ ПРЯМОУГОЛЬНИКА
      // tailWidth теперь в процентах от 40% до 100%
      const tailWidthPixels = tailWidthPercent * 50 // Увеличено в 2.5 раза (было 20)
      
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
    strokeCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // ИСПОЛЬЗУЕМ КЭШИРОВАННУЮ точку пересечения
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight)
      
      // Создаем путь для объединенной фигуры по внешним границам
      ctx.beginPath()
      
      // Строим объединенную фигуру как единый путь с кэшированной точкой
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection)
      
      // Обводим объединенную фигуру
      ctx.stroke()
    },
    
    // КЭШИРОВАНИЕ точки пересечения для стабильности
    getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight) {
      // Параметры хвоста
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
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
    buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection) {
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
      
      if (cachedIntersection) {
        // Создаем суперподложку с хвостом используя КЭШИРОВАННУЮ точку
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   cachedIntersection, tailAngle, tailLength, tailWidth)
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
    
    // Применение текста на канвас
    applyTextToCanvas() {
      if (!this.textDialogPosition || !this.paperScope) return
      
      console.log('✅ Применение текста на канвас:', this.textDialogData)
      
      // TODO: Создание текста с составной подложкой
      // Пока просто закрываем диалог
      this.closeTextDialog()
    },
    
    // === МЕТОДЫ ПЕРЕТАСКИВАНИЯ ===
    
    // Начало/остановка перетаскивания по клику
    startDragging(event) {
      if (!this.textDialogPosition) {
        console.log('❌ textDialogPosition не определен')
        return
      }
      
      // Получаем координаты клика относительно канваса
      const canvas = event.target
      const rect = canvas.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top
      
      // Детальная отладка всех значений
      console.log('🎯 Клик по канвасу - ДЕТАЛЬНО:')
      console.log('  clickX:', clickX)
      console.log('  clickY:', clickY)
      console.log('  textDialogPosition.x:', this.textDialogPosition.x)
      console.log('  textDialogPosition.y:', this.textDialogPosition.y)
      console.log('  textDialogData.backgroundWidth:', this.textDialogData.backgroundWidth)
      console.log('  textDialogData.backgroundHeight:', this.textDialogData.backgroundHeight)
      
      // Проверяем, кликнули ли мы по суперподложке или тексту
      if (this.isClickOnSuperBackground(clickX, clickY)) {
        if (!this.isDragging) {
          // НАЧАЛО перетаскивания
          console.log('🎯 НАЧАЛО перетаскивания')
          this.isDragging = true
          this.dragStartPosition = { x: clickX, y: clickY }
          this.originalTextPosition = { ...this.textDialogPosition }
          this.dragOffset = { x: 0, y: 0 }
          
          // Добавляем только mousemove, mouseup добавим после первого движения
          document.addEventListener('mousemove', this.handleDragMove.bind(this))
          
          // Изменяем курсор
          canvas.style.cursor = 'grabbing'
          
          console.log('🎯 Перетаскивание АКТИВИРОВАНО')
          
          // Добавляем задержку перед возможностью остановки
          setTimeout(() => {
            this.canStopDragging = true
            console.log('🎯 Теперь можно остановить перетаскивание')
          }, 300)
        } else if (this.canStopDragging) {
          // ОСТАНОВКА перетаскивания (только после задержки)
          console.log('🎯 ОСТАНОВКА перетаскивания по клику')
          this.handleDragEnd()
        }
      } else {
        console.log('❌ Клик НЕ по суперподложке')
      }
    },
    
    // Обработка движения мыши при перетаскивании
    handleDragMove(event) {
      if (!this.isDragging || !this.dragStartPosition) return
      
      // Получаем ссылку на активный канвас
      let canvas
      if (this.textDialogActiveTab === 'conversation') {
        canvas = this.$refs.previewCanvas
      } else if (this.textDialogActiveTab === 'thoughts') {
        canvas = this.$refs.previewCanvasThoughts
      } else if (this.textDialogActiveTab === 'standard') {
        canvas = this.$refs.previewCanvasStandard
      } else if (this.textDialogActiveTab === 'image-text') {
        canvas = this.$refs.previewCanvasImageText
      }
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top
      
      // Вычисляем смещение от начальной позиции
      this.dragOffset.x = currentX - this.dragStartPosition.x
      this.dragOffset.y = currentY - this.dragStartPosition.y
      
            // КООРДИНАТЫ ПЕРЕТАСКИВАНИЯ: увеличиваем масштаб для синхронизации скорости
      const dragScale = 2.0 // Увеличенный масштаб для синхронизации скорости
      
      // МАСШТАБИРУЕМ смещение: умножаем на увеличенный масштаб
      const scaledOffsetX = this.dragOffset.x * dragScale
      const scaledOffsetY = this.dragOffset.y * dragScale
      
      // Обновляем позицию текста с МАСШТАБИРОВАННЫМ смещением
      this.textDialogPosition.x = this.originalTextPosition.x + scaledOffsetX
      this.textDialogPosition.y = this.originalTextPosition.y + scaledOffsetY
      
      // Обновляем превью
      this.updatePreviewCanvas()
      
      console.log('🎯 Перетаскивание:', {
        dragOffset: this.dragOffset,
        scaledOffset: { x: scaledOffsetX, y: scaledOffsetY },
        newPosition: { x: this.textDialogPosition.x, y: this.textDialogPosition.y },
        originalPosition: this.originalTextPosition,
        dragScale: dragScale
      })
      
      // Добавляем mouseup только после первого движения
      if (!this.mouseUpAdded) {
        document.addEventListener('mouseup', this.handleDragEnd.bind(this))
        this.mouseUpAdded = true
        console.log('🎯 Добавлен обработчик mouseup')
      }
    },
    
    // Завершение перетаскивания
    handleDragEnd(event = null) {
      if (!this.isDragging) return
      
      console.log('🎯 Завершение перетаскивания')
      
      // Убираем обработчики событий с document
      document.removeEventListener('mousemove', this.handleDragMove.bind(this))
      document.removeEventListener('mouseup', this.handleDragEnd.bind(this))
      
      // Сбрасываем состояние
      this.isDragging = false
      this.dragStartPosition = null
      this.dragOffset = { x: 0, y: 0 }
      this.canStopDragging = false
      this.mouseUpAdded = false
      
      // Возвращаем курсор на активный канвас
      let activeCanvas
      if (this.textDialogActiveTab === 'conversation') {
        activeCanvas = this.$refs.previewCanvas
      } else if (this.textDialogActiveTab === 'thoughts') {
        activeCanvas = this.$refs.previewCanvasThoughts
      } else if (this.textDialogActiveTab === 'standard') {
        activeCanvas = this.$refs.previewCanvasStandard
      } else if (this.textDialogActiveTab === 'image-text') {
        activeCanvas = this.$refs.previewCanvasImageText
      }
      if (activeCanvas) {
        activeCanvas.style.cursor = 'default'
      }
      
      console.log('🎯 Перетаскивание завершено')
    },
    
    // Проверка клика по тексту (для режима "Текст с изображением")
    isClickOnText(clickX, clickY) {
      if (!this.textDialogPosition) {
        console.log('❌ textDialogPosition не определен в isClickOnText')
        return false
      }
      
      // Получаем активный превью канвас
      let activePreviewCanvas
      if (this.textDialogActiveTab === 'image-text') {
        activePreviewCanvas = this.$refs.previewCanvasImageText
      }
      
      if (!activePreviewCanvas) {
        console.log('❌ Превью канвас не найден для режима "Текст с изображением"')
        return false
      }
      
      // Вычисляем масштаб
      const mainCanvas = this.$refs.testCanvas
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      const scaleX = activePreviewCanvas.width / mainWidth
      const scaleY = activePreviewCanvas.height / mainHeight
      
      const previewX = this.textDialogPosition.x * scaleX
      const previewY = this.textDialogPosition.y * scaleY
      const previewScale = 1.2
      
      // Вычисляем размеры текста
      const fontSize = Math.round(this.textDialogData.fontSize * previewScale)
      const text = this.textDialogData.text || 'Текст'
      
      // Создаем временный контекст для измерения текста
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.font = `${this.textDialogData.fontWeight} ${fontSize}px ${this.textDialogData.font}`
      
      // Измеряем размеры текста
      const textSize = this.calculateMultilineTextSize(tempCtx, text, fontSize, this.textDialogData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Вычисляем границы текста
      const left = previewX - textWidth / 2
      const top = previewY - textHeight / 2
      const right = left + textWidth
      const bottom = top + textHeight
      
      // Проверяем, находится ли клик в пределах текста
      const isInside = clickX >= left && clickX <= right && clickY >= top && clickY <= bottom
      
      console.log('🖼️ Проверка клика по тексту:')
      console.log('  clickX:', clickX, 'clickY:', clickY)
      console.log('  textBounds:', { left, top, right, bottom })
      console.log('  textSize:', { width: textWidth, height: textHeight })
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
      
      // ДИНАМИЧЕСКИЙ МАСШТАБ: используем тот же подход, что и в отрисовке
      const mainCanvas = this.$refs.testCanvas
      let activePreviewCanvas
      if (this.textDialogActiveTab === 'conversation') {
        activePreviewCanvas = this.$refs.previewCanvas
      } else if (this.textDialogActiveTab === 'thoughts') {
        activePreviewCanvas = this.$refs.previewCanvasThoughts
      } else if (this.textDialogActiveTab === 'standard') {
        activePreviewCanvas = this.$refs.previewCanvasStandard
      } else if (this.textDialogActiveTab === 'image-text') {
        activePreviewCanvas = this.$refs.previewCanvasImageText
      }
      
      if (!mainCanvas || !activePreviewCanvas) {
        console.log('❌ Канвасы не найдены для вычисления масштаба')
        return false
      }
      
      const mainWidth = mainCanvas.width
      const mainHeight = mainCanvas.height
      const scaleX = activePreviewCanvas.width / mainWidth
      const scaleY = activePreviewCanvas.height / mainHeight
      
      // ВРЕМЕННО используем тот же фиксированный масштаб, что и в отрисовке
      const previewScale = 1.2
      
      // Масштабированные размеры подложки (используем тот же масштаб)
      const scaledBgWidth = Math.round(bgWidth * previewScale)
      const scaledBgHeight = Math.round(bgHeight * previewScale)
      
      // Прямое вычисление границ суперподложки в координатах превью
      const left = clickX - scaledBgWidth / 2
      const top = clickY - scaledBgHeight / 2
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
      console.log('  mainCanvas:', mainWidth, 'x', mainHeight)
      console.log('  previewCanvas:', activePreviewCanvas.width, 'x', activePreviewCanvas.height)
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
              this.updatePreviewCanvas()
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

/* === СТИЛИ ДЛЯ ДИАЛОГА ДОБАВЛЕНИЯ ТЕКСТА === */

.text-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.text-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Поддерживаем sticky позиционирование */
  position: relative;
}

.text-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid #e9ecef;
}

.text-dialog-footer .btn {
  padding: 10px 24px;
  font-weight: 500;
  border-radius: 6px;
}

.form-control-color {
  width: 60px;
  height: 38px;
  padding: 4px;
  border-radius: 4px;
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
  
  .text-dialog-footer {
    padding: 12px 0;
    margin-top: 12px;
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

</style>
