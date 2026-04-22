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

// Secrets used at runtime in serverless (Netlify Functions); do not use $env/static/private for these.
declare module '$env/dynamic/private' {
	export const env: {
		SUPABASE_SERVICE_ROLE_KEY?: string
		STRIPE_SECRET_KEY?: string
		STRIPE_WEBHOOK_SECRET?: string
	}
}

export {};
