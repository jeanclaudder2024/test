import { TranslationWidget } from '@/components/TranslationWidget';
import { GlobeIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

// Preset language pairs
const presets: {
  [key: string]: { source: string; target: string; autoDetect: boolean }
} = {
  'english-to-arabic': { source: 'en', target: 'ar', autoDetect: false },
  'arabic-to-english': { source: 'ar', target: 'en', autoDetect: false },
  'english-to-spanish': { source: 'en', target: 'es', autoDetect: false },
  'english-to-french': { source: 'en', target: 'fr', autoDetect: false },
  'english-to-chinese': { source: 'en', target: 'zh', autoDetect: false },
  'english-to-russian': { source: 'en', target: 'ru', autoDetect: false },
};

export default function TranslationPage() {
  const [location] = useLocation();
  const [preset, setPreset] = useState<{ source: string, target: string, autoDetect: boolean } | null>(null);

  useEffect(() => {
    // Parse URL query parameters
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const presetParam = searchParams.get('preset');
    
    if (presetParam && presets[presetParam]) {
      setPreset(presets[presetParam]);
    } else {
      setPreset(null);
    }
  }, [location]);
  return (
    <div>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6 space-x-2">
          <GlobeIcon className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Maritime Translation Portal</h1>
        </div>
        
        <div className="mb-8 max-w-3xl">
          <p className="text-lg text-muted-foreground">
            Our AI-powered translation service specializes in maritime and shipping terminology, 
            supporting over 10 languages to help facilitate international communication in the maritime industry.
          </p>
        </div>
        
        <TranslationWidget 
          initialSourceLanguage={preset?.source}
          initialTargetLanguage={preset?.target}
          initialAutoDetect={preset?.autoDetect ?? true}
        />
        
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Common Maritime Phrases</h2>
            <ul className="space-y-2">
              <li>• Vessel tracking and routing</li>
              <li>• Port operations and berthing</li>
              <li>• Cargo manifests and loading plans</li>
              <li>• Maritime safety regulations</li>
              <li>• Equipment specifications</li>
              <li>• Weather conditions and advisories</li>
            </ul>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Translation Tips</h2>
            <ul className="space-y-2">
              <li>• Use specific industry terminology for more accurate translations</li>
              <li>• Include context about the vessel type or cargo when relevant</li>
              <li>• For technical documents, translate section by section</li>
              <li>• Verify critical safety information with native speakers</li>
              <li>• Use batch translation for processing multiple fields at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}