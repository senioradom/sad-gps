import MapService from '../services/map-service';
import NotificationService from '../services/notification-service';
import ApiService from '../services/api-service';
import WidgetDates from '../widgets/widget-dates';
import '@fortawesome/fontawesome-free/js/all.min';
import TemplateService from '../services/template-service';
import TranslationService from '../services/translation-service';
import WidgetAddress from '../widgets/widget-address';

class AppMap {
    _autoSave = false;

    _devMode = true;

    constructor(htmlElement, api, contractRef, basicAuth, locale, distributorColor) {
        document.documentElement.style.setProperty('--distributor-color', distributorColor);

        this._templateService = new TemplateService();
        document.querySelector(htmlElement).innerHTML = this._templateService.getApplicationTemplate();

        this._translationService = new TranslationService(locale);
        this._translationService.translateInterface();

        this._elements = this._initElements();

        this._apiService = new ApiService(api, contractRef, basicAuth);
        this._notificationService = new NotificationService();
        this._locale = locale;

        this._mapService = new MapService(
            this._apiService,
            this._notificationService,
            this._translationService,
            this._locale,
            distributorColor,
            this._devMode
        );

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
        if (this._devMode) {
            this._notificationService.notify(this._translationService.translateString('SAVING'), 'light');
        }

        this._mapService.validateDrawings();
        this.configuration.preference.geoJson = this._mapService.exportGeoJSON();

        this._apiService
            .saveAlertConfiguration(this.configuration)
            .then(() => {
                this._toggleLoadingIndicator(false);
                if (this._devMode) {
                    this._notificationService.notify(this._translationService.translateString('SUCCESS'), 'success');
                }
                this._mapService.updateInitialGeoJsonState();
            })
            .catch(() => {
                this._toggleLoadingIndicator(false);
                if (this._devMode) {
                    this._notificationService.notify(this._translationService.translateString('FAILURE'), 'danger');
                }
            });
    }

    // --
    // Events handler
    // --------------------
    _toggleLoadingIndicator(isLoading) {
        if (isLoading) {
            this._elements.app.classList.add('app-map--loading');
            this._elements.map.classList.add('map--loading');
        } else {
            this._elements.app.classList.remove('app-map--loading');
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
        (() => new WidgetDates(this._mapService, this._locale))();
        (() =>
            new WidgetAddress(
                this._apiService,
                this._notificationService,
                this._translationService,
                this._mapService
            ))();
    }

    _initClickEvents() {
        this._elements.buttons.save.addEventListener('click', () => {
            this._save();
        });

        this._elements.buttons.reset.addEventListener('click', () => {
            this._mapService.resetMap();
            this._save();
        });

        this._elements.buttons.closeReplay.addEventListener('click', () => {
            this._mapService.switchAlertsConfigurationToHistoryMode('GPS-ALERTS-CONFIGURATION-MODE', () => {
                this._elements.widgets.dates.classList.remove('widget-dates__form--visible');
            });
        });
    }

    _initEvents() {
        this._initClickEvents();
        this._promptUserLeavingThePageWhenUnsavedChanges();

        if (this._autoSave) {
            document.addEventListener('mapEdited', () => this._save());
        } else if (this._devMode) {
            console.log('[info]: Autosave disabled...');
        }
    }

    _initElements() {
        return {
            app: document.getElementById('js-app-map'),
            map: document.getElementById('js-map'),
            widgets: {
                dates: document.getElementById('js-widget-dates__form')
            },
            buttons: {
                closeReplay: document.getElementById('js-close-replay__button'),
                reset: document.getElementById('js-app-map__button-reset'),
                save: document.getElementById('js-app-map__button-save')
            }
        };
    }
}

export default AppMap;
