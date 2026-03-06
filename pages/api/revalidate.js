export default async function handler(req, res) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    await res.revalidate('/');
    await res.revalidate('/essays');
    await res.revalidate('/interesting');
    await res.revalidate('/about');
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).json({ message: 'Error revalidating' });
  }
}
