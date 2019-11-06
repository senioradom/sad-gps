class NotificationService {
    constructor() {
        this.element = document.getElementById('notifications');
    }

    notify(type, message) {
        switch (type) {
            case 'SAVING':
                this.element.className = '';
                this.element.classList.add('saving');

                this.element.innerHTML = message;
                break;

            case 'SUCCESS':
                this.element.className = '';
                this.element.classList.add('success');

                this.element.innerHTML = message;
                this._resetState();
                break;

            case 'FAILURE':
                this.element.className = '';
                this.element.classList.add('failure');

                this.element.innerHTML = message;
                this._resetState();
                break;

            default:
                break;
        }
    }

    _resetState() {
        setTimeout(() => {
            this.element.className = '';
            this.element.innerHTML = '';
        }, 2000);
    }
}

export default NotificationService;
