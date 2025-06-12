import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {GLTFLoader, OrbitControls} from "three/addons";

const Pigeon = () => {
    const containerRef = useRef(null); // Reference for the container div

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene, Camera, Renderer Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Load the Model
        let object;
        const objToRender = "pigeon";
        const loader = new GLTFLoader();

        let controls

        loader.load(
            `./models/${objToRender}/scene.gltf`,
            (gltf) => {
                object = gltf.scene;
                object.scale.set(500,500,500)
                scene.add(object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.error("Error loading model:", error);
            }
        );

        camera.position.set(70, 70, 130); // Move the camera forward
        camera.lookAt(0, 0, 0); // Ensure it is looking at the scene

        // Lighting
        const topLight = new THREE.DirectionalLight(0xffffff, 1);
        topLight.position.set(500, 500, 500);
        scene.add(topLight);

        const ambientLight = new THREE.AmbientLight(0x333333,  12);
        scene.add(ambientLight);

        controls = new OrbitControls(camera, renderer.domElement);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup when component unmounts
        return () => {
            containerRef.current.removeChild(renderer.domElement);
            scene.clear();
        };
    }, []);

    return <div ref={containerRef} style={{ width: "100vw", height: "100vh"}} ></div>;
};

export default Pigeon;