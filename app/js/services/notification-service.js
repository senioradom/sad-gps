class NotificationService {
    constructor() {
        this.element = document.getElementById('js-notifications');
    }

    notify(message, cssClass) {
        this.element.className = 'notifications';
        this.element.classList.add(`notifications--${cssClass}`);

        this.element.innerHTML = message;
        this._resetState();
    }

    _resetState() {
        setTimeout(() => {
            this.element.className = 'notifications';
            this.element.innerHTML = '';
        }, 3500);
    }
}

export default NotificationService;
