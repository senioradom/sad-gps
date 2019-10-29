import LeafletDrawService from './leaflet-draw-service';

class ContractAlertConfigurationGps {

    constructor(contractRef, basicAuth) {
        this.contractRef = contractRef;
        this.basicAuth = basicAuth;

        this.leafletDrawService = new LeafletDrawService();
        this.htmlElement = document.getElementById('map');

        document.addEventListener('mapEdited', () => this.save());
    }

    async init() {
        const response = await fetch(`https://gateway-pp.senioradom.com/api/3/contracts/${this.contractRef}/alert-configurations`, {
            'headers': {
                'authorization': `Basic ${this.basicAuth}`,
            },
            'method': 'GET',
        });

        const configurations = await response.json();

        this.configuration = configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0];

        if (!this.configuration.preference.geoJson) {
            this.configuration.preference.geoJson = `{
            'type': 'FeatureCollection',
            'features': []
        }`;
        }

        this.mapPreference();
    }

    mapPreference() {
        if (this.configuration && this.configuration.preference.geoJson) {
            this.leafletDrawService.generateMap(this.htmlElement, this.configuration.preference.geoJson);
        }
    }

    zoomMapOnGPSLocation(lat, lng) {
        this.leafletDrawService.addMarker(lat, lng);
    }

    displayAddress(address) {
        return address ? address.label : '';
    }

    applyOptionSelected(event) {
        const address = event.option.value;
        this.zoomMapOnGPSLocation(address.lat, address.lng);
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.status)
        }

        return response;
    }

    save() {
        console.log('this.leafletDrawService.exportGeoJSON()');

        this.configuration.preference.geoJson = this.leafletDrawService.exportGeoJSON();

        fetch(`https://gateway-pp.senioradom.com/api/3/contracts/${this.contractRef}/alert-configurations/${this.configuration.id}`, {
            'headers': {
                'authorization': `Basic ${this.basicAuth}`,
                'content-type': 'application/json',
            },
            'body': JSON.stringify(this.configuration),
            'method': 'PUT'
        })   .then(this.handleErrors)
            .then(response => console.log('ok') )
            .catch(error => console.log(error) );
    }
}

export default ContractAlertConfigurationGps;
