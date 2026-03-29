import { setupServer } from 'msw/node'
import { render, screen, within, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { handlers } from '../test/handlers'
import { createWrapper } from '../test/wrapper'
import WorkersPage from './WorkersPage'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('WorkersPage', () => {
  test('renders list of workers with name and trade', async () => {
    render(<WorkersPage />, { wrapper: createWrapper() })

    expect(await screen.findByText('Alice Welder')).toBeInTheDocument()
    expect(await screen.findByText('Bob Driller')).toBeInTheDocument()
  })

  test('renders worker trade chips', async () => {
    render(<WorkersPage />, { wrapper: createWrapper() })

    expect(await screen.findByText('Welder')).toBeInTheDocument()
    expect(await screen.findByText('Driller')).toBeInTheDocument()
  })

  test('opens add worker dialog when clicking Add worker', async () => {
    const user = userEvent.setup()
    render(<WorkersPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add worker/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/trade/i)).toBeInTheDocument()
  })

  test('Add button is disabled when fields are empty', async () => {
    const user = userEvent.setup()
    render(<WorkersPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add worker/i }))

    const addBtn = await screen.findByRole('button', { name: /^add$/i })
    expect(addBtn).toBeDisabled()
  })

  test('submits form and shows success toast', async () => {
    const user = userEvent.setup()
    render(<WorkersPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add worker/i }))
    await user.type(await screen.findByLabelText(/name/i), 'Carol Driller')
    await user.type(screen.getByLabelText(/trade/i), 'Driller')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    expect(await screen.findByText(/worker added successfully/i)).toBeInTheDocument()
  })

  test('closes dialog on Cancel click', async () => {
    const user = userEvent.setup()
    render(<WorkersPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add worker/i }))
    const dialog = await screen.findByRole('dialog')
    const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i })
    await user.click(cancelBtn)

    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
