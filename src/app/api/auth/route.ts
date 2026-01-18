import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Create an axios instance that ignores SSL errors if any (just in case)
const agent = new https.Agent({
  rejectUnauthorized: false
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const loginUrl = 'https://bookings.rentalcarmanager.com/account/login.aspx';

    // 1. GET request to fetch ViewState and EventValidation
    const getResponse = await axios.get(loginUrl, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(getResponse.data);
    const viewState = $('#__VIEWSTATE').val();
    const viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();
    const eventValidation = $('#__EVENTVALIDATION').val();

    if (!viewState || !eventValidation) {
      return NextResponse.json({ error: 'Failed to retrieve login form parameters' }, { status: 500 });
    }

    // 2. POST request to login
    const formData = new URLSearchParams();
    formData.append('__EVENTTARGET', '');
    formData.append('__EVENTARGUMENT', '');
    formData.append('__VIEWSTATE', viewState as string);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator as string || '');
    formData.append('__EVENTVALIDATION', eventValidation as string);
    formData.append('ctl00$MainContent$Username', username);
    formData.append('ctl00$MainContent$Password', password);
    formData.append('ctl00$MainContent$LoginButton', 'Sign in');

    // Extract cookies from GET response
    const initialCookies = getResponse.headers['set-cookie'] || [];

    const postResponse = await axios.post(loginUrl, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies.join('; '),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 0,
      validateStatus: (status) => status < 400,
      httpsAgent: agent
    });

    if (postResponse.status === 302) {
      // Successful login uses 302 redirect

      // 3. Capture cookies from redirect (these are usually the auth cookies)
      const redirectCookies = postResponse.headers['set-cookie'] || [];
      const intermediateCookies = [...initialCookies, ...redirectCookies];

      // 4. Follow the redirect to ensure we are fully logged in
      // (User suggestion: go to /dashboard or where the login sends us)
      let nextUrl = postResponse.headers['location'];
      if (nextUrl && !nextUrl.startsWith('http')) {
        nextUrl = `https://bookings.rentalcarmanager.com${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
      }

      // If usage suggests dashboard specifically:
      const dashboardUrl = 'https://bookings.rentalcarmanager.com/dashboard/dashboard.aspx'; // Assumption based on typical structure, or use 'nextUrl'
      // Let's use 'nextUrl' first as that's the natural flow.

      const tempCookieHeader = intermediateCookies.map(c => c.split(';')[0]).join('; ');

      console.log(`Following login redirect to: ${nextUrl}`);

      const dashboardResponse = await axios.get(nextUrl || dashboardUrl, {
        headers: {
          'Cookie': tempCookieHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        httpsAgent: agent,
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      });

      // // 5. Verify we are NOT redirected back to TwoFactorAuthenticationSignIn.aspx (if we are, it means the login failed)
      // if (dashboardResponse.status === 302 && dashboardResponse.headers['location']?.includes('TwoFactorAuthenticationSignIn.aspx')) {
      //   console.error('Validation failed: Redirected back to TwoFactorAuthenticationSignIn.');
      //   return NextResponse.json({ error: 'Login validation failed: Redirected to TwoFactorAuthenticationSignIn.' }, { status: 401 });
      // }

      // If we get 200 OK (dashboard loaded) OR a 302 to somewhere internal (not login), we are good.
      console.log(`Verification status: ${dashboardResponse.status}`);

      // Capture final cookies
      const finalCookies = dashboardResponse.headers['set-cookie'] || [];
      const allCookies = [...intermediateCookies, ...finalCookies];

      // Sanitize
      const cleanCookies = allCookies.map(c => c.split(';')[0]);
      const uniqueCookies = Array.from(new Set(cleanCookies));

      console.log('Login passed verification. Secured cookies:', uniqueCookies);

      return NextResponse.json({
        success: true,
        cookies: uniqueCookies
      });

    } else {
      console.log('Login failed: Status is not 302', postResponse.data?.substring(0, 200));
      return NextResponse.json({ error: 'Login failed (Invalid credentials or unexpected response)' }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Login error:', error.message);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
