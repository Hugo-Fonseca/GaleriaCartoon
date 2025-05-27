// src/Components/Game/GameCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import '../../Styles/global.css';
import './game.css';

const GameCanvas = () => {
  // Referencia al contenedor del canvas
  const mountRef = useRef<HTMLDivElement>(null);

  // Estado para mostrar el mensaje de derrota
  const [message, setMessage] = useState<string>('');

  // Estado para el puntaje
  const [score, setScore] = useState<number>(0);

  // Clave para reiniciar el juego
  const [gameKey, setGameKey] = useState<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // === ESCENA Y CÁMARA ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      mount.clientWidth / mount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;

    // === FONDO CON IMAGEN ===
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/img/fondo-game.jpeg', (texture) => {
      scene.background = texture;
    });

    // === RENDERIZADOR ===
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // === JUGADOR (CUBO VERDE) ===
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = -2;
    player.castShadow = true;
    scene.add(player);

    // === ILUMINACIÓN ===
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 50, 10);
    light.castShadow = true;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // === SUELO INVISIBLE PARA SOMBRAS ===
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // === OBSTÁCULOS (CUBOS ROJOS) ===
    const obstacles: THREE.Mesh[] = [];
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    const createObstacle = () => {
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.x = Math.random() * 6 - 3; // Posición X aleatoria entre -3 y 3
      obstacle.position.y = 7; // Aparece en la parte superior
      obstacle.castShadow = true;
      scene.add(obstacle);
      obstacles.push(obstacle);
    };

    // === EXPLOSIÓN DE PARTÍCULAS AL PERDER ===
    const createExplosion = (x: number, y: number) => {
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = x + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = 0;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1 });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Elimina las partículas después de 1 segundo
      setTimeout(() => {
        scene.remove(particles);
        particleGeometry.dispose();
        particleMaterial.dispose();
      }, 1000);
    };




    // === CONTROLES DEL JUGADOR CON FLECHAS ===

let speed = 0.5;  // Velocidad base
const maxSpeed = 2;  // Velocidad máxima
let keyPressTime = 0;  // Cuenta cuánto tiempo se mantiene presionada la tecla
let lastKeyPressTime = 0;  // Mide el intervalo entre las pulsaciones rápidas
const maxPressTime = 400; // Tiempo máximo en milisegundos para aumentar la velocidad con la tecla presionada

const speedIncreaseRate = 0.1; // Tasa de incremento de velocidad al presionar rápidamente
const speedResetTime = 200; // Tiempo máximo entre pulsaciones rápidas en milisegundos

const handleKeyDown = (event: KeyboardEvent) => {
  const now = Date.now();

  // Lógica de incremento de velocidad por mantener la tecla presionada
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    keyPressTime += 1;
    if (keyPressTime > maxPressTime) {
      speed = Math.min(speed * 1.1, maxSpeed);  // Aumentar la velocidad, sin q exceda maxSpeed
    }

    // Lógica de incremento de velocidad por presionar rápidamente
    const timeSinceLastPress = now - lastKeyPressTime;
    if (timeSinceLastPress < speedResetTime) {  // Si el intervalo entre pulsaciones es menor que speedResetTime
      speed = Math.min(speed + speedIncreaseRate, maxSpeed);  // Incrementa la velocidad, pero sin pasar la máxima velocidad
    }

    lastKeyPressTime = now;  // Actualiza el tiempo de la última pulsación
  }

  if (event.key === 'ArrowLeft') { //Si el jugador toca la tecla de la izquierda se ejecuta
    player.position.x = Math.max(player.position.x - speed, -3); //El jugador se mueve hacia la izquierda
  } else if (event.key === 'ArrowRight') { //Si el jugador toca la tecla de la derecha
    player.position.x = Math.min(player.position.x + speed, 3); //El jugador se mueve hacia la derecha
  }
};

const handleKeyUp = (event: KeyboardEvent) => { //Se va a ejercutar cuando el jugador suelte la tecla q estaba oprimiendo
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    keyPressTime = 0;  // Resetea el tiempo cuando se suelta la tecla
    speed = 0.5;  // Restablece la velocidad a la base
  }
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);











    // === ADAPTAR RENDERIZADOR AL REDIMENSIONAR VENTANA ===
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // === ANIMACIÓN PRINCIPAL ===
    let frameId: number;
    let gameOver = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Crear nuevos obstáculos aleatoriamente
      if (!gameOver && Math.random() < 0.02) {
        createObstacle();
      }

      // Mover y verificar colisiones
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.y -= 0.05;

        // Detectar colisión entre jugador y obstáculo
        if (
          Math.abs(obs.position.y - player.position.y) < 0.9 &&
          Math.abs(obs.position.x - player.position.x) < 0.9 &&
          !gameOver
        ) {
          setMessage('😢 ¡Perdiste, intenta de nuevo!');
          createExplosion(player.position.x, player.position.y);
          gameOver = true;
          cancelAnimationFrame(frameId);
        }

        // Eliminar obstáculos que salgan de pantalla
        if (obs.position.y < -4) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          if (!gameOver) setScore((s) => s + 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // === LIMPIEZA AL DESMONTAR COMPONENTE ===
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      obstacles.forEach((obs) => scene.remove(obs));
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [gameKey]); // Se vuelve a ejecutar cuando se reinicia el juego

  // === REINICIAR JUEGO ===
  const handleRestart = () => {
    setScore(0);
    setMessage('');
    setGameKey((prev) => prev + 1); // Cambiar clave para reiniciar useEffect
  };

  // === UI DEL JUEGO ===
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#111', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#00ff00' }}>Juego 3D</h1>

      {/* Mensaje si se pierde */}
      {message && (
        <h2 style={{
          color: '#ff4444',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontSize: '1.5rem'
        }}>
          {message}
        </h2>
      )}

      {/* Área de juego */}
      <div ref={mountRef} style={{
        width: '100%',
        height: '400px',
        border: '2px solid#cc5e15',
        borderRadius: '10px',
        margin: 'auto',
        maxWidth: '800px'
      }}></div>

      {/* Puntaje y botón de reinicio */}
      <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Puntaje: {score}</p>
      <button onClick={handleRestart} style={{
        padding: '10px 20px',
        fontSize: '16px',
        marginTop: '10px',
        backgroundColor: '#00ff00',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        🔄 Reiniciar juego
      </button>
    </div>
  );
};

export default GameCanvas;
