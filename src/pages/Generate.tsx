import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, PenTool, BookOpen, Wand2, Save, ArrowLeft, Copy, Clock, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/hooks/useContent";
import { generateContent } from "@/lib/gemini";
import StoryVideoPlayer from "@/components/StoryVideoPlayer";

const Generate = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('');
  const [wordCount, setWordCount] = useState('500');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Neutral');
  const [profession, setProfession] = useState('');
  const [writerStyle, setWriterStyle] = useState('Neutral');
  const [isSaving, setIsSaving] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();
  const { saveContent } = useContent();
  const navigate = useNavigate();

  // Calculate estimated video duration
  const calculateVideoDuration = () => {
    if (!generatedContent) return 0;
    const words = generatedContent.split(' ').length;
    const readingSpeed = 120; // words per minute for video
    const readingTime = words / readingSpeed; // in minutes
    const titleTime = 0.15; // 9 seconds for title and intro
    const creditsTime = 0.1; // 6 seconds for credits
    return Math.ceil((readingTime + titleTime + creditsTime) * 60); // convert to seconds
  };

  const handleGenerate = async () => {
    if (!prompt || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please provide a prompt and select content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Enhanced prompt with word count
      const enhancedPrompt = `${prompt}. Please write approximately ${wordCount} words.`;
      
      const content = await generateContent({ 
        prompt: enhancedPrompt, 
        contentType: contentType as 'blog' | 'story',
        language,
        tone,
        profession,
        writerStyle
      });
      
      // Extract title from content (first line if it starts with #)
      const lines = content.split('\n');
      const title = lines[0].startsWith('#') ? lines[0].replace('#', '').trim() : prompt;
      
      setGeneratedContent(content);
      setGeneratedTitle(title);
      toast({
        title: "Content Generated!",
        description: `Your ${contentType} has been successfully generated.`
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !generatedTitle) return;
    
    setIsSaving(true);
    
    try {
      await saveContent(generatedTitle, generatedContent, contentType as 'blog' | 'story');
      toast({
        title: "Content Saved!",
        description: "Your content has been saved to your dashboard."
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateVideo = () => {
    if (!generatedContent || !generatedTitle) {
      toast({
        title: "No Content",
        description: "Please generate content first before creating a video.",
        variant: "destructive"
      });
      return;
    }
    setShowVideoPlayer(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard."
      });
    }
  };

  return (
    <>
      {showVideoPlayer && (
        <StoryVideoPlayer
          content={generatedContent}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
      
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Tearix</span>
          </Link>
        </div>
        <div className="space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="text-white hover:text-purple-300"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">AI Content Generator</h1>
          <p className="text-xl text-gray-300">Create amazing blogs and stories with AI assistance</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-purple-400" />
                Content Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your content generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content-type" className="text-gray-300">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="blog" className="text-white">
                      <div className="flex items-center">
                        <PenTool className="h-4 w-4 mr-2" />
                        Blog Post
                      </div>
                    </SelectItem>
                    <SelectItem value="story" className="text-white">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Creative Story
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-gray-300">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder={contentType === 'blog' 
                    ? "Enter your blog topic or theme... (e.g., 'The Future of AI in Healthcare')"
                    : contentType === 'story'
                    ? "Describe your story idea... (e.g., 'A magical adventure in an enchanted forest')"
                    : "First, select a content type above, then enter your creative prompt here..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 resize-none"
                />
              </div>

              {/* Word Count Field */}
              <div className="space-y-2">
                <Label htmlFor="word-count" className="text-gray-300">Target Word Count</Label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select word count" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="250" className="text-white">250 words (Short)</SelectItem>
                    <SelectItem value="500" className="text-white">500 words (Medium)</SelectItem>
                    <SelectItem value="750" className="text-white">750 words (Long)</SelectItem>
                    <SelectItem value="1000" className="text-white">1000 words (Extended)</SelectItem>
                    <SelectItem value="1500" className="text-white">1500 words (Detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* New Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-300">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="English" className="text-white">English</SelectItem>
                      <SelectItem value="Spanish" className="text-white">Spanish</SelectItem>
                      <SelectItem value="French" className="text-white">French</SelectItem>
                      <SelectItem value="German" className="text-white">German</SelectItem>
                      <SelectItem value="Hindi" className="text-white">Hindi</SelectItem>
                      {/* Add more languages as needed */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-gray-300">Tone (optional)</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Neutral" className="text-white">Neutral</SelectItem>
                      <SelectItem value="Formal" className="text-white">Formal</SelectItem>
                      <SelectItem value="Informal" className="text-white">Informal</SelectItem>
                      <SelectItem value="Humorous" className="text-white">Humorous</SelectItem>
                      <SelectItem value="Serious" className="text-white">Serious</SelectItem>
                      <SelectItem value="Optimistic" className="text-white">Optimistic</SelectItem>
                      <SelectItem value="Humanized" className="text-white">Humanized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-gray-300">Profession (optional)</Label>
                  <Textarea
                    id="profession"
                    placeholder="e.g., 'a marketing expert', 'a scientist'"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="min-h-[40px] bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="writer-style" className="text-gray-300">Writer Style (optional)</Label>
                  <Select value={writerStyle} onValueChange={setWriterStyle}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select writer style" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Neutral" className="text-white">Neutral</SelectItem>
                      <SelectItem value="Creative" className="text-white">Creative</SelectItem>
                      <SelectItem value="Technical" className="text-white">Technical</SelectItem>
                      <SelectItem value="Journalistic" className="text-white">Journalistic</SelectItem>
                      <SelectItem value="Academic" className="text-white">Academic</SelectItem>
                      <SelectItem value="Humanized" className="text-white">Humanized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Humanized Notes */}
              {(tone === 'Humanized' || writerStyle === 'Humanized') && (
                <div className="space-y-2 text-sm text-gray-400 italic bg-slate-700/50 p-4 rounded-md border border-slate-600">
                  <p>
                    When selecting "Humanized" tone or writer style, the AI will attempt to make the output sound more natural, less robotic, and potentially include common human conversational elements or stylistic nuances.
                  </p>
                  {tone === 'Humanized' && <p>Focusing on a Humanized Tone.</p>}
                  {writerStyle === 'Humanized' && <p>Focusing on a Humanized Writer Style.</p>}
                  {profession && <p>Considering the perspective of: {profession}</p>}
                   <p>
                    Note: The effectiveness of "Humanized" output can vary based on the AI model and complexity of the prompt.
                   </p>
                </div>
              )}

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || !contentType}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {generatedContent && generatedTitle && (
 <h3 className="text-xl font-semibold text-white mr-4">{generatedTitle}</h3>
                  )}
                  {contentType === 'blog' ? (
                    <PenTool className="h-5 w-5 mr-2 text-purple-400" />
                  ) : (
                    <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
                  )}
                  <span className="text-white">
                    Generated Content
                  </span>
                </div>
                {generatedContent && (
 <Button onClick={handleCopy} size="sm" variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Copy
                  </Button>
                )}
 </div>

              {generatedContent && (
                 <div className="flex justify-end mb-4">
                 
                  {contentType === 'story' && (
                    <div className="flex items-center space-x-4">
                      {/* Video Duration Estimate */}
                      <div className="flex items-center text-sm text-gray-300 bg-slate-700/70 px-4 py-2 rounded-lg border border-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          Video: ~{Math.floor(calculateVideoDuration() / 60)}:{(calculateVideoDuration() % 60).toString().padStart(2, '0')} min
                        </span>
                      </div>
                      
                      <Button
                        onClick={handleGenerateVideo}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
                      >
                        🎬 Create Video
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
               </div>
             )}
              <CardDescription className="text-gray-400">
                Your AI-generated content will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="bg-slate-700 rounded-lg p-6 min-h-[400px] relative">
                  {/* Content Stats */}
                  <div className="absolute top-2 right-2 flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      <span className="font-medium">{generatedContent.split(' ').length} words</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="font-medium">~{Math.ceil(generatedContent.split(' ').length / 200)} min read</span>
                    </div>
                  </div>
                  
                  <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="bg-slate-700 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50 text-purple-400" />
                    <p>Your generated content will appear here</p>
                    <p className="text-sm mt-2">Enter a prompt and click generate to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default Generate;