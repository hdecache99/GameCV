import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const canvasRef = useRef();
  const audioRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [muted, setMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const keys = useRef({}); // Usamos useRef para mantener la referencia


  const cvBloques = [
  {
    label: 'Resumen',
    content: `
      <h2>Resumen Profesional</h2>
      <p>Estudiante y Desarrollador en GRUPO DCI con conocimientos en programación y metodologías ágiles.</p>
      <p>Habilidad en documentación de proyectos, desarrollo de sistemas, trabajo en equipo y resolución de problemas.</p>
    `
  },
  {
    label: 'Experiencia',
    content: `
      <h2>Experiencia Profesional</h2>
      <h3>GRUPO DCI – Project Manager & Developer</h3>
      <ul>
        <li>Gestión de documentación, análisis funcional y desarrollo con Dart y Firebase.</li>
        <li>Colaboración con stakeholders y diseño de base de datos optimizada.</li>
      </ul>
      <h3>Align Technology – CAD Designer</h3>
      <ul>
        <li>Diseño de modelos CAD 3D, documentación técnica y migración de plataformas.</li>
      </ul>
    `
  },
  {
    label: 'Educación',
    content: `
      <h2>Educación</h2>
      <ul>
        <li><strong>Universidad Fidélitas:</strong> Ingeniería en Sistemas – Dic 2025</li>
        <li><strong>VMEDU:</strong> Scrum Fundamentals Certified – Mar 2023</li>
      </ul>
    `
  },
  {
    label: 'Idiomas',
    content: `
      <h2>Idiomas</h2>
      <ul>
        <li><strong>Inglés:</strong> Intermedio alto (B2)</li>
        <li><strong>Español:</strong> Bilingüe (C2)</li>
      </ul>
    `
  },
  {
    label: 'Habilidades',
    content: `
      <h2>Habilidades Técnicas</h2>
      <ul>
        <li>Java, C#, Dart, PHP, HTML/CSS, React</li>
        <li>Firebase, MySQL, Oracle</li>
        <li>Docker, GitHub, Blazor, ASP.Net</li>
      </ul>
    `
  },
  {
    label: 'Soft Skills',
    content: `
      <h2>Soft Skills</h2>
      <ul>
        <li>Resolución de problemas</li>
        <li>Gestión del tiempo</li>
        <li>Trabajo en equipo</li>
        <li>Metodologías ágiles</li>
      </ul>
    `
  }
];

  useEffect(() => {
    // Detectar si es un dispositivo táctil
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Reproducir música
    const audio = new Audio('/assets/musica.mp3');
    audio.loop = true;
    audio.volume = 0.1;
    audio.play().catch(() => {}); // Autoplay prevention
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    const scale = Math.min(2.8, window.innerWidth / 200); // Escala responsive
    const gravity = 1;
    const groundY = height -80 * scale;
    const mapLimit = 5000;

    const player = {
      x: 150,
      y: groundY - 52 * scale,
      width: 25 * scale,
      height: 34 * scale,
      velY: 0,
      jumping: false,
      moving: false,
      speed: 1.5 * scale
    };

    let direction = 'right';

    // Eventos de teclado
    const handleKeyDown = (e) => {
      keys.current[e.code] = true;
      // Prevenir comportamiento por defecto para las teclas de juego
      if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
      if (e.code === 'Escape') setModalVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const framesLeft = [];
    const framesRight = [];

    for (let i = 0; i <= 3; i++) {
      const img = new Image();
      img.src = `/assets/tile00${i}.png`;
      framesLeft.push(img);
    }

    for (let i = 4; i <= 7; i++) {
      const img = new Image();
      img.src = `/assets/tile00${i}.png`;
      framesRight.push(img);
    }

    let frameX = 0;
    let frameTimer = 0;
    const frameInterval = 22;

    const ciudad = new Image(); ciudad.src = '/assets/ciudad.png';
    const bloqueImg = new Image(); bloqueImg.src = '/assets/bloque.png';
    const suelo = new Image(); suelo.src = '/assets/suelo.png';
    const nube = new Image(); nube.src = '/assets/nube.png';
    const arbusto = new Image(); arbusto.src = '/assets/arbusto.png';
    const farol = new Image(); farol.src = '/assets/farol.png';

const bloques = cvBloques.map((bloque, index) => ({
  x: 500 + index * 700,
  y: groundY - 100 * scale,
  label: bloque.label,
  cvContent: bloque.content,
  bounceOffset: 0,
  bounceDirection: 0
}));



    const nubes = Array.from({ length: 20 }, (_, i) => ({
      x: 300 + i * 400,
      y: 50 + Math.random() * 100
    }));

    const arbustos = Array.from({ length: 20 }, (_, i) => ({
      x: 400 + i * 250
    }));

    const faroles = [
      { x: 600 },
      { x: 1400 },
      { x: 2000 },
      { x: 2800 },
    ];

    let cameraX = 0;

    const update = () => {
      player.moving = false;

      if (keys.current['ArrowRight']) {
        player.x += player.speed;
        player.moving = true;
        direction = 'right';
      }
      if (keys.current['ArrowLeft']) {
        player.x -= player.speed;
        player.moving = true;
        direction = 'left';
      }
      if (keys.current['Space'] && !player.jumping) {
        player.velY = -17;
        player.jumping = true;
      }

      player.y += player.velY;
      player.velY += gravity;

      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.jumping = false;
      }

      if (player.x < 0) player.x = 0;
      if (player.x > mapLimit - player.width) player.x = mapLimit - player.width;

      if (player.moving) {
        frameTimer++;
        if (frameTimer >= frameInterval) {
          frameX = (frameX + 1) % 4;
          frameTimer = 0;
        }
      } else {
        frameX = 0;
      }

      const centerMargin = width / 2 - player.width / 2;
      cameraX = player.x - centerMargin;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > mapLimit - width) cameraX = mapLimit - width;

      for (let b of bloques) {
        const colision =
          player.x < b.x + 40 * scale &&
          player.x + player.width > b.x &&
          player.y + player.height >= b.y &&
          player.y < b.y + 32 * scale;

          // Animación de rebote de bloques
for (let b of bloques) {
  if (b.bounceDirection !== 0) {
    b.bounceOffset += b.bounceDirection * 2 * scale;
    if (b.bounceOffset <= -10 * scale) {
      b.bounceDirection = 1; // ahora hacia abajo
    }
    if (b.bounceOffset > 0) {
      b.bounceOffset = 0;
      b.bounceDirection = 0;
    }
  }
}


if (colision && b.bounceOffset === 0) {
  b.bounceDirection = -5; // inicia animación de rebote

  // Retrasa el modal 1 segundo después del rebote
  setTimeout(() => {
    setModalContent(b.cvContent || `<p>Contenido no disponible.</p>`);
    setModalVisible(true);
  }, 500); // 1000 ms = 1 segundo
}



      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const fondoWidth = ciudad.width || 800;
      for (let i = -fondoWidth; i < mapLimit; i += fondoWidth) {
        const posX = i - (cameraX * -0.1 % fondoWidth);
        ctx.drawImage(ciudad, posX, 0, fondoWidth * 1, height);
      }

      for (let nubeObj of nubes) {
        const nubeX = nubeObj.x - cameraX * 0.1;
        ctx.drawImage(nube, nubeX, nubeObj.y, 100 * scale, 40 * scale);
      }

      for (let i = 0; i < mapLimit; i += 32 * scale) {
        ctx.drawImage(suelo, i - cameraX, groundY, 80 * scale, 80 * scale);
      }

      for (let arb of arbustos) {
        ctx.drawImage(arbusto, arb.x - cameraX, groundY - 112 * scale, 175 * scale, 175 * scale);
      }

      for (let farolObj of faroles) {
        ctx.drawImage(farol, farolObj.x - cameraX, groundY - 141 * scale, 160 * scale, 150 * scale);
      }

      for (let b of bloques) {
        ctx.drawImage(bloqueImg, b.x - cameraX, b.y + b.bounceOffset, 25 * scale, 25 * scale);

        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const textX = b.x - cameraX + 8 * scale;
        const textY = b.y + b.bounceOffset - 25;
ctx.strokeText(b.label, textX - 20, textY);
ctx.fillText(b.label, textX - 20, textY);

        ctx.strokeText(b.label, textX - 20, textY);
        ctx.fillText(b.label, textX - 20, textY);
      }

      // Personaje
      const currentFrame = direction === 'right' ? framesRight[frameX] : framesLeft[frameX];
      ctx.drawImage(currentFrame, player.x - cameraX, player.y, player.width, player.height);


    };

    const loop = () => {
      update();
      draw();
      requestAnimationFrame(loop);
    };

    loop();

    const handleResize = () => {
      window.location.reload();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setMuted(audio.muted);
    }
  };

  // Estilos para los botones móviles
  const buttonStyle = {
    width: '80px',
    height: '80px',
    fontSize: '30px',
    borderRadius: '50%',
    border: '2px solid black',
    background: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 15px'
  };

  const buttonActiveStyle = {
    ...buttonStyle,
    transform: 'scale(0.95)',
    background: 'rgba(200, 200, 200, 0.8)',
    boxShadow: '0 2px 3px rgba(0,0,0,0.4)'
  };

  const [activeButton, setActiveButton] = useState(null);

  const handleTouchStart = (key) => {
    keys.current[key] = true;
    setActiveButton(key);
    // Para el salto, solo activamos brevemente
    if (key === 'Space') {
      setTimeout(() => {
        keys.current[key] = false;
        setActiveButton(null);
      }, 20);
    }
  };

  const handleTouchEnd = (key) => {
    keys.current[key] = false;
    setActiveButton(null);
  };

  return (
    <>
      {/* HEADER ESTILIZADO */}
<div style={{
  position: 'fixed',
  top: '0px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: '16px',
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '19px',
  zIndex: 10,
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(6px)',
  width: '100%',
  maxWidth: '10000px'
}}>

<span style={{
  color: 'white',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'Arial, sans-serif',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  flexBasis: '100%'
}}>
  Emanuel Alvarado Guzmán
</span>

        <a href="mailto:emalva99guz@outlook.com" title="Email">
          <img src="/assets/email.png" alt="Email" style={{ width: 28, height: 28 }} />
        </a>
        <a href="https://github.com/hdecache99" target="_blank" title="GitHub" rel="noreferrer">
          <img src="/assets/github.png" alt="GitHub" style={{ width: 28, height: 28 }} />
        </a>
        <a href="https://www.linkedin.com/in/emanuel-isaac-alvarado-guzman-2a30b2263/" target="_blank" title="LinkedIn" rel="noreferrer">
          <img src="/assets/linkedin.png" alt="LinkedIn" style={{ width: 28, height: 28 }} />
        </a>
        <button onClick={toggleMute} title="Silenciar" style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          color: 'white',
          marginLeft: '6px'
        }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* CANVAS */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* MODAL */}
{modalVisible && (
  <div
    onClick={() => setModalVisible(false)} // ← cerrar al hacer clic en el fondo
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()} // ← evita que el clic dentro del modal cierre
      style={{
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '3px solid #333',
        borderRadius: '14px',
        fontSize: '16px',
        textAlign: 'left',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: modalContent }} />
      <p style={{
        fontSize: '13px',
        color: '#555',
        marginTop: '16px',
        textAlign: 'end'
      }}>
        (Presiona <strong>ESC</strong> o toca fuera para cerrar)
      </p>
    </div>
  </div>
)}



      
      {/* CONTROLES MÓVILES - Solo en dispositivos táctiles */}
      {isTouchDevice && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10,
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '50px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <button
            onTouchStart={() => handleTouchStart('ArrowLeft')}
            onTouchEnd={() => handleTouchEnd('ArrowLeft')}
            onMouseDown={() => handleTouchStart('ArrowLeft')}
            onMouseUp={() => handleTouchEnd('ArrowLeft')}
            onMouseLeave={() => handleTouchEnd('ArrowLeft')}
            style={activeButton === 'ArrowLeft' ? buttonActiveStyle : buttonStyle}
          >
            ⬅️
          </button>
          <button
            onTouchStart={() => handleTouchStart('Space')}
            onTouchEnd={() => handleTouchEnd('Space')}
            onMouseDown={() => handleTouchStart('Space')}
            onMouseUp={() => handleTouchEnd('Space')}
            style={activeButton === 'Space' ? buttonActiveStyle : buttonStyle}
          >
            ⬆️
          </button>
          <button
            onTouchStart={() => handleTouchStart('ArrowRight')}
            onTouchEnd={() => handleTouchEnd('ArrowRight')}
            onMouseDown={() => handleTouchStart('ArrowRight')}
            onMouseUp={() => handleTouchEnd('ArrowRight')}
            onMouseLeave={() => handleTouchEnd('ArrowRight')}
            style={activeButton === 'ArrowRight' ? buttonActiveStyle : buttonStyle}
          >
            ➡️
          </button>
        </div>
      )}
    </>
  );
};

export default App;