import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus,
  BarChart3,
  MessageCircle,
  ClipboardList,
  ArrowRight,
  Search,
  Bot,
  X,
  ShieldCheck,
  RefreshCcw,
  Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Role = 'customer' | 'admin';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  isWarning?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
  category: 'booking' | 'menu' | 'hours' | 'delivery' | 'general';
}

interface Order {
  id: string;
  items: string[];
  status: 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  total: number;
  date: string;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  tableNumber: number;
  tableOrders?: string[];
}

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
}

// --- Mock Data ---
const MOCK_FAQS: FAQ[] = [
  { question: "What are your opening hours?", answer: "We are open from 11:00 AM to 11:00 PM every day.", category: 'hours' },
  { question: "How can I make a reservation?", answer: "You can book a table directly through our chatbot or by clicking the 'Book Table' button in your dashboard.", category: 'booking' },
  { question: "Do you have vegan options?", answer: "Yes, we have a variety of vegan dishes including our Roasted Vegetable Platter and Quinoa Salad.", category: 'menu' },
  { question: "What is your delivery radius?", answer: "We deliver within a 10km radius from our restaurant location.", category: 'delivery' },
  { question: "Do you offer gluten-free bread?", answer: "Yes, we have gluten-free options for all our sandwiches and burgers.", category: 'menu' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-001', items: ['Truffle Pasta', 'Red Wine'], status: 'Delivered', total: 45.50, date: '2024-05-01' },
  { id: 'ORD-002', items: ['Margherita Pizza', 'Coke'], status: 'Preparing', total: 22.00, date: '2024-05-08' },
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'BK-101', date: '2024-05-15', time: '19:30', guests: 2, status: 'Confirmed', tableNumber: 5, tableOrders: ['Red Wine', 'Bread Sticks'] },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 'TKT-001', userId: 'cust_1', userName: 'John Doe', subject: 'Late Delivery', description: 'Order #ORD-001 was 30 mins late.', status: 'Resolved', priority: 'Medium', createdAt: new Date('2024-05-01') },
  { id: 'TKT-002', userId: 'cust_1', userName: 'John Doe', subject: 'Wrong Item', description: 'Received spicy wings instead of mild.', status: 'Open', priority: 'High', createdAt: new Date() },
];

const DB_KEYS = {
  TICKETS: 'restaurant_bot_tickets',
  BOOKINGS: 'restaurant_bot_bookings',
  FAQS: 'restaurant_bot_faqs',
  PENDING_QUESTIONS: 'restaurant_bot_pending_q',
};

interface PendingQuestion {
  id: string;
  question: string;
  timestamp: Date;
}

// --- Chat Logic Helper ---
const classifyIntent = (text: string) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('order') || lowerText.includes('status') || lowerText.includes('where')) return 'order_status';
  if (lowerText.includes('book') || lowerText.includes('reserve') || lowerText.includes('table')) return 'booking';
  if (lowerText.includes('complaint') || lowerText.includes('bad') || lowerText.includes('wrong') || lowerText.includes('issue')) return 'complaint';
  if (lowerText.includes('menu') || lowerText.includes('eat') || lowerText.includes('food')) return 'menu_query';
  return 'general';
};

const getBotResponse = (text: string, orders: Order[], bookings: Booking[], faqs: FAQ[]) => {
  const intent = classifyIntent(text);
  const lowerText = text.toLowerCase();

  // Security Check
  const securityThreats = ["sudo", "admin", "override", "root", "database", "password", "hack", "bypass", "system"];
  if (securityThreats.some(threat => lowerText.includes(threat))) {
    return {
      text: "⚠️ SECURITY ALERT: Unauthorized system access attempt detected. Activity logged.",
      intent: "security_violation",
      isWarning: true
    };
  }

  // 1. Dynamic FAQ Matching
  const faqMatch = faqs.find(f => 
    lowerText.includes(f.question.toLowerCase().split(' ').slice(-2).join(' ')) || 
    f.question.toLowerCase().split(' ').some(word => word.length > 4 && lowerText.includes(word))
  );

  if (faqMatch) return { text: faqMatch.answer, intent };

  // 2. High Conversation Content
  if (lowerText.includes("location") || lowerText.includes("where")) {
    return { text: "We are located at 123 Gourmet Avenue, Cyber City. Would you like a map link?", intent: 'general' };
  }
  
  if (lowerText.includes("offer") || lowerText.includes("discount")) {
    return { text: "We have a 20% Happy Hour discount from 4 PM - 6 PM! Should I apply a code?", intent: 'general' };
  }

  switch (intent) {
    case 'order_status': {
      const latestOrder = orders[orders.length - 1];
      if (latestOrder) {
        return { 
          text: `Your order (${latestOrder.id}) is ${latestOrder.status}. It's being prepared with care!`,
          intent 
        };
      }
      return { text: "I couldn't find any active orders for you.", intent };
    }
    case 'booking': {
      const latestBooking = bookings[bookings.length - 1];
      if (latestBooking && new Date(latestBooking.date) >= new Date()) {
        return { 
          text: `You have a reservation for ${latestBooking.guests} on ${latestBooking.date} at ${latestBooking.time}.`,
          intent 
        };
      }
      return { text: "I can help you book a table! What date and how many guests?", intent };
    }
    case 'complaint':
      return { text: "I'm sorry for the trouble. I've opened a support ticket (TKT-ESCALATE) for you.", intent };
    case 'menu_query':
      return { text: "Our specials: Truffle Pasta and Margherita Pizza. Want the full menu?", intent };
    default:
      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        return { text: "Greetings! I'm CyberBot, your AI dining concierge. How can I help you?", intent: 'greeting' };
      }
      return { 
        text: "I could not understand that question. I've sent this to my human manager for a future update!",
        intent: 'unknown' 
      };
  }
};

// --- Components ---

const Navbar = ({ user, onLogout }: { user: UserData | null, onLogout: () => void }) => (
  <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            GustoBot Pro
          </span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-900">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role} Account</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const LoginPage = ({ onLogin }: { onLogin: (role: Role) => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Futuristic Anime Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: 'url("/login-bg-v2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-purple-600/40 z-[1]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your dining experience</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('customer')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <User className="w-5 h-5" />
            Continue as Customer
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 font-medium">Internal Use</span></div>
          </div>

          <button 
            onClick={() => onLogin('admin')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <ShieldCheck className="w-5 h-5" />
            Administrator Access
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our <a href="#" className="underline">Terms of Service</a>
        </p>
      </motion.div>
    </div>
  );
};

const Chatbot = ({ user, orders, bookings, faqs, onAddTicket }: { 
  user: UserData, 
  orders: Order[], 
  bookings: Booking[],
  faqs: FAQ[],
  onAddTicket: (subject: string, desc: string) => void
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hi! I'm CyberBot, your AI dining assistant. How can I help you today?`, sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = getBotResponse(input, orders, bookings, faqs);
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.text, 
        sender: 'bot', 
        timestamp: new Date(),
        intent: response.intent,
        isWarning: (response as any).isWarning
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Handle Unknown Question for Admin Feedback
      if (response.intent === 'unknown') {
        const pending = JSON.parse(localStorage.getItem(DB_KEYS.PENDING_QUESTIONS) || '[]');
        pending.push({ id: Date.now().toString(), question: input, timestamp: new Date() });
        localStorage.setItem(DB_KEYS.PENDING_QUESTIONS, JSON.stringify(pending));
      }

      // Save chat history
      const currentChat = JSON.parse(localStorage.getItem('restaurant_chat_logs') || '[]');
      currentChat.push({ user: user.name, text: input, bot: response.text, timestamp: new Date() });
      localStorage.setItem('restaurant_chat_logs', JSON.stringify(currentChat));

      if (response.intent === 'complaint') {
        onAddTicket("Customer Complaint via Chat", input);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/bot-avatar.png" alt="Bot" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight">Gusto Assistant</h3>
            <span className="text-orange-100 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-orange-100 rounded-full animate-pulse" />
              Online | Powered by GenAI
            </span>
          </div>
        </div>
        <button className="text-white/80 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4 shadow-sm",
              msg.sender === 'user' 
                ? "bg-orange-600 text-white rounded-tr-none" 
                : cn(
                    "bg-white text-gray-800 border border-gray-100 rounded-tl-none",
                    msg.isWarning && "border-red-500 bg-red-50 text-red-900 font-bold"
                  )
            )}>
              {msg.isWarning && <div className="flex items-center gap-2 mb-2 text-red-600 uppercase text-[10px] font-black tracking-tighter"><AlertCircle className="w-3 h-3"/> System Security Protocol</div>}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              
              {!msg.isWarning && msg.sender === 'bot' && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400">Helpful?</span>
                  <button onClick={() => alert("Thanks for the feedback!")} className="text-xs hover:scale-110">👍</button>
                  <button onClick={() => alert("Sorry about that, we'll improve!")} className="text-xs hover:scale-110">👎</button>
                </div>
              )}

              <div className={cn(
                "text-[10px] mt-1 opacity-70",
                msg.sender === 'user' ? "text-right" : "text-left"
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 flex gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ user, orders, bookings, tickets, faqs, onAddTicket, onAddBooking, onOrderToTable }: { 
  user: UserData, 
  orders: Order[], 
  bookings: Booking[],
  tickets: Ticket[],
  faqs: FAQ[],
  onAddTicket: (subject: string, desc: string) => void,
  onAddBooking: (date: string, time: string, guests: number) => void,
  onOrderToTable: (item: string) => void
}) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Table Order Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Table {selectedBooking.tableNumber}</h3>
                <p className="text-sm text-gray-500">{selectedBooking.date} at {selectedBooking.time}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Active Orders</h4>
              <div className="bg-gray-50 rounded-2xl p-4 min-h-[100px]">
                {selectedBooking.tableOrders && selectedBooking.tableOrders.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedBooking.tableOrders.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-400 py-4 text-sm">No items ordered for this table yet.</p>
                )}
              </div>
              <button 
                onClick={() => {
                  const item = prompt("Add something to this table:");
                  if(item) onOrderToTable(item);
                  setSelectedBooking(null);
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white p-8 rounded-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Book a Table</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onAddBooking(
                formData.get('date') as string,
                formData.get('time') as string,
                Number(formData.get('guests'))
              );
              setShowBookingModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input name="date" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input name="time" type="time" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guests</label>
                <input name="guests" type="number" min="1" max="20" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg">Confirm Booking</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Left Column: Stats & History */}
      <div className="lg:col-span-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome, {user.name}</h2>
            <p className="text-gray-500">Track your orders and manage reservations effortlessly.</p>
          </motion.div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const item = prompt("What would you like to order for your table?");
                if(item) onOrderToTable(item);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 w-fit"
            >
              <Utensils className="w-5 h-5 text-orange-400" />
              Order to Table
            </button>
            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 w-fit"
            >
              <Calendar className="w-5 h-5" />
              Book a Table
            </button>
          </div>
        </header>

        {/* Recent Orders */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              Recent Orders
            </h3>
            <button className="text-orange-600 font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-white transition-colors">
                    <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{order.items.join(', ')}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{order.date}</span>
                      <span className="text-xs font-bold text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                  order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                  {order.status === 'Delivered' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Tickets */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-red-600" />
              Support & Feedback
            </h3>
            <button 
              onClick={() => {
                const sub = prompt("Subject of Complaint:");
                const desc = prompt("Describe your issue:");
                if(sub && desc) onAddTicket(sub, desc);
              }}
              className="text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors border border-red-100"
            >
              Raise Complaint Ticket
            </button>
          </div>
          
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{ticket.subject}</h4>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded",
                    ticket.status === 'Resolved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{ticket.description}</p>
                {ticket.status === 'Resolved' && (
                  <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
                    <span className="text-xs text-gray-400">Rate this resolution:</span>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => alert(`Rated ${star} stars!`)} className="text-yellow-400 hover:scale-110 transition-transform">★</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {tickets.length === 0 && <p className="text-center text-gray-400 py-4">No active tickets.</p>}
          </div>
        </section>

        {/* Upcoming Bookings */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Your Reservations (Click to View Orders)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map(booking => (
              <button 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 relative overflow-hidden group text-left transition-all hover:ring-2 hover:ring-blue-400"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar className="w-12 h-12 text-blue-900" />
                </div>
                <h4 className="font-bold text-blue-900">Table {booking.tableNumber} - {booking.guests} Guests</h4>
                <p className="text-sm text-blue-700 mt-1">{booking.date} at {booking.time}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider">
                    {booking.status}
                  </span>
                  {booking.tableOrders && booking.tableOrders.length > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                      {booking.tableOrders.length} ITEMS ORDERED
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column: Chatbot */}
      <div className="lg:col-span-4 space-y-6">
        <div className="sticky top-24">
          <Chatbot 
            user={user} 
            orders={orders} 
            bookings={bookings} 
            faqs={faqs}
            onAddTicket={onAddTicket}
          />
          <div className="mt-6 bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <h4 className="font-bold text-orange-900 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Support Tip
            </h4>
            <p className="text-xs text-orange-800 leading-relaxed">
              Facing an issue? Our AI chatbot can resolve most queries instantly. If not, it will automatically create a priority ticket for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ tickets, faqs, onUpdateTicket, onUpdateFaqs }: { 
  tickets: Ticket[], 
  faqs: FAQ[], 
  onUpdateTicket: (id: string, status: Ticket['status']) => void,
  onUpdateFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'faqs' | 'chat_logs' | 'pending_q'>('overview');
  const [pendingQs, setPendingQs] = useState<PendingQuestion[]>(() => {
    return JSON.parse(localStorage.getItem(DB_KEYS.PENDING_QUESTIONS) || '[]');
  });

  const stats = [
    { label: 'Active Tickets', value: tickets.filter(t => t.status !== 'Resolved').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Resolved Today', value: tickets.filter(t => t.status === 'Resolved').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Qs', value: pendingQs.length, icon: RefreshCcw, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Conversations', value: JSON.parse(localStorage.getItem('restaurant_chat_logs') || '[]').length, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const handleAnswerQuestion = (id: string, question: string) => {
    const answer = prompt(`Answer for: "${question}"`);
    if (answer) {
      onUpdateFaqs(prev => [...prev, { question, answer, category: 'general' }]);
      const updated = pendingQs.filter(q => q.id !== id);
      setPendingQs(updated);
      localStorage.setItem(DB_KEYS.PENDING_QUESTIONS, JSON.stringify(updated));
    }
  };

  const chartData = [
    { name: 'Mon', queries: 40, tickets: 4 },
    { name: 'Tue', queries: 30, tickets: 2 },
    { name: 'Wed', queries: 55, tickets: 8 },
    { name: 'Thu', queries: 45, tickets: 5 },
    { name: 'Fri', queries: 60, tickets: 10 },
    { name: 'Sat', queries: 80, tickets: 12 },
    { name: 'Sun', queries: 75, tickets: 7 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold text-gray-900">Admin Control Center</h2>
        <p className="text-gray-500">Monitor chatbot performance and manage customer escalations.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'overview', icon: BarChart3, label: 'Overview' },
          { id: 'tickets', icon: ClipboardList, label: 'Tickets' },
          { id: 'pending_q', icon: RefreshCcw, label: 'Pending Qs' },
          { id: 'chat_logs', icon: MessageCircle, label: 'Chat Logs' },
          { id: 'faqs', icon: MessageSquare, label: 'Knowledge Base' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all",
              activeTab === tab.id 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.label} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <h4 className="text-3xl font-black text-gray-900">{stat.value}</h4>
                <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Interaction Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="queries" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="tickets" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Query Categories</h3>
              <div className="space-y-4">
                {[
                  { label: 'Bookings', percentage: 45, color: 'bg-orange-500' },
                  { label: 'Order Status', percentage: 30, color: 'bg-blue-500' },
                  { label: 'Complaints', percentage: 15, color: 'bg-red-500' },
                  { label: 'Menu Inquiries', percentage: 10, color: 'bg-green-500' },
                ].map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat.label}</span>
                      <span className="text-gray-500">{cat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending_q' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Unanswered Questions</h3>
            <p className="text-xs text-gray-500">Answer these to automatically train the AI</p>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingQs.map((q) => (
              <div key={q.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-900">{q.question}</p>
                  <p className="text-[10px] text-gray-400">Captured on {new Date(q.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleAnswerQuestion(q.id, q.question)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
                >
                  Provide Answer
                </button>
              </div>
            ))}
            {pendingQs.length === 0 && (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                No pending questions. The AI is fully trained!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat_logs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">User Interaction History</h3>
            <button 
              onClick={() => { localStorage.removeItem('restaurant_chat_logs'); window.location.reload(); }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3"/> Clear Logs
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {JSON.parse(localStorage.getItem('restaurant_chat_logs') || '[]').reverse().map((log: any, i: number) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-sm text-gray-900">{log.user}</span>
                  <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 bg-white p-2 rounded-lg border border-gray-100 inline-block">User: {log.text}</p>
                  <div className="flex justify-start">
                    <p className="text-sm text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-100 inline-block">AI: {log.bot}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => alert(`Replying to ${log.user}...`)} className="text-xs font-bold text-blue-600 hover:underline">Reply Directly</button>
                  <button onClick={() => alert(`Warning sent to ${log.user}`)} className="text-xs font-bold text-red-600 hover:underline">Send Warning</button>
                </div>
              </div>
            ))}
            {JSON.parse(localStorage.getItem('restaurant_chat_logs') || '[]').length === 0 && (
              <div className="p-12 text-center text-gray-400">No chat logs recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Active Escalations</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500" 
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-black">Ticket ID</th>
                <th className="px-6 py-4 font-black">User</th>
                <th className="px-6 py-4 font-black">Subject</th>
                <th className="px-6 py-4 font-black">Priority</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{ticket.userName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide",
                      ticket.priority === 'High' ? "bg-red-100 text-red-700" : 
                      ticket.priority === 'Medium' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={ticket.status}
                        onChange={(e) => onUpdateTicket(ticket.id, e.target.value as any)}
                        className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer font-medium"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onUpdateTicket(ticket.id, 'Resolved')}
                      disabled={ticket.status === 'Resolved'}
                      className="text-orange-600 hover:text-orange-700 font-bold text-sm disabled:text-gray-300"
                    >
                      {ticket.status === 'Resolved' ? 'Completed' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all group shadow-sm relative">
              <button 
                onClick={() => onUpdateFaqs(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {faq.category}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 leading-snug">{faq.question}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
          <button 
            onClick={() => {
              const q = prompt("Enter Question:");
              const a = prompt("Enter Answer:");
              if(q && a) onUpdateFaqs(prev => [...prev, { question: q, answer: a, category: 'general' }]);
            }}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-orange-600" />
            </div>
            <span className="font-bold text-gray-400 group-hover:text-orange-600">Train AI with New FAQ</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.TICKETS);
    if (!saved) return INITIAL_TICKETS;
    return JSON.parse(saved).map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }));
  });
  const [faqs, setFaqs] = useState<FAQ[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.FAQS);
    return saved ? JSON.parse(saved) : MOCK_FAQS;
  });

  useEffect(() => {
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.FAQS, JSON.stringify(faqs));
  }, [faqs]);

  const handleLogin = (role: Role) => {
    const defaultName = role === 'customer' ? 'Guest User' : 'System Admin';
    const defaultEmail = role === 'customer' ? 'guest@restaurant.com' : 'admin@restaurant.com';
    
    // Simulate lookup in "database" (localStorage)
    const storedUser = localStorage.getItem('current_user');
    const userData = storedUser ? JSON.parse(storedUser) : {
      id: role === 'customer' ? 'cust_1' : 'admin_1',
      name: defaultName,
      email: defaultEmail,
      role: role
    };

    setUser(userData);
  };

  const handleLogout = () => setUser(null);

  const addTicket = (subject: string, description: string) => {
    const newTicket: Ticket = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      userId: user?.id || 'anon',
      userName: user?.name || 'Anonymous',
      subject,
      description,
      status: 'Open',
      priority: 'High',
      createdAt: new Date()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = (id: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addBooking = (date: string, time: string, guests: number) => {
    // Conflict Check: Check if table already booked for this date and time
    const isConflict = bookings.some(b => b.date === date && b.time === time);
    
    if (isConflict) {
      alert(`⚠️ BOOKING DENIED: This time slot (${time} on ${date}) is already reserved by another guest. Please choose a different time.`);
      return;
    }

    const newBooking: Booking = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      date,
      time,
      guests,
      status: 'Confirmed',
      tableNumber: Math.floor(Math.random() * 20) + 1,
      tableOrders: []
    };
    setBookings(prev => [...prev, newBooking]);
    alert(`Success! Table ${newBooking.tableNumber} is reserved for you.`);
  };

  const addOrderToTable = (item: string) => {
    // Find user's latest active booking
    const activeBookingIndex = [...bookings].reverse().findIndex(b => b.status === 'Confirmed');
    
    if (activeBookingIndex === -1) {
      alert("No active table reservation found. Please book a table first!");
      return;
    }

    const actualIndex = bookings.length - 1 - activeBookingIndex;
    const updatedBookings = [...bookings];
    const currentOrders = updatedBookings[actualIndex].tableOrders || [];
    updatedBookings[actualIndex] = {
      ...updatedBookings[actualIndex],
      tableOrders: [...currentOrders, item]
    };
    
    setBookings(updatedBookings);
    alert(`Added ${item} to your Table ${updatedBookings[actualIndex].tableNumber} order!`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar user={user} onLogout={handleLogout} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {user.role === 'customer' ? (
                <CustomerDashboard 
                  user={user} 
                  orders={orders} 
                  bookings={bookings} 
                  tickets={tickets.filter(t => t.userId === user.id)}
                  faqs={faqs}
                  onAddTicket={addTicket}
                  onAddBooking={addBooking}
                  onOrderToTable={addOrderToTable}
                />
              ) : (
                <AdminDashboard 
                  tickets={tickets} 
                  faqs={faqs} 
                  onUpdateTicket={updateTicketStatus}
                  onUpdateFaqs={setFaqs}
                />
              )}
            </main>

            <footer className="mt-20 border-t border-gray-200 py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-900">GustoBot Pro</span>
                </div>
                <div className="text-gray-500 text-sm">
                  © 2024 GustoBot AI Restaurant Support System. Built with GenAI.
                </div>
                <div className="flex gap-6 text-sm font-medium text-gray-500">
                  <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
                  <a href="#" className="hover:text-orange-600 transition-colors">Support</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
