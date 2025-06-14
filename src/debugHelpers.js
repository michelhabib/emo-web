/**
 * Creates debug helpers for the scene
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @returns {Object} Object containing debug helper functions
 */
function createDebugHelpers(scene) {
    let coordinateSystemVisible = false;
    let coordinateSystemElements = [];

    // Helper function to create labels
    const createLabel = (text, color, fontSize = 20, mesh = null, offsetX = 0, offsetY = 0, offsetZ = 0) => {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const label = new BABYLON.GUI.TextBlock();
        label.text = text;
        label.color = color;
        label.fontSize = fontSize;
        advancedTexture.addControl(label);
        
        if (mesh) {
            label.linkWithMesh(mesh);
            if (offsetX !== 0) label.linkOffsetX = offsetX;
            if (offsetY !== 0) label.linkOffsetY = offsetY;
            if (offsetZ !== 0) label.linkOffsetZ = offsetZ;
        }
        
        return label;
    };

    // Helper function to create axis cylinders
    const createAxis = (name, color, height = 5, diameter = 0.1, rotation = null, position = null) => {
        const axis = BABYLON.MeshBuilder.CreateCylinder(name, {height, diameter}, scene);
        
        if (rotation) {
            if (rotation.x !== undefined) axis.rotation.x = rotation.x;
            if (rotation.y !== undefined) axis.rotation.y = rotation.y;
            if (rotation.z !== undefined) axis.rotation.z = rotation.z;
        }
        
        if (position) {
            if (position.x !== undefined) axis.position.x = position.x;
            if (position.y !== undefined) axis.position.y = position.y;
            if (position.z !== undefined) axis.position.z = position.z;
        }
        
        const material = new BABYLON.StandardMaterial(`${name}Mat`, scene);
        material.diffuseColor = color;
        axis.material = material;
        
        return axis;
    };

    // Helper function to create marker spheres
    const createMarker = (name, color, diameter = 0.3, position = null) => {
        const marker = BABYLON.MeshBuilder.CreateSphere(name, {diameter}, scene);
        const material = new BABYLON.StandardMaterial(`${name}Mat`, scene);
        material.diffuseColor = color;
        marker.material = material;
        
        if (position) {
            marker.position = position.clone ? position.clone() : new BABYLON.Vector3(position.x || 0, position.y || 0, position.z || 0);
        }
        
        return marker;
    };

    // Helper function to clear coordinate system elements
    const clearCoordinateSystem = () => {
        coordinateSystemElements.forEach(element => {
            if (element.dispose) {
                element.dispose();
            }
        });
        coordinateSystemElements = [];
    };

    const debugHelpers = {
        // Toggle wireframe mode for all meshes
        toggleWireframe: () => {
            scene.meshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.wireframe = !mesh.material.wireframe;
                }
            });
        },

        // Toggle bounding box display for all meshes
        toggleBoundingBoxes: () => {
            scene.meshes.forEach(mesh => {
                mesh.showBoundingBox = !mesh.showBoundingBox;
            });
        },

        // Log scene statistics
        logSceneStats: () => {
            const stats = [
                ['Meshes', scene.meshes.length],
                ['Materials', scene.materials.length],
                ['Textures', scene.textures.length],
                ['Lights', scene.lights.length],
                ['Cameras', scene.cameras.length]
            ];
            
            console.log('Scene Statistics:');
            stats.forEach(([name, count]) => console.log(`- ${name}: ${count}`));
        },

        // Toggle coordinate system visibility
        toggleCoordinateSystem: () => {
            if (coordinateSystemVisible) {
                clearCoordinateSystem();
                coordinateSystemVisible = false;
                console.log('Coordinate system hidden');
            } else {
                debugHelpers.createCoordinateSystem();
                coordinateSystemVisible = true;
                console.log('Coordinate system shown');
            }
        },

        // Create detailed coordinate system with labels and markers
        createCoordinateSystem: () => {
            clearCoordinateSystem();

            // Define axis configurations
            const axisConfigs = [
                { name: "xAxis", color: BABYLON.Color3.Red(), rotation: {z: -Math.PI/2}, position: {x: 2.5}, label: "X", labelColor: "red", labelOffset: {x: 30} },
                { name: "yAxis", color: BABYLON.Color3.Green(), position: {y: 2.5}, label: "Y", labelColor: "green", labelOffset: {y: -30} },
                { name: "zAxis", color: BABYLON.Color3.Blue(), rotation: {x: Math.PI/2}, position: {z: 2.5}, label: "Z", labelColor: "blue", labelOffset: {z: 30} }
            ];

            // Create axes and their labels
            axisConfigs.forEach(config => {
                const axis = createAxis(config.name, config.color, 5, 0.1, config.rotation, config.position);
                coordinateSystemElements.push(axis);
                
                const label = createLabel(config.label, config.labelColor, 24, axis, 
                    config.labelOffset.x || 0, config.labelOffset.y || 0, config.labelOffset.z || 0);
                coordinateSystemElements.push(label);
            });

            // Define marker configurations
            const markerConfigs = [
                { name: "origin", color: BABYLON.Color3.Yellow(), position: {x: 0, y: 0, z: 0}, labelText: "Origin (0,0,0)", labelColor: "yellow" },
                { name: "cameraMarker", color: BABYLON.Color3.Purple(), position: scene.activeCamera.position, labelText: "Camera", labelColor: "purple" }
            ];

            // Add light marker if light exists
            const light = scene.lights[0];
            if (light) {
                let lightPosition;
                if (light.position) {
                    lightPosition = light.position;
                } else if (light.direction) {
                    lightPosition = light.direction.scale(-5);
                }
                
                if (lightPosition) {
                    markerConfigs.push({
                        name: "lightMarker", 
                        color: BABYLON.Color3.FromHexString("#FFA500"), 
                        position: lightPosition, 
                        labelText: "Light", 
                        labelColor: "orange"
                    });
                }
            }

            // Create markers and their labels
            markerConfigs.forEach(config => {
                const marker = createMarker(config.name, config.color, 0.3, config.position);
                coordinateSystemElements.push(marker);
                
                const label = createLabel(config.labelText, config.labelColor, 20, marker, 0, -40);
                coordinateSystemElements.push(label);
            });

            return coordinateSystemElements;
        }
    };

    // Define keyboard shortcuts configuration
    const keyboardShortcuts = [
        { key: 'w', action: 'toggleWireframe', message: 'Wireframe toggled' },
        { key: 'b', action: 'toggleBoundingBoxes', message: 'Bounding boxes toggled' },
        { key: 's', action: 'logSceneStats', message: null },
        { key: 'c', action: 'toggleCoordinateSystem', message: null }
    ];

    // Add keyboard shortcuts for debug functions
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            const shortcut = keyboardShortcuts.find(s => s.key === kbInfo.event.key.toLowerCase());
            if (shortcut) {
                debugHelpers[shortcut.action]();
                if (shortcut.message) console.log(shortcut.message);
            }
        }
    });

    // Log available keyboard shortcuts
    console.log('Debug helpers loaded. Keyboard shortcuts:');
    keyboardShortcuts.forEach(shortcut => {
        console.log(`- ${shortcut.key.toUpperCase()}: ${shortcut.action.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    });

    return debugHelpers;
}

// Make the function available globally
window.createDebugHelpers = createDebugHelpers;