import rome from '@bevacqua/rome';
import moment from 'moment';
import 'moment/locale/fr';

class WidgetDates {
    constructor(mapService, locale) {
        this._mapService = mapService;

        if (['en', 'fr', 'es', 'sk', 'cs', 'zh'].includes(locale)) {
            moment.locale(locale);
        }

        rome.use(moment);
        this._init();
    }

    _init() {
        this._elements = {
            buttons: {
                toggle: document.getElementById('js-widget-dates__toggle'),
                submit: document.getElementById('js-widget-dates__submit')
            },
            form: {
                form: document.getElementById('js-widget-dates__form'),
                start: document.getElementById('js-widget-dates__date-start'),
                end: document.getElementById('js-widget-dates__date-end')
            }
        };

        this._initEvents();

        this._dates = {
            start: rome(this._elements.form.start, {
                weekStart: 1,
                dateValidator: rome.val.beforeEq(this._elements.form.end),
                initialValue: moment()
                    .subtract(3, 'days')
                    .startOf('day'),
                min: moment().subtract(6, 'months'),
                max: moment()
            }),
            end: rome(this._elements.form.end, {
                weekStart: 1,
                dateValidator: rome.val.afterEq(this._elements.form.start),
                initialValue: moment(),
                min: moment().subtract(6, 'months'),
                max: moment()
            })
        };
    }

    _initEvents() {
        this._elements.buttons.toggle.addEventListener('click', e => {
            this._elements.form.form.classList.toggle('widget-dates__form--visible');
        });

        this._elements.buttons.submit.addEventListener('click', e => {
            this._mapService.switchMode('GPS-HISTORY-PLAYBACK-MODE', () => {
                this._mapService.playGPSHistory(this._getStart().toISOString(), this._getEnd().toISOString());
            });
        });
    }

    _getStart() {
        return this._dates.start.getMoment();
    }

    _getEnd() {
        return this._dates.end.getMoment();
    }
}

export default WidgetDates;
