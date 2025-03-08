import * as THREE from 'three';
import { deepBrownShades, getBiasedCoordinate, worldX, worldY } from './addRandomObjects';
import { Tree } from '@dgreenheck/ez-tree';

function makeNewTree() {
    const tree = new Tree();
    // Set random seed for each tree
    tree.options.seed = Math.floor(Math.random() * 100000);
    tree.options.branch.levels = 3;

    // Generate tree
    tree.generate();
    const treeContainer = new THREE.Group();
    treeContainer.add(tree);

    // Use entire worldX and worldY for better distribution
    const x = Math.random() * worldX - worldX / 2; // Full world range
    const z = Math.random() * worldY - worldY / 2; // Full world range
    
    treeContainer.position.set(x, 20, z);
    const SCALE_VARIATION = 350;
    const MIN_SCALE = 50;
    treeContainer.scale.set(MIN_SCALE + Math.random() * SCALE_VARIATION, MIN_SCALE + Math.random() * SCALE_VARIATION, MIN_SCALE + Math.random() * SCALE_VARIATION);
    return treeContainer;
}

export default makeNewTree;