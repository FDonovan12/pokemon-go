import { environment } from 'environments/environment';

export function MeasurePerf() {
    // ❌ En prod → on ne fait rien
    if (environment.production) {
        return () => {};
    }

    return function (target: any) {
        let start = performance.now();
        let asyncEnd: number | null = null;
        let viewEnd: number | null = null;

        /* --- Hook 1 : Mesure AfterViewInit (rendu DOM) --- */
        const originalAfterViewInit = target.prototype.ngAfterViewInit;

        target.prototype.ngAfterViewInit = function () {
            viewEnd = performance.now();
            console.log(`⏱️ [${target.name}] Rendu DOM : ${Math.round(viewEnd - start)} ms`);

            if (originalAfterViewInit) {
                originalAfterViewInit.apply(this);
            }
        };

        /* --- Hook 2 : Mesure async (ngOnInit + rendu suivant) --- */
        const originalOnInit = target.prototype.ngOnInit;

        target.prototype.ngOnInit = async function () {
            if (originalOnInit) {
                await originalOnInit.apply(this);
            }

            queueMicrotask(() => {
                asyncEnd = performance.now();
                console.log(`⏱️ [${target.name}] Async + affichage : ${Math.round(asyncEnd - start)} ms`);

                logFinal(); // permet d’afficher le résumé si tout est déjà mesuré
            });
        };

        /* --- Résumé final quand toutes les mesures sont connues --- */
        function logFinal() {
            if (viewEnd && asyncEnd) {
                console.log(
                    `%c[${target.name}] Résumé :\n` +
                        `• Rendu DOM : ${Math.round(viewEnd - start)} ms\n` +
                        `• Async + affichage : ${Math.round(asyncEnd - start)} ms\n` +
                        'background:#222;color:#0f0;padding:4px;font-weight:bold;',
                );
            }
        }
    };
}
