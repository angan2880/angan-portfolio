// Map Notion color names to CSS values
// Background colors are more saturated to contrast with the warm site background (#eee8de)
const NOTION_COLORS = {
  gray: { color: '#787774' },
  brown: { color: '#9f6b53' },
  orange: { color: '#d9730d' },
  yellow: { color: '#cb9a00' },
  green: { color: '#268763' },
  blue: { color: '#2383a8' },
  purple: { color: '#7b5bad' },
  pink: { color: '#c14c8a' },
  red: { color: '#d44c47' },
  gray_background: { background: '#e0deda' },
  brown_background: { background: '#e8d5c8' },
  orange_background: { background: '#f8d4b0' },
  yellow_background: { background: '#f5e5a3' },
  green_background: { background: '#c8e4c8' },
  blue_background: { background: '#c5dce8' },
  purple_background: { background: '#dcd0e8' },
  pink_background: { background: '#ecc9da' },
  red_background: { background: '#f5ccc9' },
};

// Notion select/multi-select tag colors → CSS
const SELECT_COLORS = {
  default: { bg: '#e3e2e0', text: '#37352f' },
  gray: { bg: '#e3e2e0', text: '#37352f' },
  brown: { bg: '#eee0da', text: '#442f21' },
  orange: { bg: '#fadec9', text: '#73491c' },
  yellow: { bg: '#fdecc8', text: '#7c5b0a' },
  green: { bg: '#dbeddb', text: '#1e5a2f' },
  blue: { bg: '#d3e5ef', text: '#183b56' },
  purple: { bg: '#e8deee', text: '#412d5e' },
  pink: { bg: '#f5e0e9', text: '#69223c' },
  red: { bg: '#ffe2dd', text: '#6e2b20' },
};

function renderSelectTag(name, color) {
  const c = SELECT_COLORS[color] || SELECT_COLORS.default;
  return `<span class="notion-select-tag" style="background:${c.bg};color:${c.text}">${name}</span>`;
}

function renderCellValue(val) {
  if (!val) return '';
  if (typeof val === 'object' && val._type === 'select') {
    return renderSelectTag(val.name, val.color);
  }
  if (typeof val === 'object' && val._type === 'multi_select') {
    return val.items.map(s => renderSelectTag(s.name, s.color)).join(' ');
  }
  return String(val);
}

function renderRichText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';

  return richTextArray.map(text => {
    let content = text.plain_text;

    // Escape HTML entities
    content = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply annotations
    if (text.annotations) {
      if (text.annotations.code) content = `<code>${content}</code>`;
      if (text.annotations.bold) content = `<strong>${content}</strong>`;
      if (text.annotations.italic) content = `<em>${content}</em>`;
      if (text.annotations.strikethrough) content = `<s>${content}</s>`;
      if (text.annotations.underline) content = `<u>${content}</u>`;

      // Apply Notion colors
      const color = text.annotations.color;
      if (color && color !== 'default') {
        const colorStyle = NOTION_COLORS[color];
        if (colorStyle) {
          const styles = [];
          if (colorStyle.color) styles.push(`color:${colorStyle.color}`);
          if (colorStyle.background) {
            styles.push(`background-color:${colorStyle.background};padding:2px 4px;border-radius:3px`);
            if (colorStyle.textColor) styles.push(`color:${colorStyle.textColor}`);
          }
          content = `<span style="${styles.join(';')}">${content}</span>`;
        }
      }
    }

    // Apply links
    if (text.href) {
      content = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${content}</a>`;
    }

    return content;
  }).join('');
}

function renderBlocks(blocks) {
  const html = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // Group consecutive list items
    if (block.type === 'bulleted_list_item') {
      html.push('<ul>');
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        const itemText = renderRichText(blocks[i].bulleted_list_item.rich_text);
        html.push(`<li>${itemText}</li>`);
        i++;
      }
      html.push('</ul>');
      continue;
    }

    if (block.type === 'numbered_list_item') {
      html.push('<ol>');
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        const itemText = renderRichText(blocks[i].numbered_list_item.rich_text);
        html.push(`<li>${itemText}</li>`);
        i++;
      }
      html.push('</ol>');
      continue;
    }

    switch (block.type) {
      case 'paragraph':
        const pText = renderRichText(block.paragraph.rich_text);
        if (pText) html.push(`<p>${pText}</p>`);
        break;

      case 'heading_1': {
        const h1Color = block.heading_1.color;
        const h1Style = h1Color && h1Color !== 'default' && NOTION_COLORS[h1Color] ? ` style="${NOTION_COLORS[h1Color].color ? `color:${NOTION_COLORS[h1Color].color}` : ''}${NOTION_COLORS[h1Color].background ? `background-color:${NOTION_COLORS[h1Color].background};padding:4px 8px;border-radius:4px` : ''}"` : '';
        html.push(`<h1${h1Style}>${renderRichText(block.heading_1.rich_text)}</h1>`);
        break;
      }

      case 'heading_2': {
        const h2Color = block.heading_2.color;
        const h2Style = h2Color && h2Color !== 'default' && NOTION_COLORS[h2Color] ? ` style="${NOTION_COLORS[h2Color].color ? `color:${NOTION_COLORS[h2Color].color}` : ''}${NOTION_COLORS[h2Color].background ? `background-color:${NOTION_COLORS[h2Color].background};padding:4px 8px;border-radius:4px` : ''}"` : '';
        html.push(`<h2${h2Style}>${renderRichText(block.heading_2.rich_text)}</h2>`);
        break;
      }

      case 'heading_3': {
        const h3Color = block.heading_3.color;
        const h3Style = h3Color && h3Color !== 'default' && NOTION_COLORS[h3Color] ? ` style="${NOTION_COLORS[h3Color].color ? `color:${NOTION_COLORS[h3Color].color}` : ''}${NOTION_COLORS[h3Color].background ? `background-color:${NOTION_COLORS[h3Color].background};padding:4px 8px;border-radius:4px` : ''}"` : '';
        html.push(`<h3${h3Style}>${renderRichText(block.heading_3.rich_text)}</h3>`);
        break;
      }

      case 'quote':
        html.push(`<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`);
        break;

      case 'code': {
        const lang = block.code.language || '';
        const codeText = block.code.rich_text.map(t =>
          t.plain_text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        ).join('');
        const codeCaption = block.code.caption ? renderRichText(block.code.caption) : '';
        const langLabel = lang && lang !== 'plain text' ? `<div class="code-lang">${lang}</div>` : '';
        html.push(`<div class="code-block">${langLabel}<pre><code class="language-${lang}">${codeText}</code></pre>${codeCaption ? `<div class="code-caption">${codeCaption}</div>` : ''}</div>`);
        break;
      }

      case 'child_database': {
        const db = block.database;
        if (db && db.columns.length > 0 && db.rows.length > 0) {
          html.push('<div class="notion-table-wrap">');
          if (db.title) html.push(`<div class="notion-table-title">${db.title}</div>`);
          html.push('<table class="notion-table"><thead><tr>');
          db.columns.forEach(col => html.push(`<th>${col.name}</th>`));
          html.push('</tr></thead><tbody>');
          db.rows.forEach(row => {
            html.push('<tr>');
            db.columns.forEach(col => {
              const val = row[col.name] || '';
              if (col.type === 'url' && val && typeof val === 'string') {
                html.push(`<td><a href="${val}" target="_blank" rel="noopener noreferrer">${val}</a></td>`);
              } else {
                html.push(`<td>${renderCellValue(val)}</td>`);
              }
            });
            html.push('</tr>');
          });
          html.push('</tbody></table></div>');
        }
        break;
      }

      case 'table': {
        const hasColumnHeader = block.table?.has_column_header;
        const hasRowHeader = block.table?.has_row_header;
        const rows = block.children || [];
        html.push('<div class="notion-table-wrap"><table class="notion-table">');
        rows.forEach((row, rowIndex) => {
          const cells = row.table_row?.cells || [];
          const isHeaderRow = hasColumnHeader && rowIndex === 0;
          html.push('<tr>');
          cells.forEach((cell, colIndex) => {
            const isHeaderCell = isHeaderRow || (hasRowHeader && colIndex === 0);
            const tag = isHeaderCell ? 'th' : 'td';
            html.push(`<${tag}>${renderRichText(cell)}</${tag}>`);
          });
          html.push('</tr>');
        });
        html.push('</table></div>');
        break;
      }

      case 'divider':
        html.push('<hr />');
        break;

      case 'image': {
        let src = '';
        if (block.image.type === 'external') {
          src = block.image.external.url;
        } else if (block.image.type === 'file') {
          src = block.image.file.url;
        }
        const caption = block.image.caption
          ? renderRichText(block.image.caption)
          : '';
        html.push(`<figure><img src="${src}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`);
        break;
      }

      case 'video': {
        let videoUrl = '';
        if (block.video.type === 'external') {
          videoUrl = block.video.external.url;
        }
        // Convert YouTube/Vimeo URLs to embeds
        const embedUrl = getEmbedUrl(videoUrl);
        if (embedUrl) {
          html.push(`<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`);
        } else if (videoUrl) {
          html.push(`<p><a href="${videoUrl}" target="_blank" rel="noopener noreferrer">${videoUrl}</a></p>`);
        }
        break;
      }

      case 'embed': {
        const embedSrc = block.embed?.url || '';
        const eUrl = getEmbedUrl(embedSrc);
        if (eUrl) {
          html.push(`<div class="video-embed"><iframe src="${eUrl}" frameborder="0" allowfullscreen></iframe></div>`);
        } else if (embedSrc) {
          html.push(`<p><a href="${embedSrc}" target="_blank" rel="noopener noreferrer">${embedSrc}</a></p>`);
        }
        break;
      }

      case 'callout':
        const calloutText = renderRichText(block.callout.rich_text);
        const icon = block.callout.icon?.emoji || '';
        html.push(`<div class="callout">${icon ? `<span class="callout-icon">${icon}</span>` : ''}${calloutText}</div>`);
        break;

      case 'toggle': {
        const toggleText = renderRichText(block.toggle.rich_text);
        const toggleChildren = block.children ? renderBlocks(block.children) : '';
        html.push(`<details><summary>${toggleText}</summary>${toggleChildren}</details>`);
        break;
      }

      default:
        break;
    }

    i++;
  }

  return html.join('\n');
}

function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export { renderBlocks, renderRichText };
