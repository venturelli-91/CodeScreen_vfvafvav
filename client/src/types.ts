export interface Workplace {
  id: string
  name: string
  active: boolean
  createdAt: string
}

export interface Worker {
  id: string
  name: string
  active: boolean
  createdAt: string
}

export type ShiftStatus = 'open' | 'claimed' | 'completed'

export interface Shift {
  id: string
  workplaceId: string
  workerId: string | null
  startTime: string
  endTime: string
  status: ShiftStatus
  workplace?: Workplace
  worker?: Worker | null
}
