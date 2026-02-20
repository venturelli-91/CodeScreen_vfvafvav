import type { Shift, ShiftStatus, Worker, Workplace } from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  workplaces: {
    list: () => request<Workplace[]>('/workplaces'),
  },
  workers: {
    list: () => request<Worker[]>('/workers'),
  },
  shifts: {
    list: (status?: ShiftStatus) =>
      request<Shift[]>(`/shifts${status ? `?status=${status}` : ''}`),
    create: (body: { workplaceId: string; startTime: string; endTime: string }) =>
      request<Shift>('/shifts', { method: 'POST', body: JSON.stringify(body) }),
    claim: (id: string, workerId: string) =>
      request<Shift>(`/shifts/${id}/claim`, {
        method: 'PATCH',
        body: JSON.stringify({ workerId }),
      }),
  },
}
