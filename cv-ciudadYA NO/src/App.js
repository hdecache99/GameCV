import React, { useState } from 'react';
import Juego from './components/Juego';
import './App.css';

function App() {
  const [modal, setModal] = useState(null);
  
  const closeModal = () => setModal(null);
  
  const renderModal = () => {
    if (!modal) return null;
    
    let content;
    switch(modal) {
      case 'about':
        content = <div>Contenido sobre mí...</div>;
        break;
      case 'experience':
        content = <div>Mi experiencia laboral...</div>;
        break;
      case 'projects':
        content = <div>Mis proyectos destacados...</div>;
        break;
      case 'contact':
        content = <div>Información de contacto...</div>;
        break;
      default:
        return null;
    }
    
    return (
      <>
        <div className="modal-overlay" onClick={closeModal} />
        <div className="modal">
          <button onClick={closeModal}>Cerrar</button>
          {content}
        </div>
      </>
    );
  };
  
  return (
    <div className="App">
      <Juego />
      {renderModal()}
    </div>
  );
}

export default App;