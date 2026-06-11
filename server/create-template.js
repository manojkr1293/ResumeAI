const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultTemplate() {
  try {
    const template = await prisma.template.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        name: 'Default Template',
        category: 'PROFESSIONAL',
        thumbnailUrl: '',
        htmlTemplate: '<div class="resume"></div>',
        cssStyles: '.resume { padding: 20px; }',
        isPremium: false,
        isActive: true,
        sortOrder: 0,
      },
    });
    console.log('Default template created:', template);
  } catch (error) {
    console.error('Error creating template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultTemplate();
