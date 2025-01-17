import React, { useState, useCallback } from 'react';
import { MapComponent } from './components/Map';
import { MissionModal } from './components/MissionModal';
import { Coordinate, WayPoint, PolygonData } from './types';
import { MapPin } from 'lucide-react';

function App() {
  const [drawingMode, setDrawingMode] = useState<'linestring' | 'polygon' | null>(null);
  const [waypoints, setWaypoints] = useState<WayPoint[]>([]);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [activePolygon, setActivePolygon] = useState<PolygonData | null>(null);
  const [insertPolygonAt, setInsertPolygonAt] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [tempPolygonCoords, setTempPolygonCoords] = useState<Coordinate[]>([]);

  const calculateDistance = (coord1?: Coordinate, coord2?: Coordinate): number | undefined => {
    if (!coord1 || !coord2) return undefined;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleCoordinateAdd = (coord: Coordinate) => {
    if (drawingMode === 'linestring') {
      const newWaypoint: WayPoint = {
        id: `wp-${Date.now()}`,
        coordinates: coord,
        distance: calculateDistance(waypoints[waypoints.length - 1]?.coordinates, coord),
      };
      setWaypoints([...waypoints, newWaypoint]);
    } else if (drawingMode === 'polygon') {
      setTempPolygonCoords([...tempPolygonCoords, coord]);
    }
  };

  const handleDrawingComplete = useCallback(() => {
    if (drawingMode === 'polygon' && insertPolygonAt) {
      const newPolygon: PolygonData = {
        id: `polygon-${Date.now()}`,
        coordinates: tempPolygonCoords,
        beforeWaypointId: insertPolygonAt.position === 'before' ? insertPolygonAt.id : undefined,
        afterWaypointId: insertPolygonAt.position === 'after' ? insertPolygonAt.id : undefined,
      };
      setActivePolygon(newPolygon);
      setTempPolygonCoords([]);
    }
    setDrawingMode(null);
  }, [drawingMode, insertPolygonAt, tempPolygonCoords]);

  const handleInsertPolygon = (waypointId: string, position: 'before' | 'after') => {
    setInsertPolygonAt({ id: waypointId, position });
    setDrawingMode('polygon');
  };

  const handleImportPolygon = () => {
    if (activePolygon && insertPolygonAt) {
      setPolygons([...polygons, activePolygon]);
      
      // Find the index where to insert the polygon points
      const targetIndex = waypoints.findIndex(wp => wp.id === insertPolygonAt.id);
      const insertIndex = insertPolygonAt.position === 'after' ? targetIndex + 1 : targetIndex;
      
      // Create new waypoints from polygon coordinates
      const polygonWaypoints: WayPoint[] = activePolygon.coordinates.map((coord, index) => ({
        id: `wp-polygon-${Date.now()}-${index}`,
        coordinates: coord,
        distance: index < activePolygon.coordinates.length - 1
          ? calculateDistance(coord, activePolygon.coordinates[index + 1])
          : undefined,
      }));

      // Insert polygon waypoints into the main waypoints array
      const newWaypoints = [
        ...waypoints.slice(0, insertIndex),
        ...polygonWaypoints,
        ...waypoints.slice(insertIndex),
      ];

      // Recalculate distances at connection points
      if (insertIndex > 0) {
        newWaypoints[insertIndex - 1].distance = calculateDistance(
          newWaypoints[insertIndex - 1].coordinates,
          newWaypoints[insertIndex].coordinates
        );
      }
      if (insertIndex + polygonWaypoints.length < newWaypoints.length) {
        newWaypoints[insertIndex + polygonWaypoints.length - 1].distance = calculateDistance(
          newWaypoints[insertIndex + polygonWaypoints.length - 1].coordinates,
          newWaypoints[insertIndex + polygonWaypoints.length].coordinates
        );
      }

      setWaypoints(newWaypoints);
      setActivePolygon(null);
      setInsertPolygonAt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => setDrawingMode('linestring')}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={drawingMode !== null}
          >
            <MapPin className="h-4 w-4" />
            Draw
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MapComponent
            onCoordinateAdd={handleCoordinateAdd}
            drawingMode={drawingMode}
            onDrawingComplete={handleDrawingComplete}
          />
        </div>

        {waypoints.length > 0 && (
          <MissionModal
            waypoints={waypoints}
            polygons={polygons}
            activePolygon={activePolygon}
            onInsertPolygon={handleInsertPolygon}
            onImportPolygon={handleImportPolygon}
          />
        )}
      </div>
    </div>
  );
}

export default App;