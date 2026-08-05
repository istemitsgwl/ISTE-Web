import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useTheme } from "@/context/ThemeContext"

interface ParticleGridProps {
  theme: string
  isMobile: boolean
}

function ParticleGrid({ theme, isMobile }: ParticleGridProps) {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Custom shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(theme === "light" ? "#0077ff" : "#00f3ff") }
  }), [theme])

  // Update color dynamically when theme triggers
  useEffect(() => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial
      if (material.uniforms && material.uniforms.uColor) {
        material.uniforms.uColor.value.set(theme === "light" ? "#0077ff" : "#00f3ff")
      }
    }
  }, [theme])

  // Create grid vertices
  const [positions, count] = useMemo(() => {
    const width = isMobile ? 16 : 30
    const depth = isMobile ? 16 : 30
    const spacing = isMobile ? 2.2 : 1.2
    const tempPositions: number[] = []
    
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const posX = (x - width / 2) * spacing
        const posZ = (z - depth / 2) * spacing
        tempPositions.push(posX, 0, posZ)
      }
    }
    return [new Float32Array(tempPositions), width * depth]
  }, [isMobile])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (pointsRef.current) {
      // Rotate grid slowly
      pointsRef.current.rotation.y = time * 0.04
      
      // Update shader time uniform
      const material = pointsRef.current.material as THREE.ShaderMaterial
      if (material.uniforms) {
        material.uniforms.uTime.value = time
      }
    }
  })

  // Vertex Shader
  const vertexShader = `
    uniform float uTime;
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      vec3 pos = position;
      // Waving sine/cosine math
      float waveX = sin(pos.x * 0.2 + uTime) * cos(pos.z * 0.2 + uTime);
      pos.y += waveX * 1.5;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Depth sizing (further particles are smaller)
      gl_PointSize = 6.0 * (30.0 / -mvPosition.z);
    }
  `

  // Fragment Shader (Circular glowing particle shape)
  const fragmentShader = `
    uniform vec3 uColor;
    varying vec3 vPosition;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      
      // Glow strength gradient
      float alpha = 1.0 - (dist * 2.0);
      gl_FragColor = vec4(uColor, alpha * 0.8);
    }
  `

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ThreeCanvas() {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Detect mobile screens
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Setup viewport intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.01 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden bg-background">
      <Canvas
        camera={{ position: [0, 10, 22], fov: 60 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={isInView ? "always" : "never"}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <ParticleGrid theme={theme} isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
