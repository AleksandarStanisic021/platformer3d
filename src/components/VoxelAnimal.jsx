const SPECIES = {
  pig: { body: '#e88f9c', head: '#f1a8af', legs: '#ce717c', snout: '#dc7782' },
  cow: { body: '#eee7d4', head: '#e9dfca', legs: '#55463c', snout: '#bd8c7e' },
  sheep: { body: '#e8e6d8', head: '#c7ad91', legs: '#665b58', wool: '#fff8e9' },
  chicken: { body: '#f7f0dc', head: '#fff8e7', legs: '#df9a43', snout: '#e87836' },
  wolf: { body: '#929da8', head: '#aab2b7', legs: '#707b87', snout: '#3c4147' },
  cat: { body: '#d58b4f', head: '#e5a560', legs: '#b66d3d', snout: '#f2d2b3' },
  rabbit: { body: '#e7e1d9', head: '#f2eee8', legs: '#cbbdb5', snout: '#e88f9c' },
  fox: { body: '#dc7835', head: '#e5873d', legs: '#f0e3cd', snout: '#f5eee2' },
  panda: { body: '#f1eee5', head: '#f8f5ed', legs: '#30363c', snout: '#282c30' },
  horse: { body: '#97613e', head: '#a87048', legs: '#68452f', snout: '#c09169' },
  turtle: { body: '#6baf61', head: '#7bc36b', legs: '#55954f', snout: '#a0d66f', shell: '#477347' },
  frog: { body: '#68bf62', head: '#78d46c', legs: '#4c9d53', snout: '#a3e57b' },
}

const SPECIES_NAMES = Object.keys(SPECIES)

export default function VoxelAnimal({ animal }) {
  const { body, head, legs, snout, wool, shell } = SPECIES[animal.type] ?? SPECIES.pig
  const small = animal.type === 'chicken' || animal.type === 'rabbit' || animal.type === 'frog'
  const bodySize = small ? [0.48, 0.42, 0.66] : [0.68, 0.56, 0.96]
  const headSize = small ? [0.38, 0.36, 0.38] : [0.48, 0.46, 0.45]
  const scale = animal.scale * (small ? 0.88 : 1)
  const isBird = animal.type === 'chicken'
  const hasLongEars = animal.type === 'rabbit'
  const hasPointedEars = ['wolf', 'cat', 'fox'].includes(animal.type)
  const hasHorn = animal.type === 'cow' || animal.type === 'horse'
  const hasShell = animal.type === 'turtle'

  return (
    <group
      position={animal.center}
      rotation={[0, animal.phase * 0.35, 0]}
      scale={scale}
    >
      <mesh position={[0, 0.43, 0]} castShadow>
        <boxGeometry args={bodySize} />
        <meshStandardMaterial color={wool ?? body} roughness={0.95} />
      </mesh>
      {wool && (
        <>
          <mesh position={[0, 0.52, -0.28]} castShadow>
            <boxGeometry args={[0.42, 0.38, 0.36]} />
            <meshStandardMaterial color="#fff8e9" roughness={1} />
          </mesh>
          <mesh position={[0, 0.62, 0.28]} castShadow>
            <boxGeometry args={[0.5, 0.52, 0.48]} />
            <meshStandardMaterial color="#fff8e9" roughness={1} />
          </mesh>
        </>
      )}
      {hasShell && (
        <mesh position={[0, 0.73, -0.03]} castShadow>
          <boxGeometry args={[0.74, 0.42, 0.78]} />
          <meshStandardMaterial color={shell} roughness={1} />
        </mesh>
      )}
      <mesh position={[0, 0.62, 0.47]} castShadow>
        <boxGeometry args={headSize} />
        <meshStandardMaterial color={head} roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.13, 0.68, 0.68]}>
          <boxGeometry args={[0.07, 0.08, 0.035]} />
          <meshStandardMaterial color={animal.type === 'panda' ? '#f4eee4' : '#20242a'} />
        </mesh>
      ))}
      <mesh position={[0, 0.49, 0.72]} castShadow>
        <boxGeometry args={animal.type === 'pig' ? [0.26, 0.2, 0.13] : [0.2, 0.12, 0.12]} />
        <meshStandardMaterial color={snout} roughness={0.9} />
      </mesh>
      {animal.type === 'pig' && [-1, 1].map((side) => (
        <mesh key={`nostril-${side}`} position={[side * 0.065, 0.49, 0.79]}>
          <boxGeometry args={[0.035, 0.07, 0.025]} />
          <meshStandardMaterial color="#793c49" />
        </mesh>
      ))}
      {hasPointedEars && [-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.18, 0.95, 0.43]} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.16]} />
          <meshStandardMaterial color={head} roughness={0.92} />
        </mesh>
      ))}
      {hasLongEars && [-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.14, 1.08, 0.43]} castShadow>
          <boxGeometry args={[0.13, 0.48, 0.12]} />
          <meshStandardMaterial color={head} roughness={0.92} />
        </mesh>
      ))}
      {hasHorn && [-1, 1].map((side) => (
        <mesh key={`horn-${side}`} position={[side * 0.22, 0.94, 0.38]} castShadow>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#e9d9ae" roughness={0.8} />
        </mesh>
      ))}
      {isBird && (
        <>
          <mesh position={[0, 0.89, 0.48]} castShadow>
            <boxGeometry args={[0.1, 0.18, 0.1]} />
            <meshStandardMaterial color="#d84f45" />
          </mesh>
          <mesh position={[0, 0.62, 0.69]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.2, 0.12, 0.18]} />
            <meshStandardMaterial color="#ef9638" />
          </mesh>
        </>
      )}
      {animal.type === 'panda' && [-1, 1].map((side) => (
        <mesh key={`patch-${side}`} position={[side * 0.14, 0.67, 0.69]}>
          <boxGeometry args={[0.15, 0.16, 0.045]} />
          <meshStandardMaterial color="#30363c" />
        </mesh>
      ))}
      {animal.type === 'horse' && (
        <mesh position={[0, 0.8, 0.3]} castShadow>
          <boxGeometry args={[0.28, 0.42, 0.32]} />
          <meshStandardMaterial color="#45352d" roughness={1} />
        </mesh>
      )}
      {animal.type === 'frog' && [-1, 1].map((side) => (
        <mesh key={`bulb-${side}`} position={[side * 0.14, 0.84, 0.52]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#82dd70" roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => [-1, 1].map((front) => (
        <mesh
          key={`leg-${side}-${front}`}
          position={[side * (small ? 0.13 : 0.22), 0.16, front * (small ? 0.2 : 0.3)]}
          castShadow
        >
          <boxGeometry args={[small ? 0.12 : 0.17, 0.32, 0.17]} />
          <meshStandardMaterial color={legs} roughness={0.95} />
        </mesh>
      )))}
      {animal.type !== 'turtle' && (
        <mesh position={[0, 0.47, -0.57]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={animal.type === 'chicken' ? [0.1, 0.1, 0.3] : [0.13, 0.16, 0.28]} />
          <meshStandardMaterial color={animal.type === 'fox' ? '#f4eee0' : legs} roughness={0.95} />
        </mesh>
      )}
    </group>
  )
}

export { SPECIES_NAMES }
