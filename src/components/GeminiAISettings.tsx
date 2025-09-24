import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Sparkles, Key, Zap, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchGeminiModels, GeminiModel } from '@/lib/gemini';

interface GeminiModel {
  id: string;
  name: string;
  inputTokens: number;
  outputTokens: number;
  description: string;
}

// Remove the hardcoded GEMINI_MODELS array
// const GEMINI_MODELS: GeminiModel[] = [
//   {
//     id: 'gemini-2.0-flash-exp',
//     name: 'Gemini 2.0 Flash (Experimental)',
//     inputTokens: 1000000,
//     outputTokens: 8192,
//     description: 'Latest experimental model with enhanced capabilities'
//   },
//   {
//     id: 'gemini-1.5-flash',
//     name: 'Gemini 1.5 Flash',
//     inputTokens: 1000000,
//     outputTokens: 8192,
//     description: 'Fast and efficient for most tasks'
//   },
//   {
//     id: 'gemini-1.5-flash-8b',
//     name: 'Gemini 1.5 Flash-8B',
//     inputTokens: 1000000,
//     outputTokens: 8192,
//     description: 'Optimized version with 8B parameters'
//   },
//   {
//     id: 'gemini-1.5-pro',
//     name: 'Gemini 1.5 Pro',
//     inputTokens: 2000000,
//     outputTokens: 8192,
//     description: 'Advanced reasoning and complex tasks'
//   },
//   {
//     id: 'gemini-1.5-pro-exp-0827',
//     name: 'Gemini 1.5 Pro (Experimental)',
//     inputTokens: 2000000,
//     outputTokens: 8192,
//     description: 'Latest experimental Pro model'
//   },
//   {
//     id: 'gemini-1.0-pro',
//     name: 'Gemini 1.0 Pro',
//     inputTokens: 30720,
//     outputTokens: 2048,
//     description: 'Balanced performance and speed'
//   },
//   {
//     id: 'gemini-1.0-pro-vision',
//     name: 'Gemini 1.0 Pro Vision',
//     inputTokens: 12288,
//     outputTokens: 4096,
//     description: 'Optimized for image and text understanding'
//   },
//   {
//     id: 'gemini-pro',
//     name: 'Gemini Pro',
//     inputTokens: 30720,
//     outputTokens: 2048,
//     description: 'General purpose model for text tasks'
//   }
// ];

export function GeminiAISettings() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
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
    setLoadingModels(true);
    
    try {
      const models = await fetchGeminiModels(apiKey);
      setAvailableModels(models);
      if (models.length > 0) {
        setValidationStatus('valid');
        toast({
          title: "API Key Valid ✅",
          description: "Your Gemini API key is working correctly and models are loaded.",
        });
        localStorage.setItem('gemini_api_key', apiKey);
        // If a previously selected model is not in the new list, default to the first available
        if (!models.some(m => m.name === selectedModel)) {
          setSelectedModel(models[0].name);
          localStorage.setItem('gemini_model', models[0].name);
        } else {
          localStorage.setItem('gemini_model', selectedModel);
        }
      } else {
        setValidationStatus('invalid');
        toast({
          title: "No Models Found ⚠️",
          description: "API key is valid, but no compatible Gemini models were found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setValidationStatus('invalid');
      toast({
        title: "Invalid API Key ❌",
        description: `Failed to validate API key or fetch models: ${error instanceof Error ? error.message : String(error)}.`, 
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
      setLoadingModels(false);
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

  // Load saved settings and models on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model');
    
    if (savedKey) {
      setApiKey(savedKey);
      // Attempt to fetch models with the saved key
      const loadModels = async () => {
        setLoadingModels(true);
        try {
          const models = await fetchGeminiModels(savedKey);
          setAvailableModels(models);
          if (models.length > 0) {
            setValidationStatus('valid');
            if (savedModel && models.some(m => m.name === savedModel)) {
              setSelectedModel(savedModel);
            } else {
              setSelectedModel(models[0].name);
              localStorage.setItem('gemini_model', models[0].name);
            }
          } else {
            setValidationStatus('invalid');
          }
        } catch (error) {
          setValidationStatus('invalid');
          console.error("Error loading models on mount:", error);
        } finally {
          setLoadingModels(false);
        }
      };
      loadModels();
    }
  }, []);

  const selectedModelInfo = availableModels.find(m => m.name === selectedModel);

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
                    setAvailableModels([]); // Clear models when API key changes
                    setSelectedModel(''); // Clear selected model
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
                {isValidating ? 'Validating...' : 'Test & Load Models'}
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
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loadingModels || availableModels.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingModels ? "Loading models..." : "Choose a Gemini model"} />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length > 0 ? (
                  availableModels.map(model => (
                    <SelectItem key={model.name} value={model.name}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.displayName}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-models" disabled>
                    No models available. Please validate API key.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Model Information */}
          {selectedModelInfo && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {selectedModelInfo.displayName} Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Input Tokens</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedModelInfo.inputTokenLimit.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Output Tokens</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedModelInfo.outputTokenLimit.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Version: {selectedModelInfo.version}
              </p>
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