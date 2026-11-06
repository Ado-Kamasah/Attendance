/**
 * Utilities for strictly matching and isolating lecturer courses and schedules.
 * Prevents cross-lecturer leakage (e.g. one lecturer seeing another lecturer's courses/reports/attendance).
 */

/**
 * Normalizes a person's name by stripping honorific titles and extra whitespace.
 * @param {string} name
 * @returns {string}
 */
export function normalizeTitleName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.|assoc\.\s*prof\.|rev\.)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a given schedule entry belongs to a specific lecturer profile/user.
 * Uses strict identity and exact normalized name matching — NO loose substring matching.
 *
 * @param {object} schedule
 * @param {object} profile - authStore.profile (from public.users)
 * @param {object} [user] - authStore.user (from auth.users)
 * @returns {boolean}
 */
export function matchesLecturerSchedule(schedule, profile, user) {
  if (!schedule) return false;

  const sLect = (schedule.lecturer || '').trim();
  const sLectId = (schedule.lecturerId || schedule.lecturer_id || '').trim();

  const pName = (profile?.name || profile?.full_name || '').trim();
  const pEmail = (profile?.email || user?.email || '').trim().toLowerCase();
  const pId = (profile?.id || user?.id || '').trim();
  const pStaffId = (profile?.id_number || profile?.staff_id || '').trim();

  // 1. Match by Unique ID (UUID or custom STAFF ID)
  if (pId) {
    if (sLectId && sLectId === pId) return true;
    if (sLect && sLect === pId) return true;
  }
  if (pStaffId) {
    if (sLectId && sLectId === pStaffId) return true;
    if (sLect && sLect === pStaffId) return true;
  }

  // 2. Match by Email
  if (pEmail && sLect.toLowerCase() === pEmail) {
    return true;
  }

  // 3. Exact case-insensitive full name matching
  if (pName && sLect && sLect.toLowerCase() === pName.toLowerCase()) {
    return true;
  }

  // 4. Exact title-stripped normalized name matching (e.g., "Dr. Kwame Nkrumah" === "Kwame Nkrumah")
  // Strict EQUALITY only — NEVER use .includes() as it causes partial name collisions!
  const cleanSLect = normalizeTitleName(sLect);
  const cleanPName = normalizeTitleName(pName);

  if (cleanSLect && cleanPName && cleanSLect === cleanPName) {
    return true;
  }

  return false;
}

/**
 * Filters a list of schedules for a specific lecturer.
 */
export function filterLecturerSchedules(schedules, profile, user) {
  if (!Array.isArray(schedules)) return [];
  return schedules.filter((s) => matchesLecturerSchedule(s, profile, user));
}

/**
 * Retrieves the distinct courses taught by a lecturer according to the schedule roster.
 */
export function getLecturerAssignedCourses(schedules, allCourses, profile, user) {
  if (!Array.isArray(allCourses)) return [];
  const mySchedules = filterLecturerSchedules(schedules, profile, user);
  const courseIdSet = new Set(mySchedules.map((s) => s.courseId));

  return allCourses.filter((c) => courseIdSet.has(c.id) || courseIdSet.has(c.code));
}
