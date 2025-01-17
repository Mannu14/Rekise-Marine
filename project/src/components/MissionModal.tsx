import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Info } from 'lucide-react';
import { WayPoint, PolygonData } from '../types';

interface MissionModalProps {
  waypoints: WayPoint[];
  polygons: PolygonData[];
  activePolygon: PolygonData | null;
  onInsertPolygon: (waypointId: string, position: 'before' | 'after') => void;
  onImportPolygon: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  waypoints,
  polygons,
  activePolygon,
  onInsertPolygon,
  onImportPolygon,
}) => {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">Mission Planner</Dialog.Title>
          
          {/* Legend Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">WP(00):</span> Waypoint number
              </div>
              <div>
                <span className="font-medium">Coordinates:</span> Longitude, Latitude
              </div>
              <div>
                <span className="font-medium">Distance:</span> Meters to next point
              </div>
              <div>
                <span className="font-medium">Actions:</span> Insert polygon options
              </div>
            </div>
          </div>

          {/* Waypoints Section */}
          <div className="space-y-2">
            {waypoints.map((waypoint, index) => (
              <div key={waypoint.id} className="flex items-center justify-between bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">WP({String(index).padStart(2, '0')})</span>
                    <span className="text-gray-600">
                      ({waypoint.coordinates.longitude.toFixed(8)}, {waypoint.coordinates.latitude.toFixed(8)})
                    </span>
                  </div>
                  {waypoint.distance && (
                    <span className="text-sm text-gray-500">
                      Distance to next: {waypoint.distance.toFixed(2)}m
                    </span>
                  )}
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="bg-white rounded-md shadow-lg p-1 min-w-[200px] z-50">
                      <DropdownMenu.Item
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2"
                        onClick={() => onInsertPolygon(waypoint.id, 'before')}
                      >
                        Insert Polygon Before
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2"
                        onClick={() => onInsertPolygon(waypoint.id, 'after')}
                      >
                        Insert Polygon After
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            ))}
          </div>

          {/* Active Polygon Section */}
          {activePolygon && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Polygon Points</h3>
                <button
                  onClick={onImportPolygon}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Import Points
                </button>
              </div>
              <div className="space-y-2">
                {activePolygon.coordinates.map((coord, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <span className="font-medium">P({String(index).padStart(2, '0')})</span>
                    <span className="ml-2">
                      ({coord.longitude.toFixed(8)}, {coord.latitude.toFixed(8)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};