import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import './ben10.css';
import '../../Styles/global.css';

const Ben10Page = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [soundRef, setSoundRef] = useState<THREE.Audio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 30);

    const camera = new THREE.PerspectiveCamera(
      30,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
    currentMount.appendChild(renderer.domElement);

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    // OrbitControls limitados
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 6;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 2;

    // Audio
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/Music.ogg", (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      setSoundRef(sound);
    });

    // Cargar modelo
    const loader = new GLTFLoader();
    loader.load(
      "/3DModels/ben10original.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error al cargar modelo:", error);
      }
    );

    // Sistema de partículas personalizado para Ben10
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ff99,
      size: 0.08,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001; // rotación suave
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      if (currentMount) currentMount.removeChild(renderer.domElement);
    };
  }, []);

  // Handlers de botones
  const handlePlay = () => {
    soundRef?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    soundRef?.pause();
    setIsPlaying(false);
  };

  return (
    
    
    <div style={{ color: 'white', position: 'relative' }}>
      {/* Información del personaje Ben 10 */}
      <div className="container py-4 text-center">
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Ben 10</h1>
    </div>

      
      {/* Contenedor 3D */}
      <div ref={mountRef} style={{ width: '100%', height: '60vh' }} />

      {/* Controles de audio en esquina superior izquierda */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <button onClick={handlePlay} disabled={isPlaying}>▶️ Reproducir</button>
        <button onClick={handlePause} disabled={!isPlaying}>⏸️ Pausar</button>
      </div>

      {/* Información */}
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
        Ben Tennyson es un niño común de 10 años que descubre un poderoso dispositivo alienígena llamado Omnitrix,
        que se adhiere a su muñeca y le permite transformarse en distintas criaturas con habilidades únicas. A lo largo de la serie:
      </p>
      <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
        <li>Puede transformarse en más de 10 alienígenas diferentes.</li>
        <li>Es valiente y protector con su familia y amigos.</li>
        <li>Su transformación tiene un límite de tiempo.</li>
        <li>Viaja en verano con su prima Gwen y su abuelo Max.</li>
        <li>Aprende sobre responsabilidad a través de sus poderes.</li>
        <li>El Omnitrix es buscado por múltiples villanos intergalácticos.</li>
      </ul>
      </div>
      
      {/* Galería de imágenes del protagonista */}
      <div className="container text-center" style={{ marginTop: '40px' }}>
        <h2>Galería del personaje</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <img src="/Imagenes/Ben10-1.jpg" alt="Ben 10 imagen 1" style={{ width: '300px', borderRadius: '8px' }} />
        <img src="/Imagenes/Ben10-2.webp" alt="Ben 10 imagen 2" style={{ width: '300px', borderRadius: '8px' }} />
        <img src="/Imagenes/Ben10-3.jpg" alt="Ben 10 imagen 3" style={{ width: '300px', borderRadius: '8px' }} />
      </div>
      </div>

      {/* Informacion de la serie y produccion */}

      <div className="container py-4">
       <h2>Serie y Producción</h2>
        <p style={{ fontSize: '1.1rem' }}>
        La historia original de Ben 10, comúnmente llamada "Ben 10 clásico", sigue a Ben Tennyson, un niño de 10 años, 
        durante un verano de campamento con su abuelo Max y su prima Gwen. En el primer episodio, 
        Ben encuentra el Omnitrix, un reloj alienígena que le permite transformarse en 10 criaturas alienígenas diferentes. 
        A medida que Ben aprende a controlar sus nuevos poderes, debe usar sus transformaciones para proteger a sus amigos y a la Tierra de diversas amenazas alienígenas y villanos.
        </p>

      <h4 style={{ marginTop: '20px' }}>Producción</h4>
        <ul style={{ fontSize: '1.05rem', listStyleType: 'square', marginLeft: '20px' }}>
        <li><strong>Creadores:</strong> "Man of Action" (grupo compuesto por Duncan Rouleau, Joe Casey, Joe Kelly y Steven T. Seagle)</li>
        <li><strong>Estudio de animación:</strong> Cartoon Network Studios</li>
        <li><strong>País de origen:</strong> Estados Unidos</li>
        <li><strong>Fecha de estreno:</strong> 27 de diciembre de 2005</li>
        <li><strong>Cadena de televisión:</strong> Cartoon Network</li>
        <li><strong>Número de temporadas:</strong> 4 (en la serie original)</li>
      </ul>
      </div>

    </div>

  );
};

export default Ben10Page;
