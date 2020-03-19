import AppMap from '../app/app-map';

class Demo {
    constructor() {
        this._config = {
            api: 'https://gateway-pp.senioradom.com',
            htmlElement: '#sad-gps',
            isFullMode: true, // true : GPS/History replay modes, false : Last position tile mode
            isDevEnvironment: true
        };

        this._elements = {
            username: document.getElementById('js-config-username'),
            password: document.getElementById('js-config-password'),
            contractRef: document.getElementById('js-config-contract-ref'),
            language: document.getElementById('js-config-language'),
            color: document.getElementById('js-config-color'),
            submit: document.getElementById('js-demo__submit')
        };

        this._init();
    }

    _init() {
        this._initEvents();
    }

    _startApp(contractRef, basicAuth, language, color) {
        (() =>
            new AppMap(
                this._config.htmlElement,
                this._config.api,
                contractRef,
                basicAuth,
                language,
                color,
                this._config.isFullMode,
                this._config.isDevEnvironment
            ))();
    }

    _initEvents() {
        this._elements.submit.addEventListener('click', e => {
            e.preventDefault();

            const username = this._elements.username.value;
            const password = this._elements.password.value;
            const contractRef = this._elements.contractRef.value;

            const basicAuth = btoa(`${username}:${password}`);

            const language = this._elements.language.value;
            const color = this._elements.color.value;

            if (!contractRef || !password || !username) {
                alert('Missing informations...');
            } else {
                this._startApp(contractRef, basicAuth, language, color);
            }
        });
    }
}

export default Demo;
