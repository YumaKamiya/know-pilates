export type MockSupabaseClient = {
  from: jest.Mock
  auth: {
    getUser: jest.Mock
  }
  rpc: jest.Mock
}

export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  }
}

export function createMockQueryBuilder(returnData?: any, returnError?: any) {
  const result = { data: returnData, error: returnError }

  const builder: any = {
    then: (resolve: any) => resolve(result), // Promiseライクな動作
  }

  // メソッド定義（同期的にbuilderを返し、かつPromiseとしても動作）
  builder.select = jest.fn().mockImplementation(() => builder)
  builder.insert = jest.fn().mockImplementation(() => builder)
  builder.update = jest.fn().mockImplementation(() => builder)
  builder.delete = jest.fn().mockImplementation(() => builder)
  builder.eq = jest.fn().mockImplementation(() => builder)
  builder.neq = jest.fn().mockImplementation(() => builder)
  builder.gt = jest.fn().mockImplementation(() => builder)
  builder.gte = jest.fn().mockImplementation(() => builder)
  builder.lt = jest.fn().mockImplementation(() => builder)
  builder.lte = jest.fn().mockImplementation(() => builder)
  builder.order = jest.fn().mockImplementation(() => builder)
  builder.limit = jest.fn().mockImplementation(() => builder)
  builder.single = jest.fn().mockResolvedValue(result)
  builder.maybeSingle = jest.fn().mockResolvedValue(result)

  return builder
}
