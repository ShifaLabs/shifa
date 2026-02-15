# 🛠 Shifa Repository: Team Setup & Contribution Guide

This guide outlines the workflow for collaborating on the **Shifa** project. Following these steps ensures code safety, organized branching, and a smooth review process.

**Main Repository:** [https://github.com/ShifaLabs/shifa.git](https://github.com/ShifaLabs/shifa.git)

---

## 1. Prerequisites

Before starting, ensure you have the following:

- **Git Installed:** [Download here](https://git-scm.com/downloads)
- **Terminal:** Git Bash (Windows) or native Terminal (Mac/Linux).
- **Access:** Ensure you have collaborator access to the Shifa repository.

---

## 2. Authentication (Setup SSH)

_Recommended for secure, passwordless access to private repos._

1. **Generate Key:** Open your terminal and run:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"

```

2. **Start Agent:**

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

```

3. **Add to GitHub:** Copy your key to clipboard:

```bash
cat ~/.ssh/id_ed25519.pub

```

Go to **GitHub Settings → SSH and GPG keys → New SSH key** and paste it. 4. **Test Connection:**

```bash
ssh -T git@github.com

```

---

## 3. Cloning & Branching Strategy

### Step 1: Clone the Repo

```bash
git clone git@github.com:ShifaLabs/shifa.git
cd shifa

```

### Step 2: Create Your Personal Branch

**Never** work directly on `main` or `development`. Always create a feature branch from `development`.

```bash
# Switch to development and get latest changes
git checkout development
git pull origin development

# Create your branch: <name>/<feature-description>
git checkout -b <yourname>/<feature-name>

```

_Example: `git checkout -b sojib/video-call-feature_`

---

## 4. Development Workflow

### Step 3: Making Changes

Work on your feature, then stage and commit your changes using the mandatory format:

| Type            | Prefix       | Description                           |
| --------------- | ------------ | ------------------------------------- |
| **New Feature** | `[ADDED]`    | Use when adding new files/logic.      |
| **Updates**     | `[MODIFIED]` | Use for bug fixes or logic updates.   |
| **Completion**  | `[DONE]`     | Use when the entire feature is ready. |

**Example Commit:**

```bash
git add .
git commit -m "[ADDED]: Implement video call feature using 100ms SDK"

```

### Step 4: Pushing & Pull Requests

1. **Push to GitHub:**

```bash
git push origin <yourname>/<feature-name>

```

2. **Open PR:** Go to the GitHub repository → **Pull Requests** → **New Pull Request**.

- **Base:** `development`
- **Compare:** `your-branch-name`

3. **Review:** Wait for a maintainer to review and merge. **Do not merge your own PR.**

---

## 5. Staying in Sync

To avoid merge conflicts, regularly pull the latest code from `development` into your branch:

```bash
git fetch origin
git rebase origin/development

```

_If conflicts occur, resolve them locally, then continue your work._

---

## ⚠️ Repository Rules

> [!IMPORTANT]
>
> 1. **No Direct Commits:** Never commit directly to `main` or `development`.
> 2. **Branch Preservation:** Do not delete other members' branches.
> 3. **Feature Requirement:** Every member must implement at least **one complete feature** (UI components like Navbars do not count toward technical marks).
> 4. **Local Testing:** Ensure the app runs locally before pushing code.
> 5. **Clean History:** Prefer `rebase` over `merge` to keep the git graph readable.

---

**Happy Coding!** If you run into issues, please reach out via the team WhatsApp.
