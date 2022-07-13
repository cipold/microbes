# Microbes
## See it in action
https://cipold.de/microbes

## Required software
* [Closure Compiler](https://developers.google.com/closure/compiler/)

## Installation
### PixiJS
Download `pixi.min.js` from
https://github.com/pixijs/pixi.js/releases

Put `pixi.min.js` file into `www`.

### Google Material Design Icons
Download fonts from
https://github.com/google/material-design-icons/tree/master/iconfont

Put required font files into `www/fonts`:

* `MaterialIcons-Regular.eot`
* `MaterialIcons-Regular.ttf`
* `MaterialIcons-Regular.woff`
* `MaterialIcons-Regular.woff2`

## Development
Use `debug.html` instead of `index.html` for development and debugging.

### Compilation
To compile `microbes.min.js` execute the following line from repository root:
```lang=bash
npx google-closure-compiler --compilation_level SIMPLE --js src/*.js --language_in ECMASCRIPT6_STRICT --language_out ECMASCRIPT5_STRICT --js_output_file www/microbes.min.js
```

## Deployment
After successful installation and compilation copy contents of `www` to a web server of your choice.

## Screenshot
![Microbes Screenshot](/screenshot.png?raw=true)