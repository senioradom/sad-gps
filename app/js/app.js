import LeafletDrawService from './services/leaflet-draw-service';
import NotificationService from './services/notification-service';
import GPSService from './services/gps-service';
import DateTimesSelectorWidget from './widgets/DateTimesSelectorWidget';
import '@fortawesome/fontawesome-free/js/all.min';

class App {
    constructor(contractRef, basicAuth) {
        this.autosave = false;

        this.contractRef = contractRef;
        this.basicAuth = basicAuth;

        this.notificationService = new NotificationService();
        this.gpsService = new GPSService(this.contractRef, this.basicAuth);
        this.leafletDrawService = new LeafletDrawService(this.gpsService);

        this.app = document.getElementById('app');
        this.map = document.getElementById('map');

        this.resetButton = document.getElementById('reset');
        this.saveButton = document.getElementById('save');
        this.showDateWigetButton = document.getElementById('show-widget-history');

        this._initWidgets();
        this._initEvents();
    }

    // --------------------
    // Public
    // --------------------
    async init() {
        this._toggleLoadingIndicator(true);

        const response = await fetch(
            `https://gateway-pp.senioradom.com/api/3/contracts/${this.contractRef}/alert-configurations`,
            {
                headers: {
                    authorization: `Basic ${this.basicAuth}`
                },
                method: 'GET'
            }
        );

        const configurations = await response.json();

        [this.configuration] = [configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0]];

        if (!this.configuration.preference.geoJson) {
            this.configuration.preference.geoJson = `{
            'type': 'FeatureCollection',
            'features': []
        }`;
        }

        this.leafletDrawService.generateMap(this.map, this.configuration.preference.geoJson);
        this._toggleLoadingIndicator(false);
        // this._getAddress().then(r1 => console.log(r1));
        // this._getLastPosition().then(r2 => console.log(r2));
        // this._getPositions().then(r3 => console.log(r3));
    }

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------
    /*
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
    */

    // _getLastPosition() {
    //     return this.gpsService.getLastPosition();
    // }
    //
    // _getPositions() {
    //     return this.gpsService.getPositions();
    // }
    //
    // _getAddress() {
    //     return this.gpsService.getAddress();
    // }

    // eslint-disable-next-line class-methods-use-this
    _handleErrors(response) {
        if (!response.ok) {
            throw Error(response.status);
        }

        return response;
    }

    _save() {
        this._toggleLoadingIndicator(true);
        this.notificationService.notify('SAVING', 'Saving...');

        this.leafletDrawService.validateDrawings();
        this.configuration.preference.geoJson = this.leafletDrawService.exportGeoJSON();

        fetch(
            `https://gateway-pp.senioradom.com/api/3/contracts/${this.contractRef}/alert-configurations/${this.configuration.id}`,
            {
                headers: {
                    authorization: `Basic ${this.basicAuth}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(this.configuration),
                method: 'PUT'
            }
        )
            .then(this._handleErrors)
            .then(() => {
                this._toggleLoadingIndicator(false);
                this.notificationService.notify('SUCCESS', 'OK');
                this.leafletDrawService.updateInitialGeoJsonState();
            })
            .catch(() => {
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
            this.app.classList.add('app--loading');
        } else {
            this.map.classList.remove('map--loading');
            this.app.classList.remove('app--loading');
        }
    }

    _promptUserLeavingThePageWhenUnsavedChanges() {
        return;
        window.addEventListener('beforeunload', e => {
            if (this.leafletDrawService.isMapDirty()) {
                e.preventDefault();
                e.returnValue = ''; // Required by Chrome
            }
        });
    }

    _initWidgets() {
        this._initDateTimesWidget();
    }

    _initDateTimesWidget() {
        this.dateTimesSelectorWidget = new DateTimesSelectorWidget();
        this.showDateWigetButton.addEventListener('click', e => {
            document.querySelector('.widget-history__form').classList.toggle('widget-history__form--visible');
        });

        setTimeout(() => {
            console.log(this.dateTimesSelectorWidget.getStart());
            console.log(this.dateTimesSelectorWidget.getEnd());
        }, 1000);
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

export default App;