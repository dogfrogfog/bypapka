const { PrismaClient } = require('@prisma/client')
const fs =require('fs');
const path =require('path');

const prisma = new PrismaClient();

// Read the JSON file
const rawData = fs.readFileSync(path.join('./bymapka_data.json'), 'utf8');
const { result } = JSON.parse(rawData);

async function updateBusinessIcons() {
  try {
    for (const r of result) {
      if (r.icon) {
        await prisma.business.updateMany({
          where: {
            oldId: r.id.toString()
          },
          data: {
            country: r.Country
          }
        });
        console.log(`Updated icon for business with oldId: ${r.id}`);
      }
    }
    console.log('Icon update completed successfully');
  } catch (error) {
    console.error('Error updating icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBusinessIcons()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 