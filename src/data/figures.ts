import { roles, type Month } from './experience';
import { projects } from './projects';
import { stack } from './stack';

// Every figure the site states is computed here from the record, at build
// time, so a number can never contradict the roles and projects under it.
const toMonths = (month: Month) => {
  const [year, index] = month.split('-').map(Number);
  return (year ?? 0) * 12 + (index ?? 1) - 1;
};
const monthOf = (date: Date): Month =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}` as Month;

// How long a role lasted, in whole months, counting its first and last month;
// an open role runs to the current month.
export function roleMonths(
  role: { start: Month; end: Month | null },
  today: Date,
) {
  const end = role.end ? toMonths(role.end) : toMonths(monthOf(today));
  return end - toMonths(role.start) + 1;
}

export function figures(today: Date) {
  const now = toMonths(monthOf(today));
  const first = Math.min(...roles.map((role) => toMonths(role.start)));
  return {
    yearsSinceFirstRole: Math.floor((now - first) / 12),
    firstYear: Math.floor(first / 12),
    companies: new Set(roles.map((role) => role.company)).size,
    projects: projects.length,
    publicProjects: projects.filter((project) => project.repository).length,
    technologies: Object.values(stack).flat().length,
  };
}

// One entry per month from the first role to today: the role held that month
// and how many months into it, or null for a month between roles.
export function career(today: Date) {
  const now = toMonths(monthOf(today));
  const first = Math.min(...roles.map((role) => toMonths(role.start)));
  return Array.from({ length: now - first + 1 }, (_, offset) => {
    const month = first + offset;
    const role = roles.find(
      (candidate) =>
        toMonths(candidate.start) <= month &&
        month <= (candidate.end ? toMonths(candidate.end) : now),
    );
    return {
      year: Math.floor(month / 12),
      month: month % 12,
      role: role?.id ?? null,
      tenure: role ? month - toMonths(role.start) + 1 : 0,
    };
  });
}
