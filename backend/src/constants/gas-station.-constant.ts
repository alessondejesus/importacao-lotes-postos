import {isValidCNPJ} from "../validators/cnpj_validator";
import {isValidCEP} from "../validators/cep_validator";
import {isValidCPF} from "../validators/cpf_validator";
import {isValidEmail} from "../validators/email_validator";
import {isValidFuelList} from "../validators/gas-station-import/fuel_type_validator";
import {isValidGasStationStatus} from "../validators/gas-station-import/gas_station_status_validator";
import {isValidDate} from "../validators/gas-station-import/date_validator";

export const stationGasStationTableColumns = [
  'cnpj', 'name', 'trade_name', 'brand', 'street', 'number', 'complement',
  'neighborhood', 'city', 'state', 'zip_code', 'responsible_cpf',
  'responsible_name', 'responsible_email', 'responsible_position',
  'status', 'founding_date', 'pump_count', 'lane_count', 'observations'
] as const;

export const stationGasStationImportCSVColumns = [
  {name: 'cnpj', required: true, validate: isValidCNPJ},
  {name: 'nome_posto', required: true, maxLength: 150},
  {name: 'nome_fantasia', required: true, maxLength: 150},
  {name: 'bandeira', required: true, maxLength: 150},
  {name: 'logradouro', required: true, maxLength: 150},
  {name: 'numero', required: true, maxLength: 150},
  {name: 'complemento', required: false, maxLength: 150},
  {name: 'bairro', required: true, maxLength: 150},
  {name: 'municipio', required: true, maxLength: 150},
  {name: 'uf', required: true, maxLength: 2},
  {name: 'cep', required: true, validate: isValidCEP},
  {name: 'cpf_responsavel', required: true, validate: isValidCPF},
  {name: 'nome_responsavel', required: true, maxLength: 150},
  {name: 'email_responsavel', required: true, validate: isValidEmail},
  {name: 'cargo_responsavel', required: true, maxLength: 150},
  {name: 'combustiveis', required: true, validate: isValidFuelList},
  {name: 'status', required: true, validate: isValidGasStationStatus},
  {name: 'data_inauguracao', required: true, validate: isValidDate},
  {name: 'numero_bicos', required: true},
  {name: 'numero_pistas', required: true},
  {name: 'observacoes', required: false},
]