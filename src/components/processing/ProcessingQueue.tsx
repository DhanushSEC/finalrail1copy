
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, FileVideo, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoRecord } from '@/types';
import { getVideoRecords, updateVideoStatus, deleteVideoRecord } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

const ProcessingQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [queuedVideos, setQueuedVideos] = useState<VideoRecord[]>([]);
  const [completedVideos, setCompletedVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [videoToDelete, setVideoToDelete] = useState<VideoRecord | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchVideos();
      const interval = setInterval(fetchVideos, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch queued videos
      const queued = await getVideoRecords(user.id, 'Queued');
      console.log('Fetched queued videos:', queued);
      setQueuedVideos(queued || []);
      
      // Fetch completed videos
      const completed = await getVideoRecords(user.id, 'Completed');
      console.log('Fetched completed videos:', completed);
      setCompletedVideos(completed || []);
    } catch (error) {
      console.error('Error fetching video records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load processing queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const simulateProcessingComplete = async (video: VideoRecord) => {
    try {
      console.log('Updating video status to Completed:', video.id);
      await updateVideoStatus(video.id, 'Completed');
      
      // Update local state
      setQueuedVideos(prev => prev.filter(v => v.id !== video.id));
      setCompletedVideos(prev => [{ ...video, status: 'Completed' }, ...prev]);
      
      toast({
        title: 'Processing Complete',
        description: 'Your video has been processed successfully.',
      });
    } catch (error) {
      console.error('Error updating video status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video status',
        variant: 'destructive',
      });
    }
  };

  // Handle video deletion + confirmation dialog
  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    setDeleting(true);
    try {
      await deleteVideoRecord(
        videoToDelete.id, 
        videoToDelete.video_url, 
        videoToDelete.gps_log_url
      );
      
      // Update local state to remove the deleted video
      if (videoToDelete.status === 'Queued') {
        setQueuedVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
      } else if (videoToDelete.status === 'Completed') {
        setCompletedVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
      }
      
      toast({
        title: 'Video deleted',
        description: 'Your video and associated files were deleted.',
      });
    } catch (e) {
      console.error('Error deleting video:', e);
      toast({
        title: 'Error',
        description: 'Failed to delete video.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setVideoToDelete(null);
      setAlertOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Video Processing</h1>

      <Tabs defaultValue="queued">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="queued">
            Queued ({queuedVideos.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedVideos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queued" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : queuedVideos.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/50">
              <FileVideo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No videos in queue</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start by recording a video on the Record page
              </p>
              <Link to="/record" className="mt-4 inline-block">
                <Button>Record Video</Button>
              </Link>
            </div>
          ) : (
            queuedVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <FileVideo className="h-5 w-5 mr-2" />
                      Video {video.id.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Uploaded: {formatDate(video.created_at)}
                    </CardDescription>
                  </div>
                  <AlertDialog open={alertOpen && videoToDelete?.id === video.id} onOpenChange={(open) => {
                    if (!open) setVideoToDelete(null);
                    setAlertOpen(open);
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoToDelete(video);
                          setAlertOpen(true);
                        }}
                        title="Delete video"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this video?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this video and its files.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={deleting}
                          onClick={() => {
                            setVideoToDelete(null);
                            setAlertOpen(false);
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleting}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteVideo();
                          }}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="text-xs text-muted-foreground">
                    This may take a few minutes
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => simulateProcessingComplete(video)}
                  >
                    Simulate Completion
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : completedVideos.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/50">
              <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No completed videos</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your processed videos will appear here
              </p>
              <Link to="/record" className="mt-4 inline-block">
                <Button>Record Video</Button>
              </Link>
            </div>
          ) : (
            completedVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <FileVideo className="h-5 w-5 mr-2" />
                      Video {video.id.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Processed: {formatDate(video.created_at)}
                    </CardDescription>
                  </div>
                  <AlertDialog open={alertOpen && videoToDelete?.id === video.id} onOpenChange={(open) => {
                    if (!open) setVideoToDelete(null);
                    setAlertOpen(open);
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoToDelete(video);
                          setAlertOpen(true);
                        }}
                        title="Delete video"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this video?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this video and its files.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={deleting}
                          onClick={() => {
                            setVideoToDelete(null);
                            setAlertOpen(false);
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleting}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteVideo();
                          }}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span>Processing complete</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link 
                    to={`/dashboard?videoId=${video.id}`}
                    className="ml-auto"
                  >
                    <Button>
                      View Results
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessingQueue;
