// @ts-nocheck
import * as THREE from 'three';
import { getBiasedCoordinate, worldX, worldY } from './addRandomObjects';
import { Tree } from '@dgreenheck/ez-tree';
import { getParams } from './getParams';

function makeNewTree() {
    const tree = new Tree();
    // Set random seed for each tree
    tree.options.seed = Math.floor(Math.random() * 100000);
    tree.options.branch.levels = 3;
    
    // Set trunk length (level 0)
    // For 20% of trees, make the trunk very small
    if (Math.random() < ((getParams().grass*1) || 0.4)) {
        tree.options.branch.length[0] = 0.5 + Math.random() * 2; // Very small trunk
    } else {
        tree.options.branch.length[0] = 10.0 + Math.random() * 10; // Regular trunk length
    }
    
    // Generate tree
    tree.generate();
    const treeContainer = new THREE.Group();
    treeContainer.add(tree);

    // Apply color to the overall tree by traversing and adjusting materials
    colorizeTree(treeContainer);

    // Use entire worldX and worldY for better distribution
    const {x, z} = getBiasedCoordinate(worldX, worldY);
    
    treeContainer.position.set(x, 20, z);
    const SCALE_VARIATION = 350;
    const MIN_SCALE = 50;
    treeContainer.scale.set(MIN_SCALE + Math.random() * SCALE_VARIATION, MIN_SCALE + Math.random() * SCALE_VARIATION, MIN_SCALE + Math.random() * SCALE_VARIATION);
    return treeContainer;
}

// Function to colorize the tree by traversing the object and modifying materials
function colorizeTree(treeObj) {
    // Create color variations for trunk and leaves
    const trunkColor = new THREE.Color(
        0.4 + Math.random() * 0.2,  // Red - brownish
        0.2 + Math.random() * 0.2,  // Green
        0.05 + Math.random() * 0.1  // Blue
    );
    
    const leafColor = new THREE.Color(
        0.1 + Math.random() * 0.2,  // Red
        0.5 + Math.random() * 0.3,  // Green - dominant green
        0.1 + Math.random() * 0.2   // Blue
    );
    
    // Traverse the tree object and modify materials
    treeObj.traverse((object) => {
        if (object.isMesh) {
            // Check if this is likely a leaf or branch based on geometry or existing material
            const isLeaf = object.name.includes('leaf') || 
                          (object.material && object.material.name && object.material.name.includes('leaf'));
            
            // Clone the material to avoid affecting other trees
            if (object.material) {
                // Handle both single materials and material arrays
                if (Array.isArray(object.material)) {
                    object.material = object.material.map(mat => {
                        const newMat = mat.clone();
                        // Apply color based on whether it's a leaf or bark
                        newMat.color = isLeaf ? leafColor : trunkColor;
                        return newMat;
                    });
                } else {
                    const newMaterial = object.material.clone();
                    // Apply color based on whether it's a leaf or bark
                    newMaterial.color = isLeaf ? leafColor : trunkColor;
                    object.material = newMaterial;
                }
            }
        }
    });
    
    // Create an ambient light with reduced intensity to illuminate the tree
    const ambientLight = new THREE.AmbientLight(0xffffff, (Number(getParams().bright))||0.007); // Reduced from 0.5 to 0.1
    treeObj.add(ambientLight);
}

export default makeNewTree;