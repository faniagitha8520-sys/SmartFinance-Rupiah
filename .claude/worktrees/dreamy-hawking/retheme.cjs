const fs = require('fs');
const path = require('path');

const directories = [
  'D:/SmartFinance-Fani/src',
  'D:/SmartFinance-Fani/src/components'
];

// Mapping of string replacements for light theme
const replacements = [
  { p: /bg-\[#0a0612\]/g, r: "bg-pink-50" },
  { p: /bg-white\/\[0\.04\]/g, r: "bg-white shadow-sm shadow-pink-100/50" },
  { p: /border-white\/\[0\.06\]/g, r: "border-pink-100" },
  { p: /bg-white\/5/g, r: "bg-white border border-pink-100" },
  { p: /border-white\/10/g, r: "border-pink-100" },
  { p: /bg-white\/10/g, r: "bg-pink-50" },
  { p: /bg-white\/\[0\.08\]/g, r: "bg-pink-100" },
  { p: /bg-[#1a0e28]/g, r: "bg-pink-100" }, // For tooltips
  { p: /border-white\/20/g, r: "border-pink-200" },
  { p: /bg-white\/20/g, r: "bg-pink-200" },
  
  // Ambiance blur
  { p: /bg-pink-600\/\[0\.04\]/g, r: "bg-pink-500/10" },
  { p: /bg-purple-600\/\[0\.03\]/g, r: "bg-purple-500/10" },
  { p: /bg-pink-600\/8/g, r: "bg-pink-500/15" },

  // Text colors
  { p: /text-white/g, r: "text-slate-800" },
  { p: /text-slate-400/g, r: "text-slate-500" },
  { p: /text-slate-300/g, r: "text-slate-600" },
  { p: /text-pink-100/g, r: "text-pink-900" },
  { p: /bg-slate-800/g, r: "bg-slate-100" },
  
  // Specific exclusions where "text-slate-800" breaks solid colored buttons!
  // If a class contains 'from-pink-500' or 'bg-pink-500' or 'bg-blue-500' or 'bg-red-500', it needs text-white back!
  // We'll fix these conditionally later in manual replacements, or just use regex lookarounds if JS supported it easily. Let's do a fast post-fix:
  { p: /from-pink-500(.*?)text-slate-800/g, r: "from-pink-500$1text-white" },
  { p: /bg-pink-500(.*?)text-slate-800/g, r: "bg-pink-500$1text-white" },
  { p: /bg-blue-500(.*?)text-slate-800/g, r: "bg-blue-500$1text-white" },
  { p: /bg-red-500(.*?)text-slate-800/g, r: "bg-red-500$1text-white" },
  { p: /bg-green-500(.*?)text-slate-800/g, r: "bg-green-500$1text-white" },
  { p: /bg-slate-900 text-slate-800/g, r: "bg-slate-800 text-white" } // Fix specific Pin screen keypad if any
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (!file.endsWith('.jsx')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Apply theme replacements
    replacements.forEach(({p, r}) => {
      content = content.replace(p, r);
    });

    // Fix the debouncedTx bug in App.jsx
    if (file === 'App.jsx') {
      content = content.replace(
        "if (!loading && debouncedTx.length > 0) { setSaving(true); saveData",
        "if (!loading && debouncedTx) { setSaving(true); saveData"
      );
    }
    
    // Reverts: Because `text-white` might be globally swapped to `text-slate-800`, 
    // we need to fix Lucide icons inside solid buttons which don't have text- classes initially 
    // but might be explicitly `text-slate-800`.
    // Example: <Plus className="w-6 h-6 text-slate-800" /> inside the big FAB button wrapper.
    if (file === 'App.jsx') {
      content = content.replace('<Plus className="w-6 h-6 text-slate-800" />', '<Plus className="w-6 h-6 text-white" />');
      content = content.replace('<LayoutDashboard className="w-4 h-4 text-slate-800" />', '<LayoutDashboard className="w-4 h-4 text-white" />');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Processed', file);
    }
  });
});

console.log('Complete');
