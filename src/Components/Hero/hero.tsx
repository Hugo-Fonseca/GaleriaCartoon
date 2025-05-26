import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import './Hero.css'; // opcional

const HeroPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Configuración básica
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / 300, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    // Iluminación
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Texturas
    const loader = new THREE.TextureLoader();
    const texture1 = loader.load("/img/cartoonNetwork-antiguo.png");
    const texture2 = loader.load("/img/cartoonNetwork-intermedio.jpg");
    const texture3 = loader.load("/img/cartoonNetwork-nuevo.png");

    const texture1b = loader.load("/img/cartoonNetwork-antiguo2.webp");
    const texture2b = loader.load("/img/CartoonNetwork-intermedio2.jpg");
    const texture3b = loader.load("/img/cartoonNetwork-nuevo2.webp");

    // Crear cubo con textura en frente y atrás
    const createTexturedBox = (frontTexture: THREE.Texture, backTexture: THREE.Texture, x: number) => {
      const geometry = new THREE.BoxGeometry(3.5, 3.5, 0.1);
      const materials = [
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // right
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // left
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // top
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // bottom
        new THREE.MeshBasicMaterial({ map: frontTexture }), // front
        new THREE.MeshBasicMaterial({ map: backTexture }),  // back
      ];
      const box = new THREE.Mesh(geometry, materials);
      box.position.x = x;
      scene.add(box);
      return box;
    };

    // Cubos con separación mayor
    const box1 = createTexturedBox(texture1, texture1b, -5);
    const box2 = createTexturedBox(texture2, texture2b, 0);
    const box3 = createTexturedBox(texture3, texture3b, 5);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      box1.rotation.y += 0.01;
      box2.rotation.y += 0.01;
      box3.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Limpieza
    return () => {
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white text-center p-4">
      <h1 
        className="display-3 fw-bold mb-4 text-warning"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Cartoon Museum
      </h1>
      <p className="lead col-md-8">
        Bienvenido al Museo de los dibujos animados de Cartoon Network. Aquí podrás explorar modelos 3D interactivos y conocer sobre tus personajes favoritos por año de lanzamiento.
      </p>
      
      {/* Contenedor para los cubos */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: '700px', marginTop: '30px' }} />
    </div>
  );
};

export default HeroPage;
