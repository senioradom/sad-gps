class TemplateService {
    constructor(selectedMode) {
        this._selectedModeOnMount = selectedMode;
    }

    getApplicationTemplate() {
        return `
<!-- ------------------
 Application
------------------- -->
<div class="app-map app-map--loading" id="js-app-map" data-map-mode="${this._selectedModeOnMount}">

    <!-- ------------------
     Widget : DateTime picker
    ------------------- -->
    <div class="widget-dates">
        <button class="widget-dates__button" id="js-widget-dates__toggle" data-i18n-title="VISUALIZE_THE_CLICK_LOCATION_HOURLY">
            <i class="widget-dates__icon-map fas fa-map-marked-alt"></i>
        </button>

        <div class="widget-dates__form" id="js-widget-dates__form"><!-- Toggle class : widget-dates__form--visible -->
            <div class="widget-dates__input-container">
                <input id="js-widget-dates__date-start" class="widget-dates__input-date form-element">
            </div>

            <div class="widget-dates__input-container">
                <input id="js-widget-dates__date-end" class="widget-dates__input-date form-element">
            </div>

            <button class="widget-dates__button widget-dates__button--play" id="js-widget-dates__submit">
                <i class="widget-dates__icon-play fas fa-play"></i>
            </button>
        </div>
    </div>

    <div class="close-replay close-replay--hidden" id="js-close-replay">
        <button class="close-replay__button" id="js-close-replay__button">
            <i class="close-replay__icon-close fas fa-times"></i>
        </button>
    </div>

    <!-- ------------------
     Address search
    ------------------- -->
    <div class="widget-address" id="js-widget-address"><!-- widget-address--hidden -->
        <div class="widget-address__input-search-container">
            <input class="widget-address__input-search form-element" type="text" data-i18n-placeholder="SEARCH_ADDRESS" id="js-widget-address__input-search" value="" autocomplete="off">
            <button class="widget-address__input-submit" id="js-widget-address__input-submit">
                <i class="widget-address__icon-search fas fa-search"></i>
            </button>
        </div>
        <div class="widget-address__result" id="js-widget-address__result">
            <!--
            // Dynamically generated dropdown list
            <div class="widget-address__result-item">_________</div>
            <div class="widget-address__result-item">_________</div>
            <div class="widget-address__result-item">_________</div>
            -->
        </div>
    </div>

    <!-- ------------------
    Map
    ------------------- -->
    <div class="map map--loading" id="js-map" data-history-loaded="false">
        <div class="map__loading-overlay"></div>
    </div>

    <!-- ------------------
    Buttons
    ------------------- -->
    <div class="app-map__buttons-container" id="js-app-map__buttons-container">
        <button class="app-map__button app-map__button--reset" id="js-app-map__button-reset" data-i18n-text="RESET"></button>
        <button class="app-map__button app-map__button--save" id="js-app-map__button-save" data-i18n-text="SAVE"></button>
    </div>

    <!-- ------------------
     Notifications
    ------------------- -->
    <div class="notifications" id="js-notifications"></div>
</div>`;
    }
}

export default TemplateService;
