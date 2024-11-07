import { PrismaClient } from "@prisma/client";

import { results } from "../bymapka_data.json";

const prisma = new PrismaClient();

async function updateBusinessIcons() {
  try {
    for (const result of results) {
      if (result.icon) {
        await prisma.business.update({
          where: {
            oldId: result.id,
          },
          data: {
            icon: result.icon,
          },
        });
        console.log(`Updated icon for business with oldId: ${result.id}`);
      }
    }
    console.log("Icon update completed successfully");
  } catch (error) {
    console.error("Error updating icons:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBusinessIcons().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
