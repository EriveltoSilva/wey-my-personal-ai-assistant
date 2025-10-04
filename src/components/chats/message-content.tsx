import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

// Componente principal para renderização de conteúdo com markdown
// Suporta formatação HTML <br/> tags que são convertidas em quebras de linha adequadas
// Exemplo de entrada: "Line 1<br/>Line 2<br/><br/>Line 4"
// Saída: Lines renderizadas com quebras de linha adequadas
export const MessageContent = ({ content }: { content: string }) => {
  if (!content) return null;

  // Pre-process content to handle HTML br tags
  const preprocessContent = (text: string) => {
    // Convert <br/>, <br>, and <br /> to newlines
    return text.replace(/<br\s*\/?>/gi, "\n");
  };

  const parseMarkdown = (text: string) => {
    const elements: React.ReactElement[] = [];
    const lines = preprocessContent(text).split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;

        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }

        elements.push(<CodeBlock key={i} language={language} code={codeLines.join("\n")} />);
        i++; // Skip closing ```
        continue;
      }

      // Headers
      if (line.startsWith("#")) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, "");
        elements.push(<Header key={i} level={level} text={text} />);
        i++;
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(<hr key={i} className="my-4 border-border" />);
        i++;
        continue;
      }

      // Block quotes
      if (line.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && (lines[i].startsWith("> ") || lines[i].trim() === "")) {
          if (lines[i].startsWith("> ")) {
            quoteLines.push(lines[i].slice(2));
          } else if (lines[i].trim() === "") {
            quoteLines.push("");
          }
          i++;
        }
        elements.push(
          <blockquote key={i} className="border-l-4 border-border pl-4 my-4 italic text-muted-foreground">
            {parseInlineFormatting(quoteLines.join("\n"))}
          </blockquote>
        );
        continue;
      }

      // Unordered lists
      if (line.match(/^\s*[-*+]\s/)) {
        const listItems = [];

        while (i < lines.length && lines[i].match(/^\s*[-*+]\s/)) {
          const indent = lines[i].match(/^\s*/)?.[0].length || 0;
          const text = lines[i].replace(/^\s*[-*+]\s/, "");
          listItems.push({ text, indent });
          i++;
        }

        elements.push(<UnorderedList key={i} items={listItems} />);
        continue;
      }

      // Ordered lists
      if (line.match(/^\s*\d+\.\s/)) {
        const listItems = [];

        while (i < lines.length && lines[i].match(/^\s*\d+\.\s/)) {
          const indent = lines[i].match(/^\s*/)?.[0].length || 0;
          const text = lines[i].replace(/^\s*\d+\.\s/, "");
          listItems.push({ text, indent });
          i++;
        }

        elements.push(<OrderedList key={i} items={listItems} />);
        continue;
      }

      // Tables
      if (line.includes("|") && lines[i + 1]?.includes("|") && lines[i + 1]?.includes("-")) {
        const tableRows = [];

        // Header row
        const headerCells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        tableRows.push(headerCells);

        i++; // Skip separator row
        i++; // Move to first data row

        // Data rows
        while (i < lines.length && lines[i].includes("|")) {
          const cells = lines[i]
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell);
          if (cells.length > 0) {
            tableRows.push(cells);
          }
          i++;
        }

        elements.push(<Table key={i} rows={tableRows} />);
        continue;
      }

      // Regular paragraphs
      if (line.trim()) {
        const paragraphLines = [line];
        i++;

        // Collect continuous non-empty lines
        while (
          i < lines.length &&
          lines[i].trim() &&
          !lines[i].startsWith("#") &&
          !lines[i].startsWith("```") &&
          !lines[i].startsWith("- ") &&
          !lines[i].startsWith("* ") &&
          !lines[i].startsWith("+ ") &&
          !lines[i].match(/^\d+\.\s/) &&
          !lines[i].startsWith("> ") &&
          !lines[i].includes("|")
        ) {
          paragraphLines.push(lines[i]);
          i++;
        }

        elements.push(
          <p key={i} className="mb-4 leading-relaxed">
            {parseInlineFormatting(paragraphLines.join(" "))}
          </p>
        );
        continue;
      }

      i++; // Skip empty lines
    }

    return elements;
  };

  return <div className="prose-sm max-w-none">{parseMarkdown(content)}</div>;
};

// Função para processar formatação inline
const parseInlineFormatting = (text: string): React.ReactElement[] => {
  const elements: React.ReactElement[] = [];

  // Pre-process text to handle HTML br tags within inline content
  const preprocessedText = text.replace(/<br\s*\/?>/gi, "\n");

  // Split by newlines and create separate elements for each line
  const lines = preprocessedText.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Add line break element
      elements.push(<br key={`br-${lineIndex}`} />);
    }

    // Process formatting for this line
    const lineElements = processLineFormatting(line, lineIndex);
    elements.push(...lineElements);
  });

  return elements.length > 0 ? elements : [<span key="default">{preprocessedText}</span>];
};

// Helper function to process formatting for a single line
const processLineFormatting = (text: string, lineIndex: number): React.ReactElement[] => {
  const elements: React.ReactElement[] = [];

  // Regex patterns para diferentes tipos de formatação
  const patterns = [
    {
      regex: /\*\*(.*?)\*\*/g,
      component: (text: string, key: number) => (
        <strong key={key} className="font-semibold">
          {text}
        </strong>
      ),
    },
    {
      regex: /\*(.*?)\*/g,
      component: (text: string, key: number) => (
        <em key={key} className="italic">
          {text}
        </em>
      ),
    },
    {
      regex: /~~(.*?)~~/g,
      component: (text: string, key: number) => (
        <del key={key} className="line-through">
          {text}
        </del>
      ),
    },
    {
      regex: /`([^`]+)`/g,
      component: (text: string, key: number) => (
        <code key={key} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {text}
        </code>
      ),
    },
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      component: (text: string, key: number, url: string) => (
        <a key={key} href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
  ];

  // Encontrar todas as ocorrências de formatação
  const matches: Array<{ start: number; end: number; element: React.ReactElement }> = [];

  patterns.forEach((pattern) => {
    let match;
    pattern.regex.lastIndex = 0; // Reset regex

    while ((match = pattern.regex.exec(text)) !== null) {
      let element;
      if (pattern.regex.source.includes("\\[")) {
        // Link pattern
        element = pattern.component(match[1], matches.length + lineIndex * 1000, match[2]);
      } else {
        element = pattern.component(match[1], matches.length + lineIndex * 1000, "");
      }

      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        element,
      });
    }
  });

  // Ordenar matches por posição
  matches.sort((a, b) => a.start - b.start);

  // Construir elementos finais
  let lastEnd = 0;
  matches.forEach((match, index) => {
    // Adicionar texto antes da formatação
    if (match.start > lastEnd) {
      const plainText = text.slice(lastEnd, match.start);
      if (plainText) {
        elements.push(<span key={`text-${lineIndex}-${index}`}>{plainText}</span>);
      }
    }

    // Adicionar elemento formatado
    elements.push(match.element);
    lastEnd = match.end;
  });

  // Adicionar texto restante
  if (lastEnd < text.length) {
    const remainingText = text.slice(lastEnd);
    if (remainingText) {
      elements.push(<span key={`remaining-${lineIndex}`}>{remainingText}</span>);
    }
  }

  return elements.length > 0 ? elements : [<span key={`default-${lineIndex}`}>{text}</span>];
};

// Componentes auxiliares
const Header = ({ level, text }: { level: number; text: string }) => {
  const className =
    {
      1: "text-2xl font-bold mb-4 mt-6",
      2: "text-xl font-bold mb-3 mt-5",
      3: "text-lg font-bold mb-2 mt-4",
      4: "text-base font-bold mb-2 mt-3",
      5: "text-sm font-bold mb-1 mt-2",
      6: "text-sm font-bold mb-1 mt-2",
    }[level] || "text-base font-bold mb-2 mt-3";

  const content = parseInlineFormatting(text);

  switch (level) {
    case 1:
      return <h1 className={className}>{content}</h1>;
    case 2:
      return <h2 className={className}>{content}</h2>;
    case 3:
      return <h3 className={className}>{content}</h3>;
    case 4:
      return <h4 className={className}>{content}</h4>;
    case 5:
      return <h5 className={className}>{content}</h5>;
    case 6:
      return <h6 className={className}>{content}</h6>;
    default:
      return <h3 className={className}>{content}</h3>;
  }
};

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-sm">
        <span className="text-gray-300">{language || "code"}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

const UnorderedList = ({ items }: { items: Array<{ text: string; indent: number }> }) => {
  return (
    <ul className="list-disc ml-6 mb-4 space-y-1">
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed" style={{ marginLeft: `${item.indent * 1.5}rem` }}>
          {parseInlineFormatting(item.text)}
        </li>
      ))}
    </ul>
  );
};

const OrderedList = ({ items }: { items: Array<{ text: string; indent: number }> }) => {
  return (
    <ol className="list-decimal ml-6 mb-4 space-y-1">
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed" style={{ marginLeft: `${item.indent * 1.5}rem` }}>
          {parseInlineFormatting(item.text)}
        </li>
      ))}
    </ol>
  );
};

const Table = ({ rows }: { rows: string[][] }) => {
  if (rows.length === 0) return null;

  const [header, ...dataRows] = rows;

  return (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border border-border rounded-lg">
        <thead className="bg-muted">
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="px-4 py-2 text-left font-semibold border-b border-border">
                {parseInlineFormatting(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 border-b border-border">
                  {parseInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
