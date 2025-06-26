import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";
import { LineSegmentsGeometry } from "https://esm.sh/three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "https://esm.sh/three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "https://esm.sh/three/examples/jsm/lines/LineSegments2.js";
import { maybeReattachConstraints } from "./physics.js";
import { initPhysicsScene, updatePhysics } from "./physics.js";
import { applyModulation } from "./modulation.js";
import {
  selectedParticleMovementType,
  particleMovementSpeed,
  particleForceAmount,
  particleRepellingForce,
  getAllParticles,
  updateForces,
} from "./physics.js";

export function applyParticleMovements() {
  const particles = getAllParticles();
  const now = performance.now() / 1000;

  particles.forEach(({ body }) => {
    let force;
    switch (selectedParticleMovementType) {
      case "pulsate":
        // Uses particleForceAmount as amplitude
        force = new CANNON.Vec3(
          Math.sin(now) * particleForceAmount,
          Math.sin(now + Math.PI / 2) * particleForceAmount,
          Math.sin(now + Math.PI) * particleForceAmount
        );
        break;
      case "continuous":
        force = new CANNON.Vec3(
          Math.sin(now) * particleForceAmount * 0.5,
          Math.cos(now) * particleForceAmount * 0.5,
          Math.sin(now * 0.5) * particleForceAmount * 0.5
        );
        break;
      case "oscillate":
        force = new CANNON.Vec3(
          Math.sin(now * 2) * particleForceAmount,
          Math.cos(now * 2) * particleForceAmount,
          Math.sin(now * 2) * particleForceAmount
        );
        break;
      case "spiral":
        force = new CANNON.Vec3(
          Math.cos(now) * particleForceAmount,
          Math.sin(now) * particleForceAmount,
          Math.sin(now) * Math.cos(now) * particleForceAmount
        );
        break;
      case "burst":
        if (Math.floor(now * 2) % 2 === 0) {
          force = new CANNON.Vec3(
            (Math.random() - 0.5) * particleForceAmount,
            (Math.random() - 0.5) * particleForceAmount,
            (Math.random() - 0.5) * particleForceAmount
          );
        } else {
          force = new CANNON.Vec3(0, 0, 0);
        }
        break;
      case "vortex":
        const center = new CANNON.Vec3(0, 0, 0);
        const dir = body.position.vsub(center); // vector from center to particle
        force = new CANNON.Vec3(-dir.z, 0, dir.x).unit(); // swirl around Y-axis
        force.scale(particleForceAmount, force);
        break;
      case "orbit":
        const orbitDir = new CANNON.Vec3(
          -body.position.z,
          0,
          body.position.x
        ).unit(); // rotate in XZ plane
        force = orbitDir.scale(particleForceAmount);
        break;
      case "gravity-plane":
        const distanceToPlane = body.position.y;
        force = new CANNON.Vec3(0, -distanceToPlane * particleForceAmount, 0);
        break;
      case "drift":
        force = body.velocity.clone().scale(0.1 * particleForceAmount);
        break;
      case "spring":
        const restPos =
          body.initialPosition || new CANNON.Vec3().copy(body.position);
        body.initialPosition = restPos;
        const springForce = restPos
          .vsub(body.position)
          .scale(particleForceAmount);
        force = springForce;
        break;
      case "wave":
        const waveOrigin = new CANNON.Vec3(0, 0, 0);
        const dist = body.position.distanceTo(waveOrigin);
        const phase = dist * 2 - now * 5;
        const amplitude = Math.sin(phase) * particleForceAmount;
        force = body.position.vsub(waveOrigin).unit().scale(amplitude);
        break;
      case "updraft":
        const heatLift = Math.sin(body.position.x + now) * 0.5 + 1;
        force = new CANNON.Vec3(0, heatLift * particleForceAmount, 0);
        break;
      case "wind":
        const gust = Math.sin(now * 0.5) > 0.9 ? 2 : 1;
        force = new CANNON.Vec3(1, 0, 0).scale(particleForceAmount * gust);
        break;
      case "black-hole":
        const hole = new CANNON.Vec3(0, 0, 0);
        const toHole = hole.vsub(body.position);
        const distSq = toHole.lengthSquared();
        force = toHole.scale(particleForceAmount / Math.max(distSq, 0.01));
        break;
      case "centrifuge":
        const radialDir = body.position.clone().normalize();
        force = new CANNON.Vec3(radialDir.x, radialDir.y, radialDir.z);
        force = force.scale(particleForceAmount * body.velocity.length());
        break;
      case "sinkhole":
        const sinkCenter = new CANNON.Vec3(0, 0, 0);
        const distVec = body.position.vsub(sinkCenter);
        const r = distVec.length();
        const shellR = 3;
        const towardShell = distVec.scale((shellR - r) / r);
        force = towardShell.scale(particleForceAmount);
        break;
      case "zigzag":
        const dirIndex = Math.floor(now * 5) % 4;
        const directions = [
          new CANNON.Vec3(1, 0, 0),
          new CANNON.Vec3(0, 1, 0),
          new CANNON.Vec3(-1, 0, 0),
          new CANNON.Vec3(0, -1, 0),
        ];
        force = directions[dirIndex].scale(particleForceAmount);
        break;
      case "polarize":
        const axisForce = Math.sign(body.position.y) * particleForceAmount;
        force = new CANNON.Vec3(0, axisForce, 0);
        break;
      case "swirl-noise":
        const angle = now + body.position.length() * 0.5;
        force = new CANNON.Vec3(
          Math.cos(angle) + (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          Math.sin(angle) + (Math.random() - 0.5) * 0.2
        ).scale(particleForceAmount);
        break;
      case "jitter":
        force = new CANNON.Vec3(
          (Math.random() - 0.5) * particleForceAmount,
          (Math.random() - 0.5) * particleForceAmount,
          (Math.random() - 0.5) * particleForceAmount
        );
        break;
      case "tornado":
        const tornadoCenter = new CANNON.Vec3(0, body.position.y, 0); // vertical axis at origin
        const toAxis = tornadoCenter.vsub(body.position); // vector toward axis
        const radiusVec = new CANNON.Vec3(-toAxis.z, 0, toAxis.x).unit(); // swirl around Y-axis
        const heightLift = new CANNON.Vec3(0, 1, 0); // upward
        const swirlForce = radiusVec.scale(particleForceAmount * 1.0);
        const inwardForce = toAxis.scale(0.3); // centripetal pull
        const upForce = heightLift.scale(0.5 * particleForceAmount);
        force = swirlForce.vadd(inwardForce).vadd(upForce);
        break;

      default:
        const randomScale = 8;
        force = new CANNON.Vec3(
          (Math.random() - 0.5) * particleForceAmount * randomScale,
          (Math.random() - 0.5) * particleForceAmount * randomScale,
          (Math.random() - 0.5) * particleForceAmount * randomScale
        );
        break;
    }

    // Let particleMovementSpeed be a global intensity scaler on top
    if (force) {
      force.scale(particleMovementSpeed, force);
      body.applyForce(force, body.position);
    }
  });
}

function createThickBox(size = 10, color = 0x888888, linewidth = 4) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(geometry);
  const pos = [];
  for (let i = 0; i < edges.attributes.position.count; i++) {
    pos.push(edges.attributes.position.getX(i));
    pos.push(edges.attributes.position.getY(i));
    pos.push(edges.attributes.position.getZ(i));
  }
  const lineGeo = new LineSegmentsGeometry();
  lineGeo.setPositions(pos);

  const mat = new LineMaterial({
    color: color,
    linewidth: linewidth, // In pixels
    worldUnits: false, // false = screen space (pixels)
    dashed: false,
    alphaToCoverage: true,
  });

  mat.resolution.set(window.innerWidth, window.innerHeight);

  const line = new LineSegments2(lineGeo, mat);
  return line;
}

let scene, camera, renderer, clock;
export { scene };

export function initScene() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  const loader2 = new THREE.TextureLoader();
  loader2.load("logo/alien.png", function (texture) {
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.FrontSide, // or DoubleSide if you want
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, -5 + 0.01); // FRONT wall, facing the camera
    scene.add(plane);
  });

  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "skybox/front.png",
    "skybox/back.png",
    "skybox/top.png",
    "skybox/bottom.png",
    "skybox/left.png",
    "skybox/right.png",
  ]);
  scene.background = texture;

  // --- Camera setup ---
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 12);
  camera.lookAt(0, 0, 0);

  // --- Renderer setup ---
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // --- Lighting ---
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(8, 15, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(dirLight);

  // Ambient light for overall fill
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // --- Physics and cube bounding helper ---
  initPhysicsScene(scene);
  const cubeHelper = new THREE.BoxHelper(
    new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10))
  );
  cubeHelper.material.color.set(0x444444);
  scene.add(cubeHelper);

  const thickBox = createThickBox(10, 0x888888, 4);
  scene.add(thickBox);

  window.addEventListener("resize", () => {
    thickBox.material.resolution.set(window.innerWidth, window.innerHeight);
  });
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function animateScene() {
  requestAnimationFrame(animateScene);
  const delta = clock.getDelta();
  updatePhysics(delta);
  applyParticleMovements();
  updateForces();
  applyModulation();
  maybeReattachConstraints();
  renderer.render(scene, camera);
}
