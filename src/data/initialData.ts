import {
  Project, Campaign, Donation, Payment, RecurringDonation, Receipt, Refund,
  Story, NewsArticle, ImpactMetric, VolunteerApplication, PartnershipRequest,
  SupportTicket, AuditLog, SystemSettings, User
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_superadmin',
    name: 'Mohd Amin Ganai',
    email: 'amin.ganai@asfjk.org',
    role: 'super_admin',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    twoFactorEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_finance',
    name: 'Michael Carter',
    email: 'michael.carter@asfjk.org',
    role: 'finance_admin',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    twoFactorEnabled: true,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'usr_project',
    name: 'Daniel Wilson',
    email: 'daniel.wilson@asfjk.org',
    role: 'project_manager',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'usr_content',
    name: 'Emily Carter',
    email: 'emily.carter@asfjk.org',
    role: 'content_manager',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'usr_donor',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    role: 'donor',
    phone: '+1 415 555 0192',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    createdAt: '2024-05-12T10:30:00Z',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_clean_water',
    name: 'Clean Water Initiative',
    slug: 'clean-water-initiative',
    category: 'Clean Water',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'Baramulla & Kupwara District',
    locationDetails: 'Remote villages along northern mountain streams',
    shortDescription: 'Providing safe, deep solar-powered filtration wells and clean piped drinking water to over 25 rural Himalayan communities.',
    longDescription: 'Access to safe drinking water remains a critical challenge in remote villages of Jammu and Kashmir. Water-borne illnesses disproportionately affect children and the elderly. The Clean Water Initiative installs gravity-fed pipelines, solar deep-tube filtration plants, and community water purification units that guarantee 24/7 potable water.',
    problemStatement: 'More than 28 mountain hamlets rely on unfiltered glacial streams contaminated by seasonal runoff, leading to regular outbreaks of preventable water-borne illnesses.',
    objectives: [
      'Install 40 solar-powered deep filtration wells in water-scarce villages',
      'Lay 18 km of insulated community distribution pipes to resist winter freezing',
      'Train local youth committees for long-term maintenance and water testing',
      'Eliminate 95% of water-borne diseases in target hamlets within 12 months'
    ],
    activities: [
      'Geophysical groundwater surveys across Baramulla, Kupwara, and Bandipora',
      'Procurement of ISO-certified multi-stage filtration membranes and solar pumps',
      'Civil construction of protected wellhead reservoirs and winterized kiosks',
      'Monthly water quality testing and community hygiene workshops'
    ],
    expectedOutcomes: [
      '35,000+ villagers gain permanent daily access to clean water',
      'Families save an average of 2.5 hours per day previously spent hauling water',
      'School attendance rates improve by 22% due to reduced sickness'
    ],
    beneficiariesCount: 35000,
    beneficiariesDescription: 'Rural families, school students, and elderly residents in remote mountain districts.',
    startDate: '2024-01-15',
    expectedCompletionDate: '2026-12-31',
    fundingGoalUSD: 100000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 63500,
    donorCount: 428,
    status: 'active',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [
      {
        id: 'ms_cw_1',
        title: 'Phase 1: Hydrogeological Surveys & Site Approvals',
        description: 'Completed comprehensive groundwater mapping across 20 high-priority villages.',
        targetDate: '2024-06-30',
        completionPercentage: 100,
        status: 'completed',
        costRequirementUSD: 20000
      },
      {
        id: 'ms_cw_2',
        title: 'Phase 2: Drilling & Solar Filtration Plant Installation',
        description: '24 out of 40 filtration plants installed and producing clean water.',
        targetDate: '2025-10-31',
        completionPercentage: 65,
        status: 'in_progress',
        costRequirementUSD: 50000
      },
      {
        id: 'ms_cw_3',
        title: 'Phase 3: Pipeline Extensions & Community Handover',
        description: 'Laying frost-proof delivery networks and training community technicians.',
        targetDate: '2026-12-31',
        completionPercentage: 10,
        status: 'pending',
        costRequirementUSD: 30000
      }
    ],
    updates: [
      {
        id: 'upd_cw_1',
        projectId: 'proj_clean_water',
        title: 'Solar Filtration Unit Commissioned in High Altitude Hamlet',
        summary: 'Over 850 families now receive 10,000 liters of pristine drinking water daily.',
        content: 'Our engineering team led by Daniel Wilson has completed the installation of the high-capacity solar filtration well. The water tested with 0.0 ppm contaminants.',
        date: '2025-06-18',
        authorName: 'Daniel Wilson (Project Manager)',
        images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=600&q=80']
      }
    ],
    impactMetrics: [
      { label: 'Filtration Wells Built', value: '24 of 40' },
      { label: 'Villagers Served Daily', value: '22,400+' },
      { label: 'Water Purity Rate', value: '99.8%' }
    ],
    featured: true,
    urgent: false
  },
  {
    id: 'proj_education_children',
    name: 'Global Education Access Program',
    slug: 'global-education-access-program',
    category: 'Education',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'Srinagar, Anantnag, Budgam',
    locationDetails: 'Under-resourced community schools',
    shortDescription: 'Modern digital classrooms, science laboratories, scholarship stipends, and uniform kits for 5,000 underprivileged children.',
    longDescription: 'Every child deserves an inspiring educational foundation. Al Shujaiat Foundation Jammu & Kashmir (ASFJK) transforms under-resourced community schools by modernizing physical infrastructure, establishing smart digital computer centers, distributing free curriculum textbooks, and granting scholarships.',
    problemStatement: 'Dozens of valley schools lack heating, computers, and science kits, forcing students to learn in harsh sub-zero temperatures without digital skills.',
    objectives: [
      'Upgrade 30 community schools with winterized smart classrooms and computer labs',
      'Provide 5,000 full scholarship packages (tuition, books, uniforms, shoes)',
      'Launch STEM and coding bootcamps for adolescent students',
      'Establish teacher training programs focusing on interactive pedagogy'
    ],
    activities: [
      'Refurbishment of classroom insulation, double-glazed windows, and safe heating',
      'Deployment of low-power digital computers, projectors, and solar backup',
      'Direct distribution of winter uniform sets and educational stationary',
      'Quarterly academic assessment and remedial tutoring camps'
    ],
    expectedOutcomes: [
      'School dropout rates reduced by over 80% among vulnerable households',
      '5,000 students graduate with foundational computer literacy',
      'Over 60% increase in student enrollment across upgraded institutions'
    ],
    beneficiariesCount: 5000,
    beneficiariesDescription: 'Underprivileged students and children across Jammu & Kashmir.',
    startDate: '2024-03-01',
    expectedCompletionDate: '2026-11-30',
    fundingGoalUSD: 250000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 225000,
    donorCount: 890,
    status: 'active',
    heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [
      {
        id: 'ms_ed_1',
        title: 'Smart Classrooms in Srinagar & Budgam',
        description: 'Installed 18 digital classrooms with interactive boards and solar backups.',
        targetDate: '2024-12-31',
        completionPercentage: 100,
        status: 'completed',
        costRequirementUSD: 100000
      },
      {
        id: 'ms_ed_2',
        title: 'Winter Uniform & School Kit Distribution',
        description: 'Delivered 4,200 kits including insulated boots, jackets, and stationery.',
        targetDate: '2025-11-15',
        completionPercentage: 90,
        status: 'in_progress',
        costRequirementUSD: 90000
      }
    ],
    updates: [
      {
        id: 'upd_ed_1',
        projectId: 'proj_education_children',
        title: '1,200 Winter Uniform Packages Distributed',
        summary: 'Warm coats, insulated shoes, and comprehensive textbook bundles handed out.',
        content: 'Thanks to our international donor community, more than 1,200 children can now attend classes throughout the freezing winter months with dignity and warmth.',
        date: '2025-11-02',
        authorName: 'Emily Carter (Communications Director)',
        images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80']
      }
    ],
    impactMetrics: [
      { label: 'Students Funded', value: '4,850' },
      { label: 'Smart Labs Built', value: '26' },
      { label: 'Retention Rate', value: '98.4%' }
    ],
    featured: true,
    urgent: false
  },
  {
    id: 'proj_health_program',
    name: 'Community Healthcare Outreach',
    slug: 'community-healthcare-outreach',
    category: 'Healthcare',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'Pulwama, Shopian, Rajouri',
    locationDetails: 'Primary healthcare centers & mobile medical clinics',
    shortDescription: 'Mobile medical dispensaries, maternal health services, critical medicines, and emergency patient transport.',
    longDescription: 'Providing accessible healthcare directly to remote mountainous regions where standard hospitals are tens of kilometers away. ASFJK deploys fully equipped mobile diagnostic vans, ultrasound equipment, pediatric specialists, and free prescription dispensaries.',
    problemStatement: 'Severe mountain winter blockades isolate over 40 remote villages, leaving pregnant mothers and chronically ill patients without immediate access to lifesaving emergency medical support.',
    objectives: [
      'Deploy 3 winter-ready 4x4 mobile health clinics',
      'Provide free maternal, pediatric, and geriatric clinical consultations',
      'Supply free chronic medications for diabetes, hypertension, and respiratory ailments',
      'Offer 24/7 emergency telemetry and ambulance transport'
    ],
    activities: [
      'Weekly village health camps with licensed medical specialists',
      'Telemedicine uplink to tertiary care hospital specialists',
      'Direct distribution of essential life-saving pharmaceuticals',
      'Preventive health education and vaccination drives'
    ],
    expectedOutcomes: [
      'Over 40,000 patients receive free diagnostics and treatments annually',
      'Zero maternal deaths due to lack of transport in covered clusters',
      'Early detection and management of chronic lifestyle diseases'
    ],
    beneficiariesCount: 42000,
    beneficiariesDescription: 'Families, pregnant mothers, infants, and seniors in hilly regions.',
    startDate: '2024-02-01',
    expectedCompletionDate: '2025-12-31',
    fundingGoalUSD: 50000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 50000,
    donorCount: 310,
    status: 'funded',
    heroImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [
      {
        id: 'ms_hp_1',
        title: 'Procurement of 4x4 Mobile Clinic Ambulances',
        description: 'Successfully customized and deployed three 4WD ambulances with diagnostics.',
        targetDate: '2024-08-31',
        completionPercentage: 100,
        status: 'completed',
        costRequirementUSD: 30000
      }
    ],
    updates: [
      {
        id: 'upd_hp_1',
        projectId: 'proj_health_program',
        title: 'Project 100% Funded! Full Fleet Operational',
        summary: 'All funding targets achieved thanks to our global donor community.',
        content: 'The Community Healthcare Outreach has reached 100% of its funding goal ($50,000). All mobile units are now actively serving mountain villages on scheduled weekly rounds.',
        date: '2025-08-10',
        authorName: 'Mohd Amin Ganai (Executive Director)',
        images: ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80']
      }
    ],
    impactMetrics: [
      { label: 'Patients Treated', value: '42,000+' },
      { label: 'Mobile Camps Held', value: '180+' },
      { label: 'Medicines Distributed', value: '$85,000 val' }
    ],
    featured: true,
    urgent: false
  },
  {
    id: 'proj_emergency_relief',
    name: 'Emergency Relief and Recovery',
    slug: 'emergency-relief-and-recovery',
    category: 'Emergency Relief',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'All High-Risk Districts',
    locationDetails: 'Disaster-affected zones, flood plains, and avalanche corridors',
    shortDescription: 'Rapid deployment disaster response fund delivering food rations, emergency shelter, heating fuel, and blankets during extreme weather disasters.',
    longDescription: 'Kashmir frequently experiences severe flash floods, heavy snowfall blockades, and earthquakes. ASFJK maintains strategic reserve warehouses stocked with dry ration kits, water filtration sachets, heavy winter blankets, and temporary weather-proof shelters.',
    problemStatement: 'Sudden climate disasters often leave thousands of vulnerable households stranded without electricity, dry food, or shelter in temperatures plunging to -15°C.',
    objectives: [
      'Maintain continuous prepositioned food and thermal survival kits for 10,000 families',
      'Operate 24/7 disaster response dispatch network with local volunteer teams',
      'Provide immediate cash grants for emergency home repairs and medical trauma care',
      'Construct emergency communal shelters in high-risk avalanche zones'
    ],
    activities: [
      'Rapid assessment surveys within 6 hours of localized natural calamities',
      'Logistics dispatch of high-calorie ration packs and thermal bedding',
      'Temporary roof sheeting and structural winterization aid',
      'Coordination with district disaster management authorities'
    ],
    expectedOutcomes: [
      'Zero lives lost due to hypothermia or starvation during winter crises',
      'Over 10,000 displaced individuals sheltered and fed within 48 hours',
      'Rapid community rehabilitation and livelihood recovery support'
    ],
    beneficiariesCount: 60000,
    beneficiariesDescription: 'Displaced families, avalanche victims, and crisis-affected rural communities.',
    startDate: '2024-01-01',
    expectedCompletionDate: '2027-12-31',
    fundingGoalUSD: 500000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 72500,
    donorCount: 512,
    status: 'active',
    heroImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [],
    updates: [
      {
        id: 'upd_er_1',
        projectId: 'proj_emergency_relief',
        title: 'Emergency Winter Relief Dispatches Underway',
        summary: 'Emergency supplies delivered to 1,500 families affected by heavy mountain blizzards.',
        content: 'Following heavy snowfall in mountain sectors, our rapid response teams deployed snow-tractors to deliver dry rations, heating fuel, and winter survival kits.',
        date: '2025-12-05',
        authorName: 'James Anderson (International Programs Director)',
        images: ['https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80']
      }
    ],
    impactMetrics: [
      { label: 'Families Rescued', value: '8,400+' },
      { label: 'Ration Kits Delivered', value: '14,200' },
      { label: 'Response Time', value: '< 6 Hours' }
    ],
    featured: true,
    urgent: true
  },
  {
    id: 'proj_orphan_care',
    name: 'Women and Livelihood Development',
    slug: 'women-and-livelihood-development',
    category: 'Orphan Sponsorship',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'Srinagar, Kupwara, Poonch',
    locationDetails: 'Vulnerable child foster networks and learning centers',
    shortDescription: 'Comprehensive monthly sponsorship providing education, nutrition, healthcare, and psychological support for 600 vulnerable children.',
    longDescription: 'Every child deserves stability and equal opportunities. ASFJK provides holistic monthly stipends covering full schooling fees, balanced nutrition, healthcare coverage, and mentorship.',
    problemStatement: 'Children who lose breadwinner parents in Kashmir face severe financial deprivation, school dropout risks, and vulnerability.',
    objectives: [
      'Support 600 children with monthly educational & living sponsorships',
      'Provide regular pediatric medical checks and counseling',
      'Enable skill-building and higher education pathways for older youth'
    ],
    activities: [
      'Direct monthly living allowance transfers to guardian bank accounts',
      'Quarterly school performance and wellbeing progress monitoring',
      'Annual recreational and leadership summer camps'
    ],
    expectedOutcomes: [
      '100% school retention and completion of secondary education',
      'Improved nutritional health and emotional wellbeing for all enrolled children'
    ],
    beneficiariesCount: 600,
    beneficiariesDescription: 'Children and their single-parent guardian families.',
    startDate: '2024-01-01',
    expectedCompletionDate: '2026-12-31',
    fundingGoalUSD: 80000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 52000,
    donorCount: 340,
    status: 'active',
    heroImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [],
    updates: [],
    impactMetrics: [
      { label: 'Children Sponsored', value: '420 of 600' },
      { label: 'School Pass Rate', value: '99.1%' }
    ],
    featured: false,
    urgent: false
  },
  {
    id: 'proj_winter_relief',
    name: 'Climate Resilience and Winter Survival',
    slug: 'climate-resilience-and-winter-survival',
    category: 'Winter Relief',
    country: 'India',
    region: 'Jammu & Kashmir',
    city: 'Kashmir Valley & Pir Panjal Range',
    locationDetails: 'Sub-zero mountain hamlets and uninsulated homes',
    shortDescription: 'Distributing heavy thermal blankets, Kangris, clean heating fuel, and winter survival packages before freezing sub-zero waves.',
    longDescription: 'During the harsh 40-day intense winter period in Kashmir, temperatures routinely plummet well below freezing. For impoverished families living in uninsulated wooden and tin shelters, adequate heating and thermal bedding are a matter of survival.',
    problemStatement: 'Elderly residents and young children face severe hypothermia risks without adequate thermal blankets and winter fuel.',
    objectives: [
      'Distribute 10,000 multi-layer thermal wool blankets',
      'Provide traditional Kangri heaters and 3-month clean fuel supplies',
      'Supply insulated winter boots, socks, and thermals to 6,000 children'
    ],
    activities: [
      'Direct doorstep distribution across remote mountainous settlements',
      'Specialized support for widow-headed households and disability homes'
    ],
    expectedOutcomes: [
      'Zero hypothermia casualties in target villages',
      'Warm and healthy winter for 10,000+ vulnerable individuals'
    ],
    beneficiariesCount: 15000,
    beneficiariesDescription: 'Elderly residents, impoverished families, and children.',
    startDate: '2024-09-01',
    expectedCompletionDate: '2026-03-31',
    fundingGoalUSD: 120000,
    fundingCurrency: 'USD',
    amountRaisedUSD: 96000,
    donorCount: 620,
    status: 'active',
    heroImage: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80'
    ],
    milestones: [],
    updates: [],
    impactMetrics: [
      { label: 'Blankets Distributed', value: '8,200' },
      { label: 'Communities Reached', value: '74 Hamlets' }
    ],
    featured: true,
    urgent: true
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_winter_emergency',
    name: 'Winter Survival Appeal 2026',
    slug: 'winter-survival-appeal-2026',
    type: 'emergency',
    description: 'Sub-zero temperatures threaten thousands of isolated mountain families. Help our teams deliver emergency winter kits, thermal blankets, and heating fuel.',
    goalUSD: 150000,
    amountRaisedUSD: 118500,
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    heroImage: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
    relatedProjectIds: ['proj_winter_relief', 'proj_emergency_relief'],
    status: 'active',
    donorCount: 780,
    featured: true
  },
  {
    id: 'camp_ramadan_food',
    name: 'Seasonal Food Security Drive',
    slug: 'seasonal-food-security-drive',
    type: 'seasonal',
    description: 'Providing comprehensive monthly food packages containing staple grains, pulses, dates, oil, and essentials for impoverished fasting families.',
    goalUSD: 200000,
    amountRaisedUSD: 145000,
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    heroImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    relatedProjectIds: ['proj_emergency_relief', 'proj_orphan_care'],
    status: 'active',
    donorCount: 920,
    featured: true
  },
  {
    id: 'camp_clean_streams',
    name: 'Clean Water & Mountain Streams Campaign',
    slug: 'clean-water-mountain-streams',
    type: 'fundraising',
    description: 'Ecological restoration and waste interception along vital mountain waterways in Kashmir to safeguard downstream drinking reservoirs.',
    goalUSD: 80000,
    amountRaisedUSD: 42000,
    startDate: '2025-05-01',
    endDate: '2026-09-30',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1200&q=80',
    relatedProjectIds: ['proj_clean_water'],
    status: 'active',
    donorCount: 260,
    featured: false
  }
];

export const INITIAL_RECURRING_DONATIONS: RecurringDonation[] = [
  {
    id: 'rec_001',
    subscriptionNumber: 'ASFJK-SUB-2026-0001',
    donorId: 'usr_donor',
    donorName: 'David Thompson',
    donorEmail: 'david.thompson@example.com',
    projectId: 'proj_education_children',
    projectName: 'Global Education Access Program',
    amount: 50,
    currency: 'USD',
    amountUSD: 50,
    frequency: 'monthly',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1PqDemoStripe001',
    paymentMethodRef: 'Visa ending in 4242',
    startDate: '2024-06-01',
    nextPaymentDate: '2026-09-01',
    lastSuccessfulPayment: '2026-08-01T10:15:00Z',
    totalCollectedUSD: 1350,
    successfulPaymentCount: 27,
    status: 'active',
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2026-08-01T10:15:00Z'
  },
  {
    id: 'rec_002',
    subscriptionNumber: 'ASFJK-SUB-2026-0002',
    donorId: 'usr_sophia',
    donorName: 'Sophia Williams',
    donorEmail: 'sophia.williams@example.com',
    projectId: 'proj_orphan_care',
    projectName: 'Women and Livelihood Development',
    amount: 500,
    currency: 'USD',
    amountUSD: 500,
    frequency: 'yearly',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1PqDemoStripe002',
    paymentMethodRef: 'Mastercard ending in 8899',
    startDate: '2024-01-10',
    nextPaymentDate: '2027-01-10',
    lastSuccessfulPayment: '2026-01-10T12:00:00Z',
    totalCollectedUSD: 1500,
    successfulPaymentCount: 3,
    status: 'active',
    createdAt: '2024-01-10T11:30:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'rec_003',
    subscriptionNumber: 'ASFJK-SUB-2026-0003',
    donorId: 'usr_oliver',
    donorName: 'Oliver Bennett',
    donorEmail: 'oliver.bennett@example.com',
    projectId: 'proj_clean_water',
    projectName: 'Clean Water Initiative',
    amount: 100,
    currency: 'USD',
    amountUSD: 100,
    frequency: 'monthly',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1PqDemoStripe003',
    paymentMethodRef: 'Amex ending in 1005 (Expired)',
    startDate: '2024-08-15',
    nextPaymentDate: '2026-08-15',
    lastSuccessfulPayment: '2026-07-15T09:00:00Z',
    lastFailedPayment: '2026-08-15T09:00:00Z',
    totalCollectedUSD: 1200,
    successfulPaymentCount: 12,
    status: 'past_due',
    createdAt: '2024-08-15T08:45:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'rec_004',
    subscriptionNumber: 'ASFJK-SUB-2026-0004',
    donorId: 'usr_emily',
    donorName: 'Emily Carter',
    donorEmail: 'emily.carter@example.org',
    projectId: 'proj_health_program',
    projectName: 'Community Healthcare Outreach',
    amount: 75,
    currency: 'USD',
    amountUSD: 75,
    frequency: 'monthly',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1PqDemoStripe004',
    paymentMethodRef: 'Visa ending in 9012',
    startDate: '2024-09-01',
    nextPaymentDate: '2026-10-01',
    lastSuccessfulPayment: '2026-07-01T14:20:00Z',
    totalCollectedUSD: 750,
    successfulPaymentCount: 10,
    status: 'paused',
    pausedAt: '2026-07-20T10:00:00Z',
    createdAt: '2024-09-01T14:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don_001',
    donationNumber: 'ASFJK-DON-2026-00101',
    donorId: 'usr_donor',
    donorName: 'David Thompson',
    donorEmail: 'david.thompson@example.com',
    donorCountry: 'United States',
    anonymous: false,
    frequency: 'monthly',
    donationType: 'project',
    targetId: 'proj_education_children',
    targetName: 'Global Education Access Program',
    amount: 50,
    currency: 'USD',
    amountUSD: 50,
    exchangeRate: 1.0,
    status: 'successful',
    paymentMethod: 'Stripe Card (Visa •••• 4242)',
    paymentId: 'pay_001',
    receiptNumber: 'ASFJK-REC-2026-00101',
    recurringDonationId: 'rec_001',
    createdAt: '2026-08-01T10:15:00Z',
    updatedAt: '2026-08-01T10:15:00Z'
  },
  {
    id: 'don_002',
    donationNumber: 'ASFJK-DON-2026-00102',
    donorName: 'Charlotte Brown',
    donorEmail: 'charlotte.brown@example.com',
    donorCountry: 'United Kingdom',
    donorTaxId: 'GB9920194',
    anonymous: false,
    frequency: 'one_time',
    donationType: 'project',
    targetId: 'proj_clean_water',
    targetName: 'Clean Water Initiative',
    amount: 250,
    currency: 'GBP',
    amountUSD: 320,
    exchangeRate: 1.28,
    status: 'successful',
    paymentMethod: 'Stripe Card (Mastercard •••• 1188)',
    paymentId: 'pay_002',
    receiptNumber: 'ASFJK-REC-2026-00102',
    createdAt: '2026-08-14T15:40:00Z',
    updatedAt: '2026-08-14T15:40:00Z'
  },
  {
    id: 'don_003',
    donationNumber: 'ASFJK-DON-2026-00103',
    donorName: 'Anonymous Donor',
    donorEmail: 'donor.anonymous@example.org',
    donorCountry: 'Canada',
    anonymous: true,
    frequency: 'one_time',
    donationType: 'campaign',
    targetId: 'camp_winter_emergency',
    targetName: 'ASFJK Winter Survival Appeal 2026',
    amount: 500,
    currency: 'CAD',
    amountUSD: 370,
    exchangeRate: 0.74,
    status: 'successful',
    paymentMethod: 'Stripe Card (Visa •••• 5511)',
    paymentId: 'pay_003',
    receiptNumber: 'ASFJK-REC-2026-00103',
    createdAt: '2026-08-20T11:10:00Z',
    updatedAt: '2026-08-20T11:10:00Z'
  },
  {
    id: 'don_004',
    donationNumber: 'ASFJK-DON-2026-00104',
    donorName: 'Anderson Family Foundation',
    donorEmail: 'grants@andersonfdn.org',
    donorCountry: 'United States',
    anonymous: false,
    frequency: 'one_time',
    donationType: 'general',
    targetName: 'ASFJK General Humanitarian Fund',
    amount: 5000,
    currency: 'USD',
    amountUSD: 5000,
    exchangeRate: 1.0,
    status: 'successful',
    paymentMethod: 'Bank Wire Transfer',
    paymentId: 'pay_004',
    receiptNumber: 'ASFJK-REC-2026-00104',
    createdAt: '2026-08-25T09:30:00Z',
    updatedAt: '2026-08-25T09:30:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_001',
    transactionId: 'txn_str_001_8923',
    donationId: 'don_001',
    provider: 'stripe',
    providerPaymentId: 'ch_3Pq7829104',
    amount: 50,
    currency: 'USD',
    amountUSD: 50,
    feeAmountUSD: 1.75,
    netAmountUSD: 48.25,
    status: 'successful',
    method: 'stripe_card',
    idempotencyKey: 'idem_rec_001_202608',
    createdAt: '2026-08-01T10:15:00Z',
    updatedAt: '2026-08-01T10:15:00Z'
  },
  {
    id: 'pay_002',
    transactionId: 'txn_str_002_4412',
    donationId: 'don_002',
    provider: 'stripe',
    providerPaymentId: 'ch_3Pq991204',
    amount: 250,
    currency: 'GBP',
    amountUSD: 320,
    feeAmountUSD: 9.20,
    netAmountUSD: 310.80,
    status: 'successful',
    method: 'stripe_card',
    idempotencyKey: 'idem_str_002_20260814',
    createdAt: '2026-08-14T15:40:00Z',
    updatedAt: '2026-08-14T15:40:00Z'
  },
  {
    id: 'pay_003',
    transactionId: 'txn_str_003_1109',
    donationId: 'don_003',
    provider: 'stripe',
    providerPaymentId: 'ch_3Pq8899201',
    amount: 500,
    currency: 'CAD',
    amountUSD: 370,
    feeAmountUSD: 10.50,
    netAmountUSD: 359.50,
    status: 'successful',
    method: 'stripe_card',
    idempotencyKey: 'idem_str_003_20260820',
    createdAt: '2026-08-20T11:10:00Z',
    updatedAt: '2026-08-20T11:10:00Z'
  },
  {
    id: 'pay_004',
    transactionId: 'txn_bnk_004_7734',
    donationId: 'don_004',
    provider: 'bank',
    providerPaymentId: 'wire_ref_8829012',
    amount: 5000,
    currency: 'USD',
    amountUSD: 5000,
    feeAmountUSD: 0,
    netAmountUSD: 5000,
    status: 'successful',
    method: 'bank_wire',
    idempotencyKey: 'idem_bnk_004_20260825',
    createdAt: '2026-08-25T09:30:00Z',
    updatedAt: '2026-08-25T09:30:00Z'
  }
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec_doc_001',
    receiptNumber: 'ASFJK-REC-2026-00101',
    donationId: 'don_001',
    recurringDonationId: 'rec_001',
    transactionId: 'txn_str_001_8923',
    donationDate: '2026-08-01T10:15:00Z',
    donorName: 'David Thompson',
    donorEmail: 'david.thompson@example.com',
    donorAddress: '124 Lexington Ave, New York, NY 10016, USA',
    projectName: 'Global Education Access Program',
    amount: 50,
    currency: 'USD',
    amountUSD: 50,
    paymentMethod: 'Stripe Card (Visa •••• 4242)',
    language: 'en',
    taxExemptionText: 'Eligible for 501(c)(3) tax deductions in USA and 80G tax exemptions under IT Act in India.',
    issuedAt: '2026-08-01T10:15:05Z',
    pdfGenerated: true
  },
  {
    id: 'rec_doc_002',
    receiptNumber: 'ASFJK-REC-2026-00102',
    donationId: 'don_002',
    transactionId: 'txn_str_002_4412',
    donationDate: '2026-08-14T15:40:00Z',
    donorName: 'Charlotte Brown',
    donorEmail: 'charlotte.brown@example.com',
    donorAddress: '45 Kensington Gardens, London, W8 4PX, UK',
    donorTaxId: 'GB9920194',
    projectName: 'Clean Water Initiative',
    amount: 250,
    currency: 'GBP',
    amountUSD: 320,
    paymentMethod: 'Stripe Card',
    language: 'en',
    taxExemptionText: 'Donations to Al Shujaiat Foundation Jammu & Kashmir (ASFJK) are eligible for statutory tax exemptions.',
    issuedAt: '2026-08-14T15:40:04Z',
    pdfGenerated: true
  },
  {
    id: 'rec_doc_003',
    receiptNumber: 'ASFJK-REC-2026-00103',
    donationId: 'don_003',
    transactionId: 'txn_str_003_1109',
    donationDate: '2026-08-20T11:10:00Z',
    donorName: 'Anonymous Donor',
    donorEmail: 'donor.anonymous@example.org',
    donorAddress: 'Toronto, Ontario, Canada',
    campaignName: 'ASFJK Winter Survival Appeal 2026',
    projectName: 'ASFJK Winter Survival Appeal 2026',
    amount: 500,
    currency: 'CAD',
    amountUSD: 370,
    paymentMethod: 'Stripe Card (Visa •••• 5511)',
    language: 'en',
    taxExemptionText: 'Official International Charitable Donation Receipt issued by Al Shujaiat Foundation Jammu & Kashmir (ASFJK).',
    issuedAt: '2026-08-20T11:10:06Z',
    pdfGenerated: true
  }
];

export const INITIAL_REFUNDS: Refund[] = [
  {
    id: 'ref_001',
    refundNumber: 'ASFJK-REF-2026-0001',
    donationId: 'don_sample_duplicate',
    donationNumber: 'ASFJK-DON-2026-00088',
    paymentId: 'pay_sample_dup',
    amountUSD: 100,
    amountOriginal: 100,
    currency: 'USD',
    reason: 'Accidental double payment submission by donor',
    status: 'processed',
    requestedBy: 'Michael Carter',
    approvedBy: 'Mohd Amin Ganai',
    donorEmail: 'william.parker@example.com',
    donorName: 'William Parker',
    projectId: 'proj_clean_water',
    projectName: 'Clean Water Initiative',
    createdAt: '2026-07-15T14:00:00Z',
    processedAt: '2026-07-15T14:30:00Z'
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_001',
    slug: 'restoring-clean-water-access-in-remote-highlands',
    title: 'Restoring Clean Water Access in Remote Mountain Highlands',
    summary: 'How the ASFJK solar deep-tube filtration plant in northern Kashmir brought 10,000 liters of potable water daily to isolated mountain communities.',
    content: 'Before Al Shujaiat Foundation Jammu & Kashmir (ASFJK) installed the solar deep-tube filtration plant, families made four arduous treks up steep mountain paths each day. In winter, icy trails led to frequent falls and injuries. Now, with clean running water nearby, school attendance has surged and water-borne illness has dropped by 95%.',
    location: 'Baramulla District, Kashmir',
    beneficiaryName: 'Mountain Hamlet Community',
    relatedProjectId: 'proj_clean_water',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1000&q=80',
    publishedDate: '2025-11-20',
    status: 'published',
    readTime: '4 min read'
  },
  {
    id: 'story_002',
    slug: 'empowering-youth-through-digital-smart-classrooms',
    title: 'Empowering Youth Through Digital Smart Classrooms and STEM',
    summary: 'A look into how modern computer labs and scholarship kits are opening career opportunities for students in high-altitude Himalayan schools.',
    content: 'Through our Global Education Access Program, ASFJK installed solar-backed computer centers, digital libraries, and winter learning kits. Students are now learning coding, digital science, and foundational computer skills that prepare them for higher education and global careers.',
    location: 'Budgam District, Kashmir',
    beneficiaryName: 'Community School Students',
    relatedProjectId: 'proj_education_children',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    publishedDate: '2025-10-12',
    status: 'published',
    readTime: '5 min read'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news_001',
    slug: 'asfjk-commissions-24th-solar-water-plant',
    title: 'ASFJK Commissions 24th Solar Filtration Plant in Northern Mountain Sector',
    summary: 'Official inauguration ceremony attended by community representatives and local councils.',
    content: 'Al Shujaiat Foundation Jammu & Kashmir (ASFJK) announced today the successful commissioning of its 24th solar-powered deep filtration plant under the Clean Water Initiative. The automated unit provides 20,000 liters of purified water per day, completely free of charge.',
    category: 'Press Release',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=800&q=80',
    publishedDate: '2026-01-20',
    status: 'published',
    author: 'Emily Carter (Communications Desk)'
  },
  {
    id: 'news_002',
    slug: 'winter-warmth-emergency-drive-reaches-8000-families',
    title: 'ASFJK Winter Warmth Emergency Drive Reaches Over 8,000 Isolated Families',
    summary: 'Rapid response relief teams brave heavy snowstorms to deliver thermal blankets and nutrition.',
    content: 'In response to severe sub-zero cold waves across Jammu & Kashmir, ASFJK emergency logistics volunteers have distributed 8,200 heavy thermal blankets and 3,400 emergency food rations across isolated sectors.',
    category: 'Announcement',
    coverImage: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
    publishedDate: '2026-02-05',
    status: 'published',
    author: 'Sarah Mitchell (Operations Director)'
  }
];

export const INITIAL_IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'imp_001',
    key: 'people_served',
    label: 'Lives Positively Impacted',
    value: 148500,
    unit: '+',
    iconName: 'Users',
    category: 'General',
    description: 'Direct beneficiaries across all welfare programs in Jammu & Kashmir.'
  },
  {
    id: 'imp_002',
    key: 'clean_water_wells',
    label: 'Filtration Plants & Wells',
    value: 320,
    unit: '+',
    iconName: 'Droplets',
    category: 'Water',
    description: 'Operational solar and deep bore-well filtration systems installed.'
  },
  {
    id: 'imp_003',
    key: 'students_supported',
    label: 'Students Educated',
    value: 4850,
    unit: '+',
    iconName: 'GraduationCap',
    category: 'Education',
    description: 'Scholarships, smart school upgrades, and vocational training completed.'
  },
  {
    id: 'imp_004',
    key: 'meals_distributed',
    label: 'Emergency Meals & Rations',
    value: 380000,
    unit: '+',
    iconName: 'HeartHandshake',
    category: 'Relief',
    description: 'Nutritional food packages distributed during crises and seasonal drives.'
  },
  {
    id: 'imp_005',
    key: 'patients_treated',
    label: 'Patients Treated Free',
    value: 42000,
    unit: '+',
    iconName: 'Activity',
    category: 'Healthcare',
    description: 'Consultations, diagnostics, and essential medicines provided in mountain clinics.'
  },
  {
    id: 'imp_006',
    key: 'communities_served',
    label: 'Remote Communities Served',
    value: 110,
    unit: '+',
    iconName: 'Home',
    category: 'Communities',
    description: 'Rural and mountainous settlements with ongoing developmental initiatives.'
  }
];

export const INITIAL_VOLUNTEERS: VolunteerApplication[] = [
  {
    id: 'vol_001',
    fullName: 'Oliver Bennett',
    email: 'oliver.bennett@example.com',
    phone: '+44 7700 900123',
    city: 'London',
    country: 'United Kingdom',
    qualification: 'M.Sc in Disaster Logistics & Civil Management',
    resumeFileName: 'Oliver_Bennett_CV_2026.pdf',
    skills: ['Logistics & Field Distribution', 'First Aid Responder', 'Photography'],
    availability: 'weekends',
    experienceYears: 3,
    statement: 'Experienced in international disaster relief logistics and wish to assist with ASFJK winter distribution.',
    status: 'approved',
    submittedAt: '2026-02-10T14:20:00Z'
  },
  {
    id: 'vol_002',
    fullName: 'Amelia Davis',
    email: 'amelia.davis@example.org',
    phone: '+1 617 555 0184',
    city: 'Boston',
    country: 'United States',
    qualification: 'Master of Education (M.Ed) & STEM Curriculum Specialist',
    resumeFileName: 'Amelia_Davis_Resume_Academic.pdf',
    skills: ['Education & Tutoring', 'Content Writing', 'Event Organization'],
    availability: 'flexible',
    experienceYears: 2,
    statement: 'Passionate about educational equity and expanding STEM access for adolescent youth.',
    status: 'under_review',
    submittedAt: '2026-02-22T09:15:00Z'
  }
];

export const INITIAL_PARTNERSHIPS: PartnershipRequest[] = [
  {
    id: 'part_001',
    organizationName: 'Global Water Alliance',
    organizationType: 'ngo',
    contactPerson: 'Sophia Williams',
    email: 'sophia.williams@globalwateralliance.org',
    phone: '+44 20 7946 0912',
    website: 'https://globalwateralliance.org',
    country: 'United Kingdom',
    interestAreas: ['Clean Water Infrastructure', 'Water Quality Monitoring'],
    message: 'We would like to co-fund 20 solar water filtration wells with ASFJK in northern Kashmir.',
    status: 'in_discussion',
    submittedAt: '2026-01-18T16:00:00Z'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_001',
    ticketNumber: 'ASFJK-TKT-2026-0041',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    subject: 'Request for combined annual 80G tax receipt for FY 2025-26',
    category: 'receipt_request',
    message: 'Hello, could you please provide a single consolidated PDF statement of all my 12 monthly donations for tax filing?',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-08-10T11:00:00Z',
    response: 'Dear David, your consolidated annual tax statement has been generated and is now available in your Receipts tab.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    userId: 'usr_superadmin',
    userName: 'Mohd Amin Ganai',
    userRole: 'super_admin',
    action: 'SYSTEM_INITIALIZATION',
    entity: 'setting',
    entityId: 'sys_core',
    description: 'Initialized Al Shujaiat Foundation Jammu & Kashmir (ASFJK) platform with multi-currency and payment abstraction.',
    timestamp: '2026-08-20T08:00:00Z',
    ipAddress: '103.24.112.5',
  },
  {
    id: 'log_002',
    userId: 'usr_finance',
    userName: 'Michael Carter',
    userRole: 'finance_admin',
    action: 'DONATION_VERIFIED',
    entity: 'donation',
    entityId: 'don_002',
    description: 'Verified £250 GBP Stripe payment for Clean Water Initiative. Project raised total increased.',
    timestamp: '2026-08-14T15:40:05Z',
    ipAddress: '103.24.112.9',
  },
  {
    id: 'log_003',
    userId: 'usr_project',
    userName: 'Daniel Wilson',
    userRole: 'project_manager',
    action: 'MILESTONE_UPDATED',
    entity: 'project',
    entityId: 'proj_clean_water',
    description: 'Updated Milestone 2 progress for Clean Water Initiative to 65%.',
    timestamp: '2026-08-18T10:12:00Z',
    ipAddress: '103.24.112.14',
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  foundationName: 'Al Shujaiat Foundation Jammu & Kashmir',
  foundationLegalName: 'Al Shujaiat Foundation Jammu & Kashmir (ASFJK)',
  registrationNumber: 'JK/2018/0190361',
  taxExemptionNumber80G: 'AACTA8920E/80G/2021-22',
  registeredAddress: 'D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025',
  operatingAddress: 'Luragam Tral Pulwama Jammu and Kashmir 192123',
  email: 'info@asfjk.org',
  phone: '+91 1933 351585',
  emergencyPhone: '+91 94193 01319',
  websiteUrl: 'https://www.asfjk.org',
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD'],
  presetAmounts: [25, 50, 100, 250, 500],
  donationGoalExceededPolicy: 'continue_support',
  paymentGateways: {
    stripeEnabled: true,
    stripePublishableKey: 'pk_test_sample_asfjk',
    razorpayEnabled: true,
    razorpayKeyId: 'rzp_test_sample_asfjk',
    sandboxEnabled: true,
    bankTransferEnabled: true,
  },
  notificationThresholds: {
    largeDonationUSD: 1000,
    lowProjectFundsAlertUSD: 5000,
  }
};
