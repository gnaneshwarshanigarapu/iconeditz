import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const purple = '#9D5CFF'
const softPurple = '#B388FF'

function PlayButton({ pos = [-3.9, 1.2, -2.6], scale = 1 }) {
  return (
    <Float speed={1.6} rotationIntensity={0.45} floatIntensity={0.9}>
      <mesh position={pos} rotation={[0.15, -0.4, 0.22]} scale={scale}>
        <coneGeometry args={[0.78 * scale, 1.35 * scale, 3]} />
        <MeshDistortMaterial color={purple} emissive={purple} emissiveIntensity={0.45} distort={0.06} speed={1.2} roughness={0.25} />
      </mesh>
    </Float>
  )
}

function FilmStrip({ pos = [3.4, 0.95, -3], scale = 1 }) {
  const holes = useMemo(() => [-1.15, -0.55, 0.05, 0.65, 1.25], [])
  return (
    <Float speed={1.05} rotationIntensity={0.35} floatIntensity={1.1}>
      <group position={pos} rotation={[0.2, 0.34, -0.16]} scale={scale}>
        <mesh>
          <boxGeometry args={[0.62, 3.25, 0.08]} />
          <meshStandardMaterial color="#0b0b0b" emissive={purple} emissiveIntensity={0.2} metalness={0.18} roughness={0.28} />
        </mesh>
        {holes.map((y) => (
          <React.Fragment key={y}>
            <mesh position={[-0.2, y, 0.06]}>
              <boxGeometry args={[0.16, 0.2, 0.03]} />
              <meshBasicMaterial color={softPurple} />
            </mesh>
            <mesh position={[0.2, y, 0.06]}>
              <boxGeometry args={[0.16, 0.2, 0.03]} />
              <meshBasicMaterial color={softPurple} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    </Float>
  )
}

function PenTool({ pos = [-1.2, 2.15, -3.2], scale = 1 }) {
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.9}>
      <group position={pos} rotation={[0.2, 0.25, -0.55]} scale={scale}>
        <mesh>
          <octahedronGeometry args={[0.42 * scale]} />
          <meshStandardMaterial color={softPurple} emissive={softPurple} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -0.75 * scale, 0]}>
          <boxGeometry args={[0.08 * scale, 1.5 * scale, 0.08 * scale]} />
          <meshBasicMaterial color={purple} />
        </mesh>
      </group>
    </Float>
  )
}

function Keyframe({ pos = [0, 0, 0], scale = 1 }) {
  return (
    <Float speed={0.9} rotationIntensity={0.25} floatIntensity={0.6}>
      <mesh position={pos} scale={scale}>
        <octahedronGeometry args={[0.22 * scale]} />
        <meshStandardMaterial color={softPurple} emissive={softPurple} emissiveIntensity={0.35} />
      </mesh>
    </Float>
  )
}

function Particles({ amount = 100, spread = [12, 6, 8] }) {
  const points = useRef()
  const positions = useMemo(() => {
    const [sx, sy, sz] = spread
    const values = new Float32Array(amount * 3)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * sx
      values[i + 1] = (Math.random() - 0.5) * sy
      values[i + 2] = (Math.random() - 0.5) * sz - 2
    }
    return values
  }, [amount, spread])

  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={softPurple} size={0.03} transparent opacity={0.7} />
    </points>
  )
}

function ScrollRig({ scrollReactive = false }) {
  const { camera } = useThree()

  useFrame(({ mouse, clock }) => {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1)
    const scrollProgress = scrollReactive ? window.scrollY / maxScroll : 0
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.6, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.4 - scrollProgress * 0.8, 0.04)
    camera.position.z = 6 + Math.sin(clock.elapsedTime * 0.2) * 0.12 + scrollProgress * 1.0
    camera.lookAt(0, -scrollProgress * 0.6, -1.2)
  })

  return null
}

function SceneContent({ quality = 'high', scrollReactive = true }) {
  // adapt particle counts and object scales based on quality
  const settings = {
    high: { amount: 160, scale: 1 },
    medium: { amount: 90, scale: 0.85 },
    low: { amount: 40, scale: 0.7 },
  }[quality || 'high']

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 4]} intensity={1.8} color={purple} />
      <pointLight position={[-4, -2, 2]} intensity={1.0} color={softPurple} />

      <group position={[0, -0.6, -2]}>
        <Particles amount={settings.amount} spread={[12 * settings.scale, 6 * settings.scale, 8 * settings.scale]} />
        <PlayButton scale={0.95 * settings.scale} />
        <FilmStrip scale={0.9 * settings.scale} />
        <PenTool scale={0.9 * settings.scale} />
        <Keyframe pos={[1.8, 0.8, -2.5]} scale={0.9 * settings.scale} />
        <Keyframe pos={[-2.1, -0.5, -2.2]} scale={0.7 * settings.scale} />
      </group>

      <ScrollRig scrollReactive={scrollReactive} />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2.2} />
    </>
  )
}

export default function BackgroundScene({ quality = 'high', scrollReactive = true }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="pointer-events-none fixed inset-0 -z-20"
    >
      <Suspense fallback={null}>
        <SceneContent quality={quality} scrollReactive={scrollReactive} />
      </Suspense>
    </Canvas>
  )
}
