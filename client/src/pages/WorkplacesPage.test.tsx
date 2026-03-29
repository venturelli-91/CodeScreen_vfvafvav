import { setupServer } from 'msw/node'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { handlers } from '../test/handlers'
import { createWrapper } from '../test/wrapper'
import WorkplacesPage from './WorkplacesPage'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('WorkplacesPage', () => {
  test('renders list of workplaces with name and address', async () => {
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    expect(await screen.findByText('Olympus Base')).toBeInTheDocument()
    expect(await screen.findByText('1 Olympus Mons, Mars')).toBeInTheDocument()
    expect(await screen.findByText('Valles Depot')).toBeInTheDocument()
  })

  test('each workplace has a Post shift button', async () => {
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    const postButtons = await screen.findAllByRole('button', { name: /post shift at/i })
    expect(postButtons).toHaveLength(2)
  })

  test('opens Add workplace dialog', async () => {
    const user = userEvent.setup()
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add workplace/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
  })

  test('Add button is disabled when fields are empty', async () => {
    const user = userEvent.setup()
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add workplace/i }))

    const addBtn = await screen.findByRole('button', { name: /^add$/i })
    expect(addBtn).toBeDisabled()
  })

  test('submits add workplace form and shows success toast', async () => {
    const user = userEvent.setup()
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /add workplace/i }))
    await user.type(await screen.findByLabelText(/name/i), 'Hellas Base')
    await user.type(screen.getByLabelText(/address/i), '3 Hellas Planitia, Mars')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    expect(await screen.findByText(/workplace added successfully/i)).toBeInTheDocument()
  })

  test('opens Post shift dialog with correct workplace in title', async () => {
    const user = userEvent.setup()
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    const postBtn = await screen.findByRole('button', { name: /post shift at olympus base/i })
    await user.click(postBtn)

    expect(await screen.findByText(/post a shift at olympus base/i)).toBeInTheDocument()
  })

  test('Post button is disabled when shift fields are empty', async () => {
    const user = userEvent.setup()
    render(<WorkplacesPage />, { wrapper: createWrapper() })

    const postBtn = await screen.findByRole('button', { name: /post shift at olympus base/i })
    await user.click(postBtn)

    const submitBtn = await screen.findByRole('button', { name: /^post$/i })
    expect(submitBtn).toBeDisabled()
  })
})
