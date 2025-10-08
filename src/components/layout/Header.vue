<template>
  <header class="app-header">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-auto">
          <button 
            class="btn btn-outline-secondary menu-toggle"
            @click="$emit('menu-toggle')"
            aria-label="Открыть меню"
          >
            <i class="bi bi-list"></i>
          </button>
        </div>
        <div class="col">
          <h1 class="app-title mb-0">
            <router-link to="/" class="text-decoration-none text-dark">
              Печать<span class="header-span-1">на</span>кружках<span class="header-span-2">.рф</span>
            </router-link>
          </h1>
        </div>
        <div class="col-auto">
          <div class="header-actions">
            <!-- Здесь могут быть дополнительные действия -->
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  emits: ['menu-toggle']
}
</script>

<style lang="scss" scoped>
.header-span-1{
  color: #0e6ffd;
}
.header-span-2{
  color:rgb(241, 10, 10);;
}
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1030;
}

.menu-toggle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid #dee2e6;
  background-color: #fff;
  color: #495057;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #016527;
    color: #016527;
    background-color: #f8f9fa;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  i {
    font-size: 1.5rem;
  }
  
  @media (max-width: 767.98px) {
    width: 40px;
    height: 40px;
    
    i {
      font-size: 1.3rem;
    }
  }
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  
  a {
    color: inherit;
    
    &:hover {
      color: #016527;
    }
  }
  
  @media (max-width: 767.98px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 575.98px) {
    font-size: 1.1rem;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 575.98px) {
  .app-header {
    padding: 0.75rem 0;
  }
  
  .col-auto {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }
}
</style>
