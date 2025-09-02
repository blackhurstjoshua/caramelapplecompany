import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Helper functions for case conversion
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key)
      result[camelKey] = convertKeysToCamelCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

function convertKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = convertKeysToSnakeCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

const supabaseClient = createClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      db: {
        schema: 'public'
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
)

// Create a wrapper that automatically handles case conversion
class SupabaseWrapper {
  private client = supabaseClient

  // Auth methods pass through unchanged
  get auth() {
    return this.client.auth
  }

  // Storage methods pass through unchanged  
  get storage() {
    return this.client.storage
  }

  // Table methods with automatic case conversion
  from(table: string) {
    const originalTable = this.client.from(table)
    
    return {
      select: (columns?: string) => {
        return originalTable.select(columns).then(({ data, error }) => {
          if (error) throw error
          return {
            data: data ? convertKeysToCamelCase(data) : data,
            error
          }
        })
      },
      
      insert: (values: any) => {
        const snakeCaseValues = convertKeysToSnakeCase(values)
        return originalTable.insert(snakeCaseValues).then(({ data, error }) => ({
          data: data ? convertKeysToCamelCase(data) : data,
          error
        }))
      },
      
      update: (values: any) => {
        const snakeCaseValues = convertKeysToSnakeCase(values)
        return {
          eq: (column: string, value: any) => {
            const snakeCaseColumn = toSnakeCase(column)
            return originalTable.update(snakeCaseValues).eq(snakeCaseColumn, value).then(({ data, error }) => ({
              data: data ? convertKeysToCamelCase(data) : data,
              error
            }))
          }
        }
      },
      
      upsert: (values: any, options?: { onConflict?: string }) => {
        const snakeCaseValues = convertKeysToSnakeCase(values)
        const snakeCaseOptions = options?.onConflict ? {
          ...options,
          onConflict: toSnakeCase(options.onConflict)
        } : options
        
        return {
          select: (columns?: string) => {
            return originalTable.upsert(snakeCaseValues, snakeCaseOptions).select(columns).then(({ data, error }) => ({
              data: data ? convertKeysToCamelCase(data) : data,
              error
            }))
          }
        }
      },
      
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            const snakeCaseColumn = toSnakeCase(column)
            return originalTable.delete().eq(snakeCaseColumn, value).then(({ data, error }) => ({
              data: data ? convertKeysToCamelCase(data) : data,
              error
            }))
          }
        }
      }
    }
  }
}

export const supabase = new SupabaseWrapper()
