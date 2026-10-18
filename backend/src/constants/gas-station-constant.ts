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

export const gasStationImportCSVColumns = [
  {name: 'cnpj', required: true, validate: isValidCNPJ, maxLength: 18},
  {name: 'nome_posto', required: true, maxLength: 150},
  {name: 'nome_fantasia', required: true, maxLength: 150},
  {name: 'bandeira', required: true, maxLength: 150},
  {name: 'logradouro', required: true, maxLength: 150},
  {name: 'numero', required: true, maxLength: 150},
  {name: 'complemento', required: false, maxLength: 150},
  {name: 'bairro', required: true, maxLength: 150},
  {name: 'municipio', required: true, maxLength: 150},
  {name: 'uf', required: true, maxLength: 2},
  {name: 'cep', required: true, validate: isValidCEP, maxLength: 10},
  {name: 'cpf_responsavel', required: true, validate: isValidCPF},
  {name: 'nome_responsavel', required: true, maxLength: 150},
  {name: 'email_responsavel', required: true, validate: isValidEmail, maxLength: 150},
  {name: 'cargo_responsavel', required: true, maxLength: 150},
  {name: 'combustiveis', required: true, validate: isValidFuelList, maxLength: 2000},
  {name: 'status', required: true, validate: isValidGasStationStatus},
  {name: 'data_inauguracao', required: true, validate: isValidDate},
  {name: 'numero_bicos', required: true, maxLength: 100},
  {name: 'numero_pistas', required: true, maxLength: 100},
  {name: 'observacoes', required: false, maxLength: 2000},
]

export const gasStationExportCSVColumnsNames = [
  'cnpj', 'nome_posto', 'nome_fantasia', 'bandeira', 'logradouro', 'numero',
  'complemento', 'bairro', 'municipio', 'uf', 'cep', 'cpf_responsavel',
  'nome_responsavel', 'email_responsavel', 'cargo_responsavel', 'combustiveis',
  'status', 'data_inauguracao', 'numero_bicos', 'numero_pistas', 'observacoes'
];