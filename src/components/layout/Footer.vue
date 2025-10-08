<template>
  <footer class="app-footer">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="mb-0 text-muted">
            © {{ currentYear }} Печать<span class="header-span-1">на</span>кружках<span class="header-span-2">.рф</span>. Все права защищены.
          </p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="mb-0 text-muted">
            Создано с ❤️ на Vue 3 + Bootstrap + Paper.js + Three.js
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1.5rem 0;
  margin-top: auto;
  
  p {
    font-size: 0.9rem;
    margin: 0;
  }
  
  @media (max-width: 767.98px) {
    padding: 1rem 0;
    text-align: center;
    
    .col-md-6:first-child {
      margin-bottom: 0.5rem;
    }
    
    .text-md-end {
      text-align: center !important;
    }
  }
}
</style>
