const fs = require('fs');
const http = require('http');
const convert = require('xml-js');

const Test = require('../models/test');
const runCommand = require('../utils/runCommand');
const { pathToTestOutputXML, mavenTestCommand } = require('../constants');

module.exports = function testFunction() {
    return new Promise(async (resolve, reject) => {
        try {
            await runCommand(mavenTestCommand);
        } catch (err) {
            // ! this silences all errors therefore if a path is incorrect it will not report
            // TODO: Implement dev mode checking to report error in dev mode
            //console.log(err)
            // Silence chrome headless error
        }
    
        try {
            const xml = fs.readFileSync(pathToTestOutputXML, 'utf8');
            const result1 = convert.xml2json(xml, {compact: true, spaces: 2});
            const tests = [];
            const jsonOfTestResult = JSON.parse(result1)
            
            const testData = jsonOfTestResult["testng-results"]["suite"]["test"]["class"]["test-method"];
            let suitePassed = true;

            for (let test of testData) {
                let status;
                switch(test["_attributes"].status) {
                    case "PASS":
                        status = 1;
                        break;
                    case "FAIL":
                        status = 0;
                        break;
                    case "SKIP":
                        status = 2;
                        break;
                    default:
                        status = -1;
                        break;
                }                

                if (status === -1) {
                    console.error(`Unexpected Value in status ${test["_attributes"].status}`);
                }

                const currentTest = new Test({
                    recordID: null,
                    BatchID: null,
                    InitiatedBy: "default",
                    status,
                    signature: test["_attributes"].signature,
                    name: test["_attributes"].name,
                    duration_ms: parseInt(test["_attributes"]["duration-ms"]),
                    startTime: test["_attributes"]["started-at"],
                    finishTime: test["_attributes"]["finished-at"],
                });
    
                if (status === 0) {
                    suitePassed = false;
                    currentTest.exceptionClass = test.exception["_attributes"].class;
                    currentTest.exceptionMessage = test.exception.message._cdata;
                    currentTest.stackTrace = test.exception["full-stacktrace"]._cdata;
                }
    
                tests.push(currentTest);
            }
        
            const json = JSON.stringify({
                status: suitePassed ? 1 : 0,
                tests,
            });

            console.log('Tests have run sending report to database');
            
            const optionsForPostingReport = {
                hostname: 'localhost',
                port: 8080,
                path: '/project2/batch',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(json)
                }
            };

            const postReportRequest = http.request(optionsForPostingReport, (res) => { 
                if (res.statusCode === 201) {
                    /**
                     * The batch has been added to database now to format and send to frontend
                     */

                    const optionsForGettingTheStoredTests = {
                        hostname: 'localhost',
                        port: 8080,
                        path: `/project2${res.headers.location}/tests`,
                        method: 'GET'
                    };

                    let tests= '';
                    const requestForTests = http.request(optionsForGettingTheStoredTests, (res) => {
                        res.setEncoding('utf8');
                        res.on('data', (chunk) => {
                            tests += chunk;
                        })
                        
                        res.on('end', () => {
                            resolve({
                                status: suitePassed ? 1 : 0,
                                tests: JSON.parse(tests)
                            });
                        })
                    });
                    requestForTests.end();

                    // Done sending to frontend
                } else {
                    console.log(res.statusCode);
                    
                    // Send any error straight to frontend
                    reject('oops');
                }
            });

            postReportRequest.on('error', (err) => {
                // ? Need to check what data can be in the error, no sensitive data leaks
                // Send any error straight to frontend
                reject('yikes'); 
            })

            postReportRequest.write(json);
            postReportRequest.end();
            return;
        } catch (err) {
            reject("Error parsing" + err);
            return;
        }
    });
};
