import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const useThreeBackground = () => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const objectsRef = useRef([])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 30
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0.1)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x9D5CFF, 1, 100)
    pointLight.position.set(10, 10, 10)
    pointLight.castShadow = true
    scene.add(pointLight)

    // Create floating 3D objects
    const createFloatingObjects = () => {
      const objects = []

      // Create play buttons
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.TetrahedronGeometry(2)
        const material = new THREE.MeshPhongMaterial({
          color: 0x9D5CFF,
          wireframe: false,
          emissive: 0x9D5CFF,
          emissiveIntensity: 0.2,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50
        )
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
        objects.push({
          mesh,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          vz: (Math.random() - 0.5) * 0.1,
        })
      }

      // Create film strips
      for (let i = 0; i < 2; i++) {
        const geometry = new THREE.BoxGeometry(3, 8, 0.5)
        const material = new THREE.MeshPhongMaterial({
          color: 0xB388FF,
          wireframe: false,
          emissive: 0xB388FF,
          emissiveIntensity: 0.15,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50
        )
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
        objects.push({
          mesh,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          vz: (Math.random() - 0.5) * 0.08,
        })
      }

      // Create spheres (camera lenses)
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.IcosahedronGeometry(2, 3)
        const material = new THREE.MeshPhongMaterial({
          color: 0x9D5CFF,
          wireframe: true,
          emissive: 0x9D5CFF,
          emissiveIntensity: 0.3,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
        objects.push({
          mesh,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          vz: (Math.random() - 0.5) * 0.05,
        })
      }

      return objects
    }

    const floatingObjects = createFloatingObjects()
    objectsRef.current = floatingObjects

    // Mouse tracking
    const mouse = new THREE.Vector2()
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Update floating objects
      floatingObjects.forEach((obj) => {
        obj.mesh.position.x += obj.vx
        obj.mesh.position.y += obj.vy
        obj.mesh.position.z += obj.vz

        // Bounce off boundaries
        if (Math.abs(obj.mesh.position.x) > 50) obj.vx *= -1
        if (Math.abs(obj.mesh.position.y) > 50) obj.vy *= -1
        if (Math.abs(obj.mesh.position.z) > 50) obj.vz *= -1

        // Rotate
        obj.mesh.rotation.x += 0.002
        obj.mesh.rotation.y += 0.003
      })

      // Mouse interaction - move camera based on mouse position
      camera.position.x = mouse.x * 5
      camera.position.y = mouse.y * 5
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onWindowResize)
      cancelAnimationFrame(animationId)
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return containerRef
}
