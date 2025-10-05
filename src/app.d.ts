/// <reference types="@sveltejs/kit" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare namespace App {
	interface Locals {
		supabase: import('@supabase/supabase-js').SupabaseClient
	}
}

declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string
	export const PUBLIC_SUPABASE_ANON_KEY: string
}

declare module '$env/static/private' {
	export const SUPABASE_SERVICE_ROLE_KEY: string
	export const STRIPE_SECRET_KEY: string
	export const STRIPE_WEBHOOK_SECRET: string
}

export {};
