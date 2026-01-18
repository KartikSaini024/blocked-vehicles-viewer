import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cookies, url } = body;

        if (!cookies || !url) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;

        console.log(`Test Proxy Calling: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                httpsAgent: agent
            });

            console.log('Test Proxy Response Status:', response.status);

            // Return raw data
            return NextResponse.json(response.data);

        } catch (err: any) {
            console.error('Test Proxy Error:', err.message);
            return NextResponse.json({ error: err.message, status: err.response?.status, data: err.response?.data }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
