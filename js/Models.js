import * as THREE from 'three';
import { gsap } from 'gsap';
export default class Models {
  constructor(gl_app) {
    this.scene = gl_app.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.gridSize = 24;
    this.spacing = 0.65;
    this.grids_config = [
      {
        id: 'heart',
        mask: `codrops.jpg`,
        image: `pool.jpg`,
      },
    ];
    this.grids_config.forEach((config, index) =>
      this.createMask(config, index)
    );
    this.group.scale.setScalar(0.15);
    this.is_ready = true;
    this.grids = [];
  }

  createMask(config, index) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maskImage = new Image();
    maskImage.crossOrigin = 'anonymous';
    maskImage.onload = () => {
      const aspectRatio = maskImage.width / maskImage.height;
      if (aspectRatio > 1) {
        this.gridWidth = this.gridSize;
        this.gridHeight = Math.round(this.gridSize / aspectRatio);
      } else {
        this.gridHeight = this.gridSize;
        this.gridWidth = Math.round(this.gridSize * aspectRatio);
      }
      canvas.width = this.gridWidth;
      canvas.height = this.gridHeight;
      ctx.drawImage(maskImage, 0, 0, this.gridWidth, this.gridHeight);
      this.data = ctx.getImageData(0, 0, this.gridWidth, this.gridHeight).data;
      this.createGrid(config, index);
    };
    maskImage.src = `/images/${config.mask}`;
  }

  createImageTexture(config) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(`/images/${config.image}`);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
    });
  }

  createGrid(config, index) {
    this.createImageTexture(config);
    const grid_group = new THREE.Group();
    this.group.add(grid_group);
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const flippedY = this.gridHeight - 1 - y;
        const pixelIndex = (flippedY * this.gridWidth + x) * 4;
        const brightness =
          (this.data[pixelIndex] +
            this.data[pixelIndex + 1] +
            this.data[pixelIndex + 2]) /
          3;
        if (brightness < 128) {
          const uvX = x / this.gridSize;
          const uvY = y / this.gridSize;
          const uvWidth = 1 / this.gridSize;
          const uvHeight = 1 / this.gridSize;
          const uvArray = geometry.attributes.uv.array;
          for (let i = 0; i < uvArray.length; i += 2) {
            uvArray[i] = uvX + uvArray[i] * uvWidth;
            uvArray[i + 1] = uvY + uvArray[i + 1] * uvHeight;
          }
          geometry.attributes.uv.needsUpdate = true;
          const mesh = new THREE.Mesh(geometry, this.material);
          mesh.position.x = (x - (this.gridSize - 1) / 2) * this.spacing;
          mesh.position.y = (y - (this.gridSize - 1) / 2) * this.spacing;
          mesh.position.z = 0;
          grid_group.add(mesh);
        }
      }
    }
    grid_group.name = config.id;
    this.grids.push(grid_group);
  }
  update(mouse) {
    if (!this.grids.length) return;
    const grid = this.grids[0];
    grid.children.forEach((mesh) => {
      const dx = mesh.position.x - mouse.x * 4;
      const dy = mesh.position.y - mouse.y * 3;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 2.0 - dist) * 3.0;
      mesh.position.z += (force - mesh.position.z) * 0.15;
    });
  }
}
