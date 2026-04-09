import React, { useEffect, useRef, useState } from 'react';
import { WorldMap } from './WorldMap';
import { Environment } from './Environment';
import { Vector2D } from './simulation/physics/Vector2D';

/**
 * Example component showing how to integrate the world map
 */
export function WorldMapDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [mouseInfo, setMouseInfo] = useState({
    lat: 0,
    lon: 0,
    biome: '',
    temp: 0
  });

  // Initialize world map
  useEffect(() => {
    const map = new WorldMap(2000, 1030);
    
    // Load your uploaded image
    // IMPORTANT: Save your uploaded image to public/world-map.png
    map.loadMapImage('/world-map.png')
      .then(() => {
        console.log('Map loaded successfully!');
        setWorldMap(map);
        
        // Create environment system
        const env = new Environment(map);
        setEnvironment(env);
      })
      .catch(err => {
        console.error('Failed to load map:', err);
      });
  }, []);

  // Render loop
  useEffect(() => {
    if (!worldMap || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple camera (centered on world)
    const camera = {
      x: 0,
      y: 0,
      zoom: Math.min(canvas.width / 2000, canvas.height / 1030)
    };

    function render() {
      if (!ctx || !worldMap) return;

      // Clear
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render world map
      worldMap.render(ctx, camera);

      // Optional: Render coordinate grid
      worldMap.renderDebug(ctx, camera);

      requestAnimationFrame(render);
    }

    render();
  }, [worldMap]);

  // Handle mouse move to show location info
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!worldMap || !environment || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position in canvas
    const x = (e.clientX - rect.left) / rect.width * 2000;
    const y = (e.clientY - rect.top) / rect.height * 1030;
    const position = new Vector2D(x, y);

    // Get latitude/longitude
    const { lat, lon } = worldMap.worldToLatLon(position);

    // Get environment info
    const env = environment.getEnvironmentAt(position);
    const weather = environment.getWeather(position);

    setMouseInfo({
      lat: lat,
      lon: lon,
      biome: env.terrainType,
      temp: weather.temperature
    });
  };

  return (
    <div className="world-map-demo">
      <div className="map-container">
        <canvas
          ref={canvasRef}
          width={1000}
          height={515}
          onMouseMove={handleMouseMove}
          style={{
            border: '2px solid #333',
            borderRadius: '8px',
            cursor: 'crosshair'
          }}
        />
      </div>

      <div className="info-panel">
        <h3>Location Information</h3>
        <div className="info-grid">
          <div>
            <strong>Latitude:</strong> {mouseInfo.lat.toFixed(2)}°
          </div>
          <div>
            <strong>Longitude:</strong> {mouseInfo.lon.toFixed(2)}°
          </div>
          <div>
            <strong>Biome:</strong> {mouseInfo.biome}
          </div>
          <div>
            <strong>Temperature:</strong> {mouseInfo.temp.toFixed(1)}°C
          </div>
        </div>

        {environment && (
          <div className="biome-legend">
            <h4>Biome Types</h4>
            <ul>
              <li><span style={{color: '#4a90e2'}}>●</span> Ocean</li>
              <li><span style={{color: '#228b22'}}>●</span> Jungle</li>
              <li><span style={{color: '#f4a460'}}>●</span> Desert</li>
              <li><span style={{color: '#2d5016'}}>●</span> Forest</li>
              <li><span style={{color: '#90ee90'}}>●</span> Plains</li>
              <li><span style={{color: '#8b7355'}}>●</span> Mountain</li>
              <li><span style={{color: '#e0f2f7'}}>●</span> Tundra</li>
            </ul>
          </div>
        )}

        <div className="instructions">
          <h4>How to Add Your Map Image:</h4>
          <ol>
            <li>Save your world map image to <code>public/world-map.png</code></li>
            <li>Make sure dimensions are 2000x1030 pixels</li>
            <li>The map will auto-load on startup</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        .world-map-demo {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          background: #1a1a1a;
          min-height: 100vh;
        }

        .map-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .info-panel {
          background: #2a2a2a;
          padding: 20px;
          border-radius: 8px;
          color: white;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin: 15px 0;
        }

        .biome-legend ul {
          list-style: none;
          padding: 0;
        }

        .biome-legend li {
          margin: 5px 0;
        }

        .instructions {
          margin-top: 20px;
          background: #333;
          padding: 15px;
          border-radius: 4px;
        }

        .instructions code {
          background: #444;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }

        h3, h4 {
          margin-top: 0;
          color: #4a90e2;
        }
      `}</style>
    </div>
  );
}
