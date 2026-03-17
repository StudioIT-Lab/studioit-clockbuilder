# StudioIT Clock Builder

[![License](https://img.shields.io/npm/l/studioit-clockbuilder)](https://github.com/StudioIT-Lab/studioit-clockbuilder/blob/main/LICENSE)

A customizable, JavaScript clock library to create your own analog clocks.



## Features
- Fully customizable clock faces and hands (SVG or images)
- Different motion styles
- Adjustable FPS per clock
- Responsive to container size
- Easy to use with modern JavaScript (ES modules)


## Installation

Using npm:

```bash
npm install studioit-clockbuilder
```

## Usage

```js
import { studioitClockBuilder } from 'studioit-clockbuilder';

/** Store a clock style */
await studioitClockBuilder.storeClockStyle('studioitdefault', {
  face: './watchface.svg',
  hourHand: './hourhand.svg',
  minuteHand: './minutehand.svg',
  secondHand: './secondhand.svg'
});

/** Create a clock in a container */
const container = document.querySelector('#container');
const clock = new studioitClockBuilder(container)
    .setClockStyle('studioitdefault')
    .motionStyle('smooth')
    .start();
```

## Disclaimer

This software is provided "as is", without warranty of any kind, express or implied.  
Use at your own risk. The author is not responsible for any damages, losses, or legal issues arising from its use.

## License

Apache 2.0