import { createMockSupabaseClient, createMockQueryBuilder } from '@/tests/helpers/supabase-mock'
import { GET, POST } from '@/app/api/admin/tickets/route'
import { NextRequest } from 'next/server'

jest.mock('@supabase/supabase-js')

describe('GET /api/admin/tickets', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValue(mockClient)
  })

  it('会員のチケット履歴を取得できる', async () => {
    const mockLogs = [
      { id: '1', member_id: 'member-1', type: 'grant', amount: 10, created_at: '2025-01-01' },
      { id: '2', member_id: 'member-1', type: 'consume', amount: -1, created_at: '2025-01-02' },
    ]

    const builder = createMockQueryBuilder(mockLogs, null)
    mockClient.from.mockImplementation(() => builder)

    const request = new NextRequest('http://localhost:3000/api/admin/tickets?member_id=member-1')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual(mockLogs)
  })

  it('member_idが未指定の場合は400エラー', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/tickets')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('member_id')
  })
})

describe('POST /api/admin/tickets - チケット付与（grant）', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValue(mockClient)
  })

  it('チケット付与が成功する', async () => {
    const mockTicket = { id: '1', member_id: 'member-1', type: 'grant', amount: 10 }
    mockClient.from.mockReturnValue(createMockQueryBuilder(mockTicket, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'grant',
        amount: 10,
        reason: 'テスト付与',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.amount).toBe(10) // 正の値
  })

  it('amountが正の値になる（Math.abs適用）', async () => {
    mockClient.from.mockReturnValue(createMockQueryBuilder({ amount: 10 }, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'grant',
        amount: -10, // 負の値を渡す
        reason: 'テスト',
      }),
    })

    await POST(request)

    // INSERTの引数を確認
    const insertCall = mockClient.from().insert.mock.calls[0][0]
    expect(insertCall.amount).toBe(10) // 正の値に変換される
  })
})

describe('POST /api/admin/tickets - チケット消費（consume）', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValue(mockClient)
  })

  it('残高が十分な場合、チケット消費が成功する', async () => {
    // 残高10
    mockClient.from.mockReturnValueOnce(createMockQueryBuilder({ balance: 10 }, null))
    // INSERT成功
    mockClient.from.mockReturnValueOnce(createMockQueryBuilder({ amount: -1 }, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'consume',
        amount: 1,
        reason: '予約消費',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.amount).toBe(-1) // 負の値
  })

  it('残高不足の場合は400エラー（有効期限考慮）', async () => {
    // member_ticket_balance_valid: 残高0（有効期限切れ除外済み）
    mockClient.from.mockReturnValue(createMockQueryBuilder({ balance: 0 }, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'consume',
        amount: 1,
        reason: 'テスト消費',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('チケット残高が不足')
  })

  it('amountが負の値になる（-Math.abs適用）', async () => {
    const builder1 = createMockQueryBuilder({ balance: 10 }, null)
    const builder2 = createMockQueryBuilder({ amount: -1 }, null)

    let callCount = 0
    mockClient.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? builder1 : builder2
    })

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'consume',
        amount: 1,
        reason: 'テスト',
      }),
    })

    await POST(request)

    expect(builder2.insert).toHaveBeenCalled()
    const insertCall = builder2.insert.mock.calls[0][0]
    expect(insertCall.amount).toBe(-1) // 負の値
  })

  it('有効期限切れチケットは残高に含まれない', async () => {
    // member_ticket_balance_validビューは有効期限切れを除外済み
    mockClient.from.mockReturnValue(createMockQueryBuilder({ balance: 5 }, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'consume',
        amount: 6, // 残高5を超える
        reason: 'テスト',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

describe('POST /api/admin/tickets - チケット返却（refund）', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValue(mockClient)
  })

  it('チケット返却が成功する', async () => {
    mockClient.from.mockReturnValue(createMockQueryBuilder({ amount: 1 }, null))

    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'refund',
        amount: 1,
        reason: 'キャンセル返却',
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.amount).toBe(1) // 正の値
  })
})

describe('POST /api/admin/tickets - バリデーション', () => {
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValue(mockClient)
  })

  it('必須パラメータ不足で400エラー', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({ member_id: 'member-1' }), // type, amount欠落
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('無効なtypeで400エラー', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'POST',
      body: JSON.stringify({
        member_id: 'member-1',
        type: 'invalid',
        amount: 1,
      }),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('grant, consume, refund')
  })
})
