import LeafletDrawService from './services/leaflet-draw-service';
import NotificationService from './services/notification-service';
import ApiService from './services/api-service';
import DatetimesSelectorWidget from './widgets/DatetimesSelectorWidget';
import '@fortawesome/fontawesome-free/js/all.min';

class MapApp {
    constructor(api, contractRef, basicAuth) {
        this.autosave = false;

        this.notificationService = new NotificationService();
        this.apiService = new ApiService(api, contractRef, basicAuth);
        this.leafletDrawService = new LeafletDrawService(this.apiService);

        this.elements = {
            app: document.getElementById('app'),
            map: document.getElementById('map'),
            buttons: {
                reset: document.getElementById('reset'),
                save: document.getElementById('save')
            },
            widgets: {
                datetime: {
                    form: document.querySelector('.widget-history__form'),
                    button: document.getElementById('show-widget-history')
                }
            }
        };

        this._initWidgets();
        this._initEvents();
    }

    // --------------------
    // Public
    // --------------------
    async init() {
        this._toggleLoadingIndicator(true);

        this.apiService.getAlertConfigurations().then(configurations => {
            [this.configuration] = [configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0]];

            if (!this.configuration.preference.geoJson) {
                this.configuration.preference.geoJson = `{
            'type': 'FeatureCollection',
            'features': []
        }`;
            }

            this.leafletDrawService.generateMap(this.elements.map, this.configuration.preference.geoJson);
            this._toggleLoadingIndicator(false);
        });
    }

    // --------------------
    // Privates
    // --------------------
    // --
    // Methods
    // --------------------

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
            this.elements.map.classList.add('map--loading');
            this.elements.app.classList.add('app--loading');
        } else {
            this.elements.map.classList.remove('map--loading');
            this.elements.app.classList.remove('app--loading');
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
        this.dateTimesSelectorWidget = new DatetimesSelectorWidget();
        this.elements.widgets.datetime.button.addEventListener('click', e => {
            this.elements.widgets.datetime.form.classList.toggle('widget-history__form--visible');
        });

        setTimeout(() => {
            console.log(this.dateTimesSelectorWidget.getStart());
            console.log(this.dateTimesSelectorWidget.getEnd());
        }, 1000);
    }

    _initClickEvents() {
        this.elements.buttons.save.addEventListener('click', () => {
            this._save();
        });

        this.elements.buttons.reset.addEventListener('click', () => {
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
