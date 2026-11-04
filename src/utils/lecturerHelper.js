/**
 * Utilities for strictly matching and isolating lecturer courses and schedules.
 * Prevents cross-lecturer leakage (e.g. one lecturer seeing another lecturer's courses/reports/attendance).
 */

/**
 * Normalizes a person's name by stripping honorific titles and extra whitespace.
 * Handles both "Dr. Kwame" and "Dr Kwame", as well as parenthetical annotations like "(CS)".
 * @param {string} name
 * @returns {string}
 */
export function normalizeTitleName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\b(dr|prof|professor|mr|mrs|ms|assoc\s*prof|associate\s*professor|rev|reverend|ing|engr|lecturer|instructor)\b\.?/gi, ' ')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
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
  if (pEmail && sLect && sLect.toLowerCase() === pEmail) {
    return true;
  }

  // 3. Exact case-insensitive full name matching
  if (pName && sLect && sLect.toLowerCase() === pName.toLowerCase()) {
    return true;
  }

  // 4. Exact title-stripped normalized name matching (e.g., "Dr. Kwame Nkrumah" === "Kwame Nkrumah")
  const cleanSLect = normalizeTitleName(sLect);
  const cleanPName = normalizeTitleName(pName);

  if (cleanSLect && cleanPName) {
    if (cleanSLect === cleanPName) {
      return true;
    }

    // Compare word tokens (order-independent matching for full names, e.g. "Nkrumah Kwame" vs "Kwame Nkrumah")
    const wordsSLect = cleanSLect.split(' ').filter(Boolean);
    const wordsPName = cleanPName.split(' ').filter(Boolean);

    if (wordsSLect.length >= 2 && wordsPName.length >= 2) {
      // Check if both contain the exact same words
      const sortedA = [...wordsSLect].sort().join(' ');
      const sortedB = [...wordsPName].sort().join(' ');
      if (sortedA === sortedB) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether a course is assigned to the specified lecturer
 * via course.lecturer, course.lecturerId, or any embedded schedule.
 *
 * @param {object} course
 * @param {object} profile
 * @param {object} [user]
 * @returns {boolean}
 */
export function matchesLecturerCourse(course, profile, user) {
  if (!course) return false;

  // Direct lecturer fields on the course
  if (course.lecturer || course.lecturerId) {
    if (matchesLecturerSchedule({ lecturer: course.lecturer, lecturerId: course.lecturerId }, profile, user)) {
      return true;
    }
  }

  // Embedded schedules array on the course
  if (Array.isArray(course.schedules) && course.schedules.length > 0) {
    if (course.schedules.some((s) => matchesLecturerSchedule(s, profile, user))) {
      return true;
    }
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
 * Retrieves the distinct courses taught by a lecturer according to the schedule roster
 * and direct course assignments.
 */
export function getLecturerAssignedCourses(schedules, allCourses, profile, user) {
  if (!Array.isArray(allCourses)) return [];
  const mySchedules = filterLecturerSchedules(schedules, profile, user);
  const courseIdSet = new Set(mySchedules.map((s) => s.courseId));

  return allCourses.filter((c) => {
    if (courseIdSet.has(c.id) || courseIdSet.has(c.code)) return true;
    if (matchesLecturerCourse(c, profile, user)) return true;
    return false;
  });
}
