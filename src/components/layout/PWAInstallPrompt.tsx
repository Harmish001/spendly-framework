import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if the device is mobile and NOT native Capacitor
    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      return isMobileUA && !isNative;
    };
    
    setIsMobile(checkMobile());

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Delay showing the prompt to not annoy the user immediately
      setTimeout(() => {
        // Only show if the app isn't already installed
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(true);
            setTimeout(() => setIsAnimating(true), 100);
        }
      }, 1000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsAnimating(false);
    setTimeout(() => setShowPrompt(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
      // Optionally store this in localStorage so we don't show it again for a while
      const hideUntil = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('pwa-prompt-hide-until', hideUntil.toString());
    }, 300);
  };

  // Check if we should show based on localStorage
  useEffect(() => {
    const hideUntil = localStorage.getItem('pwa-prompt-hide-until');
    if (hideUntil && new Date().getTime() < parseInt(hideUntil)) {
      setShowPrompt(false);
    }
  }, [showPrompt]);

  if (!showPrompt || !isMobile) return null;

  return (
    <div 
        className={`fixed bottom-6 left-4 right-4 z-[1001] transition-all duration-500 ease-out transform ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
    >
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#517fa4] to-[#243949] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#517fa4]/30 flex-shrink-0">
            <Download className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm leading-tight">Install Spendly</h3>
            <p className="text-slate-500 text-xs mt-0.5">Add to home screen for a better experience</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
            onClick={handleInstallClick}
            className="bg-[#517fa4] hover:bg-[#243949] text-white rounded-xl px-4 py-2 text-xs font-semibold h-9 shadow-md shadow-[#517fa4]/20 transition-all active:scale-95"
            >
            Install
            </Button>
            <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex-shrink-0"
            >
            <X className="w-4 h-4 text-slate-400" />
            </Button>
        </div>
        </div>
    </div>
  );
}
