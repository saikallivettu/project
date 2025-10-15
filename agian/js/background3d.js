// --- 3D BACKGROUND SCRIPT ---
// This script creates an animated 3D background using Three.js

document.addEventListener('DOMContentLoaded', function () {
    // 1. Create the canvas element that Three.js will draw on
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.prepend(canvas);

    // 2. Create a script tag to load the Three.js library
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.body.appendChild(threeScript);

    // 3. Wait for the Three.js library to load, then run our animation code
    threeScript.onload = () => {
        // === THREE.JS ANIMATION CODE START ===
        
        // Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true // Makes the canvas transparent
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        // Geometry and Material (White wireframe objects)
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            wireframe: true 
        });

        // Create and add 100 objects to the scene
        const objects = [];
        for (let i = 0; i < 100; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
            mesh.position.set(x, y, z);
            const [rx, ry, rz] = Array(3).fill().map(() => THREE.MathUtils.randFloat(0, Math.PI * 2));
            mesh.rotation.set(rx, ry, rz);
            scene.add(mesh);
            objects.push(mesh);
        }

        // Lighting
        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(5, 5, 5);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(pointLight, ambientLight);

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            objects.forEach(obj => {
                obj.rotation.x += 0.001;
                obj.rotation.y += 0.001;
                obj.position.z += 0.05;
                if (obj.position.z > camera.position.z) {
                    obj.position.z = -50; // Reset position when it moves past the camera
                }
            });
            renderer.render(scene, camera);
        }
        animate();

        // Handle window resizing
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
});
