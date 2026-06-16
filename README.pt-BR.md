&lt;!-- LANGUAGE-SELECTOR:START -->
🌐 [English](README.md) · [Português](README.pt-BR.md)
&lt;!-- LANGUAGE-SELECTOR:END -->

<div align="center">

<img src="public/android-chrome-512x512.png" alt="Logo do myXmlFormatter" width="96" height="96" />

# myXmlFormatter

**Um formatador de XML minimalista e em tela cheia, construído com React 19 e TypeScript.**

[![Demo ao Vivo](https://img.shields.io/badge/Demo%20ao%20Vivo-geldopc.github.io-black?style=flat-square)](https://geldopc.github.io/myXmlFormatter/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-black?style=flat-square)](LICENSE)

</div>

---

## O que é

A maioria dos formatadores de XML vive em uma barra lateral. Este ocupa a tela inteira — edite, formate e inspecione XML da forma como um desenvolvedor realmente trabalha: foco total, sem distrações.

Cole o XML bruto, pressione `⌘ Enter` para formatar ou minificar no lugar, e compartilhe o resultado via URL comprimida — sem necessidade de servidor.

**[→ Experimente ao vivo](https://geldopc.github.io/myXmlFormatter/)**

---

## Funcionalidades

| Funcionalidade | Detalhes |
|----------------|---------|
| **Formatação in-place** | Prettify e minify substituem a entrada diretamente — sem painéis divididos |
| **Syntax highlighting Dracula** | Tokenizador próprio colore tags, atributos, valores, comentários, PIs, CDATA e DOCTYPE separadamente em modo claro e escuro |
| **URLs compartilháveis** | O XML é comprimido com gzip via a API nativa `CompressionStream` e codificado em base64 na URL — zero dependências |
| **Drag-and-drop** | Arraste qualquer arquivo `.xml` para carregá-lo instantaneamente |
| **Numeração de linhas** | Painel lateral sincronizado com o textarea e com o `<pre>` somente leitura |
| **Sanitização de XML** | Pré-processamento remove pseudo-comentários malformados (`<-- ... -->`) comuns em documentos NF-e brasileiros |
| **Modo claro e escuro** | Toggle de tema na barra de ferramentas flutuante, persistido no `localStorage` |
| **Atalhos de teclado** | `⌘ Enter` para formatar, `Esc` para voltar ao modo de edição |

---

## Decisões técnicas que valem a pena destacar

**Sem biblioteca de syntax highlighting.** `src/utils/xmlHighlight.ts` é um tokenizador left-to-right feito à mão (~120 linhas) que trata comentários, CDATA, DOCTYPE, processing instructions e atributos aninhados. Mantém o bundle pequeno e evita uma dependência de 200 KB para uma tarefa tão específica.

**Sem biblioteca de estado na URL.** As URLs compartilháveis usam a API nativa `CompressionStream("gzip")` e `btoa` do browser — disponível em todos os browsers modernos desde Chrome 80, Firefox 113 e Safari 16.4. O XML comprimido reduz normalmente 70–80% antes da codificação.

**Sem backend.** Tudo roda no browser. O deploy é um artefato estático via GitHub Actions → GitHub Pages.

**Atomic design com shadcn/ui.** Os componentes seguem a hierarquia átomos → moléculas → organismos (`elements/`, `widgets/`, `modules/`). Os primitivos do shadcn/ui são usados apenas para Button e Tooltip.

---

## Stack tecnológica

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Framework | React 19 | Recursos concorrentes + API aprimorada de Server Components |
| Linguagem | TypeScript 5.8 | Strict mode em todo o projeto |
| Build | Vite 6 | HMR sub-segundo, ESM nativo |
| Estilização | Tailwind CSS v4 | Configuração CSS-first, sem PostCSS |
| Ícones | Phosphor Icons | Variações de peso consistentes |
| Linting | Biome 2 | Ferramenta única para lint + format |
| Deploy | GitHub Actions + Pages | CI/CD sem configuração adicional |

---

## Como rodar localmente

```bash
git clone https://github.com/geldopc/myXmlFormatter.git
cd myXmlFormatter
npm install
npm run dev          # http://localhost:5299
```

**Outros comandos:**

```bash
npm run build        # Verificação TypeScript + build Vite
npm run lint         # Biome lint
npm run format       # Biome format
```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── elements/    # átomos — Button, etc.
│   ├── widgets/     # moléculas — ThemeToggle
│   └── modules/     # organismos — Navbar (não utilizado após redesign)
├── pages/
│   └── Home/        # app single-page, toda a lógica do editor
├── providers/
│   └── Theme/       # contexto de tema claro/escuro
├── utils/
│   ├── xml.ts           # formatXml, minifyXml, sanitizeXml
│   ├── xmlHighlight.ts  # tokenizador XML próprio para coloração de sintaxe
│   └── encoding.ts      # gzip + base64 para URLs compartilháveis
└── routes/
    └── index.tsx    # react-router-dom v7 com basename para GitHub Pages
```

---

## Licença

MIT — veja [LICENSE](LICENSE).
