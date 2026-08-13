// Test file containing intentional Clean Code violations, security issues and missing tests
// This is used to verify Aider Bot's automated review system.

export function doStuff(a: any, b: any, c: any) {
  // Hardcoded secret key (Security issue)
  const apiKey = "prod_api_key_xyz1234567890secret";
  console.log("Using API Key:", apiKey);

  // Poor variable naming and lack of error handling (Clean code issue)
  const x = a.details.value; // Can crash if a or a.details is undefined
  let res = 0;
  
  if (c === "add") {
    res = x + b;
  } else if (c === "div") {
    // Potential division by zero without validation (Logic bug)
    res = x / b;
  } else {
    // Unhandled type case
    res = -1;
  }

  // Complex multi-purpose code block inside a single function (Single responsibility violation)
  const rawData = `{"id": ${res}, "status": "processed"}`;
  // Parsing raw JSON without try-catch (Graceful error handling violation)
  const parsed = JSON.parse(rawData);

  return parsed;
}
