# Spec: humanize-repo

**Date**: 2026-06-15  
**Status**: Approved  
**Scope**: Skill + writing-plans for myXmlFormatter

---

## Problem

Projetos gerados com auxílio da IA acumulam arquivos de referência no repositório
(`plans/`, `.claude/`, `CLAUDE.md`, `docs/superpowers/`) que expõem o processo
de desenvolvimento assistido. O objetivo é manter o repositório GitHub totalmente
humanizado, preservando os documentos localmente e no Notion + Google Drive.

---

## Solução

Skill `/humanize-repo` executável em qualquer projeto. Detecta, move, limpa e
faz upload dos arquivos AI em uma única execução idempotente.

---

## Arquivos-alvo

A skill identifica os seguintes padrões no repositório atual:

| Padrão | Descrição |
|--------|-----------|
| `plans/` | Planos gerados pelo `/improve` |
| `advisor-plans/` | Variante de plans/ em alguns repos |
| `.claude/` | Config do Claude Code (launch.json, settings) |
| `CLAUDE.md` | Instruções do projeto para a IA na raiz |
| `docs/superpowers/` | Specs do `/brainstorming` |

---

## Fases de execução

### Fase 1 — Mover localmente

- Destino: `~/Documents/ai-docs/<nome-do-repo>/`
- Preserva estrutura interna de pastas
- Se o destino já existir, faz merge sem sobrescrever arquivos existentes
- Registra lista de arquivos movidos para o resumo final

### Fase 2 — Limpar git

Adiciona ao `.gitignore` do projeto (sem duplicar se já existir):

```
# AI reference docs
plans/
advisor-plans/
.claude/
CLAUDE.md
docs/superpowers/
```

Executa:
```bash
git rm -r --cached <arquivos-encontrados>
git add .gitignore
git commit -m "chore: remove AI reference docs from tracking"
git push
```

### Fase 3 — Upload Google Drive

- Usa MCP do Google Drive (já configurado)
- Cria pasta `AI Docs/<nome-do-repo>/` se não existir
- Faz upload de todos os arquivos movidos mantendo a estrutura de subpastas
- Arquivos enviados como estão (sem conversão de formato)

### Fase 4 — Upload Notion

- Usa MCP do Notion (já configurado)
- Verifica se existe database "AI Docs" no workspace; se não, cria
- Cria page `<nome-do-repo>` dentro do database (se não existir)
- Para cada arquivo `.md` movido:
  - Cria sub-page com o nome do arquivo (sem extensão, com título legível)
  - Converte conteúdo Markdown para blocos Notion nativos
- Arquivos não-markdown (ex: `.json`) são anexados como arquivos na page do projeto

### Fase 5 — Resumo

Exibe ao final:
```
✓ X arquivos movidos para ~/Documents/ai-docs/<projeto>/
✓ .gitignore atualizado
✓ git: arquivos removidos do tracking + pushed
✓ Google Drive: AI Docs/<projeto>/ — <link>
✓ Notion: AI Docs / <projeto> — <link>
```

---

## Idempotência

Antes de cada fase a skill verifica o estado atual:
- **Fase 1**: pula arquivos já ausentes do repo (já movidos)
- **Fase 2**: não duplica entradas no `.gitignore`; pula `git rm --cached` se arquivo já não está rastreado
- **Fase 3**: verifica se pasta e arquivos já existem no Drive antes de criar/enviar
- **Fase 4**: verifica se database, page e sub-pages já existem no Notion antes de criar

---

## Estrutura no Google Drive

```
AI Docs/
└── myXmlFormatter/
    ├── plans/
    │   ├── 001-editor-ui-redesign.md
    │   ├── 002-dracula-syntax-highlight.md
    │   ├── 003-drag-drop-file.md
    │   ├── 004-shareable-url.md
    │   └── README.md
    └── .claude/
        └── launch.json
```

---

## Estrutura no Notion

```
AI Docs (database)
└── myXmlFormatter (page)
    ├── plans/
    │   ├── 001 — Editor UI Redesign
    │   ├── 002 — Dracula Syntax Highlight
    │   ├── 003 — Drag and Drop File
    │   ├── 004 — Shareable URL
    │   └── README
    └── .claude/
        └── launch (anexo JSON)
```

---

## Aplicação imediata — myXmlFormatter

Arquivos a remover do git neste projeto:

- `plans/001-editor-ui-redesign.md`
- `plans/002-dracula-syntax-highlight.md`
- `plans/003-drag-drop-file.md`
- `plans/004-shareable-url.md`
- `plans/README.md`
- `.claude/launch.json`

Não há `CLAUDE.md` dentro deste repo (está no diretório pai `nerdzilla/front/`).

---

## Entregáveis

1. **Writing plan** para aplicar ao `myXmlFormatter` agora
2. **Skill `/humanize-repo`** reutilizável em qualquer projeto futuro
