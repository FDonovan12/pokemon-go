import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ToastContainerComponent } from './shared/features/toast/toast-container.component';
import { ToastService } from './shared/features/toast/toast.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, ToastContainerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    private readonly toastService: ToastService = inject(ToastService);
    private readonly swUpdate: SwUpdate = inject(SwUpdate);

    deferredPrompt = signal<any>(null);
    isInstalled = signal(false);

    isStandalone = computed(
        () => window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true,
    );

    canInstall = computed(() => !this.isStandalone() && !this.isInstalled() && this.deferredPrompt() !== null);

    constructor() {
        // Affiche le toast quand canInstall devient true
        effect(() => {
            if (this.canInstall()) {
                this.toastService
                    .prepare('Ce site a une version installable.', "Voulez vous installer l'application ?")
                    .showConfirmation(
                        () => this.installApp(),
                        () => {},
                    );
            }
        });
    }

    ngOnInit() {
        if (this.isStandalone()) {
            this.isInstalled.set(true);
        }

        window.addEventListener('beforeinstallprompt', (event: any) => {
            event.preventDefault();
            this.deferredPrompt.set(event);
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt.set(null);
            this.isInstalled.set(true);
        });

        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates.subscribe((event) => {
                if (event.type === 'VERSION_READY') {
                    this.onNewVersion();
                }
            });
        }
    }

    onNewVersion() {
        this.toastService.prepare('Nouvelle version disponible.', 'Mettre à jour ?').showConfirmation(
            () => window.location.reload(),
            () => {},
        );
    }

    installApp() {
        const prompt = this.deferredPrompt();
        if (!prompt) return;

        prompt.prompt();
        prompt.userChoice.then((result: any) => {
            if (result.outcome === 'accepted') {
                this.isInstalled.set(true);
            }
            this.deferredPrompt.set(null);
        });
    }

    fetchDynamax() {
        fetch('assets/dynamax.html')
            .then((res) => res.text())
            .then((html) => {
                const trRegex = /<tr[\s\S]*?<\/tr>/g;
                const trMatches = html.match(trRegex);

                const outputLines: string[] = [];

                if (trMatches) {
                    trMatches.forEach((tr) => {
                        // Nom du Pokémon
                        const nameMatch = tr.match(/<span class="ent-name">([^<]+)<\/span>/);
                        if (!nameMatch) return;

                        const fullName = nameMatch[1].trim();
                        const baseName = fullName.replace(/^(Dynamax|Gigantamax)\s+/i, '');
                        const nameKey = baseName.replace(/\s+/g, '');

                        // Récupérer le type depuis la classe "itype ..." dans le <small>
                        const typeMatch = tr.match(/<small class="itype ([^"]+)">/);
                        let attackTypes: string[] = [];
                        if (typeMatch) {
                            const typeRaw = typeMatch[1].trim();
                            // Mettre la première lettre en majuscule
                            attackTypes = [typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1)];
                        }

                        // Récupérer la valeur d'attaque : deuxième <td class="cell-num">
                        const cellMatches = [...tr.matchAll(/<td class="cell-num">(\d+)<\/td>/g)];
                        if (cellMatches.length < 2) return;

                        const attackValue = parseInt(cellMatches[1][1], 10);

                        // Créer la ligne uniquement si Dynamax ou Gigantamax
                        if (/Dynamax/i.test(fullName)) {
                            outputLines.push(
                                `new Dynamax(pokemons.${nameKey}, ${attackValue}, [${attackTypes.map((t) => `'${t}'`).join(', ')}]),`,
                            );
                        } else if (/Gigantamax/i.test(fullName)) {
                            outputLines.push(
                                `new Gigamax(pokemons.${nameKey}, ${attackValue}, [${attackTypes.map((t) => `'${t}'`).join(', ')}]),`,
                            );
                        }
                    });
                }

                // Afficher le résultat global
                console.log(outputLines.join('\n'));
            });
    }
}
