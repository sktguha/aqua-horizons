import * as THREE from 'three';
import { deepBrownShades, getBiasedCoordinate, worldX, worldY } from './addRandomObjects';
import { Tree } from '@dgreenheck/ez-tree';

  function makeNewTree(){
    const tree = new Tree();
    // Set parameters
    tree.options.seed = 12345;
    // tree.options.trunk.length = 20;
    tree.options.branch.levels = 3;

    // Generate tree and add to your Three.js scene
    tree.generate();
    const treeContainer = new THREE.Group();
    treeContainer.add(tree);

    // Set the group's position
    treeContainer.position.set( 2000+Math.random() * 2000, 0, 2000+Math.random() * 2000);
    treeContainer.scale.set(5 + Math.random()*15, 5+Math.random()*15, 5+Math.random()*15);
    return treeContainer;
  }

  export default makeNewTree;