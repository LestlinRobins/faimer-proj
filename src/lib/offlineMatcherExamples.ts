/**
 * Natural Language Examples for Offline Navigation Routes
 * Each route contains sentence-based examples that users might actually say
 * This provides much better semantic matching than keyword lists
 */

import { RouteData } from "./offlineMatcher";

export const EXAMPLE_ROUTES: RouteData[] = [
  {
    id: "home",
    title: "Home Dashboard",
    examples:
      "Go home. Take me to the home screen. Show me the main dashboard. I want to see the homepage. Return to the main page. Go back to the start. Show me the main screen. Navigate to home. Open the dashboard. Take me to the beginning. വീട്ടിലേക്ക് പോകുക. ഹോം സ്ക്രീൻ കാണിക്കുക. മെയിൻ ഡാഷ്ബോർഡ് തുറക്കുക. ഹോംപേജിലേക്ക് പോകാൻ ഞാൻ ആഗ്രഹിക്കുന്നു. പ്രധാന പേജിലേക്ക് മടങ്ങുക. തുടക്കത്തിലേക്ക് പോകുക. मुख्य स्क्रीन दिखाओ. होम पर जाओ. डैशबोर्ड खोलो. मुख्य पृष्ठ पर वापस जाओ. ముఖ్య స్క్రీన్ చూపించు. హోమ్‌కి వెళ్లు. డాష్‌బోర్డ్ తెరవండి. ಮುಖ್ಯ ಪರದೆಯನ್ನು ತೋರಿಸಿ. ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ. ড্যাশবোর্ড দেখান. হোমে যান.",
    action: "navigate",
  },
  {
    id: "identify",
    title: "Identify Crop Disease",
    examples:
      "My plant has black spots on the leaves. The leaves are turning yellow. I see some disease on my crop. What's wrong with my plant? My tomato plant looks sick. There are brown spots appearing on the leaves. The leaves are wilting and drooping. I think my crop has some kind of disease. Help me identify this plant problem. Can you diagnose my crop disease? My plant is not looking healthy. എന്റെ ചെടിയിൽ കറുത്ത പുള്ളികൾ ഉണ്ട്. ഇലകൾ മഞ്ഞയാകുന്നു. എന്റെ വിളയ്ക്ക് എന്തോ രോഗം ഉണ്ട്. എന്റെ ചെടിക്ക് എന്താണ് പറ്റിയത്? ചെടി ആരോഗ്യകരമല്ല. ഇലകൾ ഉണങ്ങിപോകുന്നു. വിള നശിക്കുന്നു. मेरे पौधे पर काले धब्बे हैं. पत्तियां पीली हो रही हैं. मेरी फसल बीमार है. పత్తులపై నల్ల మచ్చలు ఉన్నాయి. నా పంట అనారోగ్యంగా ఉంది. పత్తులు పసుపు రంగులోకి మారుతున్నాయి. ನನ್ನ ಗಿಡದ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳಿವೆ. ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ. আমার গাছে কালো দাগ আছে. পাতা হলুদ হয়ে যাচ্ছে.",
    action: "navigate",
    subAction: "diagnose",
  },
  {
    id: "identify",
    title: "Pest Scan",
    examples:
      "There are insects eating my crop. I see bugs on the leaves. Small worms are crawling on my plant. Identify this pest for me. What insect is this? My crop is being attacked by pests. There are caterpillars on my tomato plant. I found some beetles on my crop. Help me identify these bugs. കീടങ്ങൾ എന്റെ വിള തിന്നുന്നു. ഇലകളിൽ പുഴുക്കൾ ഉണ്ട്. പ്രാണികൾ ചെടിയെ നശിപ്പിക്കുന്നു. ഈ കീടം ഏതാണ്? കീടനാശിനി വേണം. कीड़े मेरी फसल खा रहे हैं. पत्तियों पर कीड़े हैं. ये कौन सा कीट है? పురుగులు నా పంటను తింటున్నాయి. ఎలలపై పురుగులు ఉన్నాయి. ఈ చీమను గుర్తించండి. ಕೀಟಗಳು ನನ್ನ ಬೆಳೆಯನ್ನು ತಿನ್ನುತ್ತಿವೆ. ಎಲೆಗಳ ಮೇಲೆ ಹುಳುಗಳಿವೆ. পোকা আমার ফসল খাচ্ছে. পাতায় পোকা আছে.",
    action: "navigate",
    subAction: "scan",
  },
  {
    id: "identify",
    title: "Weed Identification",
    examples:
      "There are unwanted plants growing in my field. Help me identify these weeds. What are these wild plants? I need to remove weeds from my crop. There's too much grass growing with my crops. Identify this weed for me. കളകൾ എന്റെ വയലിൽ വളരുന്നു. അനാവശ്യ ചെടികൾ നീക്കം ചെയ്യണം. ഇത് ഏത് കളയാണ്? കാട്ടു പുല്ല് വളരെ കൂടുതലാണ്. खरपतवार हटाने में मदद चाहिए. ये कौन सा खरपतवार है? అనవసర మొక్కలు పెరుగుతున్నాయి. కలుపు మొక్కలను గుర్తించండి. ಕಳೆ ಗಿಡಗಳು ಬೆಳೆಯುತ್ತಿವೆ. ಇದು ಯಾವ ಕಳೆ? আগাছা সমস্যা আছে. এটা কোন আগাছা?",
    action: "navigate",
    subAction: "weed",
  },
  {
    id: "market",
    title: "Market Prices",
    examples:
      "What's the market price of tomatoes today? Show me today's mandi rates. How much can I sell my crop for? Check current vegetable prices. What's the price of onions in the market? I want to see market rates. Give me today's crop prices. വിപണി വില എന്താണ്? ഇന്നത്തെ മണ്ഡി നിരക്ക് കാണിക്കുക. എത്ര വിലയ്ക്ക് വിൽക്കാം? പച്ചക്കറി വില എത്രയാണ്? आज की मंडी भाव क्या है? टमाटर का भाव क्या है? मैं अपनी फसल कितने में बेच सकता हूं? ఈరోజు మార్కెట్ ధర ఎంత? మండి రేట్లు చూపించు. నేను నా పంటను ఎంతకు అమ్మగలను? ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು? ತರಕಾರಿ ಬೆಲೆ ತೋರಿಸಿ. আজকের বাজার দাম কত? সবজির দাম দেখান.",
    action: "navigate",
  },
  {
    id: "planner",
    title: "Crop Planner",
    examples:
      "When should I plant tomatoes? Show me the crop calendar. What's the best time to sow wheat? Help me plan my farming schedule. When do I harvest rice? Show me planting times. I need to schedule my farming activities. When is the right time to plant? വിള എപ്പോൾ നടണം? കാലണ്ടർ കാണിക്കുക. എപ്പോഴാണ് വിതയ്ക്കേണ്ട സമയം? വിളവെടുപ്പ് സമയം എപ്പോൾ? कब लगाना चाहिए? फसल कैलेंडर दिखाओ. कटाई कब करें? ఎప్పుడు నాటాలి? కాలెండర్ చూపించు. కోత సమయం ఎప్పుడు? ಯಾವಾಗ ನಾಟಿ ಮಾಡಬೇಕು? ಕ್ಯಾಲೆಂಡರ್ ತೋರಿಸಿ. কখন রোপণ করব? ক্যালেন্ডার দেখান.",
    action: "navigate",
  },
  {
    id: "twin",
    title: "Crop Guide",
    examples:
      "Give me farming advice. Show me crop recommendations. What's the best practice for growing rice? I need expert farming tips. How do I grow tomatoes properly? Give me agricultural guidance. Help me with crop management. Show me digital twin insights. കൃഷി ഉപദേശം വേണം. വിള ശുപാർശകൾ കാണിക്കുക. മികച്ച രീതികൾ എന്തൊക്കെയാണ്? എങ്ങനെയാണ് നല്ല വിള കൃഷി ചെയ്യുന്നത്? कृषि सलाह चाहिए. फसल की सिफारिश दिखाओ. सबसे अच्छा तरीका क्या है? వ్యవసాయ సలహా కావాలి. పంట సూచనలు చూపించు. బాగా పండించడం ఎలా? ಕೃಷಿ ಸಲಹೆ ಬೇಕು. ಬೆಳೆ ಶಿಫಾರಸುಗಳು ತೋರಿಸಿ. কৃষি পরামর্শ চাই. ফসলের সুপারিশ দেখান.",
    action: "navigate",
  },
  {
    id: "twin",
    title: "Crop Recommendations",
    examples:
      "Which crop should I plant this season? Suggest the best crop for my soil. What crop is profitable now? Recommend suitable crops for my area. What should I grow? Which crop gives good yield? ഏത് വിള നടണം? എന്റെ മണ്ണിന് അനുയോജ്യമായ വിള ഏത്? ലാഭകരമായ വിള ഏതാണ്? ഈ സീസണിൽ എന്ത് നടാം? कौन सी फसल लगाएं? मेरी मिट्टी के लिए कौन सी फसल अच्छी है? लाभदायक फसल कौन सी है? ఏ పంట నాటాలి? నా నేలకు తగిన పంట ఏది? లాభదాయక పంట ఏది? ಯಾವ ಬೆಳೆ ನಾಟಿ ಮಾಡಬೇಕು? ನನ್ನ ಮಣ್ಣಿಗೆ ಸೂಕ್ತ ಬೆಳೆ ಯಾವುದು? কোন ফসল রোপণ করব? মাটির জন্য উপযুক্ত ফসল কোনটি?",
    action: "navigate",
    subAction: "recommendations",
  },
  {
    id: "soil-analyzer",
    title: "Soil Analyzer",
    examples:
      "Test my soil. I want to check soil nutrients. What's my soil pH level? Analyze my soil quality. Check nitrogen and phosphorus levels. Is my soil fertile? Test soil health. മണ്ണ് പരിശോധിക്കുക. മണ്ണിലെ പോഷകങ്ങൾ എന്തൊക്കെയാണ്? പിഎച്ച് ലെവൽ എത്രയാണ്? മണ്ണ് ഫലഭൂയിഷ്ഠമാണോ? मिट्टी जांच करें. पोषक तत्व चेक करें. पीएच स्तर क्या है? నేల పరీక్ష చేయండి. పోషకాలు చెక్ చేయండి. పీఎచ్ స్థాయి ఎంత? ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿ. ಪೋಷಕಾಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. মাটি পরীক্ষা করুন. পুষ্টি উপাদান চেক করুন.",
    action: "navigate",
  },
  {
    id: "forum",
    title: "Farmer Forum",
    examples:
      "I want to talk to other farmers. Connect me with farmer community. Ask a question to farmers. Join farmer discussion. Talk to fellow farmers. Share my farming experience. Get advice from other farmers. കർഷകരോട് സംസാരിക്കണം. മറ്റ് കർഷകരുമായി ബന്ധപ്പെടുക. കർഷക സമൂഹം കാണിക്കുക. ചോദ്യം ചോദിക്കണം. अन्य किसानों से बात करें. किसान समुदाय से जुड़ें. सवाल पूछें. ఇతర రైతులతో మాట్లాడాలి. రైతు సంఘంతో చేరండి. ಇತರ ರೈತರೊಂದಿಗೆ ಮಾತನಾಡಲು. ರೈತ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ. অন্যান্য কৃষকদের সাথে কথা বলুন. কৃষক সম্প্রদায়ে যোগ দিন.",
    action: "navigate",
  },
  {
    id: "knowledge",
    title: "Knowledge Center",
    examples:
      "I want to learn about farming. Show me agricultural tutorials. Give me farming tips. I need farming knowledge. Teach me how to farm better. Show farming guides. Access knowledge base. കൃഷിയെക്കുറിച്ച് പഠിക്കണം. കാർഷിക വിവരങ്ങൾ വേണം. ഗൈഡ് കാണിക്കുക. ട്യൂട്ടോറിയൽ കാണിക്കുക. कृषि के बारे में सीखना है. जानकारी चाहिए. गाइड दिखाओ. వ్యవసాయం గురించి నేర్చుకోవాలి. జ్ఞానం కావాలి. గైడ్ చూపించు. ಕೃಷಿಯ ಬಗ್ಗೆ ಕಲಿಯಬೇಕು. ಮಾಹಿತಿ ಬೇಕು. কৃষি সম্পর্কে শিখতে চাই. তথ্য চাই.",
    action: "navigate",
  },
  {
    id: "buy",
    title: "Buy Inputs",
    examples:
      "I want to buy seeds. Purchase fertilizer. Buy pesticides online. Order farming tools. Shop for agricultural inputs. Buy farm supplies. വിത്ത് വാങ്ങണം. വളം വാങ്ങുക. കീടനാശിനി ഓർഡർ ചെയ്യുക. उपकरण खरीदना है. बीज खरीदें. खाद चाहिए. విత్తనాలు కొనాలి. ఎరువులు కొనుగోలు చేయండి. ಬೀಜ ಖರೀದಿಸಬೇಕು. ಗೊಬ್ಬರ ಕೊಳ್ಳುವುದು. বীজ কিনতে চাই. সার কিনুন.",
    action: "navigate",
  },
  {
    id: "expense",
    title: "Expense Tracker",
    examples:
      "Track my farming expenses. How much did I spend? Show me my budget. Record farm costs. Check my spending. Add an expense. Monitor farm finances. എത്ര ചെലവായി? ബഡ്ജറ്റ് കാണിക്കുക. ചെലവ് ട്രാക്ക് ചെയ്യുക. കണക്ക് കാണിക്കുക. कितना खर्च हुआ? बजट दिखाओ. खर्च ट्रैक करें. ఎంత ఖర్చు అయింది? బడ్జెట్ చూపించు. ವೆಚ್ಚ ಎಷ್ಟು? ಬಜೆಟ್ ತೋರಿಸಿ. কত খরচ হয়েছে? বাজেট দেখান.",
    action: "navigate",
  },
  {
    id: "news",
    title: "Agriculture News",
    examples:
      "Show me farming news. What's the latest agricultural updates? Give me news about agriculture. Show current events. Latest farming news. കാർഷിക വാർത്തകൾ കാണിക്കുക. പുതിയ വാർത്തകൾ എന്തൊക്കെയാണ്? ന്യൂസ് കാണിക്കുക. कृषि समाचार दिखाओ. ताज़ा खबर क्या है? వ్యవసాయ వార్తలు చూపించు. తాజా వార్తలు ఏమిటి? ಕೃಷಿ ಸುದ್ದಿ ತೋರಿಸಿ. ಇತ್ತೀಚಿನ ಸುದ್ದಿ ಏನು? কৃষি খবর দেখান. সর্বশেষ সংবাদ কি?",
    action: "navigate",
  },
  {
    id: "schemes",
    title: "Government Schemes",
    examples:
      "Show me government schemes for farmers. What benefits can I get? List farmer subsidies. Show government programs. I want to apply for a scheme. സർക്കാർ പദ്ധതികൾ കാണിക്കുക. എനിക്ക് എന്ത് ആനുകൂല്യങ്ങൾ കിട്ടും? സബ്സിഡി എന്തൊക്കെയാണ്? सरकारी योजनाएं दिखाओ. सब्सिडी क्या मिलेगी? ప్రభుత్వ పథకాలు చూపించు. సబ్సిడీలు ఏమిటి? ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ತೋರಿಸಿ. ಸಬ್ಸಿಡಿ ಏನು? সরকারি প্রকল্প দেখান. ভর্তুকি কী?",
    action: "navigate",
  },
  {
    id: "labourers",
    title: "Labour Hub",
    examples:
      "I need farm workers. Find labour for me. Hire workers for harvesting. Need help with farming work. Find manpower. തൊഴിലാളികൾ വേണം. വർക്കർമാരെ കണ്ടെത്തുക. സഹായം വേണം. काम करने वाले चाहिए. मज़दूर चाहिए. కార్మికులు కావాలి. పని చేసే వారు కావాలి. ಕಾರ್ಮಿಕರು ಬೇಕು. ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ. শ্রমিক দরকার. কর্মী খুঁজে দিন.",
    action: "navigate",
  },
  {
    id: "fairfarm",
    title: "FairFarm Marketplace",
    examples:
      "I want to sell my crops directly. Show me FairFarm marketplace. Sell produce to consumers. Direct selling platform. Trade my crops. നേരിട്ട് വിൽക്കണം. മാർക്കറ്റ്പ്ലേസ് കാണിക്കുക. വിള വിൽക്കുക. सीधे बेचना है. मार्केटप్లేస్ दिखाओ. నేరుగా అమ్మాలి. మార్కెట్‌ప్లేస్ చూపించు. ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಬೇಕು. সরাসরি বিক্রি করতে চাই.",
    action: "navigate",
  },
  {
    id: "notifications",
    title: "Notifications & Updates",
    examples:
      "Show me my notifications. Any alerts for me? Check my messages. Show updates. What's new? അറിയിപ്പുകൾ കാണിക്കുക. എന്തെങ്കിലും അലേർട്ട് ഉണ്ടോ? अधिसूचना दिखाओ. अलर्ट चेक करें. నోటిఫికేషన్లు చూపించు. అప్‌డేట్స్ ఏమిటి? ಅಧಿಸೂಚನೆಗಳನ್ನು ತೋರಿಸಿ. সূচনা দেখান. আপডেট কী?",
    action: "navigate",
  },
  {
    id: "profile",
    title: "Profile & Settings",
    examples:
      "Open my profile. Show my account settings. Change my preferences. Edit my profile. Update my information. എന്റെ പ്രൊഫൈൽ കാണിക്കുക. സെറ്റിംഗ്സ് തുറക്കുക. അക്കൗണ്ട് എഡിറ്റ് ചെയ്യുക. मेरा प्रोफ़ाइल दिखाओ. सेटिंग्स खोलें. నా ప్రొఫైల్ తెరవండి. సెట్టింగ్‌లు చూపించు. ನನ್ನ ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ. সেটিংস দেখান. প্রোফাইল খুলুন.",
    action: "navigate",
  },
  {
    id: "weather",
    title: "Current Weather",
    examples:
      "What's the weather today? How is the weather now? Show me current temperature. Is it going to rain? Check today's weather. Weather report. കാലാവസ്ഥ എങ്ങനെയാണ്? ഇന്ന് മഴ പെയ്യുമോ? താപനില എത്രയാണ്? आज मौसम कैसा है? बारिश होगी क्या? ఈరోజు వాతావరణం ఎలా ఉంది? వర్షం పడుతుందా? ಇಂದು ಹವಾಮಾನ ಹೇಗಿದೆ? ಮಳೆ ಬರುತ್ತದೆಯೇ? আজকের আবহাওয়া কেমন? বৃষ্টি হবে?",
    action: "weather",
    subAction: "current",
  },
  {
    id: "weather",
    title: "Weather Alerts",
    examples:
      "Any weather warnings? Storm alert. Heavy rain alert. Check weather alerts. Severe weather warning. കാലാവസ്ഥാ അലേർട്ട് ഉണ്ടോ? കൊടുങ്കാറ്റ് മുന്നറിയിപ്പ്? कोई मौसम चेतावनी? तूफान अलर्ट? వాతావరణ హెచ్చరికలు ఉన్నాయా? తుఫాను హెచ్చరిక? ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಉಣ್ಣಾಯಾ? আবহাওয়া সতর্কতা আছে?",
    action: "weather",
    subAction: "alerts",
  },
  {
    id: "weather",
    title: "Weather Forecast",
    examples:
      "What's tomorrow's weather? Show me weather forecast. Will it rain this week? Next week weather. Future weather prediction. നാളത്തെ കാലാവസ്ഥ എങ്ങനെയായിരിക്കും? ആഴ്ചയിൽ മഴ പെയ്യുമോ? पूर्वानुमान दिखाओ. कल मौसम कैसा होगा? రేపు వాతావరణం ఎలా ఉంటుంది? వాతావరణ అంచనా చూపించు. ನಾಳೆ ಹವಾಮಾನ ಹೇಗಿರುತ್ತದೆ? ಮುನ್ಸೂಚನೆ ತೋರಿಸಿ. আগামীকালের আবহাওয়া কেমন হবে?",
    action: "weather",
    subAction: "forecast",
  },
  {
    id: "chatbot",
    title: "AI Assistant",
    examples:
      "I need help. Ask the AI assistant. Talk to chatbot. Get general farming advice. I have a question. Help me with something. सहायता चाहिए. AI से पूछें. సహాయం కావాలి. AI తో మాట్లాడండి. ಸಹಾಯ ಬೇಕು. AI ಯೊಂದಿಗೆ ಮಾತನಾಡಿ. সাহায্য চাই. AI এর সাথে কথা বলুন.",
    action: "chat",
  },
];
