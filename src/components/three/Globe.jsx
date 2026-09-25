import { Html, OrbitControls, QuadraticBezierLine, Sphere, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { geoEquirectangular, geoPath } from 'd3-geo'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import landTopo from 'world-atlas/land-110m.json'
import { globePoints } from '../../data/data'
import useMediaQuery from '../../hooks/useMediaQuery'

const RADIUS = 2
const GOLD = '#C9A96E'
const GOLD_LIGHT = '#E6D3A3'

// Flight routes drawn as arcs (by destination id)
const ROUTES = [
  ['dubai', 'paris'],
  ['dubai', 'maldives'],
  ['dubai', 'thailand'],
  ['dubai', 'switzerland'],
  ['thailand', 'bali'],
  ['paris', 'switzerland'],
  ['maldives', 'bali'],
]

function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

// Rasterise the world's land masses once, then keep only lattice points that fall on land.
function buildLandDots(count = 60000) {
  const W = 1024
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2])
  const path = geoPath(projection, ctx)
  ctx.fillStyle = '#fff'
  // Fill each landmass on its own so antimeridian-clipped shapes (e.g. Antarctica) can't invert the fill
  const land = feature(landTopo, landTopo.objects.land)
  const polygons = land.type === 'FeatureCollection' ? land.features.flatMap((f) => f.geometry.coordinates) : land.geometry.coordinates
  for (const coordinates of polygons) {
    ctx.beginPath()
    path({ type: 'Polygon', coordinates })
    ctx.fill()
  }
  const pixels = ctx.getImageData(0, 0, W, H).data

  const out = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = golden * i
    const x = Math.cos(t) * r
    const z = Math.sin(t) * r
    const lat = Math.asin(y) * (180 / Math.PI)
    // inverse of latLonToVec3
    const lon = ((Math.atan2(z, -x) * 180) / Math.PI + 360) % 360 - 180
    const px = Math.floor(((lon + 180) / 360) * W)
    const py = Math.floor(((90 - lat) / 180) * H)
    if (pixels[(py * W + px) * 4 + 3] > 128) out.push(x * RADIUS * 1.002, y * RADIUS * 1.002, z * RADIUS * 1.002)
  }
  return new Float32Array(out)
}

function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')
    ctx.beginPath()
    ctx.arc(32, 32, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
}

function LandDots() {
  const positions = useMemo(() => buildLandDots(), [])
  const map = useDotTexture()
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.016} color={GOLD} map={map} alphaTest={0.4} transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// Soft champagne rim light around the globe
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vNormal; void main(){ float i = pow(0.6 - dot(vNormal, vec3(0.0,0.0,1.0)), 4.0); gl_FragColor = vec4(0.79,0.66,0.43,1.0) * i * 0.55; }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  return <Sphere args={[RADIUS * 1.12, 64, 64]} material={material} />
}

function Pin({ point, active, onEnter, onLeave, onActivate }) {
  const pos = useMemo(() => latLonToVec3(point.lat, point.lon, RADIUS * 1.004), [point])
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()),
    [pos],
  )
  const ring = useRef()
  const offset = useMemo(() => Math.random(), [])

  useFrame(({ clock }) => {
    if (!ring.current) return
    const p = (clock.elapsedTime / 2.6 + offset) % 1
    ring.current.scale.setScalar(1 + p * 2.4)
    ring.current.material.opacity = 0.55 * (1 - p)
  })

  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <circleGeometry args={[active ? 0.045 : 0.034, 24]} />
        <meshBasicMaterial color={GOLD_LIGHT} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.04, 0.05, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.5} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* larger invisible hit area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          onEnter(point.id)
        }}
        onPointerOut={onLeave}
        onClick={(e) => {
          e.stopPropagation()
          onActivate(point.id, e.nativeEvent?.pointerType ?? e.pointerType)
        }}
      >
        <circleGeometry args={[0.14, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function PinCard({ point, onSelect, onEnter, onLeave }) {
  const pos = useMemo(() => latLonToVec3(point.lat, point.lon, RADIUS * 1.02), [point])
  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div
        onMouseEnter={() => onEnter(point.id)}
        onMouseLeave={onLeave}
        className="pointer-events-auto -translate-x-1/2 -translate-y-[calc(100%+14px)] animate-[fadein_0.6s_cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-gold/25 bg-ink/60 px-4 py-3 whitespace-nowrap backdrop-blur-md"
      >
        <p className="text-[10px] tracking-[0.3em] text-gold uppercase">{point.country === point.name ? point.region : point.country}</p>
        <p className="font-serif text-xl leading-tight text-ivory">{point.name}</p>
        <p className="mt-1 text-xs font-light text-muted">
          From <span className="text-gold-light">${point.price.toLocaleString()}</span>
        </p>
        <button
          onClick={() => onSelect?.(point.id)}
          className="mt-2 text-[11px] tracking-[0.15em] text-gold-light uppercase underline-offset-4 hover:underline"
        >
          View journeys →
        </button>
      </div>
    </Html>
  )
}

function Route({ from, to, index }) {
  const pulse = useRef()
  const [start, end, mid] = useMemo(() => {
    const s = latLonToVec3(from.lat, from.lon, RADIUS * 1.004)
    const e = latLonToVec3(to.lat, to.lon, RADIUS * 1.004)
    const m = s.clone().add(e).multiplyScalar(0.5)
    m.normalize().multiplyScalar(RADIUS + s.distanceTo(e) * 0.38)
    return [s, e, m]
  }, [from, to])

  // A single short dash travels along the arc like a plane in flight
  useFrame((_, delta) => {
    if (pulse.current?.material) pulse.current.material.dashOffset -= delta * 0.9
  })

  return (
    <>
      <QuadraticBezierLine start={start} end={end} mid={mid} color={GOLD} lineWidth={0.6} transparent opacity={0.22} />
      <QuadraticBezierLine
        ref={pulse}
        start={start}
        end={end}
        mid={mid}
        color={GOLD_LIGHT}
        lineWidth={1.4}
        dashed
        dashScale={1}
        dashSize={0.45}
        gapSize={7}
        dashOffset={-index * 1.3}
        transparent
        opacity={0.9}
      />
    </>
  )
}

function GlobeScene({ onSelect }) {
  const [active, setActive] = useState(null)
  const leaveTimer = useRef()
  const spin = useRef()
  // Touch screens: no drag controls (so swipes scroll the page); the globe spins on its own
  const finePointer = useMediaQuery('(pointer: fine)')
  useFrame((_, delta) => {
    if (!finePointer && !active && spin.current) spin.current.rotation.y += delta * 0.03
  })
  const byId = useMemo(() => Object.fromEntries(globePoints.map((p) => [p.id, p])), [])
  const hub = byId.dubai ?? globePoints[0]

  // Turn the globe so Dubai faces the viewer at load
  const initialY = useMemo(() => {
    const v = latLonToVec3(hub.lat, hub.lon)
    return Math.atan2(-v.x, v.z)
  }, [hub])

  const enter = (id) => {
    clearTimeout(leaveTimer.current)
    setActive(id)
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    document.body.style.cursor = ''
    leaveTimer.current = setTimeout(() => setActive(null), 350)
  }
  // Mouse click on a pin navigates; a tap on touch screens opens the card first
  const activate = (id, pointerType) => {
    if (pointerType === 'mouse') onSelect?.(id)
    else setActive((a) => (a === id ? null : id))
  }

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 5]} intensity={0.6} color={GOLD_LIGHT} />
      <Stars radius={70} depth={40} count={700} factor={2} fade speed={0.3} />
      {/* tilt, then spin around the globe's own axis */}
      <group rotation-x={0.28}>
        <group ref={spin} rotation-y={initialY}>
          <Sphere args={[RADIUS, 96, 96]} onPointerMissed={() => setActive(null)}>
            <meshStandardMaterial color="#0d0d10" roughness={0.9} metalness={0.15} />
          </Sphere>
          <LandDots />
          {ROUTES.map(([a, b], i) =>
            byId[a] && byId[b] ? <Route key={`${a}-${b}`} from={byId[a]} to={byId[b]} index={i} /> : null,
          )}
          {globePoints.map((p) => (
            <Pin key={p.id} point={p} active={active === p.id} onEnter={enter} onLeave={leave} onActivate={activate} />
          ))}
          {active && byId[active] && (
            <PinCard point={byId[active]} onSelect={onSelect} onEnter={enter} onLeave={leave} />
          )}
        </group>
      </group>
      <Atmosphere />
      {finePointer && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!active}
          autoRotateSpeed={0.3}
          rotateSpeed={0.4}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.6}
        />
      )}
    </>
  )
}

export default function Globe({ onSelect }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      dpr={[1, 1.75]}
      // measure layout size, not the transformed (animated) box, so pointer hit-testing stays accurate
      resize={{ offsetSize: true, debounce: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ overflow: 'visible' }} // let hover cards extend past the canvas edge
      aria-label="Interactive 3D globe showing featured destinations"
      role="img"
    >
      <GlobeScene onSelect={onSelect} />
    </Canvas>
  )
}
