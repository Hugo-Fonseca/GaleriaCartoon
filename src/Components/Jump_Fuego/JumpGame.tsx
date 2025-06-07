// src/Components/Game/GameCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import '../../Styles/global.css';

const Jump = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5); // Vista lateral directa
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Fondo
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load('/img/background-desierto.jpg', (texture) => {
      scene.background = texture;
    });

    // Luces
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(10, 50, 10);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Piso
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // Obstáculos
    const obstacles: THREE.Mesh[] = [];
    const obstacleGeometry = new THREE.BoxGeometry(0.5, 1.5, 1);
    const wallTexture = new THREE.TextureLoader().load('/img/muro.jpg');

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2,4);//ajuste de como se quiere que se repita la textura

    const obstacleMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture, // Textura aplicada 
      color:'#EA9A53'
    });

    let lastObstacleX = 6;

    const createObstacle = () => {
      if (obstacles.length > 0 && lastObstacleX - obstacles[obstacles.length - 1].position.x < 2.5) {
        return; // asegura espacio mínimo entre obstáculos
      }

      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(6, -2, 0);
      obstacle.castShadow = true;
      scene.add(obstacle);
      obstacles.push(obstacle);
      lastObstacleX = obstacle.position.x;
    };

    // Partículas al perder
    const createExplosion = (x: number, y: number) => {
      const geometry = new THREE.BufferGeometry();
      const count = 100;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = x + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = 0;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1 });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      setTimeout(() => {
        scene.remove(particles);
        geometry.dispose();
        material.dispose();
      }, 1000);
    };

    // Iluminación
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(2, 1, 2);
        scene.add(dirLight);

    // Jugador
    let player: THREE.Object3D = new THREE.Mesh();

    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/Fuego_Game.glb',
      (gltf) => {
        player = gltf.scene;
        player.scale.set(1.5, 1.5, 1.5);
        player.position.set(-2, -2.8, 0);
        player.rotation.y = Math.PI / 4; // rotación tipo 3/4
        player.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
          }
        });
        scene.add(player);
      },
      undefined,
      (error) => {
        console.error('Error al cargar modelo 3D:', error);
      }
    );

    // Lógica de salto
    let isJumping = false;
    let velocity = 2;
    const gravity = -0.015;
    const jumpForce = 0.30;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isJumping) {
        velocity = jumpForce;
        isJumping = true;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animación
    let frameId: number;
    let gameOver = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (player && isJumping) {
        player.position.y += velocity;
        velocity += gravity;
        if (player.position.y <= -2.8) {
          player.position.y = -2.8;
          isJumping = false;
          velocity = 0;
        }
      }

      // Crear obstáculos
      if (!gameOver && Math.random() < 0.02) {
        createObstacle();
      }

      // Mover obstáculos
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.x -= 0.09;

        // Colisión
        if (
          player &&
          Math.abs(obs.position.x - player.position.x) < 0.6 &&
          Math.abs(obs.position.y - player.position.y) < 1 &&
          !gameOver
        ) {
          setMessage('💀 ¡Perdiste! Intenta de nuevo.');
          createExplosion(player.position.x, player.position.y);
          gameOver = true;
          cancelAnimationFrame(frameId);
        }

        // Eliminar fuera de pantalla
        if (obs.position.x < -6) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          if (!gameOver) setScore((s) => s + 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      obstacles.forEach((obs) => scene.remove(obs));
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [gameKey]);

  const handleRestart = () => {
    setScore(0);
    setMessage('');
    setGameKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#111', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#00ff00' }}>Juego de Saltos</h1>

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

      <h3 style={{ fontSize: '1.5rem' }}>Puntaje: {score}</h3>

      {message && (
        <button onClick={handleRestart} style={{
          padding: '10px 20px',
          fontSize: '1rem',
          backgroundColor: '#00ff00',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Reiniciar
        </button>
      )}

      <div ref={mountRef} style={{ width: '100%', height: '500px', marginTop: '20px' }} />
    </div>
  );
};

export default Jump;
