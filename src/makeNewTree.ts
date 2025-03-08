import * as THREE from 'three';
import { deepBrownShades, getBiasedCoordinate, worldX, worldY } from './addRandomObjects';
import { Tree } from '@dgreenheck/ez-tree';
 function makeNewTreeOld(){
    const treeHeight = 1000 + Math.random() * 3000;
    const treeGeometry = new THREE.ConeGeometry(200, treeHeight, 200); // Reduced size
    const {x,z} = getBiasedCoordinate(worldX, worldY);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: deepBrownShades[Math.floor(Math.random() * deepBrownShades.length)] });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);

    // Prevent trees from being generated near the user's spawn position (within a radius of 1000 units)
    const distanceFromOrigin = Math.sqrt(x * x + z * z);
    if (distanceFromOrigin < 1000) {
      return false;
    }

    tree.position.set(x, treeHeight / 2, z);

    // Consolidate crown addition: crown radius proportional to tree height (e.g. treeHeight/10)
    const crownRadius = treeHeight / 2;
    const crownGeometry = new THREE.SphereGeometry(crownRadius, 32, 16);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    // Position crown at the top of the tree
    crown.position.set(0, treeHeight / 2, 0);
    tree.add(crown);

    return tree;
  }
  const tree = new Tree();

  // Set parameters
  tree.options.seed = 12345;
//   tree.options.trunk.length = 20;
  tree.options.branch.levels = 3;
  function makeNewTree(){
    

// Generate tree and add to your Three.js scene
    return tree.generate();
  }

  export default makeNewTree;