<template>
	<v-dialog
		v-model="internalValue"
		max-width="800"
		scrollable
	>
		<v-card v-if="station">
			<v-card-title class="d-flex justify-space-between align-center border-b">
				<span class="text-h6">Detalhes do Posto</span>
				<v-btn icon="mdi-close" variant="text" @click="internalValue = false"></v-btn>
			</v-card-title>

			<v-card-text class="pa-6">
				<v-row>
					<v-col cols="12" sm="6">
						<div class="text-caption text-medium-emphasis">Razão Social</div>
						<div class="text-body-1 font-weight-medium">{{ station.name }}</div>
					</v-col>
					<v-col cols="12" sm="6">
						<div class="text-caption text-medium-emphasis">Nome Fantasia</div>
						<div class="text-body-1 font-weight-medium">{{ station.trade_name || '-' }}</div>
					</v-col>

					<v-col cols="12" sm="4">
						<div class="text-caption text-medium-emphasis">CNPJ</div>
						<div class="text-body-1">{{ formatCNPJ(station.cnpj) }}</div>
					</v-col>
					<v-col cols="12" sm="4">
						<div class="text-caption text-medium-emphasis">Bandeira</div>
						<div class="text-body-1">{{ station.brand }}</div>
					</v-col>
					<v-col cols="12" sm="4">
						<div class="text-caption text-medium-emphasis">Status</div>
						<v-chip
							:color="station.status === 'active' ? 'success' : 'error'"
							size="small"
							label
						>
							{{ station.status === 'active' ? 'Ativo' : 'Inativo' }}
						</v-chip>
					</v-col>

					<v-divider class="v-col-12 my-2"></v-divider>

					<v-col cols="12">
						<div class="text-subtitle-2 font-weight-bold mb-2">Endereço</div>
						<div class="text-body-2">
							{{ station.street }}, {{ station.number }}
							<template v-if="station.complement"> - {{ station.complement }}</template>
						</div>
						<div class="text-body-2">
							{{ station.neighborhood }} - {{ station.city }} / {{ station.state }}
						</div>
						<div class="text-body-2">CEP: {{ formatCEP(station.zip_code) }}</div>
					</v-col>

					<v-divider class="v-col-12 my-2"></v-divider>

					<v-col cols="12" sm="6">
						<div class="text-subtitle-2 font-weight-bold mb-2">Responsável</div>
						<div class="text-body-2"><strong>Nome:</strong> {{ station.responsible_name }}</div>
						<div class="text-body-2"><strong>CPF:</strong> {{ formatCPF(station.responsible_cpf) }}</div>
						<div class="text-body-2"><strong>Email:</strong> {{ station.responsible_email }}</div>
						<div class="text-body-2"><strong>Cargo:</strong> {{ station.responsible_position }}</div>
					</v-col>

					<v-col cols="12" sm="6">
						<div class="text-subtitle-2 font-weight-bold mb-2">Operacional</div>
						<div class="text-body-2"><strong>Bombas:</strong> {{ station.pump_count }}</div>
						<div class="text-body-2"><strong>Pistas:</strong> {{ station.lane_count }}</div>
						<div class="text-body-2"><strong>Data de Fundação:</strong> {{ formatDate(station.founding_date) }}</div>
					</v-col>

					<v-col cols="12">
						<div class="text-subtitle-2 font-weight-bold mb-2">Combustíveis</div>
						<div class="d-flex flex-wrap ga-2">
							<v-chip
								v-for="fuel in station.fuels"
								:key="fuel"
								size="x-small"
								variant="outlined"
							>
								{{ formatFuel(fuel) }}
							</v-chip>
						</div>
					</v-col>

					<v-col cols="12" v-if="station.observations">
						<div class="text-subtitle-2 font-weight-bold mb-2">Observações</div>
						<div class="text-body-2 italic text-medium-emphasis">
							"{{ station.observations }}"
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
	import {computed} from 'vue'

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

	const props = defineProps<{
		modelValue: boolean
		station: GasStation | null
	}>()

	const emit = defineEmits<{
		(e: 'update:modelValue', value: boolean): void
	}>()

	const internalValue = computed({
		get: () => props.modelValue,
		set: (value) => emit('update:modelValue', value)
	})

	function formatCNPJ(cnpj: string) {
		return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
	}

	function formatCPF(cpf: string) {
		return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
	}

	function formatCEP(cep: string) {
		return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('pt-BR')
	}

	function formatFuel(fuel: string) {
		const map: Record<string, string> = {
			regular_gasoline: 'Gasolina Comum',
			additivated_gasoline: 'Gasolina Aditivada',
			ethanol: 'Etanol',
			diesel_s10: 'Diesel S10',
			diesel_s500: 'Diesel S500',
			arla_32: 'ARLA 32',
			regular_diesel: 'Diesel Comum',
			gnv: 'GNV',
		}
		return map[fuel] || fuel
	}
</script>
