import './node_modules/leaflet/dist/leaflet.css';
import './node_modules/leaflet-draw/dist/leaflet.draw.css';

import ContractAlertConfigurationGps from "./contract-alert-configuration-gps";

const contractAlertConfigurationGps = new ContractAlertConfigurationGps('contractRef', 'basicAuth');
contractAlertConfigurationGps.init();
