// ============================================
// Scène 3D de l'accueil (React Three Fiber)
// Un sac CHAP CHAP flotte au centre, les catégories tournent autour.
// Tout est composé de primitives : aucun modèle 3D externe à charger.
// ============================================
import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, RoundedBox, Sparkles, useCursor, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { urlImage } from '../../lib/images'

const ORANGE = '#FF6B00'

// Éclair du logo, dessiné en 2D puis posé sur le sac
function Eclair(props) {
  const forme = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0.12, 0.5)
    s.lineTo(-0.22, 0.02)
    s.lineTo(0.0, 0.02)
    s.lineTo(-0.12, -0.5)
    s.lineTo(0.24, 0.06)
    s.lineTo(0.02, 0.06)
    s.closePath()
    return s
  }, [])
  return (
    <mesh {...props}>
      <extrudeGeometry args={[forme, { depth: 0.06, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }]} />
      <meshStandardMaterial color="#FFC300" emissive="#FFB000" emissiveIntensity={0.35} roughness={0.35} />
    </mesh>
  )
}

function SacCommerce() {
  const groupe = useRef()
  useFrame(({ clock }) => {
    groupe.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.35
  })
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupe}>
        <RoundedBox args={[1.6, 1.8, 0.8]} radius={0.12} smoothness={4} castShadow>
          <meshStandardMaterial color={ORANGE} roughness={0.45} metalness={0.05} />
        </RoundedBox>
        {/* poignées */}
        {[-0.35, 0.35].map(x => (
          <mesh key={x} position={[x, 0.95, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.22, 0.045, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
        ))}
        {/* bande et éclair */}
        <mesh position={[0, 0.55, 0.405]}>
          <boxGeometry args={[1.6, 0.12, 0.01]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        <Eclair position={[0, -0.1, 0.39]} scale={1.3} />
      </group>
    </Float>
  )
}

// Carte flottante d'une catégorie (photo plaquée sur un rectangle arrondi)
function CarteCategorie({ categorie, angle, rayon, onChoisir }) {
  const texture = useTexture(urlImage(categorie.image), t => { t.colorSpace = THREE.SRGBColorSpace })
  const [survol, setSurvol] = useState(false)
  useCursor(survol)
  const maille = useRef()

  useFrame(() => {
    const cible = survol ? 1.18 : 1
    maille.current.scale.lerp(new THREE.Vector3(cible, cible, cible), 0.15)
  })

  const x = Math.cos(angle) * rayon
  const z = Math.sin(angle) * rayon
  return (
    <Float speed={1.5 + (angle % 1)} floatIntensity={0.6} rotationIntensity={0.15}>
      <group position={[x, Math.sin(angle * 2) * 0.35, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
        <group
          ref={maille}
          onPointerOver={e => { e.stopPropagation(); setSurvol(true) }}
          onPointerOut={() => setSurvol(false)}
          onClick={e => { e.stopPropagation(); onChoisir(categorie) }}
        >
          <RoundedBox args={[0.95, 0.95, 0.06]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color={survol ? categorie.couleur : '#ffffff'} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.06, 0.035]}>
            <planeGeometry args={[0.82, 0.68]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.37, 0.035]}>
            <planeGeometry args={[0.82, 0.12]} />
            <meshBasicMaterial color={categorie.couleur} />
          </mesh>
        </group>
      </group>
    </Float>
  )
}

// Anneau de cartes qui tourne lentement ; toute la scène suit la souris
function Manege({ categories, onChoisir, animation }) {
  const anneau = useRef()
  const scene = useRef()
  useFrame(({ pointer }, delta) => {
    if (animation) anneau.current.rotation.y += delta * 0.18
    scene.current.rotation.x = THREE.MathUtils.lerp(scene.current.rotation.x, -pointer.y * 0.18, 0.05)
    scene.current.rotation.y = THREE.MathUtils.lerp(scene.current.rotation.y, pointer.x * 0.35, 0.05)
  })
  return (
    <group ref={scene}>
      <SacCommerce />
      <group ref={anneau}>
        {categories.map((c, i) => (
          <CarteCategorie key={c.slug} categorie={c} angle={(i / categories.length) * Math.PI * 2} rayon={2.5} onChoisir={onChoisir} />
        ))}
      </group>
    </group>
  )
}

export default function SceneBoutique3D({ categories, onChoisir, animation = true }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.2, 6.2], fov: 42 }}
      frameloop={animation ? 'always' : 'demand'}
      aria-label="Vitrine 3D des catégories : clique sur une carte pour ouvrir la catégorie"
      role="img"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow />
      <pointLight position={[-4, 2, -2]} intensity={30} color={ORANGE} />
      <Suspense fallback={null}>
        <Manege categories={categories} onChoisir={onChoisir} animation={animation} />
      </Suspense>
      {animation && <Sparkles count={40} scale={[7, 4, 4]} size={3} speed={0.4} color="#FFC300" />}
      <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={9} blur={2.6} far={4} />
    </Canvas>
  )
}
