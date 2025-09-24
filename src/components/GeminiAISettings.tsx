import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Sparkles, Key, Zap, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeminiModel {
  id: string;
  name: string;
  inputTokens: number;
  outputTokens: number;
  description: string;
}

const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    inputTokens: 1000000,
    outputTokens: 8192,
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    inputTokens: 2000000,
    outputTokens: 8192,
    description: 'Advanced reasoning and complex tasks'
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    inputTokens: 30720,
    outputTokens: 2048,
    description: 'Balanced performance and speed'
  }
];

export function GeminiAISettings() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const { toast } = useToast();

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (response.ok) {
        setValidationStatus('valid');
        toast({
          title: "API Key Valid ✅",
          description: "Your Gemini API key is working correctly.",
        });
        // Save to localStorage for now
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('gemini_model', selectedModel);
      } else {
        setValidationStatus('invalid');
        toast({
          title: "Invalid API Key ❌",
          description: "Please check your API key and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setValidationStatus('invalid');
      toast({
        title: "Connection Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const saveSettings = () => {
    if (validationStatus !== 'valid') {
      toast({
        title: "Validation Required",
        description: "Please validate your API key before saving.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_model', selectedModel);
    
    toast({
      title: "Settings Saved",
      description: "Your Gemini AI settings have been saved successfully.",
    });
  };

  // Load saved settings on component mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model');
    
    if (savedKey) {
      setApiKey(savedKey);
      setValidationStatus('valid');
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const selectedModelInfo = GEMINI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Gemini AI Configuration
        </h3>
        
        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gemini API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationStatus('none');
                  }}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validationStatus === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {validationStatus === 'invalid' && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <Button
                onClick={validateApiKey}
                disabled={isValidating || !apiKey.trim()}
                variant="outline"
              >
                {isValidating ? 'Validating...' : 'Test'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <Separator />

          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a Gemini model" />
              </SelectTrigger>
              <SelectContent>
                {GEMINI_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Information */}
          {selectedModelInfo && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {selectedModelInfo.name} Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Input Tokens</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedModelInfo.inputTokens.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Output Tokens</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedModelInfo.outputTokens.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedModelInfo.description}
              </p>
            </Card>
          )}

          <Separator />

          {/* API Usage Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Usage Information
            </Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Your API key is stored locally in your browser</p>
              <p>• Free tier includes 15 requests per minute</p>
              <p>• AI features: Quote generation, inspiration messages, productivity tips</p>
            </div>
          </div>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings}
              disabled={validationStatus !== 'valid'}
              variant="timer"
            >
              <Key className="mr-2 h-4 w-4" />
              Save AI Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}