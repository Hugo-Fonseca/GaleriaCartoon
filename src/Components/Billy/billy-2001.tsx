import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import './billy.css';


const BillyPage = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [soundRef, setSoundRef] = useState<THREE.Audio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<THREE.Audio | null>(null);

  useEffect(() => {
    if (!mountRef.current) return; //!mountRef.current es una referencia al contenedor DOM donde se va a renderizar la escena 3D
    const currentMount = mountRef.current;

    // Escena y cámara
    const scene = new THREE.Scene(); //Crea una camara de perspectiva 
    scene.background = new THREE.Color(0xf6a0a5); //Se le da un fondo
    scene.fog = new THREE.Fog(0xf6a0a5, 10, 15);  //Genera una niebla (Color, distancia de inico, distancia de final )
    const camera = new THREE.PerspectiveCamera( //Se configura una cámara de perspectiva
      30, //Campo de vision de 30 grados
      currentMount.clientWidth / currentMount.clientHeight, //Relacion de aspecto basado en el tamaño del contenedor (CurrentMount)
      0.1,  // Distancia del plano cercano
      1000  //Distancia del plano lejano
    );
    camera.position.set(0, 0.5 , 4); //Configura la posicion de la camara en el espacio 3D (horizontal, vertical, profundidad)

    // Renderizado
    const renderer = new THREE.WebGLRenderer({ antialias: true }); //Se crea un renderizado WebGL
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6); //Se ajusta al 60% del tamaño al 60% de la altura de la ventana del navegador
    currentMount.appendChild(renderer.domElement); //El renderizado se va a ajustar al dom del contenedor

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); //Se agrega luz ambiental para iluminar de manera uniforme
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); //Se agrega luz direccional que tiene una posicion y una intensidad
    dirLight.position.set(3, 5, 2); 
    scene.add(dirLight);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement); //Se usan controles de orbita que permiten al usuario moverse alrededor de la escena
    controls.enableDamping = true;  //Se habilita suavizado
    controls.enablePan = false; //Se desactiva desplazamiento
    controls.minDistance = 3; //Limite de distancia
    controls.maxDistance = 6; //Limite de distancia
    controls.minPolarAngle = Math.PI / 3; //Limite de ángulo
    controls.maxPolarAngle = Math.PI / 2;  //Limite de ángulo

    // Audio
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/Music/Billy-Intro.mp3", (buffer) => { //Se carga un archivo de sonido 
      sound.setBuffer(buffer);
      sound.setLoop(false); //No deja q se repita en bucle
      sound.setVolume(0.5); //Ajusta el volumen del audio
      setSoundRef(sound);
      audioRef.current = sound;
    });

    // Cargar modelo 3D de Billy
    const loader = new GLTFLoader(); //Se utiliza GLTFLoader() para poder traer un modelo 3D
    loader.load("/3DModels/billy.glb", (gltf) => { //Carga el modelo 3D de Billy
      const model = gltf.scene; //Trae la escena cargada del archivo gltf y la asigna a la variable model
      model.scale.set(0.3, 0.3, 0.3); //Le da escala al modelo 3D
      model.position.set(0, -0.8, 0);  //Posiciona el personaje 3D
      scene.add(model); //Se agrega a la escena principal del three.js para que sea visible y se renderize
    });

    // Partículas
    const particleCount = 500; 
    const particlesGeometry = new THREE.BufferGeometry(); 
    const positions = new Float32Array(particleCount * 3); //Se crean particulas flotantes distribuidas por el espacio 3D
    for (let i = 0; i < particleCount * 3; i++) { 
      positions[i] = (Math.random() - 0.5) * 8; //Calcula un espacio random para q se generen
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xff69b4, size: 0.08 }); //Se le asigna el color rosa y un tamaño
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles); //Se agregan a la escena principal 

    // Cubo delgado con texturas en sus caras
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 0.05;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth); //Define la forma del objeto.

    const loaderTexture = new THREE.TextureLoader(); 
    
    const textureLeft = loaderTexture.load("/img/BillyMandy.png"); //Se cargan imágenes en las caras del cubo
    const textureRight = loaderTexture.load("/img/MascotaBilly.webp"); //Lo de up

    //Se definen los materiales para cada una de las caras del cubo

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xf6a0a5 }),           // right (x+) 
      new THREE.MeshBasicMaterial({ color: 0xf6a0a5 }),           // left (x-)
      new THREE.MeshBasicMaterial({ color: 0xf6a0a5 }),           // top (y+)
      new THREE.MeshBasicMaterial({ color: 0xf6a0a5 }),           // bottom (y-)
      new THREE.MeshBasicMaterial({ map: textureRight }),         // front (z+)
      new THREE.MeshBasicMaterial({ map: textureLeft })           // back (z-)
    ];

    const texturedBox = new THREE.Mesh(boxGeometry, materials);  //Se crea la malla q seria el objeto como tal
    texturedBox.position.set(-2.5, 0, 0); // Posición a la izquierda del modelo principal
    scene.add(texturedBox); //Se agrega a la escena principal

    // Animación
    const animate = () => {
      requestAnimationFrame(animate); // Ejecuta una función de animación en el siguiente  cuadro de renderizado o frame
      particles.rotation.y += 0.001; //Esta línea rota a particles alrededor del eje Y. 
      texturedBox.rotation.y += 0.005; //Lo mismo de arriba pero con texturedbox
      controls.update();  //Se actualizan los controles de la camara
      renderer.render(scene, camera); //Actualiza los controles de la cámara (por si el usuario mueve la cámara con el ratón).
    };
    animate(); //Es la llamada inicial que comienza el ciclo de animación.

    // Limpieza
    return () => {
      if (audioRef.current && audioRef.current.isPlaying) {
        audioRef.current.stop();  //Detiene el audio si aun sigue reproduciendoce 
      }
      renderer.dispose(); //Se llama para limpiar y liberar los recursos que utiliza el renderizador.
      if (currentMount) currentMount.removeChild(renderer.domElement);
    };
  }, []);

  // Controles de audio
  const handlePlay = () => { //Se ejecuta cuando se hace clic en el boton de reproducir 
    soundRef?.play(); //Si soundRef está definido se llama al metodo play() para reproducir sonido
    setIsPlaying(true); //Cambia el estado de isPlaying a true, indicando que el audio está en reproducción.
  };

  const handlePause = () => { //Esta función se ejecuta cuando se hace clic en el botón de Pausar
    soundRef?.pause(); // Si el soundRef está definido, se llama al método pause() para pausar el sonido.
    setIsPlaying(false);  // Cambia el estado de isPlaying a false, indicando que el audio está pausado.
  };

  return (
     <div style={{ color: 'white', position: 'relative' }}> {/*Renderiza el titulo"*/ } 
      {/* Título principal */}
      <div className="container py-4 text-center">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#f6a0a5' }}>Billy</h1>
      </div>

      {/* Contenedor 3D */}
      <div ref={mountRef} style={{ width: '100%', height: '60vh' }} /> {/*Se crea un div para luego agregar el renderizado ref ahí*/}

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
        <button className="billy-button" onClick={handlePlay} disabled={isPlaying}>▶️ Reproducir</button> {/*Cuando se haga click en el boton se llmara la funcion handleplay*/}
        <button onClick={handlePause} disabled={!isPlaying}>⏸️ Pausar</button> {/*Cuando se haga click en el boton se llmara la funcion handlePause*/}
      </div>

      {/* Descripción del personaje */} 
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
        Billy es uno de los personajes principales de la serie Las Sombrías Aventuras de Billy y Mandy. Es un niño de nariz grande, gorra roja y cabello pelirrojo, corto de mente con una personalidad tonta y alegre y de gran corazón, además de tener un gran estómago que hace que Billy coma grandes cantidades de comida. Sus idioteces siempre lo meten en problemas a él y a sus amigos, aunque irónicamente aveces también los salva de situaciones difíciles.
        
        </p>
        <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
          <li>Billy es un niño ingenuo y torpe, lo que lo convierte en una fuente constante de humor.</li>
          <li>Su nombre es común, pero su comportamiento es todo lo contrario a lo "normal".</li>
          <li>Billy tiene 9 años.</li>
          <li>Le tiene miedo a los payasos, hasta el punto de tener pesadillas terribles acerca de ellos.</li>
          <li>Tiene una amiga llamada Mandy y un amigo llamado Puro Hueso.</li>
          <li>Billy y Mandy invocaron a la muerte y la obligaron a ser su amigo despues de ganar una apuesta.</li>
        </ul>
      </div>

      {/* Galería de imágenes */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#f6a0a5' }}>
        <h2>Galería del personaje</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <img src="/img/Billy1.gif" alt="Ben 10 imagen 1" className="gallery-image" />
          <img src="/img/Billy2.gif" alt="Ben 10 imagen 2" className="gallery-image" />
          <img src="/img/Billy3.gif" alt="Ben 10 imagen 3" className="gallery-image" />
        </div>
      </div>

      {/* Frases icónicas de Billy */}
<div className="container text-center" style={{ marginTop: '40px', color: '#f6a0a5' }}>
  <h2>Frases icónicas</h2>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  }}>
    {[
      { label: '¡No, no, no es cierto!', file: '/Music/BillyAudio1.mp3' },
      { label: '¡Qué alguien me ayude!', file: '/Music/BillyAudio3.mp3' },
    ].map((sound, index) => { {/*Se recorre un arreglo con objetos q contiene la frase (label) y el archivo de audio (file) */}
      const audio = new Audio(sound.file);
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>{sound.label}</span>
          <button className="billy-button" onClick={() => audio.play()}>▶️ Reproducir</button> {/*Se crea un boton para reproducir*/}
          <button onClick={() => audio.pause()}>⏸️ Pausar</button> {/*Se crea un boton para pausar*/}
        </div>
      );
    })}
  </div>
</div>

      {/* Información de la serie */}
      <div className="container text-center" style={{ marginTop: '40px', color: '#f6a0a5' }}>
        <h2>Serie y Producción</h2>
      </div>
      <div className="container py-4">
        <p style={{ fontSize: '1.1rem' }}>
          Las sombrías aventuras de Billy y Mandy , dos niños, que, tras ganar un extraño "juego" a la Muerte, terminan convirtiéndolo en su esclavo.
        </p>
        <h4 style={{ marginTop: '20px', color: '#f6a0a5' }}>Producción</h4>
        <ul style={{ fontSize: '1.05rem', listStyleType: 'square', marginLeft: '20px' }}>
          <li><strong>Creador:</strong> Maxwell Atoms (1973 - presente))</li>
          <li><strong>Estudio:</strong> Cartoon Network Studios</li>
          <li><strong>País:</strong> Estados Unidos</li>
          <li><strong>Estreno:</strong> 24 de Agosto de 2001</li>
          <li><strong>Temporadas:</strong> 7 (serie original)</li>
        </ul>
      </div>
    </div>
  );
};

export default BillyPage; //Permite que el componente BillyPage sea exportado y disponible para ser importado en otros archivos.
