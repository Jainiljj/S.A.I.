import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Copy, Check } from 'lucide-react';

const API_BASE = '/api';

export default function AIPromptTab() {
  const [form, setForm] = useState({ pose: '', color: '', print: '', texture: '' });
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-prompt`, form);
      setPrompt(res.data.prompt);
    } catch (error) {
      console.error(error);
      setPrompt("Error generating prompt. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-navy-700 mb-6 flex items-center gap-2">
          <Sparkles className="text-amber-500" /> AI Prompt Studio
        </h2>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 pl-1">Pose Description</label>
            <input 
              required
              placeholder="e.g. walking on ramp, studio pose" 
              className="input-field" 
              value={form.pose} 
              onChange={e => setForm({...form, pose: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 pl-1">Saree Color</label>
            <input 
              required
              placeholder="e.g. maroon, deep teal" 
              className="input-field" 
              value={form.color} 
              onChange={e => setForm({...form, color: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 pl-1">Print Style</label>
            <input 
              required
              placeholder="e.g. paisley, floral, solid" 
              className="input-field" 
              value={form.print} 
              onChange={e => setForm({...form, print: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 pl-1">Fabric & Texture</label>
            <input 
              required
              placeholder="e.g. silk zari, cotton blend" 
              className="input-field" 
              value={form.texture} 
              onChange={e => setForm({...form, texture: e.target.value})} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-lg shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            {loading ? 'Generating...' : 'Generate Prompt'}
          </button>
        </form>
      </div>

      <div className="card bg-navy-900 border-navy-800 text-white min-h-400 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-teal-500 rounded-full blur-3xl opacity-10 pointer-events-none transform translate-x-1-2 -translate-y-1-2"></div>
        
        <h2 className="text-xl font-bold mb-4 opacity-90 flex items-center gap-2">
          Grok Output
        </h2>
        
        <div className="flex-1 bg-navy-800-50 rounded-xl p-5 border border-navy-700-50 overflow-y-auto font-mono text-sm leading-relaxed text-teal-50">
          {prompt ? (
            <p>{prompt}</p>
          ) : (
            <div className="h-full flex items-center justify-center text-navy-400 italic">
              Fill the form and generate to see the professional prompt here.
            </div>
          )}
        </div>

        {prompt && (
          <button 
            onClick={handleCopy}
            className="mt-4 bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        )}
      </div>
    </div>
  );
}
