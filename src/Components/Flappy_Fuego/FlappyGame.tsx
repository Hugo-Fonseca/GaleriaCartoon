import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import './FlappyGame.css';

const FlappyGame = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const birdRef = useRef<THREE.Object3D | null>(null);
  const pipesRef = useRef<THREE.Mesh[]>([]);
  const velocity = useRef(0);
  const animationId = useRef<number | null>(null);
  const gameOverRef = useRef(false); // control de estado inmediato

  const pipeSpeed = 0.05;
  const gravity = -0.005;

  const createPipePair = (scene: THREE.Scene, x: number) => {
    const gapSize = 1.5;
    const centerY = Math.random() * 2 - 1;

    const pipeGeometry = new THREE.BoxGeometry(0.5, 4, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x228B22 });

    const topPipe = new THREE.Mesh(pipeGeometry, material);
    const bottomPipe = new THREE.Mesh(pipeGeometry, material);

    topPipe.position.set(x, centerY + gapSize + 2, 0);
    bottomPipe.position.set(x, centerY - gapSize - 2, 0);

    topPipe.userData.passed = false;

    scene.add(topPipe);
    scene.add(bottomPipe);
    pipesRef.current.push(topPipe, bottomPipe);
  };

  const animate = () => {
    const bird = birdRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;

    if (!bird || !camera || !renderer || !scene) return;

    animationId.current = requestAnimationFrame(animate);

    velocity.current += gravity;
    bird.position.y += velocity.current;

    for (let i = 0; i < pipesRef.current.length; i += 2) {
      const top = pipesRef.current[i];
      const bottom = pipesRef.current[i + 1];

      top.position.x -= pipeSpeed;
      bottom.position.x -= pipeSpeed;

      if (top.position.x < -6) {
        top.position.x = bottom.position.x = 6;
        const centerY = Math.random() * 2 - 1;
        const gap = 1.5;
        top.position.y = centerY + gap + 2;
        bottom.position.y = centerY - gap - 2;
        top.userData.passed = false;
      }

      const birdBox = new THREE.Box3().setFromObject(bird);
      const topBox = new THREE.Box3().setFromObject(top);
      const bottomBox = new THREE.Box3().setFromObject(bottom);

      if (birdBox.intersectsBox(topBox) || birdBox.intersectsBox(bottomBox)) {
        if (!gameOverRef.current) {
          gameOverRef.current = true;
          setGameOver(true);
          cancelAnimationFrame(animationId.current!);
        }
        return;
      }

      if (!top.userData.passed && top.position.x < bird.position.x && !gameOverRef.current) {
        top.userData.passed = true;
        setScore((s) => s + 1);
      }
    }

    if (bird.position.y < -3 || bird.position.y > 3) {
      if (!gameOverRef.current) {
        gameOverRef.current = true;
        setGameOver(true);
        cancelAnimationFrame(animationId.current!);
      }
      return;
    }

    renderer.render(scene, camera);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/Fuego_Game.glb',
      (gltf) => {
        const bird = gltf.scene;
        bird.scale.set(0.5, 0.5, 0.5);
        bird.position.set(2, 0, 0); // posición inicial como pediste
        scene.add(bird);
        birdRef.current = bird;
        animate();
      },
      undefined,
      (error) => {
        console.error('Error cargando modelo:', error);
      }
    );

    for (let i = 0; i < 3; i++) {
      createPipePair(scene, 6 + i * 4);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        velocity.current = 0.08;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      window.removeEventListener('keydown', handleKeyDown);
      mountRef.current?.replaceChildren();
    };
  }, []);

  const restart = () => {
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    velocity.current = 0;

    if (birdRef.current) {
      birdRef.current.position.set(2, 0, 0);
    }

    pipesRef.current.forEach((pipe, index) => {
      const isTop = index % 2 === 0;
      const pairIndex = Math.floor(index / 2);
      const x = 6 + pairIndex * 4;
      const gapSize = 1.5;
      const centerY = Math.random() * 2 - 1;

      pipe.position.x = x;
      pipe.position.y = isTop
        ? centerY + gapSize + 2
        : centerY - gapSize - 2;

      if (isTop) pipe.userData.passed = false;
    });

    animate();
  };

  return (
    <div className="flappy-container">
      <div ref={mountRef} />
      <div className="scoreboard">
        <h1>Puntos: {score}</h1>
        {gameOver && (
          <div>
            <h2>🔥 ¡Perdiste!</h2>
            <button onClick={restart}>🔁 Reiniciar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyGame;
