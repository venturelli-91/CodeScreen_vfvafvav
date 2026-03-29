import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Snackbar,
  Typography,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import type { Worker, Shift } from '../types'

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

function ShiftCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(232,97,44,0.14)',
        p: 2,
        background: 'rgba(18,7,3,0.78)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ width: 70, height: 22, borderRadius: 1, bgcolor: 'rgba(232,97,44,0.12)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <Box sx={{ width: 60, height: 22, borderRadius: 1, bgcolor: 'rgba(232,97,44,0.12)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </Box>
      <Box sx={{ width: '70%', height: 18, borderRadius: 1, bgcolor: 'rgba(232,97,44,0.08)', mb: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Box sx={{ width: '90%', height: 14, borderRadius: 1, bgcolor: 'rgba(232,97,44,0.08)', mb: 1.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Divider sx={{ my: 1 }} />
      <Box sx={{ width: '50%', height: 14, borderRadius: 1, bgcolor: 'rgba(232,97,44,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </Box>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

interface WorkerPickerProps {
  shift: Shift
  eligible: Worker[]
  onPick: (workerId: string) => void
  isPending: boolean
}

function WorkerPicker({ shift, eligible, onPick, isPending }: WorkerPickerProps) {
  if (eligible.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        No eligible workers
      </Typography>
    )
  }
  return (
    <AnimatePresence>
      {eligible.map((w) => (
        <motion.div
          key={w.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPick(w.id)}
            disabled={isPending}
            aria-label={`Assign ${w.name} to shift at ${shift.workplace?.name ?? 'this workplace'}`}
          >
            {w.name}
          </Button>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

export default function ShiftsPage() {
  const qc = useQueryClient()
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  })

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity })

  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => api.shifts.list(),
  })

  const { data: workers } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.workers.list(),
  })

  const workersByTrade = useMemo(() => {
    const map = new Map<string, Worker[]>()
    for (const w of workers ?? []) {
      const list = map.get(w.trade) ?? []
      list.push(w)
      map.set(w.trade, list)
    }
    return map
  }, [workers])

  const claim = useMutation({
    mutationFn: ({ shiftId, workerId }: { shiftId: string; workerId: string }) =>
      api.shifts.claim(shiftId, workerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      setClaimingId(null)
      showToast('Shift claimed successfully!', 'success')
    },
    onError: () => showToast('Failed to claim shift.', 'error'),
  })

  const cancel = useMutation({
    mutationFn: (shiftId: string) => api.shifts.cancel(shiftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      showToast('Shift cancelled.', 'success')
    },
    onError: () => showToast('Failed to cancel shift.', 'error'),
  })

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
        Shifts
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          {[...Array(6)].map((_, i) => <ShiftCardSkeleton key={i} />)}
        </Box>
      ) : (
        <>
          {shifts?.length === 0 && (
            <Typography color="text.secondary">No shifts yet.</Typography>
          )}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
          >
            {shifts?.map((shift) => {
              const status = shiftStatus(shift.cancelled, shift.workerId)
              const eligible = workersByTrade.get(shift.trade) ?? []
              return (
                <motion.div key={shift.id} variants={cardVariants}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip label={shift.trade} size="small" variant="outlined" color="primary" />
                        <Chip label={status.label} size="small" color={status.color} />
                      </Box>
                      <Typography variant="subtitle1" noWrap>
                        {shift.workplace?.name ?? '—'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} aria-hidden="true" />
                        <Typography variant="body2">
                          {fmt(shift.start)} → {fmt(shift.end)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <PersonIcon sx={{ fontSize: 15 }} aria-hidden="true" />
                        <Typography variant="body2">
                          {shift.worker?.name ?? 'Unassigned'}
                        </Typography>
                      </Box>
                    </CardContent>

                    {shift.cancelled ? null : (
                      <CardActions sx={{ pt: 0, flexWrap: 'wrap', gap: 0.5 }}>
                        {!shift.workerId ? (
                          claimingId === shift.id ? (
                            <WorkerPicker
                              shift={shift}
                              eligible={eligible}
                              onPick={(workerId) => claim.mutate({ shiftId: shift.id, workerId })}
                              isPending={claim.isPending}
                            />
                          ) : (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => setClaimingId(shift.id)}
                                aria-label={`Claim shift at ${shift.workplace?.name ?? 'this workplace'}`}
                              >
                                Claim
                              </Button>
                            </motion.div>
                          )
                        ) : (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => cancel.mutate(shift.id)}
                              disabled={cancel.isPending}
                              aria-label={`Cancel shift at ${shift.workplace?.name ?? 'this workplace'}`}
                            >
                              {cancel.isPending ? 'Cancelling…' : 'Cancel'}
                            </Button>
                          </motion.div>
                        )}
                      </CardActions>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
