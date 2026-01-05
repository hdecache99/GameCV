import * as PIXI from 'pixi.js';

class Ciudad {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.width = 3000; // Ancho total del escenario
    this.platforms = [];
    
    this.setup();
  }
  
  setup() {
    // Crear fondo
    const background = PIXI.Sprite.from('ciudad.png');
    background.width = this.width;
    background.height = this.app.renderer.height;
    this.container.addChild(background);
    
    // Crear suelo
    const ground = PIXI.Sprite.from('suelo.png');
    ground.width = this.width;
    ground.height = 100;
    ground.y = this.app.renderer.height - 100;
    this.container.addChild(ground);
    
    // Crear plataformas interactivas (para los modales)
    this.createPlatforms();
    
    this.app.stage.addChild(this.container);
  }
  
  createPlatforms() {
    // Plataforma 1 - Sobre mí
    const platform1 = this.createPlatform(500, 400, 200, 30, 0x3498db);
    platform1.interactive = true;
    platform1.on('click', () => this.openModal('about'));
    
    // Plataforma 2 - Experiencia
    const platform2 = this.createPlatform(1000, 300, 200, 30, 0x2ecc71);
    platform2.interactive = true;
    platform2.on('click', () => this.openModal('experience'));
    
    // Plataforma 3 - Proyectos
    const platform3 = this.createPlatform(1500, 500, 200, 30, 0xe74c3c);
    platform3.interactive = true;
    platform3.on('click', () => this.openModal('projects'));
    
    // Plataforma 4 - Contacto
    const platform4 = this.createPlatform(2000, 350, 200, 30, 0xf39c12);
    platform4.interactive = true;
    platform4.on('click', () => this.openModal('contact'));
    
    this.platforms.push(platform1, platform2, platform3, platform4);
  }
  
  createPlatform(x, y, width, height, color) {
    const platform = new PIXI.Graphics();
    platform.beginFill(color);
    platform.drawRect(0, 0, width, height);
    platform.endFill();
    platform.x = x;
    platform.y = y;
    
    this.container.addChild(platform);
    return platform;
  }
  
  openModal(type) {
    // Aquí implementarías la lógica para abrir diferentes modales
    // según el tipo de plataforma
    console.log(`Abriendo modal de ${type}`);
    // Ejemplo: podrías usar un estado de React o un sistema de eventos
  }
}

export default Ciudad;