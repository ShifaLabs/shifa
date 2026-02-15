# Contributing to Shifa 🚀

Welcome! Thank you for your interest in contributing to Shifa. To ensure smooth and organized collaboration, please follow these guidelines carefully.

**Repository Link:** [https://github.com/ShifaLabs/shifa](https://github.com/ShifaLabs/shifa)

---

## 1. Getting Started

### Forking the Repository

1. Go to the [main Shifa repository](https://github.com/ShifaLabs/shifa).
2. Click the **Fork** button on the top-right corner.
3. Clone your forked repository to your local machine:

```bash
git clone https://github.com/your-username/shifa.git
cd shifa

```

### Setting Up Remotes

Add the main Shifa repo as an upstream remote to keep your local code in sync:

```bash
git remote add upstream https://github.com/ShifaLabs/shifa.git
git fetch upstream

```

---

## 2. Branching Strategy

To maintain a clean workflow, we use the following branch structure:

- **`main`**: Stable code, ready for production.
- **`development`**: Integration branch where all team members merge their work for review.
- **Individual Branches**: Create a branch using your name for all your work:
- **Syntax:** `<name>/<feature-description>`
- **Examples:** `sojib/video-call-integration` or `shishir/login-bugfix`

### ⚠️ Critical Rules:

- **No Branch Deletion:** Branches must remain throughout the project duration.
- **Isolation:** All work must be pushed to your own branch; do not modify others' code.
- **Contribution Tracking:** Ensure your contributions are reflected in the Git history. Marks/credit depend on visible, verified contributions.
- **Feature Requirement:** Every member must implement at least **one complete feature**. Minor components (like navbars or footers) do not meet the requirement for technical marks.

---

## 3. Making Changes

### Commit Message Syntax

Follow this naming convention for all commits:

| Action               | Syntax                                                   |
| -------------------- | -------------------------------------------------------- |
| **Adding New Code**  | `[ADDED]: Meaningful message about what you added`       |
| **Modifying Code**   | `[MODIFIED]/[UPDATED]: Meaningful message about change`  |
| **Feature Complete** | `[DONE]: Meaningful message about the feature completed` |

### Staying Updated

Keep your branch up to date with the `development` branch. **Prefer rebase over merge** for a clean history:

```bash
git fetch upstream
git rebase upstream/development

```

---

## 4. Pull Request (PR) Guidelines

1. Push your branch to your fork:

```bash
git push origin <name>/<feature-description>

```

2. Open a Pull Request from your branch to the **`development`** branch of the main Shifa repo.

**PR Checklist:**

- [ ] Clear and descriptive title.
- [ ] Proper description of changes included.
- [ ] Linked to relevant issues (if any).
- [ ] Tested locally before submission.
- [ ] **Note:** Do not merge your own PR. Only maintainers/reviewers can merge.

---

## 5. Rules & Best Practices

- **Communication:** Discuss major changes in Discord or the designated team channel.
- **Structure:** Adhere strictly to the existing folder structure and naming conventions.
- **Documentation:** If your feature requires setup, update the documentation accordingly.
- **Testing:** Always test features locally to ensure you haven't broken existing functionality.

---

## 6. Learning Resources

Before starting, we highly recommend reviewing:

- **Programming Hero:** Milestone 1, Modules 3.8 & 3.9.
- These videos cover the Git workflow, branching, and collaboration best practices essential for this project.

---

## 7. Etiquette

- Be respectful in comments and reviews.
- Provide constructive, helpful feedback.
- **Ask questions** if you are unsure—it is always better than guessing.

---

### Next Step

Would you like me to generate a **Pull Request Template** that contributors can use to ensure they meet all your requirements when submitting code?
