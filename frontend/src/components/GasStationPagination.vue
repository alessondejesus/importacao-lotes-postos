<template>
  <div class="d-flex align-center justify-center py-4 ga-4">
    <v-btn
      variant="outlined"
      density="comfortable"
      :disabled="isFirstPage || loading"
      prepend-icon="mdi-chevron-left"
      @click="$emit('prev')"
    >
      Anterior
    </v-btn>

    <v-btn
      variant="outlined"
      density="comfortable"
      :disabled="!hasMore || loading"
      append-icon="mdi-chevron-right"
      @click="$emit('next')"
    >
      Próximo
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    hasMore: boolean
    isFirstPage: boolean
    loading: boolean
  }>()

  defineEmits<{
    (e: 'next'): void
    (e: 'prev'): void
  }>()
</script>
