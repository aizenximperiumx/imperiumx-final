import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTickets, TicketNote } from '../contexts/TicketContext';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Badge from '../components/ui/Badge';
import api from '../services/api';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTicket, fetchTicket, sendMessage, markOrderPaid, confirmPayment, closeTicket, setCurrentTicket, assignTicket, getNotes, addNote } = useTickets();
  const { isStaff, isCEO, user, token } = useAuth();
  const location = useLocation();
  
  // State
  const [message, setMessage] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [txRef, setTxRef] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [messagesLimit, setMessagesLimit] = useState(200);
  const [staffList, setStaffList] = useState<Array<{ id: string; username: string; email: string; role: string }>>([]);
  const [assignee, setAssignee] = useState<string | ''>('');
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [pointsValue, setPointsValue] = useState('');
  const [pointsMode, setPointsMode] = useState<'add' | 'deduct'>('add');
  const [pointsReason, setPointsReason] = useState('manual_adjustment');
  const [vouchVisible, setVouchVisible] = useState(false);
  const [vouchRating, setVouchRating] = useState(0);
  const [vouchComment, setVouchComment] = useState('');
  const [vouchSubmitting, setVouchSubmitting] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverUsername, setDeliverUsername] = useState('');
  const [deliverPassword, setDeliverPassword] = useState('');
  const [deliverEmail, setDeliverEmail] = useState('');
  const [deliverNotes, setDeliverNotes] = useState('');
  const [deliverLoading, setDeliverLoading] = useState(false);
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const timeline = React.useMemo(() => {
    const items: Array<{ label: string; time: string }> = [];
    if (currentTicket?.createdAt) {
      items.push({ label: 'Ticket created', time: new Date(currentTicket.createdAt).toLocaleString() });
    }
    // Delivery messages
    const deliveryMsg = currentTicket?.messages?.find(m => String(m.message || '').startsWith('Delivery Details'));
    if (deliveryMsg) {
      items.push({ label: 'Credentials delivered', time: new Date(deliveryMsg.timestamp).toLocaleString() });
    }
    // Order completed
    const anyOrderTime = (currentTicket as any)?.order?.createdAt;
    if (anyOrderTime) {
      items.push({ label: 'Payment confirmed', time: new Date(anyOrderTime).toLocaleString() });
    }
    // Closed
    if (currentTicket?.status === 'closed') {
      items.push({ label: 'Ticket closed', time: '' });
    }
    return items;
  }, [currentTicket]);

  // Quick replies for staff
  const quickReplies = [
    "Thank you for your purchase! Your order is being processed.",
    "Please provide more details about your issue.",
    "Your order has been confirmed. Order ID: [ORDER_ID]",
    "Thank you for your patience. Your ticket is being reviewed.",
    "Your account details have been sent. Please check your messages.",
    "Is there anything else I can help you with?",
  ];

  // Available tags
  const availableTags = ['Billing', 'Technical', 'Delivery', 'Refund', 'General', 'Urgent'];

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
    return () => setCurrentTicket(null);
  }, [id]);

  useEffect(() => {
    if (typeof location?.search === 'string' && location.search.includes('focus=payment')) {
      const el = document.getElementById('payment-card');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location?.search]);

  useEffect(() => {
    const loadCredit = async () => {
      if (!token) return;
      try {
        const c = await api.get('/loyalty/credit', { headers: { Authorization: `Bearer ${token}` } });
        setStoreCredit(Number(c?.credit || 0));
      } catch {}
    };
    loadCredit();
  }, [token]);

  useEffect(() => {
    const fetchStaffAndNotes = async () => {
      if (!(isStaff || isCEO) || !token || !id) return;
      try {
        const users = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
        const staff = (Array.isArray(users) ? users : []).filter((u: any) => u.role === 'staff' || u.role === 'ceo');
        setStaffList(staff);
        const ns = await getNotes(id);
        setNotes(ns);
        if (currentTicket?.assignedUser) {
          const found = staff.find(s => s.email === currentTicket.assignedUser?.email);
          if (found) setAssignee(found.id);
        }
      } catch {}
    };
    fetchStaffAndNotes();
  }, [isStaff, isCEO, token, id, currentTicket?.assignedUser]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;

    try {
      await sendMessage(id, message);
      setMessage('');
      setAttachment(null);
      showNotification('Message sent', 'success');
    } catch (err: any) {
      showNotification('Failed: ' + err.message, 'error');
    }
  };

  const handleOrderPaid = async () => {
    if (!id) return;
    try {
      await markOrderPaid(id);
      if (txRef.trim()) {
        try {
          await sendMessage(id, `Payment sent (${paymentMethod}). Reference: ${txRef.trim()}`);
        } catch {}
      }
      showNotification('Order marked as paid. We will confirm shortly.', 'success');
    } catch (err: any) {
      showNotification('Failed: ' + err.message, 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!id || !paymentAmount) return;
    try {
      const data = await confirmPayment(id, parseFloat(paymentAmount), paymentMethod);
      try {
        if (data?.orderId) {
          await api.post('/referral/credit', { purchaseId: data.orderId }, { headers: { Authorization: `Bearer ${token}` } });
        }
      } catch {}
      showNotification(`Payment confirmed. Order ID: ${data.orderId}`, 'success');
      setShowPaymentModal(false);
      setPaymentAmount('');
    } catch (err: any) {
      showNotification('Failed: ' + err.message, 'error');
    }
  };

  const handleCloseTicket = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    
    try {
      await closeTicket(id);
      showNotification('Ticket closed successfully', 'success');
      setTimeout(() => navigate('/staff'), 2000);
    } catch (err: any) {
      showNotification('❌ Failed: ' + err.message, 'error');
    }
  };

  const handleRating = async (stars: number) => {
    try {
      setRating(stars);
      setShowRating(true);
      // Submit review for completed orders only
      const orderId = (currentTicket as any)?.order?.id;
      if (orderId && currentTicket?.status === 'completed') {
        await api.post('/reviews', { orderId, rating: stars }, { headers: { Authorization: `Bearer ${token}` } });
      }
      showNotification(`Thank you for your ${stars}-star rating`, 'success');
    } catch (e: any) {
      showNotification(`Could not submit rating: ${e.message}`, 'error');
    } finally {
      setTimeout(() => setShowRating(false), 3000);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const loadMoreMessages = async () => {
    const next = messagesLimit + 200;
    setMessagesLimit(next);
    if (id) {
      await fetchTicket(id, { messagesLimit: next });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
      showNotification(`File attached: ${e.target.files[0].name}`, 'success');
    }
  };

  const handleAssign = async () => {
    if (!id) return;
    const value = assignee || null;
    try {
      await assignTicket(id, value);
      showNotification('Assigned successfully', 'success');
    } catch (e: any) {
      showNotification('Failed to assign: ' + e.message, 'error');
    }
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      const note = await addNote(id, newNote.trim());
      setNotes([note, ...notes]);
      setNewNote('');
      showNotification('Note added', 'success');
    } catch (e: any) {
      showNotification('Failed to add note: ' + e.message, 'error');
    }
  };

  const handleAdjustPoints = async () => {
    if (!currentTicket?.user?.id) {
      showNotification('User not loaded', 'error');
      return;
    }
    const raw = parseInt(pointsValue, 10);
    if (!raw || raw <= 0) {
      showNotification('Enter a positive point amount', 'error');
      return;
    }
    const delta = pointsMode === 'add' ? raw : -raw;
    try {
      await api.post(`/users/${currentTicket.user.id}/points`, { delta, reason: pointsReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPointsValue('');
      showNotification('Points updated', 'success');
      if (id) {
        await fetchTicket(id, { messagesLimit });
      }
    } catch (e: any) {
      showNotification('Failed to update points: ' + e.message, 'error');
    }
  };

  useEffect(() => {
    if (!currentTicket) return;
    const isCustomer = !isStaff && !isCEO;
    const hasOrder = Boolean((currentTicket as any)?.order?.id);
    const hasReview = Boolean((currentTicket as any)?.order?.review);
    if (!isCustomer) {
      setVouchVisible(false);
      return;
    }
    if (isCustomer && currentTicket.status === 'completed' && hasOrder && !hasReview) {
      setVouchVisible(true);
    } else {
      setVouchVisible(false);
    }
  }, [currentTicket, isStaff, isCEO]);

  const submitVouch = async () => {
    if (!currentTicket) return;
    const orderId = (currentTicket as any)?.order?.id;
    const isCustomer = !isStaff && !isCEO;
    if (!isCustomer) {
      setVouchVisible(false);
      showNotification('Only customers can submit a vouch', 'error');
      return;
    }
    if (!orderId || vouchRating < 1) {
      showNotification('Please select a rating', 'error');
      return;
    }
    try {
      setVouchSubmitting(true);
      await api.post('/reviews', { orderId, rating: vouchRating, comment: vouchComment }, { headers: { Authorization: `Bearer ${token}` } });
      setVouchVisible(false);
      showNotification('Thank you for your vouch', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to submit vouch', 'error');
    } finally {
      setVouchSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;
    const base = (typeof (import.meta as any)?.env?.VITE_API_URL === 'string' && (import.meta as any).env.VITE_API_URL)
      ? String((import.meta as any).env.VITE_API_URL).replace(/\/$/, '')
      : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api');
    const url = `${base}/tickets/${id}/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    es.onopen = () => setSseConnected(true);
    es.onmessage = () => {
      if (id) {
        fetchTicket(id, { messagesLimit });
      }
    };
    es.onerror = () => {
      setSseConnected(false);
    };
    return () => {
      es.close();
    };
  }, [id, token, messagesLimit]);

  const handleDeliver = async () => {
    if (!id) return;
    try {
      setDeliverLoading(true);
      await api.post(`/tickets/${id}/deliver`, {
        username: deliverUsername || undefined,
        password: deliverPassword || undefined,
        email: deliverEmail || undefined,
        notes: deliverNotes || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDeliverOpen(false);
      setDeliverUsername('');
      setDeliverPassword('');
      setDeliverEmail('');
      setDeliverNotes('');
      showNotification('Delivery details sent', 'success');
      if (id) fetchTicket(id, { messagesLimit });
    } catch (e: any) {
      showNotification(e.message || 'Failed to deliver', 'error');
    } finally {
      setDeliverLoading(false);
    }
  };

  if (!currentTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">...</div>
          <div className="text-xl">Loading ticket...</div>
        </div>
      </div>
    );
  }

  const isCustomer = !isStaff && !isCEO;
  const isPaid = currentTicket.status === 'payment_pending' || currentTicket.status === 'completed';
  const canShowOrderPaid = isCustomer && currentTicket.type === 'buying' && currentTicket.status === 'open';
  const canShowPaymentConfirmed = (isCEO) && currentTicket.type === 'buying' && isPaid && currentTicket.status !== 'completed';
  const isClosed = currentTicket.status === 'closed';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Toast Notification */}
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl shadow-green-500/30">
              <h2 className="text-2xl font-bold mb-6 text-center">Confirm Payment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Payment Amount ($)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-green-500 text-white text-lg"
                    placeholder="Enter amount"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-green-500 text-white text-lg"
                  >
                    <option value="crypto" className="bg-gray-900">Cryptocurrency</option>
                    <option value="paypal" className="bg-gray-900">PayPal</option>
                    <option value="cashapp" className="bg-gray-900">Cash App</option>
                    <option value="other" className="bg-gray-900">Other</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-white/10 border-2 border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <div className="text-xl font-bold mb-4">{currentTicket.type === 'buying' ? 'Request Details' : 'Issue Summary'}</div>
              {currentTicket.type === 'buying' ? (() => {
                const lines = String(currentTicket.description || '').split('\n');
                const get = (label: string) => {
                  const f = lines.find(l => l.trim().toLowerCase().startsWith(label.toLowerCase()));
                  return f ? f.split(':').slice(1).join(':').trim() : '';
                };
                const game = get('Game');
                const price = get('Price Range');
                const reqs = get('Requirements');
                return (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                      <div className="text-sm text-gray-400">Game</div>
                      <div className="font-semibold capitalize">{game || '—'}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                      <div className="text-sm text-gray-400">Budget</div>
                      <div className="font-semibold">{price || '—'}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10 md:col-span-3">
                      <div className="text-sm text-gray-400 mb-1">Requirements</div>
                      <div className="whitespace-pre-wrap">{reqs || '—'}</div>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400">Subject</div>
                    <div className="font-semibold">{currentTicket.subject || currentTicket.id.substring(0,8)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400">Description</div>
                    <div className="whitespace-pre-wrap">{currentTicket.description}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <div className="text-xl font-bold mb-4">Activity Timeline</div>
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                    <div>
                      <div className="font-semibold">{t.label}</div>
                      {t.time && <div className="text-sm text-gray-400">{t.time}</div>}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && <div className="text-gray-400 text-sm">No activity yet</div>}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div id="payment-card" className="lux-card lux-card-brand rounded-2xl p-6 sticky top-24">
              <div className="text-xl font-bold mb-4">Actions</div>
              {currentTicket.type === 'buying' ? (
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <div className="text-xs text-gray-400 mb-1">Payment Method</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['crypto','paypal','cashapp','other'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setPaymentMethod(m)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold ${paymentMethod === m ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-white/10 hover:bg-white/20'}`}
                          >
                            {m === 'cashapp' ? 'Cash App' : m.charAt(0).toUpperCase() + m.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                      <div className="text-xs text-gray-400 mb-2">Transaction Reference</div>
                      <input
                        type="text"
                        value={txRef}
                        onChange={(e) => setTxRef(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 rounded-lg border border-white/10 focus:outline-none focus:border-red-500 text-white"
                        placeholder={paymentMethod === 'crypto' ? 'Tx hash (e.g., 0x...)' : 'Payment reference or note'}
                      />
                    </div>
                  </div>
                  {storeCredit > 0 && (
                    <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                      Store credit: <span className="font-bold text-white">${storeCredit.toFixed(2)}</span>
                    </div>
                  )}
                  {(currentTicket as any)?.order?.amount ? (
                    <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400">Order Amount</div>
                        <div className="font-bold text-white">${Number((currentTicket as any).order.amount).toFixed(2)}</div>
                      </div>
                    </div>
                  ) : null}
                  {canShowOrderPaid && (
                    <button
                      onClick={handleOrderPaid}
                      className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl font-bold hover:opacity-90"
                    >
                      I Sent the Payment
                    </button>
                  )}
                  {canShowPaymentConfirmed && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Confirm Payment
                    </button>
                  )}
                  {(isStaff || isCEO) && currentTicket.status === 'completed' && (
                    <button
                      onClick={() => setDeliverOpen(true)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Deliver Credentials
                    </button>
                  )}
                  {(isCEO) && !isClosed && (
                    <button
                      onClick={handleCloseTicket}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-300">Support request. Staff will respond shortly.</div>
              )}
            </div>
          </div>
        </div>

        {/* Vouch Modal (Customer only, required) */}
        {vouchVisible && (!isStaff && !isCEO) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-center">Please Leave a Vouch</h2>
              <p className="text-gray-400 text-center mb-6">Your order is completed. Share a quick rating and note.</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setVouchRating(n)}
                    className={`w-10 h-10 rounded-full font-bold ${
                      vouchRating >= n ? 'bg-red-600' : 'bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={vouchComment}
                onChange={(e) => setVouchComment(e.target.value)}
                className="w-full h-28 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white"
                placeholder="Write a short vouch..."
              />
              <button
                onClick={submitVouch}
                disabled={vouchSubmitting || vouchRating < 1}
                className="w-full mt-4 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {vouchSubmitting ? 'Submitting...' : 'Submit Vouch'}
              </button>
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-6 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {currentTicket.orderId || `Ticket #${currentTicket.id.substring(0, 8)}`}
                </h1>
                {currentTicket.lifetimeWarranty && (
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-sm font-bold shadow-lg shadow-purple-500/30">
                    LIFETIME WARRANTY
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                  currentTicket.status === 'open' ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-lg shadow-green-500/30' :
                  currentTicket.status === 'closed' ? 'bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30' :
                  currentTicket.status === 'completed' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30' :
                  'bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg shadow-yellow-500/30'
                }`}>
                    {currentTicket.status === 'open' ? 'OPEN' :
                   currentTicket.status === 'closed' ? 'CLOSED' :
                   currentTicket.status === 'completed' ? 'COMPLETED' : 'PAYMENT PENDING'}
                </span>
                <Badge color="purple">{currentTicket.type === 'buying' ? 'BUYING' : 'SUPPORT'}</Badge>
                <Badge color={currentTicket.priority === 'urgent' ? 'red' : 'gray'}>
                  {currentTicket.priority === 'urgent' ? 'URGENT' : 'NORMAL'}
                </Badge>
                {currentTicket.orderId && (
                  <button
                    onClick={async () => {
                      try {
                        const data = await api.get(`/orders/${(currentTicket as any)?.order?.id || currentTicket.orderId}/receipt`, { headers: { Authorization: `Bearer ${token}` } });
                        const html = `
                          <html><head><title>Receipt ${data.orderId}</title></head>
                          <body style="font-family: Arial; padding: 24px; color: #111;">
                            <h1>Order Receipt</h1>
                            <div><strong>Order ID:</strong> ${data.orderId}</div>
                            <div><strong>Amount:</strong> $${Number(data.amount).toFixed(2)}</div>
                            <div><strong>Payment Method:</strong> ${data.paymentMethod}</div>
                            <div><strong>Status:</strong> ${data.status}</div>
                            <div><strong>Date:</strong> ${new Date(data.createdAt).toLocaleString()}</div>
                          </body></html>`;
                        const blob = new Blob([html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Receipt-${data.orderId}.html`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (e: any) {
                        showNotification(e.message || 'Failed to download receipt', 'error');
                      }
                    }}
                    className="px-3 py-2 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20"
                  >
                    Download Receipt
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {canShowPaymentConfirmed && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-green-500/30 transform hover:scale-105"
                >
                  Confirm Payment
                </button>
              )}

              {(isStaff || isCEO) && currentTicket.status === 'completed' && (
                <button
                  onClick={() => setDeliverOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 transform hover:scale-105"
                >
                  Deliver Credentials
                </button>
              )}

              {(isCEO) && !isClosed && (
                <button
                  onClick={handleCloseTicket}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-red-500/30 transform hover:scale-105"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>

          {/* Customer Info (Staff View) */}
          {(isStaff || isCEO) && currentTicket.user && (
            <div className="p-6 bg-gradient-to-r from-purple-500/20 to-purple-500/5 rounded-xl border border-purple-500/30 mb-4">
              <h3 className="font-bold mb-3 text-purple-400">Customer Information</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Discord</div>
                  <div className="font-semibold">{(currentTicket as any).user.discord || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Email</div>
                  <div className="font-semibold">{currentTicket.user.email}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Tier</div>
                  <div className="font-semibold capitalize">{currentTicket.user.tier}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Points</div>
                  <div className="font-semibold">{(currentTicket as any).user.points ?? '—'}</div>
                </div>
              </div>
            </div>
          )}

          {(isStaff || isCEO) && (
            <div className="p-6 bg-white/5 rounded-xl border border-white/20 mb-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Assignee</div>
                  <div className="flex gap-2">
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl"
                    >
                      <option className="text-black" value="">Unassigned</option>
                      {staffList.map(s => (
                        <option className="text-black" key={s.id} value={s.id}>{s.username} ({s.role})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Assigned To</div>
                  <div className="font-semibold">
                    {currentTicket.assignedUser?.username || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isStaff || isCEO) && (
            <div className="p-6 bg-white/5 rounded-xl border border-white/20 mb-4">
              <h3 className="font-bold mb-3 text-green-400">Adjust Points</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="flex gap-2">
                  <select
                    value={pointsMode}
                    onChange={(e) => setPointsMode(e.target.value as any)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl"
                  >
                    <option value="add">Add</option>
                    <option value="deduct">Deduct</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={pointsValue}
                    onChange={(e) => setPointsValue(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl"
                    placeholder="Points"
                  />
                </div>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl"
                  placeholder="Reason"
                />
                <button
                  onClick={handleAdjustPoints}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {(isStaff || isCEO) && (
            <div className="p-6 bg-gradient-to-r from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/30 mb-4">
              <h3 className="font-bold mb-3 text-blue-400">Ticket Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* removed old Ticket Info block to avoid duplication */}
        </div>

        {/* removed old “Payment steps” block to avoid duplication */}

        {deliverOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-center">Deliver Credentials</h2>
              <div className="space-y-3">
                <input
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Username"
                  value={deliverUsername}
                  onChange={(e) => setDeliverUsername(e.target.value)}
                />
                <input
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Password"
                  value={deliverPassword}
                  onChange={(e) => setDeliverPassword(e.target.value)}
                />
                <input
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Email"
                  value={deliverEmail}
                  onChange={(e) => setDeliverEmail(e.target.value)}
                />
                <textarea
                  className="w-full h-24 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Notes"
                  value={deliverNotes}
                  onChange={(e) => setDeliverNotes(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setDeliverOpen(false)} className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20">Cancel</button>
                  <button onClick={handleDeliver} disabled={deliverLoading} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                    {deliverLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Chat Messages
              <span className="text-sm font-normal text-gray-400">({currentTicket.messages?.length || 0} messages)</span>
            </h2>
          </div>

          {/* Messages List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {currentTicket.messages?.map((msg, index) => {
              const isMyMessage = (isStaff || isCEO) ? msg.sender === 'staff' : msg.sender === 'customer';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      isMyMessage
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm">
                        {msg.sender === 'staff' ? (currentTicket.assignedUser?.username ? `Staff • ${currentTicket.assignedUser.username}` : 'Staff') : ((currentTicket as any).user.discord || 'Customer')}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {String(msg.message || '').startsWith('Delivery Details') ? (
                      <div className="space-y-2">
                        <div className="font-semibold mb-1">Delivery Details</div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                          {String(msg.message).split('\n').slice(1).map((line, i) => {
                            const [label, ...rest] = line.split(':');
                            const value = rest.join(':').trim();
                            return (
                              <div key={i} className="grid grid-cols-3 gap-2 py-1">
                                <div className="text-gray-400">{label}</div>
                                <div className="col-span-2 break-all">{value}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    )}
                    {msg.attachment && (
                      <div className="mt-2 p-2 bg-white/10 rounded-lg text-sm">
                        {msg.attachment}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {(!currentTicket.messages || currentTicket.messages.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                <div>No messages yet</div>
                <div className="text-sm mt-2">Start the conversation!</div>
              </div>
            )}
          </div>

          {/* Load more */}
          <div className="px-6 pb-4">
            <button
              onClick={loadMoreMessages}
              className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
            >
              Load more messages
            </button>
          </div>
          
          {/* Quick Replies (Staff Only) */}
          {(isStaff || isCEO) && !isClosed && (
            <div className="p-4 border-t border-white/20 bg-white/5">
              <div className="text-sm text-gray-400 mb-2">Quick Replies:</div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(reply)}
                    className="px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-all"
                  >
                    {reply.substring(0, 40)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Send Message */}
          {!isClosed ? (
            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/20">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-5 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
                    placeholder="Type your message..."
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-red-500/30"
                  >
                    Send
                  </button>
                </div>
                
                {/* File Attachment */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all inline-flex items-center gap-2"
                  >
                    Attach File
                  </label>
                  {attachment && (
                    <span className="text-sm text-gray-400">{attachment.name}</span>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="p-6 border-t border-white/20 text-center text-gray-400">
              <div className="font-semibold">This ticket has been closed</div>
              <div className="text-sm mt-1">No further messages can be sent</div>
              
              {/* Rating for Customer */}
              {isCustomer && !showRating && (
                <div className="mt-6">
                  <div className="text-lg mb-3">How was your experience?</div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button
                        key={stars}
                        onClick={() => handleRating(stars)}
                        className="text-4xl hover:scale-125 transition-transform"
                      >
                        *
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showRating && (
                <div className="mt-6 text-green-500 font-semibold">
                  Thank you for your rating
                </div>
              )}
            </div>
          )}
        </div>

        {(isStaff || isCEO) && (
          <div className="bg-white/5 rounded-2xl border border-white/20 mt-6">
            <div className="p-6 border-b border-white/20 font-bold">Internal Notes</div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl"
                  placeholder="Add a private note..."
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl font-bold hover:opacity-90"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="text-sm text-gray-400">
                      {new Date(n.createdAt).toLocaleString()} • {n.author?.username || 'Staff'}
                    </div>
                    <div className="mt-1">{n.content}</div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-gray-400 text-sm">No notes yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
