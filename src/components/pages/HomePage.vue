<template>
  <div class="home-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <!-- Заголовок -->
          <div class="text-center mb-5">
            <h1 class="display-4 fw-bold text-primary mb-3">
              Добро пожаловать!
            </h1>
            <p class="lead text-muted">
              Инструмент для создания массивов масок с Paper.js
            </p>
          </div>
          
          <!-- Основная кнопка -->
          <div class="text-center">
            <router-link 
              to="/grids" 
              class="btn btn-primary btn-lg px-5 py-3"
            >
              <i class="bi bi-grid-3x3-gap me-3"></i>
              Сетки
            </router-link>
          </div>
          
          <!-- Описание функций -->
          <div class="row mt-5 g-4">
            <div class="col-md-6">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="bi bi-palette text-primary"></i>
                </div>
                <h4>Маски</h4>
                <p class="text-muted">
                  Создание массивов масок различных геометрических форм
                </p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="feature-card">
                <div class="feature-icon">
                  <i class="bi bi-box text-primary"></i>
                </div>
                <h4>Three.js</h4>
                <p class="text-muted">
                  3D графика и визуализация для создания объемных сцен
                </p>
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
  name: 'HomePage'
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  
  @media (max-width: 767.98px) {
    min-height: calc(100vh - 150px);
  }
}

.text-primary {
  color: #016527 !important;
}

.btn-primary {
  background-color: #016527;
  border-color: #016527;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #015a23;
    border-color: #015a23;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 101, 39, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.feature-card {
  text-align: center;
  padding: 2rem 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #495057;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  p {
    line-height: 1.6;
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 767.98px) {
  .home-page {
    min-height: calc(100vh - 180px);
  }
  
  .display-4 {
    font-size: 2.5rem;
  }
  
  .feature-card {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
    
    .feature-icon {
      font-size: 2.5rem;
    }
  }
}

@media (max-width: 575.98px) {
  .display-4 {
    font-size: 2rem;
  }
  
  .btn-lg {
    padding: 0.75rem 2rem !important;
    font-size: 1rem;
  }
}
</style>
