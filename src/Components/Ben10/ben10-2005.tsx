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
  const audioRef = useRef<THREE.Audio | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Escena y cámara
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 30);
    const camera = new THREE.PerspectiveCamera(
      30,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 4);

    // Renderizado
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
    currentMount.appendChild(renderer.domElement);

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    // Controles
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
    audioLoader.load("/Music/Ben-10-In.mp3", (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      setSoundRef(sound);
      audioRef.current = sound;
    });

    // Cargar modelo 3D de Ben 10
    const loader = new GLTFLoader();
    loader.load("/3DModels/ben10original.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      model.position.set(0, -0.5, 0);
      scene.add(model);
    });

    // Partículas
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x00ff99, size: 0.08 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Cubo delgado con texturas en sus caras
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 0.05;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const loaderTexture = new THREE.TextureLoader();
    const textureLeft = loaderTexture.load("/img/Ben10_logo.PNG");
    const textureRight = loaderTexture.load("/img/omnitrix.PNG");

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x000000 }),           // right (x+)
      new THREE.MeshBasicMaterial({ color: 0x000000 }),           // left (x-)
      new THREE.MeshBasicMaterial({ color: 0x000000 }),           // top (y+)
      new THREE.MeshBasicMaterial({ color: 0x000000 }),           // bottom (y-)
      new THREE.MeshBasicMaterial({ map: textureRight }),         // front (z+)
      new THREE.MeshBasicMaterial({ map: textureLeft })           // back (z-)
    ];

    const texturedBox = new THREE.Mesh(boxGeometry, materials);
    texturedBox.position.set(-2.5, 0, 0); // Posición a la izquierda del modelo principal
    scene.add(texturedBox);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001;
      texturedBox.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Limpieza
    return () => {
      if (audioRef.current && audioRef.current.isPlaying) {
        audioRef.current.stop();
      }
      renderer.dispose();
      if (currentMount) currentMount.removeChild(renderer.domElement);
    };
  }, []);

  // Controles de audio
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
      {/* Título principal */}
      <div className="container py-4 text-center">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#297f00' }}>BEN 10</h1>
      </div>

      {/* Contenedor 3D */}
      <div ref={mountRef} style={{ width: '100%', height: '60vh' }} />

      {/* Controles de audio */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <button className="ben10-button" onClick={handlePlay} disabled={isPlaying}>▶️ Reproducir</button>
        <button  onClick={handlePause} disabled={!isPlaying}>⏸️ Pausar</button>
      </div>

      {/* Descripción del personaje */}
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
          Ben Tennyson es un niño común de 10 años que descubre un poderoso dispositivo alienígena llamado Omnitrix...
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

      {/* Galería de imágenes */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#297f00' }}>
        <h2>Galería del personaje</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <img src="/Imagenes/Ben10-1.jpg" alt="Ben 10 imagen 1" className="gallery-image" />
          <img src="/Imagenes/Ben10-2.webp" alt="Ben 10 imagen 2" className="gallery-image" />
          <img src="/Imagenes/Ben10-3.jpg" alt="Ben 10 imagen 3" className="gallery-image" />
        </div>
      </div>

      {/* Frases icónicas de Ben 10 */}
<div className="container text-center" style={{ marginTop: '40px', color: '#297f00' }}>
  <h2>Frases icónicas</h2>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  }}>
    {[
      { label: '¡Hora de ser héroe!', file: '/Music/hora-ser-heroe.mp3' },
      { label: '¡Omnitrix, Sonidos!', file: '/Music/Omnitrix-sounds.mp3' },
    ].map((sound, index) => {
      const audio = new Audio(sound.file);
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>{sound.label}</span>
          <button  className="ben10-button" onClick={() => audio.play()}>▶️ Reproducir</button>
          <button onClick={() => audio.pause()}>⏸️ Pausar</button>
        </div>
      );
    })}
  </div>
</div>

      {/* Información de la serie */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#297f00' }}>
        <h2>Serie y Producción</h2>
      </div>
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
          La historia original de Ben 10, comúnmente llamada "Ben 10 clásico", sigue a Ben Tennyson...
        </p>
        <h4 style={{ marginTop: '20px', color: '#297f00' }}>Producción</h4>
        <ul style={{ fontSize: '1.05rem', listStyleType: 'square', marginLeft: '20px' }}>
          <li><strong>Creadores:</strong> "Man of Action" (Duncan Rouleau, Joe Casey, Joe Kelly, Steven T. Seagle)</li>
          <li><strong>Estudio:</strong> Cartoon Network Studios</li>
          <li><strong>País:</strong> Estados Unidos</li>
          <li><strong>Estreno:</strong> 27 de diciembre de 2005</li>
          <li><strong>Temporadas:</strong> 4 (serie original)</li>
        </ul>
      </div>
    </div>
  );
};

export default Ben10Page;
