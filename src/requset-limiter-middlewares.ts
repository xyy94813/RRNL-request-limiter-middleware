const createReqLimitedMiddleware = () => {
  return (next: (req: any) => Promise<any>) => async (req: any) => await next(req)
}

export default createReqLimitedMiddleware
