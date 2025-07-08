import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Download, X, Sparkles, CheckCircle, Settings } from 'lucide-react';
import { generateContent } from '@/lib/gemini';

interface StoryVideoPlayerProps {
  content: string;
  onClose: () => void;
}

type Speed = 'slow' | 'medium' | 'fast';
type AspectRatio = '16:9' | '9:16' | '1:1';
type TextSize = 'small' | 'medium' | 'large';

const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = ({ content, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('medium');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aiTitle, setAiTitle] = useState('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Speed configurations (pixels per second)
  const speedConfig = {
    slow: 30,
    medium: 50,
    fast: 80
  };

  // Aspect ratio configurations
  const aspectRatioConfig = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 720, height: 1280 },
    '1:1': { width: 1080, height: 1080 }
  };

  // Text size configurations
  const textSizeConfig = {
    small: {
      title: 48,
      content: 24,
      endText: 36,
      lineHeight: 32,
      paragraphSpacing: 50
    },
    medium: {
      title: 64,
      content: 32,
      endText: 48,
      lineHeight: 42,
      paragraphSpacing: 60
    },
    large: {
      title: 80,
      content: 40,
      endText: 60,
      lineHeight: 52,
      paragraphSpacing: 70
    }
  };

  // Generate AI title when component mounts
  useEffect(() => {
    generateAITitle();
  }, [content]);

  const generateAITitle = async () => {
    setIsGeneratingTitle(true);
    try {
      const titlePrompt = `Based on the following content, generate a short, catchy, and engaging title (maximum 6 words). Only return the title, nothing else:\n\n${content.substring(0, 400)}...`;
      
      const generatedTitle = await generateContent({
        prompt: titlePrompt,
        contentType: 'story',
        language: 'English'
      });
      
      // Clean the title (remove quotes, extra formatting)
      const cleanTitle = generatedTitle.replace(/['"#*\n]/g, '').trim();
      setAiTitle(cleanTitle || 'An Amazing Story');
    } catch (error) {
      console.error('Failed to generate AI title:', error);
      setAiTitle('An Amazing Story');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Calculate total duration based on content length and speed
  useEffect(() => {
    if (contentRef.current && aiTitle) {
      const contentHeight = contentRef.current.scrollHeight;
      const containerHeight = window.innerHeight;
      const totalDistance = contentHeight + containerHeight + 300;
      const pixelsPerSecond = speedConfig[speed];
      const scrollTime = totalDistance / pixelsPerSecond;
      const titleTime = 4;
      const fadeTime = 2;
      const creditsTime = 3;
      
      setDuration(Math.ceil(titleTime + fadeTime + scrollTime + creditsTime));
    }
  }, [content, speed, aiTitle]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !aiTitle) return;

    const startTime = Date.now() - (currentTime * 1000);
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);

      if (elapsed >= duration) {
        setIsPlaying(false);
        setCurrentTime(duration);
        return;
      }

      const pixelsPerSecond = speedConfig[speed];

      // Title animation: shows for 4 seconds, then fades out over 2 seconds
      if (titleRef.current) {
        if (elapsed < 4) {
          titleRef.current.style.transform = 'translateY(0) scale(1)';
          titleRef.current.style.opacity = '1';
        } else if (elapsed < 6) {
          const fadeProgress = (elapsed - 4) / 2;
          titleRef.current.style.opacity = (1 - fadeProgress).toString();
          titleRef.current.style.transform = `translateY(-${fadeProgress * 50}px) scale(${1 - fadeProgress * 0.1})`;
        } else {
          titleRef.current.style.opacity = '0';
          titleRef.current.style.transform = 'translateY(-50px) scale(0.9)';
        }
      }

      // Content animation: starts after title (6 seconds)
      if (contentRef.current) {
        if (elapsed >= 6) {
          const contentElapsed = elapsed - 6;
          const contentMoveDistance = contentElapsed * pixelsPerSecond;
          const containerHeight = window.innerHeight;
          
          contentRef.current.style.transform = `translateY(${containerHeight - contentMoveDistance}px)`;
        } else {
          contentRef.current.style.transform = `translateY(100vh)`;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, speed, aiTitle]);

  const handlePlay = () => {
    if (!aiTitle || isGeneratingTitle) return;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setExportComplete(false);
    
    // Reset positions
    if (titleRef.current) {
      titleRef.current.style.transform = 'translateY(0) scale(1)';
      titleRef.current.style.opacity = '1';
    }
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(100vh)';
    }
  };

  const handleExportVideo = async () => {
    if (!aiTitle || isGeneratingTitle) return;
    
    setIsExporting(true);
    setExportComplete(false);
    recordedChunksRef.current = [];
    
    try {
      // Get dimensions based on aspect ratio
      const dimensions = aspectRatioConfig[aspectRatio];
      const textConfig = textSizeConfig[textSize];
      
      // Create a canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Get canvas stream with higher frame rate for faster export
      const stream = canvas.captureStream(60); // Increased to 60 FPS for smoother export
      
      // Create MediaRecorder with optimized settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8', // Changed to vp8 for faster encoding
        videoBitsPerSecond: 2500000 // Optimized bitrate
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${aiTitle.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase()}_story_${aspectRatio.replace(':', 'x')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setExportComplete(true);
        setIsExporting(false);
      };
      
      // Start recording
      mediaRecorder.start(100);
      
      // Render frames with optimized timing
      const ctx = canvas.getContext('2d')!;
      const fps = 30; // Keep 30 FPS for output
      const totalFrames = duration * fps;
      const pixelsPerSecond = speedConfig[speed];
      
      // Batch frame rendering for faster export
      const renderBatch = async (startFrame: number, endFrame: number) => {
        for (let frame = startFrame; frame < endFrame; frame++) {
          const currentTime = frame / fps;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // White background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Render title phase (0-6 seconds)
          if (currentTime < 6) {
            ctx.fillStyle = 'black';
            ctx.font = `bold ${textConfig.title}px Arial`;
            ctx.textAlign = 'center';
            
            if (currentTime < 4) {
              // Title visible
              ctx.globalAlpha = 1;
              
              // Wrap title text
              const words = aiTitle.split(' ');
              let lines = [];
              let currentLine = '';
              
              words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > canvas.width - 100 && currentLine !== '') {
                  lines.push(currentLine.trim());
                  currentLine = word + ' ';
                } else {
                  currentLine = testLine;
                }
              });
              
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              
              // Draw title lines
              const lineHeight = textConfig.title + 20;
              const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
              
              lines.forEach((line, index) => {
                ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
              });
              
            } else {
              // Title fading out
              const fadeProgress = (currentTime - 4) / 2;
              ctx.globalAlpha = 1 - fadeProgress;
              
              // Wrap title text
              const words = aiTitle.split(' ');
              let lines = [];
              let currentLine = '';
              
              words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > canvas.width - 100 && currentLine !== '') {
                  lines.push(currentLine.trim());
                  currentLine = word + ' ';
                } else {
                  currentLine = testLine;
                }
              });
              
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              
              // Draw fading title lines
              const lineHeight = textConfig.title + 20;
              const startY = canvas.height / 2 - (lines.length * lineHeight) / 2 - fadeProgress * 30;
              
              lines.forEach((line, index) => {
                ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
              });
            }
            ctx.globalAlpha = 1;
          }
          
          // Render content phase (6+ seconds)
          if (currentTime >= 6) {
            const contentTime = currentTime - 6;
            const scrollOffset = contentTime * pixelsPerSecond;
            
            ctx.fillStyle = 'black';
            ctx.font = `${textConfig.content}px Arial`;
            ctx.textAlign = 'center';
            
            const lines = content.split('\n').filter(line => line.trim());
            let yPosition = canvas.height - scrollOffset + 100;
            
            lines.forEach((line) => {
              if (yPosition > -100 && yPosition < canvas.height + 100) {
                // Wrap text
                const words = line.split(' ');
                let currentLine = '';
                
                words.forEach(word => {
                  const testLine = currentLine + word + ' ';
                  const metrics = ctx.measureText(testLine);
                  
                  if (metrics.width > canvas.width - 80 && currentLine !== '') {
                    if (yPosition > 0 && yPosition < canvas.height) {
                      ctx.fillText(currentLine.trim(), canvas.width / 2, yPosition);
                    }
                    currentLine = word + ' ';
                    yPosition += textConfig.lineHeight;
                  } else {
                    currentLine = testLine;
                  }
                });
                
                if (currentLine.trim() && yPosition > 0 && yPosition < canvas.height) {
                  ctx.fillText(currentLine.trim(), canvas.width / 2, yPosition);
                }
                yPosition += textConfig.paragraphSpacing;
              } else {
                yPosition += textConfig.paragraphSpacing;
              }
            });
            
            // Add "The End" at the end
            if (yPosition - scrollOffset < canvas.height / 2) {
              ctx.font = `bold ${textConfig.endText}px Arial`;
              ctx.fillText('The End', canvas.width / 2, yPosition + 100);
            }
          }
        }
      };
      
      // Render in batches for better performance
      const batchSize = 60; // Process 60 frames at a time
      for (let i = 0; i < totalFrames; i += batchSize) {
        await renderBatch(i, Math.min(i + batchSize, totalFrames));
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Stop recording
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  // Split content into paragraphs for better animation
  const contentLines = content.split('\n').filter(line => line.trim());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            size="sm"
            disabled={isGeneratingTitle || !aiTitle || isExporting}
            className="bg-black/80 hover:bg-black text-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={handleReset}
            size="sm"
            disabled={isGeneratingTitle || isExporting}
            className="bg-black/80 hover:bg-black text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Select value={speed} onValueChange={(value: Speed) => setSpeed(value)} disabled={isExporting}>
            <SelectTrigger className="w-32 bg-black/80 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <div className="text-black text-sm bg-gray-200 px-3 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isGeneratingTitle && (
            <div className="flex items-center text-white bg-purple-600 px-3 py-1 rounded">
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating AI title...
            </div>
          )}
          
          {exportComplete && (
            <div className="flex items-center text-white bg-green-600 px-3 py-1 rounded">
              <CheckCircle className="h-4 w-4 mr-2" />
              Video exported!
            </div>
          )}
          
          <Button
            onClick={handleExportVideo}
            size="sm"
            disabled={isGeneratingTitle || !aiTitle || isExporting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
          >
            {isExporting ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Exporting Video...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Export Complete
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Video ({aspectRatio})
              </>
            )}
          </Button>
          
          <Button
            onClick={onClose}
            size="sm"
            className="bg-black/80 hover:bg-black text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-xl border border-gray-300 p-4 min-w-[300px]">
          <h3 className="text-lg font-semibold text-black mb-4">Video Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape - 1920x1080)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait - 720x1280)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square - 1080x1080)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Text Size</label>
              <Select value={textSize} onValueChange={(value: TextSize) => setTextSize(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-600">
                Resolution: {aspectRatioConfig[aspectRatio].width}x{aspectRatioConfig[aspectRatio].height}
              </p>
              <p className="text-xs text-gray-600">
                Text sizes: Title {textSizeConfig[textSize].title}px, Content {textSizeConfig[textSize].content}px
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div 
        ref={videoContainerRef}
        className="w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden"
      >
        {/* AI Generated Title */}
        <div
          ref={titleRef}
          className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-center z-20"
          style={{ transition: 'none' }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 mx-8 shadow-2xl border border-purple-200">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight drop-shadow-sm">
              {isGeneratingTitle ? (
                <div className="flex items-center justify-center text-purple-600">
                  <Sparkles className="h-16 w-16 mr-4 animate-spin" />
                  <span className="text-4xl">Generating Title...</span>
                </div>
              ) : (
                aiTitle
              )}
            </h1>
            <div className="mt-6 flex items-center justify-center space-x-3">
              <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <p className="text-2xl text-gray-600 font-medium">
                
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div
          ref={contentRef}
          className="absolute inset-x-0 w-full"
          style={{ 
            transform: 'translateY(100vh)',
            transition: 'none'
          }}
        >
          <div className="max-w-5xl mx-auto px-12 py-20">
            {contentLines.map((line, index) => (
              <div key={index} className="mb-12">
                <p className="text-4xl text-gray-800 leading-relaxed text-center font-light tracking-wide">
                  {line}
                </p>
                {index < contentLines.length - 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
            
            {/* End credits */}
            <div className="text-center py-40">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-purple-100">
                <h2 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                  The End
                </h2>
                <div className="space-y-4">
                  <p className="text-2xl text-gray-600 font-medium">Thank you for reading</p>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    <p className="text-lg text-gray-500">_____</p>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-gray-200 rounded-full h-3 relative shadow-inner">
          {isExporting && (
            <div className="absolute -top-8 left-0 text-purple-600 text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse" />
              Exporting {aspectRatio} video... Please wait
            </div>
          )}
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-3 transition-all duration-300 shadow-sm"
            style={{ width: `${Math.min((currentTime / duration) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Hidden canvas for recording */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default StoryVideoPlayer;