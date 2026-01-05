import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './Game';
import TimelinePage from './TimelinePage';

const App = () => {

  // Data for the portfolio sections
  const cvBloques = [
    {
      label: 'Resumen',
      content: `
      <h2>Resumen Profesional</h2>
      <p>Desarrollador de Software con más de 5 años de experiencia en automatización de procesos, desarrollo web y gestión de proyectos.</p>
      <p>Actualmente en RDS desarrollando aplicaciones web internas y herramientas asistidas por IA para mejorar la eficiencia operativa.</p>
      <p><strong>Ubicación:</strong> Costa Rica | <strong>Email:</strong> emalva99guz@outlook.com | <strong>Tel:</strong> +506 70072655</p>
    `
    },
    {
      label: 'Experiencia',
      content: `
      <h2>Experiencia Profesional</h2>
      <div class="job-block">
        <h3>RDS (Reporting and Development Services) – Software Developer</h3>
        <p class="date">Cartago, Costa Rica | Oct 2025 - Presente</p>
        <ul>
          <li>Desarrollé aplicaciones web internas para automatizar procesos de negocio, reduciendo el esfuerzo manual y mejorando la eficiencia operativa.</li>
          <li>Integré APIs y servicios externos/internos para orquestar flujos de automatización, validaciones y procesamiento de datos.</li>
          <li>Colaboré con los interesados para recopilar requisitos, traducirlos en especificaciones técnicas y entregar mejoras iterativas.</li>
          <li>Construí características asistidas por IA y ayudantes de flujo de trabajo para apoyar la ejecución de procesos (guía de tareas, generación de contenido y toma de decisiones más rápida).</li>
        </ul>
      </div>
      <div class="job-block">
        <h3>Grupo DCI – Project Manager & Developer (Prácticas)</h3>
        <p class="date">Cartago, Costa Rica | Ago 2024 - Ago 2025</p>
        <ul>
          <li>Gestioné la documentación de proyectos de extremo a extremo, incluyendo historias de usuario y requisitos funcionales, asegurando la alineación con metodologías Ágiles.</li>
          <li>Colaboré con los interesados para definir y priorizar requisitos, mejorando la claridad del proyecto y la eficiencia de entrega.</li>
          <li>Desarrollé un sistema de gestión y monitoreo de empleados utilizando SQL Server, Dot Net, CSharp, Docker y Blazor.</li>
          <li>Diseñé e implementé una base de datos Firebase para gestionar registros de entrada y salida de empleados, aplicando un esquema entidad-relación optimizado.</li>
        </ul>
      </div>
      <div class="job-block">
        <h3>Align Technology – CAD Designer</h3>
        <p class="date">Cartago, Costa Rica | May 2020 – Dic 2024</p>
        <ul>
          <li>Diseñé modelos CAD 3D detallados en procesos de producción, mejorando la precisión y eficiencia del diseño.</li>
          <li>Apoyé en un proyecto de migración de plataforma, incorporación y capacitación.</li>
        </ul>
      </div>
      <div class="job-block">
        <h3>Biotech Lab – Laboratory Assistant</h3>
        <p class="date">Cartago, Costa Rica | Ene 2019 – Mar 2020</p>
        <ul>
          <li>Brindé soporte técnico para los sistemas de TI del laboratorio, asegurando un rendimiento óptimo de la red y Windows.</li>
          <li>Cultivé y gestioné la producción de microorganismos, logrando resultados consistentes y de alta calidad alineados con los cronogramas del proyecto.</li>
        </ul>
      </div>
      <div class="job-block">
        <h3>Arcos Dorados – Customer Service Associate</h3>
        <p class="date">Cartago, Costa Rica | Mar 2017 – Dic 2018</p>
        <ul>
          <li>Operé sistemas de punto de venta, gestionando transacciones en efectivo.</li>
          <li>Asistí en la gestión de inventario, implementando procedimientos de seguimiento para mejorar el control de productos.</li>
        </ul>
      </div>
    `
    },
    {
      label: 'Educación',
      content: `
      <h2>Educación</h2>
      <ul>
        <li>
          <strong>Universidad Fidélitas</strong> - San José, Costa Rica<br/>
          Bachelor’s in Systems Engineering (Dic 2025)
        </li>
        <li>
          <strong>Citi</strong> - San José, Costa Rica<br/>
          Technology Software Development Job Simulation (May 2025)
        </li>
        <li>
          <strong>VMEdu</strong> - Cartago, Costa Rica<br/>
          Scrum Fundamentals Certified (Mar 2023)
        </li>
        <li>
          <strong>Sagrado Corazón de Jesús High School</strong> - Cartago, Costa Rica<br/>
          High School Diploma (Mar 2018)
        </li>
      </ul>
    `
    },
    {
      label: 'Habilidades',
      content: `
      <h2>Habilidades</h2>
      <p><strong>Idiomas:</strong> Español: Proficiente (C2), Inglés: Intermedio Alto (B2)</p>
      <p><strong>Habilidades Técnicas:</strong></p>
      <ul>
        <li>Java, Dart, C#, PHP, JavaScript (React, Blazor)</li>
        <li>HTML, CSS, SQL, Docker, FlutterFlow</li>
        <li>DotNet, AdobeXD, Figma, Git, AWS</li>
        <li>N8N, Angular, NestJS, Jira</li>
      </ul>
      <p><strong>Certificaciones:</strong> Scrum Fundamentals Certified – VMEdu (Mar 2023), Technology Software Development Job Simulation – Citi / Forage (May 2025)</p>
    `
    },
    {
      label: 'Contacto',
      content: `
      <h2>¿Deseas contactarme?</h2>
      <p style="font-size: 1.1rem; margin-bottom: 25px;">¡Envíame un mensaje directo!</p>
      
      <div class="contact-card">
        <h3 style="margin-top: 0; margin-bottom: 25px; font-size: 1.4rem; text-align: center; border: none; padding: 0;">Emanuel Isaac Alvarado Guzmán</h3>
        
        <div style="display: flex; flex-direction: column; gap: 5px;">
          
          <!-- WhatsApp Button -->
          <a href="https://wa.me/50670072655" target="_blank" class="contact-btn whatsapp">
            <span style="font-size: 1.4rem;">💬</span> WhatsApp (+506 70072655)
          </a>

          <!-- Email Button -->
          <a href="mailto:emalva99guz@outlook.com" class="contact-btn email">
             <span style="font-size: 1.4rem;">✉️</span> Email (Outlook)
          </a>

        </div>

        <div style="margin-top: 25px; text-align: center; font-size: 0.95rem; opacity: 0.8;">
          <p style="margin: 5px 0;">📍 Cartago, Costa Rica</p>
        </div>

      </div>
    `
    }
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the Main Game */}
        <Route path="/" element={<Game cvBloques={cvBloques} />} />

        {/* Route for the Resume / Timeline Page */}
        <Route path="/resumen" element={<TimelinePage data={cvBloques} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
