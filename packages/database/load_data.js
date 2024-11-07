const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(path.join(__dirname, 'bymapka_data.json'), 'utf8')
    const data = JSON.parse(rawData)

    // First, let's create a map of unique categories
    const uniqueCategories = new Map()
    let categoryId = 1

    data.result.forEach(item => {
        if (!uniqueCategories.has(item.CategoryEn)) {
            uniqueCategories.set(item.CategoryEn, categoryId++)
        }
    })

    console.log('Found categories:', uniqueCategories.size)

    // Create categories first
    console.log('Creating categories...')
    for (const [categoryName, id] of uniqueCategories) {
        const categoryData = data.result.find(item => item.CategoryEn === categoryName)
        
        await prisma.category.upsert({
            where: { id },
            update: {},
            create: {
                id,
                nameBy: categoryData.CategoryBy || categoryName,
                nameRu: categoryData.CategoryRu || categoryName,
                nameEn: categoryName,
                icon: categoryData.icon || ''
            }
        })
    }

    console.log('Categories created successfully')

    // Create businesses
    console.log('Creating businesses...')
    let count = 0
    for (const item of data.result) {
        try {
            const categoryId = uniqueCategories.get(item.CategoryEn)
            if (!categoryId) {
                console.warn(`Category not found for business: ${item.Name}`)
                continue
            }

            await prisma.business.create({
                data: {
                    oldId: item.id,
                    name: item.Name,
                    address: item.Address || '',
                    phone: item.Phone || '',
                    email: item.Email || '',
                    lat: parseFloat(item.Lat) || 0,
                    lng: parseFloat(item.Lng) || 0,
                    workTime: item.WorkTime || '',
                    socialNetworks: item.SocialNetworks || '',
                    categoryId
                }
            })
            count++
            if (count % 10 === 0) {
                console.log(`Processed ${count} businesses`)
            }
        } catch (error) {
            console.error(`Error processing business: ${item.Name}`, error)
        }
    }

    console.log(`Successfully created ${count} businesses`)
}

main()
    .catch(e => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 