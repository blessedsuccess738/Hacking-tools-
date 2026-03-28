/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Code, Cpu, Server, Lock, Mail, ExternalLink, Activity, MessageCircle, Send, ChevronRight, Settings, X, Plus, Trash2, Terminal, FileCode, BookOpen, Github, UploadCloud, Globe, Wifi, Monitor, CheckCircle2, Loader2, Search, Check, LogOut, Linkedin, Twitter, Quote, Battery, HardDrive, Clock, MapPin, Compass, Crosshair, Power, Signal, ShieldCheck, Camera, MessageSquare, Smartphone } from 'lucide-react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GithubAuthProvider, signInWithPopup, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

type SocialLink = { id: string; label: string; url: string };

const DOMAINS = ['.com', '.net', '.org', '.io', '.co', '.app', '.dev', '.xyz', '.shop', '.web', '.site', '.online', '.tech', '.store', '.me', '.info', '.biz', '.tv', '.cc', '.ws', '.mobi', '.pro', '.name', '.club', '.vip', '.live', '.fun', '.space', '.world', '.life', '.today', '.city', '.agency', '.center', '.company', '.email', '.fund', '.gold', '.guru', '.network'];

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'whatsapp' | 'telegram'>('none');
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<'portfolio' | 'hosting' | 'admin'>('portfolio');
  const [activeSkillModal, setActiveSkillModal] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ ip: 'Scanning...', device: 'Detecting...', status: 'Online', type: 'Unknown', location: 'Detecting...' });
  const [advancedDeviceInfo, setAdvancedDeviceInfo] = useState({
    battery: 'Checking...',
    screen: '',
    cores: '',
    memory: '',
    timezone: '',
    gpu: '',
    preciseLocation: 'Click to fetch',
    browser: ''
  });

  const vpnServers = [
    { id: 'us', name: 'United States', flag: '🇺🇸', ip: '198.51.100.24', ping: '42ms', signal: 95 },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', ip: '203.0.113.89', ping: '18ms', signal: 98 },
    { id: 'ca', name: 'Canada', flag: '🇨🇦', ip: '192.0.2.146', ping: '35ms', signal: 92 },
    { id: 'au', name: 'Australia', flag: '🇦🇺', ip: '203.0.113.211', ping: '180ms', signal: 70 },
    { id: 'fr', name: 'France', flag: '🇫🇷', ip: '198.51.100.101', ping: '22ms', signal: 94 },
    { id: 'de', name: 'Germany', flag: '🇩🇪', ip: '85.214.132.11', ping: '25ms', signal: 90 },
    { id: 'jp', name: 'Japan', flag: '🇯🇵', ip: '103.2.14.88', ping: '145ms', signal: 75 },
    { id: 'sg', name: 'Singapore', flag: '🇸🇬', ip: '118.200.23.1', ping: '120ms', signal: 82 },
    { id: 'br', name: 'Brazil', flag: '🇧🇷', ip: '177.43.21.99', ping: '110ms', signal: 80 },
    { id: 'in', name: 'India', flag: '🇮🇳', ip: '115.112.44.12', ping: '130ms', signal: 78 },
    { id: 'za', name: 'South Africa', flag: '🇿🇦', ip: '196.21.44.55', ping: '160ms', signal: 65 },
    { id: 'ch', name: 'Switzerland', flag: '🇨🇭', ip: '185.159.157.12', ping: '12ms', signal: 100 },
    { id: 'nl', name: 'Netherlands', flag: '🇳🇱', ip: '89.20.14.33', ping: '15ms', signal: 99 },
    { id: 'se', name: 'Sweden', flag: '🇸🇪', ip: '193.10.22.44', ping: '20ms', signal: 96 },
    { id: 'kr', name: 'South Korea', flag: '🇰🇷', ip: '211.45.66.77', ping: '135ms', signal: 85 },
    { id: 'ae', name: 'UAE', flag: '🇦🇪', ip: '94.200.11.22', ping: '150ms', signal: 72 },
    { id: 'mx', name: 'Mexico', flag: '🇲🇽', ip: '189.200.11.22', ping: '60ms', signal: 88 },
    { id: 'it', name: 'Italy', flag: '🇮🇹', ip: '151.100.11.22', ping: '30ms', signal: 91 },
    { id: 'es', name: 'Spain', flag: '🇪🇸', ip: '212.100.11.22', ping: '28ms', signal: 93 },
    { id: 'ru', name: 'Russia', flag: '🇷🇺', ip: '46.100.11.22', ping: '80ms', signal: 75 },
    { id: 'cn', name: 'China', flag: '🇨🇳', ip: '114.100.11.22', ping: '160ms', signal: 60 },
  ];
  const [vpnStatus, setVpnStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedVpnServer, setSelectedVpnServer] = useState(vpnServers[0]);

  const toggleVpn = () => {
    if (vpnStatus === 'connected') {
      setVpnStatus('disconnected');
    } else {
      setVpnStatus('connecting');
      setTimeout(() => {
        setVpnStatus('connected');
      }, 2000);
    }
  };

  const displayIp = vpnStatus === 'connected' ? selectedVpnServer.ip : networkInfo.ip;
  const displayLocation = vpnStatus === 'connected' ? selectedVpnServer.name : networkInfo.location;
  
  // Admin Panel States
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  
  // Hosting States
  const [hostingAuth, setHostingAuth] = useState(false);
  const [hostingEmail, setHostingEmail] = useState('');
  const [hostingPassword, setHostingPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Forgot Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Phone Connection States
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [smsStatus, setSmsStatus] = useState('Checking...');

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [allDeployments, setAllDeployments] = useState<any[]>([]);
  const [deployStep, setDeployStep] = useState<'dashboard' | 'configure' | 'deploying' | 'success'>('dashboard');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('.com');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  
    const defaultLinks = {
    email: 'mailto:your-email@example.com',
    linkedin: 'https://linkedin.com/in/yourprofile',
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourusername',
    whatsapp: [
      { id: 'w1', label: 'WhatsApp Channel 1', url: '' },
      { id: 'w2', label: 'WhatsApp Channel 2', url: '' },
      { id: 'w3', label: 'WhatsApp Channel 3', url: '' },
      { id: 'w4', label: 'WhatsApp Channel 4', url: '' },
      { id: 'w5', label: 'Contact Admin 1', url: '' },
      { id: 'w6', label: 'Contact Admin 2', url: '' }
    ] as SocialLink[],
    telegram: [
      { id: 't1', label: 'Telegram Channel 1', url: '' },
      { id: 't2', label: 'Telegram Channel 2', url: '' },
      { id: 't3', label: 'Telegram Channel 3', url: '' },
      { id: 't4', label: 'Telegram Channel 4', url: '' },
      { id: 't5', label: 'Contact Admin 1', url: '' },
      { id: 't6', label: 'Contact Admin 2', url: '' }
    ] as SocialLink[]
  };
  
  const [links, setLinks] = useState(defaultLinks);

  const resources = [
    {
      id: 'python',
      title: 'Python Templates',
      icon: <FileCode className="w-6 h-6 text-cyan-400" />,
      description: 'Pre-configured Python scripts for automation and testing.',
      items: ['Port Scanner Template', 'Subdomain Enumerator', 'Custom Fuzzer Base', 'Web Scraper Toolkit', 'API Fuzzer']
    },
    {
      id: 'network',
      title: 'Network Tools',
      icon: <Activity className="w-6 h-6 text-teal-400" />,
      description: 'Essential networking utilities and packet manipulation scripts.',
      items: ['Packet Sniffer Base', 'ARP Spoofing Concept', 'Ping Sweep Script', 'DNS Spoofing Toolkit', 'TCP SYN Flooder']
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icon: <BookOpen className="w-6 h-6 text-sky-400" />,
      description: 'Step-by-step guides on various security concepts.',
      items: ['Intro to Cryptography', 'Understanding OWASP Top 10', 'Linux Privilege Escalation Basics', 'Buffer Overflow Explained', 'SQL Injection Deep Dive']
    },
    {
      id: 'osint',
      title: 'OSINT Frameworks',
      icon: <Search className="w-6 h-6 text-blue-400" />,
      description: 'Open-source intelligence gathering tools and scripts.',
      items: ['Social Media Scraper', 'Email Enumeration Tool', 'Domain Info Gatherer', 'Metadata Extractor']
    },
    {
      id: 'malware',
      title: 'Malware Analysis',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      description: 'Tools and environments for safe malware analysis.',
      items: ['Sandbox Setup Guide', 'Static Analysis Toolkit', 'Dynamic Analysis Scripts', 'Reverse Engineering Basics']
    },
    {
      id: 'cloud',
      title: 'Cloud Security',
      icon: <UploadCloud className="w-6 h-6 text-cyan-300" />,
      description: 'Scripts and guides for auditing cloud environments.',
      items: ['AWS S3 Bucket Scanner', 'IAM Privilege Escalation Checks', 'Azure AD Audit Tool', 'GCP Misconfiguration Scanner']
    }
  ];

  const hackingTools = [
    {
      id: 'port-scanner',
      title: 'Port Scanner',
      icon: <Activity className="w-6 h-6 text-red-400" />,
      description: 'Identify open ports and running services on target systems.',
      items: ['TCP Connect Scan', 'SYN Stealth Scan', 'UDP Scan', 'Service Version Detection', 'OS Fingerprinting']
    },
    {
      id: 'password-cracker',
      title: 'Password Cracker (Conceptual)',
      icon: <Lock className="w-6 h-6 text-red-500" />,
      description: 'Demonstration of password recovery and hash cracking techniques.',
      items: ['Dictionary Attack', 'Brute Force Simulation', 'Rainbow Table Lookup', 'Hash Identification', 'Salting Concepts']
    },
    {
      id: 'network-analyzer',
      title: 'Network Analyzer',
      icon: <Wifi className="w-6 h-6 text-orange-400" />,
      description: 'Packet sniffing and traffic analysis for network troubleshooting.',
      items: ['Packet Capture (PCAP)', 'Protocol Dissection', 'Traffic Filtering', 'DNS Spoofer Demo', 'ARP Poisoning Concept']
    },
    {
      id: 'vuln-scanner',
      title: 'Vulnerability Scanner',
      icon: <ShieldCheck className="w-6 h-6 text-yellow-400" />,
      description: 'Automated assessment of systems to identify known vulnerabilities.',
      items: ['CVE Database Lookup', 'Web App Scanning', 'Misconfiguration Checks', 'Outdated Software Detection', 'Compliance Audits']
    },
    {
      id: 'exploit-framework',
      title: 'Exploit Framework (Demo)',
      icon: <Terminal className="w-6 h-6 text-rose-500" />,
      description: 'A conceptual framework demonstrating exploit delivery and payload execution.',
      items: ['Payload Generation', 'Listener Configuration', 'Session Management', 'Post-Exploitation Modules', 'Pivoting Concepts']
    }
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'hosting') {
      setActivePage('hosting');
    } else if (page === 'admin') {
      setActivePage('admin');
    }

    const savedLinks = localStorage.getItem('portfolio_links_v3');
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse links");
      }
    }

    // Fetch Network Info
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setNetworkInfo(prev => ({ ...prev, ip: data.ip }));
        // Fetch location based on IP
        fetch(`https://ipapi.co/${data.ip}/json/`)
          .then(res => res.json())
          .then(locData => {
            setNetworkInfo(prev => ({ ...prev, location: `${locData.city || 'Unknown'}, ${locData.country_name || 'Unknown'}` }));
          })
          .catch(() => setNetworkInfo(prev => ({ ...prev, location: 'Location unavailable' })));
      })
      .catch(() => setNetworkInfo(prev => ({ ...prev, ip: 'Protected / Hidden', location: 'Location hidden' })));

    const ua = navigator.userAgent;
    let device = 'Unknown Device';
    if (/windows/i.test(ua)) device = 'Windows PC';
    else if (/mac/i.test(ua)) device = 'Mac OS';
    else if (/linux/i.test(ua)) device = 'Linux';
    else if (/android/i.test(ua)) device = 'Android';
    else if (/iphone|ipad/i.test(ua)) device = 'iOS Device';

    const conn = (navigator as any).connection;
    const type = conn ? conn.effectiveType.toUpperCase() : 'WIFI / ETH';

    setNetworkInfo(prev => ({ ...prev, device, type }));

    // Advanced Device Info
    const getAdvancedInfo = async () => {
      let batteryStr = 'Not available';
      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          batteryStr = `${Math.round(battery.level * 100)}% ${battery.charging ? '(Charging)' : ''}`;
        } catch (e) {}
      }

      let gpu = 'Unknown';
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpu = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch (e) {}

      setAdvancedDeviceInfo({
        battery: batteryStr,
        screen: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit)`,
        cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Unknown',
        memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB+` : 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        gpu: gpu || 'Unknown',
        preciseLocation: 'Initializing Live GPS...',
        browser: navigator.userAgent.split(' ').pop() || 'Unknown'
      });
    };
    getAdvancedInfo();

    // Live GPS Tracking
    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setAdvancedDeviceInfo(prev => ({ 
            ...prev, 
            preciseLocation: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Acc: ${Math.round(position.coords.accuracy)}m) [LIVE]` 
          }));
        },
        (error) => {
          setAdvancedDeviceInfo(prev => ({ ...prev, preciseLocation: `Denied/Error: ${error.message}` }));
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    // Request Camera Access on Load
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setCameraActive(true);
        setPhoneConnected(true);
        setSmsStatus('OS Blocked (Sandbox)');
        // Stop tracks immediately as we just want to simulate connection/permission
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => {
        setCameraActive(false);
        setSmsStatus('Permission Denied');
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setHostingAuth(true);
        setAdminAuth(true);
        const q = query(collection(db, 'deployments'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const unsubDeployments = onSnapshot(q, (snapshot) => {
          const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDeployments(deps);
        });
        return () => unsubDeployments();
      } else {
        setHostingAuth(false);
        setAdminAuth(false);
        setDeployments([]);
      }
    });
    return () => {
      unsubscribe();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const q = query(collection(db, 'deployments'), orderBy('createdAt', 'desc'));
      const unsubAllDeployments = onSnapshot(q, (snapshot) => {
        const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllDeployments(deps);
      });
      return () => unsubAllDeployments();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey === 'ETHICAL') {
      setIsAuthenticated(true);
      setAuthKey('');
    } else {
      alert('Invalid access key');
    }
  };

  const fetchPreciseLocation = () => {
    setAdvancedDeviceInfo(prev => ({ ...prev, preciseLocation: 'Requesting...' }));
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAdvancedDeviceInfo(prev => ({ 
            ...prev, 
            preciseLocation: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Acc: ${Math.round(position.coords.accuracy)}m)` 
          }));
        },
        (error) => {
          setAdvancedDeviceInfo(prev => ({ ...prev, preciseLocation: `Denied/Error: ${error.message}` }));
        }
      );
    } else {
      setAdvancedDeviceInfo(prev => ({ ...prev, preciseLocation: 'Not supported' }));
    }
  };

  const handleSaveLinks = () => {
    localStorage.setItem('portfolio_links_v3', JSON.stringify(links));
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
    { name: 'Network Security', icon: <Server className="w-5 h-5" />, level: 85, color: 'from-teal-400 to-cyan-600' },
    { name: 'Cryptography', icon: <Lock className="w-5 h-5" />, level: 75, color: 'from-sky-400 to-blue-500' },
    { name: 'Reverse Engineering', icon: <Cpu className="w-5 h-5" />, level: 70, color: 'from-blue-400 to-indigo-500' },
    { name: 'Secure Coding', icon: <Code className="w-5 h-5" />, level: 95, color: 'from-cyan-300 to-teal-500' },
    { name: 'Exploit Dev', icon: <Activity className="w-5 h-5" />, level: 80, color: 'from-teal-300 to-blue-400' },
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

  const testimonials = [
    { name: "Sarah Jenkins", company: "TechFlow Inc.", quote: "An absolute professional. Found vulnerabilities we didn't even know existed." },
    { name: "David Chen", company: "SecureNet", quote: "The penetration testing report was incredibly detailed and actionable." },
    { name: "Elena Rodriguez", company: "Global Finance", quote: "Helped us secure our entire cloud infrastructure in record time." },
    { name: "Michael Chang", company: "DataShield", quote: "Exceptional understanding of modern web application security." },
    { name: "Jessica Walsh", company: "HealthTech Solutions", quote: "Our go-to consultant for all things related to compliance and security." },
    { name: "Robert Fox", company: "Fox & Partners", quote: "Brilliant work on reverse engineering that malware sample." },
    { name: "Amanda Lee", company: "CyberDefend", quote: "Clear communication and top-tier technical skills." },
    { name: "Thomas Wright", company: "Wright Logistics", quote: "Secured our internal network against ransomware threats effectively." },
    { name: "Olivia Martin", company: "FinServe Group", quote: "The security architecture review saved us from a major breach." },
    { name: "Daniel Kim", company: "Kim & Co.", quote: "Highly recommend for any advanced penetration testing needs." },
    { name: "Sophia Patel", company: "Patel Industries", quote: "Found critical zero-days in our proprietary software." },
    { name: "William Davis", company: "Davis Corp", quote: "A true expert in the field of offensive security." },
    { name: "Isabella Garcia", company: "Garcia Tech", quote: "Provided excellent training for our internal security team." },
    { name: "James Wilson", company: "Wilson Enterprises", quote: "The best security consultant we've ever worked with." },
    { name: "Mia Taylor", company: "Taylor Solutions", quote: "Thorough, professional, and incredibly knowledgeable." },
    { name: "Alexander Moore", company: "Moore Security", quote: "Helped us achieve SOC 2 compliance faster than expected." },
    { name: "Charlotte Anderson", company: "Anderson Group", quote: "Outstanding work on securing our new mobile application." },
    { name: "Ethan Thomas", company: "Thomas & Sons", quote: "Identified and patched a critical SQL injection vulnerability." },
    { name: "Amelia Jackson", company: "Jackson Tech", quote: "A lifesaver when we were dealing with a complex DDoS attack." },
    { name: "Benjamin White", company: "White Cyber", quote: "Consistently delivers high-quality security assessments." }
  ];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('Please enter your email address.');
      return;
    }
    setIsResetting(true);
    setResetMessage('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setResetMessage(error.message || 'Failed to send reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdminSignUp) {
        await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      } else {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleHostingAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, hostingEmail, hostingPassword);
      } else {
        await signInWithEmailAndPassword(auth, hostingEmail, hostingPassword);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGithubConnect = async () => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('repo');
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setGithubConnected(true);
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setGithubRepos(data);
      }
    } catch (error: any) {
      console.error("GitHub connection error:", error);
      alert(error.message);
    }
  };

  const startDeploy = () => {
    if (!projectName) {
      alert('Please enter a project name');
      return;
    }
    setDeployStep('deploying');
    
    const getTimestamp = () => new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setDeployLogs([`[${getTimestamp()}] Initializing build environment...`]);
    const logs = [
      'Cloning repository...',
      'Resolving dependencies...',
      'Fetching packages...',
      'Building project...',
      'Running build script "npm run build"...',
      'Optimizing assets...',
      'Generating static pages...',
      'Provisioning SSL/TLS certificates...',
      'Configuring GitHub Actions CI/CD pipeline...',
      'Assigning domain...',
      'Deploying to edge network...',
      'Deployment complete!'
    ];
    let i = 0;
    const interval = setInterval(async () => {
      if (i < logs.length) {
        setDeployLogs(prev => [...prev, `[${getTimestamp()}] ${logs[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        
        if (auth.currentUser) {
          try {
            await addDoc(collection(db, 'deployments'), {
              userId: auth.currentUser.uid,
              projectName,
              domain: selectedDomain,
              url: `https://${projectName}${selectedDomain}`,
              createdAt: serverTimestamp()
            });
          } catch (error) {
            console.error("Error saving deployment:", error);
          }
        }
        
        setTimeout(() => setDeployStep('success'), 1000);
      }
    }, 800);
  };

  if (activePage === 'hosting') {
    return (
      <div className="min-h-screen bg-[#000] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
        <nav className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-bold">
              <Server className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">domain.com</span>
          </div>
          <div className="flex items-center gap-4">
            {hostingAuth && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  {auth.currentUser?.email}
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setActivePage('portfolio');
                setDeployStep('dashboard');
              }}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Portfolio
            </button>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto p-6 md:p-12">
          {!hostingAuth ? (
            <div className="max-w-md mx-auto mt-20 bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">{isSignUp ? 'Create an account' : 'Log in to domain.com'}</h2>
              <p className="text-slate-400 text-sm mb-6">Secure your deployments and manage your projects.</p>
              <form onSubmit={handleHostingAuth} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={hostingEmail}
                    onChange={(e) => setHostingEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter email..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={hostingPassword}
                    onChange={(e) => setHostingPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter password..."
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={() => { setResetEmail(hostingEmail); setShowResetModal(true); }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-lg transition-colors">
                  {isSignUp ? 'Sign Up' : 'Continue'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-cyan-500 hover:underline">
                    {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </div>
          ) : deployStep === 'dashboard' ? (
            <>
              <div className="flex justify-between items-end mb-10">
                <h1 className="text-4xl font-bold text-white tracking-tight">Let's build something new.</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Import Git Repository</h2>
                  <p className="text-slate-400 text-sm mb-6">Import your project from GitHub to deploy automatically on push.</p>
                  
                  {!githubConnected ? (
                    <button 
                      onClick={handleGithubConnect}
                      className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Github className="w-5 h-5" /> Connect GitHub
                    </button>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {githubRepos.length > 0 ? githubRepos.map(repo => (
                        <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-sm font-medium text-white truncate max-w-[200px]">{repo.name}</span>
                          <button 
                            onClick={() => { setSelectedRepo(repo.name); setProjectName(repo.name); setDeployStep('configure'); }}
                            className="text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-slate-200 transition-colors shrink-0"
                          >
                            Import
                          </button>
                        </div>
                      )) : (
                        <div className="text-center text-slate-400 py-4 text-sm">No repositories found.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 hover:border-white/30 transition-all p-8 rounded-2xl cursor-pointer group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Import Project Directory</h2>
                  <p className="text-slate-400 text-sm mb-6">Upload a local directory to deploy your project.</p>
                  <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-lg transition-colors">
                    Browse Files
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-6">Recent Deployments</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                {deployments.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {deployments.map(dep => (
                      <div key={dep.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                          <h4 className="font-medium text-white">{dep.projectName}</h4>
                          <a href={dep.url} target="_blank" rel="noreferrer" className="text-sm text-cyan-500 hover:underline">{dep.url}</a>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <button 
                            onClick={() => setShowAnalytics(dep.id)}
                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Activity className="w-3 h-3" /> Analytics
                          </button>
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No deployments found.</p>
                  </div>
                )}
              </div>
            </>
          ) : deployStep === 'configure' ? (
            <div className="max-w-2xl mx-auto mt-10">
              <button onClick={() => setDeployStep('dashboard')} className="text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </button>
              <h1 className="text-3xl font-bold text-white mb-8">Configure Project</h1>
              
              <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Selected Repository</label>
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg text-white">
                    <Github className="w-5 h-5" /> {selectedRepo}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="e.g. opay"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Domain Extension</label>
                  <div 
                    onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white cursor-pointer flex justify-between items-center"
                  >
                    {selectedDomain}
                    <ChevronRight className={`w-4 h-4 transition-transform ${isDomainDropdownOpen ? 'rotate-90' : ''}`} />
                  </div>
                  
                  {isDomainDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {DOMAINS.map(domain => (
                          <div 
                            key={domain}
                            onClick={() => { setSelectedDomain(domain); setIsDomainDropdownOpen(false); }}
                            className="p-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded cursor-pointer text-center"
                          >
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Advanced Settings</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0" defaultChecked />
                    <div>
                      <div className="text-sm font-medium text-white">Enable GitHub Actions CI/CD</div>
                      <div className="text-xs text-slate-400">Automate deployments upon code commits to the main branch.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer mb-6">
                    <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0" defaultChecked />
                    <div>
                      <div className="text-sm font-medium text-white">Auto-Provision SSL/TLS</div>
                      <div className="text-xs text-slate-400">Secure your project with automatic HTTPS certificates.</div>
                    </div>
                  </label>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Custom Domain (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="e.g. www.mycustomdomain.com"
                    />
                  </div>

                  <button 
                    onClick={startDeploy}
                    className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-lg transition-colors"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          ) : deployStep === 'deploying' ? (
            <div className="max-w-3xl mx-auto mt-10">
              <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" /> Deploying {projectName}{selectedDomain}
              </h1>
              
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden font-mono text-sm">
                <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Build Logs</span>
                </div>
                <div className="p-6 h-96 overflow-y-auto space-y-2">
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-300">
                      <span className="text-cyan-500 mr-2">{'>'}</span> {log}
                    </div>
                  ))}
                  <div className="animate-pulse text-slate-500">_</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mt-20 text-center">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Congratulations!</h1>
              <p className="text-xl text-slate-400 mb-8">Your project has been successfully deployed.</p>
              
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl mb-8 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-slate-500 mb-1">Domains</p>
                  <a href={`https://${projectName}${selectedDomain}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-medium text-lg">
                    {projectName}{selectedDomain}
                  </a>
                </div>
                <a 
                  href={`https://${projectName}${selectedDomain}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Visit Site
                </a>
              </div>
              
              <button 
                onClick={() => setDeployStep('dashboard')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </main>

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-2xl relative">
              <button 
                onClick={() => setShowAnalytics(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" /> Project Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Total Visitors</div>
                  <div className="text-3xl font-bold text-white">1,248</div>
                  <div className="text-xs text-emerald-400 mt-1">+12% this week</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Page Views</div>
                  <div className="text-3xl font-bold text-white">3,892</div>
                  <div className="text-xs text-emerald-400 mt-1">+8% this week</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Bandwidth</div>
                  <div className="text-3xl font-bold text-white">4.2 GB</div>
                  <div className="text-xs text-slate-500 mt-1">of 100 GB limit</div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-white mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Direct</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[45%]"></div>
                  </div>
                  <span className="text-white font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Google Search</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[30%]"></div>
                  </div>
                  <span className="text-white font-medium">30%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Social Media</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[15%]"></div>
                  </div>
                  <span className="text-white font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Referrals</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[10%]"></div>
                  </div>
                  <span className="text-white font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-[#000] text-slate-200 font-sans selection:bg-teal-500 selection:text-white">
        <nav className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">admin.com</span>
          </div>
          <div className="flex items-center gap-4">
            {adminAuth && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"></div>
                  {auth.currentUser?.email}
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-5xl mx-auto p-6 md:p-12">
          {!adminAuth ? (
            <div className="max-w-md mx-auto mt-20 bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">{isAdminSignUp ? 'Create Admin Account' : 'Admin Login'}</h2>
              <p className="text-slate-400 text-sm mb-6">Access the global administration dashboard.</p>
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Enter admin email..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Enter password..."
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={() => { setResetEmail(adminEmail); setShowResetModal(true); }}
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-lg transition-colors">
                  {isAdminSignUp ? 'Sign Up' : 'Log In'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsAdminSignUp(!isAdminSignUp)} className="text-sm text-teal-400 hover:underline">
                    {isAdminSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Global Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-slate-400 text-sm mb-2">Total Deployments</h3>
                  <p className="text-4xl font-bold text-white">{allDeployments.length}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-slate-400 text-sm mb-2">Active Users</h3>
                  <p className="text-4xl font-bold text-white">--</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-slate-400 text-sm mb-2">System Status</h3>
                  <p className="text-4xl font-bold text-emerald-500">Operational</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-6">All Deployed Projects</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                {allDeployments.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {allDeployments.map(dep => (
                      <div key={dep.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                          <h4 className="font-medium text-white">{dep.projectName}</h4>
                          <a href={dep.url} target="_blank" rel="noreferrer" className="text-sm text-teal-400 hover:underline">{dep.url}</a>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{dep.createdAt ? new Date(dep.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No deployments found across the network.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010b14] text-slate-200 selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
      {/* Video Background */}
      <div className="absolute top-0 left-0 w-full h-full z-[-2] overflow-hidden bg-[#010b14]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute min-w-full min-h-full object-cover opacity-20 mix-blend-screen"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-underwater-ocean-with-sun-rays-328-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#010b14]/80 to-[#010b14]"></div>
      </div>

      {/* Top Right Settings Button */}
      <motion.button 
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
        animate={{ 
          boxShadow: ['0px 0px 0px rgba(6,182,212,0)', '0px 0px 15px rgba(6,182,212,0.4)', '0px 0px 0px rgba(6,182,212,0)'],
          scale: [1, 1.05, 1]
        }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-slate-400 text-sm mb-6">Enter your email address and we'll send you a link to reset your password.</p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter your email..."
                  required
                />
              </div>
              {resetMessage && (
                <p className={`text-sm ${resetMessage.includes('sent') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resetMessage}
                </p>
              )}
              <button 
                type="submit" 
                disabled={isResetting}
                className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-cyan-400" /> System Diagnostics & Device Tools
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Network & Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Network & Location</h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Globe className="w-6 h-6 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Public IP</p>
                    <p className="text-lg font-mono text-white truncate">{displayIp}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Search className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">IP Location</p>
                    <p className="text-lg font-medium text-white truncate">{displayLocation}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-red-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">GPS Coordinates</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-mono text-white truncate">{advancedDeviceInfo.preciseLocation}</p>
                      <button 
                        onClick={fetchPreciseLocation}
                        className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded transition-colors shrink-0"
                      >
                        Fetch GPS
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Wifi className="w-6 h-6 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Connection Type</p>
                    <p className="text-lg font-medium text-white truncate">{networkInfo.type}</p>
                  </div>
                </div>
              </div>

              {/* Hardware & System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Hardware & System</h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Monitor className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Device & Screen</p>
                    <p className="text-sm font-medium text-white truncate">{networkInfo.device} | {advancedDeviceInfo.screen}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Cpu className="w-6 h-6 text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Processor & Memory</p>
                    <p className="text-sm font-medium text-white truncate">{advancedDeviceInfo.cores} | {advancedDeviceInfo.memory}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <Crosshair className="w-6 h-6 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Graphics (WebGL)</p>
                    <p className="text-xs font-mono text-white truncate" title={advancedDeviceInfo.gpu}>{advancedDeviceInfo.gpu}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                    <Battery className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Battery</p>
                      <p className="text-sm font-medium text-white truncate">{advancedDeviceInfo.battery}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Timezone</p>
                      <p className="text-sm font-medium text-white truncate" title={advancedDeviceInfo.timezone}>{advancedDeviceInfo.timezone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Sensors & Media (Phone Connection) */}
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mt-6 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-pink-400" /> Device Sensors & Media
                </h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className={`w-5 h-5 ${cameraActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Camera Access</p>
                        <p className={`text-sm font-medium ${cameraActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {cameraActive ? 'Connected (Live)' : 'Disconnected / Denied'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className={`w-5 h-5 ${smsStatus.includes('Blocked') || smsStatus.includes('Denied') ? 'text-red-400' : 'text-emerald-400'}`} />
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">SMS Intercept</p>
                        <p className={`text-sm font-medium ${smsStatus.includes('Blocked') || smsStatus.includes('Denied') ? 'text-red-400' : 'text-emerald-400'}`}>
                          {smsStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure VPN Routing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" /> Secure VPN Routing
                </h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Status</p>
                      <p className={`text-sm font-bold ${vpnStatus === 'connected' ? 'text-emerald-400' : vpnStatus === 'connecting' ? 'text-yellow-400' : 'text-slate-400'}`}>
                        {vpnStatus === 'connected' ? 'SECURE CONNECTION' : vpnStatus === 'connecting' ? 'ESTABLISHING...' : 'DISCONNECTED'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleVpn}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        vpnStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                        vpnStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Power className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Select Server Location</p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {vpnServers.map(server => (
                        <button
                          key={server.id}
                          onClick={() => {
                            if (vpnStatus !== 'connecting') {
                              setSelectedVpnServer(server);
                              if (vpnStatus === 'connected') {
                                setVpnStatus('connecting');
                                setTimeout(() => setVpnStatus('connected'), 1500);
                              }
                            }
                          }}
                          disabled={vpnStatus === 'connecting'}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                            selectedVpnServer.id === server.id 
                              ? 'bg-teal-500/20 border-teal-500/50 text-white' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          } ${vpnStatus === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{server.flag}</span>
                            <span className="text-sm font-medium truncate">{server.name}</span>
                          </div>
                          {selectedVpnServer.id === server.id && vpnStatus === 'connected' && (
                            <Signal className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {vpnStatus === 'connected' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-white/10 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Ping</p>
                        <p className="text-xs font-mono text-emerald-400">{selectedVpnServer.ping}</p>
                      </div>
                      <div className="flex-1 ml-4">
                        <p className="text-[10px] text-slate-400 uppercase text-right">Signal Strength</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedVpnServer.signal}%` }}></div>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 w-8 text-right">{selectedVpnServer.signal}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

                <div>
                  <label className="block text-sm text-slate-400 mb-2">LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={links.linkedin}
                    onChange={(e) => setLinks({...links, linkedin: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Twitter URL</label>
                  <input 
                    type="text" 
                    value={links.twitter}
                    onChange={(e) => setLinks({...links, twitter: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">GitHub URL</label>
                  <input 
                    type="text" 
                    value={links.github}
                    onChange={(e) => setLinks({...links, github: e.target.value})}
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

                {/* Deployed Projects */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-white">Deployed Projects</label>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {allDeployments.length > 0 ? allDeployments.map(dep => (
                      <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/50">
                        <div className="truncate pr-2">
                          <div className="text-sm font-medium text-white">{dep.projectName}</div>
                          <div className="text-xs text-slate-400 truncate">{dep.url}</div>
                        </div>
                        <a 
                          href={dep.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded shrink-0"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )) : (
                      <div className="text-center text-slate-500 text-sm py-2">No projects deployed yet.</div>
                    )}
                  </div>
                </div>

                {/* Hosting Link */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-white">Platforms</label>
                  </div>
                  <button 
                    onClick={() => window.open('?page=hosting', '_blank')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    <Server className="w-4 h-4" /> Launch domain.com
                  </button>
                  <button 
                    onClick={() => window.open('?page=admin', '_blank')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> Launch admin.com
                  </button>
                </div>

                <button onClick={handleSaveLinks} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors mt-4 sticky bottom-0">
                  Save Configuration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {activeResource !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md relative">
            <button 
              onClick={() => setActiveResource(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            {[...resources, ...hackingTools].filter(r => r.id === activeResource).map(resource => (
              <div key={resource.id}>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  {resource.icon} {resource.title}
                </h2>
                <p className="text-slate-400 mb-6 text-sm">{resource.description}</p>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {resource.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="block w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-left font-medium flex items-center justify-between group cursor-pointer"
                    >
                      <span>{item}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

      {/* Network Security Modal */}
      {activeSkillModal === 'Network Security' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setActiveSkillModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Server className="w-6 h-6 text-teal-400" /> Network Status
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <Globe className="w-6 h-6 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Public IP</p>
                  <p className="text-lg font-mono text-white">{displayIp}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <Monitor className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Current Device</p>
                  <p className="text-lg font-medium text-white">{networkInfo.device}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <Wifi className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Connection Type</p>
                  <p className="text-lg font-medium text-white">{networkInfo.type} <span className="text-xs text-slate-500 ml-2">(SSID hidden)</span></p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-[#25D366]" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Network Status</p>
                  <p className="text-lg font-medium text-[#25D366]">{networkInfo.status}</p>
                </div>
              </div>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400">
                Digital Fr
              </span>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center justify-center w-[0.75em] h-[0.75em] rounded-full bg-white/5 border border-white/10 hover:bg-teal-500/20 hover:border-teal-500/50 text-slate-400 hover:text-teal-400 transition-all mx-1 align-middle group cursor-pointer relative -top-[0.05em]"
                title="Admin Panel"
              >
                <Settings className="w-[50%] h-[50%] group-hover:rotate-90 transition-transform duration-500" />
              </button>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                ntier.
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-light mb-10">
              Specializing in offensive security, penetration testing, and secure architecture. I find the vulnerabilities before they do.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.a 
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                href="#contact" 
                className="px-8 py-4 bg-white text-black hover:bg-slate-200 transition-all rounded-full font-medium flex items-center gap-2"
              >
                Establish Connection <ChevronRight className="w-4 h-4" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, rotateX: -5, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
                href="#projects" 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-full font-medium"
              >
                View Operations
              </motion.a>
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
                    onClick={() => skill.name === 'Network Security' ? setActiveSkillModal(skill.name) : null}
                    className={`bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors group ${skill.name === 'Network Security' ? 'cursor-pointer hover:border-teal-500/50' : ''}`}
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

          {/* Toolkits & Tutorials Section */}
          <section className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-12 flex items-center gap-4">
                <Terminal className="w-8 h-8 text-cyan-400" />
                Toolkits & Tutorials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveResource(resource.id)}
                    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="bg-black/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {resource.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{resource.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {resource.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Hacking Tools Section */}
          <section className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-12 flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-red-500" />
                Hacking Tools (Ethical Bypass & Exploit)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hackingTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveResource(tool.id)}
                    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="bg-black/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white mb-12 flex items-center gap-4">
                <MessageCircle className="w-8 h-8 text-cyan-400" />
                Client Testimonials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-all flex flex-col"
                  >
                    <Quote className="w-8 h-8 text-cyan-500/30 mb-4" />
                    <p className="text-slate-300 italic mb-6 flex-1">"{testimonial.quote}"</p>
                    <div>
                      <h4 className="text-white font-bold">{testimonial.name}</h4>
                      <p className="text-slate-500 text-sm">{testimonial.company}</p>
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

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a] py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} DEVTOOL CLAN. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href={links.email} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href={links.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href={links.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <button onClick={() => setActiveModal('whatsapp')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveModal('telegram')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0088cc] hover:bg-[#0088cc]/10 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

