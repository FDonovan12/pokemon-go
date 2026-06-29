import { Component, inject } from '@angular/core';
import { SupabaseService } from '@services/supabase-service/supabase.service';
console.log('AuthCallbackComponent file loaded');
// auth-callback.component.ts
@Component({
    standalone: true,
    template: '',
})
export class AuthCallbackComponent {
    private readonly supabaseService: SupabaseService = inject(SupabaseService);
    // Supabase gère le token automatiquement via onAuthStateChange
    // On redirige après un court délai// auth-callback.component.ts
    constructor() {
        console.log('AuthCallbackComponent');
        const params = new URLSearchParams(window.location.search);
        console.log('params', params);
        const code = params.get('code');
        console.log('code', code);
        if (code) {
            this.supabaseService.client.auth.exchangeCodeForSession(code).then(() => {
                window.location.href = '/pokemon-go/';
            });
        }
    }
}
