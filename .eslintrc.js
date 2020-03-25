module.exports = {
    'extends': ['airbnb-base', 'plugin:prettier/recommended'],
    'env': {
        'browser': true,
        'node': true
    },
    overrides: [
        {
            "files": [
                "*.js"
            ],
            "rules": {
                "import/no-extraneous-dependencies": "off",
                "import/extensions": "off",
                "no-underscore-dangle": "off",
                "no-prototype-builtins": "off",
                "no-unused-vars": "off",
                "max-len": "off",
                "no-console": "off",
                "class-methods-use-this": "off",
                "no-param-reassign": "off",
                "no-alert": "off",
                "new-cap": "off"
            }
        }
    ]
};
