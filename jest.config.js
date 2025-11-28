/** @type {import('jest').Config} */
const config = {
    verbose: true,
    injectGlobals: false,
    transform: {},
    testTimeout: 20000,
    "reporters": [
	    "default",
	    ["./node_modules/jest-html-reporter",  
        {
		    "pageTitle": "Test Report",
            includeConsoleLog: true,
            includeFailureMsg: true
	    }]
]
};

export default config;