import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function AdminBarChart({ data, dataKey = 'value', nameKey = 'name' }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#E5DCCE" strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} tick={{ fill: '#78716C', fontSize: 10 }} axisLine={{ stroke: '#E5DCCE' }} interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} tick={{ fill: '#78716C', fontSize: 11 }} axisLine={{ stroke: '#E5DCCE' }} />
          <Tooltip
            contentStyle={{
              background: '#FFFDF8',
              border: '1px solid #E5DCCE',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey={dataKey} fill="#C4A574" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
