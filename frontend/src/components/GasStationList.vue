<template>
	<v-container>
		<div class="d-flex align-center justify-space-between mb-6">
			<h2 class="text-h5 font-weight-medium ">Postos de Combustível</h2>
			<div class="d-flex gap-2">
				<v-btn
					color="primary"
					prepend-icon="mdi-upload"
					class="mr-2"
					:disabled="exportLoading"
					@click="importDialog = true"
				>
					Importar
				</v-btn>
				<v-btn
					color="success"
					class="mr-2"
					prepend-icon="mdi-download"
					:loading="exportLoading"
					:disabled="exportLoading"
					@click="exportGasStations"
				>
					Exportar Todos
				</v-btn>

				<v-btn
					href="/csv/postos_combustivel_modelo_importacao.csv"
					download="postos_combustivel_modelo_importacao.csv"
					variant="outlined"
					color="primary"
				>
					Baixar modelo
				</v-btn>
			</div>
		</div>

		<v-text-field
			v-model="search"
			prepend-inner-icon="mdi-magnify"
			label="Buscar por CNPJ ou nome do posto"
			variant="outlined"
			hide-details
			clearable
			class="mb-6"
		/>

		<v-card rounded="lg" variant="outlined">
			<v-table hover>
				<thead>
				<tr>
					<th>CNPJ</th>
					<th>Nome</th>
					<th>Bandeira</th>
					<th>Cidade/UF</th>
					<th>Responsável</th>
					<th>Status</th>
				</tr>
				</thead>

				<tbody>
				<tr
					v-for="station in gasStations"
					:key="station.id"
					class="cursor-pointer"
					@click="openDetail(station)"
				>
					<td>{{ formatCNPJ(station.cnpj) }}</td>
					<td>{{ station.name }}</td>
					<td>{{ station.brand }}</td>
					<td>{{ station.city }}/{{ station.state }}</td>
					<td>{{ station.responsible_name }}</td>
					<td>
						<v-chip
							:color="station.status === 'active' ? 'success' : 'error'"
							size="x-small"
							label
						>
							{{ station.status === 'active' ? 'Ativo' : 'Inativo' }}
						</v-chip>
					</td>
				</tr>

				<tr v-if="!listLoading && gasStations.length === 0">
					<td colspan="6" class="text-center text-medium-emphasis py-6">
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

			<GasStationPagination
				v-if="gasStations.length > 0 || paginationStack.length > 0"
				:has-more="hasMore"
				:is-first-page="paginationStack.length === 0"
				:loading="listLoading"
				@next="nextPage"
				@prev="prevPage"
			/>
		</v-card>

		<GasStationImportDialog
			v-model="importDialog"
			@success="onImportSuccess"
			@error="onImportError"
		/>

		<GasStationDetailDialog
			v-model="detailDialog"
			:station="selectedStation"
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
	import {onMounted, ref, watch} from 'vue'
	import GasStationImportDialog from "@/components/GasStationImportDialog.vue";
	import GasStationPagination from "@/components/GasStationPagination.vue";
	import GasStationDetailDialog from "@/components/GasStationDetailDialog.vue";

	interface GasStation {
		id: string
		cnpj: string
		name: string
		trade_name: string | null
		brand: string
		street: string
		number: string
		complement: string | null
		neighborhood: string
		city: string
		state: string
		zip_code: string
		responsible_cpf: string
		responsible_name: string
		responsible_email: string
		responsible_position: string
		status: string
		founding_date: string
		pump_count: number
		lane_count: number
		observations: string | null
		fuels: string[]
	}

	const API_URL = import.meta.env.VITE_API_URL

	const gasStations = ref<GasStation[]>([])
	const listLoading = ref(false)
	const exportLoading = ref(false)

	const importDialog = ref(false)
	const detailDialog = ref(false)
	const selectedStation = ref<GasStation | null>(null)

	const hasMore = ref(false)
	const paginationStack = ref<string[]>([])
	const search = ref('')
	let debounceTimer: ReturnType<typeof setTimeout>

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
		search.value = ''
		paginationStack.value = []
		loadGasStations()
		notify('Importação concluída com sucesso!')
	}

	function onImportError(message: string) {
		notify(message, 'error')
	}

	function openDetail(station: GasStation) {
		selectedStation.value = station
		detailDialog.value = true
	}

	function formatCNPJ(cnpj: string) {
		return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
	}

	async function loadGasStations(lastId?: string) {
		listLoading.value = true

		try {
			const url = new URL(`${API_URL}/gas-stations`)
			if (lastId) {
				url.searchParams.append('lastId', lastId)
			}
			if (search.value) {
				url.searchParams.append('search', search.value)
			}

			const response = await fetch(url.toString())

			if (!response.ok) {
				throw new Error('Não foi possível carregar os postos. Se o problema persistir contacte o admnistrador da plataforma.')
			}

			const result = await response.json()

			if (result.success) {
				gasStations.value = result.data.items
				hasMore.value = result.data.pagination.hasMore
			} else {
				throw new Error(result.message || 'Erro ao carregar os postos.')
			}
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

	function nextPage() {
		if (gasStations.value.length > 0) {
			const lastItem = gasStations.value[gasStations.value.length - 1]
			paginationStack.value.push(lastItem.id)
			loadGasStations(lastItem.id)
		}
	}

	function prevPage() {
		paginationStack.value.pop()
		const prevId = paginationStack.value.length > 0
			? paginationStack.value[paginationStack.value.length - 1]
			: undefined

		loadGasStations(prevId)
	}


	watch(search, () => {
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			paginationStack.value = []
			loadGasStations()
		}, 500)
	})

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