// pokestop-page.ts
import {
    Component,
    ElementRef,
    Injector,
    OnInit,
    ViewChild,
    computed,
    effect,
    inject,
    resource,
    signal,
} from '@angular/core';

declare const L: typeof import('leaflet');

interface Pokestop {
    id: string;
    name: string;
    lat: number;
    lon: number;
    url: string;
}

const POKESTOP_URL = 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokestop.json';
const DEFAULT_CENTER: L.LatLngTuple = [45.7772, 3.087];

@Component({
    selector: 'app-pokestop-map',
    standalone: true,
    templateUrl: './pokestop-page.html',
    styleUrl: './pokestop-page.css',
})
export class PokestopPage implements OnInit {
    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

    private readonly injector = inject(Injector);
    private map!: import('leaflet').Map;
    private clusterGroup!: import('leaflet').MarkerClusterGroup;

    readonly locationDenied = signal(false);

    readonly pokestopsResource = resource({
        loader: async () => {
            const res = await fetch(POKESTOP_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as Pokestop[];
        },
    });

    readonly loading = computed(() => this.pokestopsResource.isLoading());
    readonly error = computed(() =>
        this.pokestopsResource.error() ? 'Impossible de charger la liste des pokestops.' : null,
    );

    ngOnInit(): void {
        this.initMap();
        this.locateUser();

        // Injector explicite requis: on n'est plus dans le constructeur/field initializer
        effect(
            () => {
                const pokestops = this.pokestopsResource.value();
                if (pokestops) {
                    this.renderPokestops(pokestops);
                }
            },
            { injector: this.injector },
        );
    }

    private initMap(): void {
        this.map = L.map(this.mapContainer.nativeElement).setView(DEFAULT_CENTER, 14);

        L.tileLayer(
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 19, // zoom max autorisé dans l'app
                maxNativeZoom: 16, // zoom max réel où Esri fournit des tuiles
            },
        ).addTo(this.map);

        this.clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 35,
            disableClusteringAtZoom: 18,
            spiderfyOnMaxZoom: true,
        });
        this.map.addLayer(this.clusterGroup);
    }

    private locateUser(): void {
        if (!navigator.geolocation) {
            this.locationDenied.set(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: L.LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
                this.map.setView(coords, 18);

                L.marker(coords, {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div class="user-dot"></div>',
                        iconSize: [16, 16],
                    }),
                })
                    .addTo(this.map)
                    .bindPopup('Toi');
            },
            () => this.locationDenied.set(true),
            { enableHighAccuracy: true, timeout: 8000 },
        );
    }

    private renderPokestops(pokestops: Pokestop[]): void {
        this.clusterGroup.clearLayers();

        for (const p of pokestops) {
            const icon = L.icon({
                iconUrl: p.url,
                iconSize: [32, 32],
                className: 'pokestop-icon',
            });

            const marker = L.marker([p.lat, p.lon], { icon });
            marker.bindPopup(
                `<strong>${this.escapeHtml(p.name)}</strong><br>
                 <a href="https://www.google.com/maps?q=${p.lat},${p.lon}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>`,
            );
            this.clusterGroup.addLayer(marker);
        }
    }

    private escapeHtml(str: string): string {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
