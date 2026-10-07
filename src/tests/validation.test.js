import { schemaAdresse, schemaInscription, schemaProduit, telephoneCI } from '../lib/schemas'
import { formaterPrix, fraisLivraison, pourcentageRemise } from '../lib/format'

describe('telephoneCI', () => {
  it.each(['0707070707', '07 07 07 07 07', '+225 01 02 03 04 05', '05.06.07.08.09'])('accepte %s', numero => {
    expect(telephoneCI.safeParse(numero).success).toBe(true)
  })
  it.each(['0807070707', '070707', 'abcdefghij'])('refuse %s', numero => {
    expect(telephoneCI.safeParse(numero).success).toBe(false)
  })
  it('normalise le numéro', () => {
    expect(telephoneCI.parse('+225 07 08 09 10 11')).toBe('0708091011')
  })
})

describe('schémas de formulaires', () => {
  it('vérifie que les deux mots de passe correspondent', () => {
    const resultat = schemaInscription.safeParse({ nomComplet: 'Awa Koné', email: 'awa@exemple.ci', telephone: '', motDePasse: 'garba2026', confirmation: 'garba2027' })
    expect(resultat.success).toBe(false)
    expect(resultat.error.issues[0].path).toEqual(['confirmation'])
  })

  it('exige un chiffre dans le mot de passe', () => {
    const resultat = schemaInscription.safeParse({ nomComplet: 'Awa', email: 'awa@exemple.ci', telephone: '', motDePasse: 'motdepasse', confirmation: 'motdepasse' })
    expect(resultat.success).toBe(false)
  })

  it('valide une adresse de livraison', () => {
    const adresse = { nomComplet: 'Yao Kouassi', telephone: '0102030405', ville: 'Abidjan', quartier: 'Cocody', details: 'Près du marché', paiement: 'wave' }
    expect(schemaAdresse.parse(adresse).paiement).toBe('wave')
  })

  it('refuse un prix barré inférieur au prix', () => {
    const produit = { nom: 'Ballon', categorie_id: '7', description: 'Ballon taille 5 cousu', prix: '12000', prix_barre: '10000', stock: '3', est_actif: true }
    const resultat = schemaProduit.safeParse(produit)
    expect(resultat.success).toBe(false)
    expect(resultat.error.issues[0].path).toEqual(['prix_barre'])
  })

  it('convertit les nombres saisis et garde les caractéristiques', () => {
    const produit = schemaProduit.parse({ nom: 'Ballon', categorie_id: '7', description: 'Ballon taille 5 cousu', prix: '12000', prix_barre: '', stock: '3', est_actif: true, caracteristiques: [{ cle: 'Taille', valeur: '5' }] })
    expect(produit).toMatchObject({ categorie_id: 7, prix: 12000, stock: 3, caracteristiques: [{ cle: 'Taille', valeur: '5' }] })
  })
})

describe('formatage', () => {
  it('formate les prix en FCFA', () => {
    expect(formaterPrix(1500000).replace(/\s/g, ' ')).toBe('1 500 000 FCFA')
  })
  it('calcule le pourcentage de remise', () => {
    expect(pourcentageRemise(75000, 100000)).toBe(25)
    expect(pourcentageRemise(100, null)).toBe(0)
  })
  it('offre la livraison dès 50 000 FCFA', () => {
    expect(fraisLivraison(49999)).toBe(1500)
    expect(fraisLivraison(50000)).toBe(0)
    expect(fraisLivraison(0)).toBe(0)
  })
})
