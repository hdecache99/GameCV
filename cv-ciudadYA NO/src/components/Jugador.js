import * as PIXI from 'pixi.js';

class Jugador {
  constructor(app, ciudad) {
    this.app = app;
    this.ciudad = ciudad;
    this.sprite = new PIXI.AnimatedSprite(this.getTextures());
    this.speed = 5;
    this.jumpForce = 15;
    this.velocityY = 0;
    this.gravity = 0.5;
    this.isJumping = false;
    this.direction = 1; // 1 derecha, -1 izquierda
    
    this.setup();
  }
  
  getTextures() {
    const textures = [];
    for (let i = 0; i <= 7; i++) {
      textures.push(PIXI.Texture.from(`tile00${i}.png`));
    }
    return textures;
  }
  
  setup() {
    this.sprite.animationSpeed = 0.1;
    this.sprite.play();
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.5);
    this.sprite.x = 100;
    this.sprite.y = window.innerHeight - 150;
    
    this.app.stage.addChild(this.sprite);
    
    // Controles del teclado
    this.keys = {
      left: false,
      right: false,
      up: false
    };
    
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Agregar el jugador al game loop
    this.app.ticker.add(() => this.update());
  }
  
  handleKeyDown(e) {
    switch(e.key) {
      case 'ArrowLeft':
        this.keys.left = true;
        this.direction = -1;
        this.sprite.scale.x = -0.5;
        break;
      case 'ArrowRight':
        this.keys.right = true;
        this.direction = 1;
        this.sprite.scale.x = 0.5;
        break;
      case 'ArrowUp':
        if (!this.isJumping) {
          this.keys.up = true;
          this.velocityY = -this.jumpForce;
          this.isJumping = true;
        }
        break;
    }
  }
  
  handleKeyUp(e) {
    switch(e.key) {
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ArrowUp':
        this.keys.up = false;
        break;
    }
  }
  
  update() {
    // Movimiento horizontal
    if (this.keys.left) {
      this.sprite.x -= this.speed;
      this.moveStage(this.speed);
    }
    if (this.keys.right) {
      this.sprite.x += this.speed;
      this.moveStage(-this.speed);
    }
    
    // Gravedad y salto
    this.velocityY += this.gravity;
    this.sprite.y += this.velocityY;
    
    // Colisión con el suelo
    const groundLevel = window.innerHeight - 150;
    if (this.sprite.y > groundLevel) {
      this.sprite.y = groundLevel;
      this.velocityY = 0;
      this.isJumping = false;
    }
    
    // Colisión con plataformas
    this.checkPlatformCollision();
    
    // Mantener al jugador en pantalla
    this.keepInBounds();
  }
  
  moveStage(speed) {
    // Mover todo el escenario en dirección opuesta para simular scroll
    this.app.stage.position.x += speed;
    
    // Limitar el movimiento del escenario
    const maxLeft = 0;
    const maxRight = -(this.ciudad.width - window.innerWidth);
    
    if (this.app.stage.position.x > maxLeft) {
      this.app.stage.position.x = maxLeft;
    }
    
    if (this.app.stage.position.x < maxRight) {
      this.app.stage.position.x = maxRight;
    }
  }
  
  checkPlatformCollision() {
    // Implementar lógica de colisión con plataformas
    // Aquí puedes verificar si el jugador está sobre una plataforma
    // y detener la caída si es así
  }
  
  keepInBounds() {
    // Mantener al jugador dentro de los límites de la pantalla
    const halfWidth = this.sprite.width / 2;
    
    if (this.sprite.x < halfWidth) {
      this.sprite.x = halfWidth;
    }
    
    if (this.sprite.x > window.innerWidth - halfWidth) {
      this.sprite.x = window.innerWidth - halfWidth;
    }
  }
}

export default Jugador;