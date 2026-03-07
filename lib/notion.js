import { Client } from '@notionhq/client';
import { renderBlocks } from './notion-renderer';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const ESSAYS_DB_ID = process.env.NOTION_ESSAYS_DATABASE_ID;
const INTERESTING_DB_ID = process.env.NOTION_INTERESTING_DATABASE_ID;
const ABOUT_PAGE_ID = process.env.NOTION_ABOUT_PAGE_ID;

function extractRichText(property) {
  if (!property || !property.rich_text) return '';
  return property.rich_text.map(t => t.plain_text).join('');
}

function extractTitle(property) {
  if (!property || !property.title) return '';
  return property.title.map(t => t.plain_text).join('');
}

function extractDate(property) {
  if (!property || !property.date || !property.date.start) return null;
  return property.date.start;
}

function extractSelect(property) {
  if (!property || !property.select) return null;
  return property.select.name;
}

function extractFormula(property) {
  if (!property || !property.formula) return '';
  const f = property.formula;
  if (f.type === 'string') return f.string || '';
  if (f.type === 'number') return f.number != null ? String(f.number) : '';
  return '';
}

function extractUrl(property) {
  if (!property || !property.url) return null;
  const url = property.url;
  // Ensure URLs have a protocol prefix
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export async function getEssaysFromNotion(limit) {
  try {
    const query = {
      database_id: ESSAYS_DB_ID,
      filter: { property: 'Published', checkbox: { equals: true } },
      sorts: [{ property: 'Date', direction: 'descending' }],
    };
    if (limit) query.page_size = limit;

    const response = await notion.databases.query(query);

    return response.results.map(page => ({
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractFormula(page.properties.Slug),
      date: extractDate(page.properties.Date),
      summary: extractRichText(page.properties.Summary),
      type: extractSelect(page.properties.Type),
    }));
  } catch (error) {
    console.error('Error fetching essays from Notion:', error);
    return [];
  }
}

export async function getEssayBySlugFromNotion(slug) {
  try {
    const response = await notion.databases.query({
      database_id: ESSAYS_DB_ID,
      filter: {
        and: [
          { property: 'Slug', formula: { string: { equals: slug } } },
          { property: 'Published', checkbox: { equals: true } },
        ],
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const blocks = await getAllBlocks(page.id);
    const content = renderBlocks(blocks);

    return {
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractFormula(page.properties.Slug),
      date: extractDate(page.properties.Date),
      summary: extractRichText(page.properties.Summary),
      type: extractSelect(page.properties.Type),
      content,
      isHtml: true,
    };
  } catch (error) {
    console.error(`Error fetching essay with slug "${slug}" from Notion:`, error);
    return null;
  }
}

export async function searchEssaysFromNotion(query) {
  try {
    if (!query) return getEssaysFromNotion();

    const response = await notion.databases.query({
      database_id: ESSAYS_DB_ID,
      filter: {
        and: [
          { property: 'Published', checkbox: { equals: true } },
          {
            or: [
              { property: 'Title', title: { contains: query } },
              { property: 'Summary', rich_text: { contains: query } },
            ],
          },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    return response.results.map(page => ({
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractFormula(page.properties.Slug),
      date: extractDate(page.properties.Date),
      summary: extractRichText(page.properties.Summary),
      type: extractSelect(page.properties.Type),
    }));
  } catch (error) {
    console.error('Error searching essays in Notion:', error);
    return [];
  }
}

export async function getInterestingItemsFromNotion(limit) {
  try {
    const query = {
      database_id: INTERESTING_DB_ID,
      filter: { property: 'Published', checkbox: { equals: true } },
      sorts: [{ property: 'Date', direction: 'descending' }],
    };
    if (limit) query.page_size = limit;

    const response = await notion.databases.query(query);

    return response.results.map(page => ({
      id: page.id,
      title: extractTitle(page.properties.Title),
      url: extractUrl(page.properties.URL || page.properties['userDefined:URL']),
      date: extractDate(page.properties.Date),
      type: extractSelect(page.properties.Type),
      why: extractRichText(page.properties.Why),
    }));
  } catch (error) {
    console.error('Error fetching interesting items from Notion:', error);
    return [];
  }
}

export async function getInterestingItemByIdFromNotion(id) {
  try {
    const page = await notion.pages.retrieve({ page_id: id });

    return {
      id: page.id,
      title: extractTitle(page.properties.Title),
      url: extractUrl(page.properties.URL || page.properties['userDefined:URL']),
      date: extractDate(page.properties.Date),
      type: extractSelect(page.properties.Type),
      why: extractRichText(page.properties.Why),
    };
  } catch (error) {
    console.error(`Error fetching interesting item with ID "${id}" from Notion:`, error);
    return null;
  }
}

async function getAllBlocks(blockId) {
  const blocks = [];
  let cursor;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  // Fetch children for blocks that have them (tables, toggles, etc.)
  for (const block of blocks) {
    if (block.type === 'child_database') {
      // Query the inline database to get its rows and schema
      try {
        const dbId = block.id;
        const dbResponse = await notion.databases.retrieve({ database_id: dbId });
        const rowsResponse = await notion.databases.query({ database_id: dbId });

        // Extract column names from database properties
        const columns = Object.entries(dbResponse.properties)
          .sort((a, b) => (a[1].name || '').localeCompare(b[1].name || ''))
          .map(([key, prop]) => ({ name: key, type: prop.type }));

        // Extract row data
        const rows = rowsResponse.results.map(page => {
          const row = {};
          for (const col of columns) {
            const prop = page.properties[col.name];
            if (!prop) { row[col.name] = ''; continue; }
            switch (prop.type) {
              case 'title': row[col.name] = prop.title.map(t => t.plain_text).join(''); break;
              case 'rich_text': row[col.name] = prop.rich_text.map(t => t.plain_text).join(''); break;
              case 'number': row[col.name] = prop.number != null ? String(prop.number) : ''; break;
              case 'select': row[col.name] = prop.select ? { _type: 'select', name: prop.select.name, color: prop.select.color } : ''; break;
              case 'multi_select': row[col.name] = prop.multi_select.length > 0 ? { _type: 'multi_select', items: prop.multi_select.map(s => ({ name: s.name, color: s.color })) } : ''; break;
              case 'date': row[col.name] = prop.date?.start || ''; break;
              case 'checkbox': row[col.name] = prop.checkbox ? '✓' : '✗'; break;
              case 'url': row[col.name] = prop.url || ''; break;
              case 'email': row[col.name] = prop.email || ''; break;
              case 'phone_number': row[col.name] = prop.phone_number || ''; break;
              case 'formula': row[col.name] = prop.formula?.string || prop.formula?.number?.toString() || ''; break;
              default: row[col.name] = '';
            }
          }
          return row;
        });

        block.database = { title: dbResponse.title.map(t => t.plain_text).join(''), columns, rows };
      } catch (err) {
        console.error('Error fetching inline database:', err);
      }
    } else if (block.has_children) {
      block.children = await getAllBlocks(block.id);
    }
  }

  return blocks;
}

export async function getAboutContentFromNotion() {
  try {
    const blocks = await getAllBlocks(ABOUT_PAGE_ID);

    const sections = {
      homeBio: [],
      bio: [],
      contact: {},
      resumeUrl: '/documents/Angan_Sarker_Resume.pdf',
      work: [],
      education: [],
      skills: [],
    };

    let currentSection = 'bio';
    let currentWorkItem = null;
    let currentEduItem = null;
    let currentSkillCategory = null;

    for (const block of blocks) {
      const text = block.type === 'paragraph'
        ? block.paragraph?.rich_text?.map(t => t.plain_text).join('') || ''
        : '';

      if (block.type === 'heading_2') {
        const heading = block.heading_2.rich_text.map(t => t.plain_text).join('').toLowerCase();
        if (heading.includes('home bio')) currentSection = 'homeBio';
        else if (heading.includes('contact')) currentSection = 'contact';
        else if (heading.includes('work')) currentSection = 'work';
        else if (heading.includes('education')) currentSection = 'education';
        else if (heading.includes('skills')) currentSection = 'skills';
        else if (heading.includes('bio')) currentSection = 'bio';
        currentWorkItem = null;
        currentEduItem = null;
        currentSkillCategory = null;
        continue;
      }

      if (block.type === 'heading_3') {
        const heading = block.heading_3.rich_text.map(t => t.plain_text).join('');

        if (currentSection === 'work') {
          const parts = heading.split('|').map(s => s.trim());
          currentWorkItem = {
            company: parts[0] || '',
            position: parts[1] || '',
            duration: parts[2] || '',
            bullets: [],
          };
          sections.work.push(currentWorkItem);
        } else if (currentSection === 'education') {
          const parts = heading.split('|').map(s => s.trim());
          currentEduItem = {
            institution: parts[0] || '',
            degree: parts[1] || '',
            duration: parts[2] || '',
            details: [],
          };
          sections.education.push(currentEduItem);
        } else if (currentSection === 'skills') {
          currentSkillCategory = {
            category: heading,
            items: '',
          };
          sections.skills.push(currentSkillCategory);
        }
        continue;
      }

      if (currentSection === 'homeBio' && block.type === 'paragraph' && text) {
        sections.homeBio.push(text);
      }

      if (currentSection === 'bio' && block.type === 'paragraph' && text) {
        sections.bio.push(text);
      }

      if (currentSection === 'contact' && block.type === 'paragraph' && text) {
        if (text.toLowerCase().startsWith('email:')) {
          sections.contact.email = text.replace(/^email:\s*/i, '').trim();
        } else if (text.toLowerCase().startsWith('linkedin:')) {
          sections.contact.linkedin = text.replace(/^linkedin:\s*/i, '').trim();
        } else if (text.toLowerCase().startsWith('resume:')) {
          sections.resumeUrl = text.replace(/^resume:\s*/i, '').trim();
        }
      }

      if (currentSection === 'work' && currentWorkItem) {
        if (block.type === 'bulleted_list_item') {
          const bulletText = block.bulleted_list_item.rich_text.map(t => t.plain_text).join('');
          currentWorkItem.bullets.push(bulletText);
        }
      }

      if (currentSection === 'education' && currentEduItem) {
        if (block.type === 'paragraph' && text) {
          currentEduItem.details.push(text);
        }
      }

      if (currentSection === 'skills' && currentSkillCategory) {
        if (block.type === 'paragraph' && text) {
          currentSkillCategory.items = text;
        }
      }
    }

    return sections;
  } catch (error) {
    console.error('Error fetching about content from Notion:', error);
    return null;
  }
}
