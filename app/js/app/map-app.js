import MapService from '../services/map-service';
import NotificationService from '../services/notification-service';
import ApiService from '../services/api-service';
import WidgetDates from '../widgets/widget-dates';
import '@fortawesome/fontawesome-free/js/all.min';

class MapApp {
    _autoSave = false;

    _elements = {
        app: document.getElementById('js-map-app'),
        map: document.getElementById('js-map'),
        buttons: {
            reset: document.getElementById('js-map-app__button-reset'),
            save: document.getElementById('js-map-app__button-save')
        }
    };

    constructor(api, contractRef, basicAuth) {
        this._apiService = new ApiService(api, contractRef, basicAuth);
        this._notificationService = new NotificationService();

        this._mapService = new MapService(this._apiService, this._notificationService);

        this._init();
    }

    async _init() {
        this._initWidgets();
        this._initEvents();

        this._toggleLoadingIndicator(true);

        this._apiService.getAlertConfigurations().then(configurations => {
            [this.configuration] = [configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0]];

            if (!this.configuration.preference.geoJson) {
                this.configuration.preference.geoJson = `{
                    'type': 'FeatureCollection',
                    'features': []
                }`;
            }

            this._mapService.generateMap(this._elements.map, this.configuration.preference.geoJson);
            this._toggleLoadingIndicator(false);
        });
    }

    _save() {
        this._toggleLoadingIndicator(true);
        this._notificationService.notify('SAVING', 'Saving...');

        this._mapService.validateDrawings();
        this.configuration.preference.geoJson = this._mapService.exportGeoJSON();

        this._apiService
            .saveAlertConfiguration(this.configuration)
            .then(() => {
                this._toggleLoadingIndicator(false);
                this._notificationService.notify('SUCCESS', 'OK');
                this._mapService.updateInitialGeoJsonState();
            })
            .catch(() => {
                this._toggleLoadingIndicator(false);
                this._notificationService.notify('FAILURE', 'NOT');
            });
    }

    // --
    // Events handler
    // --------------------
    _toggleLoadingIndicator(isLoading) {
        if (isLoading) {
            this._elements.app.classList.add('map-app--loading');
            this._elements.map.classList.add('map--loading');
        } else {
            this._elements.app.classList.remove('map-app--loading');
            this._elements.map.classList.remove('map--loading');
        }
    }

    _promptUserLeavingThePageWhenUnsavedChanges() {
        return;
        window.addEventListener('beforeunload', e => {
            if (this._mapService.isMapDirty()) {
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
            this._mapService.resetMap();
            this._save();
        });
    }

    _initEvents() {
        this._initClickEvents();
        this._promptUserLeavingThePageWhenUnsavedChanges();

        if (this._autoSave) {
            document.addEventListener('mapEdited', () => this._save());
        } else {
            console.log('[info]: Autosave disabled...');
        }
    }
}

export default MapApp;
