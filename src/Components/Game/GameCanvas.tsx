// src/Components/Game/GameCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import '../../Styles/global.css';
import './game.css';

const GameCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(0); // Para reiniciar

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Escena y cámara
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000');
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderizador con sombras habilitadas
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Jugador (cubo verde)
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = -2;
    player.castShadow = true;
    scene.add(player);

    // Luz principal
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 50, 10);
    light.castShadow = true;
    scene.add(light);

    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Suelo invisible para recibir sombras
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // Obstáculos (cubos rojos)
    const obstacles: THREE.Mesh[] = [];
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    const createObstacle = () => {
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.x = Math.random() * 6 - 3;
      obstacle.position.y = 3;
      obstacle.castShadow = true;
      scene.add(obstacle);
      obstacles.push(obstacle);
    };

    // Sistema de partículas al perder
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

      // Remover partículas tras 1 segundo
      setTimeout(() => {
        scene.remove(particles);
        particleGeometry.dispose();
        particleMaterial.dispose();
      }, 1000);
    };

    // Controles del jugador
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        player.position.x = Math.max(player.position.x - 0.5, -3); // Límite izquierdo
      } else if (event.key === 'ArrowRight') {
        player.position.x = Math.min(player.position.x + 0.5, 3); // Límite derecho
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Resize del canvas
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animación principal
    let frameId: number;
    let gameOver = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!gameOver && Math.random() < 0.02) {
        createObstacle();
      }

      // Se itera al revés para evitar problemas al hacer splice
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.y -= 0.05;

        // Colisión
        if (
          Math.abs(obs.position.y - player.position.y) < 0.9 &&
          Math.abs(obs.position.x - player.position.x) < 0.9 &&
          !gameOver
        ) {
          setMessage('¡Perdiste!');
          createExplosion(player.position.x, player.position.y);
          gameOver = true;
          cancelAnimationFrame(frameId);
        }

        // Obstáculo fuera de pantalla
        if (obs.position.y < -4) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          if (!gameOver) setScore((s) => s + 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Limpieza del canvas y listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      obstacles.forEach((obs) => scene.remove(obs));
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [gameKey]);

  // Reinicio del juego
  const handleRestart = () => {
    setScore(0);
    setMessage('');
    setGameKey(prev => prev + 1); // Forzar recreación del canvas
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Juego 3D</h1>
      <div ref={mountRef} style={{ width: '100%', height: '400px' }}></div>
      <h2>{message}</h2>
      <p>Puntaje: {score}</p>
      <button onClick={handleRestart} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Reiniciar juego
      </button>
    </div>
  );
};

export default GameCanvas;
