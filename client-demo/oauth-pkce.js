const CLIENT_ID = "moshimoshi"

const BASE_AUTH_ENDPOINT = "https://auth-fra1.rpcpool.com:8443"
const REDIRECT_URL = "https://rpc-oauth.moshimoshi.xyz"

async function start_pkce() {
    // const seed = new Uint8Array(32);
    // crypto.getRandomValues(seed)
    //
    // const verifier_raw = await crypto.subtle.digest('SHA-256', seed)
    // const challenge_raw = await crypto.subtle.digest('SHA-256', verifier_raw);
    //
    // const decoder = new TextDecoder();

    const challenge = 'DDSuq_32Mlv86ucLNbNspsJ1QUZYz7dYf6L1AnN9Adk'
    const verifier = 'yzbnPbepnvPl6SUcsBzEf21geEkrzseCDLWAS0uliwKQlDEInT23zV6I2NidkkW4BeF4iVlt6.hdLlCNctqHAPCX7DOYB_7347w1Bk3xmBG10R~Se3~GDTRJfYPUf9.P'


    const state = Math.random().toString(36).substring(2, 15)

    window.localStorage.setItem('verifier',verifier);
    window.localStorage.setItem('state', state);

    console.log(`Challenge: ${challenge}, verifier: ${verifier}, state: ${state}`)

    const url = `https://auth-fra1.rpcpool.com:8443/oauth2/auth?client_id=${CLIENT_ID}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=${REDIRECT_URL}&response_type=code&state=${state}`
    console.log("Opening", url)

    window.open(url);
}

function setAuthCode() {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    console.log('window url', location)
    console.log('sending code', code)

    window.top.postMessage(code, '*')
}

function start_flow() {
    const iframe = document.getElementById("oauth-iframe")
    iframe.onload = (e) => console.log(e)
    iframe.addEventListener('message', (event) => {
        console.log(`Received message: ${event.data}`);
    });
}

async function handle_pkce_response() {
    const state = window.localStorage.getItem('state');
    const verifier = window.localStorage.getItem('verifier');

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    console.log(`Verifier: ${verifier}, state: ${state}, code: ${code}`);

    console.log(
        {
            code: code,
            code_verifier: verifier,
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URL,
            state: state,
        }
    )

    const params = new URLSearchParams();

    params.append('grant_type', 'authorization_code')
    params.append('client_id', CLIENT_ID)
    params.append('code', code)
    params.append('code_verifier', verifier)
    params.append('redirect_uri', REDIRECT_URL)


    const res = await axios.post(
        'https://auth-fra1.rpcpool.com:8443/oauth2/token',
        params,
        // {
        //     grant_type: 'authorization_code',
        //     code: code,
        //     code_verifier: verifier,
        //     // client_id: CLIENT_ID,
        //     // redirect_uri: REDIRECT_URL,
        //     // grant_type: 'authorization_code'
        //     // state: state,
        // },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )

    console.log(res);
}