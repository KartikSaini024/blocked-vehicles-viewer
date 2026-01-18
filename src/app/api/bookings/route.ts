import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { Loc } from '@/lib/constants';

const agent = new https.Agent({
    rejectUnauthorized: false
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cookies, fromDate, toDate, locationId, categoryIds } = body;

        if (!cookies || !fromDate || !toDate || locationId === undefined) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Prepare headers with cookies
        const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
        const errors: any[] = [];

        // Loop through categories
        const cats = Array.isArray(categoryIds) && categoryIds.length > 0 ? categoryIds : [47];

        const fetchCategory = async (catId: number) => {
            const allCatBookings: any[] = [];

            // First fetch row 1 to get meta data (numofrows) and first batch of data
            // Add q timestamp to avoid caching
            const getUrl = (row: number) => `https://bookings.rentalcarmanager.com/bookingsheet/loadcardata.ashx?mode=availability&catid=${catId}&rowno=${row}&from=${fromDate}&to=${toDate}&locid=${locationId}&ctypeid=0&q=${Date.now()}`;

            // Debug: Print prepared URL
            console.log(`Prepared URL: ${getUrl(1)}`);

            try {
                console.log(`Fetching Category ${catId} Row 1...`);
                const response = await axios.get(getUrl(1), {
                    headers: {
                        'Cookie': cookieHeader,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    httpsAgent: agent
                });

                if (!response.data) {
                    console.warn(`Cat ${catId}: No data in response.`);
                    return [];
                }

                // DEBUG: Log full JSON response
                //console.log(`Cat ${catId} Row 1 FULL JSON:`);
                //console.log(JSON.stringify(response.data, null, 2));

                const data = response.data;

                // Add first row bookings
                if (data.rcmbooking) {
                    allCatBookings.push(...data.rcmbooking);
                }

                // Check for multiple rows
                let numRows = 1;
                if (data.rcmcardata && data.rcmcardata.length > 0) {
                    numRows = data.rcmcardata[0].numofrows || 1;
                }

                console.log(`Cat ${catId}: Detected ${numRows} rows.`);

                // Fetch remaining rows if any
                if (numRows > 1) {
                    const rowPromises: Promise<any>[] = [];
                    for (let r = 2; r <= numRows; r++) {
                        rowPromises.push(
                            axios.get(getUrl(r), {
                                headers: {
                                    'Cookie': cookieHeader,
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                                },
                                httpsAgent: agent
                            }).then(res => res.data?.rcmbooking || [])
                                .catch(e => {
                                    console.error(`Error fetching cat ${catId} row ${r}:`, e.message);
                                    return [];
                                })
                        );
                    }

                    const otherRowsResults = await Promise.all(rowPromises);
                    otherRowsResults.forEach(bookings => {
                        allCatBookings.push(...bookings);
                    });
                }

                console.log(`Cat ${catId}: Total bookings across all rows: ${allCatBookings.length}`);

                // Filter for reservationtypeid: 3 (Maintenance)
                const rawBlocked = allCatBookings.filter((b: any) => b.reservationtypeid === 3);

                // console.log("Found Blocked:")
                // console.log(rawBlocked)

                // Deduplicate: Compare reservationno. If 0, fallback to resbufferno.
                const seenKeys = new Set();
                const blocked = rawBlocked.filter((b: any) => {
                    // Use reservationno if valid (>0), otherwise resbufferno
                    const key = (b.reservationno && b.reservationno > 0) ? `res-${b.reservationno}` : `buf-${b.resbufferno}`;

                    if (seenKeys.has(key)) {
                        return false;
                    }
                    seenKeys.add(key);
                    return true;
                });

                //find Loc from locationId
                const locCode = Loc.find((loc: any) => loc.locid === locationId);

                // Filter location if the locCode is either in pickuplocation or dropofflocation by importing Loc from constants
                let filteredBlocked = blocked;
                if (locationId != 0) {
                    filteredBlocked = blocked.filter((b: any) => {
                        return locCode?.code === b.pickuplocation || locCode?.code === b.dropofflocation;
                    });
                }

                console.log(`Cat ${catId}: Found ${rawBlocked.length} blocked bookings. Unique: ${blocked.length}`);

                // Collect cars from first row (best effort)
                const cars = data.rcmcarsize || [];
                const carsMap = new Map(cars.map((c: any) => [c.carid, c]));

                const enriched = filteredBlocked.map((b: any) => ({
                    ...b,
                    carDetails: carsMap.get(b.carid) || null
                }));

                return enriched;

            } catch (err: any) {
                console.error(`Error fetching cat ${catId}:`, err.message);
                errors.push({ catId, error: err.message });
                return [];
            }
        };

        const promises = cats.map((id: number) => fetchCategory(id));
        const allResults = await Promise.all(promises);

        // Flatten results
        const flatResults = allResults.flat();

        return NextResponse.json({
            data: flatResults,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Bookings API error:', error.message);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
