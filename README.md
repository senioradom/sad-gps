# SAD GPS

## Signature / parameters
```
new AppMap(
    htmlElement,      // HTML node in which to generate the map
    api,              // API URL
    contractRef,      // Contract reference
    basicAuth,        // Basic auth password
    locale,           // Value in [fr, en, es, sk, cs, zh]
    distributorColor, // Hexadecimal color. eg : #ff0000
    isFullMode,       // Boolean : 
                      // True  : Modes : Alerts configuration / History replay
                      // False : Mode  : Dashboard tile with last position
    isDevEnvironment  // Boolean. True : Adds debug features for developers
);
```

## Modes

### Full mode
Modes :   
• Alerts configurations  
• History replay
```
<!-- HTML -->
<div class="sad-gps" id="sad-gps"></div>
```
```
// JS
new AppMap(
    '#sad-gps',
    'https://url-api.com',
    'A0000XXX',
    $basicAuthPa$$w0rd,
    'fr',
    '#ff0000',
    true, // <== isFullMode
    false
);
```

### Last position mode
This updates every 2 minutes.

```
<!-- HTML -->
<div class="sad-gps" id="sad-gps"></div>
```
```
// JS
new AppMap(
    '#sad-gps',
    'https://url-api.com',
    'A0000XXX',
    $basicAuthPa$$w0rd,
    'fr',
    '#ff0000',
    false, // <== isFullMode
    false
);
```
