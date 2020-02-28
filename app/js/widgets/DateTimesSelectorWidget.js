import rome from 'rome';
import moment from 'moment';

class DateTimesSelectorWidget {
    constructor() {
        this._startElement = document.getElementById('history-playback-start');
        this._endElement = document.getElementById('history-playback-end');

        this._init();
    }

    _init() {
        this.start = rome(this._startElement, {
            weekStart: 1,
            dateValidator: rome.val.beforeEq(this._endElement),
            initialValue: moment().subtract(1, 'months'),
            min: moment().subtract(6, 'months'),
            max: moment()
        });

        this.end = rome(this._endElement, {
            weekStart: 1,
            dateValidator: rome.val.afterEq(this._startElement),
            initialValue: moment(),
            min: moment().subtract(6, 'months'),
            max: moment()
        });
    }

    getStart() {
        return this.start.getDate();
    }

    getEnd() {
        return this.end.getDate();
    }
}

export default DateTimesSelectorWidget;
