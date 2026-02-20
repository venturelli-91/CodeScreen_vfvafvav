import type { Shift, Worker, Workplace } from '../types'

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
    create: (body: { name: string; address: string }) =>
      request<Workplace>('/workplaces', { method: 'POST', body: JSON.stringify(body) }),
  },
  workers: {
    list: () => request<Worker[]>('/workers'),
    create: (body: { name: string; trade: string }) =>
      request<Worker>('/workers', { method: 'POST', body: JSON.stringify(body) }),
  },
  shifts: {
    list: () => request<Shift[]>('/shifts'),
    create: (body: { workplaceId: string; start: string; end: string; trade: string }) =>
      request<Shift>('/shifts', { method: 'POST', body: JSON.stringify(body) }),
    claim: (id: string, workerId: string) =>
      request<Shift>(`/shifts/${id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ workerId }),
      }),
    cancel: (id: string) =>
      request<Shift>(`/shifts/${id}/cancel`, { method: 'POST' }),
  },
}
