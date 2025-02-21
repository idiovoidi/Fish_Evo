# 3D Models Directory

This directory contains the 3D models used in the Fish Evolution project.

## File Structure
- `fish.gltf`: Main fish model definition
- `fish.bin`: Binary data for the fish model (vertex positions, normals, etc.)

## Model Specifications
- Format: glTF 2.0
- Scale: 1 unit = 1 meter
- Forward axis: -Z
- Up axis: Y

## Modifying Models
When modifying the models, please ensure:
1. Models are properly optimized for real-time rendering
2. All meshes have proper normals for lighting
3. UV coordinates are included if using textures
4. Models follow the correct scale and axis orientation

## Integration
The models in this directory are loaded by the main application using Babylon.js's built-in glTF loader. See `fish.js` for implementation details. 