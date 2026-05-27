const fs = require('fs');
const files = [
  'd:/Leanity/src/lib/local-first/cycle-engine.ts',
  'd:/Leanity/src/lib/local-first/useLocalCanvas.ts',
  'd:/Leanity/src/lib/local-first/useLocalNotes.ts',
  'd:/Leanity/src/lib/local-first/useLocalTasks.ts',
  'd:/Leanity/src/lib/local-first/useLocalWorkspace.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(/import \{ triggerSync \} from '\.\/sync-engine';?/g, "import { scheduleSync } from './sync-engine'");
  
  // Replace calls
  content = content.replace(/triggerSync\(\)/g, 'scheduleSync()');
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
