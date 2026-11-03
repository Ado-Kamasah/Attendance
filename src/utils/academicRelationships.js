// ============================================================================
// Academic Relationships: Faculty and Programme Hierarchies
// ============================================================================

/**
 * Standard faculty-to-programme relationship dictionary.
 * Maps university faculties to their respective academic departments/programmes.
 */
export const FACULTY_PROGRAMME_MAP = {
  'School of Computing': [
    'B.Sc. Computer Science',
    'B.Sc. Information Technology',
    'B.Sc. Data Science',
    'B.Sc. Software Engineering',
    'B.Sc. Cybersecurity & Networks',
    'Computer Science',
    'Data Science'
  ],
  'School of Computational Sciences': [
    'B.Sc. Computer Science',
    'B.Sc. Data Science',
    'B.Sc. Mathematics & Computing',
    'B.Sc. Statistics & Data Analytics',
    'Statistics'
  ],
  'School of Business': [
    'BBA Business Administration',
    'B.Sc. Accounting & Finance',
    'B.Sc. Marketing',
    'B.Sc. Human Resource Management',
    'B.Sc. Banking & Finance',
    'Business',
    'Business Administration'
  ],
  'School of  Business Administration': [
    'BBA Business Administration',
    'B.Sc. Marketing',
    'B.Sc. Accounting & Finance',
    'Business Administration',
    'Business'
  ],
  'School of Humanities Arts and Social Sciences': [
    'B.A. Communication Studies',
    'B.A. Economics',
    'B.A. Public Relations',
    'B.A. International Relations',
    'B.A. Sociology & Social Work',
    'General Studies',
    'Humanities'
  ]
};

/**
 * Normalizes text for case-insensitive and whitespace-tolerant matching.
 */
function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Returns the list of programmes valid for a given faculty name.
 * If the faculty is not in the standard map, returns general programmes or programmes
 * that might match dynamically.
 */
export function getProgrammesForFaculty(facultyName, allKnownProgrammes = []) {
  if (!facultyName) return allKnownProgrammes;

  const normFac = normalizeKey(facultyName);
  for (const [fac, progs] of Object.entries(FACULTY_PROGRAMME_MAP)) {
    if (normalizeKey(fac) === normFac || normFac.includes(normalizeKey(fac)) || normalizeKey(fac).includes(normFac)) {
      return progs;
    }
  }

  // Fallback: check if any known programmes mention keywords from the faculty
  if (normFac.includes('comput') || normFac.includes('tech')) {
    return FACULTY_PROGRAMME_MAP['School of Computing'];
  }
  if (normFac.includes('busin') || normFac.includes('admin') || normFac.includes('mgt')) {
    return FACULTY_PROGRAMME_MAP['School of Business'];
  }
  if (normFac.includes('human') || normFac.includes('art') || normFac.includes('social')) {
    return FACULTY_PROGRAMME_MAP['School of Humanities Arts and Social Sciences'];
  }

  // If faculty has exact matching programmes in known list
  return allKnownProgrammes.length > 0 ? allKnownProgrammes : ['B.Sc. Computer Science', 'BBA Business Administration', 'B.A. Communication Studies'];
}

/**
 * Infers the most suitable faculty for a given programme name.
 */
export function getFacultyForProgramme(programmeName, availableFaculties = []) {
  if (!programmeName) return availableFaculties[0] || 'School of Computing';

  const normProg = normalizeKey(programmeName);

  for (const [fac, progs] of Object.entries(FACULTY_PROGRAMME_MAP)) {
    if (progs.some((p) => normalizeKey(p) === normProg || normProg.includes(normalizeKey(p)) || normalizeKey(p).includes(normProg))) {
      // Find matching entry in availableFaculties if present
      const match = availableFaculties.find((f) => normalizeKey(f) === normalizeKey(fac));
      return match || fac;
    }
  }

  if (normProg.includes('comput') || normProg.includes('data') || normProg.includes('soft') || normProg.includes('it') || normProg.includes('stat')) {
    const match = availableFaculties.find((f) => normalizeKey(f).includes('comput'));
    return match || 'School of Computing';
  }
  if (normProg.includes('bus') || normProg.includes('mark') || normProg.includes('acc') || normProg.includes('fin') || normProg.includes('mgt')) {
    const match = availableFaculties.find((f) => normalizeKey(f).includes('busin'));
    return match || 'School of Business';
  }

  return availableFaculties[0] || 'School of Computing';
}

/**
 * Validates whether a programme belongs to a given faculty.
 */
export function isValidProgrammeFacultyPair(programmeName, facultyName) {
  if (!programmeName || !facultyName) return false;
  const validProgrammes = getProgrammesForFaculty(facultyName);
  const normProg = normalizeKey(programmeName);
  return validProgrammes.some((p) => normalizeKey(p) === normProg || normProg.includes(normalizeKey(p)) || normalizeKey(p).includes(normProg));
}

