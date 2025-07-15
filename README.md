# Performance Test using K6

# Test Configuration

• Target: https://jsonplaceholder.typicode.com/posts
• Duration: 2 minutes
• Max Users: 25
• Ramp-up: 30 seconds
• Executor: ramping-vus with graceful ramp down

# How to execute

1. cd to biorev/final folder
2. Give access to run_biorev_k6_test
   `chmod +x run_biorev_k6_test`
3. Run the test
   `run_biorev_k6_test.sh`

# Test Analysis

You will test analysis report in `PrashantBellad_Performance_Round2_Tests.pdf`
