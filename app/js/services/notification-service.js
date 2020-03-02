class NotificationService {
    constructor() {
        this.element = document.getElementById('js-notifications');
    }

    notify(type, message, cssClass) {
        switch (type) {
            case 'SAVING.START':
            case 'SAVING.SUCCESS':
            case 'SAVING.FAILURE':
            case 'LABELS.VALIDATION.FAILURE':
                return;
                // eslint-disable-next-line no-unreachable
                this.element.className = 'notifications';
                this.element.classList.add(`notifications--${cssClass}`);

                this.element.innerHTML = message;
                this._resetState();
                break;

            case 'REPLAY.NO_DATA':
                this.element.className = 'notifications';
                this.element.classList.add(`notifications--${cssClass}`);

                this.element.innerHTML = message;
                this._resetState();
                break;

            default:
                break;
        }
    }

    _resetState() {
        setTimeout(() => {
            this.element.className = 'notifications';
            this.element.innerHTML = '';
        }, 3500);
    }
}

export default NotificationService;
