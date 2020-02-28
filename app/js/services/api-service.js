class ApiService {
    constructor(api, contractRef, basicAuth) {
        this.api = api;
        this.contractRef = contractRef;
        this.basicAuth = basicAuth;
    }

    getAlertConfigurations() {
        return fetch(`${this.api}/api/3/contracts/${this.contractRef}/alert-configurations`, {
            headers: {
                authorization: `Basic ${this.basicAuth}`
            },
            method: 'GET'
        })
            .then(response => response.json())
            .then(responseData => {
                return responseData;
            })
            .catch(error => console.warn(error));
    }

    saveAlertConfiguration(configuration) {
        return fetch(`${this.api}/api/3/contracts/${this.contractRef}/alert-configurations/${configuration.id}`, {
            headers: {
                authorization: `Basic ${this.basicAuth}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify(configuration),
            method: 'PUT'
        }).then(this._handleErrors);
    }

    getLastPosition() {
        return fetch(`${this.api}/api/4/contracts/${this.contractRef}/actimetry/gps-positions/last`, {
            headers: {
                authorization: `Basic ${this.basicAuth}`
            },
            method: 'GET'
        })
            .then(response => response.json())
            .then(responseData => {
                return responseData;
            })
            .catch(error => console.warn(error));
    }

    getPositions() {
        return fetch(
            `${this.api}/api/4/contracts/${this.contractRef}/actimetry/gps-positions?start=2020-01-24T23:00:00.000Z&end=2020-01-30T23:00:00.000Z`,
            {
                headers: {
                    authorization: `Basic ${this.basicAuth}`
                },
                method: 'GET'
            }
        )
            .then(response => response.json())
            .then(responseData => {
                return responseData;
            })
            .catch(error => console.warn(error));
    }

    getAddress() {
        return fetch(`${this.api}/api/3/address?query=5%20avenue%20garenniere`, {
            headers: {
                authorization: `Basic ${this.basicAuth}`
            },
            method: 'GET'
        })
            .then(response => response.json())
            .then(responseData => {
                return responseData;
            })
            .catch(error => console.warn(error));
    }

    _handleErrors(response) {
        if (!response.ok) {
            throw Error(response.status);
        }

        return response;
    }
}

export default ApiService;
