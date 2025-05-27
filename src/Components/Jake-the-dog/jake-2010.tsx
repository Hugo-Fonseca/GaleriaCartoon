import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import './jake-2010.css';
import '../../Styles/global.css';

const JakePage = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [soundRef, setSoundRef] = useState<THREE.Audio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<THREE.Audio | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Escena y cámara
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x67D5F7);

    // scene.fog = new THREE.Fog(0x000000, 10, 30);
    const camera = new THREE.PerspectiveCamera(
      30,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 4);

    // Renderizado
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
    currentMount.appendChild(renderer.domElement);

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 10));
    const directionLight = new THREE.DirectionalLight(0xffffff, 20);
    directionLight.position.set(3, 5, 5);
    scene.add(directionLight);

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
    audioLoader.load("/Music/Come-Along-With-Me-hora-de-aventura.mp3", (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      setSoundRef(sound);
      audioRef.current = sound;
    });

    // Cargar modelo 3D de Jake el perro
    const loader = new GLTFLoader();
    loader.load("/3DModels/jake_the_dog.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.03, 0.03, 0.03);
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
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Cubo delgado con texturas en sus caras
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 0.05;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const loaderTexture = new THREE.TextureLoader();
    const textureLeft = loaderTexture.load("/img/Adventure_Time_logo.png");
    const textureRight = loaderTexture.load("/img/espadaJake.jpg");

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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#FCC224' }}>Jake el Perro</h1>
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
        <button onClick={handlePlay} disabled={isPlaying}>▶️ Reproducir </button>
        <button onClick={handlePause} disabled={!isPlaying}>⏸️ Pausar </button>
      </div>

      {/* Descripción del personaje */}
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
          Jake es un híbrido entre perro y cambiaformas, al que otros llaman "perro mágico". 
          Es el compañero fiel de Finn , su mejor amigo y hermano adoptivo.        
        </p>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
          <li>Puede transformarse en todo tipo de formas fantásticas con sus poderes, 
            pero normalmente adopta la forma de un bulldog amarillo anaranjado de tamaño promedio.</li>
          <li>Es un cantante y bailarín nato; de hecho, sus primeras palabras fueron una canción y un baile.</li>
          <li>Sabe tocar el violín.</li>
          <li>Tiene una novia que es un unicornio llamado Arcoiris, con la que tiene 5 cachorros
            (Charlie, Tv, Viola, Jake Jr y  Kim Kil Whan).</li>
          <li>Hijo de dos perros investigadores llamados Joshua y Margaret, luego de su muerte, se
            encargó de cuidar a Finn y se mudaron a la casa del árbol.</li>
          <li>Es muy bueno en el juego "guerra de tarjetas", pero es muy may perdedor y mal ganador.</li>
          <li>Es el rey de besutiful.</li>
        </ul>
      </div>

      {/* Galería de imágenes */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#FCC224' }}>
        <h2>Galería del personaje</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <img src="/img/jake.gif" alt="Jake el perro imagen 1" className="gallery-image" />
          <img src="/img/jake2.gif" alt="Jake el perro imagen 2" className="gallery-image" />
          <img src="/img/jake3.gif" alt="Jake el perro imagen 3" className="gallery-image" />
        </div>
      </div>

            {/* Frases icónicas de Jake*/}
<div className="container text-center" style={{ marginTop: '40px', color:' #FCC224' }}>
  <h2>Frases icónicas</h2>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  }}>
    {[
      { label: '¡Ay no, es una cabra muerta mi hermano!', file: '/Music/es-una-cabra-muerta-mi-hermano.mp3' },
      { label: '¡Cobijita Finn!', file: '/Music/Jake y su cobijita (estoy malito).mp3' },
      { label: '¡Yo vivo de mi público!', file: '/Music/Yo-vivo-de-mi-público-fino-y-conocedor.mp3' },
      { label: '¡Como en una isla tropical!', file: '/Music/como-una-isla-tropical.mp3' },
    ].map((sound, index) => {
      const audio = new Audio(sound.file);
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>{sound.label}</span>
          <button onClick={() => audio.play()}>▶️ Reproducir</button>
          <button onClick={() => audio.pause()}>⏸️ Pausar</button>
        </div>
      );
    })}
  </div>
</div>


      {/* Información de la serie */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#FCC224' }}>
        <h2>Serie y Producción</h2>
      </div>
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
          Hora de aventura trata sobre un niño llamado Finn y su perro mágico que cambia de forma, Jake , 
          quienes viven muchas aventuras extrañas en la Tierra de Ooo .
        </p>
        <h4 style={{ marginTop: '20px', color: '#FCC224' }}>Producción</h4>
        <ul style={{ fontSize: '1.05rem', listStyleType: 'square', marginLeft: '20px' }}>
          <li><strong>Creador:</strong> Pendleton Ward</li>
          <li><strong>Estudio:</strong> Cartoon Network Studios</li>
          <li><strong>País:</strong> Estados Unidos</li>
          <li><strong>Estreno:</strong> 5 de abril de 2010</li>
          <li><strong>Temporadas:</strong> 10</li>
        </ul>
      </div>
    </div>
  );
};

export default JakePage;