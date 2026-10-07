// Graphiques des tableaux de bord (Recharts, chargé seulement dans ces pages)
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formaterDateCourte, formaterPrix } from '../lib/format'

const COULEURS = ['#FF6B00', '#2563EB', '#16A34A', '#DB2777', '#7C3AED', '#EA580C', '#0F766E', '#B45309']
const montantCourt = v => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)} M` : v >= 1000 ? `${Math.round(v / 1000)} k` : v)
const styleInfobulle = { background: 'var(--surface)', border: '1px solid var(--bordure)', borderRadius: 12, color: 'var(--texte)' }

export function CourbeVentes({ donnees }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={donnees} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="degradeVentes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--bordure)" vertical={false} />
        <XAxis dataKey="jour" tickFormatter={formaterDateCourte} tick={{ fill: 'var(--texte-doux)', fontSize: 12 }} interval="preserveStartEnd" minTickGap={24} />
        <YAxis tickFormatter={montantCourt} tick={{ fill: 'var(--texte-doux)', fontSize: 12 }} width={48} />
        <Tooltip contentStyle={styleInfobulle} formatter={v => [formaterPrix(v), 'Ventes']} labelFormatter={formaterDateCourte} />
        <Area type="monotone" dataKey="total" stroke="#FF6B00" strokeWidth={2.5} fill="url(#degradeVentes)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function Barres({ donnees, cle, valeur, format = v => v }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={donnees} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey={cle} width={150} tick={{ fill: 'var(--texte-doux)', fontSize: 12 }} />
        <Tooltip contentStyle={styleInfobulle} formatter={v => [format(v), '']} />
        <Bar dataKey={valeur} radius={[0, 8, 8, 0]}>
          {donnees.map((_, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Camembert({ donnees, cle, valeur }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={donnees} dataKey={valeur} nameKey={cle} innerRadius={60} outerRadius={100} paddingAngle={3}>
          {donnees.map((_, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
        </Pie>
        <Tooltip contentStyle={styleInfobulle} formatter={v => formaterPrix(v)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
