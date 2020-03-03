class TemplateService {
    getApplicationTemplate() {
        return `
<!-- ------------------
 Application
------------------- -->
<div class="app-map app-map--loading" id="js-app-map">

    <!-- ------------------
     Widget : DateTime picker
    ------------------- -->
    <div class="widget-dates">
        <button class="widget-dates__button" id="js-widget-dates__toggle">
            <i class="fas fa-map-marked-alt"></i>
        </button>

        <div class="widget-dates__form widget-dates__form--visible" id="js-widget-dates__form"><!-- Toggle class : widget-dates__form--visible -->
            <div class="widget-dates__input-container">
                <input id="js-widget-dates__date-start" class="widget-dates__input-date form-element">
            </div>

            <div class="widget-dates__input-container">
                <input id="js-widget-dates__date-end" class="widget-dates__input-date form-element">
            </div>

            <button class="widget-dates__button widget-dates__button--play" id="js-widget-dates__submit">
                <i class="fas fa-play"></i>
            </button>
        </div>
    </div>

    <!-- ------------------
     Edit/replay toggle
    ------------------- -->
    <div class="close-replay close-replay--hidden" id="js-close-replay">
        <button class="close-replay__button" id="js-close-replay__button">
            <i class="fas fa-times"></i>
        </button>
    </div>

    <!-- ------------------
    Map
    ------------------- -->
    <div class="map map--loading" id="js-map" data-map-mode="GPS-ALERTS-CONFIGURATION-MODE" data-history-loaded="false">
        <div class="map__loading-overlay"></div>
    </div>

    <!-- ------------------
    Buttons
    ------------------- -->
    <div class="app-map__buttons-container" id="js-app-map__buttons-container">
        <button class="app-map__button app-map__button--reset" id="js-app-map__button-reset">Annuler</button>
        <button class="app-map__button app-map__button--save" id="js-app-map__button-save">Sauvegarder</button>
    </div>

    <!-- ------------------
     Notifications
    ------------------- -->
    <div class="notifications" id="js-notifications"></div>
</div>`;
    }
}

export default TemplateService;
