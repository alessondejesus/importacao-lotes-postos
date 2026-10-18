<template>
	<v-dialog v-model="internalValue" max-width="700" persistent>
		<v-card :loading="importLoading">
			<v-card-title class="flex justify-between items-center">
				<span>Importar postos</span>
				<v-btn
					icon="mdi-help-circle-outline"
					variant="text"
					density="comfortable"
					@click="tipsDialog = true"
					title="Dicas para importação"
				></v-btn>
			</v-card-title>
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
					<div class="flex justify-between items-start">
						<ul class="pl-4 text-red-400">
							<li v-for="(error, index) in errors" :key="index">
								{{ error }}
							</li>
						</ul>
						<v-btn
							icon="mdi-help-circle-outline"
							variant="text"
							color="error"
							class="flex-shrink-0"
							@click="tipsDialog = true"
							title="Dicas para importação"
						></v-btn>
					</div>
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
	<v-dialog v-model="tipsDialog" max-width="500">
		<v-card title="Dicas para Importação">
			<v-card-text>
				<div class="space-y-4 text-sm">
					<p>
						<v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
						Certifique-se de que o arquivo CSV utilize o <strong>ponto e vírgula (;)</strong> como delimitador.
					</p>

					<p>
						<v-icon color="primary" class="mr-2">mdi-check-circle-outline</v-icon>
						Os campos <strong>CNPJ</strong> e <strong>CPF</strong> são validados matematicamente e devem ser válidos (podem conter ou não os dígitos formatadores).
					</p>

					<p>
						<v-icon color="primary" class="mr-2">mdi-database-alert-outline</v-icon>
						Os postos são identificados de forma única pelo <strong>CNPJ</strong>. O sistema não realiza atualizações: novas entradas com CNPJ já existente na base serão <strong>ignoradas</strong>.
					</p>

					<div>
						<p class="font-bold mb-2">Campos Obrigatórios:</p>
						<v-chip-group>
							<v-chip size="small" variant="outlined" v-for="field in requiredFields" :key="field">
								{{ field }}
							</v-chip>
						</v-chip-group>
					</div>

					<p>
						<v-icon color="primary" class="mr-2">mdi-alert-circle-outline</v-icon>
						Os valores do campo <strong>status</strong> devem ser exatamente:
						<code class="px-1 rounded">ativo</code>,
						<code class="px-1 rounded">inativo</code> ou
						<code class="px-1 rounded">em_implantacao</code>.
					</p>

					<p>
						<v-icon color="primary" class="mr-2">mdi-alert-circle-outline</v-icon>
						Os valores do campo <strong>combustiveis</strong> devem ser separados por vírgula e corresponder a:
						<code class="px-1 rounded">Gasolina Comum</code>,
						<code class="px-1 rounded">Gasolina Aditivada</code>,
						<code class="px-1 rounded">Etanol</code>,
						<code class="px-1 rounded">Diesel S10</code>,
						<code class="px-1 rounded">Diesel Comum</code>,
						<code class="px-1 rounded">Arla 32</code> ou
						<code class="px-1 rounded">GNV</code>.
					</p>

					<p>
						<v-icon color="primary" class="mr-2">mdi-ruler-outline</v-icon>
						Fique atento ao limite de caracteres dos campos para evitar truncamento.
					</p>
				</div>
			</v-card-text>
			<v-card-actions>
				<v-spacer/>
				<v-btn color="primary" @click="tipsDialog = false">Entendi</v-btn>
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
	const tipsDialog = ref(false)
	const selectedFile = ref<File | null>(null)
	const errors = ref<string[]>([])

	const requiredFields = [
		'cnpj',
		'nome_posto',
		'bandeira',
		'logradouro',
		'bairro',
		'municipio',
		'uf',
		'cep',
		'cpf_responsavel',
		'nome',
		'combustivel',
		'status',
	]

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