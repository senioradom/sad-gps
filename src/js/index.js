import Demo from './demo/demo.js';

export default class Index {
    constructor() {
        (() => new Demo())();
    }
}
