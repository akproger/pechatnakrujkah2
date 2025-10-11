<template>
  <div class="shapes-tab">
    <div class="row g-3">
      <div v-for="(mask, index) in stickerMasks" :key="index" class="col-12">
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            :id="'mask-' + index"
            :checked="mask.selected"
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
</template>

<script>
export default {
  name: 'ShapesTab',
  props: {
    stickerMasks: {
      type: Array,
      required: true
    }
  },
  emits: ['mask-change'],
  methods: {
    handleMaskChange(index, event) {
      this.$emit('mask-change', index, event)
    }
  }
}
</script>

<style lang="scss" scoped>
.shapes-tab {
  padding: 16px 0;
}

.form-check {
  margin-bottom: 8px;
}

.form-check-label {
  font-size: 14px;
  cursor: pointer;
  
  img {
    border-radius: 4px;
  }
}
</style>
