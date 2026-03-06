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

      case 'heading_1':
        html.push(`<h1>${renderRichText(block.heading_1.rich_text)}</h1>`);
        break;

      case 'heading_2':
        html.push(`<h2>${renderRichText(block.heading_2.rich_text)}</h2>`);
        break;

      case 'heading_3':
        html.push(`<h3>${renderRichText(block.heading_3.rich_text)}</h3>`);
        break;

      case 'quote':
        html.push(`<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`);
        break;

      case 'code':
        const lang = block.code.language || '';
        const codeText = renderRichText(block.code.rich_text);
        html.push(`<pre><code class="language-${lang}">${codeText}</code></pre>`);
        break;

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
