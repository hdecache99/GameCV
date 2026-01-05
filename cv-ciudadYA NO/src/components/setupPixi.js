import * as PIXI from 'pixi.js';

// Configuración global de PixiJS
PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;
PIXI.settings.PRECISION_FRAGMENT = 'highp';
PIXI.settings.ROUND_PIXELS = true;

export default PIXI;