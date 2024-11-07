const { prisma } = require('../')

function createSlug(name, categoryName) {
    // Convert to lowercase and replace spaces/special chars with hyphens
    const baseSlug = `${categoryName}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace special characters with hyphens
        .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen

    return baseSlug
}

async function generateUniqueSlug(baseName, categoryName, existingSlugs) {
    let slug = createSlug(baseName, categoryName)
    let counter = 1

    // If slug exists, add a number until we find a unique one
    while (existingSlugs.has(slug)) {
        slug = `${createSlug(baseName, categoryName)}-${counter}`
        counter++
    }

    existingSlugs.add(slug)
    return slug
}

async function main() {
    try {
        console.log('Starting slug update...')

        // Get all businesses with their categories
        const businesses = await prisma.business.findMany({
            include: {
                category: true
            }
        })

        console.log(`Found ${businesses.length} businesses to update`)

        // Keep track of used slugs
        const existingSlugs = new Set()

        // Update each business
        for (const business of businesses) {
            const slug = await generateUniqueSlug(
                business.name,
                business.category.nameEn,
                existingSlugs
            )

            await prisma.business.update({
                where: { id: business.id },
                data: { slug }
            })

            console.log(`Updated ${business.name} with slug: ${slug}`)
        }

        console.log('Slug update completed successfully')

    } catch (error) {
        console.error('Error updating slugs:', error)
        throw error
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    }) 