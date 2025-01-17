import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { transform } from 'ol/proj';
import { Style, Stroke, Fill } from 'ol/style';
import { Coordinate } from '../types';

interface MapComponentProps {
  onCoordinateAdd: (coord: Coordinate) => void;
  drawingMode: 'linestring' | 'polygon' | null;
  onDrawingComplete: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  onCoordinateAdd,
  drawingMode,
  onDrawingComplete,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const vectorSource = useRef(new VectorSource());
  const drawInteraction = useRef<Draw | null>(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
      style: new Style({
        stroke: new Stroke({
          color: '#3b82f6',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(59, 130, 246, 0.1)',
        }),
      }),
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Add modify interaction for existing features
    const modify = new Modify({
      source: vectorSource.current,
    });
    initialMap.addInteraction(modify);

    setMap(initialMap);

    return () => {
      initialMap.dispose();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    if (drawingMode) {
      const draw = new Draw({
        source: vectorSource.current,
        type: drawingMode === 'linestring' ? 'LineString' : 'Polygon',
        style: new Style({
          stroke: new Stroke({
            color: '#3b82f6',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(59, 130, 246, 0.1)',
          }),
        }),
      });

      draw.on('drawend', (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        
        if (geometry instanceof LineString) {
          const coordinates = geometry.getCoordinates();
          coordinates.forEach((coord) => {
            const transformed = transform(coord, 'EPSG:3857', 'EPSG:4326');
            onCoordinateAdd({
              longitude: transformed[0],
              latitude: transformed[1],
            });
          });
        } else if (geometry instanceof Polygon) {
          const coordinates = geometry.getCoordinates()[0];
          coordinates.forEach((coord) => {
            const transformed = transform(coord, 'EPSG:3857', 'EPSG:4326');
            onCoordinateAdd({
              longitude: transformed[0],
              latitude: transformed[1],
            });
          });
        }
      });

      map.addInteraction(draw);
      drawInteraction.current = draw;

      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          draw.finishDrawing();
          onDrawingComplete();
        }
      };

      document.addEventListener('keypress', handleKeyPress);

      return () => {
        map.removeInteraction(draw);
        document.removeEventListener('keypress', handleKeyPress);
      };
    }
  }, [map, drawingMode]);

  return <div ref={mapRef} className="w-full h-[600px]" />;
};