const path = require('path');
const fs = require('fs');

let ROOT = process.env.PWD;

if (!ROOT) {
    ROOT = process.cwd();
}

const config = () => ({
    dev_host: '0.0.0.0', // ['192.168.0.10', '0.0.0.0', 'localhost', '...']

    port: process.env.PORT || 9001,

    env: process.env.NODE_ENV,

    root: ROOT,

    paths: {
        config: 'config',
        src: 'src',
        dist: 'dist'
    },

    package: JSON.parse(fs.readFileSync(path.join(ROOT, '/package.json'), { encoding: 'utf-8' }))
});

module.exports = config();
