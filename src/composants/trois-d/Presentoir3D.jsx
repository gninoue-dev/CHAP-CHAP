// Présentoir 3D d'un produit : sa photo sur un cadre posé sur un socle tournant.
// On le fait pivoter à la souris ou au doigt (OrbitControls).
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function Cadre({ image }) {
  const texture = useTexture(image, t => { t.colorSpace = THREE.SRGBColorSpace })
  return (
    <Float speed={2} floatIntensity={0.5} rotationIntensity={0.1}>
      <group position={[0, 0.3, 0]}>
        <RoundedBox args={[2.3, 2.3, 0.16]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.085]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshStandardMaterial color="#FF6B00" />
        </mesh>
      </group>
    </Float>
  )
}

export default function Presentoir3D({ image, animation = true }) {
  return (
    <Canvas camera={{ position: [0, 0.6, 4.6], fov: 45 }} dpr={[1, 1.75]} role="img" aria-label="Vue 3D du produit : fais-la tourner avec la souris ou le doigt">
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <Suspense fallback={null}><Cadre image={image} /></Suspense>
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.18, 48]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>
      <ContactShadows position={[0, -1.24, 0]} opacity={0.4} scale={6} blur={2.4} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={animation} autoRotateSpeed={2.5} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.9} />
    </Canvas>
  )
}
