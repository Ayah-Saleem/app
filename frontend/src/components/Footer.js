import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 gradient-text">Jusoor</h3>
            <p className="text-sm text-muted-foreground">
              Bridging communication for the hearing and speech impaired through AI-powered translation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/translate" className="hover:text-primary">Translate</Link></li>
              <li><Link to="/live" className="hover:text-primary">Live Translation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/feedback" className="hover:text-primary">Feedback</Link></li>
              <li><Link to="/settings" className="hover:text-primary">Settings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Jusoor. Graduation Project | Supervised by Dr. Muhammed Dirar Saffarini</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;