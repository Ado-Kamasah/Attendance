// ============================================================================
// Academic Relationships: Faculty and Programme Hierarchies
// ============================================================================

/**
 * Official University Schools (Faculties)
 */
export const OFFICIAL_FACULTIES = [
  'School of Business & Leadership',
  'School of Computing & Digital Innovation',
  'School of Statistics & Data Science',
  'School of Health Sciences',
  'School of Humanities, Arts and Social Science (SHASS)',
  'School of Law',
  'Tali Graduate School'
];

/**
 * Standard faculty-to-programme relationship dictionary.
 * Maps university faculties to their respective academic departments/programmes.
 * All Business programmes are strictly BBA (not B.Sc.).
 */
export const FACULTY_PROGRAMME_MAP = {
  'School of Business & Leadership': [
    'BBA Accounting',
    'BBA Banking & Finance',
    'BBA Human Resource Management',
    'BBA Marketing'
  ],
  'School of Computing & Digital Innovation': [
    'BSc Computer Science with Management'
  ],
  'School of Statistics & Data Science': [
    'BSc Statistics and Data Science'
  ],
  'School of Health Sciences': [
    'BSc Nursing'
  ],
  'School of Humanities, Arts and Social Science (SHASS)': [
    'BA Pastoral Care & Counselling',
    'BA Theology'
  ],
  'School of Law': [
    'Bachelor of Laws (LLB)'
  ],
  'Tali Graduate School': [
    'PhD Business Administration',
    'PhD Statistics',
    'Doctor of Business Administration',
    'Doctor of Statistics & Data Science',
    'MPhil Business Administration',
    'MPhil Information Technology',
    'MPhil Statistics',
    'MBA Human Resource Management',
    'MBA Marketing',
    'MA Management',
    'MSc Computer Science',
    'MSc Data Sciences',
    'MSc Health Informatics',
    'MSc Information Technology',
    'MSc Statistics',
    'MSc in Strategic Management and Leadership',
    'Master of Public Health',
    'Postgraduate Diploma in Statistics'
  ]
};

/**
 * Flattened list of all official programmes across all schools
 */
export const ALL_OFFICIAL_PROGRAMMES = Object.values(FACULTY_PROGRAMME_MAP).flat();

/**
 * Normalizes text for case-insensitive and whitespace-tolerant matching.
 */
function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves legacy or abbreviated school names to the official school name.
 */
export function resolveOfficialFaculty(facultyName) {
  if (!facultyName) return OFFICIAL_FACULTIES[0];
  const norm = normalizeKey(facultyName);

  if (norm.includes('business') || norm.includes('leadership')) {
    return 'School of Business & Leadership';
  }
  if (norm.includes('comput') || norm.includes('digital') || norm.includes('inno')) {
    return 'School of Computing & Digital Innovation';
  }
  if (norm.includes('stat') && (norm.includes('data') || !norm.includes('phd'))) {
    return 'School of Statistics & Data Science';
  }
  if (norm.includes('health') || norm.includes('nurs')) {
    return 'School of Health Sciences';
  }
  if (norm.includes('human') || norm.includes('art') || norm.includes('social') || norm.includes('shass') || norm.includes('theol')) {
    return 'School of Humanities, Arts and Social Science (SHASS)';
  }
  if (norm.includes('law') || norm.includes('llb')) {
    return 'School of Law';
  }
  if (norm.includes('grad') || norm.includes('tali') || norm.includes('postgrad') || norm.includes('master') || norm.includes('doctor') || norm.includes('phd') || norm.includes('mphil') || norm.includes('mba')) {
    return 'Tali Graduate School';
  }

  // Exact or direct match
  const match = OFFICIAL_FACULTIES.find(f => normalizeKey(f) === norm);
  return match || facultyName;
}

/**
 * Returns the list of programmes valid for a given faculty name.
 */
export function getProgrammesForFaculty(facultyName, allKnownProgrammes = []) {
  if (!facultyName) return ALL_OFFICIAL_PROGRAMMES;

  const resolved = resolveOfficialFaculty(facultyName);
  if (FACULTY_PROGRAMME_MAP[resolved]) {
    return FACULTY_PROGRAMME_MAP[resolved];
  }

  const normFac = normalizeKey(facultyName);
  for (const [fac, progs] of Object.entries(FACULTY_PROGRAMME_MAP)) {
    if (normalizeKey(fac) === normFac || normFac.includes(normalizeKey(fac)) || normalizeKey(fac).includes(normFac)) {
      return progs;
    }
  }

  return allKnownProgrammes.length > 0 ? allKnownProgrammes : FACULTY_PROGRAMME_MAP['School of Business & Leadership'];
}

/**
 * Infers the most suitable faculty for a given programme name.
 */
export function getFacultyForProgramme(programmeName, availableFaculties = []) {
  if (!programmeName) return OFFICIAL_FACULTIES[0];

  const normProg = normalizeKey(programmeName);

  // 1. Direct match in programme map
  for (const [fac, progs] of Object.entries(FACULTY_PROGRAMME_MAP)) {
    if (progs.some((p) => {
      const np = normalizeKey(p);
      return np === normProg || normProg.includes(np) || np.includes(normProg);
    })) {
      return fac;
    }
  }

  // 2. Keyword heuristic checks
  if (normProg.includes('bba') || (normProg.includes('business') && !normProg.includes('phd') && !normProg.includes('mphil') && !normProg.includes('mba') && !normProg.includes('doctor')) || normProg.includes('account') || normProg.includes('banking') || normProg.includes('humanres') || (normProg.includes('market') && !normProg.includes('mba'))) {
    return 'School of Business & Leadership';
  }
  if (normProg.includes('comput') && !normProg.includes('phd') && !normProg.includes('mphil') && !normProg.includes('msc')) {
    return 'School of Computing & Digital Innovation';
  }
  if (normProg.includes('stat') && !normProg.includes('phd') && !normProg.includes('mphil') && !normProg.includes('msc') && !normProg.includes('postgrad')) {
    return 'School of Statistics & Data Science';
  }
  if (normProg.includes('nurs') || (normProg.includes('health') && !normProg.includes('master') && !normProg.includes('msc'))) {
    return 'School of Health Sciences';
  }
  if (normProg.includes('pastor') || normProg.includes('theol') || normProg.includes('counsel')) {
    return 'School of Humanities, Arts and Social Science (SHASS)';
  }
  if (normProg.includes('law') || normProg.includes('llb')) {
    return 'School of Law';
  }
  if (normProg.includes('phd') || normProg.includes('doctor') || normProg.includes('mphil') || normProg.includes('mba') || normProg.includes('msc') || normProg.includes('master') || normProg.includes('postgrad') || normProg.includes('diploma')) {
    return 'Tali Graduate School';
  }

  return OFFICIAL_FACULTIES[0];
}

/**
 * Validates whether a programme belongs to a given faculty.
 */
export function isValidProgrammeFacultyPair(programmeName, facultyName) {
  if (!programmeName || !facultyName) return false;
  const validProgrammes = getProgrammesForFaculty(facultyName);
  const normProg = normalizeKey(programmeName);
  return validProgrammes.some((p) => {
    const np = normalizeKey(p);
    return np === normProg || normProg.includes(np) || np.includes(normProg);
  });
}
