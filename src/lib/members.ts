export const MEMBERS = ['Emily', 'Val', 'Julia', 'Melissa'] as const

export type Member = (typeof MEMBERS)[number]

export function isMember(value: string): value is Member {
  return (MEMBERS as readonly string[]).includes(value)
}
