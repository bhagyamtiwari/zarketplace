import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Loader2, ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { handleRazorpayPayment } from '../lib/razorpay';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [paymentMethod, setPaymentMethod] = React.useState<'online' | 'cod'>('online');

  React.useEffect(() => {
    async function fetchListing() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Listing not found</h1>
        <button onClick={() => navigate('/browse')} className="mt-8 text-xs font-bold uppercase tracking-widest underline">
          Back to marketplace
        </button>
      </div>
    );
  }

  const subtotal = listing.sale_price || listing.price;
  const shipping = listing.shipping_cost || 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (paymentMethod === 'online') {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        name: "Zarketplace",
        description: `Order for ${listing.title}`,
        image: "/images/zarketplace-tp.png",
        handler: function (response: any) {
          alert(`Payment Successful: ${response.razorpay_payment_id}`);
          // Here you would typically update the order status in Supabase
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#000000"
        }
      };
      await handleRazorpayPayment(options);
    } else {
      alert("Order placed successfully (Cash on Delivery)");
      // Here you would typically create the order in Supabase
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <Link to={`/product/${listing.id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:text-black/80 mb-12">
        <ArrowLeft className="h-3 w-3" /> Back to Product
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Checkout Form */}
        <div className="lg:col-span-7 flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <img src="/images/zarketplace-tp.png" alt="Zarketplace" className="h-6 w-auto" referrerPolicy="no-referrer" />
              <span className="lowercase font-black tracking-tighter text-2xl">zarketplace</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Checkout</span>
            <h1 className="text-5xl font-black tracking-tighter uppercase">Finalize Order</h1>
          </div>

          <div className="flex flex-col gap-12">
            {/* Shipping Info */}
            <section className="flex flex-col gap-8">
              <h2 className="text-xs font-black uppercase tracking-widest border-b border-black pb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">Full Name</label>
                  <input type="text" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">Email Address</label>
                  <input type="email" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="hello@example.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">Phone Number</label>
                  <input type="tel" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="+91 98765 43210" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">Address</label>
                  <input type="text" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="House No, Street, Area" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">City</label>
                  <input type="text" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="Mumbai" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black">Pincode</label>
                  <input type="text" className="border-b border-black/10 py-3 text-sm font-bold focus:border-black focus:outline-none transition-all" placeholder="400001" />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="flex flex-col gap-8">
              <h2 className="text-xs font-black uppercase tracking-widest border-b border-black pb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('online')}
                  className={cn(
                    "flex flex-col gap-4 p-6 border transition-all text-left",
                    paymentMethod === 'online' ? "border-black bg-black text-white" : "border-black/5 bg-zinc-50 hover:border-black/20"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <CreditCard className="h-5 w-5" />
                    <div className="flex gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Razorpay</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Cashfree</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">Online Payment</span>
                    <span className="text-[9px] opacity-60">UPI, Cards, Netbanking</span>
                  </div>
                </button>

                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "flex flex-col gap-4 p-6 border transition-all text-left",
                    paymentMethod === 'cod' ? "border-black bg-black text-white" : "border-black/5 bg-zinc-50 hover:border-black/20"
                  )}
                >
                  <Truck className="h-5 w-5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
                    <span className="text-[9px] opacity-60">Pay when you receive</span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 flex flex-col gap-10 p-10 bg-zinc-50 border border-black/5">
            <h2 className="text-xs font-black uppercase tracking-widest">Order Summary</h2>
            
            <div className="flex gap-6">
              <div className="h-24 w-18 bg-zinc-200 overflow-hidden border border-black/5">
                <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-black">{listing.brand}</span>
                <h3 className="text-xs font-bold uppercase tracking-widest">{listing.title}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest">{listing.size}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-y border-black/5 py-8">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-black">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-black">Shipping</span>
                {shipping > 0 ? (
                  <span>{formatCurrency(shipping)}</span>
                ) : (
                  <span className="text-emerald-600">Free</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black tracking-tighter">{formatCurrency(total)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-black py-6 text-xs font-black uppercase tracking-[0.4em] text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              Place Order
            </button>

            <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-black/30">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
