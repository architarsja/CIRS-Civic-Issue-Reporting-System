// ==========================================
// CIRS API CONFIGURATION
// ==========================================

const API =
    localStorage.getItem('cirs_api') ||
    'http://localhost:5000/api';


// ==========================================
// GET LOGIN TOKEN
// ==========================================

function token() {
    return localStorage.getItem('cirs_token');
}


// ==========================================
// API REQUEST FUNCTION
// ==========================================

async function api(path, options = {}) {

    try {

        const headers = options.headers
            ? { ...options.headers }
            : {};


        // --------------------------------------
        // JSON CONTENT TYPE & STRINGIFY
        // --------------------------------------

        if (
            options.body &&
            !(options.body instanceof FormData)
        ) {

            headers['Content-Type'] = 'application/json';

            // Convert JavaScript object to JSON string automatically
            if (typeof options.body === 'object') {
                options.body = JSON.stringify(options.body);
            }

        }


        // --------------------------------------
        // AUTHORIZATION TOKEN
        // --------------------------------------

        const authToken = token();

        if (authToken) {

            headers['Authorization'] =
                'Bearer ' + authToken;

        }


        // --------------------------------------
        // SEND REQUEST
        // --------------------------------------

        const response = await fetch(
            API + path,
            {
                ...options,
                headers: headers
            }
        );


        // --------------------------------------
        // READ RESPONSE SAFELY
        // --------------------------------------

        const textResponse = await response.text();

        let data;

        try {
            data = textResponse ? JSON.parse(textResponse) : { success: response.ok };
        } catch (err) {
            data = {
                success: false,
                message: response.ok 
                    ? 'Server returned non-JSON response' 
                    : `Server Error (${response.status}): ${textResponse.substring(0, 100)}`
            };
        }


        // --------------------------------------
        // HANDLE HTTP ERRORS
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Request failed (${response.status})`
            );

        }


        return data;


    } catch (error) {

        console.error(
            'API ERROR:',
            error
        );


        // --------------------------------------
        // CONNECTION ERROR
        // --------------------------------------

        if (
            error instanceof TypeError &&
            error.message.includes('fetch')
        ) {

            throw new Error(
                'Cannot connect to CIRS backend. ' +
                'Make sure the backend is running on port 5000.'
            );

        }


        throw error;

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        'cirs_token'
    );

    localStorage.removeItem(
        'cirs_user'
    );


    location.href =
        '../login.html';

}


// ==========================================
// GET CURRENT USER
// ==========================================

function user() {

    try {

        return JSON.parse(
            localStorage.getItem(
                'cirs_user'
            ) || 'null'
        );

    } catch (error) {

        return null;

    }

}


// ==========================================
// PAGE / ROLE PROTECTION
// ==========================================

function guard(role) {

    const currentUser = user();

    const currentToken = token();


    // --------------------------------------
    // NOT LOGGED IN
    // --------------------------------------

    if (!currentUser || !currentToken) {

        location.href =
            '../login.html';

        return false;

    }


    // --------------------------------------
    // WRONG ROLE
    // --------------------------------------

    if (
        role &&
        currentUser.role !== role
    ) {

        alert(
            'You are not authorized to access this page.'
        );

        location.href =
            '../login.html';

        return false;

    }


    return true;

}


// ==========================================
// TOAST MESSAGE
// ==========================================

function toast(message) {

    const element =
        document.getElementById('toast');


    if (!element) {

        alert(message);

        return;

    }


    element.textContent =
        message;

    element.style.display =
        'block';


    setTimeout(() => {

        element.style.display =
            'none';

    }, 2600);

}


// ==========================================
// SET API URL
// ==========================================

function setApiUrl(url) {

    if (!url) {

        return;

    }


    localStorage.setItem(
        'cirs_api',
        url
    );

}


// ==========================================
// GET API URL
// ==========================================

function getApiUrl() {

    return API;

}