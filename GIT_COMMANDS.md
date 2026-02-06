# Git Commands Reference for KidStory AI

## 📤 Commands for Future Pushes (Use These Every Time)

### **Quick Push (3 commands):**
```bash
cd /Users/canturkay/kidstory-ai
git add .
git commit -m "Your commit message here"
git push
```

### **Detailed Workflow:**

#### 1. Navigate to Project
```bash
cd /Users/canturkay/kidstory-ai
```

#### 2. Check Status (Optional - See what changed)
```bash
git status
```

#### 3. Stage All Changes
```bash
git add .
```

Or stage specific files:
```bash
git add src/screens/CreateScreen.js
git add App.js
```

#### 4. Commit Changes
```bash
git commit -m "Brief description of what you changed"
```

**Examples of good commit messages:**
- `"Add delete button to photo preview"`
- `"Fix modal animation timing issue"`
- `"Update textbox styling and colors"`
- `"Implement onboarding flow"`

#### 5. Push to GitHub
```bash
git push
```

---

## 🔄 Other Useful Git Commands

### Check Git History
```bash
git log --oneline
```

### See What Changed in Files
```bash
git diff
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Discard All Local Changes (⚠️ Dangerous)
```bash
git reset --hard HEAD
```

### Pull Latest Changes from GitHub
```bash
git pull
```

### Create a New Branch
```bash
git checkout -b feature-name
```

### Switch Branches
```bash
git checkout main
git checkout feature-name
```

---

## 📋 Common Scenarios

### **Scenario 1: You made changes and want to push**
```bash
cd /Users/canturkay/kidstory-ai
git add .
git commit -m "Describe your changes"
git push
```

### **Scenario 2: You want to see what you changed**
```bash
cd /Users/canturkay/kidstory-ai
git status              # See modified files
git diff                # See actual changes
```

### **Scenario 3: Made a mistake in last commit message**
```bash
git commit --amend -m "New commit message"
git push --force
```

### **Scenario 4: Want to ignore a file you added by mistake**
```bash
# Add file to .gitignore
echo "filename.txt" >> .gitignore
git rm --cached filename.txt
git commit -m "Remove tracked file"
git push
```

---

## 💡 Pro Tips

1. **Commit Often**: Make small, frequent commits rather than huge ones
2. **Meaningful Messages**: Write clear commit messages that explain WHY, not just what
3. **Check Before Push**: Always run `git status` before committing to see what you're about to commit
4. **Pull Before Push**: If working on multiple machines, run `git pull` before starting work

---

## ⚙️ Your Project Setup

- **Local Path**: `/Users/canturkay/kidstory-ai`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/kidstory-ai`
- **Main Branch**: `main`
