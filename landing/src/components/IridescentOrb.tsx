import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/* Iridescent shader orb — same technique as AgentFoundry's, recolored to
   emerald/teal/gold and retuned so it wobbles a little differently.
   Click it to activate (we use that to open the live agent chat). */

// Simplex 3D noise (Ashima Arts / Stefan Gustavson, MIT)
const noiseGlsl = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

// Tweaked band frequencies vs the original → a slightly different motion.
const deformGlsl = /* glsl */ `
uniform float uTime;
uniform float uDistort;
vec3 orbDisplace(vec3 p) {
  vec3 n = normalize(p);
  float h = dot(n, normalize(vec3(0.18, 1.0, 0.22)));
  float ang = atan(n.z, n.x);
  float band = sin(h * 7.5 + ang * 2.5 + uTime * 0.26);
  band += 0.5 * sin(h * 13.0 - ang * 3.5 - uTime * 0.19);
  band /= 1.5;
  float flow = snoise(n * 1.15 + vec3(uTime * 0.06, uTime * 0.04, uTime * 0.05));
  float d = band * (0.6 + 0.4 * flow) + flow * 0.55;
  return p + n * d * uDistort;
}
`

const deformNormalChunk = /* glsl */ `
vec3 orbP = orbDisplace(position);
vec3 orbAxis = abs(normal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
vec3 orbT = normalize(cross(orbAxis, normal));
vec3 orbB = normalize(cross(normal, orbT));
vec3 orbPA = orbDisplace(position + orbT * 0.012);
vec3 orbPB = orbDisplace(position + orbB * 0.012);
vec3 objectNormal = normalize(cross(orbPA - orbP, orbPB - orbP));
`

interface OrbUniforms {
  uTime: { value: number }
  uDistort: { value: number }
}

function applyOrbDeform(material: THREE.MeshPhysicalMaterial, uniforms: OrbUniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uDistort = uniforms.uDistort
    shader.vertexShader =
      noiseGlsl +
      deformGlsl +
      shader.vertexShader
        .replace("#include <beginnormal_vertex>", deformNormalChunk)
        .replace("#include <begin_vertex>", "vec3 transformed = orbP;")
  }
  material.userData.uniforms = uniforms
}

interface Panel { color: number; intensity: number; size: [number, number]; position: [number, number, number] }

// Emerald / teal / gold studio lighting (vs AgentFoundry's indigo/violet).
const PANELS: Panel[] = [
  { color: 0xffffff, intensity: 4.5, size: [16, 5], position: [0, 8, 3] },
  { color: 0xffffff, intensity: 2.6, size: [4, 10], position: [8, 2, 6] },
  { color: 0x10b981, intensity: 2.4, size: [10, 8], position: [-9, 1, 3] },
  { color: 0x2dd4bf, intensity: 2.0, size: [8, 9], position: [9, 2, -5] },
  { color: 0x22d3ee, intensity: 1.6, size: [10, 3], position: [-4, -7, 6] },
  { color: 0xf0b429, intensity: 1.5, size: [3, 6], position: [3, 6, -8] },
  { color: 0x064e3b, intensity: 1.0, size: [12, 12], position: [0, -9, -2] },
]

function createStudioEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene()
  for (const p of PANELS) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(p.size[0], p.size[1]),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color).multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
      }),
    )
    mesh.position.set(...p.position)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(scene, 0.32).texture
  pmrem.dispose()
  for (const child of scene.children) {
    const mesh = child as THREE.Mesh
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
  }
  return envMap
}

function OrbMesh({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const speed = useRef(1)
  const gl = useThree((state) => state.gl)

  const { shellMaterial, coreMaterial, envMap } = useMemo(() => {
    const envMap = createStudioEnv(gl)
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9af2d8,
      metalness: 0,
      roughness: 0.12,
      transmission: 1.0,
      thickness: 1.4,
      ior: 1.48,
      attenuationColor: 0x2dd4bf,
      attenuationDistance: 2.4,
      envMap,
      envMapIntensity: 1.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.14,
      iridescence: 0.5,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [160, 480],
    })
    applyOrbDeform(shellMaterial, { uTime: { value: 0 }, uDistort: { value: 0.13 } })
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.85,
      roughness: 0.3,
      envMap,
      envMapIntensity: 0.95,
      iridescence: 1.0,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [120, 700],
    })
    applyOrbDeform(coreMaterial, { uTime: { value: 26 }, uDistort: { value: 0.3 } })
    return { shellMaterial, coreMaterial, envMap }
  }, [gl])

  useEffect(
    () => () => {
      shellMaterial.dispose()
      coreMaterial.dispose()
      envMap.dispose()
    },
    [shellMaterial, coreMaterial, envMap],
  )

  useFrame((_, delta) => {
    const shellU = (shell.current?.material as THREE.MeshPhysicalMaterial)?.userData.uniforms as OrbUniforms | undefined
    const coreU = (core.current?.material as THREE.MeshPhysicalMaterial)?.userData.uniforms as OrbUniforms | undefined
    if (!shellU || !coreU) return
    speed.current = THREE.MathUtils.damp(speed.current, hovered ? 1.3 : 1.0, 3, delta)
    shellU.uTime.value += delta * speed.current
    coreU.uTime.value += delta * speed.current * 1.3
    shellU.uDistort.value = THREE.MathUtils.damp(shellU.uDistort.value, hovered ? 0.17 : 0.13, 3, delta)
    if (core.current) {
      core.current.rotation.y = -coreU.uTime.value * 0.1
      core.current.rotation.z = Math.sin(coreU.uTime.value * 0.07) * 0.12
    }
    if (group.current) {
      const t = shellU.uTime.value
      group.current.rotation.y = t * 0.06
      group.current.rotation.x = Math.sin(t * 0.11) * 0.08
      group.current.position.y = Math.sin(t * 0.35) * 0.04
      const breathe = 1 + Math.sin(t * 0.45) * 0.008
      const s = THREE.MathUtils.damp(group.current.scale.x / breathe, hovered ? 1.03 : 1.0, 4, delta)
      group.current.scale.setScalar(s * breathe)
    }
  })

  return (
    <group ref={group}>
      <mesh ref={core} material={coreMaterial} scale={0.58}>
        <icosahedronGeometry args={[1, 32]} />
      </mesh>
      <mesh ref={shell} material={shellMaterial}>
        <icosahedronGeometry args={[1, 48]} />
      </mesh>
    </group>
  )
}

export function IridescentOrb({ onActivate }: { onActivate: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className={`relative h-full w-full ${hovered ? "cursor-pointer" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 3.1], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => setHovered(false)}
      >
        <group
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onActivate}
        >
          <OrbMesh hovered={hovered} />
        </group>
      </Canvas>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-all duration-500"
        style={{ opacity: hovered ? 1 : 0.55, transform: hovered ? "translateY(0)" : "translateY(4px)" }}
      >
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wide text-white/80 backdrop-blur">
          {hovered ? "click to talk to the agent" : "live · gemini-2.5-flash"}
        </span>
      </div>
    </div>
  )
}
