import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Game = ({ cvBloques }) => {
    const canvasRef = useRef();
    const audioRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [muted, setMuted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const keys = useRef({});
    const floatingItems = useRef([]);
    const [modalOrigin, setModalOrigin] = useState({ x: '50%', y: '50%' });

    const navigate = useNavigate();

    /* 
     * Constantes de física global
     */
    const FRICTION = 0.85;

    // AUDIO & RESIZE LOGIC
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        const audio = new Audio('/assets/musica.mp3');
        audio.loop = true;
        audio.volume = 0.1;
        audio.play().catch(() => { });
        audioRef.current = audio;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // GAME LOOP LOGIC
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Guard clause
        const ctx = canvas.getContext('2d');

        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';

        // SCALING LOGIC
        const isMobile = width < 768;
        const scale = isMobile ? Math.max(0.5, width / 190) : Math.min(2.0, Math.max(1.0, width / 40));

        const gravity = 1;
        const groundY = height - 80 * scale;
        const mapLimit = 5000;

        const player = {
            x: 100 * scale,
            y: groundY - 52 * scale,
            width: 25 * scale,
            height: 34 * scale,
            velY: 0,
            velX: 0,
            jumping: false,
            moving: false,
            speed: 3 * scale,
            acceleration: 0.4 * scale
        };

        let direction = 'right';

        const handleKeyDown = (e) => {
            keys.current[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
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
            bounceVel: 0,
            isBouncing: false
        }));

        const nubes = Array.from({ length: 50 }, (_, i) => ({
            x: 181 + i * 310,
            y: -80 + Math.random() * 200
        }));

        const arbustos = Array.from({ length: 20 }, (_, i) => ({
            x: 100 + i * 270
        }));

        const faroles = [{ x: 600 }, { x: 1400 }, { x: 2000 }, { x: 2800 }];

        let cameraX = 0;
        let lastTime = 0;

        const update = (dt) => {
            const targetFPS = 60;
            const timeFactor = dt * targetFPS;

            for (let i = floatingItems.current.length - 1; i >= 0; i--) {
                const item = floatingItems.current[i];
                item.y -= 2 * timeFactor;
                item.opacity -= 0.02 * timeFactor;
                if (item.opacity <= 0) floatingItems.current.splice(i, 1);
            }

            player.moving = false;

            if (keys.current['ArrowRight']) {
                player.velX += player.acceleration * timeFactor;
                direction = 'right';
                player.moving = true;
            }
            if (keys.current['ArrowLeft']) {
                player.velX -= player.acceleration * timeFactor;
                direction = 'left';
                player.moving = true;
            }

            if (!player.moving) {
                player.velX *= Math.pow(FRICTION, timeFactor);
                if (Math.abs(player.velX) < 0.1) player.velX = 0;
            } else {
                if (player.velX > player.speed) player.velX = player.speed;
                if (player.velX < -player.speed) player.velX = -player.speed;
            }

            if (keys.current['Space'] && !player.jumping) {
                player.velY = -14 * (isMobile ? 1.2 : 1);
                player.jumping = true;
            }

            player.x += player.velX * timeFactor;
            player.y += player.velY * timeFactor;
            player.velY += gravity * timeFactor;

            if (player.y >= groundY - player.height) {
                player.y = groundY - player.height;
                player.jumping = false;
            }

            if (player.x < 0) {
                player.x = 0;
                player.velX = 0;
            }
            if (player.x > mapLimit - player.width) {
                player.x = mapLimit - player.width;
                player.velX = 0;
            }

            if (Math.abs(player.velX) > 0.1) {
                frameTimer += timeFactor;
                if (frameTimer >= frameInterval) {
                    frameX = (frameX + 1) % 4;
                    frameTimer = 0;
                }
            } else {
                frameX = 0;
                player.moving = false;
            }

            const centerMargin = width / 2 - player.width / 2;
            cameraX = player.x - centerMargin;
            if (cameraX < 0) cameraX = 0;
            if (cameraX > mapLimit - width) cameraX = mapLimit - width;

            for (let b of bloques) {
                if (b.isBouncing) {
                    const tension = 0.15;
                    const dampening = 0.9;
                    const target = 0;
                    const force = (target - b.bounceOffset) * tension;
                    b.bounceVel += force;
                    b.bounceVel *= dampening;
                    b.bounceOffset += b.bounceVel;
                    if (Math.abs(b.bounceOffset) < 0.1 && Math.abs(b.bounceVel) < 0.1) {
                        b.bounceOffset = 0;
                        b.bounceVel = 0;
                        b.isBouncing = false;
                    }
                }

                const colision =
                    player.x < b.x + 40 * scale &&
                    player.x + player.width > b.x &&
                    player.y + player.height >= b.y &&
                    player.y < b.y + 32 * scale;

                const now = Date.now();
                const hitBlock = colision && player.velY < 0 && (!b.lastHitTime || now - b.lastHitTime > 1000);

                if (hitBlock) {
                    b.isBouncing = true;
                    b.bounceVel = -12;
                    b.lastHitTime = now;

                    // Play hit sound
                    const hitAudio = new Audio('/assets/hit.mp3');
                    hitAudio.volume = 0.4;
                    hitAudio.play().catch(e => console.log("Audio play failed", e));

                    const blockW = 25 * scale;
                    floatingItems.current.push({
                        x: b.x + blockW / 2,
                        y: b.y,
                        label: '📄',
                        opacity: 1
                    });

                    const screenX = b.x - cameraX + blockW / 2;
                    const screenY = b.y;
                    setModalOrigin({ x: `${screenX}px`, y: `${screenY}px` });

                    setTimeout(() => {
                        setModalContent(b.cvContent || `<p>Contenido no disponible.</p>`);
                        setModalVisible(true);
                    }, 300);
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
                const nubeX = nubeObj.x - cameraX * 0.15;
                ctx.drawImage(nube, nubeX, nubeObj.y, 180 * scale, 150 * scale);
            }
            for (let i = 0; i < mapLimit; i += 32 * scale) {
                ctx.drawImage(suelo, i - cameraX, groundY, 80 * scale, 80 * scale);
            }
            for (let arb of arbustos) {
                ctx.drawImage(arbusto, arb.x - cameraX, groundY - 115 * scale, 175 * scale, 175 * scale);
            }
            for (let farolObj of faroles) {
                ctx.drawImage(farol, farolObj.x - cameraX, groundY - 139 * scale, 160 * scale, 150 * scale);
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
            }
            for (const item of floatingItems.current) {
                ctx.save();
                ctx.globalAlpha = item.opacity;
                ctx.font = `${30 * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(item.label, item.x - cameraX, item.y);
                ctx.restore();
            }
            const currentFrame = direction === 'right' ? framesRight[frameX] : framesLeft[frameX];
            ctx.drawImage(currentFrame, player.x - cameraX, player.y, player.width, player.height);
        };

        const loop = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            const safeDt = Math.min(deltaTime, 0.1);
            update(safeDt);
            draw();
            requestAnimationFrame(loop);
        };

        const animId = requestAnimationFrame(loop);

        const handleResize = () => {
            // Optional: Debounce or just reload
            window.location.reload();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Run once on mount

    const toggleMute = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !audio.muted;
            setMuted(audio.muted);
        }
    };

    // Joystick & Jump Logic
    const [joystick, setJoystick] = useState({ active: false, dx: 0, dy: 0 });
    const RADIUS = 40;
    const joystickRef = useRef(null);

    const updateJoystick = (clientX, clientY) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > RADIUS) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * RADIUS;
            dy = Math.sin(angle) * RADIUS;
        }
        setJoystick({ active: true, dx, dy });
        if (dx > 10) {
            keys.current['ArrowRight'] = true;
            keys.current['ArrowLeft'] = false;
        } else if (dx < -10) {
            keys.current['ArrowRight'] = false;
            keys.current['ArrowLeft'] = true;
        } else {
            keys.current['ArrowRight'] = false;
            keys.current['ArrowLeft'] = false;
        }
    };

    const onTouchStartJoy = (e) => updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMoveJoy = (e) => updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEndJoy = () => {
        setJoystick({ active: false, dx: 0, dy: 0 });
        keys.current['ArrowRight'] = false;
        keys.current['ArrowLeft'] = false;
    };
    const onMouseDownJoy = (e) => {
        setJoystick(prev => ({ ...prev, active: true }));
        updateJoystick(e.clientX, e.clientY);
    };
    useEffect(() => {
        const handleWinMouseMove = (e) => {
            if (joystick.active && !isTouchDevice) updateJoystick(e.clientX, e.clientY);
        };
        const handleWinMouseUp = () => {
            if (joystick.active && !isTouchDevice) {
                setJoystick({ active: false, dx: 0, dy: 0 });
                keys.current['ArrowRight'] = false;
                keys.current['ArrowLeft'] = false;
            }
        };
        window.addEventListener('mousemove', handleWinMouseMove);
        window.addEventListener('mouseup', handleWinMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleWinMouseMove);
            window.removeEventListener('mouseup', handleWinMouseUp);
        };
    }, [joystick.active, isTouchDevice]);

    const handleJumpStart = () => { keys.current['Space'] = true; };
    const handleJumpEnd = () => { keys.current['Space'] = false; };

    return (
        <>
            {/* HEADER */}
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
                <span className="header-title pixel-font" style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    textShadow: '2px 2px 0 #000',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    flexBasis: '100%',
                    marginBottom: '10px'
                }}>
                    Emanuel Alvarado Guzmán
                </span>
                <a href="mailto:emalva99guz@outlook.com"><img src="/assets/email.png" alt="Email" style={{ width: 28, height: 28 }} /></a>
                <a href="https://github.com/hdecache99" target="_blank" rel="noreferrer"><img src="/assets/github.png" alt="GitHub" style={{ width: 28, height: 28 }} /></a>
                <a href="https://www.linkedin.com/in/emanuel-isaac-alvarado-guzman-2a30b2263/" target="_blank" rel="noreferrer"><img src="/assets/linkedin.png" alt="LinkedIn" style={{ width: 28, height: 28 }} /></a>

                <button onClick={toggleMute} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '22px',
                    color: 'white',
                    marginLeft: '6px'
                }}>
                    {muted ? '🔇' : '🔊'}
                </button>

                <button onClick={() => navigate('/resumen')} style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s, background 0.2s',
                    marginLeft: '10px',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(4px)'
                }}>
                    Ver Resumen
                </button>

                <a href="/cv.pdf" download="CV_Emanuel_Alvarado.pdf" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s, background 0.2s',
                    marginLeft: '10px',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(4px)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    Descargar CV
                </a>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
        @keyframes expandFromBlock { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
        .modal-origin-animate { animation: expandFromBlock 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #222; }
        ::-webkit-scrollbar-thumb { background: #0f0; border: 2px solid #222; }
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        @media (max-width: 768px) {
          .modal-content { width: 95% !important; padding: 20px !important; font-size: 14px !important; }
          .header-title { font-size: 10px !important; }
        }
      `}</style>

            {/* GAME CANVAS */}
            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* MODAL (Game info) */}
            {modalVisible && (
                <div onClick={() => setModalVisible(false)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div className="modal-origin-animate" onClick={(e) => e.stopPropagation()} style={{
                        transformOrigin: `${modalOrigin.x} ${modalOrigin.y}`,
                        width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
                        padding: '40px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)', color: '#333', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                        lineHeight: '1.8'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: modalContent }} />
                        <button onClick={() => setModalVisible(false)} style={{
                            marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', float: 'right', fontWeight: 'bold'
                        }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* JOYSTICK CONTROLS */}
            {isTouchDevice && (
                <>
                    <div ref={joystickRef} onTouchStart={onTouchStartJoy} onTouchMove={onTouchMoveJoy} onTouchEnd={onTouchEndJoy} onMouseDown={onMouseDownJoy}
                        style={{
                            position: 'fixed', bottom: '50px', left: '40px', width: '120px', height: '120px',
                            background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(4px)', touchAction: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                        <div style={{
                            width: '60px', height: '60px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transform: `translate(${joystick.dx}px, ${joystick.dy}px)`, pointerEvents: 'none'
                        }} />
                    </div>
                    <div onTouchStart={handleJumpStart} onTouchEnd={handleJumpEnd} onMouseDown={handleJumpStart} onMouseUp={handleJumpEnd}
                        style={{
                            position: 'fixed', bottom: '60px', right: '40px', width: '100px', height: '100px', borderRadius: '50%',
                            background: 'rgba(255, 60, 60, 0.8)', border: '4px solid white', boxShadow: '0 6px 15px rgba(0,0,0,0.4)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', color: 'white',
                            fontWeight: 'bold', zIndex: 9999, touchAction: 'none', cursor: 'pointer', fontFamily: "'Press Start 2P', cursive",
                            textShadow: '2px 2px 0 #000'
                        }}>
                        JUMP
                    </div>
                </>
            )}
            {/* CONTROLS INFO BOX (Desktop Only) */}
            {!isTouchDevice && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    pointerEvents: 'none', // Allow clicks to pass through if necessary
                    userSelect: 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#ECC94B' }}>← →</span>
                        <span>Moverse</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#ECC94B' }}>Espacio</span>
                        <span>Saltar</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontWeight: 'bold', color: '#ECC94B' }}>'Ver Resumen'</span>
                        <span>Vista General</span>
                    </div>

                </div>
            )}
        </>
    );
};

export default Game;
