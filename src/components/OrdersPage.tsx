import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, ArrowLeft, Clock, Truck, CheckCircle, XCircle, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { db, collection, getDocs, query, where, orderBy, auth } from '../firebase';
import { Order } from '../types';
import { cn } from '../lib/utils';
import { sendShipmentNotificationEmail } from '../services/emailService';
import { updateDoc, doc, onSnapshot } from '../firebase';

const StatusIcon = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending': return <Clock size={18} className="text-amber-500" />;
    case 'processing': return <AlertCircle size={18} className="text-blue-500" />;
    case 'shipped': return <Truck size={18} className="text-purple-500" />;
    case 'delivered': return <CheckCircle size={18} className="text-green-500" />;
    case 'cancelled': return <XCircle size={18} className="text-red-500" />;
    default: return <Package size={18} className="text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    shipped: "bg-purple-50 text-purple-600 border-purple-100",
    delivered: "bg-green-50 text-green-600 border-green-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
      styles[status] || "bg-gray-50 text-gray-600 border-gray-100"
    )}>
      {status}
    </span>
  );
};

const OrderStatusTracker = ({ status }: { status: Order['status'] }) => {
  const steps: { key: Order['status']; label: string; icon: any }[] = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'processing', label: 'Processing', icon: AlertCircle },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-500">
          <XCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-black text-red-600 uppercase tracking-tight">Order Cancelled</p>
          <p className="text-xs font-bold text-red-400">This order has been cancelled and will not be processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-4 pb-8">
      <div className="flex justify-between items-start relative z-10">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-3 flex-1">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                isCompleted 
                  ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100 scale-110" 
                  : "bg-white border-gray-100 text-gray-300"
              )}>
                <Icon size={18} strokeWidth={isCompleted ? 3 : 2} />
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors duration-500",
                  isCompleted ? "text-gray-900" : "text-gray-300"
                )}>
                  {step.label}
                </p>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="w-1 h-1 bg-pink-500 rounded-full mx-auto mt-1"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line Background */}
      <div className="absolute top-[34px] left-[12.5%] right-[12.5%] h-[2px] bg-gray-50 z-0" />
      
      {/* Active Progress Line */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ 
          width: currentStepIndex >= 0 
            ? `${(currentStepIndex / (steps.length - 1)) * 75}%` 
            : 0 
        }}
        className="absolute top-[34px] left-[12.5%] h-[2px] bg-pink-500 z-0 transition-all duration-1000 ease-out"
      />
    </div>
  );
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 px-6 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-24 px-4">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
          <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order Details</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Info Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                <p className="text-lg font-black text-gray-900">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Placed on {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            <OrderStatusTracker status={selectedOrder.status} />

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <StatusIcon status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                  <p className="text-sm font-black text-gray-900 capitalize">{selectedOrder.status}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin size={20} className="text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 p-1.5 border border-gray-100">
                    {selectedOrder.paymentMethod === 'visa' ? (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" alt="Visa" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : selectedOrder.paymentMethod === 'zimswitch' ? (
                      <img src="https://zimswitch.co.zw/wp-content/uploads/2021/05/Zimswitch-Logo-1.png" alt="ZimSwitch" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : selectedOrder.paymentMethod === 'ecocash' ? (
                      <img src="https://www.ecocash.co.zw/wp-content/uploads/2022/03/ecocash-logo.png" alt="EcoCash" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : selectedOrder.paymentMethod === 'onemoney' ? (
                      <img src="https://www.netone.co.zw/wp-content/uploads/2018/10/OneMoney-Logo-1.png" alt="OneMoney" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : selectedOrder.paymentMethod === 'omari' ? (
                      <img src="https://omari.co.zw/wp-content/uploads/2023/05/Omari-Logo-1.png" alt="O'mari" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <CreditCard size={20} className="text-pink-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                    <p className="text-sm font-black text-gray-900 capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Order Items ({selectedOrder.items.length})</h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-black text-gray-900 line-clamp-1">{item.name}</h4>
                    <div className="flex gap-3 mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size: <span className="text-gray-900">{item.selectedSize}</span></p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color: <span className="text-gray-900">{item.selectedColor}</span></p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-xs font-bold text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-black text-pink-500">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white/60">Subtotal</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white/60">Shipping</span>
                <span className="text-green-400 uppercase text-[10px] tracking-widest">Free</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tight">Total</span>
                <span className="text-2xl font-black text-pink-400">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {selectedOrder.status === 'pending' && (
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'processing' });
                    setSelectedOrder(prev => prev ? { ...prev, status: 'processing' } : null);
                  } catch (error) {
                    console.error("Processing Simulation Error:", error);
                  }
                }}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
              >
                SIMULATE PROCESSING <AlertCircle size={18} />
              </button>
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'shipped' });
                    if (auth.currentUser?.email) {
                      await sendShipmentNotificationEmail(auth.currentUser.email, selectedOrder.id);
                    }
                    setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
                  } catch (error) {
                    console.error("Shipment Simulation Error:", error);
                  }
                }}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-pink-100 flex items-center justify-center gap-2"
              >
                SIMULATE SHIPMENT <Truck size={18} />
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    try {
                      await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'cancelled' });
                      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                    } catch (error) {
                      console.error("Cancellation Error:", error);
                    }
                  }
                }}
                className="w-full py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2"
              >
                CANCEL ORDER <XCircle size={18} />
              </button>
            </div>
          )}

          {selectedOrder.status === 'processing' && (
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'shipped' });
                    if (auth.currentUser?.email) {
                      await sendShipmentNotificationEmail(auth.currentUser.email, selectedOrder.id);
                    }
                    setSelectedOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
                  } catch (error) {
                    console.error("Shipment Simulation Error:", error);
                  }
                }}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-pink-100 flex items-center justify-center gap-2"
              >
                SIMULATE SHIPMENT <Truck size={18} />
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    try {
                      await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'cancelled' });
                      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                    } catch (error) {
                      console.error("Cancellation Error:", error);
                    }
                  }
                }}
                className="w-full py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2"
              >
                CANCEL ORDER <XCircle size={18} />
              </button>
            </div>
          )}

          {selectedOrder.status === 'shipped' && (
            <button 
              onClick={async () => {
                try {
                  await updateDoc(doc(db, 'orders', selectedOrder.id), { status: 'delivered' });
                  // Update local state for the details view
                  setSelectedOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
                } catch (error) {
                  console.error("Delivery Simulation Error:", error);
                }
              }}
              className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-2"
            >
              SIMULATE DELIVERY <CheckCircle size={18} />
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-4">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Package size={48} className="text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No orders yet</h2>
          <p className="text-gray-500 text-sm max-w-[250px] mb-8">
            Looks like you haven't placed any orders yet. Start shopping to fill this up!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-pink-100"
          >
            START SHOPPING
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <StatusIcon status={order.status} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-sm font-black text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="text-xs font-bold text-gray-600">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                  <p className="text-lg font-black text-pink-500">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedOrder(order)}
                className="w-full mt-4 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-50 hover:text-pink-500 transition-colors"
              >
                View Details <ChevronRight size={14} />
              </button>

              {order.status === 'pending' && (
                <button 
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, 'orders', order.id), { status: 'shipped' });
                      if (auth.currentUser?.email) {
                        await sendShipmentNotificationEmail(auth.currentUser.email, order.id);
                      }
                    } catch (error) {
                      console.error("Shipment Simulation Error:", error);
                    }
                  }}
                  className="w-full mt-2 py-3 bg-pink-50 text-pink-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors"
                >
                  Simulate Shipment <Truck size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Support Section */}
      <div className="mt-12 p-6 bg-pink-50 rounded-3xl border border-pink-100">
        <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-4">If you have any questions about your order, our support team is here to help 24/7.</p>
        <button 
          onClick={() => navigate('/contact')}
          className="text-pink-500 font-black text-xs uppercase tracking-widest flex items-center gap-2"
        >
          Contact Support <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
