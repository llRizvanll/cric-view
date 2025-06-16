'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate feature highlights
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Match Analytics',
      description: 'Comprehensive match analysis with detailed statistics and insights',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🏏',
      title: 'Player Performance',
      description: 'Individual player statistics and performance tracking',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '📈',
      title: 'Run Flow Analysis',
      description: 'Over-by-over run progression with Manhattan charts',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🎯',
      title: 'Bowling Analytics',
      description: 'Detailed bowling figures and spell analysis',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '⚡',
      title: 'Live Commentary',
      description: 'Ball-by-ball commentary and match progression',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: '🏆',
      title: 'Team Comparison',
      description: 'Head-to-head team analysis and performance metrics',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Matches Analyzed' },
    { value: '50K+', label: 'Players Tracked' },
    { value: '1M+', label: 'Balls Recorded' },
    { value: '99.9%', label: 'Accuracy Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏏</div>
              <span className="text-xl font-bold text-gray-900">CricInfo Analytics</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#analytics" className="text-gray-600 hover:text-gray-900 transition-colors">Analytics</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
              <button
                onClick={() => router.push('/cricket/matches')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
                <span className="mr-2">🚀</span>
                Advanced Cricket Analytics Platform
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Cricket Analytics
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience cricket like never before with comprehensive analytics, 
              real-time insights, and beautiful visualizations powered by advanced data science.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/cricket/matches')}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Explore Live Demo
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-8 py-4 text-lg font-medium transition-colors">
                Watch Demo Video →
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-100 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-100 rounded-full opacity-50 animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to analyze cricket matches with professional-grade tools and insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  activeFeature === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Advanced Analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive deep into match data with comprehensive visualizations and insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Match Tracking</h3>
                  <p className="text-gray-600">Follow live matches with ball-by-ball updates and instant analytics</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Insights</h3>
                  <p className="text-gray-600">AI-powered analysis of player and team performance patterns</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                  <p className="text-gray-600">Machine learning models for match outcome predictions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tournament Analytics</h3>
                  <p className="text-gray-600">Comprehensive tournament statistics and team comparisons</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  {/* Mock Chart Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Match Progress</h4>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Team A: 184/6 (18.2 overs)</span>
                      <span className="text-green-600 font-medium">10.04 RPO</span>
                    </div>
                    
                    <div className="space-y-2">
                      {[85, 92, 78, 95, 88, 90].map((width, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 w-8">{i+1}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${width}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-8">{Math.floor(width/10)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mock Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">24</div>
                      <div className="text-xs text-gray-600">Boundaries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">8</div>
                      <div className="text-xs text-gray-600">Sixes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">6</div>
                      <div className="text-xs text-gray-600">Wickets</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500 rounded-full opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of cricket analytics with our interactive demo
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Interactive Match Analysis
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Explore comprehensive match data with our intuitive interface. 
                  From ball-by-ball commentary to advanced statistical analysis, 
                  discover insights that matter.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Real-time match tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Player performance analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Team comparison tools</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/cricket/matches')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Try Live Demo
                </button>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">England vs Australia</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">LIVE</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">276/8</div>
                        <div className="text-sm text-gray-600">England</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">245/10</div>
                        <div className="text-sm text-gray-600">Australia</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Current Over</div>
                      <div className="flex space-x-1">
                        {['4', '1', '0', '6', '2', '1'].map((ball, i) => (
                          <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            ball === '4' ? 'bg-green-500 text-white' :
                            ball === '6' ? 'bg-purple-500 text-white' :
                            ball === '0' ? 'bg-gray-300 text-gray-700' :
                            'bg-blue-500 text-white'
                          }`}>
                            {ball}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Cricket Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of cricket enthusiasts who trust our platform for comprehensive match analysis
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/cricket/matches')}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Start Analyzing Now
            </button>
            <button className="text-white hover:text-blue-100 px-8 py-4 text-lg font-medium transition-colors">
              Contact Sales →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏏</div>
                <span className="text-xl font-bold">CricInfo Analytics</span>
              </div>
              <p className="text-gray-400">
                Advanced cricket analytics platform for professionals and enthusiasts.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#analytics" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#twitter" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#linkedin" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#github" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#discord" className="hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CricInfo Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 