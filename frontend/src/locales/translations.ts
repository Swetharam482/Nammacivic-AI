export interface TranslationDict {
  [key: string]: {
    en: string;
    ta: string;
    tanglish: string;
  };
}

export const translations: TranslationDict = {
  // Navigation & Menu
  navHome: {
    en: "Home",
    ta: "முகப்பு",
    tanglish: "Veedu"
  },
  navTalkToAI: {
    en: "Talk to AI",
    ta: "AI-யிடம் பேசவும்",
    tanglish: "AI kitta pesu"
  },
  navReport: {
    en: "Report Grievance",
    ta: "புகார் பதிவு செய்க",
    tanglish: "Complaint-ai padhivu sei"
  },
  navTrack: {
    en: "Track Status",
    ta: "புகார் நிலை",
    tanglish: "Status-ai paaru"
  },
  navMyComplaints: {
    en: "My Complaints",
    ta: "எனது புகார்கள்",
    tanglish: "Ennodaiya Complaints"
  },
  navMenu: {
    en: "Menu",
    ta: "பட்டியல்",
    tanglish: "Menu"
  },
  navSettings: {
    en: "Settings",
    ta: "அமைப்புகள்",
    tanglish: "Settings"
  },
  navHowToUse: {
    en: "How to Use the App",
    ta: "பயன்படுத்துவது எப்படி",
    tanglish: "App-a eppadi use panradhu"
  },
  navAbout: {
    en: "About NammaCivic AI",
    ta: "நம்ம சிவிக் AI பற்றி",
    tanglish: "NammaCivic AI pathi"
  },
  navTerms: {
    en: "Terms & Conditions",
    ta: "விதிமுறைகள் & நிபந்தனைகள்",
    tanglish: "Terms & Conditions"
  },
  navPrivacy: {
    en: "Privacy Policy",
    ta: "தனியுரிமைக் கொள்கை",
    tanglish: "Privacy Policy"
  },
  navSignIn: {
    en: "Sign In",
    ta: "உள்நுழை",
    tanglish: "Sign In pannunga"
  },
  navRegister: {
    en: "Register",
    ta: "பதிவு செய்",
    tanglish: "Register sei"
  },
  navLogout: {
    en: "Logout",
    ta: "வெளியேறு",
    tanglish: "Logout pannunga"
  },
  navOfficerPortal: {
    en: "Authority Portal (Officers)",
    ta: "அதிகாரிகள் போர்டல்",
    tanglish: "Officers Portal"
  },
  brandSlogan: {
    en: "Our City • Our Service",
    ta: "நம்ம ஊர் • நம்ம சேவை",
    tanglish: "Namma Oor • Namma Sevai"
  },
  backToHome: {
    en: "Back to Home",
    ta: "முகப்புக்குத் திரும்பு",
    tanglish: "Veetukku thirumbu"
  },

  // Taglines & Hero
  tagline: {
    en: "Your Civic Voice. Your Better Community.",
    ta: "உங்கள் குரல். சிறந்த சமுதாயம்.",
    tanglish: "Unga Kural. Sirandha Samudhaayam."
  },
  subtagline: {
    en: "Report local civic issues via text or voice in Tamil, Tanglish, and English. Track resolution in real time and verify completed work before closure.",
    ta: "தமிழ், தங்கிலீஷ் மற்றும் ஆங்கிலத்தில் குரல் அல்லது எழுத்து மூலம் உங்கள் உள்ளூர் புகார்களைப் பதிவு செய்யுங்கள்.",
    tanglish: "Tamil, Tanglish & English la voice or text moolama unga local civic complaints register pannunga."
  },
  heroTitle: {
    en: "AI-Powered Civic Grievance Redressal",
    ta: "AI வழிகாட்டும் உள்ளாட்சி குறைதீர்வு தளம்",
    tanglish: "AI Civic Grievance Redressal"
  },
  reportGrievanceBtn: {
    en: "Report Grievance",
    ta: "புகார் பதிவு செய்க",
    tanglish: "Complaint-ai padhivu sei"
  },
  talkWithAIBtn: {
    en: "Talk with Civic AI",
    ta: "AI உதவியாளருடன் பேசுக",
    tanglish: "Civic AI kitta pesu"
  },
  trackInstantTitle: {
    en: "Track an Existing Grievance",
    ta: "புகாரின் நிலையை உடனே அறிய",
    tanglish: "Complaint status-ai udane paaru"
  },
  trackPlaceholder: {
    en: "Enter unique ID (e.g. NC-2026-10001)...",
    ta: "புகார் ஐடியை உள்ளிடவும் (எ.கா: NC-2026-10001)...",
    tanglish: "Tracking ID-ai enter pannunga (e.g. NC-2026-10001)..."
  },
  trackBtn: {
    en: "Track Status",
    ta: "நிலை அறிந்துகொள்",
    tanglish: "Status-ai paaru"
  },
  categoriesTitle: {
    en: "Common Civic Problem Categories",
    ta: "முக்கிய உள்ளாட்சி துறைகள்",
    tanglish: "Mukkiya Civic Categories"
  },
  categoriesSubtitle: {
    en: "Select a category to report directly or converse naturally with our AI assistant.",
    ta: "துறையைத் தேர்ந்தெடுக்கவும் அல்லது AI உதவியாளருடன் பேசவும்.",
    tanglish: "Category select pannunga or AI assistant kitta direct-a pesunga."
  },
  howItWorksTitle: {
    en: "How NammaCivic AI Works",
    ta: "இந்த தளம் எவ்வாறு செயல்படுகிறது?",
    tanglish: "NammaCivic AI eppadi vela seiyudhu?"
  },
  howItWorksSubtitle: {
    en: "4 simple steps from incident description to citizen verification.",
    ta: "புகார் பதிவு முதல் குடிமக்கள் சரிபார்ப்பு வரை 4 எளிய படிகள்.",
    tanglish: "Complaint register panni citizen verification varaikkum 4 simple steps."
  },

  // Authentication
  citizenSignIn: {
    en: "Citizen Sign In",
    ta: "குடிமக்கள் உள்நுழைவு",
    tanglish: "Citizen Sign In"
  },
  signInSubtitle: {
    en: "Sign in to view, manage, and track all your civic grievances.",
    ta: "உங்கள் புகார்களைக் கண்காணிக்க உள்நுழையவும்.",
    tanglish: "Unga complaints-a track panna sign in pannunga."
  },
  citizenRegistration: {
    en: "Citizen Registration",
    ta: "குடிமக்கள் பதிவு",
    tanglish: "Citizen Registration"
  },
  registerSubtitle: {
    en: "Join NammaCivic AI to report issues and verify completed works.",
    ta: "குறைகளைப் பதிவு செய்யவும், பணிகளைச் சரிபார்க்கவும் இணையுங்கள்.",
    tanglish: "Issues report panni completed velaigala verify panna join pannunga."
  },
  fullName: {
    en: "Full Name",
    ta: "முழுப் பெயர்",
    tanglish: "Muzhu Peyar"
  },
  fullNamePlaceholder: {
    en: "e.g. Karthik Raja",
    ta: "எ.கா: கார்த்திக் ராஜா",
    tanglish: "e.g. Karthik Raja"
  },
  emailAddress: {
    en: "Email Address",
    ta: "மின்னஞ்சல் முகவரி",
    tanglish: "Email Mugavari"
  },
  phoneNumberOptional: {
    en: "Phone Number (Optional)",
    ta: "தொலைபேசி எண் (விருப்பத்தேர்வு)",
    tanglish: "Phone Number (Optional)"
  },
  password: {
    en: "Password",
    ta: "கடவுச்சொல்",
    tanglish: "Password (Ragasiya Kuriyeedu)"
  },
  passwordPlaceholder: {
    en: "At least 6 characters",
    ta: "குறைந்தபட்சம் 6 எழுத்துகள்",
    tanglish: "Kurainthabatcham 6 characters"
  },
  signInBtn: {
    en: "Sign In",
    ta: "உள்நுழைக",
    tanglish: "Sign In sei"
  },
  signingIn: {
    en: "Signing In...",
    ta: "உள்நுழைகிறது...",
    tanglish: "Sign in aagudhu..."
  },
  registerBtn: {
    en: "Register as Citizen",
    ta: "குடிமகனாகப் பதிவு செய்க",
    tanglish: "Citizen-a Register sei"
  },
  creatingAccount: {
    en: "Creating Account...",
    ta: "கணக்கு உருவாக்கப்படுகிறது...",
    tanglish: "Account create aagudhu..."
  },
  registrationSuccess: {
    en: "Account created successfully! You are now logged in.",
    ta: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! நீங்கள் உள்நுழைந்துள்ளீர்கள்.",
    tanglish: "Account successfully create aayiduchu! Neenga ippo logged in."
  },
  noAccount: {
    en: "Don't have an account?",
    ta: "கணக்கு இல்லையா?",
    tanglish: "Account illaya?"
  },
  registerHere: {
    en: "Register as a new Citizen",
    ta: "புதிய குடிமகனாகப் பதிவு செய்க",
    tanglish: "Pudhu Citizen-a Register pannunga"
  },
  alreadyRegistered: {
    en: "Already registered?",
    ta: "ஏற்கனவே பதிவு செய்துள்ளீர்களா?",
    tanglish: "Earkanave register panniteengala?"
  },
  signInHere: {
    en: "Sign In here",
    ta: "இங்கே உள்நுழைக",
    tanglish: "Inga Sign In pannunga"
  },
  demoQuickFill: {
    en: "College Demo Quick Fill:",
    ta: "மாதிரி விரைவு நிரப்பல்:",
    tanglish: "Demo Quick Fill:"
  },
  demoCitizen: {
    en: "Demo Citizen",
    ta: "மாதிரி குடிமகன்",
    tanglish: "Demo Citizen"
  },
  demoOfficer: {
    en: "Demo Officer",
    ta: "மாதிரி அதிகாரி",
    tanglish: "Demo Officer"
  },
  authRequiredTitle: {
    en: "Citizen Authentication Required",
    ta: "குடிமக்கள் உள்நுழைவு அவசியம்",
    tanglish: "Citizen Login Avasiyam"
  },
  authRequiredDesc: {
    en: "Please log in to your citizen account to view all complaints registered under your profile, track historical status, and complete verification.",
    ta: "உங்கள் புகார் வரலாற்றைப் பார்க்க மற்றும் சரிபார்க்க தயவுசெய்து உள்நுழையவும்.",
    tanglish: "Unga complaints list paarkavum verification panna citizen login pannunga."
  },

  // Report Grievance Page
  reportHeaderTitle: {
    en: "Report a Civic Grievance",
    ta: "உள்ளாட்சி புகாரைப் பதிவு செய்க",
    tanglish: "Complaint-ai padhivu sei"
  },
  reportHeaderSubtitle: {
    en: "Submit local civic problems. They will be directed to the responsible local municipal department.",
    ta: "உங்கள் குறைகள் உரிய உள்ளாட்சித் துறைக்கு உடனே அனுப்பி வைக்கப்படும்.",
    tanglish: "Unga civic problems-a sambadhapatta municipal department-ku anuppapadum."
  },
  categoryLabel: {
    en: "Grievance Category",
    ta: "புகார் துறை வகை",
    tanglish: "Complaint Category"
  },
  descriptionLabel: {
    en: "Complaint Description",
    ta: "புகாரின் முழு விவரம்",
    tanglish: "Complaint-oda muzhu vivaram"
  },
  descriptionPlaceholder: {
    en: "Describe the issue clearly (e.g. streetlight bulb fused, garbage not collected for 3 days, pothole outside school)...",
    ta: "பிரச்சனையைத் தெளிவாக விவரிக்கவும் (எ.கா: தெருவிளக்கு எரியவில்லை, 3 நாட்களாக குப்பை எடுக்கவில்லை, பள்ளம் உள்ளது)...",
    tanglish: "Issue pathi theliva eludhunga (e.g. streetlight fuse aaiduchu, 3 naala kuppai allala, periya kuzhi irukku)..."
  },
  locationLabel: {
    en: "Detailed Location / Street Name",
    ta: "இடம் / தெரு முகவரி",
    tanglish: "Location / Street Mugavari"
  },
  locationPlaceholder: {
    en: "e.g. 4th Cross Street, Gandhi Nagar, Adyar",
    ta: "எ.கா: 4-வது குறுக்குத் தெரு, காந்தி நகர், அடையாறு",
    tanglish: "e.g. 4th Cross Street, Gandhi Nagar, Adyar"
  },
  pleaseEnterAddress: {
    en: "Please enter your address",
    ta: "உங்கள் முகவரியை உள்ளிடவும்",
    tanglish: "Ungal address-ai enter pannunga"
  },
  landmarkLabel: {
    en: "Landmark (Optional)",
    ta: "அடையாளம் (விருப்பத்தேர்வு)",
    tanglish: "Landmark (Optional)"
  },
  landmarkPlaceholder: {
    en: "e.g. Opposite Post Office, Near Metro Station",
    ta: "எ.கா: தபால் நிலையம் எதிரில், மெட்ரோ நிலையம் அருகில்",
    tanglish: "e.g. Post Office opposite, Metro station kitta"
  },
  durationLabel: {
    en: "How long has this issue persisted?",
    ta: "இப்பிரச்சனை எத்தனை நாட்களாக நீடிக்கிறது?",
    tanglish: "Indha issue evlo naala irukku?"
  },
  durationPlaceholder: {
    en: "e.g. 2-3 days, 1 week, today",
    ta: "எ.கா: 2-3 நாட்கள், 1 வாரம், இன்று",
    tanglish: "e.g. 2-3 days, 1 vaaram, innaiku"
  },
  yourNameLabel: {
    en: "Your Name",
    ta: "உங்கள் பெயர்",
    tanglish: "Unga Peyar"
  },
  yourPhoneLabel: {
    en: "Your Phone Number",
    ta: "உங்கள் தொலைபேசி எண்",
    tanglish: "Unga Phone Number"
  },
  verifyAddressBtn: {
    en: "Verify Location with OpenStreetMap",
    ta: "வரைபடத்தில் முகவரியைச் சரிபார்க்கவும்",
    tanglish: "Map-la address check sei"
  },
  verifyingAddress: {
    en: "Verifying Address...",
    ta: "முகவரி சரிபார்க்கப்படுகிறது...",
    tanglish: "Address check aagudhu..."
  },
  locationConfirmed: {
    en: "Location Verified & Coordinates Attached",
    ta: "முகவரி வரைபடத்தில் உறுதி செய்யப்பட்டது",
    tanglish: "Location Map-la confirm aaiduchu"
  },
  uploadPhotoLabel: {
    en: "Upload Photo Evidence (Optional)",
    ta: "புகைப்பட ஆதாரம் பதிவேற்றவும் (விருப்பத்தேர்வு)",
    tanglish: "Photo Aadhaaram Upload sei (Optional)"
  },
  uploadPhotoHelp: {
    en: "Max file size: 5MB (JPG, PNG, WebP, PDF)",
    ta: "அதிகபட்ச அளவு: 5MB",
    tanglish: "Maximum file size: 5MB"
  },
  submitGrievanceBtn: {
    en: "Submit Grievance",
    ta: "புகாரைச் சமர்ப்பிக்கவும்",
    tanglish: "Submit sei"
  },
  submittingBtn: {
    en: "Submitting...",
    ta: "சமர்ப்பிக்கப்படுகிறது...",
    tanglish: "Submit aagudhu..."
  },
  duplicateNotice: {
    en: "Notice: A similar grievance was recently reported nearby.",
    ta: "அறிவிப்பு: இப்பகுதியில் ஏற்கனவே இதுபோன்ற புகார் பதிவாகியுள்ளது.",
    tanglish: "Notice: Indha area la similar complaint earkanave register aayiduchu."
  },
  viewSimilarBtn: {
    en: "View similar reports",
    ta: "ஒத்த புகார்களைப் பார்க்க",
    tanglish: "Similar reports-a paaru"
  },
  submitAnywayBtn: {
    en: "Submit My Separate Grievance",
    ta: "எனது புகாரைப் பதிவு செய்க",
    tanglish: "En complaint-a Submit sei"
  },
  duplicateModalTitle: {
    en: "Similar Existing Grievances Found",
    ta: "ஒத்த புகார்கள் கண்டறியப்பட்டன",
    tanglish: "Similar Complaints Kidaithadhu"
  },
  duplicateModalDesc: {
    en: "To prevent redundant civic work, our system detected existing reports near this location. You can view them or proceed.",
    ta: "தேவையற்ற இரட்டைப் பதிவைத் தவிர்க்க, இப்பகுதியில் ஏற்கனவே உள்ள புகார்கள் காட்டப்படுகின்றன.",
    tanglish: "Duplicate complaints thavirkka similar reports kaatrom. Review pannitu proceed pannalam."
  },

  // Complaint Success Page
  complaintSubmittedSuccessfully: {
    en: "Complaint submitted successfully!",
    ta: "புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!",
    tanglish: "Complaint successfully submit aayiduchu"
  },
  successSubtitle: {
    en: "Your grievance is officially cataloged in the civic database. An assigned department will inspect and rectify this defect.",
    ta: "உங்கள் புகார் உள்ளாட்சி பதிவேட்டில் சேர்க்கப்பட்டு உரிய துறைக்கு அனுப்பப்பட்டுள்ளது.",
    tanglish: "Unga complaint civic database-la save aagi sambadhapatta department-ku anuppappattadhu."
  },
  uniqueTrackingId: {
    en: "Your Unique Tracking ID:",
    ta: "உங்கள் தனித்துவமான கண்காணிப்பு ஐடி:",
    tanglish: "Ungal Unique Tracking ID:"
  },
  copyId: {
    en: "Copy ID",
    ta: "ஐடியை நகலெடு",
    tanglish: "ID-a copy sei"
  },
  copiedSuccess: {
    en: "Copied to clipboard!",
    ta: "நகலெடுக்கப்பட்டது!",
    tanglish: "Clipboard-ku copy aayiduchu!"
  },
  trackComplaintStatusNow: {
    en: "Track Complaint Status Now",
    ta: "புகாரின் நிலையை உடனே கண்காணிக்க",
    tanglish: "Status-ai paaru"
  },
  reportAnotherIssue: {
    en: "Report Another Issue",
    ta: "மற்றொரு புகாரைப் பதிவு செய்க",
    tanglish: "Innoru complaint-ai padhivu sei"
  },
  grievanceOverview: {
    en: "Grievance Overview",
    ta: "புகார் கண்ணோட்டம்",
    tanglish: "Complaint Overview"
  },

  // Track Complaint Page
  trackCivicGrievance: {
    en: "Track Civic Grievance",
    ta: "உள்ளாட்சி புகாரைக் கண்காணிக்க",
    tanglish: "Status-ai paaru"
  },
  trackPageSubtitle: {
    en: "Enter your unique complaint reference to inspect real-time progress and verify resolution.",
    ta: "புகாரின் தற்போதைய நிலையை அறிய ஐடியை உள்ளிடவும் (எ.கா: NC-2026-10001).",
    tanglish: "Complaint status paarka unga tracking ID enter pannunga (e.g. NC-2026-10001)."
  },
  enterTrackingIdPlaceholder: {
    en: "Enter unique ID (e.g. NC-2026-10001)...",
    ta: "புகார் ஐடியை உள்ளிடவும் (எ.கா: NC-2026-10001)...",
    tanglish: "Complaint ID-ai enter pannunga (e.g. NC-2026-10001)..."
  },
  trackActionBtn: {
    en: "Track",
    ta: "தேடு",
    tanglish: "Paaru"
  },
  searching: {
    en: "Searching...",
    ta: "தேடுகிறது...",
    tanglish: "Thedudhu..."
  },
  loading: {
    en: "Loading...",
    ta: "ஏற்றப்படுகிறது...",
    tanglish: "Load aagudhu"
  },
  noMatchingComplaintFound: {
    en: "No matching complaint found for this ID.",
    ta: "இந்த ஐடி கொண்ட புகார் எதுவும் பதிவேட்டில் காணப்படவில்லை.",
    tanglish: "Indha ID-ku complaint kidaikkala"
  },
  invalidComplaintId: {
    en: "Invalid complaint ID. Please enter a valid reference like NC-2026-10001.",
    ta: "தவறான புகார் ஐடி. சரியான ஐடியை உள்ளிடவும்.",
    tanglish: "Complaint ID sari illa"
  },
  assessedPriority: {
    en: "Assessed Priority:",
    ta: "முன்னுரிமை நிலை:",
    tanglish: "Priority Nilai:"
  },
  category: {
    en: "Category",
    ta: "துறை வகை",
    tanglish: "Category"
  },
  locationLandmark: {
    en: "Location / Landmark",
    ta: "இடம் / அடையாளம்",
    tanglish: "Location / Landmark"
  },
  reportedDuration: {
    en: "Reported Duration",
    ta: "நீடிக்கும் காலம்",
    tanglish: "Evlo naala irukku"
  },
  submittedOn: {
    en: "Submitted On",
    ta: "சமர்ப்பிக்கப்பட்ட தேதி",
    tanglish: "Submit panna date"
  },
  citizenGrievanceDescription: {
    en: "Citizen Grievance Description",
    ta: "குடிமக்களின் புகார் விவரம்",
    tanglish: "Citizen Complaint Vivaram"
  },
  assignedDepartment: {
    en: "Assigned Department",
    ta: "ஒதுக்கப்பட்ட துறை",
    tanglish: "Assigned Department"
  },
  uploadedEvidenceTitle: {
    en: "Uploaded Photographic Evidence",
    ta: "பதிவேற்றப்பட்ட புகைப்பட ஆதாரம்",
    tanglish: "Upload panna Photo Aadhaaram"
  },
  statusTimelineTitle: {
    en: "Status Progression & Audit Trail",
    ta: "நிலை முன்னேற்றம் & வரலாற்று பதிவுகள்",
    tanglish: "Status Progress & History Logs"
  },

  // Status Lifecycle Labels
  statusSubmitted: {
    en: "Submitted",
    ta: "சமர்ப்பிக்கப்பட்டது",
    tanglish: "Submitted (Submit aachu)"
  },
  statusAssigned: {
    en: "Assigned",
    ta: "துறைக்கு ஒதுக்கப்பட்டது",
    tanglish: "Assigned (Dept-ku poyiduchu)"
  },
  statusInProgress: {
    en: "In Progress",
    ta: "செயல்பாட்டில் உள்ளது",
    tanglish: "In Progress (Vela nadakkudhu)"
  },
  statusPendingVerification: {
    en: "Pending Citizen Verification",
    ta: "தீர்வு சரிபார்ப்பில் உள்ளது",
    tanglish: "Verification-ku kaathirukku"
  },
  statusClosed: {
    en: "Closed",
    ta: "மூடப்பட்டது",
    tanglish: "Closed (Mudinjudhu)"
  },
  statusReopened: {
    en: "Reopened by Citizen",
    ta: "மீண்டும் திறக்கப்பட்டது",
    tanglish: "Reopened (Marubadiyum open aachu)"
  },
  citizenVerified: {
    en: "Citizen Verified",
    ta: "குடிமக்களால் சரிபார்க்கப்பட்டது",
    tanglish: "Citizen verify panniyachu"
  },

  // Citizen Resolution Verification Banner
  verificationBannerTitle: {
    en: "Citizen Resolution Verification Required",
    ta: "குடிமக்கள் தீர்வு சரிபார்ப்பு தேவை",
    tanglish: "Resolution Verify Pannunga"
  },
  verificationBannerDesc: {
    en: "The civic department has reported this issue as resolved. Please verify whether the defect has actually been fixed.",
    ta: "அதிகாரிகள் இப்பிரச்சனை தீர்க்கப்பட்டதாக தெரிவித்துள்ளனர். பிரச்சனை உண்மையில் தீர்ந்துவிட்டதா என சரிபார்க்கவும்.",
    tanglish: "Authority issue fix aaiduchu nu sonnaanga. Neengale problem solve aaiducha nu check pannanum."
  },
  yesResolvedBtn: {
    en: "Yes, Issue is Fixed (Close Complaint)",
    ta: "ஆம், பிரச்சனை தீர்க்கப்பட்டது (புகாரை முடிக்க)",
    tanglish: "Aamaa, Problem solve aayiduchu (Close sei)"
  },
  noReopenBtn: {
    en: "No, Still Unresolved (Reopen Complaint)",
    ta: "இல்லை, பிரச்சனை தீரவில்லை (மீண்டும் திறக்க)",
    tanglish: "Illai, Innum solve aagala (Reopen sei)"
  },
  feedbackPlaceholder: {
    en: "Optional: Share citizen feedback on the completed resolution...",
    ta: "விருப்பத்தேர்வு: மேற்கொள்ளப்பட்ட தீர்வு பற்றிய கருத்து...",
    tanglish: "Optional: Completed vela pathi unga feedback eludhunga..."
  },
  reopenReasonPlaceholder: {
    en: "Please specify why the issue is still unresolved (required for reopening)...",
    ta: "பிரச்சனை ஏன் தீரவில்லை என்பதை விளக்கவும் (மீண்டும் திறக்க கட்டாயம்)...",
    tanglish: "Yen innum solve aagala nu theliva sollunga (reopen panna avasiyam)..."
  },
  submitVerificationBtn: {
    en: "Submit Citizen Verification",
    ta: "சரிபார்ப்பை உறுதிப்படுத்துக",
    tanglish: "Verification-a Submit sei"
  },

  // My Complaints Dashboard
  myComplaintsTitle: {
    en: "Citizen Grievance Dashboard",
    ta: "எனது புகார்கள் பலகை",
    tanglish: "Ennodaiya Complaints Dashboard"
  },
  myComplaintsSubtitle: {
    en: "Track all civic complaints registered under your citizen profile.",
    ta: "உங்கள் கணக்கில் பதிவு செய்யப்பட்ட அனைத்து புகார்களையும் இங்கே கண்காணிக்கலாம்.",
    tanglish: "Unga account-la register panna complaints-a inga track pannunga."
  },
  noComplaintsFound: {
    en: "No complaints found under your account.",
    ta: "உங்கள் கணக்கில் புகார்கள் எதுவும் இல்லை.",
    tanglish: "Unga account-la complaints edhuvum illa."
  },
  filterAll: {
    en: "All Statuses",
    ta: "அனைத்து நிலைகளும்",
    tanglish: "Ellaa Status-um"
  },
  searchComplaintsPlaceholder: {
    en: "Search by ID, title, or location...",
    ta: "ஐடி, தலைப்பு அல்லது இடம் மூலம் தேடுக...",
    tanglish: "ID, title or location vechu thedunga..."
  },
  reportNewComplaintBtn: {
    en: "Report New Grievance",
    ta: "புதிய புகார் பதிவு செய்க",
    tanglish: "Pudhu complaint-ai padhivu sei"
  },

  // Chatbot & Voice
  chatTitle: {
    en: "AI Civic Assistant",
    ta: "AI உள்ளாட்சி உதவியாளர்",
    tanglish: "AI Civic Assistant"
  },
  chatSubtitle: {
    en: "Converse via text or microphone in Tamil, Tanglish, and English.",
    ta: "தமிழ், தங்கிலீஷ் மற்றும் ஆங்கிலத்தில் குரல் அல்லது எழுத்து மூலம் பேசலாம்.",
    tanglish: "Tamil, Tanglish & English la voice or text moolama pesalaam."
  },
  chatInputPlaceholder: {
    en: "Type or speak about your civic issue...",
    ta: "உங்கள் பிரச்சனையை இங்கே பேசலாம் அல்லது எழுதலாம்...",
    tanglish: "Unga issue-a inga pesunga or type pannunga..."
  },
  voiceListening: {
    en: "Listening... Speak clearly into your microphone",
    ta: "கேட்கிறது... மைக்ரோஃபோனில் தெளிவாகப் பேசவும்",
    tanglish: "Kekkudhu... Mic-la theliva pesunga"
  },
  voiceMicDenied: {
    en: "Microphone access denied. Please grant microphone permission in browser settings to use voice input.",
    ta: "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதியை வழங்கவும்.",
    tanglish: "Microphone permission illai. Browser settings-la mic allow pannunga."
  },
  voiceNotSupported: {
    en: "Voice speech recognition is not supported in this browser. Text interaction is fully active.",
    ta: "இந்த உலாவியில் குரல் வசதி செயல்படவில்லை. எழுத்து வழியைப் பயன்படுத்தலாம்.",
    tanglish: "Indha browser-la voice support illa. Neenga text moolama use pannalam."
  },
  voiceActiveTamil: {
    en: "Listening in Tamil (ta-IN)",
    ta: "தமிழில் கேட்கிறது (ta-IN)",
    tanglish: "Tamil-la kekkudhu (ta-IN)"
  },
  voiceActiveTanglish: {
    en: "Listening in Tanglish / Tamil phonetics",
    ta: "தங்கிலீஷ் / தமிழ் குரல் முறையில் கேட்கிறது",
    tanglish: "Tanglish phonetics-la kekkudhu"
  },
  voiceActiveEnglish: {
    en: "Listening in Indian English (en-IN)",
    ta: "ஆங்கிலத்தில் கேட்கிறது (en-IN)",
    tanglish: "English-la kekkudhu (en-IN)"
  },
  stopMicBtn: {
    en: "Stop",
    ta: "நிறுத்து",
    tanglish: "Niruthu"
  },
  speakMicBtn: {
    en: "Speak",
    ta: "பேசுங்கள்",
    tanglish: "Pesunga"
  },
  draftCardTitle: {
    en: "Live Extracted Grievance Summary",
    ta: "தற்போதைய புகாரின் சுருக்கம்",
    tanglish: "Live Grievance Summary"
  },
  confirmSubmitChatBtn: {
    en: "Confirm & Submit Grievance",
    ta: "உறுதி செய்து சமர்ப்பிக்கவும்",
    tanglish: "Confirm panni Submit sei"
  },
  resetChatBtn: {
    en: "Reset Chat",
    ta: "மீட்டமை",
    tanglish: "Reset sei"
  },

  // Category Names
  catStreetlight: {
    en: "Streetlights & Lighting",
    ta: "தெரு விளக்குகள்",
    tanglish: "Street Lights"
  },
  catRoad: {
    en: "Roads & Potholes",
    ta: "சாலைகள் & பள்ளங்கள்",
    tanglish: "Road & Potholes (KuzhigaL)"
  },
  catGarbage: {
    en: "Waste & Garbage",
    ta: "குப்பை மேலாண்மை",
    tanglish: "Kuppai & Waste"
  },
  catDrainage: {
    en: "Drainage & Sewage",
    ta: "சாக்கடை & கழிவுநீர்",
    tanglish: "Drainage & Saakkadai"
  },
  catWater: {
    en: "Water Supply",
    ta: "குடிநீர் விநியோகம்",
    tanglish: "Kudineer Supply"
  },
  catPublicProperty: {
    en: "Public Infrastructure",
    ta: "பொது சொத்துக்கள்",
    tanglish: "Public Infrastructure"
  },
  catSanitation: {
    en: "Sanitation & Public Toilets",
    ta: "சுகாதாரம் & பொதுக் கழிப்பறை",
    tanglish: "Sanitation & Kazhivarai"
  },
  catAnimal: {
    en: "Stray Animals & Health",
    ta: "தெரு விலங்குகள் & சுகாதாரம்",
    tanglish: "Stray Naai & Animals"
  },
  catEnvironment: {
    en: "Environment & Trees",
    ta: "சுற்றுச்சூழல் & மரங்கள்",
    tanglish: "Environment & Marangal"
  },
  catOther: {
    en: "Other Civic Matters",
    ta: "இதர உள்ளாட்சி குறைகள்",
    tanglish: "Vera Civic Issues"
  },

  // Demo Authority & Admin
  demoAuthorityTitle: {
    en: "Demonstration Authority Portal (Simulated Actions)",
    ta: "மாதிரி உள்ளாட்சி அதிகாரி போர்டல் (செயல்விளக்க நடவடிக்கைகள்)",
    tanglish: "Demo Authority Portal (Simulated Actions)"
  },
  demoAuthorityDisclaimer: {
    en: "NOTICE: Actions taken here are simulated demonstration workflows for testing the civic redressal lifecycle. These are not official government orders.",
    ta: "அறிவிப்பு: இங்கே செய்யப்படும் நடவடிக்கைகள் மாதிரி செயல்விளக்கத்திற்கானது மட்டுமே. இவை அதிகாரப்பூர்வ அரசு உத்தரவுகள் அல்ல.",
    tanglish: "NOTICE: Idhu simulated demo actions mattum dhaan testing-kaaga. Official government orders kedayadhu."
  },
  demoAccessDeniedTitle: {
    en: "Administrative Access Restricted",
    ta: "நிர்வாக அணுகல் தடைசெய்யப்பட்டுள்ளது",
    tanglish: "Administrative Access Thadukkappattadhu"
  },
  demoAccessDeniedDesc: {
    en: "This simulated authority portal is restricted to authorized municipal officers and academic evaluators. Citizens cannot perform administrative actions.",
    ta: "இந்த போர்டல் அதிகாரிகள் மற்றும் மதிப்பீட்டாளர்களுக்கு மட்டுமே ஒதுக்கப்பட்டுள்ளது. குடிமக்கள் இதில் மாற்றங்களைச் செய்ய முடியாது.",
    tanglish: "Indha authority portal officers & evaluators-ku mattum dhaan. Citizens idhula administrative vela seiya mudiyadhu."
  },
  advanceStatusBtn: {
    en: "Advance Status",
    ta: "நிலையை முன்னேற்று",
    tanglish: "Status-a maathu"
  },

  // How to Use Page
  howToUseTitle: {
    en: "How to Use NammaCivic AI",
    ta: "நம்ம சிவிக் AI செயலியை எவ்வாறு பயன்படுத்துவது?",
    tanglish: "NammaCivic AI App-a Eppadi Use Panradhu?"
  },
  howToUseSubtitle: {
    en: "A step-by-step guide to reporting, tracking, and verifying local civic grievances in your community.",
    ta: "உங்கள் பகுதியில் உள்ள குறைகளைப் பதிவு செய்யவும், கண்காணிக்கவும் மற்றும் சரிபார்க்கவும் உதவும் வழிகாட்டி.",
    tanglish: "Unga area civic issues-a report panni, track panni, verify panna step-by-step guide."
  },
  step1Title: {
    en: "Step 1: Choose Your Language",
    ta: "படி 1: உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    tanglish: "Step 1: Unga Language Select Pannunga"
  },
  step1Desc: {
    en: "Users can select English, Tamil (தமிழ்), or Tanglish. They can enable voice interaction if they prefer speaking instead of typing.",
    ta: "பயனர்கள் ஆங்கிலம், தமிழ் அல்லது தங்கிலீஷ் மொழியைத் தேர்வு செய்யலாம். தட்டச்சு செய்வதற்குப் பதிலாக பேச விரும்பினால் குரல் வழியை இயக்கலாம்.",
    tanglish: "English, Tamil (தமிழ்), or Tanglish select pannalam. Type panradhuku badhula speak panna mic voice option use pannikalam."
  },
  step2Title: {
    en: "Step 2: Describe Your Civic Issue",
    ta: "படி 2: உங்கள் உள்ளூர் பிரச்சனையை விவரிக்கவும்",
    tanglish: "Step 2: Unga Civic Issue-a Describe Pannunga"
  },
  step2Desc: {
    en: "Users can type or speak about local problems such as damaged roads and potholes, garbage accumulation, broken streetlights, water supply problems, drainage and sanitation issues, or other local civic problems.",
    ta: "பழுதடைந்த சாலைகள் மற்றும் பள்ளங்கள், குப்பை மேலாண்மை, பழுதடைந்த தெருவிளக்குகள், குடிநீர் விநியோகச் சிக்கல்கள், சாக்கடை அடைப்பு அல்லது இதர உள்ளூர் பிரச்சனைகள் பற்றி தட்டச்சு செய்யலாம் அல்லது பேசலாம்.",
    tanglish: "Damaged roads & potholes, garbage kuppai, broken street lights, water supply issue, drainage leakage or vera edhavadhu local issue pathi type pannaalam or pesalaam."
  },
  step3Title: {
    en: "Step 3: Enter Your Location",
    ta: "படி 3: உங்கள் இடத்தை உள்ளிடவும்",
    tanglish: "Step 3: Unga Location Enter Pannunga"
  },
  step3Desc: {
    en: "Ask users to provide their street, area, address, or nearby landmark. If map address verification is integrated, display matching location suggestions and ask users to confirm the correct one. If no matching location is found, allow users to edit their address or provide a landmark. Do not automatically reject genuine complaints because an address is missing from the map service.",
    ta: "தெருப் பெயர், பகுதி அல்லது அருகிலுள்ள அடையாளத்தை வழங்கவும். வரைபட சரிபார்ப்பு இருந்தால், பரிந்துரைக்கப்பட்ட இடங்களிலிருந்து சரியானதை உறுதிப்படுத்தவும். வரைபடத்தில் முகவரி கிடைக்கவில்லை என்றால், முகவரியைத் திருத்தலாம் அல்லது அடையாளத்தைக் கூறலாம்; உண்மையான புகார்கள் ஒருபோதும் நிராகரிக்கப்படாது.",
    tanglish: "Street, area, address or nearby landmark mention pannunga. Map suggestions display aagum bodhu correct location confirm pannunga. Location match aagalaati kooda complaint reject aagadhu; landmark kuduthu manual-a proceed pannalam."
  },
  step4Title: {
    en: "Step 4: Review Your Complaint",
    ta: "படி 4: உங்கள் புகாரைச் சரிபார்க்கவும்",
    tanglish: "Step 4: Unga Complaint-a Review Pannunga"
  },
  step4Desc: {
    en: "Display the complaint description, category, and location for review. Allow users to correct errors before submission.",
    ta: "புகாரின் விளக்கம், துறை வகை மற்றும் இருப்பிடத்தைச் சரிபார்க்கவும். அதிகாரிகளுக்கு அனுப்பும் முன் ஏதேனும் திருத்தங்கள் இருந்தால் மாற்றிக்கொள்ளலாம்.",
    tanglish: "Complaint description, category, and location details-a review pannunga. Submit panradhuku munnaadi errors irundha correct pannikalam."
  },
  step5Title: {
    en: "Step 5: Submit Your Complaint",
    ta: "படி 5: உங்கள் புகாரைப் பதிவு செய்யவும்",
    tanglish: "Step 5: Complaint Submit Pannunga"
  },
  step5Desc: {
    en: "After successful submission, generate and display a complaint ID. Provide a clear confirmation message and an option to copy the ID.",
    ta: "வெற்றிகரமாகப் பதிவு செய்தவுடன், தனித்துவமான புகார் ஐடி (எ.கா. NC-2026-XXXXX) உருவாக்கப்பட்டு காண்பிக்கப்படும். அந்த ஐடியை எளிதாக நகலெடுத்து வைத்துக்கொள்ளலாம்.",
    tanglish: "Successful submission ku apparam, unique tracking complaint ID generate aagum. Confirmation message oda ID-a copy panna option irukkum."
  },
  step6Title: {
    en: "Step 6: Track Complaint Status",
    ta: "படி 6: புகாரின் நிலையை அறியவும்",
    tanglish: "Step 6: Complaint Status Track Pannunga"
  },
  step6Desc: {
    en: "Explain the supported complaint statuses: Submitted, Assigned, In Progress, Awaiting Resolution Verification, Closed, and Reopened. Display only the statuses supported by the actual backend.",
    ta: "உண்மையான அமைப்பில் ஆதரிக்கப்படும் நிலைகள்: சமர்ப்பிக்கப்பட்டது (Submitted), ஒதுக்கப்பட்டது (Assigned), செயல்பாட்டில் உள்ளது (In Progress), தீர்வு சரிபார்ப்பில் உள்ளது (Awaiting Verification), மூடப்பட்டது (Closed), மற்றும் மீண்டும் திறக்கப்பட்டது (Reopened).",
    tanglish: "Backend support pandra 6 statuses: Submitted, Assigned, In Progress, Awaiting Resolution Verification, Closed, and Reopened. Ivatrai ungal tracking portal la direct-a parkalaam."
  },
  step7Title: {
    en: "Step 7: Verify the Resolution",
    ta: "படி 7: தீர்வைச் சரிபார்க்கவும்",
    tanglish: "Step 7: Resolution Verify Pannunga"
  },
  step7Desc: {
    en: "When a complaint is marked as resolved, let the citizen confirm whether the problem has actually been fixed. If it has not been fixed, provide an option to report the unresolved issue and reopen the complaint where supported.",
    ta: "பிரச்சனை சரிசெய்யப்பட்டதாக அதிகாரி குறிப்பிட்டால், அது உண்மையில் தீர்க்கப்பட்டுவிட்டதா என்பதை குடிமக்கள் உறுதிப்படுத்த வேண்டும். பிரச்சனை தீரவில்லை என்றால், புகாரை மீண்டும் திறந்து (Reopen) மேல்நடவடிக்கை கோரலாம்.",
    tanglish: "Authority issue fix aaiduchu nu sonna apparam, citizen neengale problem solve aaiducha nu confirm pannanum. Solve aagalaati reopen panna option irukku."
  },

  // About Page
  aboutTitle: {
    en: "About NammaCivic AI",
    ta: "நம்ம சிவிக் AI பற்றி",
    tanglish: "About NammaCivic AI"
  },
  aboutSubtitle: {
    en: "Democratizing local body grievance redressal through multilingual AI and closed-loop citizen verification.",
    ta: "பன்மொழி AI மற்றும் குடிமக்கள் சரிபார்ப்பு மூலம் உள்ளாட்சி குறைகேட்பை எளிதாக்கும் தளம்.",
    tanglish: "Multilingual AI & closed-loop citizen verification moolama civic grievance redressal-a accessible aakura platform."
  },
  aboutAbstract: {
    en: "NammaCivic AI is an AI-assisted civic grievance platform designed to help citizens report local community problems and track their progress. It supports text and voice-based interaction in English, Tamil and Tanglish, helping users describe issues, provide location details and submit complaints through a guided conversational interface. The system aims to improve accessibility, complaint tracking and citizen participation in local civic services.",
    ta: "நம்ம சிவிக் AI என்பது உள்ளூர் மக்களின் பிரச்சனைகளைப் பதிவு செய்யவும், அவற்றின் தீர்வுகளைக் கண்காணிக்கவும் உதவும் ஒரு செயற்கை நுண்ணறிவு சார்ந்த பொது குறைதீர்க்கும் தளமாகும். தமிழ், தங்கிலீஷ் மற்றும் ஆங்கிலத்தில் குரல் மற்றும் எழுத்து வழியான தொடர்பாடலை ஆதரிப்பதன் மூலம் அனைவரும் எளிதாகப் பயன்படுத்த வகை செய்கிறது.",
    tanglish: "NammaCivic AI oru AI-assisted civic grievance platform. Citizens unga local issues-a report panni track panna use aagum. Tamil, Tanglish & English-la voice and text moolama unga issues-a theliva convey panna mudiyum."
  },
  aboutKeyFeaturesTitle: {
    en: "Key Platform Features",
    ta: "முக்கிய தள சிறப்பம்சங்கள்",
    tanglish: "Key Platform Features"
  },
  aboutDisclaimerTitle: {
    en: "Project Status & Disclaimer",
    ta: "திட்ட நிலை & மறுப்புரை",
    tanglish: "Project Status & Disclaimer"
  },
  aboutDisclaimerText: {
    en: "NammaCivic AI is an academic and civic grievance assistance project and does not represent an official government portal unless an authorized integration has actually been implemented. Simulated records are used for demonstration purposes.",
    ta: "நம்ம சிவிக் AI என்பது ஒரு கல்வி மற்றும் ஆய்வு நோக்கம் கொண்ட பொது குறைதீர்வு திட்டமாகும். அதிகாரப்பூர்வ அரசு ஒருங்கிணைப்பு செய்யப்படும் வரை இது அதிகாரப்பூர்வ அரசு தளம் அல்ல. மாதிரி தரவுகள் செயல்விளக்கத்திற்காக மட்டுமே பயன்படுத்தப்படுகின்றன.",
    tanglish: "NammaCivic AI oru civic grievance assistance project. Idhu direct official government portal kedayadhu (authorized integration pandra varaikkum). Demo records testing kaaga mattum use aagudhu."
  },

  // Terms Page
  termsTitle: {
    en: "Terms & Conditions",
    ta: "விதிமுறைகள் & நிபந்தனைகள்",
    tanglish: "Terms & Conditions"
  },
  termsSubtitle: {
    en: "Please read these terms carefully before using the NammaCivic AI platform.",
    ta: "நம்ம சிவிக் AI தளத்தைப் பயன்படுத்துவதற்கு முன் இந்த விதிமுறைகளை கவனமாகப் படிக்கவும்.",
    tanglish: "NammaCivic AI platform use pandradhuku munnaadi indha terms-a carefully padinga."
  },

  // Settings Page
  settingsTitle: {
    en: "Application Settings",
    ta: "செயலி அமைப்புகள்",
    tanglish: "Application Settings"
  },
  settingsSubtitle: {
    en: "Customize language, voice features, accessibility, and platform preferences.",
    ta: "மொழி, குரல் அமைப்புகள், அணுகல்தன்மை மற்றும் தள விருப்பங்களை மாற்றியமைக்கவும்.",
    tanglish: "Language, voice features, accessibility, and platform preferences-a customize pannunga."
  },
  langSettingsTitle: {
    en: "Language Preferences",
    ta: "மொழி விருப்பங்கள்",
    tanglish: "Language Preferences"
  },
  langSettingsDesc: {
    en: "Select your preferred interface language. This updates menu labels, instructions, forms, and messages across the entire app.",
    ta: "உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும். இது செயலியின் அனைத்துப் பக்கங்களையும் உடனுக்குடன் மாற்றும்.",
    tanglish: "Preferred interface language select pannunga. Idhu menu, forms, and messages-a change pannum."
  },
  voiceSettingsTitle: {
    en: "Voice & Speech Settings",
    ta: "குரல் & பேச்சு அமைப்புகள்",
    tanglish: "Voice & Speech Settings"
  },
  voiceSettingsDesc: {
    en: "Configure Web Speech API microphone input and spoken read-aloud responses.",
    ta: "மைக்ரோஃபோன் குரல் பதிவு மற்றும் உதவியாளரின் குரல் வாசிப்பு அமைப்புகளைக் கட்டுப்படுத்தவும்.",
    tanglish: "Microphone speech input and assistant voice read-aloud features-a configure pannunga."
  },
  accessSettingsTitle: {
    en: "Accessibility & Visual Comfort",
    ta: "அணுகல்தன்மை & காட்சி வசதி",
    tanglish: "Accessibility & Visual Comfort"
  },
  accessSettingsDesc: {
    en: "Adjust text scaling, high-contrast readability, and focus indicators for easier navigation.",
    ta: "எழுத்து அளவு, உயர் மாறுபட்ட நிறங்கள் மற்றும் விசைப்பலகை வழிகாட்டிகளை அமைக்கவும்.",
    tanglish: "Text scaling, high contrast colors, and keyboard focus indicators-a adjust pannunga."
  },
  appInfoTitle: {
    en: "Technical & Version Information",
    ta: "தொழில்நுட்ப & பதிப்பு விவரங்கள்",
    tanglish: "Technical & Version Information"
  },
  appInfoDesc: {
    en: "Active runtime environment and verified subsystem configuration.",
    ta: "செயலில் உள்ள மென்பொருள் பதிப்பு மற்றும் உள்ளமைக்கப்பட்ட அமைப்புகள்.",
    tanglish: "Active version and subsystem details."
  },

  // Additional Page Strings
  registrationConfirmed: {
    en: "Registration Confirmed",
    ta: "பதிவு உறுதி செய்யப்பட்டது",
    tanglish: "Registration Confirm Aayiduchu"
  },
  civicGrievanceSuccessfullyLogged: {
    en: "Civic Grievance Successfully Logged!",
    ta: "உள்ளாட்சி புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!",
    tanglish: "Complaint successfully submit aayiduchu!"
  },
  realTimeRedressalTracking: {
    en: "Real-Time Redressal Tracking",
    ta: "நிகழ்நேர குறைதீர்வு கண்காணிப்பு",
    tanglish: "Real-Time Complaint Tracking"
  },
  demoRecords: {
    en: "Demo Records:",
    ta: "மாதிரி பதிவுகள்:",
    tanglish: "Demo Records:"
  },
  myRegisteredComplaints: {
    en: "My Registered Complaints",
    ta: "எனது பதிவு செய்யப்பட்ட புகார்கள்",
    tanglish: "Ennodaiya Registered Complaints"
  },
  citizenDashboard: {
    en: "Citizen Dashboard",
    ta: "குடிமக்கள் தகவல் பலகை",
    tanglish: "Citizen Dashboard"
  },
  loggedInAs: {
    en: "Logged in as",
    ta: "உள்நுழைந்துள்ள பயனர்",
    tanglish: "Logged in as"
  },
  newGrievance: {
    en: "New Grievance",
    ta: "புதிய புகார்",
    tanglish: "Pudhu Grievance"
  },
  allStatuses: {
    en: "All Statuses",
    ta: "அனைத்து நிலைகளும்",
    tanglish: "Ellaa Status-um"
  },
  statusLabel: {
    en: "Status:",
    ta: "நிலை:",
    tanglish: "Status:"
  },
  trackAndDetails: {
    en: "Track & Details",
    ta: "கண்காணி & விவரங்கள்",
    tanglish: "Track & Details"
  },
  deptLabel: {
    en: "Dept:",
    ta: "துறை:",
    tanglish: "Dept:"
  },
  submittedLabel: {
    en: "Submitted:",
    ta: "சமர்ப்பிக்கப்பட்டது:",
    tanglish: "Submitted:"
  },
  locationLabelShort: {
    en: "Location:",
    ta: "இடம்:",
    tanglish: "Location:"
  },
  orTrackBySingleComplaintId: {
    en: "Or Track by Single Complaint ID",
    ta: "அல்லது ஒற்றை புகார் ஐடி மூலம் தேடுக",
    tanglish: "Or Single Complaint ID vechu Paaru"
  },
  signInToYourAccount: {
    en: "Sign In to Your Account",
    ta: "உங்கள் கணக்கில் உள்நுழைக",
    tanglish: "Unga Account-la Sign In pannunga"
  },
  aiReady: {
    en: "AI Ready",
    ta: "AI தயார்",
    tanglish: "AI Ready"
  },
  autoDetect: {
    en: "Auto Detect",
    ta: "தானியங்கு கண்டறிதல்",
    tanglish: "Auto Detect"
  },
  voiceAudioOn: {
    en: "Voice Audio: On",
    ta: "குரல் ஒலி: ஆன்",
    tanglish: "Voice Audio: On"
  },
  voiceAudioMuted: {
    en: "Muted",
    ta: "ஒலியடக்கம்",
    tanglish: "Muted"
  },
  reset: {
    en: "Reset",
    ta: "மீட்டமை",
    tanglish: "Reset sei"
  },
  nammaCivicIsThinking: {
    en: "NammaCivic AI is thinking...",
    ta: "நம்ம சிவிக் AI சிந்திக்கிறது...",
    tanglish: "NammaCivic AI yosikkudhu..."
  },
  typeOrSpeakPlaceholder: {
    en: "Type or speak: 'Street light work aagala', 'Pothole on 1st road'...",
    ta: "பேசலாம் அல்லது தட்டச்சு செய்யலாம்: 'தெரு விளக்கு எரியவில்லை', 'சாலையில் பள்ளம்'...",
    tanglish: "Type or speak: 'Street light work aagala', 'Pothole on 1st road'..."
  },
  listeningToYourVoice: {
    en: "Listening to your voice... Speak now",
    ta: "உங்கள் குரலைக் கேட்கிறது... இப்போது பேசவும்",
    tanglish: "Unga voice kekkudhu... Ippo pesunga"
  },
  liveDraft: {
    en: "Live Draft",
    ta: "நேரடி வரைவு",
    tanglish: "Live Draft"
  },
  waitingForCategory: {
    en: "Waiting for category mention...",
    ta: "துறை வகைக்காகக் காத்திருக்கிறது...",
    tanglish: "Category mention kaaga waiting..."
  },
  verifyOnMap: {
    en: "Verify on Map",
    ta: "வரைபடத்தில் சரிபார்க்க",
    tanglish: "Map-la verify sei"
  },
  lookingUp: {
    en: "Looking up...",
    ta: "தேடுகிறது...",
    tanglish: "Thedudhu..."
  },
  notYetProvided: {
    en: "Not yet provided (will ask in next question)",
    ta: "இன்னும் வழங்கப்படவில்லை (அடுத்த கேள்வியில் கேட்கப்படும்)",
    tanglish: "Innum provide pannala (adutha kelvi la kekkum)"
  },
  osmConfirmed: {
    en: "OSM Confirmed",
    ta: "OSM உறுதி செய்யப்பட்டது",
    tanglish: "OSM Confirm Aaiduchu"
  },
  changeBtn: {
    en: "Change",
    ta: "மாற்று",
    tanglish: "Maathu"
  },
  confirmLocationAction: {
    en: "Confirm Location",
    ta: "இருப்பிடத்தை உறுதிசெய்",
    tanglish: "Location-a confirm sei"
  },
  noExactMapMatch: {
    en: "No exact map match found.",
    ta: "வரைபடத்தில் துல்லியமான முகவரி கிடைக்கவில்லை.",
    tanglish: "Exact map match kidaikkala."
  },
  noExactMapMatchHelp: {
    en: "Genuine civic complaints are never rejected. You can add a landmark or proceed with your entered location.",
    ta: "உண்மையான புகார்கள் ஒருபோதும் நிராகரிக்கப்படாது. அடையாளத்தைக் குறிப்பிடலாம் அல்லது தொடரலாம்.",
    tanglish: "Genuine civic complaints eppovum reject aagadhu. Landmark add pannalam or proceed pannalam."
  },
  persistenceDuration: {
    en: "Persistence / Duration:",
    ta: "நீடிக்கும் காலம்:",
    tanglish: "Evlo naala irukku:"
  },
  priorityRating: {
    en: "Priority Rating:",
    ta: "முன்னுரிமை மதிப்பீடு:",
    tanglish: "Priority Rating:"
  },
  pendingDetailsNeeded: {
    en: "Pending Details Needed:",
    ta: "தேவைப்படும் விடுபட்ட தகவல்கள்:",
    tanglish: "Innum thevaiyaana details:"
  },
  registeringGrievance: {
    en: "Registering Grievance...",
    ta: "புகார் பதிவு செய்யப்படுகிறது...",
    tanglish: "Grievance register aagudhu..."
  },
  confirmAndSubmitComplaint: {
    en: "Confirm & Submit Complaint",
    ta: "உறுதி செய்து புகாரைச் சமர்ப்பி",
    tanglish: "Confirm panni Submit sei"
  },
  continueConversationHint: {
    en: "Continue conversation to fulfill required complaint details.",
    ta: "தேவையான தகவல்களைப் பூர்த்தி செய்ய உரையாடலைத் தொடரவும்.",
    tanglish: "Complaint details fill panna continue pesunga."
  },
  generatesOfficialIdHint: {
    en: "Generates an official tracking ID and forwards to the local civic division.",
    ta: "அதிகாரப்பூர்வ கண்காணிப்பு ஐடி உருவாக்கப்பட்டு உள்ளாட்சித் துறைக்கு அனுப்பப்படும்.",
    tanglish: "Official tracking ID generate aagi local civic division-ku forward aagum."
  },
  speakOrTypeHint: {
    en: "Speak or type in Tamil, Tanglish & English",
    ta: "பேசலாம் அல்லது எழுதலாம் • Tamil, Tanglish & English",
    tanglish: "Speak or type pannalam • Tamil, Tanglish & English"
  },
  readyToExperience: {
    en: "Ready to experience NammaCivic AI?",
    ta: "நம்ம சிவிக் AI-யைப் பயன்படுத்தத் தயாரா?",
    tanglish: "NammaCivic AI-a use panna ready-aa?"
  },
  readyToExperienceSub: {
    en: "You can test the voice assistant, submit a test grievance, or track an existing demo record.",
    ta: "குரல் உதவியாளரைச் சோதிக்கலாம், புகாரைப் பதிவு செய்யலாம் அல்லது நிலையை அறியலாம்.",
    tanglish: "Voice assistant test pannalam, complaint register pannalam or status paarkalam."
  },
  launchVoiceChatbot: {
    en: "Launch Voice Chatbot",
    ta: "AI குரல் உதவியாளர்",
    tanglish: "Voice Chatbot-a Open sei"
  },
  manualForm: {
    en: "Manual Form",
    ta: "படிவம் மூலம் பதிவு",
    tanglish: "Direct Form vazhiya"
  }
};
