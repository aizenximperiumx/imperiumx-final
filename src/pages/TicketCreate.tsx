import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTickets } from '../contexts/TicketContext';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

export default function TicketCreate() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'buying';
  
  const [step, setStep] = useState(1);
  const [type, setType] = useState(initialType);
  const [game, setGame] = useState('valorant');
  const [priceRange, setPriceRange] = useState('');
  const [requirements, setRequirements] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [lifetimeWarranty, setLifetimeWarranty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [supportKind, setSupportKind] = useState<'question' | 'purchase_issue'>('question');
  const [supportOrderId, setSupportOrderId] = useState('');

  const { createTicket } = useTickets();
  const navigate = useNavigate();

  React.useEffect(() => {
    const pGame = searchParams.get('game');
    const pPrice = searchParams.get('price');
    if (pGame || pPrice) {
      setType('buying');
      setStep(2);
    }
    if (pGame) {
      const gv = pGame.toLowerCase();
      setGame(gv === 'valorant' || gv === 'fortnite' ? gv : 'other');
    }
    if (pPrice) {
      const v = parseFloat(pPrice);
      if (!isNaN(v)) {
        if (v < 50) setPriceRange('$20-50');
        else if (v < 100) setPriceRange('$50-100');
        else if (v < 200) setPriceRange('$100-200');
        else setPriceRange('$200+');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supportPrefix =
        type === 'support'
          ? `Support Type: ${supportKind}\nRelated Order: ${supportKind === 'purchase_issue' ? supportOrderId : 'N/A'}\n`
          : '';
      const ticketData = {
        type,
        subject: type === 'buying' ? `${game} Account - ${priceRange}` : subject,
        description: type === 'buying' 
          ? `Game: ${game}\nPrice Range: ${priceRange}\nRequirements: ${requirements}`
          : `${supportPrefix}${description}`,
        priority,
        lifetimeWarranty,
      };

      const result = await createTicket(ticketData);
      
      setSuccess('Ticket created successfully. Redirecting...');
      
      setTimeout(() => {
        if (result && result.id) {
          navigate(`/tickets/${result.id}`);
        } else {
          navigate('/tickets');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <div className="hidden md:flex flex-col justify-center p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
          <div className="text-5xl font-extrabold hero-title mb-2">IMPERIUMX</div>
          <div className="text-gray-300 mb-6">Create a new ticket</div>
          <div className="flex gap-2 mb-6">
            {[1,2,3].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-white/10 text-gray-400'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>• Choose ticket type</li>
            <li>• Provide details</li>
            <li>• Review and submit</li>
          </ul>
        </div>
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create Ticket</h1>
          </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border-2 border-green-500 text-green-500 p-6 rounded-lg mb-6 text-center animate-pulse">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-500 p-6 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Ticket Type */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Select Ticket Type</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => { setType('buying'); nextStep(); }}
                    className={`p-8 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                      type === 'buying'
                        ? 'bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400 shadow-lg shadow-red-500/50'
                        : 'bg-white/10 border-2 border-white/10 hover:border-red-500/50'
                    }`}
                  >
                    <div>Buying Account</div>
                    <div className="text-sm font-normal mt-2 opacity-70">Valorant, Fortnite, etc.</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setType('support'); nextStep(); }}
                    className={`p-8 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                      type === 'support'
                        ? 'bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-400 shadow-lg shadow-gray-500/50'
                        : 'bg-white/10 border-2 border-white/10 hover:border-gray-500/50'
                    }`}
                  >
                    <div>Support</div>
                    <div className="text-sm font-normal mt-2 opacity-70">Issues, questions, help</div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">
                  {type === 'buying' ? 'Account Details' : 'Issue Details'}
                </h2>

                {type === 'buying' ? (
                  <>
                    <Select label="Game" value={game} onChange={(e) => setGame(e.target.value)}>
                      <option className="text-black" value="valorant">Valorant</option>
                      <option className="text-black" value="fortnite">Fortnite</option>
                      <option className="text-black" value="other">Other</option>
                    </Select>

                    <Select label="Price Range" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} required>
                      <option className="text-black" value="">Select your budget</option>
                      <option className="text-black" value="$20-50">$20 - $50 (Basic Accounts)</option>
                      <option className="text-black" value="$50-100">$50 - $100 (Mid-Tier Accounts)</option>
                      <option className="text-black" value="$100-200">$100 - $200 (High-Tier Accounts)</option>
                      <option className="text-black" value="$200+">$200+ (Premium/OG Accounts)</option>
                    </Select>
                    {(() => {
                      const pPrice = searchParams.get('price');
                      const val = pPrice ? parseFloat(pPrice) : NaN;
                      if (!isNaN(val)) {
                        const pts = Math.max(0, Math.round(val * 10));
                        return <div className="text-xs text-gray-400 -mt-4">Estimated points earned on purchase: <span className="font-semibold text-white">{pts} pts</span></div>;
                      }
                      return null;
                    })()}

                    <TextArea
                      label="Specific Requirements"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="h-40 resize-none"
                      placeholder="E.g., I want an Ascendant account with Oni Vandal..."
                      required
                    />
                  </>
                ) : (
                  <>
                    <Select label="What is this about?" value={supportKind} onChange={(e) => setSupportKind(e.target.value as any)}>
                      <option className="text-black" value="question">I have a question</option>
                      <option className="text-black" value="purchase_issue">Issue with a previous purchase</option>
                    </Select>
                    {supportKind === 'purchase_issue' && (
                      <div>
                        <Input
                          label="Related Order ID"
                          type="text"
                          value={supportOrderId}
                          onChange={(e) => setSupportOrderId(e.target.value)}
                          placeholder="Enter your Order ID (e.g., ORD-XXXXXXXX)"
                          required
                        />
                        <div className="text-sm text-gray-400 mt-2">
                          Find your order ID in Profile → Overview → Recent Orders, or download the receipt and copy the Order ID.
                        </div>
                      </div>
                    )}
                    <Input
                      label="Subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />

                    <TextArea
                      label="Detailed Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-40 resize-none"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={prevStep} size="lg">
                    Back
                  </Button>
                  <Button type="button" className="flex-1" onClick={nextStep} size="lg">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Review & Submit</h2>

                {/* Review Card - FIXED VISIBILITY */}
                <div className="bg-gray-900 rounded-xl p-6 border-2 border-red-500 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Ticket Type:</span>
                    <span className="font-bold text-white text-lg">{type === 'buying' ? 'Buying Account' : 'Support'}</span>
                  </div>
                  
                  {type === 'buying' ? (
                    <>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Game:</span>
                        <span className="font-bold text-white text-lg capitalize">{game}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Price Range:</span>
                        <span className="font-bold text-green-500 text-lg">{priceRange}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-2">Requirements:</span>
                        <p className="text-white bg-gray-800 p-4 rounded-lg border border-gray-700">{requirements}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Subject:</span>
                        <span className="font-bold text-white text-lg">{subject}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Support Type:</span>
                        <span className="font-bold text-white text-lg">
                          {supportKind === 'question' ? 'Question' : 'Previous Purchase Issue'}
                        </span>
                      </div>
                      {supportKind === 'purchase_issue' && (
                        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                          <span className="text-gray-400">Related Order:</span>
                          <span className="font-mono text-green-400">{supportOrderId || '—'}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 block mb-2">Description:</span>
                        <p className="text-white bg-gray-800 p-4 rounded-lg border border-gray-700">{description}</p>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Priority:</span>
                    <span className={`font-bold ${priority === 'urgent' ? 'text-red-500' : 'text-gray-400'}`}>
                      {priority === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </div>

                  {type === 'buying' && (
                    <div className="flex items-center gap-3 p-4 bg-purple-500/20 border-2 border-purple-500 rounded-xl">
                      <input
                        type="checkbox"
                        id="warranty"
                        checked={lifetimeWarranty}
                        onChange={(e) => setLifetimeWarranty(e.target.checked)}
                        className="w-6 h-6 rounded accent-purple-500"
                      />
                      <label htmlFor="warranty" className="text-white font-semibold cursor-pointer">
                        Add Lifetime Warranty (discuss pricing in ticket)
                      </label>
                    </div>
                  )}
                </div>

                {type === 'buying' && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="font-bold mb-2">How payment works</div>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Staff will send manual payment instructions in the chat</li>
                      <li>• Pay using your chosen method (Crypto, PayPal, Cash App, or Other)</li>
                      <li>• Click “Mark as Paid” after sending payment</li>
                      <li>• Staff confirms and delivers your account securely</li>
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={prevStep} size="lg">
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
