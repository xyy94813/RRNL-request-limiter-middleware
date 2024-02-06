import { type RelayRequestAny } from 'react-relay-network-modern'

export type LimitPolicy = 'reject' | 'wait'

export type RateLimiter = {
  tryLimit: (req: RelayRequestAny, limitPolicy: LimitPolicy) => Promise<void>
}
