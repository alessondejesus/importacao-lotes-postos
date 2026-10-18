<template>
	<v-container>
		<div class="d-flex align-center justify-space-between mb-6">
			<h2 class="text-h5 font-weight-medium">Postos de Combustível</h2>

			<div class="d-flex ga-2">
				<v-btn
					color="primary"
					prepend-icon="mdi-upload"
					:disabled="exportLoading"
					@click="importDialog = true"
				>
					Importar
				</v-btn>

				<v-btn
					color="success"
					prepend-icon="mdi-download"
					:loading="exportLoading"
					:disabled="exportLoading"
					@click="exportGasStations"
				>
					Exportar
				</v-btn>
			</div>
		</div>

		<v-card rounded="lg" variant="outlined">
			<v-table>
				<thead>
				<tr>
					<th>CNPJ</th>
				</tr>
				</thead>

				<tbody>
				<tr v-for="station in gasStations" :key="station.cnpj">
					<td>{{ station.cnpj }}</td>
				</tr>

				<tr v-if="!listLoading && gasStations.length === 0">
					<td class="text-center text-medium-emphasis py-6">
						Nenhum posto encontrado.
					</td>
				</tr>
				</tbody>
			</v-table>

			<v-progress-linear
				v-if="listLoading"
				indeterminate
				color="primary"
			/>
		</v-card>

		<GasStationImportDialog
			v-model="importDialog"
			@success="onImportSuccess"
			@error="onImportError"
		/>

		<v-snackbar
			v-model="notification.show"
			:color="notification.color"
			:timeout="4000"
			location="top right"
		>
			{{ notification.message }}

			<template #actions>
				<v-btn
					variant="text"
					@click="notification.show = false"
				>
					Fechar
				</v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>

<script setup lang="ts">
	import {onMounted, ref} from 'vue'
	import GasStationImportDialog from "@/components/GasStationImportDialog.vue";

	interface GasStation {
		cnpj: string
	}

	const API_URL = import.meta.env.VITE_API_URL

	const gasStations = ref<GasStation[]>([])
	const listLoading = ref(false)
	const exportLoading = ref(false)

	const importDialog = ref(false)

	const notification = ref({
		show: false,
		message: '',
		color: 'success',
	})

	onMounted(() => {
		loadGasStations()
	})

	function notify(message: string, color: 'success' | 'error' = 'success') {
		notification.value = {
			show: false,
			message,
			color,
		}

		notification.value.show = true
	}

	function onImportSuccess() {
		loadGasStations()
		notify('importação concluída com sucesso!')
	}

	function onImportError(message: string) {
		notify(message, 'error')
	}

	async function loadGasStations() {
		listLoading.value = true

		try {
			const response = await fetch(`${API_URL}/gas-stations`)

			if (!response.ok) {
				throw new Error('Não foi possível carregar os postos. Se o problema persistir contacte o admnistrador da plataforma.')
			}

			gasStations.value = await response.json()
		} catch (error) {
			notify(
				error instanceof Error
					? error.message
					: 'Erro ao carregar os postos. Se o problema persistir contacte o admnistrador da plataforma.',
				'error',
			)
		} finally {
			listLoading.value = false
		}
	}


	async function exportGasStations() {
		if (exportLoading.value) return

		exportLoading.value = true

		try {
			const response = await fetch(`${API_URL}/gas-stations/export`)

			if (!response.ok) {
				throw new Error('Não foi possível exportar os postos. Se o problema persistir contacte o admnistrador da plataforma.')
			}

			if (!response.body) {
				throw new Error('O servidor não retornou um stream para exportação. Tente novamente mais tarde. Se o problema persistir contacte o admnistrador da plataforma.')
			}

			const chunks: BlobPart[] = []
			const reader = response.body.getReader()

			try {
				while (true) {
					const {done, value} = await reader.read()

					if (done) break

					chunks.push(value)
				}
			} finally {
				reader.releaseLock()
			}

			const blob = new Blob(chunks, {
				type: response.headers.get('content-type') || 'text/csv;charset=utf-8',
			})

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')

			link.href = url
			link.download = 'postos-de-combustivel.csv'

			document.body.appendChild(link)
			link.click()
			link.remove()

			URL.revokeObjectURL(url)

			notify('Exportação concluída com sucesso!')
		} catch (error) {
			notify(
				error instanceof Error
					? error.message
					: 'Erro ao exportar os postos. Tente novamente mais tarde. Se o problema persistir contacte o admnistrador da plataforma.',
				'error',
			)
		} finally {
			exportLoading.value = false
		}
	}
</script>