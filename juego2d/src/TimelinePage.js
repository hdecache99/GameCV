import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TimelinePage = ({ data = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // --- PHYSICS ENGINE STATE ---
    // Cord Origin (Anchor Point) fixed at top right relative to the SVG
    const anchorX = 60;
    const anchorY = 0;
    const restLength = 80;

    // Movement State
    const [cord, setCord] = useState({ x: anchorX, y: restLength });
    const isDragging = useRef(false);
    const velocity = useRef({ vx: 0, vy: 0 });
    const position = useRef({ x: anchorX, y: restLength });
    const lastToggleTime = useRef(0);
    const animationRef = useRef(null);

    // Physics Constants
    const k = 0.15; // Spring stiffness
    // Higher damping = less air resistance (closer to 1.0). 
    // Lower damping = more friction.
    // 0.85 is good for a rope that settles relatively quickly but swings.
    const damping = 0.85;
    const mass = 1;
    const toggleThreshold = 250; // How far down to pull to toggle

    // PALETTES
    const lightTheme = {
        bg: '#FDFBF7',
        sidebar: '#F0F2F5',
        textDark: '#2D3748',
        textLight: '#718096',
        accent: '#6B46C1',
        accentLight: '#E9D8FD',
        cardBg: '#FFFFFF',
        shadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: 'rgba(0,0,0,0.05)',
        hover: '#EDF2F7',
        glow: 'none'
    };

    const darkTheme = {
        bg: '#0f172a',      // Slate 900
        sidebar: '#1e293b', // Slate 800
        textDark: '#F7FAFC', // Off white
        textLight: '#94A1B2', // Slate 400
        accent: '#38A169',    // Neon Green/Emerald
        accentLight: 'rgba(56, 161, 105, 0.2)',
        cardBg: 'rgba(30, 41, 59, 0.7)', // Glassmorphism dark
        shadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: 'rgba(255,255,255,0.1)',
        hover: 'rgba(255,255,255,0.05)',
        glow: '0 0 15px rgba(56, 161, 105, 0.4)'
    };

    const colors = isDarkMode ? darkTheme : lightTheme;

    // --- PHYSICS LOOP ---
    useEffect(() => {
        const updatePhysics = () => {
            if (!isDragging.current) {
                // Spring Physics: Hooke's Law
                const dx = position.current.x - anchorX;
                const dy = position.current.y - restLength; // Measure from rest length

                const ax = (-k * dx) / mass;
                const ay = (-k * dy) / mass;

                velocity.current.vx += ax;
                velocity.current.vy += ay;

                // Damping
                velocity.current.vx *= damping;
                velocity.current.vy *= damping;

                // Update Position
                position.current.x += velocity.current.vx;
                position.current.y += velocity.current.vy;

                // Stop if very slow to save resources
                if (Math.abs(velocity.current.vx) < 0.01 && Math.abs(velocity.current.vy) < 0.01 &&
                    Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                    position.current.x = anchorX;
                    position.current.y = restLength;
                    velocity.current.vx = 0;
                    velocity.current.vy = 0;
                }
            } else {
                // While dragging, velocity is zero (controlled by mouse)
                velocity.current.vx = 0;
                velocity.current.vy = 0;
            }

            setCord({ ...position.current });
            animationRef.current = requestAnimationFrame(updatePhysics);
        };

        animationRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    // --- MOUSE HANDLERS ---
    const startDrag = (e) => {
        isDragging.current = true;
        // Prevent text selection
        e.preventDefault();
    };

    const onDrag = (e) => {
        if (!isDragging.current) return;

        // We calculate mouse position relative to the SVG's coordinate system.
        // The SVG is fixed top-right: top 0, right 20px. 
        // SVG width is 120px. Anchor is at x=60 (center of SVG).
        // So the anchor is physically at window.innerWidth - 20px - 60px = window.innerWidth - 80px.

        const winWidth = window.innerWidth;
        const anchorScreenX = winWidth - 80; // The screen X coordinate of the anchor

        // Touch or Mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Calculate delta from anchor
        const dx = clientX - anchorScreenX;
        const dy = clientY; // Anchor is at top (0)

        // Map back to SVG coordinates (Anchor is 60,0)
        position.current.x = 60 + dx;
        position.current.y = Math.max(0, dy); // Don't pull above ceiling

        // CHECK TOGGLE THRESHOLD
        if (position.current.y > toggleThreshold) {
            const now = Date.now();
            if (now - lastToggleTime.current > 1000) { // Debounce 1s
                setIsDarkMode(prev => !prev);
                lastToggleTime.current = now;
                // Optional: Haptic feedback
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }
    };

    const endDrag = () => {
        isDragging.current = false;
        // The Velocity starts at 0, but spring force will immediately accelerate it up
    };

    // Attach global listeners for drag outside the SVG
    useEffect(() => {
        const handleWinMove = (e) => onDrag(e);
        const handleWinUp = () => endDrag();

        window.addEventListener('mousemove', handleWinMove);
        window.addEventListener('mouseup', handleWinUp);
        window.addEventListener('touchmove', handleWinMove, { passive: false });
        window.addEventListener('touchend', handleWinUp);

        return () => {
            window.removeEventListener('mousemove', handleWinMove);
            window.removeEventListener('mouseup', handleWinUp);
            window.removeEventListener('touchmove', handleWinMove);
            window.removeEventListener('touchend', handleWinUp);
        };
    }, []);

    return (
        <div className={isDarkMode ? 'dark-theme' : ''} style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            backgroundColor: colors.bg,
            height: '100vh', /* Fixed full height */
            display: 'flex',
            flexDirection: 'column',
            color: colors.textDark,
            transition: 'background-color 0.4s ease, color 0.4s ease',
            position: 'relative',
            overflow: 'hidden' /* No body scroll */
        }}>

            {/* --- SVG VECTOR ROPE --- */}
            <svg
                width="120"
                height="800"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 20,
                    zIndex: 2000,
                    pointerEvents: 'none',
                    overflow: 'visible'
                }}
            >
                <line
                    x1={anchorX} y1={anchorY}
                    x2={cord.x} y2={cord.y}
                    stroke={isDarkMode ? '#555' : '#BBB'}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <g
                    transform={`translate(${cord.x}, ${cord.y})`}
                    style={{ cursor: 'grab', pointerEvents: 'auto' }}
                    onMouseDown={startDrag}
                    onTouchStart={startDrag}
                >
                    <rect
                        x="-10" y="0"
                        width="20" height="30"
                        rx="5"
                        fill={isDarkMode ? '#38A169' : '#ECC94B'}
                        stroke={isDarkMode ? '#22543D' : '#D69E2E'}
                        strokeWidth="2"
                    />
                    <line x1="-5" y1="10" x2="5" y2="10" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                    <line x1="-5" y1="18" x2="5" y2="18" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                    {isDarkMode && (
                        <circle cx="0" cy="15" r="20" fill="url(#glowGradient)" opacity="0.6" style={{ pointerEvents: 'none' }} />
                    )}
                </g>
                <defs>
                    <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#38A169" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#38A169" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>

            {/* --- HEADER --- */}
            <header style={{
                padding: '0 40px',
                height: '70px', /* Fixed height */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                flexShrink: 0, /* Don't shrink */
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'transparent',
                        color: colors.textDark,
                        border: `1px solid ${colors.textLight}`,
                        borderRadius: '20px',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.textDark; e.currentTarget.style.color = isDarkMode ? colors.bg : '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textDark; }}
                >
                    ← Volver al Juego
                </button>

                <div style={{ marginRight: '80px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '-0.5px', transition: 'color 0.4s' }}>
                        EXPEDIENTE
                    </div>
                </div>
            </header>

            {/* --- MAIN SPLIT LAYOUT --- */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden', /* Internal scroll only */
                position: 'relative'
            }}>

                {/* 1. SIDEBAR (Fixed Width) */}
                <aside style={{
                    width: '320px',
                    padding: '40px 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    borderRight: `1px solid ${colors.border}`,
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255,255,255,0.5)',
                    overflowY: 'auto'
                }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '28px', margin: 0, letterSpacing: '-1px' }}>Emanuel<br />Alvarado</h2>
                        <span style={{ color: colors.textLight, fontSize: '15px', marginTop: '5px', display: 'block' }}>Full Stack Developer</span>
                    </div>

                    {data.map((bloque, idx) => {
                        const isActive = activeTab === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                style={{
                                    textAlign: 'left',
                                    padding: '16px 24px',
                                    borderRadius: '16px',
                                    border: isActive && isDarkMode ? `1px solid ${colors.accent}` : '1px solid transparent',
                                    background: isActive ? (isDarkMode ? 'rgba(56, 161, 105, 0.1)' : '#fff') : 'transparent',
                                    color: isActive ? colors.accent : colors.textLight,
                                    fontSize: '16px',
                                    fontWeight: isActive ? '700' : '500',
                                    cursor: 'pointer',
                                    boxShadow: isActive ? (isDarkMode ? colors.shadow : '0 2px 10px rgba(0,0,0,0.03)') : 'none',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    textShadow: isActive && isDarkMode ? `0 0 10px ${colors.accent}` : 'none'
                                }}
                            >
                                {bloque.label}
                                {isActive && (
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: colors.accent,
                                        boxShadow: isDarkMode ? `0 0 10px ${colors.accent}` : 'none'
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* 2. CONTENT AREA (Flex Grow + Scroll) */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '60px 80px',
                    position: 'relative',
                    zIndex: 1,
                    /* Custom Scrollbar styling handled in global or via css styles below if possible */
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: 'fixed', /* Fixed relative to viewport to stay in place while scrolling content */
                        bottom: '-10%',
                        right: '-5%',
                        width: '500px',
                        height: '500px',
                        background: colors.accentLight,
                        borderRadius: '50%',
                        opacity: 0.15,
                        filter: 'blur(100px)',
                        zIndex: -1,
                        pointerEvents: 'none',
                        transition: 'background 0.5s ease'
                    }} />

                    <div key={activeTab} className="fade-in-bck" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            fontSize: '13px',
                            fontWeight: '600',
                            letterSpacing: '3px',
                            color: colors.accent,
                            marginBottom: '20px',
                            display: 'block',
                            opacity: 0.8
                        }}>
                            {data[activeTab]?.label || 'Sección'}
                        </span>

                        {/* Render HTML content safely */}
                        <div
                            className="resume-content"
                            style={{
                                lineHeight: '1.9',
                                fontSize: '1.2rem',
                                color: colors.textDark
                            }}
                            dangerouslySetInnerHTML={{ __html: data[activeTab].content }}
                        />
                    </div>
                </main>

            </div>

            {/* --- STYLES --- */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
                
                /* Interactive Titles & Content */
                h2 { 
                    color: ${colors.textDark}; 
                    font-weight: 800; 
                    margin-bottom: 25px; 
                    font-size: 2.5rem;
                    position: relative;
                    display: inline-block;
                    transition: all 0.3s ease;
                    cursor: default;
                }
                h2:hover {
                    transform: scale(1.02);
                    text-shadow: 2px 2px 0px ${colors.accent};
                }
                
                h3 { 
                    color: ${colors.accent}; 
                    font-size: 1.6rem; 
                    margin-top: 45px; 
                    margin-bottom: 15px; 
                    position: relative;
                    padding-left: 15px;
                    border-left: 4px solid ${colors.accent};
                    transition: all 0.3s ease;
                }
                h3:hover {
                    transform: translateX(10px);
                    color: ${isDarkMode ? '#68D391' : '#553C9A'}; /* Lighter green or darker purple */
                }

                p { margin-bottom: 18px; line-height: 1.8; opacity: 0.9; }

                strong { color: ${isDarkMode ? '#fff' : '#1A202C'}; font-weight: 700; }

                ul { padding-left: 20px; margin-bottom: 30px; }
                li { 
                    margin-bottom: 12px; 
                    transition: transform 0.2s, color 0.2s;
                    cursor: default;
                }
                li:hover {
                    transform: translateX(5px);
                    color: ${colors.accent};
                }
                
                .job-block {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    border: 1px solid transparent;
                    transition: all 0.3s ease;
                }
                .job-block:hover {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
                    border-color: ${colors.accent};
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }

                .date {
                    font-size: 0.9rem;
                    color: ${colors.textLight};
                    font-weight: 600;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                /* Custom Scrollbar for Content */
                main::-webkit-scrollbar, aside::-webkit-scrollbar {
                    width: 8px;
                }
                main::-webkit-scrollbar-track, aside::-webkit-scrollbar-track {
                    background: transparent;
                }
                main::-webkit-scrollbar-thumb, aside::-webkit-scrollbar-thumb {
                    background-color: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                    border-radius: 4px;
                }
                main::-webkit-scrollbar-thumb:hover, aside::-webkit-scrollbar-thumb:hover {
                    background-color: ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
                }

                body {
                   cursor: ${isDragging.current ? 'grabbing' : 'auto'};
                   overflow: hidden; /* Ensure global scroll is killed */
                }

                /* Mobile Query */
                @media (max-width: 900px) {
                    /* Change to column layout */
                    div[style*="flex: 1"][style*="display: flex"] {
                        flex-direction: column !important;
                    }
                    aside {
                        width: 100% !important;
                        flex-direction: row !important;
                        overflow-x: auto;
                        padding: 15px !important;
                        gap: 10px !important;
                        border-bottom: 1px solid ${colors.border};
                        border-right: none !important;
                        flex-shrink: 0;
                    }
                    aside::-webkit-scrollbar { display: none; }
                    
                    aside button {
                        white-space: nowrap;
                        flex-shrink: 0;
                        padding: 8px 16px !important;
                        margin: 0 !important;
                    }
                    aside > div:first-child { display: none; } /* Hide Sidebar Title on Mobile */

                    main {
                        padding: 30px 20px !important;
                    }
                    
                    header {
                        padding: 0 20px !important;
                    }
                    
                    h2 { font-size: 2rem; }
                    h3 { font-size: 1.3rem; }
                }

                /* Animations */
                .fade-in-bck {
                    animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
            `}</style>
        </div>
    );
};

export default TimelinePage;
