import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  disabled?: boolean;
  maxSizeKB?: number;
  acceptedFormats?: string[];
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  disabled = false,
  maxSizeKB = 500, // 500KB default limit for Chrome extension
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Please use: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      return `File too large. Maximum size: ${maxSizeKB}KB (current: ${Math.round(fileSizeKB)}KB)`;
    }

    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Upload Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for storage in Chrome extension
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        
        toast({
          title: "Image uploaded successfully!",
          description: `${file.name} (${Math.round(file.size / 1024)}KB)`,
        });
        
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to read the image file",
          variant: "destructive",
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlChange = (url: string) => {
    // Validate URL format
    try {
      new URL(url);
      onImageChange(url);
    } catch {
      // If not a valid URL, still allow it (user might be typing)
      onImageChange(url);
    }
  };

  const removeImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>Custom Motivation Image</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Image URL</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={currentImage?.startsWith('data:') ? '' : currentImage || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Or upload a file</Label>
        <Card
          className={`
            relative border-2 border-dashed transition-colors cursor-pointer
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? triggerFileSelect : undefined}
        >
          <div className="p-6 text-center">
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop an image here or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    Max {maxSizeKB}KB • {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Image Preview */}
      {currentImage && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Preview</Label>
          <div className="relative inline-block">
            <img 
              src={currentImage} 
              alt="Custom motivation" 
              className="h-24 w-24 object-cover rounded-lg border shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
                toast({
                  title: "Image load error",
                  description: "Failed to load the image. Please check the URL or try a different image.",
                  variant: "destructive",
                });
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Image Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            {currentImage.startsWith('data:') ? (
              <div className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                <span>Uploaded file ({Math.round(currentImage.length * 0.75 / 1024)}KB estimated)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                <span>External URL</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p><strong>Tips:</strong></p>
            <ul className="space-y-0.5 ml-2">
              <li>• Use motivational images that inspire you</li>
              <li>• Keep files under {maxSizeKB}KB to avoid storage issues</li>
              <li>• Square images work best for the popup display</li>
              <li>• Images are stored locally for privacy</li>
              <li>• If you get storage errors, try a smaller image</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}