import * as THREE from "https://esm.sh/three";
import * as CANNON from "https://esm.sh/cannon-es";

export let selectedParticleMovementType = "random";
export let particleMovementSpeed = 0.5;
export let particleForceAmount = 15;
export let particleRepellingForce = 15;
export let electronInfluenceForce = 15;
export let electronAttractionTime = 1000; // ms
export let electronRepulsionTime = 1000; // ms

let isAttracting = true;
let lastSwitchTime = performance.now();
let neutronProtonDistance = 2.5; // default value
let particleIdCounter = 0;
const protons = new Map();
const neutrons = new Map();
const electrons = [];

// API to set these from UI
export function setElectronInfluenceForce(val) {
  electronInfluenceForce = val;
}
export function setElectronAttractionTime(val) {
  electronAttractionTime = val;
}
export function setElectronRepulsionTime(val) {
  electronRepulsionTime = val;
}
export function setNeutronProtonDistance(val) {
  neutronProtonDistance = val;
  attachNeutronsToProtons(val);
}
// For hot reload in module
export function setParticleMovementType(type) {
  selectedParticleMovementType = type;
}
export function setParticleMovementSpeed(val) {
  particleMovementSpeed = val;
}
export function setParticleForceAmount(val) {
  particleForceAmount = val;
}
export function setParticleRepellingForce(val) {
  particleRepellingForce = val;
}

export let protonColor = 0xff0000;
export let neutronColor = 0x0000ff;
export let electronColor = 0x00ffff;

export function setProtonColor(hex) {
  protonColor = hex;
  // Update existing protons
  protons.forEach(({ mesh }) => mesh.material.color.setHex(hex));
}
export function setNeutronColor(hex) {
  neutronColor = hex;
  neutrons.forEach(({ mesh }) => mesh.material.color.setHex(hex));
}
export function setElectronColor(hex) {
  electronColor = hex;
  electrons.forEach(({ mesh }) => mesh.material.color.setHex(hex));
}

const world = new CANNON.World();

world.gravity.set(0, 0, 0);

// Shared bouncy material
const bouncyMaterial = new CANNON.Material("bouncy");

world.defaultContactMaterial = new CANNON.ContactMaterial(
  bouncyMaterial,
  bouncyMaterial,
  {
    restitution: 1.0,
    friction: 0.0,
  }
);

export function addProton(scene, color) {
  const id = `proton-${particleIdCounter++}`;
  const radius = 0.5;
  const shape = new CANNON.Sphere(radius);
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: color !== undefined ? color : protonColor,
    })
  );

  const body = new CANNON.Body({
    mass: 1,
    shape,
    material: bouncyMaterial,
  });
  // Small initial impulse
  body.applyImpulse(
    new CANNON.Vec3(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    ),
    body.position
  );

  const margin = 0.5; // stay away from walls slightly
  const halfSize = 5 - margin;

  body.position.set(
    (Math.random() * 2 - 1) * halfSize, // X ∈ [-4.5, 4.5]
    (Math.random() * 2 - 1) * halfSize, // Y ∈ [-4.5, 4.5]
    (Math.random() * 2 - 1) * halfSize // Z ∈ [-4.5, 4.5]
  );
  body.linearDamping = 0.1;
  scene.add(mesh);
  world.addBody(body);
  protons.set(id, { id, mesh, body, type: "proton" });

  return id;
}

export function addNeutron(scene, color) {
  const id = `neutron-${particleIdCounter++}`;
  const radius = 0.4;
  const shape = new CANNON.Sphere(radius);
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: color !== undefined ? color : neutronColor,
    })
  );

  const body = new CANNON.Body({
    mass: 1,
    shape,
    material: bouncyMaterial,
  });
  // Small initial impulse
  body.applyImpulse(
    new CANNON.Vec3(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    ),
    body.position
  );

  const margin = 0.5; // stay away from walls slightly
  const halfSize = 5 - margin;

  body.position.set(
    (Math.random() * 2 - 1) * halfSize, // X ∈ [-4.5, 4.5]
    (Math.random() * 2 - 1) * halfSize, // Y ∈ [-4.5, 4.5]
    (Math.random() * 2 - 1) * halfSize // Z ∈ [-4.5, 4.5]
  );
  body.linearDamping = 0.01;
  scene.add(mesh);
  world.addBody(body);
  neutrons.set(id, { id, mesh, body, type: "neutron" });
  return id;
}

export function addElectron(scene, position) {
  const id = `electron-${particleIdCounter++}`;
  const radius = 0.35;
  const shape = new CANNON.Sphere(radius);
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: electronColor });

  const mesh = new THREE.Mesh(geometry, material);
  const body = new CANNON.Body({
    mass: 0.5,
    shape,
    material: bouncyMaterial,
  });

  const margin = 0.5; // stay away from walls slightly
  const halfSize = 5 - margin;

  // Use explicit position (if restoring), or random
  if (position) {
    body.position.set(position.x, position.y, position.z);
  } else {
    body.position.set(
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize,
      (Math.random() * 2 - 1) * halfSize
    );
  }

  body.linearDamping = 0.05;
  body.angularDamping = 0.01;

  // Initial impulse (only if random position)
  if (!position) {
    body.applyImpulse(
      new CANNON.Vec3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ),
      body.position
    );
  }

  scene.add(mesh);
  world.addBody(body);
  const electronObj = { id, mesh, body, type: "electron" };
  electrons.push(electronObj);
  return electronObj;
}

export function getAllParticles() {
  return [...protons.values(), ...neutrons.values()];
}

export function getAllParticleTypes() {
  return [...protons.values(), ...neutrons.values(), ...electrons];
}

export function getElectrons() {
  return electrons.map(({ mesh, body }) => ({ mesh, body }));
}

export function initPhysicsScene(scene) {
  createBoundingBox();
}

export function updatePhysics(delta) {
  world.step(1 / 60);

  const all = [...protons.values(), ...neutrons.values(), ...electrons];
  all.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    //clamp velocity to prevent escape
    body.velocity.x = Math.max(-20, Math.min(20, body.velocity.x));
    body.velocity.y = Math.max(-20, Math.min(20, body.velocity.y));
    body.velocity.z = Math.max(-20, Math.min(20, body.velocity.z));
  });
}

function createWall(position, size) {
  const shape = new CANNON.Box(size);
  const body = new CANNON.Body({
    mass: 0,
    shape,
    material: bouncyMaterial,
  });
  body.position.copy(position);
  world.addBody(body);
}

function createBoundingBox(boxSize = 10) {
  const half = boxSize / 2;
  const thickness = 1.0;
  // +Z / Front
  createWall(
    new CANNON.Vec3(0, 0, -half),
    new CANNON.Vec3(half, half, thickness)
  );
  // -Z / Back
  createWall(
    new CANNON.Vec3(0, 0, half),
    new CANNON.Vec3(half, half, thickness)
  );
  // -X / Left
  createWall(
    new CANNON.Vec3(-half, 0, 0),
    new CANNON.Vec3(thickness, half, half)
  );
  // +X / Right
  createWall(
    new CANNON.Vec3(half, 0, 0),
    new CANNON.Vec3(thickness, half, half)
  );
  // +Y / Top
  createWall(
    new CANNON.Vec3(0, half, 0),
    new CANNON.Vec3(half, thickness, half)
  );
  // -Y / Bottom
  createWall(
    new CANNON.Vec3(0, -half, 0),
    new CANNON.Vec3(half, thickness, half)
  );
}

// --- Attraction/Repulsion phase switching (call every frame!) ---
function switchElectronInfluencePhase() {
  const now = performance.now();
  const elapsed = now - lastSwitchTime;
  if (isAttracting && elapsed > electronAttractionTime) {
    isAttracting = false;
    lastSwitchTime = now;
  } else if (!isAttracting && elapsed > electronRepulsionTime) {
    isAttracting = true;
    lastSwitchTime = now;
  }
}

// --- Apply electron force on protons/neutrons based on current phase ---
function applyElectronInfluence() {
  const forceSign = isAttracting ? 1 : -1;

  protons.forEach(({ body: protonBody }) => {
    electrons.forEach(({ body: electronBody }) => {
      const direction = electronBody.position.vsub(protonBody.position);
      const distance = direction.length();

      if (distance > 0.001) {
        const force = direction.scale(
          (electronInfluenceForce * forceSign) / (distance * distance)
        );
        protonBody.applyForce(force, protonBody.position);
        electronBody.applyForce(force.scale(-1), electronBody.position); // ← ADD THIS
      }
    });
  });

  neutrons.forEach(({ body: neutronBody }) => {
    electrons.forEach(({ body: electronBody }) => {
      const direction = electronBody.position.vsub(neutronBody.position);
      const distance = direction.length();

      if (distance > 0.001) {
        const force = direction.scale(
          (electronInfluenceForce * forceSign) / (distance * distance)
        );
        neutronBody.applyForce(force, neutronBody.position);
        electronBody.applyForce(force.scale(-1), electronBody.position);
      }
    });
  });
}

function applyRepellingForces() {
  // --- Proton-Proton repulsion ---
  const protonArray = [...protons.values()];
  for (let i = 0; i < protonArray.length; i++) {
    for (let j = i + 1; j < protonArray.length; j++) {
      const bodyA = protonArray[i].body;
      const bodyB = protonArray[j].body;
      const direction = bodyB.position.vsub(bodyA.position);
      const distance = direction.length();
      if (distance > 0.01) {
        // Inverse square law, repelling
        const force = direction
          .unit()
          .scale(particleRepellingForce / (distance * distance));
        bodyA.applyForce(force.scale(-1), bodyA.position);
        bodyB.applyForce(force, bodyB.position);
      }
    }
  }

  // --- Electron-Electron repulsion ---
  for (let i = 0; i < electrons.length; i++) {
    for (let j = i + 1; j < electrons.length; j++) {
      const bodyA = electrons[i].body;
      const bodyB = electrons[j].body;
      const direction = bodyB.position.vsub(bodyA.position);
      const distance = direction.length();
      if (distance > 0.01) {
        const force = direction
          .unit()
          .scale(particleRepellingForce / (distance * distance));
        bodyA.applyForce(force.scale(-1), bodyA.position);
        bodyB.applyForce(force, bodyB.position);
      }
    }
  }
}

// --- Attach distance constraints between protons and neutrons ---
let constraints = [];
function attachNeutronsToProtons(distance = neutronProtonDistance) {
  // Remove old
  constraints.forEach((c) => world.removeConstraint(c));
  constraints = [];
  protons.forEach(({ body: protonBody }) => {
    neutrons.forEach(({ body: neutronBody }) => {
      const constraint = new CANNON.DistanceConstraint(
        protonBody,
        neutronBody,
        distance
      );
      world.addConstraint(constraint);
      constraints.push(constraint);
    });
  });
}

export function setCurrentForceInfluence(val) {
  currentForceInfluence = val;
}

let currentForceInfluence = "electrostatic";

export function updateForces(time) {
  switch (currentForceInfluence) {
    case "electrostatic":
      switchElectronInfluencePhase();
      applyElectronInfluence();
      applyRepellingForces();
      break;
    case "magnetic":
      applyMagneticField();
      break;
    case "electric":
      applyElectricField();
      break;
    case "brownian":
      applyBrownianMotion();
      break;
    case "attractor":
      applyAttractorInfluence();
      break;
    case "lfo":
      applyLFOInfluence(time);
      break;
    case "orbital":
      applyOrbitalTorque();
      break;
  }
}

let constraintsEnabled = true;
let impulseCooldown = 0;

let disableConstraintReattachment = false;

export function applyUserImpulse() {
  constraints.forEach((c) => world.removeConstraint(c));
  constraints.length = 0;
  constraintsEnabled = false;
  disableConstraintReattachment = true;

  [...protons.values(), ...neutrons.values(), ...electrons].forEach(
    ({ body }) => {
      const impulse = new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      body.applyImpulse(impulse, body.position);
    }
  );
}

export function maybeReattachConstraints() {
  if (disableConstraintReattachment) return;
  if (!constraintsEnabled && performance.now() > impulseCooldown) {
    constraintsEnabled = true;
    attachNeutronsToProtons();
  }
}

export function removeAllParticles(scene) {
  [...protons.values()].forEach(({ mesh, body }) => {
    scene.remove(mesh);
    world.removeBody(body);
  });
  protons.clear();
  [...neutrons.values()].forEach(({ mesh, body }) => {
    scene.remove(mesh);
    world.removeBody(body);
  });
  neutrons.clear();
  electrons.forEach(({ mesh, body }) => {
    scene.remove(mesh);
    world.removeBody(body);
  });
  electrons.length = 0;
}

export let magneticFieldStrength = 2.5; // UI control

function applyMagneticField() {
  electrons.forEach(({ body }) => {
    // F = q(v × B), with q = -1 for electron
    const velocity = body.velocity;
    const B = new CANNON.Vec3(0, 0, magneticFieldStrength); // Uniform Z field
    const force = velocity.cross(B).scale(-1); // negative charge
    body.applyForce(force, body.position);
  });
  protons.forEach(({ body }) => {
    const velocity = body.velocity;
    const B = new CANNON.Vec3(0, 0, magneticFieldStrength);
    const force = velocity.cross(B); // positive charge
    body.applyForce(force, body.position);
  });
}

export let electricField = new CANNON.Vec3(1, 0, 0); // UI: user sets direction/intensity

function applyElectricField() {
  electrons.forEach(({ body }) => {
    // F = qE, q = -1
    const force = electricField.scale(-1);
    body.applyForce(force, body.position);
  });
  protons.forEach(({ body }) => {
    const force = electricField.clone();
    body.applyForce(force, body.position);
  });
}

export let thermalEnergy = 1.0; // UI control

function applyBrownianMotion() {
  [...protons.values(), ...neutrons.values(), ...electrons].forEach(
    ({ body }) => {
      body.applyImpulse(
        new CANNON.Vec3(
          (Math.random() - 0.5) * thermalEnergy,
          (Math.random() - 0.5) * thermalEnergy,
          (Math.random() - 0.5) * thermalEnergy
        ),
        body.position
      );
    }
  );
}

export let attractorPoint = new CANNON.Vec3(0, 0, 0);
export let attractorForce = 10.0; // UI

function applyAttractorInfluence() {
  [...protons.values(), ...neutrons.values(), ...electrons].forEach(
    ({ body }) => {
      const direction = attractorPoint.vsub(body.position);
      const dist = direction.length();
      if (dist > 0.1) {
        const force = direction.scale(attractorForce / (dist * dist));
        body.applyForce(force, body.position);
      }
    }
  );
}

export let lfoFrequency = 0.2; // Hz
export let lfoAmplitude = 10.0;

function applyLFOInfluence(time) {
  if (!isFinite(lfoFrequency) || !isFinite(lfoAmplitude)) {
    console.warn("LFO: Invalid frequency or amplitude", {
      lfoFrequency,
      lfoAmplitude,
    });
    return;
  }
  const lfo = Math.sin(2 * Math.PI * lfoFrequency * time) * lfoAmplitude;

  if (!isFinite(lfo)) {
    console.warn("LFO output is NaN!", { lfo });
    return;
  }
  const field = new CANNON.Vec3(lfo, 0, 0);

  function safeApplyForce(body, force, pos) {
    if (isFinite(force.x) && isFinite(force.y) && isFinite(force.z)) {
      body.applyForce(force, pos);
    } else {
      console.warn("Force is NaN! Skipping force application.", force);
    }
  }
  electrons.forEach(({ body }) => {
    safeApplyForce(body, field.scale(-1), body.position);
  });
  protons.forEach(({ body }) => {
    safeApplyForce(body, field, body.position);
  });
  protons.forEach(({ body }) => {
    console.log("Proton pos:", body.position);
  });
}

export let orbitalTorque = 1.0;

function applyOrbitalTorque(center = new CANNON.Vec3(0, 0, 0)) {
  electrons.forEach(({ body }) => {
    const r = body.position.vsub(center);
    const forceDir = new CANNON.Vec3(-r.y, r.x, 0).unit(); // Perpendicular in XY
    const force = forceDir.scale(orbitalTorque);
    body.applyForce(force, body.position);
  });
}

window.getAllParticleTypes = getAllParticleTypes;
