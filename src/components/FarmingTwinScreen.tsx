import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Lightbulb,
  Mic,
  MicOff,
  FileText,
  PlayCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import mermaid from "mermaid";
import CropWise from "./CropWise";

interface FarmingTwinScreenProps {
  onBack?: () => void;
  activeTab?: "twin" | "recommendations";
}

const FarmingTwinScreen: React.FC<FarmingTwinScreenProps> = ({
  onBack,
  activeTab = "twin",
}) => {
  const [currentTab, setCurrentTab] = useState<"twin" | "recommendations">(
    activeTab
  );
  const [showRoadmapDialog, setShowRoadmapDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [roadmapData, setRoadmapData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<"template" | "ai" | "complete">("complete");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const roadmapCacheRef = useRef<Map<string, string>>(new Map());

  // Initialize mermaid with optimized modern settings
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      logLevel: "error",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        padding: 15,
        nodeSpacing: 50,
        rankSpacing: 80,
        diagramPadding: 15,
      },
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#dbeafe",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#3b82f6",
        lineColor: "#60a5fa",
        secondaryColor: "#fef3c7",
        tertiaryColor: "#ddd6fe",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        edgeLabelBackground: "#ffffff",
      },
    });
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Convert audio to text using Gemini
  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Transcribe this audio and extract the crop/plant name mentioned. If no clear crop is mentioned, suggest 'tomato' as default. Respond with just the transcribed text.",
                    },
                    {
                      inlineData: {
                        mimeType: "audio/wav",
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const transcribed =
            data.candidates[0]?.content?.parts[0]?.text || "tomato farming";
          setTranscribedText(transcribed);
          generateRoadmap(transcribed);
        } else {
          // Fallback if audio transcription fails
          const fallbackText = "tomato farming guide";
          setTranscribedText(fallbackText);
          generateRoadmap(fallbackText);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      // Fallback
      const fallbackText = "tomato farming guide";
      setTranscribedText(fallbackText);
      generateRoadmap(fallbackText);
    }
  };

  // Generate structured farming roadmap using Gemini AI with multiple steps
  const generateRoadmap = async (cropText: string) => {
    setIsGenerating(true);
    setGenerationPhase("template");
    
    // Check cache first for instant load
    const cacheKey = cropText.toLowerCase().trim();
    if (roadmapCacheRef.current.has(cacheKey)) {
      const cachedDiagram = roadmapCacheRef.current.get(cacheKey)!;
      setRoadmapData(cachedDiagram);
      await renderMermaid(cachedDiagram);
      setIsGenerating(false);
      setGenerationPhase("complete");
      return;
    }

    try {
      // Quick crop extraction for instant template
      const cropMatch = cropText.match(/\b(tomato|rice|wheat|corn|potato|onion|chilli|pepper|cabbage|carrot|തക്കാളി|നെല്ല്|ഗോധുമ|ചോളം|ഉരുളക്കിഴങ്ങ്|വെങ്കായം|മിളകായ്)\w*/i);
      const detectedCrop = cropMatch ? cropMatch[0] : "crop";
      const ismalayalam = /[\u0D00-\u0D7F]/.test(cropText);
      
      // Show instant beautiful template first
      const templateDiagram = createTemplateRoadmap(detectedCrop, ismalayalam ? "malayalam" : "english");
      setRoadmapData(templateDiagram);
      await renderMermaid(templateDiagram);
      setGenerationPhase("ai");
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("API key not found, using template");
        roadmapCacheRef.current.set(cacheKey, templateDiagram);
        setIsGenerating(false);
        setGenerationPhase("complete");
        return;
      }

      // Simplified fast analysis
      const languageDetectionPrompt = `Extract key info from: "${cropText}"\nReturn JSON only:\n{\n  "detected_language": "malayalam" or "english",\n  "crop": "main crop",\n  "experience": "beginner/intermediate/expert",\n  "goals": "primary goals"\n}`;

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: languageDetectionPrompt }] }],
          }),
        }
      );

      let userAnalysis = {
        detected_language: "english",
        english_translation: cropText,
        original_text: cropText,
        crop: detectedCrop,
        variety: "hybrid",
        area: "1 acre",
        season: "spring",
        location: "temperate region",
        experience: "beginner",
        goals: "good yield",
        budget: "moderate",
        timeline: "one season",
        challenges: "general farming",
        methods: "conventional",
        market: "local",
        specific_questions: "complete farming process",
        context: "general farming guidance",
      };

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        const analysisText =
          analysisData.candidates[0]?.content?.parts[0]?.text;
        try {
          const cleanJson = analysisText
            .replace(/json\n?/g, "")
            .replace(/\n?/g, "")
            .trim();
          const parsedAnalysis = JSON.parse(cleanJson);
          userAnalysis = { ...userAnalysis, ...parsedAnalysis };
        } catch (e) {
          console.log("Using default analysis due to parsing error");
        }
      }

      // Enhanced Step 2: Generate mermaid flowchart in appropriate language
      const isMalayalamDetected = userAnalysis.detected_language === "malayalam";
      const inputForDiagram = isMalayalamDetected
        ? userAnalysis.original_text
        : userAnalysis.english_translation;
      const language = isMalayalamDetected ? "Malayalam" : "English";

      // Simplified fast AI prompt with strong language specification
      const mermaidGenerationPrompt = isMalayalamDetected 
        ? `മലയാളത്തിൽ ${userAnalysis.crop} കൃഷിക്കുള്ള mermaid flowchart സൃഷ്ടിക്കുക.

IMPORTANT: എല്ലാ ടെക്സ്റ്റും മലയാളത്തിൽ ആയിരിക്കണം. സമ്പൂർണ്ണ മലയാളം ഉപയോഗിക്കുക.

Include these steps in MALAYALAM:
- ആസൂത്രണം (Planning)
- തയ്യാറെടുപ്പ് (Preparation)
- നടവ് (Planting)
- പരിചരണം (Care)
- വളർച്ച നിരീക്ഷണം (Growth monitoring)
- സംരക്ഷണം (Protection)
- വിളവെടുപ്പ് (Harvest)
- സംസ്കരണം (Processing)
- വിപണനം (Marketing)
- വിജയം (Success)

Use colors:
classDef startStyle fill:#dbeafe,stroke:#3b82f6,stroke-width:3px
classDef processStyle fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
classDef decisionStyle fill:#ddd6fe,stroke:#8b5cf6,stroke-width:2px
classDef successStyle fill:#d1fae5,stroke:#10b981,stroke-width:3px

Return ONLY flowchart code starting with "flowchart TD". മലയാളത്തിൽ മാത്രം.`
        : `Create mermaid flowchart for ${userAnalysis.crop} farming in English.

Include: Planning, Preparation, Planting, Care, Growth monitoring, Protection, Harvest, Processing, Marketing, Success.

Add beautiful colors:
classDef startStyle fill:#dbeafe,stroke:#3b82f6,stroke-width:3px
classDef processStyle fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
classDef decisionStyle fill:#ddd6fe,stroke:#8b5cf6,stroke-width:2px
classDef successStyle fill:#d1fae5,stroke:#10b981,stroke-width:3px

Return ONLY flowchart code starting with "flowchart TD", NO explanations, ALL text in English.`;

      const mermaidResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: mermaidGenerationPrompt }] }],
          }),
        }
      );

      let mermaidDiagram = "";
      if (mermaidResponse.ok) {
        const mermaidData = await mermaidResponse.json();
        mermaidDiagram = mermaidData.candidates[0]?.content?.parts[0]?.text;

        // Clean the mermaid code thoroughly
        mermaidDiagram = mermaidDiagram
          .replace(/```mermaid\n?/g, "")
          .replace(/\n?```/g, "")
          .replace(/```/g, "")
          .trim();
      }

      // Enhanced fallback with light colors and no emojis
      if (!mermaidDiagram || !mermaidDiagram.includes("flowchart")) {
        mermaidDiagram = createEnhancedFlowchartFromInput(
          userAnalysis,
          inputForDiagram,
          isMalayalamDetected
        );
      }

      if (mermaidDiagram) {
        setRoadmapData(mermaidDiagram);
        await renderMermaid(mermaidDiagram);
        // Cache AI-enhanced diagram
        roadmapCacheRef.current.set(cacheKey, mermaidDiagram);
        setGenerationPhase("complete");
      } else if (!roadmapData) {
        // Keep template if AI failed
        roadmapCacheRef.current.set(cacheKey, templateDiagram);
        setGenerationPhase("complete");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      // Keep template on error if we have one
      if (!roadmapData) {
        const cropMatch = cropText.match(/\b(tomato|rice|wheat|corn|potato|onion|chilli|pepper|cabbage|carrot|തക്കാളി|നെല്ല്|ഗോധുമ)\w*/i);
        const fallbackCrop = cropMatch ? cropMatch[0] : "crop";
        const isMalayalam = /[\u0D00-\u0D7F]/.test(cropText);
        const fallback = createTemplateRoadmap(fallbackCrop, isMalayalam ? "malayalam" : "english");
        setRoadmapData(fallback);
        await renderMermaid(fallback);
      }
    } finally {
      setIsGenerating(false);
      setGenerationPhase("complete");
    }
  };

  // Create enhanced flowchart specifically from user input
  const createEnhancedFlowchartFromInput = (
    analysis: any,
    userInput: string,
    ismalayalam: boolean = false
  ) => {
    const crop = analysis.crop || "tomato";
    const goals = analysis.goals || "successful farming";

    if (ismalayalam) {
      // Malayalam version
      return `flowchart TD
    START["${crop.toUpperCase()} കൃഷി പദ്ധതി<br/>ലക്ഷ്യം: വിജയകരമായ കൃഷി<br/>വിസ്തീർണ്ണം: ${analysis.area}<br/>അനുഭവം: ${analysis.experience}"] --> ASSESS{പ്രാരംഭിക വിലയിരുത്തൽ}
    
    ASSESS -->|തയ്യാറാണ്| DIRECT["നേരിട്ടുള്ള നടത്തിപ്പ്<br/>ഭൂമി തയ്യാറാക്കിയിട്ടുണ്ട്<br/>വിഭവങ്ങൾ ലഭ്യമാണ്<br/>ഉടനടി ആരംഭിക്കുക"]
    ASSESS -->|ആസൂത്രണം ആവശ്യം| PLAN["വിശദമായ ആസൂത്രണ ഘട്ടം<br/>${crop} ഇനങ്ങളെക്കുറിച്ച് പഠനം<br/>വിപണി വിശകലനം<br/>ബജറ്റ് കണക്കുകൂട്ടൽ<br/>സമയക്രമം വികസിപ്പിക്കൽ"]
    
    PLAN --> PREP["തയ്യാറെടുപ്പ് ഘട്ടം<br/>മണ്ണ് പരിശോധനയും വിശകലനവും<br/>ഭൂമി തയ്യാറാക്കൽ<br/>വിഭവ സംഭരണം<br/>ഉപകരണങ്ങളുടെ സജ്ജീകരണം"]
    DIRECT --> PREP
    
    PREP --> PLANT["നടീൽ ഘട്ടം<br/>${crop} വിത്ത് തിരഞ്ഞെടുക്കൽ<br/>അനുയോജ്യമായ നടീൽ സമയം<br/>ശരിയായ അകലവും ആഴവും<br/>പ്രാരംഭിക പരിചരണം സജ്ജീകരണം"]
    
    PLANT --> EARLY["പ്രാരംഭിക വളർച്ച മാനേജ്മെന്റ്<br/>ദൈനംദിന നിരീക്ഷണം<br/>നനയ്ക്കൽ സമയക്രമം<br/>പോഷക പ്രയോഗം<br/>കീട പ്രതിരോധം"]
    
    EARLY --> GROWTH{വളർച്ച വിലയിരുത്തൽ}
    GROWTH -->|മികച്ചത്| ACCELERATE["ത്വരിതപ്പെടുത്തിയ വളർച്ച<br/>അവസ്ഥകൾ ഒപ്റ്റിമൈസ് ചെയ്യുക<br/>പോഷകങ്ങൾ വർദ്ധിപ്പിക്കുക<br/>അടുത്ത സീസണിലേക്ക് വിസ്തീർണ്ണം വികസിപ്പിക്കുക"]
    GROWTH -->|സാധാരണ| MAINTAIN["സ്റ്റാൻഡേർഡ് മെയിന്റനൻസ്<br/>പതിവ് പരിചരണ ദിനചര്യ<br/>വികസനം നിരീക്ഷിക്കുക<br/>ആവശ്യാനുസരണം ക്രമീകരിക്കുക"]
    GROWTH -->|പ്രശ്നങ്ങൾ| TROUBLESHOOT["പ്രശ്ന പരിഹാരം<br/>പ്രത്യേക പ്രശ്നങ്ങൾ തിരിച്ചറിയുക<br/>ലക്ഷ്യമിട്ട പരിഹാരങ്ങൾ പ്രയോഗിക്കുക<br/>ഭാവിയിലെ പ്രശ്നങ്ങൾ തടയുക"]
    
    ACCELERATE --> PROTECTION["വിള സംരക്ഷണം<br/>കീട മാനേജ്മെന്റ്<br/>രോഗ പ്രതിരോധം<br/>കാലാവസ്ഥാ സംരക്ഷണം<br/>ഗുണനിലവാര ഉറപ്പ്"]
    MAINTAIN --> PROTECTION
    TROUBLESHOOT --> PROTECTION
    
    PROTECTION --> MATURITY["പക്വത നിരീക്ഷണം<br/>വികസന ഘട്ടങ്ങൾ ട്രാക്ക് ചെയ്യുക<br/>വിളവെടുപ്പ് തയ്യാറെടുപ്പ് വിലയിരുത്തുക<br/>വിളവെടുപ്പ് ലോജിസ്റ്റിക്സ് പ്ലാൻ ചെയ്യുക<br/>സംഭരണം തയ്യാറാക്കുക"]
    
    MATURITY --> HARVEST_READY{വിളവെടുപ്പിന് തയ്യാറോ?}
    HARVEST_READY -->|അതെ| HARVEST["വിളവെടുപ്പ് പ്രവർത്തനങ്ങൾ<br/>അനുയോജ്യമായ സമയം<br/>ശരിയായ സാങ്കേതിക വിദ്യകൾ<br/>ഗുണനിലവാര കൈകാര്യം<br/>ഉടനടി പ്രോസസ്സിംഗ്"]
    HARVEST_READY -->|കാത്തിരിക്കുക| FINAL_CARE["അന്തിമ പരിചരണ കാലയളവ്<br/>നിരീക്ഷണം തുടരുക<br/>ക്രമാനുഗതമായ തയ്യാറെടുപ്പ്<br/>വിപണി സമയം ഒപ്റ്റിമൈസേഷൻ"]
    
    FINAL_CARE --> HARVEST
    HARVEST --> POST["വിളവെടുപ്പിനു ശേഷമുള്ള പ്രോസസ്സിംഗ്<br/>വൃത്തിയാക്കലും തരംതിരിക്കലും<br/>പാക്കേജിംഗ് തയ്യാറെടുപ്പ്<br/>ഗുണനിലവാര ഗ്രേഡിംഗ്<br/>സംഭരണ മാനേജ്മെന്റ്"]
    
    POST --> MARKET["വിപണനവും വിൽപ്പനയും<br/>വാങ്ങുന്നവരുമായുള്ള ബന്ധം<br/>വില ചർച്ചകൾ<br/>ഡെലിവറി ക്രമീകരണങ്ങൾ<br/>പേയ്മെന്റ് ശേഖരണം"]
    
    MARKET --> SUCCESS["പദ്ധതി പൂർത്തീകരണം<br/>ലാഭം കണക്കാക്കുക<br/>പഠിച്ച പാഠങ്ങൾ രേഖപ്പെടുത്തുക<br/>അടുത്ത കൃഷി ആസൂത്രണം ചെയ്യുക<br/>പ്രവർത്തനങ്ങൾ വിപുലീകരിക്കുക"]
    
    style START fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style ASSESS fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style DIRECT fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style PLAN fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style PREP fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style PLANT fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style EARLY fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style GROWTH fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style ACCELERATE fill:#e0f7fa,stroke:#0097a7,stroke-width:2px,color:#1a202c
    style MAINTAIN fill:#f9fbe7,stroke:#827717,stroke-width:2px,color:#1a202c
    style TROUBLESHOOT fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#1a202c
    style PROTECTION fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1a202c
    style MATURITY fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#1a202c
    style HARVEST_READY fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style HARVEST fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#1a202c
    style FINAL_CARE fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#1a202c
    style POST fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#1a202c
    style MARKET fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#1a202c
    style SUCCESS fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1a202c`;
    }

    // English version (existing code)
    return `flowchart TD
    START["${crop.toUpperCase()} FARMING PROJECT<br/>Goal: ${goals}<br/>Area: ${analysis.area}<br/>Experience Level: ${analysis.experience}"] --> ASSESS{Initial Assessment}
    
    ASSESS -->|Ready to Start| DIRECT["Direct Implementation<br/>Land prepared<br/>Resources available<br/>Begin immediately"]
    ASSESS -->|Need Planning| PLAN["Detailed Planning Phase<br/>Research ${crop} varieties<br/>Market analysis<br/>Budget calculation<br/>Timeline development"]
    
    PLAN --> PREP["Preparation Stage<br/>Soil testing and analysis<br/>Land preparation<br/>Resource procurement<br/>Tool and equipment setup"]
    DIRECT --> PREP
    
    PREP --> PLANT["Planting Phase<br/>Seed selection for ${crop}<br/>Optimal planting time<br/>Proper spacing and depth<br/>Initial care setup"]
    
    PLANT --> EARLY["Early Growth Management<br/>Daily monitoring<br/>Watering schedule<br/>Nutrient application<br/>Pest prevention"]
    
    EARLY --> GROWTH{Growth Assessment}
    GROWTH -->|Excellent| ACCELERATE["Accelerated Growth<br/>Optimize conditions<br/>Increase nutrients<br/>Expand area for next season"]
    GROWTH -->|Normal| MAINTAIN["Standard Maintenance<br/>Regular care routine<br/>Monitor development<br/>Adjust as needed"]
    GROWTH -->|Issues| TROUBLESHOOT["Problem Resolution<br/>Identify specific issues<br/>Apply targeted solutions<br/>Prevent future problems"]
    
    ACCELERATE --> PROTECTION["Crop Protection<br/>Pest management<br/>Disease prevention<br/>Weather protection<br/>Quality assurance"]
    MAINTAIN --> PROTECTION
    TROUBLESHOOT --> PROTECTION
    
    PROTECTION --> MATURITY["Maturity Monitoring<br/>Track development stages<br/>Assess harvest readiness<br/>Plan harvest logistics<br/>Prepare storage"]
    
    MATURITY --> HARVEST_READY{Ready for Harvest?}
    HARVEST_READY -->|Yes| HARVEST["Harvesting Operations<br/>Optimal timing<br/>Proper techniques<br/>Quality handling<br/>Immediate processing"]
    HARVEST_READY -->|Wait| FINAL_CARE["Final Care Period<br/>Continue monitoring<br/>Gradual preparation<br/>Market timing optimization"]
    
    FINAL_CARE --> HARVEST
    HARVEST --> POST["Post Harvest Processing<br/>Cleaning and sorting<br/>Packaging preparation<br/>Quality grading<br/>Storage management"]
    
    POST --> MARKET["Marketing and Sales<br/>Buyer connections<br/>Price negotiations<br/>Delivery arrangements<br/>Payment collection"]
    
    MARKET --> SUCCESS["Project Completion<br/>Calculate profits<br/>Document lessons learned<br/>Plan next cultivation<br/>Scale operations"]
    
    style START fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style ASSESS fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style DIRECT fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style PLAN fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style PREP fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style PLANT fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style EARLY fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style GROWTH fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style ACCELERATE fill:#e0f7fa,stroke:#0097a7,stroke-width:2px,color:#1a202c
    style MAINTAIN fill:#f9fbe7,stroke:#827717,stroke-width:2px,color:#1a202c
    style TROUBLESHOOT fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#1a202c
    style PROTECTION fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1a202c
    style MATURITY fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#1a202c
    style HARVEST_READY fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style HARVEST fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#1a202c
    style FINAL_CARE fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#1a202c
    style POST fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#1a202c
    style MARKET fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#1a202c
    style SUCCESS fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1a202c`;
  };

  // Fast modern template with reliable classic syntax - renders instantly
  const createTemplateRoadmap = (crop: string, language: "english" | "malayalam" = "english"): string => {
    if (language === "malayalam") {
      return `flowchart TD
    START(["${crop} കൃഷി തുടങ്ങുക"]) --> PLAN["ആസൂത്രണം"]
    PLAN --> PREP["ഭൂമി തയ്യാറെടുപ്പ്"]
    PREP --> PLANT["നടവ്"]
    PLANT --> CARE["പരിചരണം"]
    CARE --> GROWTH{"വളർച്ച പരിശോധന"}
    GROWTH -->|മികച്ചത്| ACCEL["ത്വരിതപ്പെടുത്തൽ"]
    GROWTH -->|സാധാരണ| MAINT["പരിപാലനം"]
    GROWTH -->|പ്രശ്നങ്ങൾ| FIX["പരിഹാരം"]
    ACCEL --> PROTECT["സംരക്ഷണം"]
    MAINT --> PROTECT
    FIX --> PROTECT
    PROTECT --> HARVEST["വിളവെടുപ്പ്"]
    HARVEST --> POST["സംസ്കരണം"]
    POST --> MARKET["വിപണനം"]
    MARKET --> SUCCESS(("വിജയം"))
    
    classDef startStyle fill:#dbeafe,stroke:#3b82f6,stroke-width:3px,color:#1e3a8a
    classDef processStyle fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f
    classDef decisionStyle fill:#ddd6fe,stroke:#8b5cf6,stroke-width:2px,color:#5b21b6
    classDef successStyle fill:#d1fae5,stroke:#10b981,stroke-width:3px,color:#065f46
    
    class START startStyle
    class PLAN,PREP,PLANT,CARE,PROTECT,HARVEST,POST,MARKET processStyle
    class GROWTH decisionStyle
    class SUCCESS successStyle`;
    }
    
    return `flowchart TD
    START(["Start ${crop} Farming"]) --> PLAN["Planning"]
    PLAN --> PREP["Land Prep"]
    PREP --> PLANT["Planting"]
    PLANT --> CARE["Early Care"]
    CARE --> GROWTH{"Growth Check"}
    GROWTH -->|Good| ACCEL["Accelerate"]
    GROWTH -->|Normal| MAINT["Maintain"]
    GROWTH -->|Issues| FIX["Troubleshoot"]
    ACCEL --> PROTECT["Protection"]
    MAINT --> PROTECT
    FIX --> PROTECT
    PROTECT --> HARVEST["Harvest"]
    HARVEST --> POST["Processing"]
    POST --> MARKET["Marketing"]
    MARKET --> SUCCESS(("Success"))
    
    classDef startStyle fill:#dbeafe,stroke:#3b82f6,stroke-width:3px,color:#1e3a8a
    classDef processStyle fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f
    classDef decisionStyle fill:#ddd6fe,stroke:#8b5cf6,stroke-width:2px,color:#5b21b6
    classDef successStyle fill:#d1fae5,stroke:#10b981,stroke-width:3px,color:#065f46
    
    class START startStyle
    class PLAN,PREP,PLANT,CARE,PROTECT,HARVEST,POST,MARKET processStyle
    class GROWTH decisionStyle
    class SUCCESS successStyle`;
  };

  // Create simple fallback diagram
  const createSimpleFallbackDiagram = (
    userInput: string,
    ismalayalam: boolean = false
  ) => {
    const cropMatch = userInput
      .toLowerCase()
      .match(
        /(tomato|potato|wheat|rice|corn|maize|beans|peas|lettuce|spinach|carrot|onion|pepper|cucumber|cabbage|broccoli)/
      );
    const crop = cropMatch ? cropMatch[1] : "crop";

    if (ismalayalam) {
      // Malayalam version
      return `flowchart TD
    A["${crop.toUpperCase()} കൃഷി ഗൈഡ്<br/>സമ്പൂർണ്ണ കൃഷി പ്രക്രിയ<br/>നിങ്ങളുടെ അഭ്യർത്ഥന അടിസ്ഥാനമാക്കി"] --> B{ആസൂത്രണം പൂർത്തിയായോ?}
    
    B -->|അതെ| C["കൃഷി ആരംഭിക്കുക<br/>ഉടനടി ആരംഭിക്കുക<br/>വിഭവങ്ങൾ തയ്യാറാണ്"]
    B -->|ഇല്ല| D["ആസൂത്രണം പൂർത്തിയാക്കുക<br/>ഗവേഷണം നടത്തി തയ്യാറാകുക<br/>വിഭവങ്ങൾ ശേഖരിക്കുക"]
    
    C --> E["മണ്ണ് തയ്യാറാക്കൽ<br/>മണ്ണ് പരിശോധിച്ച് മെച്ചപ്പെടുത്തുക<br/>നടീൽ സ്ഥലം തയ്യാറാക്കുക"]
    D --> E
    
    E --> F["നടീൽ ഘട്ടം<br/>ഗുണമേന്മയുള്ള വിത്തുകൾ തിരഞ്ഞെടുക്കുക<br/>ശരിയായ അകലത്തിൽ നടുക"]
    F --> G["വളർച്ച മാനേജ്മെന്റ്<br/>പതിവായി പരിചരിക്കുകയും നിരീക്ഷിക്കുകയും ചെയ്യുക<br/>വെള്ളവും പോഷകങ്ങളും മാനേജ്മെന്റ്"]
    G --> H["സംരക്ഷണ ഘട്ടം<br/>കീടങ്ങളുടെയും രോഗങ്ങളുടെയും നിയന്ത്രണം<br/>കാലാവസ്ഥാ സംരക്ഷണം"]
    H --> I["വിളവെടുപ്പ് തയ്യാറെടുപ്പ്<br/>പക്വത നിരീക്ഷിക്കുക<br/>വിളവെടുപ്പ് ലോജിസ്റ്റിക്സ് ആസൂത്രണം ചെയ്യുക"]
    I --> J["വിളവെടുപ്പ്<br/>അനുയോജ്യമായ സമയം<br/>ശരിയായ സാങ്കേതിക വിദ്യകൾ"]
    J --> K["വിളവെടുപ്പിനു ശേഷം<br/>പ്രോസസ്സിംഗും സംഭരണവും<br/>വിപണി തയ്യാറെടുപ്പ്"]
    K --> L["വിജയം നേടൽ<br/>പദ്ധതി പൂർത്തീകരണം<br/>ലാഭം കണക്കാക്കൽ"]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style C fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style F fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style G fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style H fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style I fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#1a202c
    style J fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#1a202c
    style K fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#1a202c
    style L fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1a202c`;
    }

    // English version (existing code)
    return `flowchart TD
    A["${crop.toUpperCase()} FARMING GUIDE<br/>Complete cultivation process<br/>Based on your request"] --> B{Planning Complete?}
    
    B -->|Yes| C["Begin Cultivation<br/>Start immediately<br/>Resources ready"]
    B -->|No| D["Complete Planning<br/>Research and prepare<br/>Gather resources"]
    
    C --> E["Soil Preparation<br/>Test and improve soil<br/>Prepare planting area"]
    D --> E
    
    E --> F["Planting Stage<br/>Select quality seeds<br/>Plant with proper spacing"]
    F --> G["Growth Management<br/>Regular care and monitoring<br/>Water and nutrient management"]
    G --> H["Protection Phase<br/>Pest and disease control<br/>Weather protection"]
    H --> I["Harvest Preparation<br/>Monitor maturity<br/>Plan harvest logistics"]
    I --> J["Harvesting<br/>Optimal timing<br/>Proper techniques"]
    J --> K["Post Harvest<br/>Processing and storage<br/>Market preparation"]
    K --> L["Success Achievement<br/>Project completion<br/>Profit calculation"]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style C fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style F fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style G fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style H fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style I fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#1a202c
    style J fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#1a202c
    style K fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#1a202c
    style L fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1a202c`;
  };

  // Render mermaid diagram with scrollable and zoomable functionality
  const renderMermaid = async (diagram: string) => {
    if (mermaidRef.current && diagram) {
      try {
        // Clear previous content
        mermaidRef.current.innerHTML = "";

        // Clean the diagram code thoroughly
        let cleanDiagram = diagram
          .replace(/```mermaid\n?/g, "")
          .replace(/\n?```/g, "")
          .replace(/```/g, "")
          .trim();

        // Fix multiline node labels - replace line breaks within nodes with <br/>
        cleanDiagram = cleanDiagram.replace(/\["([^"]*?)"\]/g, (match, content) => {
          // Replace actual line breaks in node labels with <br/>
          const fixedContent = content.replace(/\n/g, '<br/>');
          return `["${fixedContent}"]`;
        });

        // Validate mermaid syntax
        if (
          !cleanDiagram.startsWith("flowchart") &&
          !cleanDiagram.startsWith("graph")
        ) {
          throw new Error("Invalid mermaid syntax - must start with flowchart or graph");
        }

        // Generate unique ID for this diagram
        const diagramId = `roadmap-diagram-${Date.now()}`;

        console.log("Rendering diagram with ID:", diagramId);

        // Render the diagram with error handling
        const { svg } = await mermaid.render(diagramId, cleanDiagram);
        
        if (!svg) {
          throw new Error("Mermaid render returned empty SVG");
        }
        
        mermaidRef.current.innerHTML = svg;

        // Create scrollable and zoomable container
        const svgElement = mermaidRef.current.querySelector("svg");
        if (svgElement) {
          // Set up container for scrolling and zooming
          const container = mermaidRef.current;
          container.style.position = "relative";
          container.style.overflow = "auto";
          container.style.width = "100%";
          container.style.height = "600px";
          container.style.border = "1px solid #e0e0e0";
          container.style.borderRadius = "8px";
          container.style.backgroundColor = "#ffffff";

          // Configure SVG for zoom and scroll
          svgElement.style.display = "block";
          svgElement.style.margin = "10px";
          svgElement.style.width = "100%";
          svgElement.style.maxWidth = "100%";
          svgElement.style.minHeight = "400px";
          svgElement.style.cursor = "grab";
          svgElement.style.userSelect = "none";
          svgElement.style.transformOrigin = "0 0";

          // Zoom and pan state
          let scale = 1;
          let translateX = 0;
          let translateY = 0;
          let isPanning = false;
          let startX = 0;
          let startY = 0;

          const updateTransform = () => {
            svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          };

          // Zoom with mouse wheel
          const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.3, Math.min(3, scale * delta));

            // Zoom towards cursor position
            const factor = newScale / scale;
            translateX = x - (x - translateX) * factor;
            translateY = y - (y - translateY) * factor;
            scale = newScale;

            updateTransform();

            // Update container scroll to accommodate new size
            const svgRect = svgElement.getBoundingClientRect();
            const newWidth = svgRect.width * scale;
            const newHeight = svgRect.height * scale;
            container.style.overflow =
              newWidth > container.offsetWidth ||
              newHeight > container.offsetHeight
                ? "auto"
                : "hidden";
          };

          // Pan with mouse drag
          const handleMouseDown = (e: MouseEvent) => {
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svgElement.style.cursor = "grabbing";
          };

          const handleMouseMove = (e: MouseEvent) => {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
          };

          const handleMouseUp = () => {
            isPanning = false;
            svgElement.style.cursor = "grab";
          };

          // Touch support for mobile
          let lastTouchDistance = 0;
          let touchStartX = 0;
          let touchStartY = 0;

          const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
              lastTouchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
            } else if (e.touches.length === 1) {
              isPanning = true;
              touchStartX = e.touches[0].clientX - translateX;
              touchStartY = e.touches[0].clientY - translateY;
            }
          };

          const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
              const touchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              if (lastTouchDistance > 0) {
                const delta = touchDistance / lastTouchDistance;
                scale = Math.max(0.3, Math.min(3, scale * delta));
                updateTransform();
              }
              lastTouchDistance = touchDistance;
            } else if (e.touches.length === 1 && isPanning) {
              translateX = e.touches[0].clientX - touchStartX;
              translateY = e.touches[0].clientY - touchStartY;
              updateTransform();
            }
          };

          const handleTouchEnd = () => {
            isPanning = false;
            lastTouchDistance = 0;
          };

          // Add event listeners
          container.addEventListener("wheel", handleWheel, { passive: false });
          svgElement.addEventListener("mousedown", handleMouseDown);
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
          svgElement.addEventListener("touchstart", handleTouchStart, {
            passive: false,
          });
          svgElement.addEventListener("touchmove", handleTouchMove, {
            passive: false,
          });
          svgElement.addEventListener("touchend", handleTouchEnd);

          // Add scroll bars styling
          container.style.scrollbarWidth = "thin";
          container.style.scrollbarColor = "#bdbdbd #f5f5f5";

          // Reset button
          const resetButton = document.createElement("button");
          resetButton.textContent = "Reset View";
          resetButton.style.position = "absolute";
          resetButton.style.top = "10px";
          resetButton.style.right = "10px";
          resetButton.style.zIndex = "10";
          resetButton.style.padding = "8px 16px";
          resetButton.style.backgroundColor = "#1976d2";
          resetButton.style.color = "white";
          resetButton.style.border = "none";
          resetButton.style.borderRadius = "4px";
          resetButton.style.cursor = "pointer";
          resetButton.style.fontSize = "12px";

          resetButton.onclick = () => {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
            container.scrollTop = 0;
            container.scrollLeft = 0;
          };

          container.appendChild(resetButton);
        }
      } catch (error) {
        console.error("Error rendering mermaid:", error);
        console.error("Diagram content:", diagram.substring(0, 500));

        // Fallback display with better error info
        mermaidRef.current.innerHTML = `
          <div class="text-center p-8 bg-white border border-gray-200 rounded-lg">
            <p class="text-red-600 mb-2 font-semibold">⚠ Diagram Rendering Error</p>
            <p class="text-gray-600 mb-4">The roadmap was generated but encountered a rendering issue.</p>
            <p class="text-xs text-gray-500 mb-4">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <button onclick="location.reload()" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry Generation
            </button>
            <div class="text-left bg-gray-50 p-4 rounded text-sm max-h-60 overflow-y-auto">
              <h4 class="font-bold mb-2">Generated Roadmap Code:</h4>
              <pre class="whitespace-pre-wrap text-xs text-gray-700">${diagram}</pre>
            </div>
          </div>
        `;
      }
    }
  };

  // Handle manual text input
  const handleManualGeneration = () => {
    if (transcribedText.trim()) {
      generateRoadmap(transcribedText);
    }
  };

  // Helper function to set voice based on language
  const setVoiceForLanguage = (
    voices: SpeechSynthesisVoice[], 
    isMalayalam: boolean, 
    utterance: SpeechSynthesisUtterance
  ) => {
    if (isMalayalam) {
      // Try to find Malayalam voice, fallback to Hindi or Indian English
      const malayalamVoice = voices.find(v => v.lang.includes('ml') || v.lang.includes('ML'));
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('HI'));
      const indianVoice = voices.find(v => v.lang.includes('en-IN'));
      
      const selectedVoice = malayalamVoice || hindiVoice || indianVoice || voices[0];
      utterance.voice = selectedVoice;
      utterance.lang = malayalamVoice?.lang || hindiVoice?.lang || 'en-IN';
      
      console.log('🎤 Selected voice:', selectedVoice?.name, '| Lang:', utterance.lang);
    } else {
      // English voice
      const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
      utterance.voice = englishVoice || voices[0];
      utterance.lang = 'en-US';
      
      console.log('🎤 Selected voice:', utterance.voice?.name, '| Lang:', utterance.lang);
    }
  };

  // Voice Assistant: Extract and speak diagram content
  const speakDiagramContent = () => {
    if (!roadmapData) return;

    // Stop any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      // Extract text content from mermaid diagram
      const extractedText = extractDiagramText(roadmapData);
      
      if (!extractedText) {
        console.error("No text content found in diagram");
        return;
      }

      // Detect language from the roadmap data
      const isMalayalam = /[\u0D00-\u0D7F]/.test(roadmapData);
      console.log('🌍 Language detected:', isMalayalam ? 'Malayalam' : 'English');
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(extractedText);
      speechSynthesisRef.current = utterance;

      // Configure voice settings
      utterance.rate = 0.85; // Slower for Malayalam clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Load voices if not already loaded
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Voices not loaded yet, wait for them
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoiceForLanguage(voices, isMalayalam, utterance);
        };
      } else {
        setVoiceForLanguage(voices, isMalayalam, utterance);
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log("🔊 Voice assistant started speaking in", isMalayalam ? 'Malayalam' : 'English');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
        console.log("✅ Voice assistant finished speaking");
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error("Error in voice assistant:", error);
      setIsSpeaking(false);
    }
  };

  // Extract readable text from mermaid diagram syntax
  const extractDiagramText = (mermaidCode: string): string => {
    try {
      // Remove mermaid syntax markers
      let text = mermaidCode
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .replace(/flowchart TD/gi, '')
        .replace(/graph TD/gi, '')
        .replace(/style \w+ fill:[^\n]*/g, '') // Remove style definitions
        .trim();

      // Extract text content from nodes
      const lines = text.split('\n');
      const extractedPhrases: string[] = [];
      
      // Detect if Malayalam
      const isMalayalam = /[\u0D00-\u0D7F]/.test(text);

      for (const line of lines) {
        // Skip empty lines and style definitions
        if (!line.trim() || line.includes('style ')) continue;

        // Extract text from various node formats: ["text"], [text], (text), {text}, etc.
        const matches = line.match(/[\[\(\{]"?([^\]\)\}"]+)"?[\]\)\}]/g);
        if (matches) {
          matches.forEach(match => {
            // Clean up the extracted text
            let cleaned = match
              .replace(/[\[\]\(\)\{\}"]/g, '')
              .replace(/<br\/?>/gi, '. ') // Replace line breaks with periods
              .replace(/\|/g, ' or ') // Replace pipe with 'or'
              .trim();
            
            if (cleaned && cleaned.length > 2) {
              extractedPhrases.push(cleaned);
            }
          });
        }

        // Also extract text from arrows with labels
        const arrowMatch = line.match(/-->\|([^\|]+)\|/);
        if (arrowMatch && arrowMatch[1]) {
          const label = arrowMatch[1].trim();
          if (label.length > 2) {
            extractedPhrases.push(label);
          }
        }
      }

      // Create introduction based on language
      const intro = isMalayalam 
        ? "നിങ്ങളുടെ കൃഷി റോഡ്മാപ്പ് ഇതാ. "
        : "Here is your farming roadmap. ";

      // Join all phrases with appropriate separator
      const separator = isMalayalam ? ". " : ". ";
      const content = extractedPhrases.join(separator);

      return intro + content;

    } catch (error) {
      console.error("Error extracting diagram text:", error);
      return "Unable to read diagram content.";
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white shadow-lg">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-3 text-white hover:bg-white/20 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Crop Guide</h1>
            <p className="text-green-100 dark:text-green-200 text-sm">
              AI-powered farming guidance and recommendations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/20">
          <button
            onClick={() => setCurrentTab("twin")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              currentTab === "twin"
                ? "bg-white/20 text-white border-b-2 border-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            AI Twin
          </button>
          <button
            onClick={() => setCurrentTab("recommendations")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              currentTab === "recommendations"
                ? "bg-white/20 text-white border-b-2 border-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Lightbulb className="h-4 w-4 inline mr-2" />
            Recommendations
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {currentTab === "twin" && (
        <div className="p-4 space-y-4">
          {/* Farming Roadmap Generator */}
          <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Farming Roadmap Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                Get a comprehensive crop-specific farming mind map with voice or
                text input in English or Malayalam. Our AI analyzes your
                specific crop and generates a detailed roadmap covering variety
                selection, soil preparation, planting, pest management,
                harvesting, and post-harvest processing with timelines and best
                practices. The diagram will be generated in the same language as
                your input.
              </p>
              <Dialog
                open={showRoadmapDialog}
                onOpenChange={setShowRoadmapDialog}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Farming Roadmap
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      AI Farming Roadmap Generator
                    </DialogTitle>
                    <DialogDescription>
                      Describe your specific crop (e.g., tomato, wheat, rice)
                      using voice or text in English or Malayalam. Our AI will
                      create a comprehensive farming mind map tailored to your
                      crop in the same language as your input, including variety
                      selection, growing stages, pest management, fertilization
                      schedules, and harvesting techniques with exact timelines.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Voice Input Section */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Voice Input</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`${
                            isRecording
                              ? "bg-red-600 hover:bg-red-700 animate-pulse"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                          disabled={isGenerating}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="h-4 w-4 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Start Recording
                            </>
                          )}
                        </Button>

                        {audioBlob && !isRecording && (
                          <Button
                            onClick={transcribeAudio}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isGenerating}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Process Audio
                          </Button>
                        )}
                      </div>

                      {isRecording && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                            <span className="text-sm text-red-800 dark:text-red-300">
                              Recording... Speak clearly about your farming
                              plans in English or Malayalam
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Input Section */}
                    <div className="space-y-4">
                      <Label
                        htmlFor="crop-description"
                        className="text-sm font-medium"
                      >
                        Or Type Your Farming Plan
                      </Label>
                      <Textarea
                        id="crop-description"
                        placeholder="English: I want to grow tomatoes in 2 acres, what are the complete steps, timeline, costs, and profit expectations? | Malayalam: 2 ഏക്കറിൽ തക്കാളി കൃഷി ചെയ്യാൻ ആഗ്രഹിക്കുന്നു, സമ്പൂർണ്ണ ഘട്ടങ്ങൾ, സമയക്രമം, ചെലവുകൾ, ലാഭ പ്രതീക്ഷകൾ എന്നിവ എന്തെല്ലാം?"
                        value={transcribedText}
                        onChange={(e) => setTranscribedText(e.target.value)}
                        className="min-h-20"
                        disabled={isGenerating}
                      />
                      <Button
                        onClick={handleManualGeneration}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!transcribedText.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {generationPhase === "template" && "Creating Template..."}
                            {generationPhase === "ai" && "Enhancing with AI..."}
                            {generationPhase === "complete" && "Generating..."}
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Generate Roadmap
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Roadmap Display */}
                    {roadmapData && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Your Personalized Farming Roadmap
                          </Label>
                          <Button
                            onClick={speakDiagramContent}
                            className={`${
                              isSpeaking
                                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                : "bg-blue-600 hover:bg-blue-700"
                            } text-white`}
                            size="sm"
                          >
                            {isSpeaking ? (
                              <>
                                <MicOff className="h-4 w-4 mr-2" />
                                Stop Reading
                              </>
                            ) : (
                              <>
                                <Mic className="h-4 w-4 mr-2" />
                                Read Aloud
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-300 rounded-lg overflow-hidden bg-white">
                          <div className="bg-white p-4 min-h-[600px] relative">
                            <div
                              ref={mermaidRef}
                              className="w-full h-full bg-white rounded-lg"
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          💡 Click "Read Aloud" to hear the roadmap content in your language
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations Tab */}
      {currentTab === "recommendations" && (
        <CropWise onBack={() => setCurrentTab("twin")} />
      )}
    </div>
  );
};

export default FarmingTwinScreen;