<template>
	<v-dialog v-model="internalValue" max-width="700" persistent>
		<v-card title="Importar postos" :loading="importLoading">
			<v-card-text>
				<v-file-input
					v-model="selectedFile"
					label="Arquivo CSV"
					accept=".csv,text/csv"
					prepend-icon="mdi-file-delimited-outline"
					variant="outlined"
					density="comfortable"
					:disabled="importLoading"
					show-size
					clearable
					@update:model-value="errors = []"
				/>

				<v-card
					v-if="errors.length"
					variant="tonal"
					color="error"
					class="mt-4 pa-4"
				>
					<ul class="pl-4 text-red-400">
						<li v-for="(error, index) in errors" :key="index">
							{{ error }}
						</li>
					</ul>
				</v-card>
			</v-card-text>

			<v-card-actions>
				<v-spacer/>

				<v-btn :disabled="importLoading" @click="closeImportDialog">
					Cancelar
				</v-btn>

				<v-btn
					color="primary"
					:loading="importLoading"
					:disabled="!selectedFile || importLoading"
					@click="importGasStations"
				>
					Importar arquivo
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
	import {ref, computed} from 'vue'

	const props = defineProps<{ modelValue: boolean }>()

	const emit = defineEmits<{
		(e: 'update:modelValue', value: boolean): void
		(e: 'success'): void
		(e: 'error', message: string): void
	}>()

	const API_URL = import.meta.env.VITE_API_URL
	const importLoading = ref(false)
	const selectedFile = ref<File | null>(null)
	const errors = ref<string[]>([])

	const internalValue = computed({
		get: () => props.modelValue,
		set: (value) => emit('update:modelValue', value),
	})

	function closeImportDialog() {
		if (importLoading.value) return

		internalValue.value = false
		selectedFile.value = null
		errors.value = []
	}

	async function importGasStations() {
		if (!selectedFile.value || importLoading.value) return

		importLoading.value = true
		errors.value = []

		try {
			const formData = new FormData()
			formData.append('file', selectedFile.value)

			const response = await fetch(`${API_URL}/gas-stations/import`, {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				errors.value = result.errors?.length
					? result.errors
					: [result.message || 'Não foi possível importar os postos. Revise o arquivo enviado e tente novamente. Se o problema persistir contacte o admnistrador da plataforma.']

				emit('error', result.message || 'Não foi possível importar os postos.')
				return
			}

			internalValue.value = false
			selectedFile.value = null
			emit('success')
		} catch (error) {
			emit(
				'error',
				error instanceof Error ? error.message : 'Erro ao importar os postos. Revise o arquivo enviado e tente novamente. Se o problema persistir contacte o admnistrador da plataforma.',
			)
		} finally {
			importLoading.value = false
		}
	}
</script>