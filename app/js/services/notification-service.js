class NotificationService {
    constructor() {
        this.element = document.getElementById('js-notifications');
    }

    notify(type, message) {
        switch (type) {
            case 'SAVING':
                this.element.className = 'notifications';
                this.element.classList.add('notifications--saving');

                this.element.innerHTML = message;
                break;

            case 'SUCCESS':
                this.element.className = 'notifications';
                this.element.classList.add('notifications--success');

                this.element.innerHTML = message;
                this._resetState();
                break;

            case 'FAILURE':
                this.element.className = 'notifications';
                this.element.classList.add('notifications--failure');

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
        }, 2000);
    }
}

export default NotificationService;
