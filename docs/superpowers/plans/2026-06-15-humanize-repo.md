# Humanize Repo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover todos os arquivos AI do myXmlFormatter no GitHub, arquivá-los localmente e no Notion + Google Drive, e criar a skill `/humanize-repo` reutilizável.

**Architecture:** Dois entregáveis em sequência — Parte A aplica a limpeza no myXmlFormatter (Tasks 1–4); Parte B cria a skill reusável via skill-creator (Task 5). A Parte A demonstra o padrão que a Parte B codifica.

**Tech Stack:** Bash, git, Notion MCP, Google Drive MCP, skill-creator

---

## Parte A — Aplicar ao myXmlFormatter

### Task 1: Arquivar arquivos AI localmente

**Files:**
- Create dir: `~/Documents/ai-docs/myXmlFormatter/plans/`
- Create dir: `~/Documents/ai-docs/myXmlFormatter/.claude/`
- Create dir: `~/Documents/ai-docs/myXmlFormatter/docs/superpowers/specs/`

- [ ] **Step 1: Criar diretórios de destino**

```bash
mkdir -p ~/Documents/ai-docs/myXmlFormatter/plans
mkdir -p ~/Documents/ai-docs/myXmlFormatter/.claude
mkdir -p ~/Documents/ai-docs/myXmlFormatter/docs/superpowers/specs
```

Esperado: sem output, diretórios criados.

- [ ] **Step 2: Copiar arquivos AI para o arquivo local**

```bash
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/001-editor-ui-redesign.md \
   ~/Documents/ai-docs/myXmlFormatter/plans/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/002-dracula-syntax-highlight.md \
   ~/Documents/ai-docs/myXmlFormatter/plans/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/003-drag-drop-file.md \
   ~/Documents/ai-docs/myXmlFormatter/plans/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/004-shareable-url.md \
   ~/Documents/ai-docs/myXmlFormatter/plans/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/README.md \
   ~/Documents/ai-docs/myXmlFormatter/plans/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/.claude/launch.json \
   ~/Documents/ai-docs/myXmlFormatter/.claude/
cp /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/docs/superpowers/specs/2026-06-15-humanize-repo-design.md \
   ~/Documents/ai-docs/myXmlFormatter/docs/superpowers/specs/
```

- [ ] **Step 3: Verificar arquivos no destino**

```bash
find ~/Documents/ai-docs/myXmlFormatter -type f
```

Esperado:
```
/Users/geldopc/Documents/ai-docs/myXmlFormatter/.claude/launch.json
/Users/geldopc/Documents/ai-docs/myXmlFormatter/docs/superpowers/specs/2026-06-15-humanize-repo-design.md
/Users/geldopc/Documents/ai-docs/myXmlFormatter/plans/001-editor-ui-redesign.md
/Users/geldopc/Documents/ai-docs/myXmlFormatter/plans/002-dracula-syntax-highlight.md
/Users/geldopc/Documents/ai-docs/myXmlFormatter/plans/003-drag-drop-file.md
/Users/geldopc/Documents/ai-docs/myXmlFormatter/plans/004-shareable-url.md
/Users/geldopc/Documents/ai-docs/myXmlFormatter/plans/README.md
```

---

### Task 2: Limpar git tracking

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Adicionar padrões AI ao .gitignore**

Adicionar ao final de `/Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/.gitignore`:

```
# AI reference docs
plans/
advisor-plans/
.claude/
CLAUDE.md
docs/superpowers/
```

- [ ] **Step 2: Remover arquivos AI do tracking do git**

```bash
cd /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter
git rm -r --cached plans/ .claude/ docs/
```

Esperado:
```
rm 'plans/001-editor-ui-redesign.md'
rm 'plans/002-dracula-syntax-highlight.md'
rm 'plans/003-drag-drop-file.md'
rm 'plans/004-shareable-url.md'
rm 'plans/README.md'
rm '.claude/launch.json'
rm 'docs/superpowers/specs/2026-06-15-humanize-repo-design.md'
```

- [ ] **Step 3: Commit e push**

```bash
git add .gitignore
git commit -m "chore: remove AI reference docs from git tracking"
git push
```

Esperado: push bem-sucedido. Confirmar que `plans/`, `.claude/` e `docs/` não aparecem mais em `https://github.com/geldopc/myXmlFormatter`.

- [ ] **Step 4: Verificar que arquivos ainda existem localmente**

```bash
ls /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/plans/
ls /Users/geldopc/Documents/nerdzilla/front/my-xml-formatter/.claude/
```

Esperado: arquivos presentes (`git rm --cached` só destraca, não apaga).

---

### Task 3: Upload para Google Drive

- [ ] **Step 1: Buscar ou criar pasta raiz "AI Docs"**

Usar o MCP do Google Drive (`search_files`) com query:
```
name = 'AI Docs' and mimeType = 'application/vnd.google-apps.folder' and trashed = false
```

Se não encontrar, criar com `create_file`:
```json
{
  "name": "AI Docs",
  "mimeType": "application/vnd.google-apps.folder"
}
```

Guardar o ID retornado como `AI_DOCS_FOLDER_ID`.

- [ ] **Step 2: Criar subpasta "myXmlFormatter"**

Usar `create_file`:
```json
{
  "name": "myXmlFormatter",
  "mimeType": "application/vnd.google-apps.folder",
  "parents": ["<AI_DOCS_FOLDER_ID>"]
}
```

Guardar ID como `PROJECT_FOLDER_ID`.

- [ ] **Step 3: Criar subpasta "plans" e fazer upload dos 5 arquivos**

Criar subpasta `plans` com parent `PROJECT_FOLDER_ID`. Guardar ID como `PLANS_FOLDER_ID`.

Fazer upload de cada arquivo com parent `PLANS_FOLDER_ID`:
- `~/Documents/ai-docs/myXmlFormatter/plans/README.md`
- `~/Documents/ai-docs/myXmlFormatter/plans/001-editor-ui-redesign.md`
- `~/Documents/ai-docs/myXmlFormatter/plans/002-dracula-syntax-highlight.md`
- `~/Documents/ai-docs/myXmlFormatter/plans/003-drag-drop-file.md`
- `~/Documents/ai-docs/myXmlFormatter/plans/004-shareable-url.md`

- [ ] **Step 4: Criar subpasta ".claude" e fazer upload de launch.json**

Criar subpasta `.claude` com parent `PROJECT_FOLDER_ID`.
Upload `~/Documents/ai-docs/myXmlFormatter/.claude/launch.json` nessa pasta.

- [ ] **Step 5: Criar subpasta "docs/superpowers/specs" e fazer upload do spec**

Criar subpastas `docs` → `superpowers` → `specs` aninhadas sob `PROJECT_FOLDER_ID`.
Upload `~/Documents/ai-docs/myXmlFormatter/docs/superpowers/specs/2026-06-15-humanize-repo-design.md`.

- [ ] **Step 6: Obter o link da pasta do projeto**

Usar `get_file_metadata` no `PROJECT_FOLDER_ID` e copiar o `webViewLink`.
Guardar como `DRIVE_LINK` para o resumo final.

---

### Task 4: Upload para Notion

- [ ] **Step 1: Verificar se existe database "AI Docs"**

Usar `notion-search` com query `AI Docs`. Se encontrar database com esse nome, guardar ID como `AI_DOCS_DB_ID` e pular Step 2.

- [ ] **Step 2: Criar database "AI Docs" (se não existir)**

Usar `notion-create-database` na página raiz do workspace:
```json
{
  "title": [{ "text": { "content": "AI Docs" } }],
  "properties": {
    "Name": { "title": {} },
    "Project": { "rich_text": {} },
    "Type": {
      "select": {
        "options": [
          { "name": "plan", "color": "blue" },
          { "name": "spec", "color": "green" },
          { "name": "config", "color": "gray" }
        ]
      }
    }
  }
}
```

Guardar ID retornado como `AI_DOCS_DB_ID`.

- [ ] **Step 3: Criar page "myXmlFormatter" no database**

Usar `notion-create-pages` com parent `AI_DOCS_DB_ID`:
```json
{
  "parent": { "database_id": "<AI_DOCS_DB_ID>" },
  "properties": {
    "Name": { "title": [{ "text": { "content": "myXmlFormatter" } }] },
    "Project": { "rich_text": [{ "text": { "content": "myXmlFormatter" } }] }
  }
}
```

Guardar ID retornado como `PROJECT_PAGE_ID`.

- [ ] **Step 4: Criar sub-pages para cada arquivo .md de plans/**

Para cada arquivo, ler o conteúdo local e criar uma Notion page com parent `PROJECT_PAGE_ID`:

| Arquivo | Título da page |
|---------|----------------|
| `plans/README.md` | `Plans — README` |
| `plans/001-editor-ui-redesign.md` | `001 — Editor UI Redesign` |
| `plans/002-dracula-syntax-highlight.md` | `002 — Dracula Syntax Highlight` |
| `plans/003-drag-drop-file.md` | `003 — Drag and Drop File` |
| `plans/004-shareable-url.md` | `004 — Shareable URL` |

Para cada uma usar `notion-create-pages` com o conteúdo do `.md` convertido em blocos de texto.

- [ ] **Step 5: Criar sub-page para o spec**

Criar page `Spec — humanize-repo (2026-06-15)` com parent `PROJECT_PAGE_ID`.
Conteúdo: conteúdo do `2026-06-15-humanize-repo-design.md` em blocos Notion.

- [ ] **Step 6: Criar sub-page para launch.json**

Criar page `.claude — launch.json` com parent `PROJECT_PAGE_ID`.
Incluir o conteúdo do JSON num bloco `code` com linguagem `json`.

- [ ] **Step 7: Obter o link da page do projeto**

Usar `notion-fetch` no `PROJECT_PAGE_ID` para obter a URL pública.
Guardar como `NOTION_LINK` para o resumo final.

- [ ] **Step 8: Exibir resumo final**

```
✓ 7 arquivos arquivados em ~/Documents/ai-docs/myXmlFormatter/
✓ .gitignore atualizado com padrões AI
✓ git: plans/, .claude/, docs/ removidos do tracking e pushed
✓ Google Drive: AI Docs/myXmlFormatter/ — <DRIVE_LINK>
✓ Notion: AI Docs / myXmlFormatter — <NOTION_LINK>
```

---

## Parte B — Criar a skill `/humanize-repo`

### Task 5: Criar skill reutilizável

- [ ] **Step 1: Invocar skill-creator**

Usar o `Skill` tool com a skill `skill-creator` passando o seguinte como argumento:

```
Nome da skill: humanize-repo
Trigger: quando o usuário pedir para "humanizar o repo", "remover arquivos AI do git",
         "limpar referências AI", ou invocar /humanize-repo explicitamente.

A skill deve executar em sequência:

FASE 1 — DETECTAR
Identificar no repositório atual os seguintes padrões se rastreados pelo git:
  git ls-files | grep -E "^(plans/|advisor-plans/|\.claude/|CLAUDE\.md|docs/superpowers/)"
Guardar a lista como ARQUIVOS_AI.
Se lista vazia, informar "Nenhum arquivo AI encontrado no git tracking" e parar.

FASE 2 — ARQUIVAR LOCALMENTE
- Obter nome do repo: basename $(git rev-parse --show-toplevel)
- Destino: ~/Documents/ai-docs/<repo>/
- Para cada arquivo em ARQUIVOS_AI:
  - Criar diretório de destino preservando estrutura (mkdir -p)
  - Copiar se destino não existir (cp -n)

FASE 3 — LIMPAR GIT
- Adicionar ao .gitignore (sem duplicar):
    # AI reference docs
    plans/
    advisor-plans/
    .claude/
    CLAUDE.md
    docs/superpowers/
- git rm -r --cached <ARQUIVOS_AI>
- git add .gitignore
- git commit -m "chore: remove AI reference docs from git tracking"
- git push

FASE 4 — GOOGLE DRIVE
- Usar MCP Google Drive
- Buscar ou criar pasta "AI Docs" na raiz
- Criar subpasta <repo> dentro de "AI Docs"
- Para cada arquivo arquivado localmente:
  - Recriar estrutura de subpastas no Drive
  - Fazer upload do arquivo
- Guardar webViewLink da pasta do projeto

FASE 5 — NOTION
- Usar MCP Notion
- Buscar ou criar database "AI Docs" no workspace
- Buscar ou criar page <repo> no database
- Para cada .md arquivado:
  - Criar sub-page com título legível
  - Converter conteúdo markdown em blocos Notion
- Para cada não-.md arquivado:
  - Criar sub-page com conteúdo em bloco de código
- Guardar URL da page do projeto

FASE 6 — RESUMO
Exibir:
  ✓ N arquivos arquivados em ~/Documents/ai-docs/<repo>/
  ✓ .gitignore atualizado
  ✓ git: arquivos removidos do tracking + pushed
  ✓ Google Drive: AI Docs/<repo>/ — <link>
  ✓ Notion: AI Docs / <repo> — <link>

IDEMPOTÊNCIA: em cada fase, verificar estado antes de agir. Nunca duplicar.
```

- [ ] **Step 2: Revisar a skill gerada**

Ler o arquivo da skill criada. Verificar que cobre todas as 6 fases e que a idempotência está descrita em cada uma.

- [ ] **Step 3: Testar invocando no myXmlFormatter**

Com os arquivos já removidos do git (Task 2), invocar `/humanize-repo` novamente.
Esperado: skill detecta que não há arquivos AI rastreados e exibe "Nenhum arquivo AI encontrado no git tracking" — confirmando idempotência.
