import { Component, computed, input } from '@angular/core';
import { PvpRank } from '../../pvp-rank/pvp-rank-store/pvp-rank-store';
import { RankedStat } from '../pvp-rank-detail-page';
@Component({
    selector: 'app-league-rank-expanded-component',
    imports: [],
    template: `
        <div class="expanded-league-title">{{ title() }}</div>
        <div class="expanded-list">
            @if (list()) {
                @for (item of list(); track item.rank) {
                    <div
                        class="expanded-item"
                        [class.worse-rank]="(actualRank()?.[league()]?.normal ?? 4096) < item.rank"
                        [class.better-rank]="(actualRank()?.[league()]?.normal ?? 4096) > item.rank"
                    >
                        <span>Rank {{ item.rank }}</span>
                        <span>{{ item.stat.attack }} / {{ item.stat.defense }} / {{ item.stat.stamina }}</span>
                    </div>
                } @empty {
                    <span class="no-rank">Aucun résultat</span>
                }
            } @else {
                <span class="unavailable">❌</span>
            }
        </div>
    `,
    styles: `
        :host {
            flex: 1;
        }

        .expanded-list {
            max-height: 220px; /* ~7 lignes visibles selon la hauteur d'un item */
            overflow-y: auto;
        }
        .expanded-item {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0.5rem;
        }
        .better-rank {
            color: var(--success-color);
        }
        .worse-rank {
            color: var(--warning-color);
        }
    `,
})
export class LeagueRankExpandedComponent {
    list = input.required<RankedStat[] | null | undefined>();
    league = input.required<'super' | 'hyper'>();
    actualRank = input.required<PvpRank | undefined>();

    title = computed(() => this.league().capitalize() + ' Ligue');
}
