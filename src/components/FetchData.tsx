import { API_URL } from '../services/ApiUrls';

export const Header = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: localStorage.getItem('Token'),
  org: localStorage.getItem('org'),
};

export const Header1 = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: localStorage.getItem('Token'),
};

export async function fetchData(url: any, method: any, data = '', header: any) {
  try {
    // Format the URL, remove the leading slash if there is one
    const formattedUrl = url.startsWith('/') ? url.substring(1) : url;

    // Create request options object
    const requestOptions: RequestInit = {
      method,
      headers: header,
    };

    // Only include body for methods that support it
    if (method !== 'GET' && method !== 'DELETE' && data) {
      requestOptions.body = data;
    }

    // Log request information for debugging
    console.log(`API Request to ${formattedUrl}:`, {
      method,
      headers: header,
      body:
        method !== 'GET' && method !== 'DELETE' ? data : 'No body (GET/DELETE)',
    });
    const response = await fetch(`${API_URL}/${formattedUrl}`, requestOptions);

    // Get the response text before checking the status
    const responseText = await response.text();

    // Logging for debugging
    console.log(`API Response (${url}):`, {
      status: response.status,
      text: responseText,
    });

    let responseData;
    // Check Content-Type before parsing JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        // Trying to parse as JSON
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If JSON parsing fails, it's a real error
        console.error(`JSON parsing error for ${url}:`, e);
        responseData = { detail: 'Failed to parse JSON' };
      }
    } else {
      // If Content-Type is not JSON, use as text
      responseData = { detail: responseText };
    }

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      };
    }

    return responseData;
  } catch (error: any) {
    console.error(`Fetch Error for URL: ${url}`, {
      error: error,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      stack: error.stack,
    });

    // If the error is already formatted correctly (from our block above), we simply pass it on
    if (error.status && error.data) {
      throw error;
    }

    // For other types of errors (network errors, etc.)
    throw {
      status: error.status || 0,
      statusText: error.statusText || 'Network Error',
      data: { detail: error.message || 'Failed to connect to server' },
    };
  }
}
