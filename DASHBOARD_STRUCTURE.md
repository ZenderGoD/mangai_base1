# Dashboard Structure

The dashboard is now organized into **three distinct sections** with different purposes:

## 1. 👤 Profile (`/dashboard/profile`)
**Purpose:** Public-facing creator profile management

### Features:
- **Profile Information Editor**
  - Display name
  - Username (unique URL)
  - Creator bio
  - Avatar image
  
- **Public Profile Preview**
  - Live preview of how your profile looks to readers
  - Statistics display (published stories, views, likes)
  - Published stories showcase
  - "View Public Profile" button to see actual public page

### Use Case:
This is where creators manage their public persona and brand. Everything here affects how readers see you.

---

## 2. 📊 Comic Board (`/dashboard/comic-board`)
**Purpose:** Story/comic management and analytics dashboard

### Features:
- **Overview Tab**
  - Real-time analytics (4 key metrics with trending indicators)
  - Total Stories, Views, Likes, Comments
  - Recent activity feed
  - Quick upload button

- **My Stories Tab**
  - Grid view of all your stories (published, draft, private)
  - Story cards with cover, title, synopsis, stats
  - Quick actions: View, Edit
  - Upload new story button

- **Analytics Tab**
  - Performance analytics charts (coming soon)
  - Top performing stories ranked by views
  - Engagement metrics

### Upload Story Page (`/dashboard/comic-board/upload`):
- Manual story creation form
- Title, synopsis, genre, cover image
- Status (draft/published)
- Visibility (public/unlisted/private)
- Add chapters after creation

### Use Case:
This is the creator's workspace for managing all their manga/stories, tracking performance, and analyzing engagement.

---

## 3. ⚙️ Settings (`/dashboard/settings`)
**Purpose:** Account settings and preferences

### Four Settings Categories:

#### 📧 Account Settings
- Email display
- Language preference
- Timezone selection

#### 🔒 Privacy Settings
- Public profile visibility toggle
- Show/hide email
- Show/hide statistics
- Allow comments
- Allow followers

#### 🔔 Notification Settings
- Email notifications toggle
- New followers notifications
- Story comments notifications
- Story likes notifications
- System updates
- Weekly digest

#### 🛡️ Security
- Sign out option
- Account deletion (danger zone)

### Use Case:
This is where users control their account preferences, privacy, and security settings.

---

## Navigation Structure

```
/dashboard
├── /profile          → Public creator profile management
├── /comic-board      → Story management & analytics
│   └── /upload       → Create new story manually
└── /settings         → Account preferences & security
```

## Key Differences

| Section | Focus | Visibility | Primary Actions |
|---------|-------|------------|----------------|
| **Profile** | Public persona | What readers see | Edit bio, name, avatar |
| **Comic Board** | Content management | Private dashboard | Create, edit, analyze stories |
| **Settings** | Account control | Private preferences | Privacy, notifications, security |

## Access

All sections require authentication and can be accessed from:
- Dashboard sidebar navigation
- User dropdown menu → "Dashboard"
- Direct URLs: `/dashboard/profile`, `/dashboard/comic-board`, `/dashboard/settings`

