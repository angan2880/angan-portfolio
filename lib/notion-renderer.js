// Map Notion color names to CSS classes
const NOTION_COLORS = {
  gray: { color: '#9b9a97' },
  brown: { color: '#64473a' },
  orange: { color: '#d9730d' },
  yellow: { color: '#dfab01' },
  green: { color: '#0f7b6c' },
  blue: { color: '#0b6e99' },
  purple: { color: '#6940a5' },
  pink: { color: '#ad1a72' },
  red: { color: '#e03e3e' },
  gray_background: { background: '#ebeced' },
  brown_background: { background: '#e9e5e3' },
  orange_background: { background: '#faebdd' },
  yellow_background: { background: '#fbf3db' },
  green_background: { background: '#ddedea' },
  blue_background: { background: '#ddebf1' },
  purple_background: { background: '#eae4f2' },
  pink_background: { background: '#f4dfeb' },
  red_background: { background: '#fbe4e4' },
};

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
          if (colorStyle.background) styles.push(`background-color:${colorStyle.background};padding:2px 4px;border-radius:3px`);
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

      case 'toggle':
        const toggleText = renderRichText(block.toggle.rich_text);
        html.push(`<details><summary>${toggleText}</summary></details>`);
        break;

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
