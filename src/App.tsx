/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Code, Cpu, Server, Lock, Mail, ExternalLink, Activity, MessageCircle, Send, ChevronRight, Settings, X, Plus, Trash2 } from 'lucide-react';

type SocialLink = { id: string; label: string; url: string };

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'whatsapp' | 'telegram'>('none');
  
  const defaultLinks = {
    email: 'mailto:your-email@example.com',
    whatsapp: [
      { id: 'w1', label: 'WhatsApp Channel 1', url: '' },
      { id: 'w2', label: 'Contact Admin', url: '' }
    ] as SocialLink[],
    telegram: [
      { id: 't1', label: 'Telegram Channel', url: '' },
      { id: 't2', label: 'Contact Admin', url: '' }
    ] as SocialLink[]
  };
  
  const [links, setLinks] = useState(defaultLinks);

  useEffect(() => {
    const savedLinks = localStorage.getItem('portfolio_links_v2');
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse links");
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey === 'ETHICAL') {
      setIsAuthenticated(true);
      setAuthKey('');
    } else {
      alert('Invalid access key');
    }
  };

  const handleSaveLinks = () => {
    localStorage.setItem('portfolio_links_v2', JSON.stringify(links));
    setIsAdminOpen(false);
  };

  const updateLink = (platform: 'whatsapp' | 'telegram', id: string, field: 'label' | 'url', value: string) => {
    setLinks(prev => ({
      ...prev,
      [platform]: prev[platform].map(link => link.id === id ? { ...link, [field]: value } : link)
    }));
  };

  const addLink = (platform: 'whatsapp' | 'telegram') => {
    setLinks(prev => ({
      ...prev,
      [platform]: [...prev[platform], { id: Date.now().toString(), label: 'New Link', url: '' }]
    }));
  };

  const removeLink = (platform: 'whatsapp' | 'telegram', id: string) => {
    setLinks(prev => ({
      ...prev,
      [platform]: prev[platform].filter(link => link.id !== id)
    }));
  };

  const skills = [
    { name: 'Penetration Testing', icon: <Shield className="w-5 h-5" />, level: 90, color: 'from-cyan-400 to-blue-500' },
    { name: 'Network Security', icon: <Server className="w-5 h-5" />, level: 85, color: 'from-fuchsia-400 to-purple-600' },
    { name: 'Cryptography', icon: <Lock className="w-5 h-5" />, level: 75, color: 'from-emerald-400 to-cyan-500' },
    { name: 'Reverse Engineering', icon: <Cpu className="w-5 h-5" />, level: 70, color: 'from-orange-400 to-pink-500' },
    { name: 'Secure Coding', icon: <Code className="w-5 h-5" />, level: 95, color: 'from-blue-400 to-indigo-500' },
    { name: 'Exploit Dev', icon: <Activity className="w-5 h-5" />, level: 80, color: 'from-pink-400 to-rose-500' },
  ];

  const projects = [
    {
      title: 'NetScanner Pro',
      description: 'An open-source network vulnerability scanner built with Python and Go. Features concurrent port scanning and CVE database integration.',
      tags: ['Python', 'Go', 'Networking'],
    },
    {
      title: 'CryptoVault',
      description: 'Zero-knowledge end-to-end encrypted file storage system. Implements AES-256-GCM and RSA-4096 for maximum security.',
      tags: ['TypeScript', 'Cryptography', 'React'],
    },
    {
      title: 'AuthGuard',
      description: 'A robust authentication middleware for Express.js applications, preventing common OWASP Top 10 vulnerabilities.',
      tags: ['Node.js', 'Security', 'OWASP'],
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
      {/* Static atmospheric background */}
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#030303] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
      
      {/* Admin Button */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        title="Admin Panel"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Admin Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md relative">
            <button 
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> Admin Access
            </h2>

            {!isAuthenticated ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Access Key</label>
                  <input 
                    type="password" 
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter key..."
                  />
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors">
                  Authenticate
                </button>
              </form>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email Link</label>
                  <input 
                    type="text" 
                    value={links.email}
                    onChange={(e) => setLinks({...links, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                
                {/* WhatsApp Links */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-[#25D366]">WhatsApp Links & Numbers</label>
                    <button onClick={() => addLink('whatsapp')} className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {links.whatsapp.map(link => (
                      <div key={link.id} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input type="text" placeholder="Label (e.g. Channel 1)" value={link.label} onChange={(e) => updateLink('whatsapp', link.id, 'label', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#25D366] outline-none" />
                          <input type="text" placeholder="URL or Number" value={link.url} onChange={(e) => updateLink('whatsapp', link.id, 'url', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#25D366] outline-none" />
                        </div>
                        <button onClick={() => removeLink('whatsapp', link.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telegram Links */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-[#0088cc]">Telegram Links & Numbers</label>
                    <button onClick={() => addLink('telegram')} className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {links.telegram.map(link => (
                      <div key={link.id} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input type="text" placeholder="Label (e.g. Contact Admin)" value={link.label} onChange={(e) => updateLink('telegram', link.id, 'label', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#0088cc] outline-none" />
                          <input type="text" placeholder="URL or Username" value={link.url} onChange={(e) => updateLink('telegram', link.id, 'url', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#0088cc] outline-none" />
                        </div>
                        <button onClick={() => removeLink('telegram', link.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveLinks} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors mt-4 sticky bottom-0">
                  Save Configuration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Social Modals */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-sm relative">
            <button 
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              {activeModal === 'whatsapp' ? (
                <><MessageCircle className="w-6 h-6 text-[#25D366]" /> WhatsApp</>
              ) : (
                <><Send className="w-6 h-6 text-[#0088cc]" /> Telegram</>
              )}
            </h2>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {links[activeModal].map(link => (
                <a 
                  key={link.id} 
                  href={link.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-center font-medium"
                >
                  {link.label}
                </a>
              ))}
              {links[activeModal].length === 0 && (
                <p className="text-slate-400 text-center py-4">No links available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        
        {/* Header / Hero */}
        <header className="pt-12 md:pt-24 pb-24 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-medium tracking-wide">Security Researcher & Consultant</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter text-white leading-[1.1]">
              Securing the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">
                Digital Frontier.
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-light mb-10">
              Specializing in offensive security, penetration testing, and secure architecture. I find the vulnerabilities before they do.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="px-8 py-4 bg-white text-black hover:bg-slate-200 transition-all rounded-full font-medium flex items-center gap-2">
                Establish Connection <ChevronRight className="w-4 h-4" />
              </a>
              <a href="#projects" className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-full font-medium">
                View Operations
              </a>
            </div>
          </motion.div>
        </header>

        <div className="space-y-32 pb-24">
          {/* Skills Section */}
          <section id="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-12">Core Expertise</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                  <div 
                    key={skill.name}
                    className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} bg-opacity-10 flex items-center justify-center mb-6 text-white`}>
                      {skill.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{skill.name}</h3>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${skill.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Projects Section */}
          <section id="projects">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-12">Recent Operations</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div 
                    key={project.title}
                    className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-all group flex flex-col"
                  >
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        {project.title}
                        <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                      </h3>
                      <p className="text-slate-400 leading-relaxed mb-8 font-light">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-sm px-4 py-1.5 bg-white/5 text-slate-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Contact Section */}
          <section id="contact">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-12 md:p-16 text-center rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <h2 className="text-4xl font-bold text-white mb-6">Ready to secure your assets?</h2>
              <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg font-light">
                Available for freelance security audits, penetration testing, and secure architecture consulting. Reach out via any of the channels below.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
                <a href={links.email} className="px-8 py-4 rounded-full bg-white text-black hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-3 font-medium">
                  <Mail className="w-5 h-5" />
                  <span>Email Me</span>
                </a>
                <button onClick={() => setActiveModal('whatsapp')} className="px-8 py-4 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] transition-all shadow-lg flex items-center justify-center gap-3 font-medium">
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                <button onClick={() => setActiveModal('telegram')} className="px-8 py-4 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 hover:bg-[#0088cc]/20 text-[#0088cc] transition-all shadow-lg flex items-center justify-center gap-3 font-medium">
                  <Send className="w-5 h-5" />
                  <span>Telegram</span>
                </button>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}

