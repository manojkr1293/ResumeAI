import { PrismaClient, TemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seeding default templates
  const templates = [
    {
      id: 'template-professional-1',
      name: 'Executive Professional',
      category: TemplateCategory.PROFESSIONAL,
      thumbnailUrl: '/templates/thumbnails/professional.png',
      htmlTemplate: `
        <div class="resume-container professional-theme">
          <header class="resume-header">
            <h1 class="header-name">{{contact.fullName}}</h1>
            <div class="header-contact">
              <span>{{contact.email}}</span> | <span>{{contact.phone}}</span> | <span>{{contact.location}}</span>
            </div>
            <div class="header-socials">
              {{#if contact.linkedin}}<a href="{{contact.linkedin}}">LinkedIn</a>{{/if}}
              {{#if contact.github}} | <a href="{{contact.github}}">GitHub</a>{{/if}}
            </div>
          </header>
          
          {{#if summary.text}}
          <section class="resume-section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary-text">{{summary.text}}</p>
          </section>
          {{/if}}

          {{#if experience.items}}
          <section class="resume-section">
            <h2 class="section-title">Work Experience</h2>
            {{#each experience.items}}
            <div class="experience-item">
              <div class="item-header">
                <strong>{{this.title}}</strong> - <em>{{this.company}}</em>
                <span class="item-date">{{this.startDate}} - {{#if this.current}}Present{{else}}{{this.endDate}}{{/if}}</span>
              </div>
              <ul class="item-bullets">
                {{#each this.bullets}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
      `,
      cssStyles: `
        .professional-theme {
          font-family: 'Times New Roman', Times, serif;
          color: #111111;
          line-height: 1.5;
          padding: 40px;
        }
        .resume-header {
          text-align: center;
          border-bottom: 2px solid #333333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-name {
          font-size: 28px;
          text-transform: uppercase;
          margin: 0 0 5px 0;
        }
        .section-title {
          font-size: 16px;
          text-transform: uppercase;
          border-bottom: 1px solid #666666;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .experience-item {
          margin-bottom: 15px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .item-bullets {
          padding-left: 20px;
          margin: 5px 0;
        }
      `,
      isPremium: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'template-creative-1',
      name: 'Modern Creative',
      category: TemplateCategory.CREATIVE,
      thumbnailUrl: '/templates/thumbnails/creative.png',
      htmlTemplate: `
        <div class="resume-container creative-theme">
          <header class="resume-header">
            <h1 class="header-name"><span class="brand-text">{{contact.fullName}}</span></h1>
            <div class="header-contact">
              <span>{{contact.email}}</span> • <span>{{contact.phone}}</span> • <span>{{contact.location}}</span>
            </div>
          </header>

          <div class="resume-grid">
            <div class="sidebar-column">
              {{#if skills.categories}}
              <section class="resume-section">
                <h2 class="section-title">Expertise</h2>
                {{#each skills.categories}}
                <div class="skill-category">
                  <strong>{{this.name}}</strong>
                  <p>{{join this.skills ", "}}</p>
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
            
            <div class="main-column">
              {{#if summary.text}}
              <section class="resume-section">
                <h2 class="section-title">About Me</h2>
                <p>{{summary.text}}</p>
              </section>
              {{/if}}

              {{#if experience.items}}
              <section class="resume-section">
                <h2 class="section-title">Experience</h2>
                {{#each experience.items}}
                <div class="experience-item">
                  <h3 class="job-title">{{this.title}} at {{this.company}}</h3>
                  <span class="job-date">{{this.startDate}} - {{#if this.current}}Present{{else}}{{this.endDate}}{{/if}}</span>
                  <ul class="job-bullets">
                    {{#each this.bullets}}
                    <li>{{this}}</li>
                    {{/each}}
                  </ul>
                </div>
                {{/each}}
              </section>
              {{/if}}
            </div>
          </div>
        </div>
      `,
      cssStyles: `
        .creative-theme {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #2D3748;
          line-height: 1.6;
          padding: 30px;
        }
        .brand-text {
          color: #4A5568;
          border-bottom: 3px solid #667EEA;
          padding-bottom: 5px;
        }
        .resume-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
          margin-top: 30px;
        }
        .section-title {
          font-size: 18px;
          color: #5A67D8;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .job-title {
          font-size: 15px;
          margin: 0;
        }
        .job-date {
          font-size: 12px;
          color: #A0AEC0;
        }
      `,
      isPremium: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'template-minimal-1',
      name: 'Clean Minimalist',
      category: TemplateCategory.MINIMAL,
      thumbnailUrl: '/templates/thumbnails/minimal.png',
      htmlTemplate: `
        <div class="resume-container minimal-theme">
          <header class="resume-header">
            <h1 class="header-name">{{contact.fullName}}</h1>
            <div class="header-contact">
              <span>{{contact.email}}</span> | <span>{{contact.phone}}</span>
            </div>
          </header>

          {{#if summary.text}}
          <p class="summary-paragraph">{{summary.text}}</p>
          {{/if}}

          {{#if experience.items}}
          <section class="section">
            <h2 class="section-head">Experience</h2>
            {{#each experience.items}}
            <div class="exp-row">
              <div class="row-meta">
                <strong>{{this.company}}</strong>
                <span>{{this.startDate}} - {{#if this.current}}Present{{else}}{{this.endDate}}{{/if}}</span>
              </div>
              <div class="row-details">
                <em>{{this.title}}</em>
                <ul>
                  {{#each this.bullets}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
              </div>
            </div>
            {{/each}}
          </section>
          {{/if}}
        </div>
      `,
      cssStyles: `
        .minimal-theme {
          font-family: 'Inter', sans-serif;
          color: #333333;
          padding: 50px;
          max-width: 800px;
          margin: 0 auto;
        }
        .resume-header {
          margin-bottom: 30px;
        }
        .header-name {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -1px;
          margin: 0;
        }
        .section-head {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid #EEEEEE;
          padding-bottom: 5px;
          margin-top: 30px;
        }
        .exp-row {
          display: flex;
          margin-bottom: 20px;
        }
        .row-meta {
          width: 250px;
          display: flex;
          flex-direction: column;
        }
        .row-details {
          flex: 1;
        }
      `,
      isPremium: false,
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const template of templates) {
    const upserted = await prisma.template.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.category,
        thumbnailUrl: template.thumbnailUrl,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        isPremium: template.isPremium,
        isActive: template.isActive,
        sortOrder: template.sortOrder,
      },
      create: template,
    });
    console.log(`✅ Seeded template: ${upserted.name} (${upserted.category})`);
  }

  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failure:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
