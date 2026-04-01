import { useCart } from '../CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, ArrowRight, Loader2, CreditCard, Smartphone, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, auth } from '../firebase';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { cn } from '../lib/utils';

const PAYMENT_METHODS = [
  { 
    id: 'visa', 
    name: 'Visa / Mastercard', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png',
    type: 'card'
  },
  { 
    id: 'zimswitch', 
    name: 'ZimSwitch', 
    logo: 'https://zimswitch.co.zw/wp-content/uploads/2021/05/Zimswitch-Logo-1.png',
    type: 'card'
  },
  { 
    id: 'ecocash', 
    name: 'EcoCash', 
    logo: 'https://www.ecocash.co.zw/wp-content/uploads/2022/03/ecocash-logo.png',
    type: 'mobile'
  },
  { 
    id: 'onemoney', 
    name: 'OneMoney', 
    logo: 'https://www.netone.co.zw/wp-content/uploads/2018/10/OneMoney-Logo-1.png',
    type: 'mobile'
  },
  { 
    id: 'omari', 
    name: "O'mari", 
    logo: 'https://omari.co.zw/wp-content/uploads/2023/05/Omari-Logo-1.png',
    type: 'mobile'
  }
];

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      navigate('/profile');
      return;
    }

    if (!showPayment) {
      setShowPayment(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      // 1. Create order in Firestore
      const orderData = {
        userId: auth.currentUser.uid,
        items: cart,
        total: totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
        shippingAddress: '123 Fashion St, Trendy City, TC 12345', // Placeholder address
        paymentMethod: selectedPayment,
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // 2. Send confirmation email
      if (auth.currentUser.email) {
        await sendOrderConfirmationEmail(
          auth.currentUser.email,
          docRef.id,
          cart,
          totalPrice
        );
      }

      // 3. Clear cart and navigate to success
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Something went wrong during checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 px-6 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-pink-200" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-[250px]">Looks like you haven't added anything to your closet yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-pink-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-pink-100"
        >
          START SHOPPING
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-white border-b border-gray-100">
        <button onClick={() => showPayment ? setShowPayment(false) : navigate(-1)} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {showPayment ? 'Payment Method' : `My Bag (${totalItems})`}
        </h1>
        <div className="w-10" />
      </div>

      <div className="pt-20 px-4">
        <AnimatePresence mode="wait">
          {!showPayment ? (
            <motion.div 
              key="cart-items"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {cart.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  layout
                  className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <Link to={`/product/${item.id}`} className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                          className="text-gray-300 hover:text-pink-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                      <p className="text-pink-500 font-bold mt-2">${item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 w-fit px-2 py-1 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-pink-500"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-pink-500"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="payment-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100">
                <h3 className="text-sm font-black text-pink-500 uppercase tracking-widest mb-2">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold">{totalItems} items in bag</span>
                  <span className="text-xl font-black text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Select Payment Method</h3>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                      selectedPayment === method.id 
                        ? "border-pink-500 bg-pink-50/50 shadow-md" 
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-gray-50">
                        <img 
                          src={method.logo} 
                          alt={method.name} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-gray-900">{method.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {method.type === 'card' ? 'Credit / Debit Card' : 'Mobile Money'}
                        </p>
                      </div>
                    </div>
                    {selectedPayment === method.id && (
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg text-gray-400">
                  <CreditCard size={18} />
                </div>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                  Your payment is secure. We use industry-standard encryption to protect your financial information.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary / Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-50">
        {!showPayment && (
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">Total Amount</span>
            <span className="text-2xl font-black text-pink-500">${totalPrice.toFixed(2)}</span>
          </div>
        )}
        <button 
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className={cn(
            "w-full bg-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-pink-100 active:scale-[0.98] transition-all",
            isCheckingOut && "opacity-70 cursor-not-allowed"
          )}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              PROCESSING...
            </>
          ) : (
            <>
              {showPayment ? `PAY $${totalPrice.toFixed(2)}` : 'CHECKOUT'}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
