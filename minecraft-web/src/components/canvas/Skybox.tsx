import * as THREE from 'three';

export class Skybox {
  public group: THREE.Group;
  public sunMesh: THREE.Mesh;
  public moonMesh: THREE.Mesh;
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public stars: THREE.Points;
  public timeOfDay = 0.25; // 0 to 1 (0 = sunrise, 0.25 = noon, 0.5 = sunset, 0.75 = midnight)

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    // Ambient Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(this.ambientLight);

    // Directional Sun Light
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    this.sunLight.shadow.camera.left = -40;
    this.sunLight.shadow.camera.right = 40;
    this.sunLight.shadow.camera.top = 40;
    this.sunLight.shadow.camera.bottom = -40;
    scene.add(this.sunLight);

    // Square Sun
    const sunGeo = new THREE.PlaneGeometry(16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffae0, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(0, 100, 0);
    this.sunMesh.rotation.x = Math.PI / 2;
    this.group.add(this.sunMesh);

    // Square Moon
    const moonGeo = new THREE.PlaneGeometry(12, 12);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(0, -100, 0);
    this.moonMesh.rotation.x = Math.PI / 2;
    this.group.add(this.moonMesh);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 180;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0 });
    this.stars = new THREE.Points(starGeo, starMat);
    this.group.add(this.stars);

    scene.add(this.group);
  }

  public update(dt: number, speedMultiplier: number, scene: THREE.Scene, playerPos: THREE.Vector3) {
    if (speedMultiplier > 0) {
      // 1 full day/night cycle = 360 seconds (6 minutes) at speed 1
      this.timeOfDay = (this.timeOfDay + (dt / 360) * speedMultiplier) % 1.0;
    }

    // Keep celestial sphere centered on player
    this.group.position.copy(playerPos);

    // Rotate Sun & Moon around Z axis
    const angle = this.timeOfDay * Math.PI * 2;
    this.group.rotation.z = angle;

    // Sun position & lighting
    const sunHeight = Math.sin(angle);
    this.sunLight.position.set(
      playerPos.x + Math.cos(angle) * 80,
      playerPos.y + Math.sin(angle) * 80,
      playerPos.z + 20
    );
    this.sunLight.target.position.copy(playerPos);

    // Dynamic Sky Colors
    let skyColor: THREE.Color;
    let fogColor: THREE.Color;
    let starOpacity = 0;

    if (sunHeight > 0.2) {
      // Midday
      skyColor = new THREE.Color(0x78a7ff);
      fogColor = new THREE.Color(0xa5c4ff);
      this.ambientLight.intensity = 0.65;
      this.sunLight.intensity = 1.1;
      starOpacity = 0;
    } else if (sunHeight > -0.1) {
      // Dawn / Dusk
      const t = (sunHeight + 0.1) / 0.3;
      skyColor = new THREE.Color(0xf97316).lerp(new THREE.Color(0x78a7ff), t);
      fogColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0xa5c4ff), t);
      this.ambientLight.intensity = 0.35 + t * 0.3;
      this.sunLight.intensity = 0.4 + t * 0.7;
      starOpacity = 1 - t;
    } else {
      // Night
      skyColor = new THREE.Color(0x030712);
      fogColor = new THREE.Color(0x0f172a);
      this.ambientLight.intensity = 0.18;
      this.sunLight.intensity = 0.1;
      starOpacity = 0.85;
    }

    scene.background = skyColor;
    if (scene.fog) {
      scene.fog.color = fogColor;
    }

    (this.stars.material as THREE.PointsMaterial).opacity = starOpacity;
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.group);
    scene.remove(this.ambientLight);
    scene.remove(this.sunLight);
    this.sunMesh.geometry.dispose();
    this.moonMesh.geometry.dispose();
    this.stars.geometry.dispose();
  }
}
