import { http, HttpResponse } from 'msw'
import type { Shift, Worker, Workplace } from '../types'

export const mockWorkplaces: Workplace[] = [
  { id: 'wp-1', name: 'Olympus Base', address: '1 Olympus Mons, Mars', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'wp-2', name: 'Valles Depot', address: '2 Valles Marineris, Mars', createdAt: '2026-01-02T00:00:00Z' },
]

export const mockWorkers: Worker[] = [
  { id: 'w-1', name: 'Alice Welder', trade: 'Welder', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'w-2', name: 'Bob Driller', trade: 'Driller', createdAt: '2026-01-02T00:00:00Z' },
]

export const mockShifts: Shift[] = [
  {
    id: 's-1',
    workplaceId: 'wp-1',
    workerId: null,
    start: '2026-03-01T08:00:00Z',
    end: '2026-03-01T16:00:00Z',
    trade: 'Welder',
    cancelled: false,
    createdAt: '2026-01-01T00:00:00Z',
    workplace: mockWorkplaces[0],
    worker: null,
  },
  {
    id: 's-2',
    workplaceId: 'wp-1',
    workerId: 'w-1',
    start: '2026-03-02T08:00:00Z',
    end: '2026-03-02T16:00:00Z',
    trade: 'Welder',
    cancelled: false,
    createdAt: '2026-01-02T00:00:00Z',
    workplace: mockWorkplaces[0],
    worker: mockWorkers[0],
  },
  {
    id: 's-3',
    workplaceId: 'wp-2',
    workerId: null,
    start: '2026-03-03T08:00:00Z',
    end: '2026-03-03T16:00:00Z',
    trade: 'Driller',
    cancelled: true,
    createdAt: '2026-01-03T00:00:00Z',
    workplace: mockWorkplaces[1],
    worker: null,
  },
]

export const handlers = [
  http.get('/api/shifts', () => HttpResponse.json(mockShifts)),
  http.get('/api/workers', () => HttpResponse.json(mockWorkers)),
  http.get('/api/workplaces', () => HttpResponse.json(mockWorkplaces)),

  http.post('/api/shifts', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    const newShift: Shift = {
      id: 's-new',
      workplaceId: body.workplaceId,
      workerId: null,
      start: body.start,
      end: body.end,
      trade: body.trade,
      cancelled: false,
      createdAt: new Date().toISOString(),
      workplace: mockWorkplaces.find((w) => w.id === body.workplaceId),
      worker: null,
    }
    return HttpResponse.json(newShift, { status: 201 })
  }),

  http.post('/api/shifts/:id/claim', async ({ params, request }) => {
    const body = await request.json() as { workerId: string }
    const shift = mockShifts.find((s) => s.id === params.id)
    if (!shift) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const worker = mockWorkers.find((w) => w.id === body.workerId)
    return HttpResponse.json({ ...shift, workerId: body.workerId, worker })
  }),

  http.post('/api/shifts/:id/cancel', ({ params }) => {
    const shift = mockShifts.find((s) => s.id === params.id)
    if (!shift) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...shift, workerId: null, cancelled: true })
  }),

  http.post('/api/workers', async ({ request }) => {
    const body = await request.json() as { name: string; trade: string }
    const newWorker: Worker = {
      id: 'w-new',
      name: body.name,
      trade: body.trade,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(newWorker, { status: 201 })
  }),

  http.post('/api/workplaces', async ({ request }) => {
    const body = await request.json() as { name: string; address: string }
    const newWp: Workplace = {
      id: 'wp-new',
      name: body.name,
      address: body.address,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(newWp, { status: 201 })
  }),
]
