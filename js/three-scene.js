/**
 * Three.js 3D Engine & Scene Controller for AETHER 3D
 * Handles WebGL rendering, camera scroll scrub, particle systems, and 3D objects.
 */
class SpatialThreeScene {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Objects
    this.particles = null;
    this.coreGroup = new THREE.Group();
    this.coreMesh = null;
    this.coreWireframeMesh = null;
    this.coreSubMeshes = [];
    this.floatingShapes = [];
    
    // Lights
    this.lightCyan = null;
    this.lightPurple = null;
    
    // State
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    
    // Interactive Core Controls State
    this.explodeFactor = 0;
    this.spinSpeed = 1.0;
    this.currentMaterialType = 'chrome';
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.userRotationX = 0;
    this.userRotationY = 0;
    
    // FPS counter tracking
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;

    this.materials = {};
  }

  init() {
    if (!this.canvas) return;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.015);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 18);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 4. Materials setup
    this.initMaterials();

    // 5. Build Scene Content
    this.buildLights();
    this.buildParticles();
    this.buildCoreObject();
    this.buildFloatingShapes();

    // 6. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.setupCoreInteractions();

    // 7. Start Render Loop
    this.animate();
  }

  initMaterials() {
    this.materials = {
      chrome: new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: false,
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      }),
      hologram: new THREE.MeshPhongMaterial({
        color: 0xa855f7,
        emissive: 0x3b82f6,
        specular: 0x06b6d4,
        shininess: 100,
        wireframe: false,
        transparent: true,
        opacity: 0.85
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.2,
        wireframe: false
      })
    };
  }

  buildLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    this.lightCyan = new THREE.PointLight(0x06b6d4, 3, 50);
    this.lightCyan.position.set(10, 10, 10);
    this.scene.add(this.lightCyan);

    this.lightPurple = new THREE.PointLight(0xa855f7, 3, 50);
    this.lightPurple.position.set(-10, -10, -5);
    this.scene.add(this.lightPurple);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 8);
    this.scene.add(dirLight);
  }

  buildParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x06b6d4); // Cyan
    const color2 = new THREE.Color(0x818cf8); // Indigo
    const color3 = new THREE.Color(0xa855f7); // Purple

    for (let i = 0; i < particleCount; i++) {
      // Spread in 3D box
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;

      // Color variation
      const mixedColor = color1.clone().lerp(
        Math.random() > 0.5 ? color2 : color3,
        Math.random()
      );
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture canvas
    const pMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, pMaterial);
    this.scene.add(this.particles);
  }

  buildCoreObject() {
    this.scene.add(this.coreGroup);
    this.coreGroup.position.set(0, 0, 0);

    // Outer Icosahedron / Geodesic Sphere Core Mesh
    const mainGeometry = new THREE.IcosahedronGeometry(3.2, 2);
    this.coreMesh = new THREE.Mesh(mainGeometry, this.materials.chrome);
    this.coreGroup.add(this.coreMesh);

    // Inner glowing wireframe core
    const innerGeometry = new THREE.IcosahedronGeometry(2.2, 1);
    this.coreWireframeMesh = new THREE.Mesh(innerGeometry, this.materials.wireframe);
    this.coreGroup.add(this.coreWireframeMesh);

    // Sub-components for Exploded View
    const subGeo = new THREE.OctahedronGeometry(0.8, 0);
    const directions = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(-1, 1, 1).normalize(),
      new THREE.Vector3(1, -1, 1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize(),
      new THREE.Vector3(1, 1, -1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
    ];

    directions.forEach((dir, i) => {
      const subMesh = new THREE.Mesh(subGeo, this.materials.hologram);
      subMesh.position.copy(dir.clone().multiplyScalar(3.8));
      subMesh.userData = { initialDir: dir, initialDist: 3.8 };
      this.coreSubMeshes.push(subMesh);
      this.coreGroup.add(subMesh);
    });
  }

  buildFloatingShapes() {
    const geometries = [
      new THREE.TorusGeometry(1.2, 0.4, 16, 32),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TorusKnotGeometry(0.8, 0.25, 64, 16),
      new THREE.BoxGeometry(1.5, 1.5, 1.5)
    ];

    for (let i = 0; i < 8; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0xa855f7,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: i % 3 === 0
      });

      const mesh = new THREE.Mesh(geo, mat);
      
      // Random space placement
      mesh.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 50 - 10
      );

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.floatingShapes.push(mesh);
      this.scene.add(mesh);
    }
  }

  setMaterial(matKey) {
    if (!this.materials[matKey]) return;
    this.currentMaterialType = matKey;
    const targetMat = this.materials[matKey];
    this.coreMesh.material = targetMat;
  }

  setExplodeFactor(factor) {
    this.explodeFactor = factor; // 0 to 1
  }

  setSpinSpeed(speed) {
    this.spinSpeed = speed;
  }

  setupCoreInteractions() {
    const viewportCard = document.querySelector('#interactive-core .lg\\:col-span-7');
    if (!viewportCard) return;

    viewportCard.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.userRotationY += deltaX * 0.008;
      this.userRotationX += deltaY * 0.008;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile dragging
    viewportCard.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.userRotationY += deltaX * 0.008;
      this.userRotationX += deltaY * 0.008;

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  updateScroll(progress) {
    this.targetScrollProgress = progress; // 0 to 1 across whole page
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // FPS Counter
    this.frameCount++;
    const currentTime = performance.now();
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      const fpsElem = document.getElementById('fps-counter');
      if (fpsElem) fpsElem.innerText = `${this.fps} FPS`;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    // Smooth lerping
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 1. Camera Kinematics based on Scroll Progress
    // Camera moves through Z space and moves Y / rotation to showcase spatial layers
    const targetZ = 18 - this.scrollProgress * 28; // Fly forward from z=18 to z=-10
    const targetY = -this.scrollProgress * 4 + Math.sin(this.scrollProgress * Math.PI * 2) * 2;
    
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.06;

    // Subtle mouse tilt on camera
    this.camera.position.x = this.mouseX * 1.5;
    this.camera.rotation.y = -this.mouseX * 0.08;
    this.camera.rotation.x = -this.mouseY * 0.08;

    // 2. Core 3D Object Rotation & Explode Animation
    if (this.coreGroup) {
      const baseRotation = currentTime * 0.0005 * this.spinSpeed;
      this.coreGroup.rotation.y = baseRotation + this.userRotationY;
      this.coreGroup.rotation.x = this.userRotationX + Math.sin(currentTime * 0.001) * 0.1;

      // Inner wireframe counter rotation
      if (this.coreWireframeMesh) {
        this.coreWireframeMesh.rotation.y = -baseRotation * 1.5;
        this.coreWireframeMesh.rotation.z = baseRotation * 0.8;
      }

      // Explode sub-meshes
      const explodeOffset = 3.8 + this.explodeFactor * 3.5;
      this.coreSubMeshes.forEach(sub => {
        sub.position.copy(sub.userData.initialDir.clone().multiplyScalar(explodeOffset));
        sub.rotation.x += 0.02 * this.spinSpeed;
        sub.rotation.y += 0.02 * this.spinSpeed;
      });
    }

    // 3. Particles Particle Dynamics (Vortex effect at bottom scroll)
    if (this.particles) {
      this.particles.rotation.y = currentTime * 0.0002 + this.scrollProgress * 2.0;
      
      // Particle Vortex collapse near bottom scroll
      if (this.scrollProgress > 0.75) {
        const vortexStrength = (this.scrollProgress - 0.75) * 4;
        this.particles.rotation.z = currentTime * 0.001 * vortexStrength;
      }
    }

    // 4. Floating background shapes
    this.floatingShapes.forEach((shape, idx) => {
      shape.rotation.x += shape.userData.rotSpeedX;
      shape.rotation.y += shape.userData.rotSpeedY;
      shape.position.y += Math.sin(currentTime * 0.001 + shape.userData.floatOffset) * 0.01;
    });

    // 5. Dynamic Light tracking
    if (this.lightCyan && this.lightPurple) {
      this.lightCyan.position.x = 10 + Math.sin(currentTime * 0.001) * 5;
      this.lightCyan.position.y = 10 + Math.cos(currentTime * 0.0015) * 5;

      this.lightPurple.position.x = -10 - Math.cos(currentTime * 0.001) * 5;
      this.lightPurple.position.y = -10 - Math.sin(currentTime * 0.0015) * 5;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

window.threeScene = new SpatialThreeScene();
