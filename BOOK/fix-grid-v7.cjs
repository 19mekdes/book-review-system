const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Grid components for MUI v7...');
console.log('=====================================\n');

const srcDir = path.join(process.cwd(), 'src');

// Check if src directory exists
if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found at:', srcDir);
    process.exit(1);
}

// Find all TypeScript files
const findFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.includes('node_modules')) {
            findFiles(filePath, fileList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fileList.push(filePath);
        }
    });
    return fileList;
};

console.log('📁 Scanning files...\n');
const files = findFiles(srcDir);
console.log(`Found ${files.length} TypeScript files\n`);

let fixedCount = 0;
let errorCount = 0;

files.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Replace <Grid item xs= with <Grid xs=
        content = content.replace(/<Grid\s+item\s+(xs|sm|md|lg|xl)=/g, '<Grid $1=');
        
        // Replace <Grid item> with <Grid>
        content = content.replace(/<Grid\s+item\s*>/g, '<Grid>');
        
        // Replace item={true}
        content = content.replace(/\s+item=\{true\}/g, '');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
            fixedCount++;
        }
    } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err.message);
        errorCount++;
    }
});

console.log('\n=====================================');
console.log('📊 Summary:');
console.log(`   ✅ Files fixed: ${fixedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log('=====================================');
console.log('\n🎉 Grid fixes complete!');
console.log('\n⚠️  Please restart TypeScript server in VSCode:');
console.log('   Press Ctrl+Shift+P → "TypeScript: Restart TS server"\n');
