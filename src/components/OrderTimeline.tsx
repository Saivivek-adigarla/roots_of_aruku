import { Check, Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export default function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const steps: TimelineStep[] = [
    { id: 'placed', label: 'Order Placed', description: 'Order received and confirmed', icon: <Package size={18} /> },
    { id: 'confirmed', label: 'Order Confirmed', description: 'Seller accepted your order', icon: <Check size={18} /> },
    { id: 'processing', label: 'Processing', description: 'Preparing your items', icon: <Clock size={18} /> },
    { id: 'packed', label: 'Packed', description: 'Items packed and ready', icon: <Package size={18} /> },
    { id: 'shipped', label: 'Shipped', description: 'On the way to you', icon: <Truck size={18} /> },
    { id: 'out-for-delivery', label: 'Out for Delivery', description: 'With delivery partner', icon: <MapPin size={18} /> },
    { id: 'delivered', label: 'Delivered', description: 'Successfully delivered', icon: <CheckCircle size={18} /> },
  ];

  const currentIdx = steps.findIndex((s) => s.id === currentStatus);
  const isCompleted = (idx: number) => idx <= currentIdx;

  return (
    <div className="py-4">
      {steps.map((step, idx) => (
        <div key={step.id} className="relative pb-6">
          {/* Timeline line */}
          {idx < steps.length - 1 && (
            <div className={`absolute left-4 top-12 w-0.5 h-12 ${isCompleted(idx + 1) ? 'bg-maroon-700' : 'bg-gray-200'}`} />
          )}

          {/* Timeline dot and content */}
          <div className="flex gap-6 items-start">
            <div
              className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isCompleted(idx)
                  ? 'bg-maroon-700 text-white shadow-lg shadow-maroon-700/30'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}
            >
              {isCompleted(idx) ? (
                <Check size={18} />
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
              )}
            </div>

            {/* Content */}
            <div className="pt-1 flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <h4
                  className={`font-semibold text-sm transition-colors ${
                    isCompleted(idx) ? 'text-maroon-700' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </h4>
                {isCompleted(idx) && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Completed
                  </span>
                )}
                {idx === currentIdx && !isCompleted(idx + 1) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
              <p className={`text-xs ${isCompleted(idx) ? 'text-gray-600' : 'text-gray-400'}`}>
                {step.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
