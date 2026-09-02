// src/types/leaflet-markercluster.d.ts
import 'leaflet';

declare module 'leaflet' {
    interface MarkerClusterGroupOptions extends L.LayerOptions {
        maxClusterRadius?: number;
        disableClusteringAtZoom?: number;
        spiderfyOnMaxZoom?: boolean;
        showCoverageOnHover?: boolean;
        zoomToBoundsOnClick?: boolean;
        removeOutsideVisibleBounds?: boolean;
    }

    class MarkerClusterGroup extends L.FeatureGroup {
        addLayer(layer: L.Layer): this;
        removeLayer(layer: L.Layer): this;
        clearLayers(): this;
    }

    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
