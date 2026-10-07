-- ============================================================
-- CHAP CHAP — Schéma de la base (Supabase / PostgreSQL)
-- Marketplace multi-vendeurs : clients, vendeurs, administrateurs.
-- Toute la sécurité passe par les règles RLS (Row Level Security) :
-- le site React ne reçoit jamais plus de droits que l'utilisateur connecté.
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- ---------- Profils (un par compte Supabase Auth) ----------
create table public.profils (
  id uuid primary key references auth.users on delete cascade,
  nom_complet text not null default '',
  telephone text not null default '',
  role text not null default 'client' check (role in ('client', 'vendeur', 'admin')),
  avatar_url text,
  cree_le timestamptz not null default now()
);

-- ---------- Boutiques (une par vendeur) ----------
create table public.boutiques (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null unique references public.profils on delete cascade,
  nom text not null check (char_length(nom) between 2 and 60),
  slug text not null unique,
  description text not null default '',
  ville text not null default 'Abidjan',
  logo_url text,
  couleur text not null default '#FF6B00',
  statut text not null default 'en_attente' check (statut in ('en_attente', 'active', 'suspendue')),
  est_verifiee boolean not null default false,
  cree_le timestamptz not null default now()
);

-- ---------- Catégories ----------
create table public.categories (
  id serial primary key,
  nom text not null,
  slug text not null unique,
  icone text not null default 'box',
  couleur text not null default '#FF6B00',
  ordre int not null default 0
);

-- ---------- Produits ----------
create table public.produits (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references public.boutiques on delete cascade,
  categorie_id int not null references public.categories,
  nom text not null check (char_length(nom) between 2 and 120),
  slug text not null unique,
  description text not null default '',
  prix int not null check (prix > 0),                 -- en FCFA
  prix_barre int check (prix_barre is null or prix_barre > prix),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  caracteristiques jsonb not null default '{}',
  est_actif boolean not null default true,
  note_moyenne numeric(2, 1) not null default 0,
  nombre_avis int not null default 0,
  ventes int not null default 0,
  cree_le timestamptz not null default now(),
  recherche tsvector generated always as (
    setweight(to_tsvector('french', coalesce(nom, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B')
  ) stored
);
create index produits_recherche_idx on public.produits using gin (recherche);
create index produits_categorie_idx on public.produits (categorie_id);
create index produits_boutique_idx on public.produits (boutique_id);

-- ---------- Avis ----------
create table public.avis (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references public.produits on delete cascade,
  auteur_id uuid not null references public.profils on delete cascade,
  note int not null check (note between 1 and 5),
  commentaire text not null default '' check (char_length(commentaire) <= 1000),
  achat_verifie boolean not null default false,
  cree_le timestamptz not null default now(),
  unique (produit_id, auteur_id)
);

-- ---------- Favoris ----------
create table public.favoris (
  utilisateur_id uuid not null references public.profils on delete cascade,
  produit_id uuid not null references public.produits on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (utilisateur_id, produit_id)
);

-- ---------- Commandes ----------
create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  client_id uuid not null references public.profils on delete cascade,
  statut text not null default 'payee' check (statut in ('payee', 'en_preparation', 'expediee', 'livree', 'annulee')),
  sous_total int not null,
  frais_livraison int not null default 0,
  total int not null,
  adresse jsonb not null,
  paiement text not null check (paiement in ('orange', 'mtn', 'wave', 'moov', 'especes', 'carte')),
  cree_le timestamptz not null default now()
);

-- Une ligne par produit ; chaque vendeur gère le statut de ses lignes
create table public.lignes_commande (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes on delete cascade,
  produit_id uuid references public.produits on delete set null,
  boutique_id uuid not null references public.boutiques on delete cascade,
  nom_produit text not null,
  image text,
  prix_unitaire int not null,
  quantite int not null check (quantite between 1 and 50),
  statut text not null default 'en_preparation' check (statut in ('en_preparation', 'expediee', 'livree', 'annulee'))
);
create index lignes_commande_boutique_idx on public.lignes_commande (boutique_id);
create index lignes_commande_commande_idx on public.lignes_commande (commande_id);

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================
create or replace function public.est_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profils where id = auth.uid() and role = 'admin');
$$;

create or replace function public.ma_boutique() returns uuid
language sql stable security definer set search_path = public as $$
  select id from boutiques where proprietaire_id = auth.uid() and statut = 'active';
$$;

create or replace function public.slugifier(texte text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(unaccent(texte)), '[^a-z0-9]+', '-', 'g'));
$$;

-- Fonctions d'appartenance utilisées par les règles RLS (security definer :
-- évite que les règles de commandes et de lignes_commande se rappellent en boucle)
create or replace function public.est_ma_commande(p_commande uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from commandes where id = p_commande and client_id = auth.uid());
$$;

create or replace function public.commande_concerne_ma_boutique(p_commande uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from lignes_commande where commande_id = p_commande and boutique_id = ma_boutique());
$$;

-- Profil créé automatiquement à l'inscription
create or replace function public.creer_profil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profils (id, nom_complet, telephone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nom_complet', ''), coalesce(new.raw_user_meta_data ->> 'telephone', ''));
  return new;
end;
$$;
create trigger apres_inscription after insert on auth.users
  for each row execute function public.creer_profil();

-- Un utilisateur ne peut pas changer lui-même son rôle
create or replace function public.proteger_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role and not est_admin() and current_user = 'authenticated' then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end;
$$;
create trigger proteger_role before update on public.profils
  for each row execute function public.proteger_role();

-- Boutique : statut et badge vérifié réservés à l'admin ; validation => rôle vendeur
create or replace function public.gerer_boutique() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if current_user = 'authenticated' and not est_admin() then
      new.statut := 'en_attente';
      new.est_verifiee := false;
    end if;
    new.slug := slugifier(new.nom) || '-' || substr(gen_random_uuid()::text, 1, 4);
  elsif current_user = 'authenticated' and not est_admin()
        and (new.statut <> old.statut or new.est_verifiee <> old.est_verifiee) then
    raise exception 'Seul un administrateur peut changer le statut de la boutique';
  end if;
  return new;
end;
$$;
create trigger gerer_boutique before insert or update on public.boutiques
  for each row execute function public.gerer_boutique();

create or replace function public.synchroniser_role_vendeur() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profils set role = case when new.statut = 'active' then 'vendeur' else 'client' end
  where id = new.proprietaire_id and role <> 'admin';
  return new;
end;
$$;
create trigger synchroniser_role_vendeur after insert or update of statut on public.boutiques
  for each row execute function public.synchroniser_role_vendeur();

-- Slug unique des produits
create or replace function public.slug_produit() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.nom <> old.nom then
    new.slug := slugifier(new.nom) || '-' || substr(gen_random_uuid()::text, 1, 6);
  end if;
  return new;
end;
$$;
create trigger slug_produit before insert or update on public.produits
  for each row execute function public.slug_produit();

-- Avis : achat vérifié + note moyenne du produit
create or replace function public.preparer_avis() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.achat_verifie := exists (
    select 1 from lignes_commande l join commandes c on c.id = l.commande_id
    where l.produit_id = new.produit_id and c.client_id = new.auteur_id and c.statut <> 'annulee'
  );
  return new;
end;
$$;
create trigger preparer_avis before insert or update on public.avis
  for each row execute function public.preparer_avis();

create or replace function public.recalculer_note() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cible uuid := coalesce(new.produit_id, old.produit_id);
begin
  update produits set
    note_moyenne = coalesce((select round(avg(note)::numeric, 1) from avis where produit_id = cible), 0),
    nombre_avis = (select count(*) from avis where produit_id = cible)
  where id = cible;
  return null;
end;
$$;
create trigger recalculer_note after insert or update or delete on public.avis
  for each row execute function public.recalculer_note();

-- ============================================================
-- PASSER UNE COMMANDE (transaction côté serveur)
-- Les prix viennent de la base, jamais du navigateur ; le stock est vérifié
-- et décrémenté dans la même transaction.
-- lignes : [{ "produit_id": "...", "quantite": 2 }, ...]
-- ============================================================
create or replace function public.passer_commande(lignes jsonb, adresse jsonb, paiement text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  ligne jsonb;
  produit record;
  v_commande uuid;
  v_numero text;
  v_sous_total int := 0;
  v_frais int;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if jsonb_array_length(lignes) = 0 then raise exception 'Panier vide'; end if;

  -- vérification des stocks (verrouillage des lignes produits)
  for ligne in select * from jsonb_array_elements(lignes) loop
    select p.* into produit from produits p join boutiques b on b.id = p.boutique_id
      where p.id = (ligne ->> 'produit_id')::uuid and p.est_actif and b.statut = 'active'
      for update of p;
    if not found then raise exception 'Produit indisponible'; end if;
    if produit.stock < (ligne ->> 'quantite')::int then
      raise exception 'Stock insuffisant pour %', produit.nom;
    end if;
    v_sous_total := v_sous_total + produit.prix * (ligne ->> 'quantite')::int;
  end loop;

  v_frais := case when v_sous_total >= 50000 then 0 else 1500 end;
  v_numero := 'CC-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 5));

  insert into commandes (numero, client_id, sous_total, frais_livraison, total, adresse, paiement)
  values (v_numero, auth.uid(), v_sous_total, v_frais, v_sous_total + v_frais, adresse, paiement)
  returning id into v_commande;

  for ligne in select * from jsonb_array_elements(lignes) loop
    select * into produit from produits where id = (ligne ->> 'produit_id')::uuid;
    insert into lignes_commande (commande_id, produit_id, boutique_id, nom_produit, image, prix_unitaire, quantite)
    values (v_commande, produit.id, produit.boutique_id, produit.nom, produit.images[1], produit.prix, (ligne ->> 'quantite')::int);
    update produits set stock = stock - (ligne ->> 'quantite')::int, ventes = ventes + (ligne ->> 'quantite')::int
      where id = produit.id;
  end loop;

  return v_numero;
end;
$$;

-- Statut global de la commande déduit des lignes (chaque vendeur avance les siennes)
create or replace function public.synchroniser_statut_commande() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_total int; v_livrees int; v_expediees int; v_annulees int;
begin
  select count(*), count(*) filter (where statut = 'livree'), count(*) filter (where statut in ('expediee', 'livree')),
         count(*) filter (where statut = 'annulee')
    into v_total, v_livrees, v_expediees, v_annulees
    from lignes_commande where commande_id = new.commande_id;
  update commandes set statut = case
      when v_annulees = v_total then 'annulee'
      when v_livrees + v_annulees = v_total then 'livree'
      when v_expediees + v_annulees = v_total then 'expediee'
      else 'en_preparation' end
    where id = new.commande_id and statut <> 'annulee';
  return null;
end;
$$;
create trigger synchroniser_statut_commande after update of statut on public.lignes_commande
  for each row execute function public.synchroniser_statut_commande();

-- Un vendeur ne peut modifier que le statut de ses lignes
create or replace function public.proteger_ligne() returns trigger
language plpgsql as $$
begin
  if current_user = 'authenticated' and not est_admin() and (
    new.prix_unitaire <> old.prix_unitaire or new.quantite <> old.quantite or
    new.produit_id is distinct from old.produit_id or new.boutique_id <> old.boutique_id or new.commande_id <> old.commande_id) then
    raise exception 'Seul le statut de la ligne peut être modifié';
  end if;
  return new;
end;
$$;
create trigger proteger_ligne before update on public.lignes_commande
  for each row execute function public.proteger_ligne();

-- ============================================================
-- STATISTIQUES
-- ============================================================
create or replace function public.statistiques_admin() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not est_admin() then raise exception 'Accès réservé aux administrateurs'; end if;
  return jsonb_build_object(
    'chiffre_affaires', (select coalesce(sum(total), 0) from commandes where statut <> 'annulee'),
    'commandes', (select count(*) from commandes),
    'clients', (select count(*) from profils where role = 'client'),
    'vendeurs', (select count(*) from boutiques where statut = 'active'),
    'boutiques_en_attente', (select count(*) from boutiques where statut = 'en_attente'),
    'produits', (select count(*) from produits),
    'ventes_par_jour', (
      select coalesce(jsonb_agg(jsonb_build_object('jour', jour, 'total', total, 'commandes', nb) order by jour), '[]')
      from (
        select d::date as jour, coalesce(sum(c.total), 0) as total, count(c.id) as nb
        from generate_series(current_date - 29, current_date, interval '1 day') d
        left join commandes c on c.cree_le::date = d::date and c.statut <> 'annulee'
        group by d
      ) s),
    'par_categorie', (
      select coalesce(jsonb_agg(jsonb_build_object('categorie', nom, 'total', total) order by total desc), '[]')
      from (
        select cat.nom, sum(l.prix_unitaire * l.quantite) as total
        from lignes_commande l join produits p on p.id = l.produit_id join categories cat on cat.id = p.categorie_id
        where l.statut <> 'annulee' group by cat.nom
      ) s)
  );
end;
$$;

create or replace function public.statistiques_vendeur() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_boutique uuid := ma_boutique();
begin
  if v_boutique is null then raise exception 'Aucune boutique active'; end if;
  return jsonb_build_object(
    'chiffre_affaires', (select coalesce(sum(prix_unitaire * quantite), 0) from lignes_commande where boutique_id = v_boutique and statut <> 'annulee'),
    'articles_vendus', (select coalesce(sum(quantite), 0) from lignes_commande where boutique_id = v_boutique and statut <> 'annulee'),
    'a_expedier', (select count(*) from lignes_commande where boutique_id = v_boutique and statut = 'en_preparation'),
    'produits', (select count(*) from produits where boutique_id = v_boutique),
    'stock_faible', (select count(*) from produits where boutique_id = v_boutique and stock < 5),
    'note_moyenne', (select coalesce(round(avg(note_moyenne) filter (where nombre_avis > 0), 1), 0) from produits where boutique_id = v_boutique),
    'ventes_par_jour', (
      select coalesce(jsonb_agg(jsonb_build_object('jour', jour, 'total', total) order by jour), '[]')
      from (
        select d::date as jour, coalesce(sum(l.prix_unitaire * l.quantite), 0) as total
        from generate_series(current_date - 29, current_date, interval '1 day') d
        left join commandes c on c.cree_le::date = d::date
        left join lignes_commande l on l.commande_id = c.id and l.boutique_id = v_boutique and l.statut <> 'annulee'
        group by d
      ) s),
    'meilleurs_produits', (
      select coalesce(jsonb_agg(jsonb_build_object('nom', nom, 'ventes', ventes) order by ventes desc), '[]')
      from (select nom, ventes from produits where boutique_id = v_boutique order by ventes desc limit 5) s)
  );
end;
$$;

-- ============================================================
-- RÈGLES D'ACCÈS (RLS)
-- ============================================================
alter table public.profils enable row level security;
alter table public.boutiques enable row level security;
alter table public.categories enable row level security;
alter table public.produits enable row level security;
alter table public.avis enable row level security;
alter table public.favoris enable row level security;
alter table public.commandes enable row level security;
alter table public.lignes_commande enable row level security;

-- profils : chacun voit et modifie le sien ; l'admin voit tout ; nom public pour les avis
create policy "profil lisible par son proprietaire" on public.profils for select using (id = auth.uid() or est_admin());
create policy "profil modifiable par son proprietaire" on public.profils for update using (id = auth.uid() or est_admin());

-- Vue publique : seulement le nom (pour afficher l'auteur d'un avis)
create view public.auteurs as select id, nom_complet from public.profils;
grant select on public.auteurs to anon, authenticated;

-- boutiques
create policy "boutiques actives publiques" on public.boutiques for select
  using (statut = 'active' or proprietaire_id = auth.uid() or est_admin());
create policy "creer sa boutique" on public.boutiques for insert with check (proprietaire_id = auth.uid());
create policy "modifier sa boutique" on public.boutiques for update using (proprietaire_id = auth.uid() or est_admin());

-- catégories
create policy "categories publiques" on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (est_admin()) with check (est_admin());

-- produits
create policy "produits visibles" on public.produits for select using (
  (est_actif and exists (select 1 from boutiques b where b.id = boutique_id and b.statut = 'active'))
  or boutique_id = ma_boutique() or est_admin());
create policy "vendeur ajoute" on public.produits for insert with check (boutique_id = ma_boutique());
create policy "vendeur modifie" on public.produits for update using (boutique_id = ma_boutique() or est_admin());
create policy "vendeur supprime" on public.produits for delete using (boutique_id = ma_boutique() or est_admin());

-- avis
create policy "avis publics" on public.avis for select using (true);
create policy "ecrire son avis" on public.avis for insert with check (auteur_id = auth.uid());
create policy "modifier son avis" on public.avis for update using (auteur_id = auth.uid());
create policy "supprimer son avis" on public.avis for delete using (auteur_id = auth.uid() or est_admin());

-- favoris
create policy "mes favoris" on public.favoris for all using (utilisateur_id = auth.uid()) with check (utilisateur_id = auth.uid());

-- commandes : créées uniquement par passer_commande()
create policy "voir ses commandes" on public.commandes for select using (
  client_id = auth.uid() or est_admin() or commande_concerne_ma_boutique(id));
create policy "admin modifie commandes" on public.commandes for update using (est_admin());

-- lignes de commande
create policy "voir lignes" on public.lignes_commande for select using (
  boutique_id = ma_boutique() or est_admin() or est_ma_commande(commande_id));
create policy "vendeur avance ses lignes" on public.lignes_commande for update using (boutique_id = ma_boutique() or est_admin());

-- ============================================================
-- STOCKAGE DES IMAGES (bucket public "produits")
-- Chaque vendeur écrit dans un dossier à son identifiant.
-- ============================================================
insert into storage.buckets (id, name, public) values ('produits', 'produits', true)
  on conflict (id) do nothing;
create policy "images publiques" on storage.objects for select using (bucket_id = 'produits');
create policy "vendeur envoie ses images" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vendeur supprime ses images" on storage.objects for delete to authenticated
  using (bucket_id = 'produits' and (storage.foldername(name))[1] = auth.uid()::text);

grant execute on function public.passer_commande(jsonb, jsonb, text) to authenticated;
grant execute on function public.statistiques_admin() to authenticated;
grant execute on function public.statistiques_vendeur() to authenticated;
