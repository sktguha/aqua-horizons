// @ts-nocheck
import * as THREE from 'three';

export function createRaindrops(scene) {
  const raindropCount = 1000; // Number of raindrops
  const raindrops = [];
  const worldSize = 10000; // Match the world size

  // Create a simple raindrop geometry
  const geometry = new THREE.SphereGeometry(2, 4, 4);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xaaddff, 
    transparent: true,
    opacity: 0.6
  });

  // Create the raindrops
  for (let i = 0; i < raindropCount; i++) {
    const drop = new THREE.Mesh(geometry, material);
    
    // Random initial position
    drop.position.x = (Math.random() - 0.5) * worldSize * 0.5;
    drop.position.y = Math.random() * 500; // Random height
    drop.position.z = (Math.random() - 0.5) * worldSize * 0.5;
    
    // Add to scene and to our array
    scene.add(drop);
    raindrops.push(drop);
  }

  return raindrops;
}