import * as THREE from 'three'
import Models from './Models';

export default class GLApp {
    constructor() {
        window.app = this

        this.canvas = document.querySelector('canvas#sketch');
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setClearColor(0x000000, 0)
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.pixelRatio)

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 6;

        this.ambient_light = new THREE.AmbientLight(0xffffff);
        this.scene.add(this.ambient_light);
        this.dir_light = new THREE.DirectionalLight(0xffffff, 10);
        this.dir_light.position.set(5, 5, 5);
        this.scene.add(this.dir_light);

        this.mouse3D = new THREE.Vector3(9999, 9999, 0)
        this.raycaster = new THREE.Raycaster()
        this.mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

        window.addEventListener('mousemove', (e) => {
            const ndc = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            )
            this.raycaster.setFromCamera(ndc, this.camera)
            this.raycaster.ray.intersectPlane(this.mousePlane, this.mouse3D)
        })

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(this.pixelRatio)
        })

        this.models = new Models(this)

        const animate = () => {
            requestAnimationFrame(animate)
            this.renderer.render(this.scene, this.camera)
            if (this.models && this.models.grids && this.models.grids.length) {
                this.models.update(this.mouse3D)
            }
        }
        animate()
    }
}