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
      sorts: [{ property: 'Date', direction: 'descending' }],
    };
    if (limit) query.page_size = limit;

    const response = await notion.databases.query(query);

    return response.results.map(page => ({
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractRichText(page.properties.Slug),
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
        property: 'Slug',
        rich_text: { equals: slug },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const blocks = await getAllBlocks(page.id);
    const content = renderBlocks(blocks);

    return {
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractRichText(page.properties.Slug),
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
        or: [
          { property: 'Title', title: { contains: query } },
          { property: 'Summary', rich_text: { contains: query } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    return response.results.map(page => ({
      id: page.id,
      title: extractTitle(page.properties.Title),
      slug: extractRichText(page.properties.Slug),
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

  return blocks;
}

export async function getAboutContentFromNotion() {
  try {
    const blocks = await getAllBlocks(ABOUT_PAGE_ID);

    const sections = {
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
        if (heading.includes('contact')) currentSection = 'contact';
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
