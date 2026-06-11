# ResumeAI Database Architecture - ERD Documentation

## Overview
ResumeAI uses a MySQL 8.x database with Prisma ORM. The schema is designed for scalability, ATS support, AI logging, resume versioning, templates, subscriptions, and analytics.

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │◄──────────────────────────────────────────────┐
│ email (UNIQUE)  │                                               │
│ password_hash   │                                               │
│ full_name       │                                               │
│ experience_level│                                               │
│ preferred_lang  │                                               │
│ oauth_provider  │                                               │
│ oauth_uid       │                                               │
│ is_active       │                                               │
│ email_verified  │                                               │
│ created_at      │                                               │
│ updated_at      │                                               │
└─────────────────┘                                               │
         │                                                          │
         │                                                          │
         │ 1:N                                                      │
         │                                                          │
    ┌────▼──────────────────────────────────────────────────────────┼──────────────────────────────────┐
    │                                                             │                                  │
    │ 1:N                                                         │                                  │
    │                                                             │                                  │
┌───▼──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────▼─────────┐    ┌──────────────┐
│  resumes     │    │ subscriptions│    │ ai_feedbacks │    │ job_descriptions│    │  usage_logs   │
├──────────────┤    ├──────────────┤    ├──────────────┤    ├────────────────┤    ├──────────────┤
│ id (PK)       │    │ id (PK)       │    │ id (PK)       │    │ id (PK)         │    │ id (PK)       │
│ user_id (FK)  │    │ user_id (FK)  │    │ user_id (FK)  │    │ user_id (FK)    │    │ user_id (FK)  │
│ template_id(FK)│  ─┤ plan          │    │ resume_id(FK) │◄───┤                 │    │ action_type   │
│ title         │    │ razorpay_sub_id│   │ section_id(FK)│◄───┤                 │    │ metadata      │
│ status        │    │ status        │    │ module_name   │    │ title           │    │ ip_address    │
│ ats_score     │    │ current_period│    │ original_text │    │ company         │    │ user_agent    │
│ overall_score │    │ cancel_at_end │    │ ai_response   │    │ raw_text        │    │ created_at    │
│ is_primary    │    └──────────────┘    │ token_usage   │    │ extracted_data  │    └──────────────┘
│ created_at    │                       │ helpfulness  │    │ created_at      │
│ updated_at    │                       │ created_at    │    └────────────────┘
└──────────────┘                       └──────────────┘             │
         │                                                            │
         │                                                            │
         │ 1:N                                                        │
         │                                                            │
    ┌────▼────────────────────────────────────────────────────────────┘
    │
    │ 1:N
    │
┌───▼────────────┐    ┌──────────────┐    ┌──────────────┐
│ resume_sections│    │resume_versions│    │  exports      │
├────────────────┤    ├──────────────┤    ├──────────────┤
│ id (PK)        │    │ id (PK)       │    │ id (PK)       │
│ resume_id (FK) │    │ resume_id (FK)│    │ user_id (FK)  │
│ section_type   │    │ version_name  │    │ resume_id (FK)│◄───┐
│ section_order  │    │ resume_data   │    │ version_id (FK)│   │
│ content (JSON) │    │ created_at    │    │ export_type   │   │
│ is_visible     │    └──────────────┘    │ file_url      │   │
│ ai_score       │                       │ file_size_kb  │   │
│ created_at     │                       │ expires_at    │   │
│ updated_at     │                       │ created_at    │   │
└────────────────┘                       └──────────────┘   │
         │                                                   │
         │                                                   │
         │                                                   │
    ┌────▼───────────────────────────────────────────────────┘
    │
    │ 1:N
    │
┌───▼──────────┐
│ ats_scores   │
├──────────────┤
│ id (PK)      │
│ resume_id(FK)│
│ jd_id (FK)   │◄────────────────────────────────────────────┐
│ overall_score│                                                │
│ keyword_score│                                                │
│ format_score │                                                │
│ impact_score │                                                │
│ readability  │                                                │
│ breakdown    │                                                │
│ missing_keys │                                                │
│ suggestions  │                                                │
│ created_at   │                                                │
└──────────────┘                                                │
                                                                │
                                                        ┌───────▼────────┐
                                                        │ job_descriptions│
                                                        └────────────────┘

┌──────────────┐
│  templates   │
├──────────────┤
│ id (PK)       │◄────────────────────────────────────────────┐
│ name          │                                               │
│ category      │                                               │
│ thumbnail_url │                                               │
│ html_template │                                               │
│ css_styles    │                                               │
│ is_premium    │                                               │
│ is_active     │                                               │
│ sort_order    │                                               │
│ created_at    │                                               │
│ updated_at    │                                               │
└──────────────┘                                               │
         │                                                      │
         │ 1:N                                                  │
         │                                                      │
    ┌────▼────────────────────────────────────────────────────┘
    │
    │
┌───▼──────────┐
│  resumes     │
└──────────────┘
```

## Table Relationships

### Core User Relationships
- **users (1) → (N) resumes**: A user can have multiple resumes
- **users (1) → (1) subscriptions**: A user has one subscription (optional)
- **users (1) → (N) ai_feedbacks**: A user can have multiple AI feedback logs
- **users (1) → (N) job_descriptions**: A user can have multiple job descriptions
- **users (1) → (N) exports**: A user can have multiple export records
- **users (1) → (N) usage_logs**: A user can have multiple usage logs

### Resume Relationships
- **resumes (N) → (1) users**: A resume belongs to one user
- **resumes (N) → (1) templates**: A resume uses one template
- **resumes (1) → (N) resume_sections**: A resume has multiple sections
- **resumes (1) → (N) resume_versions**: A resume has multiple versions
- **resumes (1) → (N) ai_feedbacks**: A resume can have multiple AI feedback logs
- **resumes (1) → (N) ats_scores**: A resume can have multiple ATS scores
- **resumes (1) → (N) exports**: A resume can be exported multiple times

### Section Relationships
- **resume_sections (N) → (1) resumes**: A section belongs to one resume
- **resume_sections (1) → (N) ai_feedbacks**: A section can have multiple AI feedback logs

### Version Relationships
- **resume_versions (N) → (1) resumes**: A version belongs to one resume
- **resume_versions (1) → (N) exports**: A version can be exported multiple times

### AI Feedback Relationships
- **ai_feedbacks (N) → (1) users**: Feedback belongs to one user
- **ai_feedbacks (N) → (0..1) resumes**: Feedback may be associated with a resume
- **ai_feedbacks (N) → (0..1) resume_sections**: Feedback may be associated with a section

### Job Description Relationships
- **job_descriptions (N) → (1) users**: A job description belongs to one user
- **job_descriptions (1) → (N) ats_scores**: A job description can have multiple ATS scores

### ATS Score Relationships
- **ats_scores (N) → (1) resumes**: An ATS score belongs to one resume
- **ats_scores (N) → (0..1) job_descriptions**: An ATS score may be associated with a job description

### Export Relationships
- **exports (N) → (1) users**: An export belongs to one user
- **exports (N) → (1) resumes**: An export belongs to one resume
- **exports (N) → (0..1) resume_versions**: An export may be from a specific version

### Template Relationships
- **templates (1) → (N) resumes**: A template can be used by multiple resumes

## Index Strategy

### Performance-Optimized Indexes

#### Users Table
- `email` - Unique index for login queries
- `oauth_provider, oauth_uid` - Composite index for OAuth lookups
- `experience_level` - Index for user segmentation
- `created_at` - Index for analytics and reporting

#### Templates Table
- `category, is_active` - Composite index for template filtering
- `is_premium, sort_order` - Composite index for template listing

#### Subscriptions Table
- `user_id` - Foreign key index
- `plan, status` - Composite index for subscription queries
- `status, current_period_end` - Composite index for renewal queries

#### Resumes Table
- `user_id` - Foreign key index for user's resumes
- `template_id` - Foreign key index for template usage
- `user_id, status` - Composite index for user's active resumes
- `is_primary, user_id` - Composite index for primary resume lookup
- `overall_score` - Index for scoring queries
- `ats_score` - Index for ATS scoring
- `created_at` - Index for chronological queries

#### Resume Sections Table
- `resume_id` - Foreign key index
- `resume_id, section_type` - Composite index for section queries
- `section_order` - Index for ordering

#### Resume Versions Table
- `resume_id` - Foreign key index
- `resume_id, created_at` - Composite index for version history

#### AI Feedbacks Table
- `user_id` - Foreign key index
- `resume_id` - Index for resume-specific feedback
- `section_id` - Index for section-specific feedback
- `user_id, module_name` - Composite index for user's AI usage
- `created_at` - Index for chronological queries

#### Job Descriptions Table
- `user_id` - Foreign key index
- `created_at` - Index for chronological queries

#### ATS Scores Table
- `resume_id` - Foreign key index
- `job_description_id` - Index for JD-specific scores
- `resume_id, job_description_id` - Composite index for matching queries
- `overall_score` - Index for scoring queries
- `created_at` - Index for chronological queries

#### Exports Table
- `user_id` - Foreign key index
- `resume_id` - Foreign key index
- `version_id` - Index for version-specific exports
- `user_id, created_at` - Composite index for user's export history
- `expires_at` - Index for cleanup jobs

#### Usage Logs Table
- `user_id` - Foreign key index
- `action_type` - Index for action filtering
- `user_id, action_type` - Composite index for user's specific actions
- `created_at` - Index for analytics and reporting

## Data Types and Constraints

### Primary Keys
- All tables use `VARCHAR(36)` for UUID primary keys
- Compatible with Prisma's default UUID generation
- Provides better distributed system support than auto-increment integers

### Foreign Keys
- All foreign keys use `VARCHAR(36)` to match primary key types
- `ON DELETE CASCADE` for strong relationships (user → resumes, etc.)
- `ON DELETE SET NULL` for optional relationships (feedback → resume)

### JSON Columns
- `resume_sections.content` - Flexible section data structure
- `ai_feedbacks.ai_response` - Structured AI response data
- `job_descriptions.extracted_data` - Extracted JD keywords and skills
- `ats_scores.breakdown` - Detailed scoring breakdown
- `ats_scores.missing_keywords` - Missing keyword list
- `ats_scores.suggestions` - Improvement suggestions
- `usage_logs.metadata` - Flexible metadata for different action types
- `resume_versions.resume_data` - Complete resume snapshot

### Text/LongText Columns
- `templates.html_template` - HTML template strings (LONGTEXT)
- `templates.css_styles` - CSS styles (LONGTEXT)
- `ai_feedbacks.original_text` - Original user input (TEXT)
- `ai_feedbacks.ai_response` - AI response text (TEXT)
- `job_descriptions.raw_text` - Raw JD text (LONGTEXT)

### Enum Columns
- `ExperienceLevel` - INTERN, ENTRY, MID, SENIOR, LEAD, EXECUTIVE
- `PreferredLanguage` - en, hi, es, fr, de, zh, ja, ko, pt, ar
- `OAuthProvider` - GOOGLE, GITHUB, LINKEDIN
- `ResumeStatus` - DRAFT, ACTIVE, ARCHIVED
- `SectionType` - CONTACT, SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS, LANGUAGES, AWARDS, CUSTOM
- `AIModuleName` - BULLET_IMPROVER, ATS_ANALYZER, JD_EXTRACTOR, RESUME_COACH, ROAST_ENGINE, SCORING_ENGINE, QUESTION_ENGINE, RECRUITER_SIM
- `TemplateCategory` - PROFESSIONAL, CREATIVE, MINIMAL, TECHNICAL, ACADEMIC
- `SubscriptionPlan` - FREE, STARTER, PRO
- `SubscriptionStatus` - ACTIVE, CANCELLED, EXPIRED, PAST_DUE
- `ExportType` - PDF, DOCX

### Timestamps
- All tables use `DATETIME(3)` for millisecond precision
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp (auto-updated)

## Scalability Considerations

### Horizontal Scaling
- UUID primary keys enable easy database sharding
- No auto-increment sequence conflicts across shards
- Application-level ID generation possible

### Read Scalability
- Optimized indexes support read-heavy workloads
- Composite indexes reduce query complexity
- Separate read replicas can be configured

### Write Scalability
- Minimal foreign key constraints for performance
- Cascade deletes handled at database level
- JSON columns reduce need for schema migrations

### Data Archiving
- `status` field in resumes enables soft delete
- `expires_at` in exports enables automatic cleanup
- `created_at` indexes support time-based partitioning

## Security Considerations

### Data Protection
- Passwords stored as bcrypt hashes in `password_hash`
- OAuth tokens not stored (only provider and UID)
- Sensitive data in JSON columns can be encrypted at application level

### Access Control
- User-scoped queries enforced at repository level
- Subscription-based access control via `subscriptions` table
- Rate limiting tracked via `usage_logs` table

### Audit Trail
- `ai_feedbacks` table logs all AI interactions
- `usage_logs` table tracks all user actions
- `resume_versions` table maintains change history

## Performance Optimization

### Query Optimization
- Indexes cover common query patterns
- Composite indexes reduce multi-column lookups
- Foreign key indexes improve join performance

### Caching Strategy
- Template data can be cached (infrequently changing)
- User subscription status can be cached
- Resume scores can be cached in resume table

### Batch Operations
- Repository layer supports batch creates/updates
- Transaction support for complex operations
- Bulk inserts for analytics data

## Migration Strategy

### Schema Evolution
- Prisma migrations handle schema changes
- Backward-compatible changes preferred
- JSON columns allow flexible schema evolution

### Data Migration
- Version history in `resume_versions` enables rollback
- Soft delete in `resumes.status` enables recovery
- Export links expire via `expires_at` field

## Backup and Recovery

### Backup Strategy
- Full daily backups of all tables
- Incremental backups for high-volume tables (usage_logs, ai_feedbacks)
- Point-in-time recovery enabled via binary logs

### Recovery Strategy
- Foreign key constraints ensure referential integrity
- Cascade deletes prevent orphaned records
- Transaction logs enable crash recovery

## Monitoring and Maintenance

### Performance Monitoring
- Slow query log enabled
- Index usage statistics monitored
- Query execution times tracked

### Maintenance Tasks
- Old export cleanup via `expires_at` field
- Old AI feedback cleanup (configurable retention)
- Index rebuild and optimization scheduled
- Statistics update for query optimizer

## Database Size Estimation

### Per User Storage
- User record: ~1 KB
- Resume (with sections): ~50 KB average
- Resume version: ~50 KB per version
- AI feedback: ~2 KB per interaction
- Export record: ~1 KB per export

### Growth Rate
- 10,000 users: ~500 MB
- 100,000 users: ~5 GB
- 1,000,000 users: ~50 GB

### Archive Strategy
- Archive resumes older than 2 years
- Archive AI feedback older than 90 days
- Archive usage logs older than 6 months
