import LeafletDrawService from './services/leaflet-draw-service';
import NotificationService from './services/notification-service';
import ApiService from './services/api-service';
import WidgetDates from './widgets/WidgetDates';
import '@fortawesome/fontawesome-free/js/all.min';

class MapApp {
    constructor(api, contractRef, basicAuth) {
        this.autosave = false;

        this.notificationService = new NotificationService();
        this.apiService = new ApiService(api, contractRef, basicAuth);
        this.leafletDrawService = new LeafletDrawService(this.apiService);

        this._elements = {
            app: document.getElementById('js-app'),
            map: document.getElementById('map'),
            buttons: {
                reset: document.getElementById('reset'),
                save: document.getElementById('save')
            }
        };

        this._initWidgets();
        this._initEvents();

        this._init();
    }

    // --------------------
    // Public
    // --------------------

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------
    async _init() {
        this._toggleLoadingIndicator(true);

        this.apiService.getAlertConfigurations().then(configurations => {
            [this.configuration] = [configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0]];

            if (!this.configuration.preference.geoJson) {
                this.configuration.preference.geoJson = `{
            'type': 'FeatureCollection',
            'features': []
        }`;
            }

            this.leafletDrawService.generateMap(this._elements.map, this.configuration.preference.geoJson);
            this._toggleLoadingIndicator(false);
        });
    }

    _save() {
        this._toggleLoadingIndicator(true);
        this.notificationService.notify('SAVING', 'Saving...');

        this.leafletDrawService.validateDrawings();
        this.configuration.preference.geoJson = this.leafletDrawService.exportGeoJSON();

        this.apiService
            .saveAlertConfiguration(this.configuration)
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
            this._elements.map.classList.add('map--loading');
            this._elements.app.classList.add('app--loading');
        } else {
            this._elements.map.classList.remove('map--loading');
            this._elements.app.classList.remove('app--loading');
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
        (() => new WidgetDates())();
    }

    _initClickEvents() {
        this._elements.buttons.save.addEventListener('click', () => {
            this._save();
        });

        this._elements.buttons.reset.addEventListener('click', () => {
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

export default MapApp;
