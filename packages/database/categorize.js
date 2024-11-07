const fs = require('fs');

// Read the file
let rawData = fs.readFileSync('./bymapka_data.json', 'utf8');

try {
    // First try parsing without any cleaning to see if it works
    const data = JSON.parse(rawData);
    
    // Verify the data structure
    if (!data.result || !Array.isArray(data.result)) {
        throw new Error('Invalid data structure: missing result array');
    }

    // Log first item to verify structure
    console.log('First item example:');
    console.log(JSON.stringify(data.result[0], null, 2));
    console.log('\nTotal items:', data.result.length);

    // Create a categorized structure
    const categorizedData = data.result.reduce((acc, item) => {
        // Verify CategoryEn exists
        const category = item.CategoryEn || 'Uncategorized';
        
        if (!acc[category]) {
            acc[category] = [];
        }
        
        acc[category].push(item);
        return acc;
    }, {});

    // Add statistics
    const stats = {
        totalItems: data.result.length,
        categoriesCount: Object.keys(categorizedData).length,
        itemsPerCategory: Object.entries(categorizedData).reduce((acc, [category, items]) => {
            acc[category] = items.length;
            return acc;
        }, {})
    };

    const output = {
        stats,
        categories: categorizedData
    };

    // Write to a new file
    fs.writeFileSync(
        './categorized_data.json', 
        JSON.stringify(output, null, 2)
    );

    // Print statistics
    console.log('\nCategories Statistics:');
    console.log('Total items:', stats.totalItems);
    console.log('Number of categories:', stats.categoriesCount);
    console.log('\nItems per category:');
    Object.entries(stats.itemsPerCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
            console.log(`${category}: ${count} items`);
        });

} catch (error) {
    console.error('Error processing JSON:', error);
    if (error instanceof SyntaxError) {
        // Get the position of the error
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const position = parseInt(match[1]);
            console.error('\nError context:');
            console.error(rawData.slice(Math.max(0, position - 100), position));
            console.error('>>> ERROR HERE <<<');
            console.error(rawData.slice(position, position + 100));
        }
    }
    process.exit(1);
}