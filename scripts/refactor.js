const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const map = {
  '@/components/tasks/ProjectList': '@/components/projects/ProjectList',
  '@/components/tasks/ProjectDetails': '@/components/projects/ProjectDetails',
  '@/components/tasks/IssueList': '@/components/issues/IssueList',
  '@/components/tasks/IssueDetails': '@/components/issues/IssueDetails',
  '@/components/tasks/CycleList': '@/components/cycles/CycleList',
  '@/components/tasks/CycleDetails': '@/components/cycles/CycleDetails',
  '@/components/tasks/QuickCreateModal': '@/components/shared/QuickCreateModal',
  '@/components/tasks/types': '@/types/models',
  
  // also fix relative imports in the moved files
  "'./types'": "'@/types/models'",
  '"./types"': '"@/types/models"',
  "'./QuickCreateModal'": "'@/components/shared/QuickCreateModal'",
  '"./QuickCreateModal"': '"@/components/shared/QuickCreateModal"',
  "'./ProjectList'": "'@/components/projects/ProjectList'",
  '"./ProjectList"': '"@/components/projects/ProjectList"',
  "'./ProjectDetails'": "'@/components/projects/ProjectDetails'",
  '"./ProjectDetails"': '"@/components/projects/ProjectDetails"',
  "'./IssueList'": "'@/components/issues/IssueList'",
  '"./IssueList"': '"@/components/issues/IssueList"',
  "'./IssueDetails'": "'@/components/issues/IssueDetails'",
  '"./IssueDetails"': '"@/components/issues/IssueDetails"',
  "'./CycleList'": "'@/components/cycles/CycleList'",
  '"./CycleList"': '"@/components/cycles/CycleList"',
  "'./CycleDetails'": "'@/components/cycles/CycleDetails'",
  '"./CycleDetails"': '"@/components/cycles/CycleDetails"'
};

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [key, value] of Object.entries(map)) {
      if (content.includes(key)) {
        content = content.split(key).join(value);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
