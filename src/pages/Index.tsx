
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, BookOpen, Sparkles, ArrowRight, Users, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">Tearix</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`max-w-6xl mx-auto px-6 py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Create Amazing Stories & Blogs
            with AI
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your ideas into captivating stories and engaging blog posts with the power of artificial intelligence. 
            Write faster, better, and more creatively than ever before.
          </p>
          <Link to="/generate">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg">
              Start Creating <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <PenTool className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Blog Generator</CardTitle>
              <CardDescription className="text-gray-300">
                Create engaging blog posts on any topic with AI assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Story Creator</CardTitle>
              <CardDescription className="text-gray-300">
                Generate creative stories, fiction, and narratives with ease
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">AI-Powered</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced AI models to help you craft perfect content
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-4xl font-bold text-white">10K+</span>
            </div>
            <p className="text-gray-300">Active Writers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-4xl font-bold text-white">50K+</span>
            </div>
            <p className="text-gray-300">Stories Created</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-4xl font-bold text-white">4.9</span>
            </div>
            <p className="text-gray-300">User Rating</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-2xl p-12 border border-purple-500/20">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Writing?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of writers who are already creating amazing content with AI
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 Tearix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
