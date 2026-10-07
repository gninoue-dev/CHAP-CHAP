# Génère supabase/seed.sql (données de démonstration) à partir de catalogue.py
import json, random, uuid
from datetime import datetime, timedelta, timezone
from catalogue import CATEGORIES, BOUTIQUES, PRODUITS

random.seed(2026)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
MDP = 'ChapChap2026!'
def uid(nom): return str(uuid.uuid5(uuid.NAMESPACE_URL, 'chapchap/' + nom))

lignes = ["-- Données de démonstration CHAP CHAP (générées par un script, ne pas modifier à la main)",
          "-- Mot de passe de tous les comptes : " + MDP, "begin;", ""]

utilisateurs = [('admin', 'admin@chapchap.ci', 'Admin CHAP CHAP', '0700000000')]
utilisateurs += [('vendeur-techno', 'vendeur@chapchap.ci', 'Kader Ouattara', '0701020304')]
for cle, nom, *_ in BOUTIQUES[1:]:
    utilisateurs.append((f'vendeur-{cle}', f'vendeur.{cle}@chapchap.ci', f'Gérant {nom}', '0505050505'))
clients = [('client', 'client@chapchap.ci', 'Awa Koné', '0707070707'), ('c1', 'yao@exemple.ci', 'Yao Kouassi', '0102030405'),
           ('c2', 'aminata@exemple.ci', 'Aminata Traoré', '0506070809'), ('c3', 'konan@exemple.ci', 'Konan Brou', '0708091011'),
           ('c4', 'fatou@exemple.ci', 'Fatou Bamba', '0121314151'), ('c5', 'serge@exemple.ci', 'Serge Kouadio', '0561718192')]
utilisateurs += clients

lignes.append("-- Comptes (auth.users + identités) ; le profil est créé par le déclencheur apres_inscription")
for cle, email, nom, tel in utilisateurs:
    i = uid(cle)
    meta = json.dumps({'nom_complet': nom, 'telephone': tel}, ensure_ascii=False)
    lignes.append(f"""insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', '{i}', 'authenticated', 'authenticated', {q(email)}, crypt({q(MDP)}, gen_salt('bf')), now(), '{{"provider":"email","providers":["email"]}}', {q(meta)}, now() - interval '60 days', now(), '', '', '', '');""")
    lignes.append(f"""insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('{uuid.uuid4()}', '{i}', '{i}', {q(json.dumps({'sub': i, 'email': email, 'email_verified': True}))}, 'email', now(), now(), now());""")
lignes.append(f"update public.profils set role = 'admin' where id = '{uid('admin')}';")
lignes.append(f"update public.profils set cree_le = now() - (random() * interval '60 days');\n")

lignes.append("-- Catégories")
for ordre, (slug, nom, icone, couleur) in enumerate(CATEGORIES):
    lignes.append(f"insert into public.categories (id, nom, slug, icone, couleur, ordre) values ({ordre + 1}, {q(nom)}, {q(slug)}, {q(icone)}, {q(couleur)}, {ordre});")
lignes.append(f"select setval('categories_id_seq', {len(CATEGORIES)});\n")

lignes.append("-- Boutiques (actives et vérifiées)")
id_boutique = {}
for j, (cle, nom, desc, ville, couleur) in enumerate(BOUTIQUES):
    b = uid('boutique-' + cle); id_boutique[cle] = b
    proprio = uid('vendeur-techno' if cle == 'techno' else f'vendeur-{cle}')
    lignes.append(f"insert into public.boutiques (id, proprietaire_id, nom, slug, description, ville, couleur, statut, est_verifiee, cree_le) values ('{b}', '{proprio}', {q(nom)}, 'x', {q(desc)}, {q(ville)}, {q(couleur)}, 'active', {'true' if j != 3 else 'false'}, now() - interval '{50 - j * 5} days');")
lignes.append("")

lignes.append("-- Produits")
id_cat = {slug: i + 1 for i, (slug, *_ ) in enumerate(CATEGORIES)}
produits = []
for k, (boutique, cat, cle, _req, nom, prix, barre, stock, desc, carac) in enumerate(PRODUITS):
    p = uid('produit-' + cle)
    produits.append({'id': p, 'nom': nom, 'prix': prix, 'boutique': id_boutique[boutique], 'image': f'produits/{cle}.jpg', 'stock': stock})
    lignes.append(f"insert into public.produits (id, boutique_id, categorie_id, nom, slug, description, prix, prix_barre, stock, images, caracteristiques, cree_le) values ('{p}', '{id_boutique[boutique]}', {id_cat[cat]}, {q(nom)}, 'x', {q(desc)}, {prix}, {barre if barre else 'null'}, {stock}, array[{q('produits/' + cle + '.jpg')}], {q(json.dumps(carac, ensure_ascii=False))}, now() - interval '{random.randint(1, 45)} days');")
lignes.append("")

lignes.append("-- Commandes des 30 derniers jours (pour les tableaux de bord)")
quartiers = ['Cocody Riviera 2', 'Yopougon Selmer', 'Marcory Zone 4', 'Plateau', 'Koumassi', 'Treichville', 'Abobo Gare', 'Bingerville']
paiements = ['orange', 'mtn', 'wave', 'moov', 'carte', 'especes']
maintenant = datetime.now(timezone.utc)
ventes = {}
for n in range(70):
    client_cle, _, nom, tel = random.choice(clients)
    jours = random.choices(range(30), weights=[30 - d for d in range(30)])[0]
    date = maintenant - timedelta(days=jours, hours=random.randint(0, 12), minutes=random.randint(0, 59))
    choisis = random.sample(produits, random.randint(1, 3))
    lignes_cmd = [(p, random.randint(1, 2)) for p in choisis]
    sous_total = sum(p['prix'] * qte for p, qte in lignes_cmd)
    frais = 0 if sous_total >= 50000 else 1500
    statut_ligne = 'livree' if jours > 5 else random.choice(['en_preparation', 'expediee', 'livree'])
    if random.random() < 0.05: statut_ligne = 'annulee'
    statut = {'livree': 'livree', 'expediee': 'expediee', 'en_preparation': 'en_preparation', 'annulee': 'annulee'}[statut_ligne]
    c = str(uuid.uuid4())
    numero = f"CC-{date.strftime('%y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
    adresse = json.dumps({'nomComplet': nom, 'telephone': tel, 'ville': 'Abidjan', 'quartier': random.choice(quartiers), 'details': 'Près de la pharmacie'}, ensure_ascii=False)
    lignes.append(f"insert into public.commandes (id, numero, client_id, statut, sous_total, frais_livraison, total, adresse, paiement, cree_le) values ('{c}', '{numero}', '{uid(client_cle)}', '{statut}', {sous_total}, {frais}, {sous_total + frais}, {q(adresse)}, '{random.choice(paiements)}', '{date.isoformat()}');")
    for p, qte in lignes_cmd:
        lignes.append(f"insert into public.lignes_commande (commande_id, produit_id, boutique_id, nom_produit, image, prix_unitaire, quantite, statut) values ('{c}', '{p['id']}', '{p['boutique']}', {q(p['nom'])}, {q(p['image'])}, {p['prix']}, {qte}, '{statut_ligne}');")
        if statut_ligne != 'annulee':
            ventes[p['id']] = ventes.get(p['id'], 0) + qte
for pid, nb in ventes.items():
    lignes.append(f"update public.produits set ventes = {nb} where id = '{pid}';")
lignes.append("")

lignes.append("-- Avis clients")
commentaires = {5: ['Excellent produit, livré en moins de 24 h. Je recommande !', 'Top qualité, conforme à la photo.', 'Très satisfait, le vendeur est sérieux.', 'Rien à dire, parfait !'],
                4: ['Bon produit, livraison rapide.', 'Bonne qualité pour le prix.', 'Satisfait dans l\'ensemble.'],
                3: ['Correct, sans plus.', 'Livraison un peu lente mais produit conforme.'],
                2: ['Qualité moyenne, je m\'attendais à mieux.']}
for p in random.sample(produits, 40):
    for client_cle, *_ in random.sample(clients, random.randint(1, 4)):
        note = random.choices([5, 4, 3, 2], weights=[50, 32, 13, 5])[0]
        lignes.append(f"insert into public.avis (produit_id, auteur_id, note, commentaire, cree_le) values ('{p['id']}', '{uid(client_cle)}', {note}, {q(random.choice(commentaires[note]))}, now() - interval '{random.randint(0, 25)} days');")

lignes.append("\ncommit;")
open('/home/gninoue/GNINOUE/CODE/PROJET/CHAP_CHAP/supabase/seed.sql', 'w').write('\n'.join(lignes) + '\n')
print(len(lignes), 'lignes SQL')
