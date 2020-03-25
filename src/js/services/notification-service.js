class NotificationService {
    constructor() {
        this.element = document.getElementById('js-notifications');
        this.TIMEOUT = 3500;
    }

    notify(message, cssClass, timeout) {
        this.element.className = 'notifications';
        this.element.classList.add(`notifications--${cssClass}`);

        this.element.innerHTML = message;
        this._resetState(timeout || this.TIMEOUT);
    }

    _resetState(timeout) {
        setTimeout(() => {
            this.element.className = 'notifications';
            this.element.innerHTML = '';
        }, timeout);
    }
}

export default NotificationService;
