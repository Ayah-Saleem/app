import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, Mic, FileText, MessageCircle, Shield, Zap, Globe } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Sign Language Recognition",
      description: "Convert sign language videos to text in real-time"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Speech to Text",
      description: "Accurate voice recognition and transcription"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Text Translation",
      description: "Multi-language text translation support"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Translation",
      description: "Real-time conversation translation interface"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is encrypted and protected"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Language",
      description: "Support for English and Arabic languages"
    }
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32" data-testid="hero-section">
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Breaking Barriers</span>
              <br />
              Through AI Translation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Jusoor bridges communication for the hearing and speech impaired with intelligent, real-time translation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/translate" className="btn-primary text-lg px-8 py-4" data-testid="start-translating-button">
                    <Zap className="w-5 h-5 inline mr-2" />
                    Start Translating
                  </Link>
                  <Link to="/live" className="btn-secondary text-lg px-8 py-4" data-testid="live-translation-button">
                    <MessageCircle className="w-5 h-5 inline mr-2" />
                    Live Translation
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4" data-testid="get-started-button">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all text-lg" data-testid="login-button">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900" data-testid="features-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for seamless communication</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl card-hover" data-testid={`feature-card-${index}`}>
                <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" data-testid="how-it-works-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, fast, and accurate</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-2xl font-semibold mb-4">Choose Input Type</h3>
              <p className="text-muted-foreground">Select video, audio, or text as your input method</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-2xl font-semibold mb-4">AI Processing</h3>
              <p className="text-muted-foreground">Our AI analyzes and translates your content instantly</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-2xl font-semibold mb-4">Get Results</h3>
              <p className="text-muted-foreground">Receive accurate translations in your desired format</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 gradient-bg text-white" data-testid="cta-section">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Break Communication Barriers?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of users empowering inclusive communication</p>
            <Link to="/register" className="bg-white text-primary px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block" data-testid="cta-register-button">
              Start Your Journey Today
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
