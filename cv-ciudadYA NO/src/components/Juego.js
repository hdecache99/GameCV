import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import './Juego.css';

const Juego = () => {
  const gameRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Inicialización de PixiJS v8
    const app = new PIXI.Application({
      resizeTo: window, // Esto reemplaza el manejo manual de resize
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    // Asegurarse de que el canvas se añade correctamente
    gameRef.current.appendChild(app.canvas);
    appRef.current = app;

    // Cargar texturas antes de crear sprites
    async function loadGameAssets() {
      try {
        // Cargar imágenes (ajusta las rutas según tu estructura)
        await PIXI.Assets.load([
          { alias: 'ciudad', src: 'assets/ciudad.png' },
          { alias: 'suelo', src: 'assets/suelo.png' },
          { alias: 'jugador', src: 'assets/tile000.png' }
        ]);

        // Crear fondo
        const background = new PIXI.Sprite(PIXI.Texture.from('ciudad'));
        background.width = app.screen.width;
        background.height = app.screen.height;
        app.stage.addChild(background);

        // Crear suelo
        const ground = new PIXI.Sprite(PIXI.Texture.from('suelo'));
        ground.width = app.screen.width;
        ground.height = 100;
        ground.y = app.screen.height - 100;
        app.stage.addChild(ground);

        // Aquí puedes añadir tu lógica de juego
        // Ejemplo: crear jugador
        const player = new PIXI.Sprite(PIXI.Texture.from('jugador'));
        player.anchor.set(0.5);
        player.scale.set(0.5);
        player.x = 100;
        player.y = app.screen.height - 150;
        app.stage.addChild(player);

      } catch (error) {
        console.error('Error loading assets:', error);
      }
    }

    loadGameAssets();

    // Limpieza al desmontar
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true
        });
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={gameRef} className="game-container"></div>;
};

export default Juego;