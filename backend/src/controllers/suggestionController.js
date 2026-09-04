import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/suggestions
// Student: submit a new suggestion or complaint
// ─────────────────────────────────────────────────────────────────────────────
export const submitSuggestion = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { category, subject, message, isAnonymous } = req.body;

    if (!category || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Category, subject and message are required.' });
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        studentId,
        category,
        subject:     subject.trim(),
        message:     message.trim(),
        isAnonymous: Boolean(isAnonymous),
      },
    });

    res.status(201).json({ message: 'Suggestion submitted successfully.', suggestion });
  } catch (error) {
    console.error('submitSuggestion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/suggestions
// Admin / Dean: list all suggestions (newest first)
// Query params: ?status=unread|reviewed|resolved  ?category=...  ?search=...
// ─────────────────────────────────────────────────────────────────────────────
export const getAllSuggestions = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const where = {};
    if (status)   where.status   = status;
    if (category) where.category = category;

    const suggestions = await prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Apply text search after fetch (SQLite doesn't support full-text search)
    let result = suggestions;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      result = suggestions.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          s.message.toLowerCase().includes(q)
      );
    }

    res.status(200).json(
      result.map((s) => ({
        id:          s.id,
        category:    s.category,
        subject:     s.subject,
        message:     s.message,
        isAnonymous: true,          // always treat as anonymous — student identity never exposed
        status:      s.status,
        adminNote:   s.adminNote,
        createdAt:   s.createdAt,
        // student identity intentionally omitted for privacy
      }))
    );
  } catch (error) {
    console.error('getAllSuggestions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/suggestions/:id
// Admin / Dean: update status and/or add an admin note
// ─────────────────────────────────────────────────────────────────────────────
export const updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const allowed = ['unread', 'reviewed', 'resolved'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Use one of: ${allowed.join(', ')}` });
    }

    const existing = await prisma.suggestion.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Suggestion not found.' });

    const updated = await prisma.suggestion.update({
      where: { id },
      data: {
        ...(status    !== undefined && { status }),
        ...(adminNote !== undefined && { adminNote: adminNote.trim() }),
      },
    });

    res.status(200).json({ message: 'Updated successfully.', suggestion: updated });
  } catch (error) {
    console.error('updateSuggestion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/suggestions/my
// Student: view their own previously submitted suggestions
// ─────────────────────────────────────────────────────────────────────────────
export const getMySuggestions = async (req, res) => {
  try {
    const studentId = req.user.id;

    const suggestions = await prisma.suggestion.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, category: true, subject: true, message: true,
        isAnonymous: true, status: true, adminNote: true, createdAt: true,
      },
    });

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('getMySuggestions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
