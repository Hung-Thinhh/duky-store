import React from "react";
import fs from "fs";
import path from "path";

export function parseMarkdown(markdown: string): React.JSX.Element[] {
  const lines = markdown.split(/\r?\n/);
  const elements: React.JSX.Element[] = [];
  let currentList: string[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="policy-list">
          {currentList.map((item, idx) => (
            <li key={idx} className="policy-list-item">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = (key: number) => {
    if (inTable) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="policy-table-wrapper">
          <table className="policy-table">
            {tableHeaders.length > 0 && (
              <thead>
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th key={idx}>
                      {renderInline(header)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }
  };

  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let temp = text;

    // Match bold, italic, and links
    const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    const tokens = temp.split(regex);

    return tokens.map((token, idx) => {
      if (token.startsWith("***") && token.endsWith("***")) {
        return <strong key={idx}><em>{token.slice(3, -3)}</em></strong>;
      }
      if (token.startsWith("**") && token.endsWith("**")) {
        return <strong key={idx}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith("*") && token.endsWith("*")) {
        return <em key={idx}>{token.slice(1, -1)}</em>;
      }
      if (token.startsWith("[") && token.includes("](")) {
        const match = token.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={idx} href={match[2]} className="policy-link">
              {match[1]}
            </a>
          );
        }
      }
      return token;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for list item
    if (line.startsWith("* ") || line.startsWith("- ")) {
      flushTable(i);
      currentList.push(line.slice(2));
      continue;
    } else {
      flushList(i);
    }

    // Check for table line
    if (line.startsWith("|")) {
      inTable = true;
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      const isSeparator = cells.every(c => c.startsWith("-"));
      if (isSeparator) {
        continue;
      }
      
      if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        
        if (level === 1) {
          elements.push(
            <h1 key={i} className="policy-title">
              {renderInline(text)}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={i} className="policy-section-title">
              {renderInline(text)}
            </h2>
          );
        } else {
          elements.push(
            <h3 key={i} className="policy-subsection-title">
              {renderInline(text)}
            </h3>
          );
        }
        continue;
      }
    }

    // Standard paragraph
    elements.push(
      <p key={i} className="policy-section-content">
        {renderInline(line)}
      </p>
    );
  }

  flushList(lines.length);
  flushTable(lines.length);

  return elements;
}

export function getPolicyContent(filename: string): React.JSX.Element[] {
  const filePath = path.join(process.cwd(), "docs", "policies", filename);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return parseMarkdown(content);
  } catch (error) {
    console.error(`Error reading policy file: ${filename}`, error);
    return [<p key="error">Không tìm thấy nội dung chính sách.</p>];
  }
}

export function getMergedPoliciesContent(filenames: string[]): React.JSX.Element[] {
  const allElements: React.JSX.Element[] = [];
  
  filenames.forEach((filename, fileIdx) => {
    const filePath = path.join(process.cwd(), "docs", "policies", filename);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseMarkdown(content);
      
      if (fileIdx > 0) {
        allElements.push(
          <hr key={`divider-${fileIdx}`} className="my-10 border-t border-gray-200" style={{ margin: "40px 0" }} />
        );
      }
      
      parsed.forEach((el, elIdx) => {
        allElements.push(React.cloneElement(el, { key: `file-${fileIdx}-el-${elIdx}` }));
      });
    } catch (error) {
      console.error(`Error reading policy file: ${filename}`, error);
    }
  });

  if (allElements.length === 0) {
    return [<p key="error">Không tìm thấy nội dung quy định.</p>];
  }
  
  return allElements;
}
