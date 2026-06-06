import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, deleteDoc, addDoc, doc, query, orderBy } from 'firebase/firestore';

interface InventoryAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock';
  message: string;
  is_read: boolean;
  created_at: string;
  product_name?: string;
}

interface ProductStock {
  id: string;
  name: string;
  stock_quantity: number;
  status: string;
  emoji: string;
}

const LOW_STOCK_THRESHOLD = 10;

export default function AdminInventory() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [alertsSnapshot, productsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'inventory_alerts'), orderBy('created_at', 'desc'))),
        getDocs(query(collection(db, 'products'), orderBy('stock_quantity', 'asc'))),
      ]);

      const alertsData = alertsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryAlert[];
      const productsData = productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ProductStock[];

      setAlerts(alertsData);
      setProducts(productsData);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'inventory_alerts', id), { is_read: true });
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_read: true } : a));
    } catch {
      toast.error('Failed to update alert');
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory_alerts', id));
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Alert removed');
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  const updateStock = async (productId: string, newQty: number) => {
    setUpdatingStock(productId);
    try {
      const newStatus = newQty <= 0 ? 'outofstock' : 'active';
      await updateDoc(doc(db, 'products', productId), { stock_quantity: newQty, status: newStatus });
      toast.success('Stock updated');
      fetchInventory();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdatingStock(null);
    }
  };

  const generateAlerts = async () => {
    try {
      const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD);
      const outOfStock = products.filter((p) => p.stock_quantity <= 0);

      const newAlerts = [
        ...outOfStock.map((p) => ({
          product_id: p.id,
          alert_type: 'out_of_stock' as const,
          message: `${p.name} is out of stock`,
          is_read: false,
          created_at: new Date(),
        })),
        ...lowStock.map((p) => ({
          product_id: p.id,
          alert_type: 'low_stock' as const,
          message: `${p.name} has only ${p.stock_quantity} units left`,
          is_read: false,
          created_at: new Date(),
        })),
      ];

      if (newAlerts.length > 0) {
        for (const alert of newAlerts) {
          await addDoc(collection(db, 'inventory_alerts'), alert);
        }
        toast.success(`${newAlerts.length} alerts generated`);
        fetchInventory();
      } else {
        toast.success('All products are well-stocked!');
      }
    } catch {
      toast.error('Failed to generate alerts');
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.is_read);

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          {unreadAlerts.length > 0 && (
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{unreadAlerts.length} alerts</span>
          )}
        </div>
        <button onClick={generateAlerts} className="flex items-center gap-2 bg-maroon-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-maroon-800">
          <Bell size={18} /> Check Alerts
        </button>
      </div>

      {unreadAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Unread Alerts</h2>
          {unreadAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border ${alert.alert_type === 'out_of_stock' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className={alert.alert_type === 'out_of_stock' ? 'text-red-500' : 'text-yellow-500'} />
                <div>
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => markAlertRead(alert.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg"><Check size={16} /></button>
                <button onClick={() => deleteAlert(alert.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Stock Levels</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className={product.stock_quantity <= 0 ? 'bg-red-50' : product.stock_quantity <= LOW_STOCK_THRESHOLD ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{product.emoji}</span>
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${product.stock_quantity <= 0 ? 'text-red-600' : product.stock_quantity <= LOW_STOCK_THRESHOLD ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' :
                        product.status === 'outofstock' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStock(product.id, Math.max(0, product.stock_quantity - 5))} disabled={updatingStock === product.id} className="px-3 py-1.5 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50">-5</button>
                        <button onClick={() => updateStock(product.id, product.stock_quantity + 10)} disabled={updatingStock === product.id} className="px-3 py-1.5 bg-maroon-700 text-white rounded text-sm hover:bg-maroon-800 disabled:opacity-50">+10</button>
                        <button onClick={() => updateStock(product.id, product.stock_quantity + 50)} disabled={updatingStock === product.id} className="px-3 py-1.5 bg-maroon-700 text-white rounded text-sm hover:bg-maroon-800 disabled:opacity-50">+50</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
