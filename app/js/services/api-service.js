class ApiService {
    // • GPS Tracking
    // Last position
    // https://gateway-pp.senioradom.com/api/4/contracts/CLICK3RE/actimetry/gps-positions/last
    // https://gateway-pp.senioradom.com/api/4/contracts/CLICK3RE/actimetry/gps-positions?start=2020-01-31T23:00:00.000Z&end=2020-02-06T23:00:00.000Z

    //  • Security perimeter
    //  https://gateway-pp.senioradom.com/api/3/contracts/CLICK3RE/alert-configurations

    // • Address
    // https://gateway-pp.senioradom.com/api/3/address?query=5%20avenue%20garenniere

    constructor(contractRef, basicAuth) {
        this.contractRef = contractRef;
        this.basicAuth = basicAuth;
    }

    getLastPosition() {
        return fetch(
            `https://gateway-pp.senioradom.com/api/4/contracts/${this.contractRef}/actimetry/gps-positions/last`,
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

    getPositions() {
        return fetch(
            `https://gateway-pp.senioradom.com/api/4/contracts/${this.contractRef}/actimetry/gps-positions?start=2020-01-24T23:00:00.000Z&end=2020-01-30T23:00:00.000Z`,
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
        return fetch('https://gateway-pp.senioradom.com/api/3/address?query=5%20avenue%20garenniere', {
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
}

export default ApiService;
