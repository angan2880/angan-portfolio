import { searchEssaysFromNotion } from '../../lib/notion';

export default async function handler(req, res) {
  const { q } = req.query;
  const results = await searchEssaysFromNotion(q || '');
  res.status(200).json(results);
}
