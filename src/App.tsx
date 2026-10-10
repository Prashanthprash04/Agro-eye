import React, { useState, useRef } from 'react';
import { 
  Leaf, 
  Mic, 
  ChevronRight, 
  ArrowLeft, 
  Camera, 
  Upload, 
  Sprout, 
  ScanLine, 
  Calculator, 
  Volume2, 
  MessageCircle,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzePlantDisease, analyzeSoil, generateSpeech, chatWithMitr } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Page = 'home' | 'about' | 'dashboard' | 'disease' | 'soil' | 'yield';
type Language = 'English' | 'Hindi' | 'Kannada' | 'Telugu' | 'Tamil';

const languages: Language[] = ['English', 'Hindi', 'Kannada', 'Telugu', 'Tamil'];

const translations = {
  English: {
    title: 'AGROEYE',
    subtitle: 'AI Smart Agriculture Assistant',
    start: 'Start',
    next: 'Next',
    back: 'Back',
    disease: 'Plant Disease Detection',
    soil: 'Crop Recommendation',
    yield: 'Yield Estimation',
    aboutText: 'AGROEYE uses advanced AI to help you identify plant diseases, understand your soil, and estimate your harvest. Just take a photo or enter your land details to get started.',
    mitr: 'AI Mitr',
    mitrGreeting: 'Hello! I am your AI Mitr. How can I help you today?',
    bimari: 'Disease',
    mitti: 'Soil',
    health: 'Health Status',
    infection: 'Infection',
    traditional: 'Traditional (Ayurvedic)',
    modern: 'Modern (Agri-Science)',
    soilType: 'Soil Type',
    moisture: 'Moisture Percentage',
    weather: 'Weather Condition',
    suitableCrops: 'Suitable Crops',
    acres: 'Land Area (Acres)',
    calculate: 'Calculate Yield',
    expectedYield: 'Expected Yield',
    speak: 'Listen',
    upload: 'Upload Image',
    scan: 'Scan Plant',
  },
  Hindi: {
    title: 'AGROEYE',
    subtitle: 'एआई स्मार्ट कृषि सहायक',
    start: 'शुरू करें',
    next: 'अगला',
    back: 'पीछे',
    disease: 'पौधों की बीमारी की पहचान',
    soil: 'फसल की सिफारिश',
    yield: 'पैदावार का अनुमान',
    aboutText: 'AGROEYE पौधों की बीमारियों की पहचान करने, आपकी मिट्टी को समझने और आपकी फसल का अनुमान लगाने में मदद करने के लिए उन्नत एआई का उपयोग करता है। शुरू करने के लिए बस एक फोटो लें या अपने जमीन का विवरण दर्ज करें।',
    mitr: 'एआई मित्र',
    mitrGreeting: 'नमस्ते! मैं आपका एआई मित्र हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
    bimari: 'बीमारी',
    mitti: 'मिट्टी',
    health: 'स्वास्थ्य स्थिति',
    infection: 'संक्रमण',
    traditional: 'पारंपरिक (आयुर्वेदिक)',
    modern: 'आधुनिक (कृषि-विज्ञान)',
    soilType: 'मिट्टी का प्रकार',
    moisture: 'नमी का प्रतिशत',
    weather: 'मौसम की स्थिति',
    suitableCrops: 'उपयुक्त फसलें',
    acres: 'जमीन का क्षेत्रफल (एकड़)',
    calculate: 'पैदावार की गणना करें',
    expectedYield: 'अपेक्षित पैदावार',
    speak: 'सुनें',
    upload: 'छवि अपलोड करें',
    scan: 'पौधे को स्कैन करें',
  },
  Kannada: { title: 'AGROEYE', subtitle: 'AI ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ', start: 'ಪ್ರಾರಂಭಿಸಿ', next: 'ಮುಂದೆ', back: 'ಹಿಂದೆ', disease: 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆ', soil: 'ಬೆಳೆ ಶಿಫಾರಸು', yield: 'ಇಳುವರಿ ಅಂದಾಜು', aboutText: 'AGROEYE ಸಸ್ಯ ರೋಗಗಳನ್ನು ಗುರುತಿಸಲು, ನಿಮ್ಮ ಮಣ್ಣನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ನಿಮ್ಮ ಸುಗ್ಗಿಯನ್ನು ಅಂದಾಜು ಮಾಡಲು ಸುಧಾರಿತ AI ಅನ್ನು ಬಳಸುತ್ತದೆ.', mitr: 'AI ಮಿತ್ರ', mitrGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಮಿತ್ರ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?', bimari: 'ರೋಗ', mitti: 'ಮಣ್ಣು', speak: 'ಕೇಳಿ' },
  Telugu: { title: 'AGROEYE', subtitle: 'AI స్మార్ట్ అగ్రికల్చర్ అసిస్టెంట్', start: 'ప్రారంభించండి', next: 'తదుపరి', back: 'వెనుకకు', disease: 'మొక్కల వ్యాధి గుర్తింపు', soil: 'పంట సిఫార్సు', yield: 'దిగుబడి అంచనా', aboutText: 'మొక్కల వ్యాధులను గుర్తించడానికి, మీ నేలను అర్థం చేసుకోవడానికి మరియు మీ పంటను అంచనా వేయడానికి AGROEYE అధునాతన AIని ఉపయోగిస్తుంది.', mitr: 'AI మిత్ర', mitrGreeting: 'నమస్కారం! నేను మీ AI మిత్ర. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?', bimari: 'వ్యాధి', mitti: 'మట్టి', speak: 'వినండి' },
  Tamil: { title: 'AGROEYE', subtitle: 'AI ஸ்மார்ட் விவசாய உதவியாளர்', start: 'தொடங்கு', next: 'அடுத்து', back: 'பின்னால்', disease: 'தாவர நோய் கண்டறிதல்', soil: 'பயிர் பரிந்துரை', yield: 'மகசூல் மதிப்பீடு', aboutText: 'தாவர நோய்களைக் கண்டறியவும், உங்கள் மண்ணைப் புரிந்துகொள்ளவும், உங்கள் அறுவடையை மதிப்பிடவும் AGROEYE மேம்பட்ட AI ஐப் பயன்படுத்துகிறது.', mitr: 'AI மித்ரா', mitrGreeting: 'வணக்கம்! நான் உங்கள் AI மித்ரா. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?', bimari: 'நோய்', mitti: 'மண்', speak: 'கேளுங்கள்' },
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [lang, setLang] = useState<Language>('English');
  const [isMitrOpen, setIsMitrOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'mitr', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const t = translations[lang] || translations.English;

  const navigate = (to: Page) => setPage(to);

  const handleBack = () => {
    if (['disease', 'soil', 'yield'].includes(page)) {
      setPage('dashboard');
    } else if (page === 'dashboard') {
      setPage('home');
    } else if (page === 'about') {
      setPage('home');
    }
  };

  return (
    <div className="min-h-screen font-sans text-stone-900 selection:bg-emerald-200">
      <AnimatePresence mode="wait">
        {page === 'home' && <HomePage key="home" onStart={() => navigate('about')} lang={lang} setLang={setLang} t={t} />}
        {page === 'about' && <AboutPage key="about" onNext={() => navigate('dashboard')} t={t} />}
        {page === 'dashboard' && <Dashboard key="dashboard" onSelect={setPage} onBack={handleBack} t={t} />}
        {page === 'disease' && <DiseasePage key="disease" onBack={handleBack} t={t} lang={lang} />}
        {page === 'soil' && <SoilPage key="soil" onBack={handleBack} t={t} lang={lang} />}
        {page === 'yield' && <YieldPage key="yield" onBack={handleBack} t={t} />}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMitrOpen(!isMitrOpen)}
          className="w-14 h-14 bg-[#C8E6C9] text-[#1B5E20] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-[#A5D6A7]"
        >
          {isMitrOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMitrOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 z-50"
          >
            <div className="bg-[#C8E6C9] p-4 text-[#1B5E20] flex items-center gap-2 border-b border-[#A5D6A7]">
              <div className="w-8 h-8 bg-[#1B5E20]/10 rounded-full flex items-center justify-center">
                <Sprout size={18} />
              </div>
              <span className="font-bold">{t.mitr}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {chatHistory.length === 0 && (
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-stone-100 text-sm">
                  {t.mitrGreeting}
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-lg text-sm max-w-[85%]",
                  msg.role === 'user' 
                    ? "bg-[#FBC02D] text-stone-900 ml-auto rounded-tr-none" 
                    : "bg-white text-stone-900 mr-auto rounded-tl-none border border-stone-100 shadow-sm"
                )}>
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-center">
                  <Loader2 className="animate-spin text-[#2E7D32]" size={20} />
                </div>
              )}
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim() || isChatLoading) return;
                const userMsg = chatInput;
                setChatInput('');
                setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
                setIsChatLoading(true);
                try {
                  const reply = await chatWithMitr(userMsg, lang, chatHistory);
                  setChatHistory(prev => [...prev, { role: 'mitr', text: reply || '...' }]);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsChatLoading(false);
                }
              }}
              className="p-3 border-t border-stone-100 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type here..."
                className="flex-1 bg-stone-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8E6C9]"
              />
              <button type="submit" className="text-[#1B5E20] hover:scale-110 transition-transform">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomePage({ onStart, lang, setLang, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-[#C8E6C9] rounded-full flex items-center justify-center shadow-xl border-4 border-[#A5D6A7]">
          <Leaf className="text-[#1B5E20]" size={64} />
          <div className="absolute inset-0 border-4 border-[#FBC02D] rounded-full animate-pulse" />
        </div>
      </div>

      <h1 className="text-5xl font-black tracking-tighter text-[#1B5E20] mb-2">
        {t.title}
      </h1>
      <p className="text-stone-600 font-medium mb-12">
        {t.subtitle}
      </p>

      <div className="w-full max-w-xs space-y-6">
        <div className="relative">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="w-full appearance-none bg-[#C8E6C9] border-2 border-[#A5D6A7] rounded-2xl px-6 py-4 font-bold text-[#1B5E20] focus:outline-none focus:border-[#4CAF50] transition-colors cursor-pointer"
          >
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B5E20]/40">
            <ChevronRight size={20} className="rotate-90" />
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-[#C8E6C9] text-[#1B5E20] rounded-2xl py-5 font-black text-xl shadow-lg hover:bg-[#A5D6A7] transition-all flex items-center justify-center gap-3 group border border-[#A5D6A7]"
        >
          {t.start}
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex justify-center">
          <button className="w-20 h-20 bg-[#C8E6C9] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border border-[#A5D6A7]">
            <Mic size={32} className="text-[#1B5E20]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AboutPage({ onNext, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-screen p-8"
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-100 rounded-2xl text-[#2E7D32]">
            <ScanLine size={40} />
          </div>
          <div className="p-4 bg-yellow-100 rounded-2xl text-[#FBC02D]">
            <Sprout size={40} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-[#1B5E20]">How AI Helps You</h2>
        <p className="text-stone-600 leading-relaxed text-lg">
          {t.aboutText}
        </p>

        <div className="pt-8 border-t border-stone-200 w-full">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Supporting SDG Goals</p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-[#E5243B] rounded-lg flex items-center justify-center text-white font-bold text-lg">2</div>
              <span className="text-[10px] font-bold text-stone-500">Zero Hunger</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-[#4C9F38] rounded-lg flex items-center justify-center text-white font-bold text-lg">15</div>
              <span className="text-[10px] font-bold text-stone-500">Life on Land</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-[#3F7E44] rounded-lg flex items-center justify-center text-white font-bold text-lg">13</div>
              <span className="text-[10px] font-bold text-stone-500">Climate Action</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-md mx-auto bg-[#C8E6C9] text-[#1B5E20] rounded-2xl py-5 font-black text-xl shadow-lg hover:bg-[#A5D6A7] transition-all flex items-center justify-center gap-3 border border-[#A5D6A7]"
      >
        {t.next}
        <ChevronRight />
      </button>
    </motion.div>
  );
}

function Dashboard({ onSelect, onBack, t }: any) {
  const menuItems = [
    { id: 'disease', title: t.disease, icon: <ScanLine />, color: 'bg-emerald-500', label: t.bimari },
    { id: 'soil', title: t.soil, icon: <Sprout />, color: 'bg-yellow-500', label: t.mitti },
    { id: 'yield', title: t.yield, icon: <Calculator />, color: 'bg-blue-500', label: 'Yield' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-[#1B5E20]/10 rounded-full transition-colors text-[#1B5E20]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-[#1B5E20]">{t.title} Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Page)}
            className="bg-[#C8E6C9]/80 backdrop-blur-sm p-6 rounded-3xl shadow-md border border-[#A5D6A7] flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all text-left group hover:bg-[#A5D6A7]"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-inner", item.color)}>
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B5E20]/60">{item.label}</span>
              <h3 className="text-xl font-bold text-[#1B5E20]">{item.title}</h3>
            </div>
            <ChevronRight className="text-[#1B5E20]/30 group-hover:text-[#1B5E20] transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function DiseasePage({ onBack, t, lang }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<'traditional' | 'modern'>('traditional');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyze(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async (img: string) => {
    setLoading(true);
    try {
      const data = await analyzePlantDisease(img, lang);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speak = async () => {
    if (!result) return;
    const text = `${result.healthStatus}. ${result.diseaseName}. ${result.infectionPercentage}. ${tab === 'traditional' ? result.traditionalSolutions : result.modernSolutions}`;
    const audioBase64 = await generateSpeech(text);
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-[#1B5E20]/10 rounded-full transition-colors text-[#1B5E20]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#1B5E20]">{t.disease}</h2>
      </div>

      {!image ? (
        <div className="max-w-md mx-auto grid grid-cols-1 gap-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#C8E6C9] p-8 rounded-3xl shadow-md border-2 border-dashed border-[#A5D6A7] flex flex-col items-center justify-center gap-4 hover:bg-[#A5D6A7] transition-all group"
          >
            <div className="w-20 h-20 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform">
              <Upload size={40} />
            </div>
            <span className="text-xl font-bold text-[#1B5E20]">{t.upload}</span>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#C8E6C9] p-8 rounded-3xl shadow-md border-2 border-dashed border-[#A5D6A7] flex flex-col items-center justify-center gap-4 hover:bg-[#A5D6A7] transition-all group"
          >
            <div className="w-20 h-20 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform">
              <Camera size={40} />
            </div>
            <span className="text-xl font-bold text-[#1B5E20]">{t.scan}</span>
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-square">
            <img src={image} className="w-full h-full object-cover" alt="Plant" />
            {loading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin mb-2" size={40} />
                <p className="font-bold">Analyzing...</p>
              </div>
            )}
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-md space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t.health}</h3>
                  <p className={cn("text-2xl font-black", result.healthStatus.toLowerCase().includes('healthy') ? "text-emerald-600" : "text-red-600")}>
                    {result.healthStatus}
                  </p>
                </div>
                <button onClick={speak} className="p-3 bg-[#C8E6C9] rounded-full text-[#1B5E20] hover:bg-[#A5D6A7] transition-colors border border-[#A5D6A7]">
                  <Volume2 size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-stone-400 uppercase mb-1">{t.bimari}</h4>
                  <p className="font-bold text-stone-800">{result.diseaseName}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-stone-400 uppercase mb-1">{t.infection}</h4>
                  <p className="font-bold text-stone-800">{result.infectionPercentage}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex p-1 bg-stone-100 rounded-xl">
                  <button 
                    onClick={() => setTab('traditional')}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", tab === 'traditional' ? "bg-[#C8E6C9] shadow-sm text-[#1B5E20] border border-[#A5D6A7]" : "text-stone-500")}
                  >
                    {t.traditional}
                  </button>
                  <button 
                    onClick={() => setTab('modern')}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", tab === 'modern' ? "bg-[#C8E6C9] shadow-sm text-[#1B5E20] border border-[#A5D6A7]" : "text-stone-500")}
                  >
                    {t.modern}
                  </button>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl text-stone-700 text-sm leading-relaxed border border-emerald-100">
                  {tab === 'traditional' ? result.traditionalSolutions : result.modernSolutions}
                </div>
              </div>

              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="w-full py-4 bg-[#C8E6C9] text-[#1B5E20] rounded-2xl font-bold hover:bg-[#A5D6A7] transition-colors border border-[#A5D6A7]"
              >
                Scan Another
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function SoilPage({ onBack, t, lang }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyze(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async (img: string) => {
    setLoading(true);
    try {
      const data = await analyzeSoil(img, lang);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-[#1B5E20]/10 rounded-full transition-colors text-[#1B5E20]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#1B5E20]">{t.soil}</h2>
      </div>

      {!image ? (
        <div className="max-w-md mx-auto grid grid-cols-1 gap-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#C8E6C9] p-8 rounded-3xl shadow-md border-2 border-dashed border-[#A5D6A7] flex flex-col items-center justify-center gap-4 hover:bg-[#A5D6A7] transition-all group"
          >
            <div className="w-20 h-20 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform">
              <Upload size={40} />
            </div>
            <span className="text-xl font-bold text-[#1B5E20]">{t.upload}</span>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#C8E6C9] p-8 rounded-3xl shadow-md border-2 border-dashed border-[#A5D6A7] flex flex-col items-center justify-center gap-4 hover:bg-[#A5D6A7] transition-all group"
          >
            <div className="w-20 h-20 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] group-hover:scale-110 transition-transform">
              <Camera size={40} />
            </div>
            <span className="text-xl font-bold text-[#1B5E20]">{t.scan}</span>
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-square">
            <img src={image} className="w-full h-full object-cover" alt="Soil" />
            {loading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin mb-2" size={40} />
                <p className="font-bold">Analyzing Soil...</p>
              </div>
            )}
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-md space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t.soilType}</h3>
                  <p className="text-xl font-black text-stone-800">{result.soilType}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">{t.moisture}</h3>
                    <p className="text-lg font-black text-emerald-800">{result.moisturePercentage}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">{t.weather}</h3>
                    <p className="text-lg font-black text-yellow-800">{result.weatherCondition}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">{t.suitableCrops}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedCrops.map((crop: string, i: number) => (
                    <span key={i} className="bg-emerald-100 text-[#2E7D32] px-4 py-2 rounded-full text-sm font-bold border border-emerald-200">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="w-full py-4 bg-[#C8E6C9] text-[#1B5E20] rounded-2xl font-bold hover:bg-[#A5D6A7] transition-colors border border-[#A5D6A7]"
              >
                Scan Another
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function YieldPage({ onBack, t }: any) {
  const [acres, setAcres] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!acres) return;
    setLoading(true);
    try {
      const res = await fetch('/api/calculate-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acres })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-[#1B5E20]/10 rounded-full transition-colors text-[#1B5E20]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#1B5E20]">{t.yield}</h2>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-500">{t.acres}</label>
            <input 
              type="number" 
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-4 py-4 focus:outline-none focus:border-stone-900 transition-colors"
              placeholder="e.g. 5"
            />
          </div>
          <button 
            onClick={calculate}
            disabled={loading || !acres}
            className="w-full bg-[#C8E6C9] text-[#1B5E20] rounded-2xl py-5 font-black text-xl shadow-lg hover:bg-[#A5D6A7] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-[#A5D6A7]"
          >
            {loading ? <Loader2 className="animate-spin" /> : t.calculate}
          </button>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FBC02D] p-8 rounded-3xl shadow-lg text-center space-y-2"
          >
            <h3 className="text-stone-900/60 font-bold uppercase tracking-widest text-sm">{t.expectedYield}</h3>
            <p className="text-5xl font-black text-stone-900">
              {result.expectedYield} <span className="text-2xl">{result.unit}</span>
            </p>
            <p className="text-stone-900/60 font-medium">Area: {result.acres} Acres</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
