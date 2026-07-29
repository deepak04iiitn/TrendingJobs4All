import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#2C241B', '#C4A574', '#6B5A48', '#E5DCCE', '#57534E'];

export default function AdminDonutChart({ data }) {
  const filtered = (data || []).filter((d) => d.value > 0);

  if (!filtered.length) {
    return <p className="flex h-64 items-center justify-center text-sm text-[#78716C]">No content yet</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#FFFDF8',
              border: '1px solid #E5DCCE',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#6B5A48' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
