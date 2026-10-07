import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Prix from '../composants/ui/Prix'
import { Etoiles, EtoilesInteractives } from '../composants/ui/Etoiles'
import { Pagination, Quantite } from '../composants/ui/divers'

describe('composants d’interface', () => {
  it('affiche le prix barré et la remise', () => {
    render(<Prix prix={75000} prixBarre={100000} />)
    expect(screen.getByText('-25 %')).toBeInTheDocument()
    expect(screen.getByText(/au lieu de/)).toBeInTheDocument()
  })

  it('annonce la note aux lecteurs d’écran', () => {
    render(<Etoiles note={4.3} nombreAvis={12} />)
    expect(screen.getByRole('img', { name: 'Note : 4.3 sur 5' })).toBeInTheDocument()
    expect(screen.getByText('(12)')).toBeInTheDocument()
  })

  it('permet de choisir une note au clavier ou à la souris', async () => {
    const choisir = vi.fn()
    render(<EtoilesInteractives valeur={0} onChange={choisir} />)
    await userEvent.click(screen.getByRole('radio', { name: /4 étoiles/ }))
    expect(choisir).toHaveBeenCalledWith(4)
  })

  it('bloque la quantité entre le minimum et le stock', async () => {
    const changer = vi.fn()
    const { rerender } = render(<Quantite valeur={1} max={3} onChange={changer} />)
    expect(screen.getByRole('button', { name: 'Diminuer' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Augmenter' }))
    expect(changer).toHaveBeenCalledWith(2)
    rerender(<Quantite valeur={3} max={3} onChange={changer} />)
    expect(screen.getByRole('button', { name: 'Augmenter' })).toBeDisabled()
  })

  it('pagine avec la page courante signalée', async () => {
    const aller = vi.fn()
    render(<Pagination page={2} total={60} parPage={12} onChange={aller} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Page suivante' }))
    expect(aller).toHaveBeenCalledWith(3)
  })

  it('ne montre pas de pagination pour une seule page', () => {
    const { container } = render(<Pagination page={1} total={5} parPage={12} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
