import { Vector2D } from './simulation/physics/Vector2D';
import { WorldMap } from './WorldMap';

export interface EnvironmentProperties {
  // Climate
  temperature: number;      // -50 to 50 (Celsius)
  humidity: number;         // 0 to 100 (%)
  rainfall: number;         // 0 to 500 (mm/month)
  
  // Resources
  foodAbundance: number;    // 0 to 1 (multiplier)
  waterAvailability: number; // 0 to 1 (multiplier)
  
  // Terrain
  terrainType: 'ocean' | 'coast' | 'plains' | 'forest' | 'desert' | 'mountain' | 'tundra' | 'jungle';
  elevation: number;        // 0 to 1000 (meters)
  
  // Survival factors
  movementSpeed: number;    // 0.5 to 2 (multiplier)
  energyCost: number;       // 0.5 to 2 (multiplier for movement)
  visibility: number;       // 0 to 1 (how far agents can see)
}

export class Environment {
  private worldMap: WorldMap;
  private biomes: Map<string, EnvironmentProperties> = new Map();

  constructor(worldMap: WorldMap) {
    this.worldMap = worldMap;
    this.initializeBiomes();
  }

  /**
   * Initialize default biome properties
   */
  private initializeBiomes(): void {
    // Ocean
    this.biomes.set('ocean', {
      temperature: 15,
      humidity: 100,
      rainfall: 200,
      foodAbundance: 0.3,
      waterAvailability: 1.0,
      terrainType: 'ocean',
      elevation: -100,
      movementSpeed: 0.6,  // Slower in water
      energyCost: 1.5,     // More energy to move in water
      visibility: 0.7      // Reduced visibility underwater
    });

    // Coast
    this.biomes.set('coast', {
      temperature: 20,
      humidity: 80,
      rainfall: 150,
      foodAbundance: 0.8,
      waterAvailability: 1.0,
      terrainType: 'coast',
      elevation: 5,
      movementSpeed: 1.0,
      energyCost: 1.0,
      visibility: 1.0
    });

    // Tropical Jungle (Near equator)
    this.biomes.set('jungle', {
      temperature: 27,
      humidity: 90,
      rainfall: 400,
      foodAbundance: 1.0,
      waterAvailability: 1.0,
      terrainType: 'jungle',
      elevation: 100,
      movementSpeed: 0.7,  // Dense vegetation
      energyCost: 1.3,
      visibility: 0.6      // Dense foliage
    });

    // Desert (Hot, dry regions)
    this.biomes.set('desert', {
      temperature: 35,
      humidity: 20,
      rainfall: 20,
      foodAbundance: 0.2,
      waterAvailability: 0.1,
      terrainType: 'desert',
      elevation: 200,
      movementSpeed: 0.8,  // Sand slows movement
      energyCost: 1.4,     // Heat increases energy cost
      visibility: 1.0      // Clear visibility
    });

    // Temperate Forest
    this.biomes.set('forest', {
      temperature: 15,
      humidity: 70,
      rainfall: 100,
      foodAbundance: 0.8,
      waterAvailability: 0.8,
      terrainType: 'forest',
      elevation: 150,
      movementSpeed: 0.9,
      energyCost: 1.0,
      visibility: 0.8
    });

    // Grasslands/Plains
    this.biomes.set('plains', {
      temperature: 18,
      humidity: 60,
      rainfall: 80,
      foodAbundance: 0.7,
      waterAvailability: 0.6,
      terrainType: 'plains',
      elevation: 100,
      movementSpeed: 1.2,  // Easy to traverse
      energyCost: 0.8,     // Less energy needed
      visibility: 1.0      // Open visibility
    });

    // Mountains
    this.biomes.set('mountain', {
      temperature: 5,
      humidity: 50,
      rainfall: 150,
      foodAbundance: 0.3,
      waterAvailability: 0.5,
      terrainType: 'mountain',
      elevation: 800,
      movementSpeed: 0.5,  // Difficult terrain
      energyCost: 2.0,     // Very energy intensive
      visibility: 1.0      // High elevation view
    });

    // Tundra (Arctic/Antarctic)
    this.biomes.set('tundra', {
      temperature: -10,
      humidity: 40,
      rainfall: 30,
      foodAbundance: 0.1,
      waterAvailability: 0.3,
      terrainType: 'tundra',
      elevation: 50,
      movementSpeed: 0.7,
      energyCost: 1.5,     // Cold requires more energy
      visibility: 1.0
    });
  }

  /**
   * Get environment properties at a specific position
   */
  getEnvironmentAt(position: Vector2D): EnvironmentProperties {
    const { lat, lon } = this.worldMap.worldToLatLon(position);
    const region = this.worldMap.getRegionAtPosition(position);
    
    // Determine biome based on region and latitude
    let biome = 'plains'; // Default
    
    if (region) {
      if (region.type === 'ocean') {
        biome = 'ocean';
      } else if (region.type === 'land') {
        // Determine land biome based on latitude
        const absLat = Math.abs(lat);
        
        if (absLat > 66) {
          // Polar regions
          biome = 'tundra';
        } else if (absLat > 45) {
          // Temperate regions
          biome = 'forest';
        } else if (absLat > 23) {
          // Subtropical regions
          biome = Math.random() > 0.5 ? 'desert' : 'plains';
        } else {
          // Tropical regions
          biome = 'jungle';
        }
      }
    }
    
    return this.biomes.get(biome) || this.biomes.get('plains')!;
  }

  /**
   * Calculate food spawn rate modifier for a position
   */
  getFoodSpawnRate(position: Vector2D): number {
    const env = this.getEnvironmentAt(position);
    return env.foodAbundance;
  }

  /**
   * Calculate movement speed modifier for a position
   */
  getMovementModifier(position: Vector2D): number {
    const env = this.getEnvironmentAt(position);
    return env.movementSpeed;
  }

  /**
   * Calculate energy cost modifier for a position
   */
  getEnergyCostModifier(position: Vector2D): number {
    const env = this.getEnvironmentAt(position);
    return env.energyCost;
  }

  /**
   * Get visibility range modifier for a position
   */
  getVisibilityModifier(position: Vector2D): number {
    const env = this.getEnvironmentAt(position);
    return env.visibility;
  }

  /**
   * Get color for rendering a biome
   */
  getBiomeColor(position: Vector2D): string {
    const env = this.getEnvironmentAt(position);
    
    const colors: Record<string, string> = {
      ocean: '#4a90e2',
      coast: '#f5e6d3',
      jungle: '#228b22',
      desert: '#f4a460',
      forest: '#2d5016',
      plains: '#90ee90',
      mountain: '#8b7355',
      tundra: '#e0f2f7'
    };
    
    return colors[env.terrainType] || '#90ee90';
  }

  /**
   * Check if position is habitable for agents
   */
  isHabitable(position: Vector2D): boolean {
    const env = this.getEnvironmentAt(position);
    // Ocean is not habitable for land agents (you can change this)
    return env.terrainType !== 'ocean';
  }

  /**
   * Get weather conditions at position
   */
  getWeather(position: Vector2D): {
    temperature: number;
    rainfall: number;
    humidity: number;
  } {
    const env = this.getEnvironmentAt(position);
    
    // Add some randomness to simulate weather variation
    return {
      temperature: env.temperature + (Math.random() - 0.5) * 10,
      rainfall: env.rainfall * (0.5 + Math.random()),
      humidity: env.humidity + (Math.random() - 0.5) * 20
    };
  }

  /**
   * Add a custom biome
   */
  addCustomBiome(name: string, properties: EnvironmentProperties): void {
    this.biomes.set(name, properties);
  }

  /**
   * Get all biome types
   */
  getAllBiomes(): Map<string, EnvironmentProperties> {
    return new Map(this.biomes);
  }
}
