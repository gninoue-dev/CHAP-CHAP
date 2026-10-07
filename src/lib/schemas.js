import { z } from 'zod'

// Numéro ivoirien : 10 chiffres commençant par 01, 05, 07, 21, 25 ou 27
export const telephoneCI = z.string().trim()
  .transform(v => v.replace(/[\s.-]/g, '').replace(/^(\+?225)/, ''))
  .pipe(z.string().regex(/^(01|05|07|21|25|27)\d{8}$/, 'Numéro invalide (ex. 07 00 00 00 00)'))

export const schemaConnexion = z.object({
  email: z.string().trim().email('Email invalide'),
  motDePasse: z.string().min(1, 'Saisis ton mot de passe')
})

export const schemaInscription = z.object({
  nomComplet: z.string().trim().min(2, 'Indique ton nom complet'),
  email: z.string().trim().email('Email invalide'),
  telephone: z.union([z.literal(''), telephoneCI]),
  motDePasse: z.string().min(8, '8 caractères minimum').regex(/\d/, 'Ajoute au moins un chiffre'),
  confirmation: z.string()
}).refine(v => v.motDePasse === v.confirmation, { message: 'Les mots de passe ne correspondent pas', path: ['confirmation'] })

export const schemaAdresse = z.object({
  nomComplet: z.string().trim().min(2, 'Indique ton nom'),
  telephone: telephoneCI,
  ville: z.string().trim().min(2, 'Indique ta ville'),
  quartier: z.string().trim().min(2, 'Indique ton quartier'),
  details: z.string().trim().min(5, 'Donne un point de repère'),
  paiement: z.enum(['orange', 'mtn', 'wave', 'moov', 'carte', 'especes'])
})

export const schemaProduit = z.object({
  nom: z.string().trim().min(2, 'Nom trop court').max(120),
  categorie_id: z.coerce.number().int().positive('Choisis une catégorie'),
  description: z.string().trim().min(10, 'Décris le produit (10 caractères minimum)'),
  prix: z.coerce.number().int('Prix entier en FCFA').positive('Le prix doit être positif'),
  prix_barre: z.union([z.literal(''), z.coerce.number().int().positive()]).optional(),
  stock: z.coerce.number().int().min(0, 'Stock invalide'),
  est_actif: z.boolean(),
  caracteristiques: z.array(z.object({ cle: z.string(), valeur: z.string() })).default([])
}).refine(v => !v.prix_barre || v.prix_barre > v.prix, { message: 'Le prix barré doit être supérieur au prix', path: ['prix_barre'] })

export const schemaBoutique = z.object({
  nom: z.string().trim().min(2, 'Nom trop court').max(60),
  description: z.string().trim().min(20, 'Présente ta boutique (20 caractères minimum)'),
  ville: z.string().trim().min(2, 'Indique ta ville'),
  couleur: z.string().regex(/^#[0-9a-fA-F]{6}$/)
})

export const schemaAvis = z.object({
  note: z.number().int().min(1, 'Choisis une note').max(5),
  commentaire: z.string().trim().max(1000)
})
