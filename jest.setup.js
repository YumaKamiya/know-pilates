import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'stream/web'

// グローバルWeb API設定（Node.js 18互換）
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream

// 環境変数設定（テスト用）
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.GOOGLE_CALENDAR_ID = 'test@calendar.google.com'

// Next.js headers/cookies モック
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
    get: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// next/server モック
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server')
  return {
    NextRequest: actualNextServer.NextRequest,
    NextResponse: {
      json: jest.fn((data, init) => ({
        json: async () => data,
        status: init?.status || 200,
      })),
    },
  }
})
