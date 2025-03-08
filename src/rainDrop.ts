// @ts-nocheck
import * as THREE from 'three';
export const POS_MULTIPLIER = 50;
export function createRaindrops(scene) {
    const raindropCount = 50000 / 3; // Number of raindrops
    const raindrops = [];
    const worldSize = 10000; // Match the world size

    // Create a simple raindrop geometry
    const geometry = new THREE.SphereGeometry(0.5, 4, 4);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.6
    });

    // Create the raindrops
    for (let i = 0; i < raindropCount; i++) {
        const drop = new THREE.Mesh(geometry, material);

        // Position raindrops in a very narrow volume in front of player
        // X: distribute left/right around player (-50 to 50)
        drop.position.x = (Math.random() - 0.5) * 200;

        // Y: position in a lower height range
        drop.position.y = Math.random() * 500 + 50;

        // Z: tightly focused in front of player (-20 to 150)
        drop.position.z = -20 + Math.random() * 200;

        // Add to scene and to our array
        scene.add(drop);
        raindrops.push(drop);
    }

    return raindrops;
}