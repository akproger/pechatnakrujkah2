<template>
  <div class="text-manager">
    <!-- Кнопка добавления текста -->
    <div class="text-controls">
      <button 
        @click="openTextDialog" 
        class="btn canvas-button"
      >
        <i class="bi bi-type me-2"></i>
        Текст 2
      </button>
    </div>

    <!-- Диалог добавления/редактирования текста -->
    <div v-if="showTextDialog" class="text-dialog-overlay" @click="closeTextDialog">
      <div class="text-dialog" @click.stop>
        <div class="text-dialog-header">
          <h5 class="text-dialog-title">
            {{ isEditingText ? 'Редактировать текст' : 'Добавить текст' }}
          </h5>
          <button @click="closeTextDialog" class="btn-close" aria-label="Закрыть"></button>
        </div>

        <div class="text-dialog-body">
          <!-- Вкладки режимов текста -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: textDialogActiveTab === 'conversation' }"
                @click="switchTextDialogTab('conversation')"
                type="button"
              >
                Разговор
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: textDialogActiveTab === 'thoughts' }"
                @click="switchTextDialogTab('thoughts')"
                type="button"
              >
                Мысли
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: textDialogActiveTab === 'standard' }"
                @click="switchTextDialogTab('standard')"
                type="button"
              >
                Стандарт
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: textDialogActiveTab === 'image-text' }"
                @click="switchTextDialogTab('image-text')"
                type="button"
              >
                Текст с изображением
              </button>
            </li>
          </ul>

          <!-- Содержимое вкладок -->
          <div class="tab-content">
            <!-- Вкладка "Разговор" -->
            <div v-if="textDialogActiveTab === 'conversation'" class="tab-pane active">
              <!-- Превью текста с подложкой (полная ширина) -->
              <div class="texts-top-section">
                <div class="text-preview-section">
                  <div class="text-preview">
                    <canvas 
                      ref="previewCanvasConversation" 
                      class="preview-canvas"
                      @mousedown="startPreviewDrag"
                    ></canvas>
                  </div>
                </div>
                
                <!-- Поле ввода текста (под превью) -->
                <div class="text-input-section">
                  <textarea 
                    id="textInputConversation"
                    v-model="textDialogDataConversation.text"
                    class="form-control"
                    rows="6"
                    placeholder="Введите текст..."
                  ></textarea>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Шрифт:</label>
                        <select v-model="textDialogDataConversation.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <div class="range" :style="`--value: ${textDialogDataConversation.fontSize}`">
                          <label class="range-label" for="fontSizeConversation">Размер:</label>
                          <div class="track"></div>
                          <input 
                            class="range-input" 
                            id="fontSizeConversation" 
                            type="range" 
                            v-model="textDialogDataConversation.fontSize" 
                            min="12" 
                            max="72" 
                            step="1" 
                            aria-valuemin="12" 
                            aria-valuemax="72" 
                            aria-orientation="horizontal"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12 text-style-buttons">
                      <div class="font-weight-buttons">
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary font-weight-btn" 
                          :class="{ 'active': textDialogDataConversation.fontWeight === 'normal' }"
                          @click="textDialogDataConversation.fontWeight = 'normal'"
                          title="Обычный"
                        >
                          <i class="bi bi-type"></i>
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary font-weight-btn" 
                          :class="{ 'active': textDialogDataConversation.fontWeight === 'bold' }"
                          @click="textDialogDataConversation.fontWeight = 'bold'"
                          title="Жирный"
                        >
                          <i class="bi bi-type-bold"></i>
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary font-weight-btn" 
                          :class="{ 'active': textDialogDataConversation.fontWeight === 'italic' }"
                          @click="textDialogDataConversation.fontWeight = 'italic'"
                          title="Курсив"
                        >
                          <i class="bi bi-type-italic"></i>
                        </button>
                        <div class="vertical-line"></div>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary text-align-btn" 
                          :class="{ 'active': textDialogDataConversation.textAlign === 'left' }"
                          @click="textDialogDataConversation.textAlign = 'left'"
                          title="По левому краю"
                        >
                          <i class="bi bi-text-left"></i>
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary text-align-btn" 
                          :class="{ 'active': textDialogDataConversation.textAlign === 'center' }"
                          @click="textDialogDataConversation.textAlign = 'center'"
                          title="По центру"
                        >
                          <i class="bi bi-text-center"></i>
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary text-align-btn" 
                          :class="{ 'active': textDialogDataConversation.textAlign === 'right' }"
                          @click="textDialogDataConversation.textAlign = 'right'"
                          title="По правому краю"
                        >
                          <i class="bi bi-text-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="color-buttons">
                  <div class="color-button-group">
                    <i class="bi bi-type color-icon" title="Цвет текста"></i>
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary color-btn" 
                      title="Цвет текста"
                    >
                      <div class="color-preview" :style="{ backgroundColor: textDialogDataConversation.textColor }"></div>
                      <input type="color" v-model="textDialogDataConversation.textColor" class="color-input">
                    </button>
                  </div>
                  
                  <div class="color-button-group">
                    <i class="bi bi-paint-bucket color-icon" title="Цвет подложки"></i>
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary color-btn" 
                      title="Цвет подложки"
                    >
                      <div class="color-preview" :style="{ backgroundColor: textDialogDataConversation.backgroundColor }"></div>
                      <input type="color" v-model="textDialogDataConversation.backgroundColor" class="color-input">
                    </button>
                  </div>
                </div>

                <!-- Настройки хвоста -->
              <div class="form-group mb-0">
              <div class="mb-2">Настройки "Хвоста"</div>
                <div class="row g-2">
                  <div class="col-4">
                    <div class="range" :style="`--value: ${textDialogDataConversation.tailSize}`">
                      <label class="range-label" for="tailSizeConversation">Размер</label>
                      <div class="track"></div>
                      <input 
                        class="range-input" 
                        id="tailSizeConversation" 
                        type="range" 
                        v-model="textDialogDataConversation.tailSize" 
                        min="100" 
                        max="750" 
                        step="1" 
                        aria-valuemin="100" 
                        aria-valuemax="750" 
                        aria-orientation="horizontal"
                      >
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="range" :style="`--value: ${textDialogDataConversation.tailWidth}`">
                      <label class="range-label" for="tailWidthConversation">Ширина</label>
                      <div class="track"></div>
                      <input 
                        class="range-input" 
                        id="tailWidthConversation" 
                        type="range" 
                        v-model="textDialogDataConversation.tailWidth" 
                        min="40" 
                        max="100" 
                        step="1" 
                        aria-valuemin="40" 
                        aria-valuemax="100" 
                        aria-orientation="horizontal"
                      >
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="range" :style="`--value: ${textDialogDataConversation.tailAngle}`">
                      <label class="range-label" for="tailAngleConversation">Угол</label>
                      <div class="track"></div>
                      <input 
                        class="range-input" 
                        id="tailAngleConversation" 
                        type="range" 
                        v-model="textDialogDataConversation.tailAngle" 
                        min="0" 
                        max="359" 
                        step="1" 
                        aria-valuemin="0" 
                        aria-valuemax="359" 
                        aria-orientation="horizontal"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <button @click="applyText" class="btn btn-primary w-100">
                {{ isEditingText ? 'Сохранить изменения' : 'Сохранить' }}
              </button>

                </div>
              </div>
              

              <!-- Настройки подложки -->
              
              <div class="form-group mb-3">
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label">Ширина подложки: {{ textDialogDataConversation.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Высота подложки: {{ textDialogDataConversation.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Отступ в подложке: {{ textDialogDataConversation.padding }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.padding" 
                      class="form-range" 
                      min="15" 
                      max="50" 
                      step="5"
                    >
                  </div>
                </div>
              </div>
              

              <!-- Обводка -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataConversation.stroke" class="form-check-input">
                  <label class="form-check-label">Обводка</label>
                </div>
                
                <div v-if="textDialogDataConversation.stroke" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Толщина обводки: {{ textDialogDataConversation.strokeWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.strokeWidth" 
                      class="form-range" 
                      min="1" 
                      max="10" 
                      step="1"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет обводки:</label>
                    <input type="color" v-model="textDialogDataConversation.strokeColor" class="form-control form-control-color">
                  </div>
                </div>
              </div>

              <!-- Тень -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataConversation.shadow" class="form-check-input">
                  <label class="form-check-label">Тень</label>
                </div>
                
                <div v-if="textDialogDataConversation.shadow" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет тени:</label>
                    <input type="color" v-model="textDialogDataConversation.shadowColor" class="form-control form-control-color">
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Прозрачность тени: {{ textDialogDataConversation.shadowOpacity }}%</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.shadowOpacity" 
                      class="form-range" 
                      min="0" 
                      max="100" 
                      step="5"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Размытие тени: {{ textDialogDataConversation.shadowBlur }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataConversation.shadowBlur" 
                      class="form-range" 
                      min="0" 
                      max="20" 
                      step="1"
                    >
                  </div>
                  
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label">Смещение по X: {{ textDialogDataConversation.shadowOffsetX }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataConversation.shadowOffsetX" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                    <div class="col-6">
                      <label class="form-label">Смещение по Y: {{ textDialogDataConversation.shadowOffsetY }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataConversation.shadowOffsetY" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Вкладка "Мысли" -->
            <div v-if="textDialogActiveTab === 'thoughts'" class="tab-pane active">
              <div class="texts-top-section">
                <!-- Превью текста с подложкой (полная ширина) -->
                <div class="text-preview-section">
                  <div class="text-preview">
                    <canvas 
                      ref="previewCanvasThoughts" 
                      class="preview-canvas"
                      @mousedown="startPreviewDrag"
                    ></canvas>
                  </div>
                </div>
                
                <!-- Поле ввода текста (под превью) -->
                <div class="text-input-section">
                  <textarea 
                    id="textInputThoughts"
                    v-model="textDialogDataThoughts.text"
                    class="form-control"
                    rows="6"
                    placeholder="Введите текст..."
                  ></textarea>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Шрифт:</label>
                        <select v-model="textDialogDataThoughts.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <div class="range" :style="`--value: ${textDialogDataThoughts.fontSize}`">
                          <label class="range-label" for="fontSizeConversation">Размер:</label>
                          <div class="track"></div>
                          <input 
                            class="range-input" 
                            id="fontSizeConversation" 
                            type="range" 
                            v-model="textDialogDataThoughts.fontSize" 
                            min="12" 
                            max="72" 
                            step="1" 
                            aria-valuemin="12" 
                            aria-valuemax="72" 
                            aria-orientation="horizontal"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                    <!-- Настройки шрифта -->
                      <div class="form-group mb-3">
                        <div class="font-weight-buttons">
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary font-weight-btn" 
                            :class="{ 'active': textDialogDataThoughts.fontWeight === 'normal' }"
                            @click="textDialogDataThoughts.fontWeight = 'normal'"
                            title="Обычный"
                          >
                            <i class="bi bi-type"></i>
                          </button>
                          
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary font-weight-btn" 
                            :class="{ 'active': textDialogDataThoughts.fontWeight === 'bold' }"
                            @click="textDialogDataThoughts.fontWeight = 'bold'"
                            title="Жирный"
                          >
                            <i class="bi bi-type-bold"></i>
                          </button>
                          
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary font-weight-btn" 
                            :class="{ 'active': textDialogDataThoughts.fontWeight === 'italic' }"
                            @click="textDialogDataThoughts.fontWeight = 'italic'"
                            title="Курсив"
                          >
                            <i class="bi bi-type-italic"></i>
                          </button>
                          <div class="vertical-line"></div>
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary text-align-btn" 
                            :class="{ 'active': textDialogDataThoughts.textAlign === 'left' }"
                            @click="textDialogDataThoughts.textAlign = 'left'"
                            title="По левому краю"
                          >
                            <i class="bi bi-text-left"></i>
                          </button>
                          
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary text-align-btn" 
                            :class="{ 'active': textDialogDataThoughts.textAlign === 'center' }"
                            @click="textDialogDataThoughts.textAlign = 'center'"
                            title="По центру"
                          >
                            <i class="bi bi-text-center"></i>
                          </button>
                          
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary text-align-btn" 
                            :class="{ 'active': textDialogDataThoughts.textAlign === 'right' }"
                            @click="textDialogDataThoughts.textAlign = 'right'"
                            title="По правому краю"
                          >
                            <i class="bi bi-text-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Цвета -->
                  <div class="form-group mb-3">
                    <div class="color-buttons">
                      <div class="color-button-group">
                        <i class="bi bi-type color-icon" title="Цвет текста"></i>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary color-btn" 
                          title="Цвет текста"
                        >
                          <div class="color-preview" :style="{ backgroundColor: textDialogDataThoughts.textColor }"></div>
                          <input type="color" v-model="textDialogDataThoughts.textColor" class="color-input">
                        </button>
                      </div>
                      
                      <div class="color-button-group">
                        <i class="bi bi-paint-bucket color-icon" title="Цвет подложки"></i>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary color-btn" 
                          title="Цвет подложки"
                        >
                          <div class="color-preview" :style="{ backgroundColor: textDialogDataThoughts.backgroundColor }"></div>
                          <input type="color" v-model="textDialogDataThoughts.backgroundColor" class="color-input">
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Настройки хвоста для мыслей -->
                  
                  <div class="form-group mb-0">
                    <div class="mb-2">Настройки "Хвоста"</div>
                      <div class="row g-2">
                        <div class="col-4">
                          <div class="range" :style="`--value: ${textDialogDataThoughts.tailSize}`">
                            <label class="range-label" for="tailSizeConversation">Размер</label>
                            <div class="track"></div>
                            <input 
                              class="range-input" 
                              id="tailSizeConversation" 
                              type="range" 
                              v-model="textDialogDataThoughts.tailSize" 
                              min="100" 
                              max="750" 
                              step="1" 
                              aria-valuemin="100" 
                              aria-valuemax="750" 
                              aria-orientation="horizontal"
                            >
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="range" :style="`--value: ${textDialogDataThoughts.tailWidth}`">
                            <label class="range-label" for="tailWidthConversation">Ширина</label>
                            <div class="track"></div>
                            <input 
                              class="range-input" 
                              id="tailWidthConversation" 
                              type="range" 
                              v-model="textDialogDataThoughts.tailWidth" 
                              min="40" 
                              max="100" 
                              step="1" 
                              aria-valuemin="40" 
                              aria-valuemax="100" 
                              aria-orientation="horizontal"
                            >
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="range" :style="`--value: ${textDialogDataThoughts.tailAngle}`">
                            <label class="range-label" for="tailAngleConversation">Угол</label>
                            <div class="track"></div>
                            <input 
                              class="range-input" 
                              id="tailAngleConversation" 
                              type="range" 
                              v-model="textDialogDataThoughts.tailAngle" 
                              min="0" 
                              max="359" 
                              step="1" 
                              aria-valuemin="0" 
                              aria-valuemax="359" 
                              aria-orientation="horizontal"
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  <button @click="applyText" class="btn btn-primary w-100">
                    {{ isEditingText ? 'Сохранить изменения' : 'Сохранить' }}
                  </button>
                </div>
              </div>
              <!-- Аналогичные настройки как для разговора, но с textDialogDataThoughts -->
              

              

              <!-- Настройки подложки -->
              <div class="form-group mb-3">
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label">Ширина подложки: {{ textDialogDataThoughts.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Высота подложки: {{ textDialogDataThoughts.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Отступ в подложке: {{ textDialogDataThoughts.padding }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.padding" 
                      class="form-range" 
                      min="5" 
                      max="30" 
                      step="1"
                    >
                  </div>
                </div>
              </div>

              

              

              <!-- Обводка -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataThoughts.stroke" class="form-check-input">
                  <label class="form-check-label">Обводка</label>
                </div>
                
                <div v-if="textDialogDataThoughts.stroke" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Толщина обводки: {{ textDialogDataThoughts.strokeWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.strokeWidth" 
                      class="form-range" 
                      min="1" 
                      max="10" 
                      step="1"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет обводки:</label>
                    <input type="color" v-model="textDialogDataThoughts.strokeColor" class="form-control form-control-color">
                  </div>
                </div>
              </div>

              <!-- Тень -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataThoughts.shadow" class="form-check-input">
                  <label class="form-check-label">Тень</label>
                </div>
                
                <div v-if="textDialogDataThoughts.shadow" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет тени:</label>
                    <input type="color" v-model="textDialogDataThoughts.shadowColor" class="form-control form-control-color">
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Прозрачность тени: {{ textDialogDataThoughts.shadowOpacity }}%</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.shadowOpacity" 
                      class="form-range" 
                      min="0" 
                      max="100" 
                      step="5"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Размытие тени: {{ textDialogDataThoughts.shadowBlur }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataThoughts.shadowBlur" 
                      class="form-range" 
                      min="0" 
                      max="20" 
                      step="1"
                    >
                  </div>
                  
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label">Смещение по X: {{ textDialogDataThoughts.shadowOffsetX }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataThoughts.shadowOffsetX" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                    <div class="col-6">
                      <label class="form-label">Смещение по Y: {{ textDialogDataThoughts.shadowOffsetY }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataThoughts.shadowOffsetY" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Вкладка "Стандарт" -->
            <div v-if="textDialogActiveTab === 'standard'" class="tab-pane active">
              <div class="texts-top-section">
                <!-- Превью текста с подложкой (полная ширина) -->
                <div class="text-preview-section">
                  <div class="text-preview">
                    <canvas 
                      ref="previewCanvasStandard" 
                      class="preview-canvas"
                      @mousedown="startPreviewDrag"
                    ></canvas>
                  </div>
                </div>
                
                <!-- Поле ввода текста (под превью) -->
                <div class="text-input-section">
                  <textarea 
                    id="textInputStandard"
                    v-model="textDialogDataStandard.text"
                    class="form-control"
                    rows="6"
                    placeholder="Введите текст..."
                  ></textarea>
                  <!-- Простые настройки для стандартного текста -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Шрифт:</label>
                        <select v-model="textDialogDataStandard.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <div class="range" :style="`--value: ${textDialogDataStandard.fontSize}`">
                          <label class="range-label" for="fontSizeConversation">Размер:</label>
                          <div class="track"></div>
                          <input 
                            class="range-input" 
                            id="fontSizeConversation" 
                            type="range" 
                            v-model="textDialogDataStandard.fontSize" 
                            min="12" 
                            max="72" 
                            step="1" 
                            aria-valuemin="12" 
                            aria-valuemax="72" 
                            aria-orientation="horizontal"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataStandard.fontWeight === 'normal' }"
                        @click="textDialogDataStandard.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataStandard.fontWeight === 'bold' }"
                        @click="textDialogDataStandard.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataStandard.fontWeight === 'italic' }"
                        @click="textDialogDataStandard.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                      <div class="vertical-line"></div>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataStandard.textAlign === 'left' }"
                        @click="textDialogDataStandard.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataStandard.textAlign === 'center' }"
                        @click="textDialogDataStandard.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataStandard.textAlign === 'right' }"
                        @click="textDialogDataStandard.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>
                  <!-- Цвета -->
                  <div class="form-group mb-3">
                    <div class="color-buttons">
                      <div class="color-button-group">
                        <i class="bi bi-type color-icon" title="Цвет текста"></i>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary color-btn" 
                          title="Цвет текста"
                        >
                          <div class="color-preview" :style="{ backgroundColor: textDialogDataStandard.textColor }"></div>
                          <input type="color" v-model="textDialogDataStandard.textColor" class="color-input">
                        </button>
                      </div>
                      
                      <div class="color-button-group">
                        <i class="bi bi-paint-bucket color-icon" title="Цвет подложки"></i>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary color-btn" 
                          title="Цвет подложки"
                        >
                          <div class="color-preview" :style="{ backgroundColor: textDialogDataStandard.backgroundColor }"></div>
                          <input type="color" v-model="textDialogDataStandard.backgroundColor" class="color-input">
                        </button>
                      </div>
                    </div>
                  </div>
                  <button @click="applyText" class="btn btn-primary w-100">
                    {{ isEditingText ? 'Сохранить изменения' : 'Сохранить' }}
                  </button>
                </div>
              </div>


              

              <!-- Настройки подложки -->
              <div class="form-group mb-3">
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label">Ширина подложки: {{ textDialogDataStandard.backgroundWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.backgroundWidth" 
                      class="form-range" 
                      min="100" 
                      max="400" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Высота подложки: {{ textDialogDataStandard.backgroundHeight }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.backgroundHeight" 
                      class="form-range" 
                      min="50" 
                      max="200" 
                      step="10"
                    >
                  </div>
                  <div class="col-4">
                    <label class="form-label">Отступ в подложке: {{ textDialogDataStandard.padding }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.padding" 
                      class="form-range" 
                      min="5" 
                      max="30" 
                      step="1"
                    >
                  </div>
                </div>
              </div>

              

              <!-- Обводка -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataStandard.stroke" class="form-check-input">
                  <label class="form-check-label">Обводка</label>
                </div>
                
                <div v-if="textDialogDataStandard.stroke" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Толщина обводки: {{ textDialogDataStandard.strokeWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.strokeWidth" 
                      class="form-range" 
                      min="1" 
                      max="10" 
                      step="1"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет обводки:</label>
                    <input type="color" v-model="textDialogDataStandard.strokeColor" class="form-control form-control-color">
                  </div>
                </div>
              </div>

              <!-- Тень -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataStandard.shadow" class="form-check-input">
                  <label class="form-check-label">Тень</label>
                </div>
                
                <div v-if="textDialogDataStandard.shadow" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет тени:</label>
                    <input type="color" v-model="textDialogDataStandard.shadowColor" class="form-control form-control-color">
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Прозрачность тени: {{ textDialogDataStandard.shadowOpacity }}%</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.shadowOpacity" 
                      class="form-range" 
                      min="0" 
                      max="100" 
                      step="5"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Размытие тени: {{ textDialogDataStandard.shadowBlur }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataStandard.shadowBlur" 
                      class="form-range" 
                      min="0" 
                      max="20" 
                      step="1"
                    >
                  </div>
                  
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label">Смещение по X: {{ textDialogDataStandard.shadowOffsetX }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataStandard.shadowOffsetX" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                    <div class="col-6">
                      <label class="form-label">Смещение по Y: {{ textDialogDataStandard.shadowOffsetY }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataStandard.shadowOffsetY" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Вкладка "Текст с изображением" -->
            <div v-if="textDialogActiveTab === 'image-text'" class="tab-pane active">
              <div class="texts-top-section">
                <!-- Превью текста с подложкой (полная ширина) -->
                <div class="text-preview-section">
                  <div class="text-preview">
                    <canvas 
                      ref="previewCanvasImageText" 
                      class="preview-canvas"
                      @mousedown="startPreviewDrag"
                    ></canvas>
                  </div>
                </div>
                
                <!-- Поле ввода текста (под превью) -->
                <div class="text-input-section">
                  <textarea 
                    id="textInputImageText"
                    v-model="textDialogDataImageText.text"
                    class="form-control"
                    rows="6"
                    placeholder="Введите текст..."
                  ></textarea>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Шрифт:</label>
                        <select v-model="textDialogDataImageText.font" class="form-select">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <div class="range" :style="`--value: ${textDialogDataImageText.fontSize}`">
                          <label class="range-label" for="fontSizeConversation">Размер:</label>
                          <div class="track"></div>
                          <input 
                            class="range-input" 
                            id="fontSizeConversation" 
                            type="range" 
                            v-model="textDialogDataImageText.fontSize" 
                            min="12" 
                            max="200" 
                            step="1" 
                            aria-valuemin="12" 
                            aria-valuemax="72" 
                            aria-orientation="horizontal"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Настройки шрифта -->
                  <div class="form-group mb-3">
                    <div class="font-weight-buttons">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataImageText.fontWeight === 'normal' }"
                        @click="textDialogDataImageText.fontWeight = 'normal'"
                        title="Обычный"
                      >
                        <i class="bi bi-type"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataImageText.fontWeight === 'bold' }"
                        @click="textDialogDataImageText.fontWeight = 'bold'"
                        title="Жирный"
                      >
                        <i class="bi bi-type-bold"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary font-weight-btn" 
                        :class="{ 'active': textDialogDataImageText.fontWeight === 'italic' }"
                        @click="textDialogDataImageText.fontWeight = 'italic'"
                        title="Курсив"
                      >
                        <i class="bi bi-type-italic"></i>
                      </button>
                      <div class="vertical-line"></div>
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataImageText.textAlign === 'left' }"
                        @click="textDialogDataImageText.textAlign = 'left'"
                        title="По левому краю"
                      >
                        <i class="bi bi-text-left"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataImageText.textAlign === 'center' }"
                        @click="textDialogDataImageText.textAlign = 'center'"
                        title="По центру"
                      >
                        <i class="bi bi-text-center"></i>
                      </button>
                      
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary text-align-btn" 
                        :class="{ 'active': textDialogDataImageText.textAlign === 'right' }"
                        @click="textDialogDataImageText.textAlign = 'right'"
                        title="По правому краю"
                      >
                        <i class="bi bi-text-right"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Цвет текста (для обводки) -->
                  <div class="form-group mb-3">
                    <div class="color-buttons">
                      <div class="color-button-group">
                        <i class="bi bi-type color-icon" title="Цвет текста (обводка)"></i>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary color-btn" 
                          title="Цвет текста (обводка)"
                        >
                          <div class="color-preview" :style="{ backgroundColor: textDialogDataImageText.textColor }"></div>
                          <input type="color" v-model="textDialogDataImageText.textColor" class="color-input">
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Загрузка изображения -->
                  <div class="form-group mb-3">
                    <div class="d-flex align-items-center gap-3">
                      <input 
                        type="file" 
                        ref="imageInput"
                        @change="handleImageSelect"
                        accept="image/*"
                        class="form-control"
                        style="display: none;"
                      >
                      <button 
                        @click="triggerImageInput" 
                        class="btn btn-outline-primary w-100"
                        type="button"
                      >
                        <i class="bi bi-upload me-2"></i>
                        Выбрать изображение
                      </button>
                    </div>
                    
                    <!-- Предпросмотр изображения -->
                    <div v-if="textDialogDataImageText.cachedImage" class="mt-3 text-img-preview">
                      <img 
                        :src="textDialogDataImageText.cachedImage.src" 
                        alt="Предпросмотр" 
                        class="img-thumbnail"
                        style="max-width: 100px; max-height: 44px;"
                      >
                                            <button 
                        v-if="textDialogDataImageText.textImage"
                        @click="removeMaskImage" 
                        class="btn btn-outline-danger"
                        type="button"
                      >
                        <i class="bi bi-trash me-2"></i>
                        Удалить
                      </button>
                    </div>
                  </div>
                  <button @click="applyText" class="btn btn-primary w-100">
                    {{ isEditingText ? 'Сохранить изменения' : 'Сохранить' }}
                  </button>
                </div>
              </div>

              

              <!-- Настройки шрифта -->
              

              <!-- Обводка -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataImageText.stroke" class="form-check-input">
                  <label class="form-check-label">Обводка</label>
                </div>
                
                <div v-if="textDialogDataImageText.stroke" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Толщина обводки: {{ textDialogDataImageText.strokeWidth }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataImageText.strokeWidth" 
                      class="form-range" 
                      min="1" 
                      max="10" 
                      step="1"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет обводки:</label>
                    <input type="color" v-model="textDialogDataImageText.strokeColor" class="form-control form-control-color">
                  </div>
                </div>
              </div>

              <!-- Тень -->
              <div class="form-group mb-3">
                <div class="form-check mb-2">
                  <input type="checkbox" v-model="textDialogDataImageText.shadow" class="form-check-input">
                  <label class="form-check-label">Тень</label>
                </div>
                
                <div v-if="textDialogDataImageText.shadow" class="ms-4">
                  <div class="form-group mb-3">
                    <label class="form-label">Цвет тени:</label>
                    <input type="color" v-model="textDialogDataImageText.shadowColor" class="form-control form-control-color">
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Прозрачность тени: {{ textDialogDataImageText.shadowOpacity }}%</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataImageText.shadowOpacity" 
                      class="form-range" 
                      min="0" 
                      max="100" 
                      step="5"
                    >
                  </div>
                  
                  <div class="form-group mb-3">
                    <label class="form-label">Размытие тени: {{ textDialogDataImageText.shadowBlur }}px</label>
                    <input 
                      type="range" 
                      v-model="textDialogDataImageText.shadowBlur" 
                      class="form-range" 
                      min="0" 
                      max="20" 
                      step="1"
                    >
                  </div>
                  
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label">Смещение по X: {{ textDialogDataImageText.shadowOffsetX }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataImageText.shadowOffsetX" 
                        class="form-range" 
                        min="-20" 
                        max="20" 
                        step="1"
                      >
                    </div>
                    <div class="col-6">
                      <label class="form-label">Смещение по Y: {{ textDialogDataImageText.shadowOffsetY }}px</label>
                      <input 
                        type="range" 
                        v-model="textDialogDataImageText.shadowOffsetY" 
                        class="form-range" 
                        min="-20" 
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
  </div>
</template>

<script>
export default {
  name: 'TextManager',
  props: {
    // Основной канвас для копирования фонового изображения
    canvas: {
      type: HTMLCanvasElement,
      default: null
    },
    // Paper.js scope для работы с элементами
    paperScope: {
      type: Object,
      default: null
    },
    // Позиция для размещения текста
    textPosition: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    }
  },
  data() {
    return {
      // Состояние диалога
      showTextDialog: false,
      isEditingText: false,
      editingLayerIndex: null,
      textDialogActiveTab: 'conversation',
      
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
        backgroundHeight: 80,
        padding: 15,
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
        backgroundHeight: 80,
        padding: 15,
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
        backgroundHeight: 80,
        padding: 15,
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
        fontSize: 140,
        textColor: '#FFFFFF',
        backgroundColor: '#ffffff',
        backgroundWidth: 200,
        backgroundHeight: 80,
        padding: 15,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 4,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 85,
        shadowOffsetX: 11,
        shadowOffsetY: 6,
        shadowBlur: 1,
        textImage: null,
        cachedImage: null,
        imageTextImage: null
      },
      
      // Слои с текстами
      textLayers: [],
      nextLayerIndex: 200,
      
      // Для throttling обновлений превью
      previewUpdateFrame: null,
      
      // Текущая позиция текста для перетаскивания
      currentDragPosition: { x: 0, y: 0 }
    }
  },
  computed: {
    // Текущие данные диалога в зависимости от активной вкладки
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

    // Размеры для превью канваса - динамические на основе контейнера
    previewCanvasWidth() {
      // Возвращаем базовые размеры для инициализации, реальные размеры устанавливаются в updateSinglePreviewCanvas
      return 1472
    },
    previewCanvasHeight() {
      // Возвращаем базовые размеры для инициализации, реальные размеры устанавливаются в updateSinglePreviewCanvas
      return 697
    },

    // Данные текста для текущей вкладки
    textDialogData() {
      return this.getCurrentTextDialogData()
    },

    // Позиция текста (используем currentDragPosition или дефолтную позицию)
    currentTextPosition() {
      // Если currentDragPosition не инициализирован, используем дефолтную позицию
      if (this.currentDragPosition.x === 0 && this.currentDragPosition.y === 0) {
        // Используем реальные размеры канваса, если доступны
        const previewCanvas = this.$refs.previewCanvasConversation
        if (previewCanvas) {
          return { x: previewCanvas.width / 2, y: previewCanvas.height / 2 }
        }
        // Fallback на фиксированные значения
        return { x: 736, y: 348 }
      }
      return this.currentDragPosition
    }
  },

  watch: {
    // Отслеживаем изменения в основном канвасе
    canvas: {
      handler(newCanvas) {
        console.log('🔄 Canvas prop изменился:', {
          canvas: newCanvas,
          width: newCanvas ? newCanvas.width : 'undefined',
          height: newCanvas ? newCanvas.height : 'undefined'
        })
        if (this.showTextDialog) {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      immediate: true
    },
    // Отслеживаем изменения в данных текста для обновления превью
    textDialogDataConversation: {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'conversation') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    textDialogDataThoughts: {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'thoughts') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    textDialogDataStandard: {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'standard') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    textDialogDataImageText: {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    // Отслеживаем изменения в изображении для режима "Текст с изображением"
    'textDialogDataImageText.imageTextImage': {
      handler(newImage) {
        console.log('🖼️ Изображение для режима "Текст с изображением" изменилось:', newImage)
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    // Отслеживаем изменения в textImage для режима "Текст с изображением"
    'textDialogDataImageText.textImage': {
      handler(newImage) {
        console.log('🖼️ textImage для режима "Текст с изображением" изменилось:', newImage)
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      },
      deep: true
    },
    // Отслеживаем изменения размера шрифта для режима "Текст с изображением"
    'textDialogDataImageText.fontSize': {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      }
    },
    // Отслеживаем изменения веса шрифта для режима "Текст с изображением"
    'textDialogDataImageText.fontWeight': {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      }
    },
    // Отслеживаем изменения толщины обводки для режима "Текст с изображением"
    'textDialogDataImageText.strokeWidth': {
      handler() {
        if (this.showTextDialog && this.textDialogActiveTab === 'image-text') {
          this.$nextTick(() => {
            this.updatePreviewCanvas()
          })
        }
      }
    }
  },

  mounted() {
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    // Открытие диалога добавления текста
    openTextDialog() {
      this.showTextDialog = true
      this.isEditingText = false
      this.editingLayerIndex = null
      
      // Сбрасываем позицию для перетаскивания - она будет установлена в updateSinglePreviewCanvas
      this.currentDragPosition = { x: 0, y: 0 }
      
      this.textDialogActiveTab = 'conversation'
      this.resetAllTextDialogData()
      
      this.$emit('text-dialog-opened')
      
      // Обновляем превью после открытия диалога
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },

    // Закрытие диалога
    closeTextDialog() {
      this.showTextDialog = false
      this.isEditingText = false
      this.editingLayerIndex = null
      this.resetAllTextDialogData()
      
      this.$emit('text-dialog-closed')
    },

    // Алиасы для совместимости
    openDialog() {
      return this.openTextDialog()
    },

    closeDialog() {
      return this.closeTextDialog()
    },

    // Открытие диалога для редактирования текста
    editTextLayer(textData, position, mode, layerIndex) {
      this.showTextDialog = true
      this.isEditingText = true
      this.editingLayerIndex = layerIndex
      
      // Устанавливаем режим редактирования
      this.textDialogActiveTab = mode
      
      // Копируем данные текста в соответствующий объект
      if (mode === 'conversation') {
        Object.assign(this.textDialogDataConversation, textData)
      } else if (mode === 'thoughts') {
        Object.assign(this.textDialogDataThoughts, textData)
      } else if (mode === 'standard') {
        Object.assign(this.textDialogDataStandard, textData)
      } else if (mode === 'image-text') {
        Object.assign(this.textDialogDataImageText, textData)
      }
      
      // Устанавливаем позицию
      this.currentTextPosition = position
      
      this.$emit('text-dialog-opened')
      
      // Обновляем превью после открытия диалога
      this.$nextTick(() => {
        this.updatePreviewCanvas()
      })
    },

    // Обработчик изменения размера окна
    handleResize() {
      if (this.showTextDialog) {
        // Пересчитываем размеры превью канваса при изменении размера окна
        this.$nextTick(() => {
          this.updatePreviewCanvas()
        })
      }
    },

    // Переключение вкладок

    // Сброс всех данных диалога
    resetAllTextDialogData() {
      // Сброс данных для всех вкладок
      Object.assign(this.textDialogDataConversation, {
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
        backgroundHeight: 80,
        padding: 15,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowBlur: 5,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      })
      
      Object.assign(this.textDialogDataThoughts, {
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
        backgroundHeight: 80,
        padding: 15,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowBlur: 5,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      })
      
      Object.assign(this.textDialogDataStandard, {
        text: '',
        font: 'Arial',
        fontWeight: 'normal',
        fontSize: 24,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        backgroundWidth: 200,
        backgroundHeight: 80,
        padding: 15,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 3,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 40,
        shadowBlur: 5,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      })
      
      Object.assign(this.textDialogDataImageText, {
        text: '',
        font: 'Arial',
        fontWeight: 'bold',
        fontSize: 140,
        textColor: '#FFFFFF',
        backgroundColor: '#ffffff',
        backgroundWidth: 200,
        backgroundHeight: 80,
        padding: 15,
        textAlign: 'center',
        lineHeight: 1.2,
        stroke: true,
        strokeWidth: 4,
        strokeColor: '#000000',
        shadow: true,
        shadowColor: '#000000',
        shadowOpacity: 85,
        shadowBlur: 1,
        shadowOffsetX: 11,
        shadowOffsetY: 6,
        textImage: null,
        cachedImage: null
      })
    },

    // Применение текста
    applyText() {
      const currentTextData = this.getCurrentTextDialogData()
      
      if (!currentTextData.text.trim()) {
        alert('Пожалуйста, введите текст')
        return
      }

      const textData = { ...currentTextData }
      const mode = this.textDialogActiveTab
      
      console.log('🎯 Применение текста:', {
        textData,
        mode,
        position: this.currentTextPosition,
        tailAngle: textData.tailAngle,
        tailSize: textData.tailSize,
        tailWidth: textData.tailWidth
      })
      
      this.$emit('text-applied', {
        textData,
        mode,
        position: this.currentTextPosition,
        isEditing: this.isEditingText,
        editingLayerIndex: this.editingLayerIndex
      })

      this.closeTextDialog()
    },

    // Обработка выбора изображения
    handleImageSelect(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            this.textDialogDataImageText.textImage = e.target.result // Сохраняем как src строку
            this.textDialogDataImageText.cachedImage = img
            // Обновляем превью после загрузки изображения
            this.$nextTick(() => {
              this.updatePreviewCanvas()
            })
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    // Запуск выбора файла
    triggerImageInput() {
      this.$refs.imageInput.click()
    },

    // Удаление маски изображения
    removeMaskImage() {
      this.textDialogDataImageText.textImage = null
      this.textDialogDataImageText.cachedImage = null
    },

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ПРЕВЬЮ КАНВАСАМИ (СКОПИРОВАНО ИЗ StickerManiaPage) ===

    // Отрисовка обводки многострочного текста
    drawMultilineTextStroke(ctx, text, x, y, fontSize, lineHeight = 1.2) {
      // Разбиваем текст на строки по символу \n
      const lines = text.split('\n')
      
      // Определяем правильные данные в зависимости от активной вкладки
      const textData = this.textDialogActiveTab === 'image-text' ? this.textDialogDataImageText : this.textDialogData
      
      // Устанавливаем размер шрифта
      ctx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Устанавливаем выравнивание текста
      ctx.textAlign = textData.textAlign
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
        const lineY = startY + (index * lineSpacing) + fontSize / 2
        
        // Вычисляем позицию X в зависимости от выравнивания
        let lineX = x
        if (textData.textAlign === 'left') {
          lineX = x - maxTextWidth / 2
        } else if (textData.textAlign === 'right') {
          lineX = x + maxTextWidth / 2
        }
        // Для 'center' lineX остается x
        
        ctx.strokeText(line, lineX, lineY)
      })
    },

    // Переключение вкладок с обновлением превью
    switchTextDialogTab(tab) {
      this.textDialogActiveTab = tab
      console.log('🔄 Переключение на вкладку:', tab)

      // Принудительно обновляем превью канвасы при переключении вкладок
      this.$nextTick(() => {
        this.updatePreviewCanvas()
        console.log('🔄 Превью канвасы обновлены после переключения вкладки')
      })
    },

    // Основное обновление превью канваса (скопировано из StickerManiaPage)
    updatePreviewCanvas() {
      console.log('🔄 Обновление превью канваса, активная вкладка:', this.textDialogActiveTab)
      
      // Обновляем превью канвасы только если диалог открыт
      if (this.showTextDialog) {
        // Обновляем все превью канвасы
        this.updateSinglePreviewCanvas(this.$refs.previewCanvasConversation)
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

    // Получение ссылки на текущий превью канвас
    getCurrentPreviewCanvasRef() {
      const refs = {
        'conversation': 'previewCanvasConversation',
        'thoughts': 'previewCanvasThoughts', 
        'standard': 'previewCanvasStandard',
        'image-text': 'previewCanvasImageText'
      }
      
      const refName = refs[this.textDialogActiveTab]
      return this.$refs[refName]
    },

    // Получение данных для текущей вкладки
    getCurrentTextDialogData() {
      const dataMap = {
        'conversation': this.textDialogDataConversation,
        'thoughts': this.textDialogDataThoughts,
        'standard': this.textDialogDataStandard,
        'image-text': this.textDialogDataImageText
      }
      
      return dataMap[this.textDialogActiveTab]
    },

    // Рисование превью в зависимости от режима
    drawPreviewByMode(ctx, canvas, textData) {
      switch (this.textDialogActiveTab) {
        case 'conversation':
          this.drawConversationPreview(ctx, canvas, textData)
          break
        case 'thoughts':
          this.drawThoughtsPreview(ctx, canvas, textData)
          break
        case 'standard':
          this.drawStandardPreview(ctx, canvas, textData)
          break
        case 'image-text':
          this.drawImageTextPreview(ctx, canvas, textData)
          break
      }
    },

    // Рисование превью разговора
    drawConversationPreview(ctx, canvas, textData) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Рисуем хвост
      this.drawTailBackground(ctx, centerX, centerY, textData)
      
      // Рисуем текст
      this.drawText(ctx, centerX, centerY, textData)
    },

    // Рисование превью мыслей
    drawThoughtsPreview(ctx, canvas, textData) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Рисуем облачко
      this.drawCloudBackground(ctx, centerX, centerY, textData)
      
      // Рисуем текст
      this.drawText(ctx, centerX, centerY, textData)
    },

    // Рисование стандартного превью
    drawStandardPreview(ctx, canvas, textData) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Рисуем простую подложку
      this.drawSimpleBackground(ctx, centerX, centerY, textData)
      
      // Рисуем текст
      this.drawText(ctx, centerX, centerY, textData)
    },

    // Рисование превью текста с изображением
    drawImageTextPreview(ctx, canvas, textData) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      if (textData.cachedImage) {
        // Рисуем текст с изображением
        this.drawImageMaskText(ctx, centerX, centerY, textData)
      } else {
        // Рисуем простой текст
        this.drawText(ctx, centerX, centerY, textData)
      }
    },

    // Рисование хвоста для разговора
    drawTailBackground(ctx, centerX, centerY, textData) {
      const width = textData.backgroundWidth || 200
      const height = textData.backgroundHeight || 80
      const tailSize = textData.tailSize || 20
      const tailWidth = textData.tailWidth || 15
      const tailAngle = textData.tailAngle || 0
      
      ctx.save()
      ctx.fillStyle = textData.backgroundColor || '#ffffff'
      ctx.strokeStyle = textData.borderColor || '#000000'
      ctx.lineWidth = textData.borderWidth || 2
      
      // Рисуем основной прямоугольник
      const rectX = centerX - width / 2
      const rectY = centerY - height / 2
      ctx.fillRect(rectX, rectY, width, height)
      ctx.strokeRect(rectX, rectY, width, height)
      
      // Рисуем хвост
      const tailX = centerX + Math.cos(tailAngle * Math.PI / 180) * (width / 2 + tailSize)
      const tailY = centerY + Math.sin(tailAngle * Math.PI / 180) * (width / 2 + tailSize)
      
      ctx.beginPath()
      ctx.moveTo(centerX + width / 2, centerY)
      ctx.lineTo(tailX, tailY - tailWidth / 2)
      ctx.lineTo(tailX, tailY + tailWidth / 2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      ctx.restore()
    },

    // Рисование облачка для мыслей
    drawCloudBackground(ctx, centerX, centerY, textData) {
      const width = textData.backgroundWidth || 200
      const height = textData.backgroundHeight || 80
      
      ctx.save()
      ctx.fillStyle = textData.backgroundColor || '#ffffff'
      ctx.strokeStyle = textData.borderColor || '#000000'
      ctx.lineWidth = textData.borderWidth || 2
      
      // Рисуем основное облачко
      const rectX = centerX - width / 2
      const rectY = centerY - height / 2
      ctx.fillRect(rectX, rectY, width, height)
      ctx.strokeRect(rectX, rectY, width, height)
      
      // Рисуем маленькие кружочки для облачка
      const circleSize = 15
      ctx.beginPath()
      ctx.arc(centerX + width / 2 - 10, centerY - height / 2 + 10, circleSize, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      ctx.beginPath()
      ctx.arc(centerX + width / 2 - 5, centerY + height / 2 - 10, circleSize, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      ctx.restore()
    },

    // Рисование простой подложки
    drawSimpleBackground(ctx, centerX, centerY, textData) {
      const width = textData.backgroundWidth || 200
      const height = textData.backgroundHeight || 80
      
      ctx.save()
      ctx.fillStyle = textData.backgroundColor || '#ffffff'
      ctx.strokeStyle = textData.borderColor || '#000000'
      ctx.lineWidth = textData.borderWidth || 2
      
      const rectX = centerX - width / 2
      const rectY = centerY - height / 2
      ctx.fillRect(rectX, rectY, width, height)
      ctx.strokeRect(rectX, rectY, width, height)
      
      ctx.restore()
    },

    // Рисование текста
    drawText(ctx, centerX, centerY, textData) {
      ctx.save()
      
      // Настройки шрифта
      const fontSize = textData.fontSize || 16
      const fontFamily = textData.font || 'Arial'
      const fontWeight = textData.fontWeight || 'normal'
      const fontStyle = textData.fontStyle || 'normal'
      
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = textData.textColor || '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Рисуем тень если есть
      if (textData.shadowEnabled) {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = textData.shadowBlur || 4
        ctx.shadowOffsetX = textData.shadowOffsetX || 2
        ctx.shadowOffsetY = textData.shadowOffsetY || 2
      }
      
      // Рисуем текст
      ctx.fillText(textData.text, centerX, centerY)
      
      // Рисуем обводку если есть
      if (textData.strokeEnabled) {
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 2
        ctx.strokeText(textData.text, centerX, centerY)
      }
      
      ctx.restore()
    },

    // Рисование текста с изображением
    drawImageMaskText(ctx, centerX, centerY, textData) {
      if (!textData.cachedImage) return
      
      ctx.save()
      
      // Настройки шрифта
      const fontSize = textData.fontSize || 16
      const fontFamily = textData.font || 'Arial'
      const fontWeight = textData.fontWeight || 'normal'
      const fontStyle = textData.fontStyle || 'normal'
      
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Рисуем тень если есть
      if (textData.shadowEnabled) {
        ctx.shadowColor = textData.shadowColor || '#000000'
        ctx.shadowBlur = textData.shadowBlur || 4
        ctx.shadowOffsetX = textData.shadowOffsetX || 2
        ctx.shadowOffsetY = textData.shadowOffsetY || 2
      }
      
      // Рисуем текст как маску
      ctx.fillText(textData.text, centerX, centerY)
      
      // Применяем изображение как заливку
      ctx.globalCompositeOperation = 'source-in'
      ctx.drawImage(textData.cachedImage, centerX - 100, centerY - 50, 200, 100)
      
      // Рисуем обводку если есть
      if (textData.strokeEnabled) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = textData.strokeColor || '#000000'
        ctx.lineWidth = textData.strokeWidth || 2
        ctx.strokeText(textData.text, centerX, centerY)
      }
      
      ctx.restore()
    },

    // Отрисовка текста с подложкой на превью канвасе (РАЗГОВОР) - ТОЧНАЯ КОПИЯ из StickerManiaPage
    drawTextPreviewOnCanvas(ctx, canvas) {
      if (!this.currentTextPosition || !this.textDialogData.text) return
      
      console.log('🎨 Отрисовка текста на превью:', this.textDialogData.text)
      console.log('🎯 Параметры хвоста в начале метода:', {
        tailSize: this.textDialogData.tailSize,
        tailWidth: this.textDialogData.tailWidth,
        tailAngle: this.textDialogData.tailAngle
      })
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.currentTextPosition.x
      const previewY = this.currentTextPosition.y
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
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
      ctx.textAlign = this.textDialogData.textAlign || 'center'
      this.drawMultilineText(ctx, this.textDialogData.text, previewX, previewY, this.textDialogData.fontSize * previewScale, this.textDialogData.lineHeight)
      
      console.log('✅ Текст с подложкой отрисован на превью')
    },

    // РЕЖИМ "СТАНДАРТ"
    drawTextPreviewOnCanvasStandardMode(ctx, canvas) {
      if (!this.currentTextPosition || !this.textDialogDataStandard.text) return
      
      console.log('⭐ Отрисовка текста в режиме "Стандарт"')
      
      // Копируем фон с основного канваса если доступен
      if (this.canvas && this.canvas.width > 0) {
        console.log('🖼️ Копируем фон с основного канваса')
        ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
      }
      
      // Временно заменяем textDialogData на textDialogDataStandard для отрисовки
      const originalData = this.textDialogData
      this.textDialogData = this.textDialogDataStandard
      
      this.drawTextPreviewOnCanvas(ctx, canvas) // Используем ту же логику
      
      // Восстанавливаем оригинальные данные
      this.textDialogData = originalData
    },

    // РЕЖИМ "МЫСЛИ" - ТОЧНАЯ КОПИЯ из StickerManiaPage
    drawTextPreviewOnCanvasThoughtsMode(ctx, canvas) {
      if (!this.currentTextPosition) return
      
      console.log('🧠 ТЕСТИРОВАНИЕ РЕЖИМА "МЫСЛИ" - овальная подложка')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.currentTextPosition.x
      const previewY = this.currentTextPosition.y
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
      // Используем данные из textDialogDataThoughts для отрисовки
      const currentTextData = this.textDialogDataThoughts
      
      // Настройки текста
      const fontSize = currentTextData.fontSize
      const fontFamily = currentTextData.font
      const fontWeight = currentTextData.fontWeight
      const textColor = currentTextData.textColor
      const backgroundColor = currentTextData.backgroundColor
      const padding = currentTextData.padding
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Измеряем размеры многострочного текста
      const textSize = this.calculateMultilineTextSize(ctx, currentTextData.text, fontSize, currentTextData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Размеры подложки - используем тот же подход, что и в режиме "Разговор"
      const backgroundWidth = Math.max(
        currentTextData.backgroundWidth, 
        textWidth + padding * 2
      )
      const backgroundHeight = Math.max(
        currentTextData.backgroundHeight, 
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
      ctx.textAlign = currentTextData.textAlign || 'center'
      this.drawMultilineText(ctx, currentTextData.text, previewX, previewY, currentTextData.fontSize * previewScale, currentTextData.lineHeight)
      
      console.log('✅ Режим "Мысли" отрисован на превью')
    },

    // РЕЖИМ "ТЕКСТ С ИЗОБРАЖЕНИЕМ"
    drawTextPreviewOnCanvasImageTextMode(ctx, canvas) {
      if (!this.currentTextPosition || !this.textDialogDataImageText.text) return
      
      console.log('🖼️ Отрисовка текста в режиме "Текст с изображением" без подложки:', this.textDialogDataImageText.text)
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.currentTextPosition.x
      const previewY = this.currentTextPosition.y
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
      // Настройки текста (адаптированные под превью)
      const fontSize = this.textDialogDataImageText.fontSize
      const fontFamily = this.textDialogDataImageText.font
      const fontWeight = this.textDialogDataImageText.fontWeight
      const textColor = this.textDialogDataImageText.textColor
      
      // Устанавливаем стиль шрифта
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = this.textDialogDataImageText.textAlign || 'center'
      ctx.textBaseline = 'middle'
      
      // Применяем тень к тексту если включена
      if (this.textDialogDataImageText.shadow) {
        // Создаем временный канвас для тени
        const shadowCanvas = document.createElement('canvas')
        shadowCanvas.width = canvas.width
        shadowCanvas.height = canvas.height
        const shadowCtx = shadowCanvas.getContext('2d')
        
        // Настраиваем тень
        shadowCtx.shadowColor = this.textDialogDataImageText.shadowColor
        shadowCtx.shadowBlur = this.textDialogDataImageText.shadowBlur * previewScale
        shadowCtx.shadowOffsetX = this.textDialogDataImageText.shadowOffsetX * previewScale
        shadowCtx.shadowOffsetY = this.textDialogDataImageText.shadowOffsetY * previewScale
        shadowCtx.globalAlpha = this.textDialogDataImageText.shadowOpacity / 100
        shadowCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        shadowCtx.textAlign = this.textDialogDataImageText.textAlign || 'center'
        shadowCtx.textBaseline = 'middle'
        shadowCtx.fillStyle = this.textDialogDataImageText.shadowColor
        
        // Рисуем тень текста
        this.drawMultilineText(shadowCtx, this.textDialogDataImageText.text, previewX, previewY, this.textDialogDataImageText.fontSize * previewScale, this.textDialogDataImageText.lineHeight)
        
        // Рисуем тень на основном канвасе
        ctx.drawImage(shadowCanvas, 0, 0)
      }
      
      // Рисуем основной текст с поддержкой переноса строк
      if (this.textDialogDataImageText.textImage && this.textDialogDataImageText.cachedImage) {
        // Если есть изображение, используем его как маску для заливки текста (как в основном канвасе)
        const img = this.textDialogDataImageText.cachedImage
        
        // Создаем временный канвас для текста с изображением
        const textCanvas = document.createElement('canvas')
        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        const textCtx = textCanvas.getContext('2d')
        
        // Вычисляем размеры текста для правильного позиционирования изображения
        const textWidth = ctx.measureText(this.textDialogDataImageText.text).width
        const textHeight = fontSize * previewScale * this.textDialogDataImageText.lineHeight
        
        // Используем точные размеры текста для изображения (как в основном канвасе)
        const drawWidth = textWidth
        const drawHeight = textHeight
        const drawX = previewX - drawWidth / 2
        const drawY = previewY - drawHeight / 2
        
        // Рисуем изображение на временном канвасе
        textCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        
        // Создаем маску из текста (destination-in как в основном канвасе)
        textCtx.globalCompositeOperation = 'destination-in'
        textCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        textCtx.textAlign = this.textDialogDataImageText.textAlign || 'center'
        textCtx.textBaseline = 'middle'
        textCtx.fillStyle = 'white'
        this.drawMultilineText(textCtx, this.textDialogDataImageText.text, previewX, previewY, fontSize * previewScale, this.textDialogDataImageText.lineHeight)
        
        // Применяем обводку к тексту если включена (на временном канвасе)
        if (this.textDialogDataImageText.stroke) {
          textCtx.globalCompositeOperation = 'source-over'
          textCtx.strokeStyle = this.textDialogDataImageText.strokeColor
          textCtx.lineWidth = this.textDialogDataImageText.strokeWidth * previewScale
          this.drawMultilineTextStroke(textCtx, this.textDialogDataImageText.text, previewX, previewY, fontSize * previewScale, this.textDialogDataImageText.lineHeight)
        }
        
        // Рисуем результат на основном канвасе
        ctx.drawImage(textCanvas, 0, 0)
      } else {
        // Если нет изображения, рисуем обычный текст
        ctx.fillStyle = textColor
        ctx.textAlign = this.textDialogDataImageText.textAlign || 'center'
        this.drawMultilineText(ctx, this.textDialogDataImageText.text, previewX, previewY, fontSize * previewScale, this.textDialogDataImageText.lineHeight)
        
        // Применяем обводку к тексту если включена
        if (this.textDialogDataImageText.stroke) {
          ctx.strokeStyle = this.textDialogDataImageText.strokeColor
          ctx.lineWidth = this.textDialogDataImageText.strokeWidth * previewScale
          this.drawMultilineTextStroke(ctx, this.textDialogDataImageText.text, previewX, previewY, fontSize * previewScale, this.textDialogDataImageText.lineHeight)
        }
      }
      
      console.log('✅ Текст в режиме "Текст с изображением" отрисован без подложки')
    },

    // Заглушки для default методов - с подложкой как в оригинале
    drawDefaultTextPreviewOnCanvas(ctx, canvas) {
      console.log('📝 Отрисовка дефолтного текста с подложкой')
      
      // Используем позицию из currentTextPosition или центр канваса
      const x = this.currentTextPosition ? this.currentTextPosition.x : this.previewCanvasWidth / 2
      const y = this.currentTextPosition ? this.currentTextPosition.y : this.previewCanvasHeight / 2
      
      // Копируем фон с основного канваса если доступен
      if (this.canvas && this.canvas.width > 0) {
        ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
      }
      
      // Рисуем подложку (как в оригинале)
      const bgWidth = this.textDialogData.backgroundWidth || 200
      const bgHeight = this.textDialogData.backgroundHeight || 80
      
      // Для режима "Разговор" рисуем подложку с хвостом
      if (this.textDialogActiveTab === 'conversation') {
        console.log('🎯 Дефолтная подложка режима "Разговор" с хвостом')
        
        // Сначала рисуем тень если включена (применяется к объединенной фигуре)
        if (this.textDialogData.shadow) {
          ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          ctx.shadowBlur = this.textDialogData.shadowBlur
          ctx.shadowOffsetX = this.textDialogData.shadowOffsetX
          ctx.shadowOffsetY = this.textDialogData.shadowOffsetY
        }
        
        // Рисуем объединенную фигуру (подложка + хвост) с тенью
        this.drawCombinedShape(ctx, x, y, bgWidth, bgHeight, 1, this.textDialogData.backgroundColor || '#ffffff', true)
        
        // Сбрасываем тень
        if (this.textDialogData.shadow) {
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
        
        // Добавляем обводку если включена
        if (this.textDialogData.stroke) {
          ctx.strokeStyle = this.textDialogData.strokeColor || '#000000'
          ctx.lineWidth = this.textDialogData.strokeWidth || 2
          this.strokeCombinedShape(ctx, x, y, bgWidth, bgHeight, 1)
        }
      } else {
        // Для других режимов - простая подложка
        ctx.fillStyle = this.textDialogData.backgroundColor || '#ffffff'
        ctx.fillRect(x - bgWidth/2, y - bgHeight/2, bgWidth, bgHeight)
        
        // Рисуем обводку если есть
        if (this.textDialogData.stroke) {
          ctx.strokeStyle = this.textDialogData.strokeColor || '#000000'
          ctx.lineWidth = this.textDialogData.strokeWidth || 2
          ctx.strokeRect(x - bgWidth/2, y - bgHeight/2, bgWidth, bgHeight)
        }
      }
      
      // Рисуем дефолтный текст "Текст"
      ctx.fillStyle = this.textDialogData.textColor || '#000000'
      ctx.font = `${this.textDialogData.fontWeight || 'normal'} ${this.textDialogData.fontSize || 16}px ${this.textDialogData.font || 'Arial'}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Текст', x, y)
    },
    
    drawDefaultTextPreviewOnCanvasThoughtsMode(ctx, canvas) {
      if (!this.currentTextPosition) return
      
      console.log('🧠 ДЕФОЛТНАЯ подложка режима "Мысли" - овальная без треугольника')
      
      // Координаты клика остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.currentTextPosition.x
      const previewY = this.currentTextPosition.y
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
      // Временно заменяем textDialogData на textDialogDataThoughts для отрисовки
      const originalData = this.textDialogData
      this.textDialogData = this.textDialogDataThoughts
      
      // Размеры дефолтной подложки - используем из настроек
      const backgroundWidth = this.textDialogData.backgroundWidth || 200
      const backgroundHeight = this.textDialogData.backgroundHeight || 80
      
      console.log('🧠 Дефолтная подложка - параметры:', {
        backgroundWidth: backgroundWidth,
        backgroundHeight: backgroundHeight,
        previewScale: previewScale,
        position: `${previewX}, ${previewY}`
      })
      
      // Рисуем дефолтную подложку режима "Мысли" - только основной овал, без хвоста
      this.drawThoughtsModeShape(ctx, previewX, previewY, backgroundWidth, backgroundHeight, previewScale, '#f0f0f0', false, true)
      
      // Рисуем дефолтный текст "Текст"
      ctx.fillStyle = this.textDialogData.textColor || '#000000'
      ctx.font = `${this.textDialogData.fontWeight || 'normal'} ${this.textDialogData.fontSize || 16}px ${this.textDialogData.font || 'Arial'}`
      ctx.textAlign = this.textDialogData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Текст', previewX, previewY)
      
      // Восстанавливаем оригинальные данные
      this.textDialogData = originalData
      
      console.log('✅ Дефолтная подложка режима "Мысли" отрисована')
    },
    
    drawDefaultTextPreviewOnCanvasStandardMode(ctx, canvas) {
      console.log('⭐ ДЕФОЛТНАЯ подложка режима "Стандарт"')
      
      // Используем позицию из currentTextPosition или центр канваса
      const x = this.currentTextPosition ? this.currentTextPosition.x : this.previewCanvasWidth / 2
      const y = this.currentTextPosition ? this.currentTextPosition.y : this.previewCanvasHeight / 2
      
      // Копируем фон с основного канваса если доступен
      if (this.canvas && this.canvas.width > 0) {
        ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
      }
      
      // Временно заменяем textDialogData на textDialogDataStandard для отрисовки
      const originalData = this.textDialogData
      this.textDialogData = this.textDialogDataStandard
      
      // Рисуем подложку с использованием настроек из textDialogDataStandard
      const bgWidth = this.textDialogData.backgroundWidth || 200
      const bgHeight = this.textDialogData.backgroundHeight || 80
      
      // Рисуем тень если включена
      if (this.textDialogData.shadow) {
        ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
        ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur))
        ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX)
        ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY)
      }
      
      // Рисуем простую прямоугольную подложку
      ctx.fillStyle = this.textDialogData.backgroundColor || '#ffffff'
      ctx.fillRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight)
      
      // Сбрасываем тень
      if (this.textDialogData.shadow) {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      // Добавляем обводку если включена
      if (this.textDialogData.stroke) {
        ctx.strokeStyle = this.textDialogData.strokeColor || '#000000'
        ctx.lineWidth = this.textDialogData.strokeWidth || 2
        ctx.strokeRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight)
      }
      
      // Рисуем дефолтный текст "Текст"
      ctx.fillStyle = this.textDialogData.textColor || '#000000'
      ctx.font = `${this.textDialogData.fontWeight || 'normal'} ${this.textDialogData.fontSize || 16}px ${this.textDialogData.font || 'Arial'}`
      ctx.textAlign = this.textDialogData.textAlign || 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Текст', x, y)
      
      // Восстанавливаем оригинальные данные
      this.textDialogData = originalData
    },
    
    drawDefaultTextPreviewOnCanvasImageTextMode(ctx, canvas) {
      console.log('🖼️ ДЕФОЛТНЫЙ текст режима "Текст с изображением" БЕЗ подложки')
      
      // Используем позицию из currentTextPosition или центр канваса
      const x = this.currentTextPosition ? this.currentTextPosition.x : this.previewCanvasWidth / 2
      const y = this.currentTextPosition ? this.currentTextPosition.y : this.previewCanvasHeight / 2
      
      // Копируем фон с основного канваса если доступен
      if (this.canvas && this.canvas.width > 0) {
        ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
      }
      
      // Проверяем, есть ли выбранное изображение для режима "Текст с изображением"
      const textImage = this.textDialogDataImageText.textImage
      
      if (textImage) {
        console.log('🖼️ Дефолтный текст с маской изображения')
        
        // Создаем временный канвас для текста
        const textCanvas = document.createElement('canvas')
        textCanvas.width = canvas.width
        textCanvas.height = canvas.height
        const textCtx = textCanvas.getContext('2d')
        
        // Вычисляем размеры дефолтного текста для правильного позиционирования изображения
        textCtx.font = `${this.textDialogDataImageText.fontWeight} ${this.textDialogDataImageText.fontSize}px ${this.textDialogDataImageText.font}`
        const textWidth = textCtx.measureText('Текст').width
        const textHeight = this.textDialogDataImageText.fontSize * this.textDialogDataImageText.lineHeight
        
        // Используем точные размеры текста для изображения (как в основном канвасе)
        const drawWidth = textWidth
        const drawHeight = textHeight
        const drawX = x - drawWidth / 2
        const drawY = y - drawHeight / 2
        
        const imageToUse = this.textDialogDataImageText.cachedImage || textImage
        
        // Рисуем изображение на временном канвасе
        textCtx.drawImage(imageToUse, drawX, drawY, drawWidth, drawHeight)
        
        // Создаем маску из текста (destination-in как в основном канвасе)
        textCtx.globalCompositeOperation = 'destination-in'
        textCtx.textAlign = this.textDialogDataImageText.textAlign
        textCtx.textBaseline = 'middle'
        textCtx.fillStyle = 'white'
        textCtx.fillText('Текст', x, y)
        
        // Сначала рисуем тень к тексту с изображением если включена
        if (this.textDialogDataImageText.shadow) {
          // Создаем временный канвас для тени
          const shadowCanvas = document.createElement('canvas')
          shadowCanvas.width = canvas.width
          shadowCanvas.height = canvas.height
          const shadowCtx = shadowCanvas.getContext('2d')
          
          // Настраиваем тень
          shadowCtx.shadowColor = this.textDialogDataImageText.shadowColor
          shadowCtx.shadowBlur = this.textDialogDataImageText.shadowBlur
          shadowCtx.shadowOffsetX = this.textDialogDataImageText.shadowOffsetX
          shadowCtx.shadowOffsetY = this.textDialogDataImageText.shadowOffsetY
          shadowCtx.globalAlpha = this.textDialogDataImageText.shadowOpacity / 100
          shadowCtx.fillStyle = this.textDialogDataImageText.shadowColor
          shadowCtx.font = `${this.textDialogDataImageText.fontWeight} ${this.textDialogDataImageText.fontSize}px ${this.textDialogDataImageText.font}`
          shadowCtx.textAlign = this.textDialogDataImageText.textAlign
          shadowCtx.textBaseline = 'middle'
          shadowCtx.fillText('Текст', x, y)
          
          // Рисуем тень на основном канвасе
          ctx.drawImage(shadowCanvas, 0, 0)
        }
        
        // Затем рисуем основной текст с изображением поверх тени
        ctx.drawImage(textCanvas, 0, 0)
        
        // Применяем обводку к тексту с изображением если включена
        if (this.textDialogDataImageText.stroke) {
          // Рисуем обводку поверх текста с изображением (без применения изображения как маски)
          ctx.strokeStyle = this.textDialogDataImageText.strokeColor
          ctx.lineWidth = this.textDialogDataImageText.strokeWidth
          ctx.font = `${this.textDialogDataImageText.fontWeight} ${this.textDialogDataImageText.fontSize}px ${this.textDialogDataImageText.font}`
          ctx.textAlign = this.textDialogDataImageText.textAlign
          ctx.textBaseline = 'middle'
          ctx.strokeText('Текст', x, y)
        }
      } else {
        // Если нет изображения, рисуем обычный дефолтный текст
        
        // Применяем тень к дефолтному тексту если включена
        if (this.textDialogDataImageText.shadow) {
          // Создаем временный канвас для тени
          const shadowCanvas = document.createElement('canvas')
          shadowCanvas.width = canvas.width
          shadowCanvas.height = canvas.height
          const shadowCtx = shadowCanvas.getContext('2d')
          
          // Настраиваем тень
          shadowCtx.shadowColor = this.textDialogDataImageText.shadowColor
          shadowCtx.shadowBlur = this.textDialogDataImageText.shadowBlur
          shadowCtx.shadowOffsetX = this.textDialogDataImageText.shadowOffsetX
          shadowCtx.shadowOffsetY = this.textDialogDataImageText.shadowOffsetY
          shadowCtx.globalAlpha = this.textDialogDataImageText.shadowOpacity / 100
          shadowCtx.fillStyle = this.textDialogDataImageText.shadowColor
          shadowCtx.font = `${this.textDialogDataImageText.fontWeight} ${this.textDialogDataImageText.fontSize}px ${this.textDialogDataImageText.font}`
          shadowCtx.textAlign = this.textDialogDataImageText.textAlign
          shadowCtx.textBaseline = 'middle'
          shadowCtx.fillText('Текст', x, y)
          
          // Рисуем тень на основном канвасе
          ctx.drawImage(shadowCanvas, 0, 0)
        }
        
        // Рисуем основной текст
        ctx.fillStyle = this.textDialogDataImageText.textColor
        ctx.font = `${this.textDialogDataImageText.fontWeight} ${this.textDialogDataImageText.fontSize}px ${this.textDialogDataImageText.font}`
        ctx.textAlign = this.textDialogDataImageText.textAlign
        ctx.textBaseline = 'middle'
        ctx.fillText('Текст', x, y)
      }
      
      // Применяем обводку к дефолтному тексту если включена
      if (this.textDialogDataImageText.stroke) {
        ctx.strokeStyle = this.textDialogDataImageText.strokeColor
        ctx.lineWidth = this.textDialogDataImageText.strokeWidth
        ctx.strokeText('Текст', x, y)
      }
      
      console.log('✅ Дефолтный текст режима "Текст с изображением" отрисован')
    },

    // Обновление одного превью канваса
    updateSinglePreviewCanvas(previewCanvas) {
      if (!previewCanvas) {
        console.log('⚠️ Превью канвас не найден')
        return
      }
      
      // Получаем размеры основного канваса для точного соответствия
      const mainCanvas = this.canvas
      if (!mainCanvas || mainCanvas.width === 0) {
        console.log('⚠️ Основной канвас не найден или не инициализирован')
        return
      }
      
      // Получаем логические размеры основного канваса
      const dpr = window.devicePixelRatio || 1
      const mainCanvasLogicalWidth = mainCanvas.width / dpr
      const mainCanvasLogicalHeight = mainCanvas.height / dpr
      
      // Используем точно такие же размеры, как у основного канваса
      const canvasWidth = mainCanvasLogicalWidth
      const canvasHeight = mainCanvasLogicalHeight
      
      // Устанавливаем размеры канваса (без дополнительного масштабирования)
      previewCanvas.width = canvasWidth
      previewCanvas.height = canvasHeight
      previewCanvas.style.width = `${canvasWidth}px`
      previewCanvas.style.height = `${canvasHeight}px`
      
      // Обновляем позицию для центрирования, если она еще не инициализирована
      if (this.currentDragPosition.x === 0 && this.currentDragPosition.y === 0) {
        this.currentDragPosition = {
          x: canvasWidth / 2,
          y: canvasHeight / 2
        }
      }
      
      console.log('🔄 Обновление превью канваса (точные размеры основного канваса):', {
        canvas: previewCanvas,
        mainCanvasPhysical: `${mainCanvas.width}x${mainCanvas.height}`,
        mainCanvasLogical: `${mainCanvasLogicalWidth}x${mainCanvasLogicalHeight}`,
        previewCanvasSize: `${canvasWidth}x${canvasHeight}`,
        physicalSize: `${previewCanvas.width}x${previewCanvas.height}`,
        styleSize: `${previewCanvas.style.width}x${previewCanvas.style.height}`,
        currentPosition: `${this.currentDragPosition.x}x${this.currentDragPosition.y}`,
        dpr: dpr
      })
      
      const ctx = previewCanvas.getContext('2d')
      if (!ctx) {
        console.log('⚠️ Не удалось получить контекст канваса')
        return
      }
      
      // Очищаем канвас
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      
      // При редактировании отключаем редактируемый слой перед скриншотом
      let editingLayer = null
      if (this.isEditingText && this.editingLayerIndex && this.paperScope) {
        // Находим редактируемый слой в родительском компоненте
        const parentComponent = this.$parent
        if (parentComponent && parentComponent.textLayers) {
          editingLayer = parentComponent.textLayers.find(layer => layer.id === this.editingLayerIndex)
          if (editingLayer && editingLayer.layer) {
            editingLayer.layer.visible = false
            console.log('👁️ TextManager: Отключаем редактируемый слой для скриншота:', this.editingLayerIndex)
            
            // Обновляем Paper.js канвас после отключения слоя
            this.paperScope.view.draw()
          }
        }
      }
      
      // Копируем фон с основного канваса если доступен
      if (this.canvas && this.canvas.width > 0) {
        console.log('🖼️ TextManager: Копируем фон с основного канваса:', {
          mainCanvasSize: `${this.canvas.width}x${this.canvas.height}`,
          previewSize: `${canvasWidth}x${canvasHeight}`
        })
        // Копируем фон с масштабированием под размер превью канваса
        ctx.drawImage(this.canvas, 0, 0, canvasWidth, canvasHeight)
      } else {
        console.log('⚠️ TextManager: Основной канвас недоступен, рисуем белый фон', {
          canvas: this.canvas,
          canvasWidth: this.canvas ? this.canvas.width : 'undefined',
          canvasHeight: this.canvas ? this.canvas.height : 'undefined'
        })
        // Рисуем белый фон если основной канвас недоступен
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      }
      
      // Включаем обратно редактируемый слой после скриншота
      if (editingLayer && editingLayer.layer) {
        editingLayer.layer.visible = true
        console.log('👁️ TextManager: Включаем обратно редактируемый слой:', this.editingLayerIndex)
        
        // Обновляем Paper.js канвас после включения слоя
        this.paperScope.view.draw()
      }
      
      // Определяем какой режим рисования использовать
      const currentTab = this.textDialogActiveTab
      const textData = this.getCurrentTextDialogData()
      
      console.log('🎯 Рисуем превью для режима:', currentTab, 'с данными:', textData)
      
      // Рисуем превью в зависимости от режима
      if (textData && textData.text && textData.text.trim() !== '') {
        switch (currentTab) {
          case 'conversation':
            this.drawTextPreviewOnCanvas(ctx, previewCanvas)
            break
          case 'thoughts':
            this.drawTextPreviewOnCanvasThoughtsMode(ctx, previewCanvas)
            break
          case 'standard':
            this.drawTextPreviewOnCanvasStandardMode(ctx, previewCanvas)
            break
          case 'image-text':
            this.drawTextPreviewOnCanvasImageTextMode(ctx, previewCanvas)
            break
        }
      } else {
        // Рисуем дефолтный текст
        switch (currentTab) {
          case 'conversation':
            this.drawDefaultTextPreviewOnCanvas(ctx, previewCanvas)
            break
          case 'thoughts':
            this.drawDefaultTextPreviewOnCanvasThoughtsMode(ctx, previewCanvas)
            break
          case 'standard':
            this.drawDefaultTextPreviewOnCanvasStandardMode(ctx, previewCanvas)
            break
          case 'image-text':
            this.drawDefaultTextPreviewOnCanvasImageTextMode(ctx, previewCanvas)
            break
        }
      }
      
      console.log('✅ Превью канвас обновлен')
    },

    // ========== МЕТОДЫ ДЛЯ СУПЕРПОДЛОЖКИ (СКОПИРОВАНЫ ИЗ StickerManiaPage) ==========
    
    // Отрисовка объединенной фигуры (подложка + хвост) как единое целое
    drawCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false) {
      // Стабилизация размеров - обеспечиваем минимальные размеры для корректного отображения хвоста
      const minWidth = 150
      const minHeight = 80
      const stableWidth = Math.max(bgWidth, minWidth)
      const stableHeight = Math.max(bgHeight, minHeight)
      
      // КЭШИРУЕМ точку пересечения для использования в strokeCombinedShape
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, stableWidth, stableHeight)
      
      // Создаем путь для объединенной фигуры по внешним границам
      ctx.beginPath()
      
      // Строим объединенную фигуру как единый путь с кэшированной точкой
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, stableWidth, stableHeight, scale, cachedIntersection)
      
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
        
        return selectedIntersection
      }
      
      return null
    },
    
    // Построение пути суперподложки с хвостом - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Построение простого пути подложки без хвоста - ТОЧНАЯ КОПИЯ из StickerManiaPage
    buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight) {
      ctx.beginPath()
      ctx.rect(bgX, bgY, bgWidth, bgHeight)
      ctx.closePath()
    },
    
    // Определение стороны выхода хвоста по точке пересечения - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Проверка, находится ли точка пересечения в углу подложки - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Построение пути суперподложки с хвостом из угла - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Построение пути суперподложки с хвостом со стороны (не из угла) - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Построение пути суперподложки с хвостом точно из угла - ТОЧНАЯ КОПИЯ из StickerManiaPage
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
    
    // Кэширование точки пересечения хвоста
    getCachedTailIntersection(centerX, centerY, bgWidth, bgHeight) {
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      return this.getTailIntersectionWithBackground(centerX, centerY, tailAngle, bgX, bgY, bgWidth, bgHeight)
    },
    
    // Построение пути с кэшированной точкой пересечения
    buildUnifiedShapePathWithCache(ctx, centerX, centerY, bgWidth, bgHeight, scale, cachedIntersection) {
      // Параметры хвоста
      const tailSize = Number(this.textDialogData.tailSize) / 100
      const tailWidth = Number(this.textDialogData.tailWidth) / 100
      const tailAngle = Number(this.textDialogData.tailAngle) * Math.PI / 180
      
      // Размеры хвоста
      const minDimension = Math.min(bgWidth, bgHeight)
      const tailLength = minDimension * 1.25
      
      // Позиция подложки
      const bgX = centerX - bgWidth / 2
      const bgY = centerY - bgHeight / 2
      
      if (cachedIntersection) {
        // Создаем суперподложку с хвостом
        this.buildSuperBackgroundPath(ctx, centerX, centerY, bgX, bgY, bgWidth, bgHeight, 
                                   cachedIntersection, tailAngle, tailLength, tailWidth)
      } else {
        // Если нет пересечения, рисуем обычную подложку
        this.buildSimpleBackgroundPath(ctx, bgX, bgY, bgWidth, bgHeight)
      }
    },
    
    // Обводка объединенной фигуры
    strokeCombinedShape(ctx, centerX, centerY, bgWidth, bgHeight, scale) {
      // Стабилизация размеров - используем те же минимальные размеры
      const minWidth = 150
      const minHeight = 80
      const stableWidth = Math.max(bgWidth, minWidth)
      const stableHeight = Math.max(bgHeight, minHeight)
      
      const cachedIntersection = this.getCachedTailIntersection(centerX, centerY, stableWidth, stableHeight)
      
      ctx.beginPath()
      this.buildUnifiedShapePathWithCache(ctx, centerX, centerY, stableWidth, stableHeight, scale, cachedIntersection)
      ctx.stroke()
    },
    
    // Вспомогательные методы для геометрии
    getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(denom) < 1e-10) return null
      
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
    
    isPointOnLineSegment(px, py, x1, y1, x2, y2) {
      const minX = Math.min(x1, x2)
      const maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2)
      const maxY = Math.max(y1, y2)
      
      return px >= minX && px <= maxX && py >= minY && py <= maxY
    },
    
    // Методы для работы с текстом
    calculateMultilineTextSize(ctx, text, fontSize, lineHeight) {
      const lines = text.split('\n')
      let maxWidth = 0
      let totalHeight = 0
      
      for (const line of lines) {
        const metrics = ctx.measureText(line)
        maxWidth = Math.max(maxWidth, metrics.width)
        totalHeight += fontSize * lineHeight
      }
      
      return { width: maxWidth, height: totalHeight }
    },
    
    drawMultilineText(ctx, text, x, y, fontSize, lineHeight) {
      const lines = text.split('\n')
      const totalHeight = lines.length * fontSize * lineHeight
      const startY = y - totalHeight / 2
      
      // Получаем текущие настройки выравнивания
      const textAlign = ctx.textAlign || 'center'
      
      for (let i = 0; i < lines.length; i++) {
        const lineY = startY + i * fontSize * lineHeight + fontSize / 2
        
        // Сохраняем текущее выравнивание
        const currentAlign = ctx.textAlign
        
        // Рассчитываем позицию для каждой строки в зависимости от выравнивания
        let lineX = x
        
        if (currentAlign === 'left') {
          // Для выравнивания влево находим самую широкую строку
          const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
          lineX = x - maxWidth / 2
        } else if (currentAlign === 'right') {
          // Для выравнивания вправо находим самую широкую строку
          const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
          lineX = x + maxWidth / 2
        }
        // Для center оставляем x как есть
        
        // Устанавливаем выравнивание для текущей строки
        ctx.textAlign = currentAlign
        
        ctx.fillText(lines[i], lineX, lineY)
      }
    },
    
    // ========== МЕТОДЫ ДЛЯ РЕЖИМА "МЫСЛИ" (СКОПИРОВАНЫ ИЗ StickerManiaPage) ==========
    
    // Отрисовка режима "Мысли" - овальная подложка с множественными хвостами
    drawThoughtsModeShape(ctx, centerX, centerY, bgWidth, bgHeight, scale, backgroundColor, withShadow = false, drawTail = true) {
      console.log('🧠 Отрисовка режима "Мысли" - овальная подложка с множественными хвостами')
      
      // Рисуем каждый овал отдельно, чтобы избежать создания общего пути
      this.buildThoughtsModePath(ctx, centerX, centerY, bgWidth, bgHeight, scale, drawTail, backgroundColor)
      
      console.log('✅ Режим "Мысли" отрисован - только овалы, без треугольников!')
    },
    
    // Построение пути для режима "Мысли"
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
        
        // Позиция овала
        const ovalX = centerX + distanceFromCenter * Math.cos(tailAngle)
        const ovalY = centerY + distanceFromCenter * Math.sin(tailAngle)
        
        // Размеры овала
        const ovalWidth = maxTailWidth * sizeMultiplier
        const ovalHeight = maxTailWidth * sizeMultiplier * 0.6 // Овалы немного сплющены
        
        console.log(`🧠 Овал ${i + 1}:`, {
          position: `${ovalX.toFixed(1)}, ${ovalY.toFixed(1)}`,
          size: `${ovalWidth.toFixed(1)}x${ovalHeight.toFixed(1)}`,
          distanceFromCenter: distanceFromCenter.toFixed(1),
          sizeMultiplier: sizeMultiplier.toFixed(1)
        })
        
        // Рисуем овал с тенью если включена
        if (this.textDialogData.shadow) {
          ctx.shadowColor = this.textDialogData.shadowColor + Math.round(this.textDialogData.shadowOpacity * 2.55).toString(16).padStart(2, '0')
          ctx.shadowBlur = Math.max(1, Math.round(this.textDialogData.shadowBlur * scale))
          ctx.shadowOffsetX = Math.round(this.textDialogData.shadowOffsetX * scale)
          ctx.shadowOffsetY = Math.round(this.textDialogData.shadowOffsetY * scale)
        }
        
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
    },
    
    // Рисование овала
    drawOval(ctx, centerX, centerY, width, height) {
      const radiusX = width / 2
      const radiusY = height / 2
      
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(1, radiusY / radiusX)
      ctx.beginPath()
      ctx.arc(0, 0, radiusX, 0, 2 * Math.PI)
      ctx.restore()
    },

    // Начало перетаскивания превью
    startPreviewDrag(event) {
      if (!this.currentTextPosition) return
      
      const canvas = event.target
      const rect = canvas.getBoundingClientRect()
      const startX = event.clientX - rect.left
      const startY = event.clientY - rect.top
      
      // Проверяем, кликнули ли по тексту/подложке
      if (this.isClickOnSuperBackground(startX, startY)) {
        console.log('🎯 Начато перетаскивание на превью канвасе TextManager')
        
        // Инициализируем currentDragPosition если нужно
        if (this.currentDragPosition.x === 0 && this.currentDragPosition.y === 0) {
          this.currentDragPosition = {
            x: this.previewCanvasWidth / 2,
            y: this.previewCanvasHeight / 2
          }
        }
        
        // Сохраняем начальную позицию
        const startPositionX = this.currentDragPosition.x
        const startPositionY = this.currentDragPosition.y
        
        const handleMouseMove = (e) => {
          const currentX = e.clientX - rect.left
          const currentY = e.clientY - rect.top
          
          const deltaX = currentX - startX
          const deltaY = currentY - startY
          
          // Обновляем позицию относительно начальной позиции
          this.currentDragPosition = {
            x: startPositionX + deltaX,
            y: startPositionY + deltaY
          }
          
          // Обновляем превью с throttling для плавной визуальной обратной связи
          this.updatePreviewCanvasThrottled()
        }
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          console.log('🎯 Завершено перетаскивание на превью канвасе TextManager')
        }
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    },

    // Проверка, кликнули ли мы по суперподложке или тексту
    isClickOnSuperBackground(clickX, clickY) {
      if (!this.currentTextPosition) {
        console.log('❌ currentTextPosition не определен в isClickOnSuperBackground')
        return false
      }
      
      // Для режима "Текст с изображением" проверяем клик по тексту, а не по подложке
      if (this.textDialogActiveTab === 'image-text') {
        return this.isClickOnText(clickX, clickY)
      }
      
      // Получаем размеры суперподложки из текущих данных
      const textData = this.getCurrentTextDialogData()
      const bgWidth = textData.backgroundWidth
      const bgHeight = textData.backgroundHeight
      
      // Получаем ссылку на текущий превью-канвас
      const previewCanvas = this.getCurrentPreviewCanvasRef()
      if (!previewCanvas) {
        console.log('❌ Превью-канвас не найден в isClickOnSuperBackground')
        return false
      }
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
      // Масштабированные размеры подложки (используем тот же масштаб)
      const scaledBgWidth = Math.round(bgWidth * previewScale)
      const scaledBgHeight = Math.round(bgHeight * previewScale)
      
      // Прямое вычисление границ суперподложки в координатах превью
      const left = this.currentTextPosition.x - scaledBgWidth / 2
      const top = this.currentTextPosition.y - scaledBgHeight / 2
      const right = left + scaledBgWidth
      const bottom = top + scaledBgHeight
      
      // Проверяем, находится ли клик в пределах суперподложки
      const isInside = clickX >= left && clickX <= right && clickY >= top && clickY <= bottom
      
      // Детальная отладка
      console.log('🎯 TextManager: Проверка клика по суперподложке:')
      console.log('  clickX:', clickX, 'clickY:', clickY)
      console.log('  left:', left, 'top:', top, 'right:', right, 'bottom:', bottom)
      console.log('  bgWidth:', bgWidth, 'bgHeight:', bgHeight)
      console.log('  scaledBgWidth:', scaledBgWidth, 'scaledBgHeight:', scaledBgHeight)
      console.log('  previewScale:', previewScale)
      console.log('  ИТОГОВЫЙ РЕЗУЛЬТАТ:', isInside)
      
      return isInside
    },

    // Проверка клика по тексту (для режима "Текст с изображением")
    isClickOnText(clickX, clickY) {
      if (!this.currentTextPosition) {
        console.log('❌ currentTextPosition не определен в isClickOnText')
        return false
      }
      
      // Координаты остаются теми же, так как размеры канвасов одинаковые
      const previewX = this.currentTextPosition.x
      const previewY = this.currentTextPosition.y
      
      // Получаем ссылку на текущий превью-канвас
      const previewCanvas = this.getCurrentPreviewCanvasRef()
      if (!previewCanvas) {
        console.log('❌ Превью-канвас не найден в isClickOnText')
        return false
      }
      
      // Размеры канвасов теперь одинаковые, масштабирование не нужно
      const previewScale = 1
      
      // Получаем данные для текущего режима
      const textData = this.getCurrentTextDialogData()
      
      // Вычисляем размеры текста точно так же, как в отрисовке
      const fontSize = textData.fontSize
      const text = textData.text || 'Текст'
      
      // Создаем временный контекст для измерения текста
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.font = `${textData.fontWeight} ${fontSize}px ${textData.font}`
      
      // Измеряем размеры многострочного текста точно так же, как в отрисовке
      const textSize = this.calculateMultilineTextSize(tempCtx, text, fontSize, textData.lineHeight)
      const textWidth = textSize.width
      const textHeight = textSize.height
      
      // Вычисляем границы текста с учетом выравнивания
      // В отрисовке используется textAlign = 'center' и textBaseline = 'middle'
      let left, right, top, bottom
      
      if (textData.textAlign === 'left') {
        left = previewX - textWidth / 2
        right = left + textWidth
      } else if (textData.textAlign === 'right') {
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
      
      console.log('🖼️ TextManager: Проверка клика по тексту:')
      console.log('  clickX:', clickX, 'clickY:', clickY)
      console.log('  previewX:', previewX, 'previewY:', previewY)
      console.log('  textAlign:', textData.textAlign)
      console.log('  textBounds:', { left, top, right, bottom })
      console.log('  textSize:', { width: textWidth, height: textHeight })
      console.log('  fontSize:', fontSize, 'previewScale:', previewScale)
      console.log('  ИТОГОВЫЙ РЕЗУЛЬТАТ:', isInside)
      
      return isInside
    },

    // Обновление превью с throttling для плавной визуальной обратной связи
    updatePreviewCanvasThrottled() {
      if (this.previewUpdateFrame) {
        cancelAnimationFrame(this.previewUpdateFrame)
      }
      
      this.previewUpdateFrame = requestAnimationFrame(() => {
        this.updatePreviewCanvas()
        this.previewUpdateFrame = null
      })
    },

    // Получение текущих данных для активной вкладки
    getCurrentTextDialogData() {
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
    }
  }
}
</script>

<style scoped>
.text-manager {
  margin-bottom: 0;
}

.text-controls {
  margin-bottom: 0;
}

.text-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.text-dialog {
  background: #fff;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}

.text-dialog-header {
  display: flex;
  justify-content: space-between;
  width: 1200px;
  margin: 0 auto;
  padding: 1.5em 0;
}

.text-dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.text-dialog-body {
  padding: 0 20px;
}

/* Секция превью (полная ширина) */
.text-preview-section {
  margin-bottom: 1rem !important;
}

/* Секция поля ввода текста (под превью) */
.text-input-section {
  width: 250px;
  margin-right: 25px;
  max-width: 100%;
}

.text-dialog-body .tab-pane.active {
  width: 1280px;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
}

.text-input-section textarea {
  height: 56px;
}

.text-preview {
  aspect-ratio: initial;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}

/* Адаптивность */
@media (max-width: 768px) {
  .text-preview-section {
    width: 100%;
  }
  
  .text-input-section {
    width: 100%;
  }
}

.text-dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.text-img-preview {
  display: flex;
  justify-content: space-between;
}

.text-img-preview > .img-thumbnail {
  padding: 0;
  border: none;
}

/* Стили для кнопок шрифта */
.font-weight-buttons {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.font-weight-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
}

.font-weight-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.font-weight-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Стили для кнопок выравнивания */
.text-align-buttons {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.text-align-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
}

.text-align-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.text-align-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Разделитель */
.style-align-divider {
  height: 1px;
  background: #dee2e6;
  margin: 0.75rem 0;
}

/* Стили для цветовых кнопок */
.color-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.color-button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-icon {
  font-size: 1.1rem;
  color: #6c757d;
}

.color-btn {
  position: relative;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
}

.color-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Стили для форм */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.form-control, .form-select {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Стили для ползунков */
.range {
  position: relative;
  display: grid;
  width: 100%;
  margin-bottom: 20px;
}

.range-label {
  margin-block-end: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.range-input {
  width: 100%;
  height: 30px;
  border-radius: 10px;
  appearance: none;
  background: none;
  position: relative;
  z-index: 9;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 0 5px inset #007bff;
  transition: 300ms;
}

.range-input::-moz-range-thumb {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 0 5px inset #007bff;
  transition: 300ms;
}

.range-input:hover::-webkit-slider-thumb,
.range-input:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 10px inset #007bff;
}

.range-input:hover::-moz-range-thumb,
.range-input:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 10px inset #007bff;
}

.range-input:active::-webkit-slider-thumb {
  box-shadow: 0 0 0 30px inset #007bff;
}

.range-input:active::-moz-range-thumb {
  box-shadow: 0 0 0 30px inset #007bff;
}

.range-input:disabled::-webkit-slider-thumb {
  box-shadow: 0 0 0 30px inset gray;
}

.range-input:disabled::-moz-range-thumb {
  box-shadow: 0 0 0 30px inset gray;
}

.range-input:focus-visible {
  outline-offset: 10px;
  outline: 1px solid #007bff;
}

.range-input:focus-visible::-webkit-slider-thumb {
  outline: 3px solid #28a745;
}

.range-input:focus-visible::-moz-range-thumb {
  outline: 3px solid #28a745;
}

.track {
  position: absolute;
  top: 43px;
  width: 100%;
  height: 8px;
  border-radius: 10px;
  background-color: #ababab;
  z-index: 1;
}



.form-check {
  margin: 0;
}

.form-check-label {
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.texts-top-section {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.text-input-section {
  width: 300px;
}

.text-dialog-body .tab-pane.active {
  width: 1200px;
}

.vertical-line {
  width: 1px;
  height: 38px;
  background: #eee;
  max-width: 1px;
  padding: 0;
  margin: 0 5px;
}

.form-label {
  font-size: 14px;
}

.range-label {
  font-size: 15px;
}

.text-input-section textarea {
  margin-bottom: 10px;
}

.nav.nav-tabs {
  width: 1200px;
  margin: 0 auto;
}

/* Стили для кнопки "Текст 2" - такие же как у других кнопок над канвасом */
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
</style>
