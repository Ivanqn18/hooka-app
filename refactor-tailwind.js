const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');

const replacements = {
  'glass': 'bg-[#13151A]/70 backdrop-blur-md rounded-xl border border-white/5 shadow-xl',
  'button-primary': 'bg-[#FF5722] text-white hover:bg-[#E64A19] hover:-translate-y-px shadow-lg shadow-[#FF5722]/20',
  'button': 'font-medium px-4 py-2 rounded-lg transition-all',
  'form-group': 'flex flex-col gap-2 text-left',
  'form-input': 'px-4 py-3 rounded-lg border border-white/5 bg-white/5 text-[#F8F9FA] transition-all focus:border-[#FF5722] focus:bg-white/10 outline-none w-full',
  'card': 'bg-[#13151A] rounded-2xl shadow-xl',
  'fade-in': 'animate-fade-in-up'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Find all className="..." strings and replace the words inside them
  const regex = /className="([^"]+)"/g;
  content = content.replace(regex, (match, classNames) => {
    let newClassNames = classNames.split(' ').map(cls => {
      // If the class is in our replacements, substitute it. Otherwise, keep it.
      return replacements[cls] || cls;
    }).join(' ');
    
    // Remove duplicates that might occur if a file had both 'button' and 'button-primary' 
    // and both injected overlapping utilities (though they shouldn't overlap directly here)
    newClassNames = Array.from(new Set(newClassNames.split(' '))).join(' ');

    return `className="${newClassNames}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

traverseDirectory(directoryPath);
console.log('Refactoring complete.');
