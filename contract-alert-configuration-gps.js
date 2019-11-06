import LeafletDrawService from './leaflet-draw-service';
import NotificationService from './notification-service';


class ContractAlertConfigurationGps {

    constructor(contractRef, basicAuth) {
        this.autosave = false;

        this.contractRef = contractRef;
        this.basicAuth = basicAuth;

        this.leafletDrawService = new LeafletDrawService();
        this.notificationService = new NotificationService();

        this.map = document.getElementById('map');

        this.resetButton = document.getElementById('reset');
        this.saveButton = document.getElementById('save');

        this._initEvents();
    }

    // --------------------
    // Public
    // --------------------
    async init() {
        this._toggleLoadingIndicator(true);

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

        this.leafletDrawService.generateMap(this.map, this.configuration.preference.geoJson);
        this._toggleLoadingIndicator(false);
    }

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------
    _zoomMapOnGPSLocation(lat, lng) {
        this.leafletDrawService.addMarker(lat, lng);
    }

    _displayAddress(address) {
        return address ? address.label : '';
    }

    _applyOptionSelected(event) {
        const address = event.option.value;
        this._zoomMapOnGPSLocation(address.lat, address.lng);
    }

    _handleErrors(response) {
        if (!response.ok) {
            throw Error(response.status)
        }

        return response;
    }

    _save() {
        this._toggleLoadingIndicator(true);
        this.notificationService.notify('SAVING', 'Saving...');

        this.configuration.preference.geoJson = this.leafletDrawService.exportGeoJSON();

        fetch(`https://gateway-pp.senioradom.com/api/3/contracts/${this.contractRef}/alert-configurations/${this.configuration.id}`, {
            'headers': {
                'authorization': `Basic ${this.basicAuth}`,
                'content-type': 'application/json',
            },
            'body': JSON.stringify(this.configuration),
            'method': 'PUT'
        }).then(this._handleErrors)
            .then(response => {
                this._toggleLoadingIndicator(false);
                this.notificationService.notify('SUCCESS', 'OK');
                this.leafletDrawService.updateInitialGeoJsonState();
            })
            .catch(error => {
                this._toggleLoadingIndicator(false);
                this.notificationService.notify('FAILURE', 'NOT');
            });
    }

    // --
    // Events handler
    // --------------------
    _toggleLoadingIndicator(isLoading) {
        if (isLoading) {
            this.map.classList.add('map--loading');
        } else {
            this.map.classList.remove('map--loading');
        }
    }

    _promptUserLeavingThePageWhenUnsavedChanges() {
        window.addEventListener('beforeunload', (e) => {
            if (this.leafletDrawService.isMapDirty()) {
                e.preventDefault();
                e.returnValue = ''; // Required by Chrome
            }
        });
    }

    _initClickEvents() {
        this.saveButton.addEventListener('click', () => {
            this._save();
        });

        this.resetButton.addEventListener('click', () => {
            this.leafletDrawService.resetMap();
            this._save();
        });
    }

    _initEvents() {
        this._initClickEvents();
        this._promptUserLeavingThePageWhenUnsavedChanges();

        if (this.autosave) {
            document.addEventListener('mapEdited', () => this._save());
        } else {
            console.log('[info]: Autosave disabled...');
        }
    }
}

export default ContractAlertConfigurationGps;
