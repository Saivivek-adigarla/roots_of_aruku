import { Check, Circle } from 'lucide-react';
export default function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = ['placed', 'confirmed', 'shipped', 'delivered'];
  const idx = steps.indexOf(currentStatus);
  return <div className="space-y-0">{steps.map((s, i) => <div key={s} className="flex gap-4"><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${i <= idx ? 'bg-maroon-700 border-maroon-700' : 'border-gray-300'}`}>{i <= idx ? <Check size={14} className="text-white" /> : <Circle size={14} className="text-gray-300" />}</div><div className="pb-6"><div className={`font-medium text-sm ${i <= idx ? 'text-maroon-700' : 'text-gray-400'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div></div></div>)}</div>;
}
