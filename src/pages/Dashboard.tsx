import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, PenTool, BookOpen, Plus, Edit, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/hooks/useContent";

const Dashboard = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const { contents, deleteContent, subscribeToContents } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToContents();
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteContent(id);
      toast({
        title: "Content Deleted",
        description: `"${title}" has been removed from your collection.`
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date().toLocaleDateString();
  };

  const getPreview = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  const blogs = contents.filter(item => item.type === 'blog');
  const stories = contents.filter(item => item.type === 'story');

  return (
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
          <Link to="/generate">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New
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
          <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-xl text-white">Manage your AI-generated content</p>
        </div>

        {/* Stats Cards - text-black seems fine on these gradients for now */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Content</CardTitle>
              <Sparkles className="h-4 w-4 text-white"/>
            </CardHeader> 
            <CardContent className="text-white">
              <div className="text-2xl font-bold text-white">{contents.length}</div>
              <p className="text-xs text-white">Pieces created</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Blog Posts</CardTitle>
              <PenTool className="h-4 w-4 text-white" />
            </CardHeader> 
            <CardContent className="text-white">
              <div className="text-2xl font-bold text-white">{blogs.length}</div>
              <p className="text-xs text-white">Blog articles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Stories</CardTitle>
              <BookOpen className="h-4 w-4 text-white" />
            </CardHeader> 
            <CardContent className="text-white">
              <div className="text-2xl font-bold text-white">{stories.length}</div>
              <p className="text-xs text-white">Creative stories</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="all" className="text-white data-[state=active]:text-white">
              All Content ({contents.length})
            </TabsTrigger>
            <TabsTrigger value="blogs" className="text-white data-[state=active]:text-white">
              Blogs ({blogs.length})
            </TabsTrigger>
            <TabsTrigger value="stories" className="text-white data-[state=active]:text-white">
              Stories ({stories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {contents.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {item.type === 'blog' ? (
                          <PenTool className="h-5 w-5 text-white" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-green-400" />
                        )}
                        <div className="text-white">
                          <CardTitle className="text-white">{item.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={item.type === 'blog' ? 'default' : 'secondary'} className="text-xs">
                              {item.type === 'blog' ? 'Blog' : 'Story'} 
                            </Badge>
                            <div className="flex items-center text-xs text-white">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(item.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-white hover:text-red-400"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white line-clamp-2">{getPreview(item.content)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blogs" className="mt-6">
            <div className="grid gap-6">
              {blogs.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <PenTool className="h-5 w-5 text-blue-400" />
                        <div className="text-white">
                          <CardTitle className="text-white">{item.title}</CardTitle>
                          <div className="flex items-center text-xs text-white mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.createdAt)} 
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:text-red-400"
                          onClick={() => handleDelete(item.id, item.title)} 
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white line-clamp-2">{getPreview(item.content)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="mt-6">
            <div className="grid gap-6">
              {stories.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-green-400" />
                        <div className="text-white">
                          <CardTitle className="text-white">{item.title}</CardTitle>
                          <div className="flex items-center text-xs text-white mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.createdAt)} 
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:text-red-400"
                          onClick={() => handleDelete(item.id, item.title)} 
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white line-clamp-2">{getPreview(item.content)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {contents.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
            <CardContent>
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No content yet</h3>
            <p className="text-white mb-6">Start creating amazing blogs and stories with AI</p>
              <Link to="/generate">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;