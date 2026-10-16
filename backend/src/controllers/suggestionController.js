import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/suggestions
// Student: submit a new suggestion or complaint
// ─────────────────────────────────────────────────────────────────────────────
// Helper to compute 3-day SLA details
const computeSLA = (createdAt, adminNote, status) => {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const isResponded = Boolean(adminNote) || status === 'reviewed' || status === 'resolved';
  const isOverdue = diffMs < 0 && !isResponded;
  const isUrgent = diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000 && !isResponded;
  const remainingHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const overdueHours = diffMs < 0 ? Math.floor(Math.abs(diffMs) / (1000 * 60 * 60)) : 0;

  return {
    slaDeadline: deadline.toISOString(),
    slaTargetFormatted: deadline.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    isResponded,
    isOverdue,
    isUrgent,
    remainingHours,
    overdueHours,
  };
};

export const submitSuggestion = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { category, subject, message, isAnonymous } = req.body;

    if (!category || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Category, subject and message are required.' });
    }

    const slaDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const deadlineFormatted = slaDeadline.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Automated institutional response with 3-day commitment
    const autoResponse = `[Automated Response • 3-Day SLA Commitment]\nThank you for reaching out. Your ${category} has been received and routed to University Administration.\n\n⏱️ Response Policy: Under our student charter, an official administrative review and resolution will be provided within three (3) business days (by ${deadlineFormatted}).`;

    const suggestion = await prisma.suggestion.create({
      data: {
        studentId,
        category,
        subject:     subject.trim(),
        message:     message.trim(),
        isAnonymous: Boolean(isAnonymous),
        adminNote:   autoResponse,
      },
    });

    res.status(201).json({ 
      message: 'Suggestion submitted successfully with automated 3-day SLA response.', 
      suggestion,
      slaDeadline,
    });
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
        sla:         computeSLA(s.createdAt, s.adminNote, s.status),
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
