# Performance Test using K6

# Install k6
   For example by using Homebrew
     
   `brew install k6`

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
4. Run the test with command
   
   `./run_biorev_k6_test.sh`

# Test Analysis

You can view the test analysis report at `/biorev/PrashantBellad_Performance_Round2_Tests.pdf`
