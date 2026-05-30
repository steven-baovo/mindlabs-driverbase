import os

replacements = {
    '@/components/tasks/ProjectList': '@/components/projects/ProjectList',
    '@/components/tasks/ProjectDetails': '@/components/projects/ProjectDetails',
    '@/components/tasks/IssueList': '@/components/issues/IssueList',
    '@/components/tasks/IssueDetails': '@/components/issues/IssueDetails',
    '@/components/tasks/CycleList': '@/components/cycles/CycleList',
    '@/components/tasks/CycleDetails': '@/components/cycles/CycleDetails',
    '@/components/tasks/QuickCreateModal': '@/components/shared/QuickCreateModal',
    '@/components/tasks/types': '@/types/models',
    "'./types'": "'@/types/models'",
    '"./types"': '"@/types/models"',
    "'./QuickCreateModal'": "'@/components/shared/QuickCreateModal'",
    '"./QuickCreateModal"': '"@/components/shared/QuickCreateModal"',
    "'./ProjectList'": "'@/components/projects/ProjectList'",
    '"./ProjectList"': '"@/components/projects/ProjectList'",
    "'./ProjectDetails'": "'@/components/projects/ProjectDetails'",
    '"./ProjectDetails"': '"@/components/projects/ProjectDetails'",
    "'./IssueList'": "'@/components/issues/IssueList'",
    '"./IssueList"': '"@/components/issues/IssueList'",
    "'./IssueDetails'": "'@/components/issues/IssueDetails'",
    '"./IssueDetails"': '"@/components/issues/IssueDetails'",
    "'./CycleList'": "'@/components/cycles/CycleList'",
    '"./CycleList"': '"@/components/cycles/CycleList'",
    "'./CycleDetails'": "'@/components/cycles/CycleDetails'",
    '"./CycleDetails"': '"@/components/cycles/CycleDetails"'
}

def walk_and_replace(start_dir):
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                changed = False
                for old, new in replacements.items():
                    if old in content:
                        content = content.replace(old, new)
                        changed = True
                
                if changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {path}")

walk_and_replace('./src')
