import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

const fmt = (d: string) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function shiftStatus(cancelled: boolean, workerId: string | null) {
  if (cancelled) return { label: 'Cancelled', color: 'error' as const }
  if (workerId) return { label: 'Claimed', color: 'warning' as const }
  return { label: 'Open', color: 'success' as const }
}

export default function ShiftsPage() {
  const qc = useQueryClient()
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => api.shifts.list(),
  })

  const { data: workers } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.workers.list(),
  })

  const claim = useMutation({
    mutationFn: ({ shiftId, workerId }: { shiftId: string; workerId: string }) =>
      api.shifts.claim(shiftId, workerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      setClaimingId(null)
    },
  })

  const cancel = useMutation({
    mutationFn: (shiftId: string) => api.shifts.cancel(shiftId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  })

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: "text.primary", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
        Shifts
      </Typography>
      {shifts?.length === 0 && (
        <Typography color="text.secondary">No shifts yet.</Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {shifts?.map((shift) => {
          const status = shiftStatus(shift.cancelled, shift.workerId)
          const eligible = workers?.filter((w) => w.trade === shift.trade) ?? []
          return (
            <Card key={shift.id}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip label={shift.trade} size="small" variant="outlined" color="primary" />
                  <Chip label={status.label} size="small" color={status.color} />
                </Box>
                <Typography variant="subtitle1" noWrap>
                  {shift.workplace?.name ?? '—'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                  <AccessTimeIcon sx={{ fontSize: 15 }} />
                  <Typography variant="body2">
                    {fmt(shift.start)} → {fmt(shift.end)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <PersonIcon sx={{ fontSize: 15 }} />
                  <Typography variant="body2">
                    {shift.worker?.name ?? 'Unassigned'}
                  </Typography>
                </Box>
              </CardContent>

              {(!shift.cancelled) && (
                <CardActions sx={{ pt: 0, flexWrap: 'wrap', gap: 0.5 }}>
                  {!shift.workerId && (
                    claimingId === shift.id ? (
                      eligible.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                          No eligible workers
                        </Typography>
                      ) : (
                        eligible.map((w) => (
                          <Button
                            key={w.id}
                            size="small"
                            variant="outlined"
                            onClick={() => claim.mutate({ shiftId: shift.id, workerId: w.id })}
                          >
                            {w.name}
                          </Button>
                        ))
                      )
                    ) : (
                      <Button size="small" variant="contained" onClick={() => setClaimingId(shift.id)}>
                        Claim
                      </Button>
                    )
                  )}
                  {shift.workerId && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => cancel.mutate(shift.id)}
                      disabled={cancel.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </CardActions>
              )}
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
