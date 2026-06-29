// supabase.service.ts
import { inject, Injectable, NgZone, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: {},
    });
    private zone = inject(NgZone);
    readonly session = signal<any>(null);

    constructor() {
        console.log(environment.supabaseUrl);
        console.log(environment.supabaseAnonKey);
        this.client.auth.getSession().then(({ data }) => {
            this.session.set(data.session);
        });

        this.client.auth.onAuthStateChange((event, session) => {
            console.log(event, session);
            this.session.set(session);
        });
    }

    getUserId(): string | null {
        const session = this.session();
        if (session) return session.user.id;
        return null;
    }

    isLoggedIn(): boolean {
        const id = this.getUserId();
        return id !== null;
    }

    signInWithGoogle() {
        return this.client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'http://localhost:4200/pokemon-go/' },
        });
    }

    signOut() {
        this.client.auth.signOut();
    }

    getSession() {
        return this.client.auth.getSession();
    }
}
