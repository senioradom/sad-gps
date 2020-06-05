class ApiService {
    constructor(api, contractRef, basicAuth) {
        this.api = api;
        this.contractRef = contractRef;
        this.basicAuth = basicAuth;
    }

    // --------------------
    // Alerts configuration
    // --------------------
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
        const hasId = configuration.hasOwnProperty('id');
        const httpMethod = hasId ? 'PUT' : 'POST';
        const url = `${this.api}/api/3/contracts/${this.contractRef}/alert-configurations${
            hasId ? `/${configuration.id}` : ''
        }`;

        return fetch(url, {
            headers: {
                authorization: `Basic ${this.basicAuth}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify(configuration),
            method: httpMethod
        }).then(this._handleErrors);
    }

    // --------------------
    // GPS Positions
    // --------------------
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

    getPositions(start, end) {
        return fetch(
            `${this.api}/api/4/contracts/${this.contractRef}/actimetry/gps-positions?start=${start}&end=${end}`,
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

    // --------------------
    // Search addresses
    // --------------------
    getAddress(address) {
        return fetch(`${this.api}/api/3/address?query=${encodeURIComponent(address)}`, {
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

    // --------------------
    // Error handler
    // --------------------
    _handleErrors(response) {
        if (!response.ok) {
            throw Error(response.status);
        }

        return response;
    }
}

export default ApiService;
