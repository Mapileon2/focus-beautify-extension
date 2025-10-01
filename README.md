# 🎯 Focus Flow Timer - Chrome Extension

A professional-grade Pomodoro timer Chrome extension with real-time analytics, task management, and AI-powered productivity features.

## ✨ Features

### 🕐 **Smart Timer System**
- **Offline-First Timer**: Works without internet, syncs when online
- **Custom Durations**: Fully customizable focus/break periods
- **Session Tracking**: Real-time session recording to database
- **Mini Settings Interface**: Compact, inline settings (no separate tabs)
- **Professional Input Handling**: Natural typing with smart validation

### 📊 **Real-Time Analytics**
- **Live Statistics**: Session counts, focus time, streaks from database
- **Visual Charts**: Weekly trends, session distribution, progress tracking
- **Achievement System**: Gamified milestones with progress indicators
- **Cross-Device Sync**: Analytics work across all logged-in devices
- **Productivity Insights**: Completion rates, patterns, and trends

### ✅ **Task Management**
- **Offline-First Tasks**: Create/edit tasks without internet
- **Smart Sync**: Background synchronization with database
- **Priority Levels**: High/Medium/Low priority with visual indicators
- **Due Date Tracking**: Overdue task identification
- **Bulk Operations**: Sync all local tasks with one click

### 🤖 **AI Assistant**
- **Gemini Integration**: Chat with AI productivity coach
- **Personalized Advice**: Context-aware productivity suggestions
- **Chat History**: Persistent conversation history in database
- **Smart Responses**: AI understands your productivity patterns

### 💬 **Motivational Quotes**
- **Dynamic Quotes**: AI-generated and curated motivational content
- **Custom Quotes**: Add your own inspirational messages
- **Category System**: Organized by themes (productivity, motivation, etc.)
- **Smart Display**: Context-aware quote suggestions

### 🎉 **Celebration System**
- **Smile Popup**: Celebration popup when sessions complete
- **External Windows**: Popup can open as separate mini-window
- **Custom Images**: Upload personal celebration images
- **Auto-Close**: Configurable auto-close with custom delays
- **Animation Effects**: Customizable celebration intensity

### 👤 **User Management**
- **Supabase Authentication**: Secure email/password login
- **User Profiles**: Comprehensive profile management
- **Settings Sync**: All preferences sync across devices
- **Data Privacy**: User-controlled data collection settings

## 🚀 **Quick Start**

### **Installation**
1. **Download**: Clone or download this repository
2. **Build**: Run `npm install && npm run build`
3. **Load Extension**: 
   - Open Chrome → Extensions → Developer Mode
   - Click "Load unpacked" → Select `dist` folder
4. **Setup Database** (Optional): Execute `supabase-schema.sql` in Supabase for full features

### **Basic Usage**
1. **Click Extension Icon** → Opens popup timer
2. **Start Timer** → Begin focus session
3. **View Analytics** → Click dashboard for detailed statistics
4. **Manage Tasks** → Add tasks in the task panel
5. **Customize Settings** → Click settings icon for timer customization

## 🏗️ **Architecture**

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** with custom glass morphism design
- **Shadcn/ui** component library
- **React Query** for data fetching and caching
- **Recharts** for analytics visualization

### **Backend**
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live updates
- **JWT authentication** with secure session management

### **Chrome Extension**
- **Manifest V3** compliance
- **Service Worker** background processing
- **Chrome Storage API** for offline functionality
- **Chrome Windows API** for external popups

### **Data Architecture**
```
Offline-First Design:
├── Timer Settings → localStorage (instant)
├── Timer State → localStorage + Database sync
├── Tasks → localStorage + Background sync
├── Sessions → Database (when online)
└── Analytics → Real-time database queries
```

## 📊 **Database Schema**

### **Core Tables**
- **users**: User profiles and authentication
- **user_settings**: Timer preferences and app settings
- **focus_sessions**: Session tracking and analytics
- **tasks**: Task management with priorities
- **quotes**: Motivational content system
- **chat_conversations**: AI assistant chat history

### **Key Features**
- **Row Level Security**: User data isolation
- **Real-time Updates**: Live synchronization
- **Optimized Indexes**: Fast query performance
- **Automatic Timestamps**: Created/updated tracking

## 🔧 **Development**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Chrome browser
- Supabase account (for full features)

### **Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

### **Environment Setup**
1. **Supabase Configuration**: Update `src/lib/supabase.ts` with your credentials
2. **Database Setup**: Execute `supabase-schema.sql` in your Supabase dashboard
3. **API Keys**: Configure Gemini AI key in extension settings

### **Project Structure**
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── FocusTimer.tsx  # Main timer component
│   ├── SessionAnalytics.tsx # Analytics dashboard
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API service classes
├── utils/              # Utility functions
├── lib/                # Configuration files
└── pages/              # Extension pages
```

## 🎯 **Key Features Explained**

### **Offline-First Architecture**
- **Timer works without internet** - settings stored locally
- **Tasks created offline** - sync when connection restored
- **Session tracking** - records to database when online
- **Analytics** - requires login for cross-device sync

### **Professional Input Handling**
- **Natural typing** - no interruptions during input
- **Smart validation** - validates on blur, not during typing
- **Range enforcement** - automatic clamping to valid ranges
- **Helpful defaults** - restores sensible values for invalid input

### **Real-Time Analytics**
- **Live updates** - statistics refresh every 30 seconds
- **Cross-device sync** - same data on all logged-in devices
- **Achievement system** - gamified progress tracking
- **Visual insights** - charts and graphs for productivity patterns

## 📈 **Analytics Metrics**

### **Session Tracking**
- Total sessions started/completed
- Focus time per day/week/month
- Average session length
- Completion percentage
- Current and longest streaks

### **Productivity Insights**
- Daily goal progress (8 sessions target)
- Weekly activity patterns
- Session type distribution
- Time-of-day productivity patterns
- Achievement milestone progress

### **Visual Analytics**
- **Bar Charts**: Daily/weekly session counts
- **Line Charts**: Productivity trends over time
- **Pie Charts**: Session type distribution
- **Progress Bars**: Goal achievement and streaks

## 🏆 **Achievement System**

### **Available Achievements**
- **Focus Master**: Complete 100 focus sessions
- **Consistency Champion**: Maintain 7-day streak
- **Deep Work Master**: Accumulate 50 hours focus time
- **Productivity Pro**: Achieve 90% completion rate

### **Progress Tracking**
- Real-time progress updates
- Visual progress bars
- Achievement unlock celebrations
- Milestone notifications

## 🔒 **Privacy & Security**

### **Data Protection**
- **Row Level Security**: Database-level user isolation
- **JWT Authentication**: Secure session management
- **Local Storage**: Sensitive settings stored locally
- **User Control**: Configurable data collection preferences

### **Privacy Features**
- **Optional Analytics**: Can disable usage tracking
- **Local Operation**: Core timer works without account
- **Data Export**: Users can export their data
- **Account Deletion**: Complete data removal option

## 🚀 **Deployment**

### **Chrome Web Store**
1. **Build Production**: `npm run build`
2. **Test Extension**: Load in Chrome developer mode
3. **Package**: Zip the `dist` folder
4. **Submit**: Upload to Chrome Web Store Developer Dashboard

### **Database Setup**
1. **Create Supabase Project**: Sign up at supabase.com
2. **Execute Schema**: Run `supabase-schema.sql` in SQL editor
3. **Configure RLS**: Ensure Row Level Security is enabled
4. **Update Config**: Add your Supabase URL/key to `src/lib/supabase.ts`

## 📚 **Documentation**

### **Comprehensive Guides**
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment instructions
- `BACKEND_ARCHITECTURE.md` - Database and API documentation
- `ANALYTICS_DATABASE_INTEGRATION.md` - Analytics system details
- `IMPLEMENTATION_SUMMARY.md` - Complete feature overview

### **Technical Docs**
- `supabase-schema.sql` - Complete database schema
- `TIMER_SETTINGS_FIX.md` - Timer functionality details
- `INPUT_HANDLING_FIX.md` - Professional input handling
- `SENIOR_ENGINEER_INPUT_FIX.md` - Advanced input architecture

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Code Standards**
- **TypeScript**: Full type safety required
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks
- **Error Handling**: Comprehensive error boundaries

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Supabase** - Backend-as-a-Service platform
- **Shadcn/ui** - Beautiful component library
- **Recharts** - Powerful charting library
- **Lucide React** - Consistent icon system
- **Tailwind CSS** - Utility-first CSS framework

## 📞 **Support**

### **Getting Help**
- **Issues**: Open GitHub issue for bugs/features
- **Documentation**: Check the comprehensive docs in repository
- **Community**: Join discussions in GitHub Discussions

### **Quick Links**
- 🐛 [Report Bug](https://github.com/Mapileon2/Focus-Flow-timer/issues)
- 💡 [Request Feature](https://github.com/Mapileon2/Focus-Flow-timer/issues)
- 📖 [Documentation](https://github.com/Mapileon2/Focus-Flow-timer/tree/master/docs)
- 🚀 [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

**Built with ❤️ for productivity enthusiasts**

*Focus Flow Timer - Transform your productivity with intelligent time management*