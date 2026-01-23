/**
 * Parses a date string robustly, handling formats like "dd/MM/yyyy", "dd-MMM-yyyy", etc.
 * @param dateStr The date string to parse
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
    try {
        const cleanStr = (dateStr || '').trim();
        if (!cleanStr) return new Date();

        const parts = cleanStr.split(' ');
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';

        // Handle separators / or -
        const separators = ['/', '-'];
        let separator = '/';
        for (const sep of separators) {
            if (datePart.includes(sep)) {
                separator = sep;
                break;
            }
        }

        const dParts = datePart.split(separator);
        const tParts = timePart.split(':');

        if (dParts.length < 3) return new Date();

        let day = parseInt(dParts[0]);
        let monthStr = dParts[1];
        let year = parseInt(dParts[2]);

        // Handle 2-digit years
        if (year < 100) year += 2000;

        // Resolve Month
        let month = 0;
        const m = parseInt(monthStr);
        if (!isNaN(m)) {
            month = m - 1;
        } else {
            // Handle MMM (Jan, Feb, etc.)
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const mIdx = months.indexOf(monthStr.toLowerCase().substring(0, 3));
            if (mIdx !== -1) month = mIdx;
        }

        return new Date(
            year,
            month,
            day,
            parseInt(tParts[0] || '0'),
            parseInt(tParts[1] || '0'),
            parseInt(tParts[2] || '0')
        );
    } catch (e) {
        console.error("Date parse error", dateStr, e);
        return new Date();
    }
};

/**
 * Checks if "Today" falls within the range of pickup and dropoff dates (inclusive).
 * @param pickupStr Pickup date string
 * @param dropoffStr Dropoff date string
 * @returns boolean
 */
export const isBlockedToday = (pickupStr: string, dropoffStr: string): boolean => {
    const pickup = parseDate(pickupStr).getTime();
    const dropoff = parseDate(dropoffStr).getTime();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    // Logic: Is "Today" overlapping with [pickup, dropoff]?
    // Overlap if: (Pick <= TodayEnd) AND (Drop >= TodayStart)
    return (pickup <= todayEnd) && (dropoff >= todayStart);
};
