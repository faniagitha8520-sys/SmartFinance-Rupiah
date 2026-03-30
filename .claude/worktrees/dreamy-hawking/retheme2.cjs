const fs = require('fs');
const path = require('path');

const directories = [
  'D:/SmartFinance-Fani/src',
  'D:/SmartFinance-Fani/src/components'
];

const replacements = [
  // Catch all remaining dark mode opacities
  { p: /bg-white\/\[0\.\d+\]/g, r: "bg-white shadow-sm" },
  { p: /border-white\/\[0\.\d+\]/g, r: "border-pink-100" },
  { p: /bg-white\/\d+/g, r: "bg-white shadow-sm" },
  { p: /border-white\/\d+/g, r: "border-pink-100" },
  { p: /text-pink-400/g, r: "text-pink-600" }, // Darker pink for better contrast on white
  { p: /text-emerald-400/g, r: "text-emerald-600" },
  { p: /text-amber-400/g, r: "text-amber-600" },
  { p: /text-purple-400/g, r: "text-purple-600" },
  { p: /from-pink-400/g, r: "from-pink-500" },
  { p: /to-pink-600/g, r: "to-pink-600" },
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (!file.endsWith('.jsx')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({p, r}) => {
      content = content.replace(p, r);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Processed', file);
    }
  });
});
console.log('Pass 2 Complete');
