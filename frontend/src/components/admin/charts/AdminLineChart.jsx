import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function AdminLineChart({ data, dataKey = 'registered', nameKey = 'month', height = 256 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#E5DCCE" strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} tick={{ fill: '#78716C', fontSize: 11 }} axisLine={{ stroke: '#E5DCCE' }} />
          <YAxis allowDecimals={false} tick={{ fill: '#78716C', fontSize: 11 }} axisLine={{ stroke: '#E5DCCE' }} />
          <Tooltip
            contentStyle={{
              background: '#FFFDF8',
              border: '1px solid #E5DCCE',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#C4A574"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2C241B' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
