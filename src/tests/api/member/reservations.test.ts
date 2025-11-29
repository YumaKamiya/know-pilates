import { createMockSupabaseClient, createMockQueryBuilder } from '@/tests/helpers/supabase-mock'
import { mockUpdateCalendarEvent } from '@/tests/helpers/google-mock'
import { POST, GET } from '@/app/api/member/reservations/route'
import { NextRequest } from 'next/server'

jest.mock('@supabase/supabase-js')
jest.mock('@/lib/supabase/server')

describe('POST /api/member/reservations - 予約作成', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    const { createClient: createServerClient } = require('@/lib/supabase/server')
    createClient.mockReturnValue(mockClient)
    createServerClient.mockResolvedValue(mockClient)
  })

  function setupSuccessfulFlow(planType: 'monthly' | 'ticket') {
    // 認証成功
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    // 会員情報
    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-123', name: '田中花子' }, null)
    )

    // スロット情報
    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({
        id: 'slot-1',
        status: 'available',
        start_at: new Date(Date.now() + 86400000).toISOString(),
        end_at: new Date(Date.now() + 90000000).toISOString(),
        google_calendar_event_id: 'event-123',
      }, null)
    )

    // 予約可能チェック
    mockClient.rpc.mockResolvedValue({
      data: [{ can_reserve: true, reason: 'OK', plan_type: planType }],
      error: null,
    })

    // スロット更新
    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'slot-1', status: 'booked' }, null)
    )

    // 予約作成
    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'reservation-1', member_id: 'member-1' }, null)
    )

    if (planType === 'ticket') {
      // チケット消費
      mockClient.from.mockReturnValueOnce(createMockQueryBuilder(null, null))
    }
  }

  it('月プラン会員が予約作成できる（チケット消費なし）', async () => {
    setupSuccessfulFlow('monthly')

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.id).toBe('reservation-1')
  })

  it('回数券会員が予約作成できる（チケット消費あり）', async () => {
    setupSuccessfulFlow('ticket')

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.id).toBe('reservation-1')
  })

  it('認証なしで401エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('他の会員のIDで予約しようとすると403エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-999' }, null) // 別のユーザー
    )

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('予約可能チェック失敗で400エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-123' }, null)
    )

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({
        id: 'slot-1',
        status: 'available',
        start_at: new Date(Date.now() + 86400000).toISOString(),
        end_at: new Date(Date.now() + 90000000).toISOString(),
      }, null)
    )

    mockClient.rpc.mockResolvedValue({
      data: [{ can_reserve: false, reason: 'チケット残高不足', plan_type: 'ticket' }],
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('チケット残高不足')
  })

  it('スロットがavailableでない場合は409エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    const builder1 = createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-123' }, null)
    const builder2 = createMockQueryBuilder({
      id: 'slot-1',
      status: 'booked', // すでに予約済み
      start_at: new Date(Date.now() + 86400000).toISOString(),
      end_at: new Date(Date.now() + 90000000).toISOString(),
    }, null)

    let callCount = 0
    mockClient.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? builder1 : builder2
    })

    // 予約可能チェック（status != 'available'のため実行されないが、念のため設定）
    mockClient.rpc.mockResolvedValue({
      data: [{ can_reserve: true, reason: 'OK', plan_type: 'ticket' }],
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(409)
  })

  it('過去の枠は予約できない', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-123' }, null)
    )

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({
        id: 'slot-1',
        status: 'available',
        start_at: new Date(Date.now() - 86400000).toISOString(), // 昨日
        end_at: new Date(Date.now() - 82800000).toISOString(),
      }, null)
    )

    mockClient.rpc.mockResolvedValue({
      data: [{ can_reserve: true, reason: 'OK', plan_type: 'ticket' }],
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('過去の枠')
  })

  it('楽観的ロック: 別リクエストで先に予約された場合は409エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1', auth_user_id: 'auth-123', name: '田中花子' }, null)
    )

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({
        id: 'slot-1',
        status: 'available',
        start_at: new Date(Date.now() + 86400000).toISOString(),
        end_at: new Date(Date.now() + 90000000).toISOString(),
      }, null)
    )

    mockClient.rpc.mockResolvedValue({
      data: [{ can_reserve: true, reason: 'OK', plan_type: 'ticket' }],
      error: null,
    })

    // 楽観的ロック失敗（maybeSingle が null）
    mockClient.from.mockReturnValueOnce(createMockQueryBuilder(null, null))

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(409)
    expect(json.error).toContain('すでに予約されています')
  })

  it('Google Calendar更新エラーでも予約は成功する', async () => {
    setupSuccessfulFlow('ticket')
    mockUpdateCalendarEvent.mockRejectedValueOnce(new Error('Calendar API Error'))

    const request = new NextRequest('http://localhost:3000/api/member/reservations', {
      method: 'POST',
      body: JSON.stringify({ slotId: 'slot-1', memberId: 'member-1' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})

describe('GET /api/member/reservations - 予約一覧取得', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient: createServerClient } = require('@/lib/supabase/server')
    const { createClient } = require('@supabase/supabase-js')
    createServerClient.mockResolvedValue(mockClient)
    createClient.mockReturnValue(mockClient)
  })

  it('自分の予約一覧を取得できる', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(
      createMockQueryBuilder({ id: 'member-1' }, null)
    )

    const mockReservations = [
      { id: 'res-1', status: 'confirmed', slots: { start_at: '2025-01-10' } },
    ]
    mockClient.from.mockReturnValueOnce(createMockQueryBuilder(mockReservations, null))

    const request = new NextRequest('http://localhost:3000/api/member/reservations')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual(mockReservations)
  })

  it('status絞り込みができる（confirmed, cancelled）', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-123' } },
      error: null,
    })

    mockClient.from.mockReturnValueOnce(createMockQueryBuilder({ id: 'member-1' }, null))
    mockClient.from.mockReturnValueOnce(createMockQueryBuilder([], null))

    const request = new NextRequest('http://localhost:3000/api/member/reservations?status=confirmed')
    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('認証なしで401エラー', async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/member/reservations')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})
