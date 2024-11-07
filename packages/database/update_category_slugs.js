const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function createSlug(categoryName) {
    // Convert to lowercase and replace spaces/special chars with hyphens
    return categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace special characters with hyphens
        .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
}

async function main() {
    try {
        console.log('Starting category slug update...')

        // Get all categories
        const categories = await prisma.category.findMany()
        console.log(`Found ${categories.length} categories to update`)

        // Keep track of used slugs
        const existingSlugs = new Set()

        // Update each category
        for (const category of categories) {
            let slug = createSlug(category.nameEn)
            let counter = 1

            // If slug exists, add a number until we find a unique one
            while (existingSlugs.has(slug)) {
                slug = `${createSlug(category.nameEn)}-${counter}`
                counter++
            }

            existingSlugs.add(slug)

            // Update the category with the new slug
            await prisma.category.update({
                where: { id: category.id },
                data: { slug }
            })

            console.log(`Updated category "${category.nameEn}" with slug: ${slug}`)
        }

        console.log('Category slug update completed successfully')

    } catch (error) {
        console.error('Error updating category slugs:', error)
        throw error
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    }) 