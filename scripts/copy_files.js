const fs = require('fs');
const path = require('path');

const copies = [
  ['src/components/tasks/CycleDetails.tsx', 'src/components/cycles/CycleDetails.tsx'],
  ['src/components/tasks/CycleList.tsx', 'src/components/cycles/CycleList.tsx'],
  ['src/components/tasks/IssueDetails.tsx', 'src/components/issues/IssueDetails.tsx'],
  ['src/components/tasks/IssueList.tsx', 'src/components/issues/IssueList.tsx'],
  ['src/components/tasks/ProjectDetails.tsx', 'src/components/projects/ProjectDetails.tsx'],
  ['src/components/tasks/ProjectList.tsx', 'src/components/projects/ProjectList.tsx'],
  ['src/components/tasks/QuickCreateModal.tsx', 'src/components/shared/QuickCreateModal.tsx'],
  ['src/components/tasks/types.tsx', 'src/types/models.ts']
];

for (const [src, dest] of copies) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} to ${dest}`);
}
