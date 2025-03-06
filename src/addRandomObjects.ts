// @ts-nocheck
import * as THREE from 'three';
import { colors, worldX, worldY, balls, speedRanges, ballSpeeds, scene, trees, treeSpeeds, squares, rectangles } from './main';

// Add random objects
export const addRandomObjects = (speedRanges) => {
  const geometry = new THREE.SphereGeometry(200, 32, 32); // Increased size by 4 times
  const OBJECTS_TO_RENDER = 5000;

  // Add balls
  for (let i = 0; i < OBJECTS_TO_RENDER; i++) { // Increased number of objects
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(
      Math.random() * worldX - worldX / 2, // Adjusted spread
      Math.random() * 200 + 10, // Increased spread
      Math.random() * worldY - worldY / 2 // Adjusted spread
    );
    balls.push(ball);
    const [minSpeed, maxSpeed] = speedRanges[color];
    ballSpeeds.push((Math.random() * (maxSpeed - minSpeed)) + minSpeed); // Random speed within range
    scene.add(ball);
  }

  // Add trees
  const treeGeometry = new THREE.ConeGeometry(200, 1000, 32); // Increased size by 4 times
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  for (let i = 0; i < OBJECTS_TO_RENDER; i++) { // Increased number of objects
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(
      Math.random() * worldX - worldX / 2, // Adjusted spread
      Math.random() * 200 + 10, // Increased spread
      Math.random() * worldY - worldY / 2 // Adjusted spread
    );
    trees.push(tree);
    treeSpeeds.push((Math.random() * 0.02) + 0.01); // Random speed
    scene.add(tree);
  }

  // Add squares
  for (let i = 0; i < 2000; i++) {
    const squareGeo = new THREE.BoxGeometry(100, 100, 100);
    const squareMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const square = new THREE.Mesh(squareGeo, squareMat);
    square.position.set(
      Math.random() * worldX - worldX / 2,
      10 + Math.random() * 100,
      Math.random() * worldY - worldY / 2
    );
    squares.push(square);
    scene.add(square);
  }

  // Add rectangles
  for (let i = 0; i < 2000; i++) {
    const rectGeo = new THREE.BoxGeometry(200, 100, 100);
    const rectMat = new THREE.MeshStandardMaterial({ color: 0xfff000 });
    const rect = new THREE.Mesh(rectGeo, rectMat);
    rect.position.set(
      Math.random() * worldX - worldX / 2,
      10 + Math.random() * 100,
      Math.random() * worldY - worldY / 2
    );
    rectangles.push(rect);
    scene.add(rect);
  }

  // Add islands
  const islandGeometry = new THREE.BoxGeometry(1000, 50, 1000); // Reduced height
  const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
  const island1 = new THREE.Mesh(islandGeometry, islandMaterial);
  island1.position.set(-1500, 25, -30); // Adjusted position to match reduced height
  scene.add(island1);

  const island2 = new THREE.Mesh(islandGeometry, islandMaterial);
  island2.position.set(1500, 25, -30); // Adjusted position to match reduced height
  scene.add(island2);

  const island3 = new THREE.Mesh(islandGeometry, islandMaterial);
  island3.position.set(0, 25, 0); // Adjusted position to match reduced height
  scene.add(island3);

  const island4 = new THREE.Mesh(islandGeometry, islandMaterial);
  island4.position.set(0, 50, 0);
  scene.add(island4);

  const island5 = new THREE.Mesh(islandGeometry, islandMaterial);
  island5.position.set(1500, 50, 0);
  scene.add(island5);

  const island6 = new THREE.Mesh(islandGeometry, islandMaterial);
  island6.position.set(-1500, 50, 0);
  scene.add(island6);

  // Add trees on islands
  const islandTreeGeometry = new THREE.ConeGeometry(100, 500, 32); // Half the current size
  const islandTreeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  for (let i = 0; i < 10; i++) { // Add 10 trees on each island
    const tree1 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree1.position.set(
      island1.position.x + (Math.random() * 800 - 400), // Random position within island
      100, // Height of the island
      island1.position.z + (Math.random() * 800 - 400) // Random position within island
    );
    scene.add(tree1);

    const tree2 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree2.position.set(
      island2.position.x + (Math.random() * 800 - 400), // Random position within island
      100, // Height of the island
      island2.position.z + (Math.random() * 800 - 400) // Random position within island
    );
    scene.add(tree2);

    const tree3 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree3.position.set(
      island3.position.x + (Math.random() * 800 - 400),
      100,
      island3.position.z + (Math.random() * 800 - 400)
    );
    scene.add(tree3);

    const tree4 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree4.position.set(
      island4.position.x + (Math.random() * 800 - 400),
      100,
      island4.position.z + (Math.random() * 800 - 400)
    );
    scene.add(tree4);

    const tree5 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree5.position.set(
      island5.position.x + (Math.random() * 800 - 400),
      100,
      island5.position.z + (Math.random() * 800 - 400)
    );
    scene.add(tree5);

    const tree6 = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree6.position.set(
      island6.position.x + (Math.random() * 800 - 400),
      100,
      island6.position.z + (Math.random() * 800 - 400)
    );
    scene.add(tree6);
  }

  // Add forest clusters
  const forestTreeGeometry = new THREE.ConeGeometry(200, 1000, 32); // Same size as regular trees
  const forestTreeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green color
  const forestPositions = [
    { x: -5000, z: -5000 },
    { x: 5000, z: -5000 },
    { x: -5000, z: 5000 },
    { x: 5000, z: 5000 }
  ];
  forestPositions.forEach(pos => {
    for (let i = 0; i < 200; i++) {
      const tree = new THREE.Mesh(forestTreeGeometry, forestTreeMaterial);
      tree.position.set(
        pos.x + (Math.random() * 2000 - 1000), // Cluster around the position
        10,
        pos.z + (Math.random() * 2000 - 1000) // Cluster around the position
      );
      trees.push(tree);
      scene.add(tree);
    }
  });
};
