import { type RelayRequestAny } from 'react-relay-network-modern'

export type RateLimiter = {
  tryLimit: (req: RelayRequestAny) => void
}
