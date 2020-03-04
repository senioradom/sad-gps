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

    constructor(htmlElement, api, contractRef, basicAuth, locale, distributorColor, isDevEnvironment) {
        this._isDevEnvironment = isDevEnvironment;
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
            this._isDevEnvironment
        );

        this._init();
    }

    async _init() {
        this._initWidgets();
        this._initEvents();

        this._showLoadingIndicator(true);

        this._apiService.getAlertConfigurations().then(configurations => {
            [this.configuration] = [configurations.filter(conf => conf.alertCode === 'out_of_perimeter')[0]];

            if (!this.configuration.preference.geoJson) {
                this.configuration.preference.geoJson = `{
                    'type': 'FeatureCollection',
                    'features': []
                }`;
            }

            this._mapService.generateMap(this._elements.map, this.configuration.preference.geoJson);
            this._showLoadingIndicator(false);
        });

        if (this._isDevEnvironment) {
            document.documentElement.classList.add('env-dev');
        }

        this._checkScreenResolution();
    }

    _save() {
        this._showLoadingIndicator(true);
        if (this._isDevEnvironment) {
            this._notificationService.notify(this._translationService.translateString('SAVING'), 'light');
        }

        this._mapService.checkNumberOfCirclesAndEnableDisableNewAdditions();
        this.configuration.preference.geoJson = this._mapService.exportGeoJSON();

        this._apiService
            .saveAlertConfiguration(this.configuration)
            .then(() => {
                this._showLoadingIndicator(false);
                if (this._isDevEnvironment) {
                    this._notificationService.notify(this._translationService.translateString('SUCCESS'), 'success');
                }
                this._mapService.backupOriginalGeoJson();
            })
            .catch(() => {
                this._showLoadingIndicator(false);
                if (this._isDevEnvironment) {
                    this._notificationService.notify(this._translationService.translateString('FAILURE'), 'danger');
                }
            });
    }

    _checkScreenResolution() {
        if (this._elements.app.offsetWidth < 1081) {
            this._elements.app.classList.add('screen-size-small');
        } else {
            this._elements.app.classList.remove('screen-size-small');
        }
    }

    _showLoadingIndicator(isLoading) {
        if (isLoading) {
            this._elements.app.classList.add('app-map--loading');
            this._elements.map.classList.add('map--loading');
        } else {
            this._elements.app.classList.remove('app-map--loading');
            this._elements.map.classList.remove('map--loading');
        }
    }

    // --
    // Events handler
    // --------------------
    _promptUserLeavingThePageWhenUnsavedChanges() {
        return;
        window.addEventListener('beforeunload', e => {
            if (this._mapService._isMapFormStateDirty()) {
                e.preventDefault();
                e.returnValue = ''; // Required by Chrome
            }
        });
    }

    _initWidgets() {
        (() => new WidgetDates(this._mapService, this._locale))();
        (() => new WidgetAddress(this._apiService, this._translationService, this._mapService))();
    }

    _initClickEvents() {
        this._elements.buttons.save.addEventListener('click', () => {
            this._save();
        });

        this._elements.buttons.reset.addEventListener('click', () => {
            this._mapService.resetMapToOriginalStage();
            this._save();
        });

        this._elements.buttons.closeReplay.addEventListener('click', () => {
            this._mapService.switchMode('GPS-ALERTS-CONFIGURATION-MODE', () => {
                this._elements.widgets.dates.classList.remove('widget-dates__form--visible');
            });
        });
    }

    _initEvents() {
        this._initClickEvents();
        this._initOrientationAndWindowResizeEvents();
        this._promptUserLeavingThePageWhenUnsavedChanges();

        if (this._autoSave) {
            document.addEventListener('mapEdited', () => this._save());
        } else if (this._isDevEnvironment) {
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

    _initOrientationAndWindowResizeEvents() {
        window.addEventListener(
            'orientationchange',
            () => {
                this._checkScreenResolution();
            },
            false
        );

        window.addEventListener(
            'resize',
            () => {
                this._checkScreenResolution();
            },
            false
        );
    }
}

export default AppMap;
