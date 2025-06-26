//local because you shouldn't be able to make requests without a valid method
async function makeRequest(extension, body, method) {
    const res = await fetch(`${import.meta.env.VITE_API_SRC}/api/${extension}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    })
    return res;
}
/**
 * sends a get request to the server
 * @param {String} extension The subdirectory of the api that you want to access (e.g. signup)
 * @param {JSON} body A JSON object that will be sent to the server
 * @returns {Response} the server's response
 */
async function makeGetRequest(extension, body) {
    return (await makeRequest(extension, body, 'GET'));
}
/**
 * sends a post request to the server
 * @param {String} extension The subdirectory of the api that you want to access (e.g. signup)
 * @param {JSON} body A JSON object that will be sent to the server
 * @returns {Response} the server's response
 */
async function makePostRequest(extension, body) {
    return (await makeRequest(extension, body, 'POST'));
}

/**
 * sends a put request to the server
 * @param {String} extension The subdirectory of the api that you want to access (e.g. signup)
 * @param {JSON} body A JSON object that will be sent to the server
 * @returns {Response} the server's response
 */
async function makePutRequest(extension, body) {
    return (await makeRequest(extension, body, 'PUT'));
}

/**
 * sends a delete request to the server
 * @param {String} extension The subdirectory of the api that you want to access (e.g. signup)
 * @param {JSON} body A JSON object that will be sent to the server
 * @returns {Response} the server's response
 */
async function makeDeleteRequest(extension, body) {
    return (await makeRequest(extension, body, 'DELETE'));
}


export { makeGetRequest, makePostRequest, makePutRequest, makeDeleteRequest }
