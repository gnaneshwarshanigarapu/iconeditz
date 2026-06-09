import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

const purple = '#9D5CFF'
const softPurple = '#B388FF'

function Timeline() {
  const ref = useRef()

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.08
    ref.current.position.x = mouse.x * 1.4
  })

  return (
    <group ref={ref} position={[0, -2.25, -4]} rotation={[0.35, 0, 0]}>
      {[0, 1, 2, 3, 4].map((item) => (
        <mesh key={item} position={[-3.2 + item * 1.6, 0, 0]}>
          <boxGeometry args={[1.1, 0.26, 0.12]} />
          <meshStandardMaterial color={item % 2 ? softPurple : purple} emissive={purple} emissiveIntensity={0.25} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[7.8, 0.04, 0.06]} />
        <meshBasicMaterial color={softPurple} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function PlayButton() {
  return (
    <Float speed={1.6} rotationIntensity={0.45} floatIntensity={1.1}>
      <mesh position={[-3.9, 1.2, -2.6]} rotation={[0.15, -0.4, 0.22]}>
        <coneGeometry args={[0.78, 1.35, 3]} />
        <MeshDistortMaterial color={purple} emissive={purple} emissiveIntensity={0.5} distort={0.08} speed={1.5} roughness={0.2} />
      </mesh>
    </Float>
  )
}

function FilmStrip() {
  const holes = useMemo(() => [-1.15, -0.55, 0.05, 0.65, 1.25], [])

  return (
    <Float speed={1.15} rotationIntensity={0.4} floatIntensity={1.4}>
      <group position={[3.4, 0.95, -3]} rotation={[0.2, 0.34, -0.16]}>
        <mesh>
          <boxGeometry args={[0.62, 3.25, 0.08]} />
          <meshStandardMaterial color="#111111" emissive={purple} emissiveIntensity={0.22} metalness={0.25} roughness={0.28} />
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

function CameraLens() {
  return (
    <Float speed={1.05} rotationIntensity={0.3} floatIntensity={0.9}>
      <group position={[2.6, -1.2, -2.2]} rotation={[0.4, -0.35, 0.1]}>
        <mesh>
          <torusGeometry args={[0.78, 0.13, 24, 64]} />
          <meshStandardMaterial color={purple} emissive={purple} emissiveIntensity={0.35} metalness={0.45} roughness={0.18} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.48, 2]} />
          <meshStandardMaterial color="#111111" emissive={softPurple} emissiveIntensity={0.25} transparent opacity={0.82} />
        </mesh>
      </group>
    </Float>
  )
}

function PenTool() {
  return (
    <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.1}>
      <group position={[-1.2, 2.15, -3.2]} rotation={[0.2, 0.25, -0.55]}>
        <mesh>
          <octahedronGeometry args={[0.42]} />
          <meshStandardMaterial color={softPurple} emissive={softPurple} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[0.08, 1.5, 0.08]} />
          <meshBasicMaterial color={purple} />
        </mesh>
      </group>
    </Float>
  )
}

function Particles() {
  const points = useRef()
  const positions = useMemo(() => {
    const values = new Float32Array(140 * 3)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 12
      values[i + 1] = (Math.random() - 0.5) * 7
      values[i + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return values
  }, [])

  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.025
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={softPurple} size={0.035} transparent opacity={0.72} />
    </points>
  )
}

function ScrollRig({ scrollReactive = false }) {
  const { camera } = useThree()

  useFrame(({ mouse, clock }) => {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1)
    const scrollProgress = scrollReactive ? window.scrollY / maxScroll : 0
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.65, 0.045)
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      mouse.y * 0.45 - scrollProgress * 1.2,
      0.045
    )
    camera.position.z = 6 + Math.sin(clock.elapsedTime * 0.25) * 0.15 + scrollProgress * 1.4
    camera.lookAt(0, -scrollProgress * 1.4, -2)
  })

  return null
}

function ScrollStage({ children, scrollReactive = false }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1)
    const scrollProgress = scrollReactive ? window.scrollY / maxScroll : 0
    ref.current.rotation.y = scrollProgress * Math.PI * 1.3 + Math.sin(clock.elapsedTime * 0.14) * 0.08
    ref.current.rotation.x = scrollProgress * 0.34
    ref.current.position.y = -scrollProgress * 2.8
    ref.current.position.z = -scrollProgress * 1.8
  })

  return <group ref={ref}>{children}</group>
}

function SceneContent({ scrollReactive = false }) {
  return (
    <>
      <ambientLight intensity={0.42} />
      <pointLight position={[2, 3, 4]} intensity={2.2} color={purple} />
      <pointLight position={[-4, -2, 2]} intensity={1.25} color={softPurple} />
      <ScrollStage scrollReactive={scrollReactive}>
        <Particles />
        <PlayButton />
        <FilmStrip />
        <CameraLens />
        <Timeline />
        <PenTool />
      </ScrollStage>
      <ScrollRig scrollReactive={scrollReactive} />
    </>
  )
}

export default function BackgroundScene({ scrollReactive = false }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <SceneContent scrollReactive={scrollReactive} />
      </Suspense>
    </Canvas>
  )
}
