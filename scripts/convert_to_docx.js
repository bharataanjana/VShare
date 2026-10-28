const fs = require('fs');
const { marked } = require('marked');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} = docx;

const mdContent = fs.readFileSync('doc.md', 'utf8');
const tokens = marked.lexer(mdContent);

const BRAND_RED = 'DC2626';
const SLATE_DARK = '1E293B';
const TEXT_COLOR = '1F2937';
const BG_LIGHT = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';

function parseInlineTokens(inlineTokens) {
  if (!inlineTokens || inlineTokens.length === 0) return [new TextRun('')];

  const runs = [];
  for (const tok of inlineTokens) {
    if (tok.type === 'text') {
      runs.push(new TextRun({ text: tok.text, color: TEXT_COLOR, size: 22 }));
    } else if (tok.type === 'strong') {
      runs.push(new TextRun({ text: tok.text, bold: true, color: SLATE_DARK, size: 22 }));
    } else if (tok.type === 'em') {
      runs.push(new TextRun({ text: tok.text, italics: true, color: TEXT_COLOR, size: 22 }));
    } else if (tok.type === 'codespan') {
      runs.push(new TextRun({
        text: ' ' + tok.text + ' ',
        font: 'Consolas',
        size: 20,
        color: BRAND_RED,
        shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' }
      }));
    } else if (tok.type === 'link') {
      runs.push(new TextRun({ text: tok.text || tok.href, color: BRAND_RED, underline: {} }));
    } else {
      runs.push(new TextRun({ text: tok.raw || tok.text || '', color: TEXT_COLOR, size: 22 }));
    }
  }
  return runs;
}

const docElements = [];

for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];

  if (token.type === 'heading') {
    if (token.depth === 1) {
      docElements.push(
        new Paragraph({
          text: token.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 150 },
          run: { color: BRAND_RED, bold: true, size: 32 }
        })
      );
    } else if (token.depth === 2) {
      docElements.push(
        new Paragraph({
          text: token.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
          run: { color: SLATE_DARK, bold: true, size: 26 }
        })
      );
    } else if (token.depth === 3) {
      docElements.push(
        new Paragraph({
          text: token.text,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 80 },
          run: { color: BRAND_RED, bold: true, size: 24 }
        })
      );
    } else {
      docElements.push(
        new Paragraph({
          text: token.text,
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 60 },
          run: { color: SLATE_DARK, bold: true, size: 22 }
        })
      );
    }
  } else if (token.type === 'paragraph') {
    const runs = parseInlineTokens(token.tokens);
    docElements.push(
      new Paragraph({
        children: runs,
        spacing: { before: 60, after: 120 },
        alignment: AlignmentType.LEFT
      })
    );
  } else if (token.type === 'list') {
    for (const item of token.items) {
      const runs = parseInlineTokens(item.tokens?.[0]?.tokens || [{ type: 'text', text: item.text }]);
      docElements.push(
        new Paragraph({
          children: [new TextRun({ text: '•  ', bold: true, color: BRAND_RED }), ...runs],
          indent: { left: 400 },
          spacing: { before: 40, after: 40 }
        })
      );
    }
  } else if (token.type === 'table') {
    const tableRows = [];

    // Header Row
    const headerCells = token.header.map((h) => {
      const runs = parseInlineTokens(h.tokens);
      return new TableCell({
        children: [new Paragraph({ children: runs.map(r => new TextRun({ ...r, bold: true, color: 'FFFFFF' })) })],
        shading: { type: ShadingType.CLEAR, fill: SLATE_DARK },
        margins: { top: 120, bottom: 120, left: 150, right: 150 }
      });
    });
    tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

    // Data Rows
    for (let rIdx = 0; rIdx < token.rows.length; rIdx++) {
      const row = token.rows[rIdx];
      const isEven = rIdx % 2 === 0;
      const dataCells = row.map((c) => {
        const runs = parseInlineTokens(c.tokens);
        return new TableCell({
          children: [new Paragraph({ children: runs })],
          shading: isEven ? { type: ShadingType.CLEAR, fill: 'FFFFFF' } : { type: ShadingType.CLEAR, fill: BG_LIGHT },
          margins: { top: 100, bottom: 100, left: 150, right: 150 }
        });
      });
      tableRows.push(new TableRow({ children: dataCells }));
    }

    docElements.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR },
          insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR }
        }
      })
    );
    docElements.push(new Paragraph({ spacing: { after: 150 } }));
  } else if (token.type === 'code') {
    const codeLines = token.text.split('\n');
    const paras = codeLines.map((line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            font: 'Consolas',
            size: 18,
            color: '0F172A'
          })
        ],
        spacing: { before: 20, after: 20 }
      })
    );

    docElements.push(
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: paras,
                shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR },
                  left: { style: BorderStyle.SINGLE, size: 8, color: BRAND_RED },
                  right: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR }
                },
                margins: { top: 150, bottom: 150, left: 200, right: 200 }
              })
            ]
          })
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );
    docElements.push(new Paragraph({ spacing: { after: 150 } }));
  } else if (token.type === 'hr') {
    docElements.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_RED } },
        spacing: { before: 150, after: 200 }
      })
    );
  }
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 22,
          color: TEXT_COLOR
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              text: 'VSHARE — Technical Documentation & Architecture Report',
              alignment: AlignmentType.RIGHT,
              style: 'Header',
              run: { color: '94A3B8', size: 18, italics: true }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', color: '94A3B8', size: 18 }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  color: BRAND_RED,
                  bold: true,
                  size: 18
                }),
                new TextRun({ text: ' | Lead Systems Engineer: Bharat Anjana', color: '94A3B8', size: 18 })
              ]
            })
          ]
        })
      },
      children: docElements
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('doc.docx', buffer);
  console.log('🎉 Successfully created doc.docx from doc.md (' + buffer.length + ' bytes)!');
});
