interface MiniBarChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function MiniBarChart({ data }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const days = ["一", "二", "三", "四", "五", "六", "日"];

  // Pad data to 7 days if needed
  const paddedData = [...data];
  while (paddedData.length < 7) {
    paddedData.unshift({ date: "", count: 0 });
  }

  return (
    <div className="flex items-end gap-1 h-24">
      {paddedData.slice(-7).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[#FF9500] rounded-t"
            style={{
              height: `${(d.count / max) * 100}%`,
              minHeight: d.count > 0 ? 4 : 0,
            }}
          />
          <span className="text-[10px] text-zinc-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}
