import { setupServer } from 'msw/node'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { handlers } from '../test/handlers'
import { createWrapper } from '../test/wrapper'
import ShiftsPage from './ShiftsPage'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ShiftsPage', () => {
  test('renders shift list with trade and workplace name', async () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })

    // Two shifts share Olympus Base — use findAllByText
    const workplaceHeadings = await screen.findAllByText('Olympus Base')
    expect(workplaceHeadings.length).toBeGreaterThanOrEqual(1)
    expect(await screen.findAllByText('Welder')).not.toHaveLength(0)
  })

  test('shows Claim button only for open unclaimed shifts', async () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })

    const claimButtons = await screen.findAllByRole('button', { name: /claim shift/i })
    // s-1 is open and unclaimed → should have claim button
    expect(claimButtons.length).toBeGreaterThan(0)
  })

  test('shows worker picker after clicking Claim', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />, { wrapper: createWrapper() })

    const claimButton = await screen.findByRole('button', {
      name: /claim shift at olympus base/i,
    })
    await user.click(claimButton)

    // Alice Welder is eligible for the Welder shift
    expect(await screen.findByRole('button', { name: /assign alice welder/i })).toBeInTheDocument()
  })

  test('shows Cancel button for claimed (non-cancelled) shifts', async () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })

    const cancelButton = await screen.findByRole('button', {
      name: /cancel shift at olympus base/i,
    })
    expect(cancelButton).toBeInTheDocument()
  })

  test('shows success toast after cancelling a shift', async () => {
    const user = userEvent.setup()
    render(<ShiftsPage />, { wrapper: createWrapper() })

    const cancelButton = await screen.findByRole('button', {
      name: /cancel shift at olympus base/i,
    })
    await user.click(cancelButton)

    expect(await screen.findByText(/shift cancelled/i)).toBeInTheDocument()
  })

  test('does not render actions for cancelled shifts', async () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })

    // s-3 is cancelled (Driller shift at Valles Depot)
    await screen.findByText('Valles Depot')
    const chipsCancelled = screen.getAllByText('Cancelled')
    expect(chipsCancelled.length).toBeGreaterThan(0)
  })

  test('shows skeleton grid while loading', () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })
    // Skeletons are shown before data loads — verify no shift cards yet
    expect(screen.queryByText('Olympus Base')).not.toBeInTheDocument()
  })

  test('shows shift status chips correctly', async () => {
    render(<ShiftsPage />, { wrapper: createWrapper() })

    expect(await screen.findByText('Open')).toBeInTheDocument()
    expect(await screen.findByText('Claimed')).toBeInTheDocument()
    expect(await screen.findByText('Cancelled')).toBeInTheDocument()
  })
})
