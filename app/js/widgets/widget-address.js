class WidgetAddress {
    constructor(apiService, translationService, mapService) {
        this._apiService = apiService;
        this._translationService = translationService;
        this._mapService = mapService;

        this._init();
    }

    _init() {
        this._elements = {
            root: document.getElementById('js-widget-address'),
            results: {
                container: document.getElementById('js-widget-address__result')
            },
            inputs: {
                search: document.getElementById('js-widget-address__input-search'),
                submit: document.getElementById('js-widget-address__input-submit')
            }
        };

        this._initSubmitEvent();
        this._initEnterKeyAsSubmitEvent();
        this._initClickSelectedAddress();
    }

    _initSubmitEvent() {
        this._elements.inputs.submit.addEventListener('click', e => {
            this._submit();
        });
    }

    _initEnterKeyAsSubmitEvent() {
        this._elements.inputs.search.addEventListener('keyup', e => {
            if (e.keyCode === 13) {
                e.preventDefault();
                this._submit();
            }
        });
    }

    _initClickSelectedAddress() {
        this._elements.root.addEventListener('click', e => {
            if (e.target.dataset.hasOwnProperty('widgetAddress')) {
                this._mapService.zoomAtCoordinates(
                    e.target.dataset.widgetAddressGpsLat,
                    e.target.dataset.widgetAddressGpsLng
                );

                this._elements.results.container.innerHTML = '';
            }
        });
    }

    _submit() {
        this._elements.results.container.innerHTML = '';

        const inputValue = this._elements.inputs.search.value;
        if (inputValue && inputValue.length >= 3) {
            const htmlContent = [];
            this._apiService.getAddress(inputValue).then(response => {
                if (response.length) {
                    response.forEach(address => {
                        htmlContent.push(
                            `<div data-widget-address-gps-lat="${address.lat}" data-widget-address-gps-lng="${address.lng}" data-widget-address class="widget-address__result-item">${address.label}</div>`
                        );
                    });
                    this._elements.results.container.innerHTML = htmlContent.join('\n');
                } else {
                    this._elements.results.container.innerHTML = `<div class="widget-address__result-item widget-address__result-item--disabled">
                            ${this._translationService.translateString('NO_ADDRESS_FOUND')}
                        </div>`;

                    setTimeout(() => {
                        this._elements.results.container
                            .querySelector('.widget-address__result-item--disabled')
                            .remove();
                    }, 3500);
                }
            });
        }
    }
}

export default WidgetAddress;
