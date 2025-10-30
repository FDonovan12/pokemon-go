import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '@components/toast-component/toast-component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, ToastComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    ngOnInit(): void {}

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
