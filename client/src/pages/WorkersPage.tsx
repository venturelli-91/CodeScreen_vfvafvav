import { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function WorkersPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [trade, setTrade] = useState('')

  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.workers.list(),
  })

  const createWorker = useMutation({
    mutationFn: api.workers.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workers'] })
      setOpen(false)
      setName('')
      setTrade('')
    },
  })

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          Workers
        </Typography>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          Add worker
        </Button>
      </Box>

      {workers?.length === 0 ? (
        <Typography color="text.secondary">No workers yet.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
          {workers?.map((w) => (
            <Card key={w.id}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.1rem', fontWeight: 700 }}>
                  {initials(w.name)}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1">{w.name}</Typography>
                  <Chip label={w.trade} size="small" variant="outlined" color="primary" sx={{ mt: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add a worker</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
          />
          <TextField
            label="Trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g. Welder"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!name || !trade || createWorker.isPending}
            onClick={() => createWorker.mutate({ name, trade })}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
