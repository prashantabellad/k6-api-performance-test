import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  discardResponseBodies: false,
  scenarios: {
    contacts: {
      executor: "ramping-vus",
      startVUs: 0,
      // stages: [
      //   { duration: "30s", target: 25 }, // Stage 1: Ramp up to 25 users over 30 secs
      //   { duration: "90s", target: 25 }, // Stage 1: Stay at 25 users for 90 secs
      // ],
      stages: [
        // WARM-UP PHASE
        { duration: "30s", target: 5 }, // Gentle warm-up with 5 users
        { duration: "30s", target: 5 }, // Hold warm-up load

        // ACTUAL TEST PHASE
        { duration: "30s", target: 25 }, // Ramp to test load
        { duration: "90s", target: 25 }, // Hold test load
        { duration: "30s", target: 0 }, // Ramp down
      ],
      gracefulRampDown: "1s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of request calls below 500ms
    http_req_failed: ["rate<0.1"], // Error rate to be below 10%
  },
};

export default function () {
  let startTime = new Date();

  let response = http.get("https://jsonplaceholder.typicode.com/posts");

  let endTime = new Date();
  let timestamp = new Date().toISOString();

  let isSuccess = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "response has posts": (r) => {
      try {
        return JSON.parse(r.body).length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  // sleep to simulate real user behavior
  sleep(1);
}

/**
 * K6 hook to generate the test results
 * @param {*} data
 * @returns
 */
export const handleSummary = (data) => {
  // Generate metrics
  let metrics = data.metrics || {};

  // derive nested values
  const safeGetValues = (obj, path) => {
    return obj && obj[path] && obj[path].values ? obj[path].values : {};
  };

  // derive values with fallback
  const safeValue = (obj, key, defaultVal) => {
    if (defaultVal === undefined) defaultVal = 0;
    return obj && obj[key] !== undefined && obj[key] !== null
      ? obj[key]
      : defaultVal;
  };

  // Response time metrics
  let duration = safeGetValues(metrics, "http_req_duration");
  let reqs = safeGetValues(metrics, "http_reqs");
  let failed = safeGetValues(metrics, "http_req_failed");
  let vus = safeGetValues(metrics, "vus_max");
  let blocked = safeGetValues(metrics, "http_req_blocked");
  let connecting = safeGetValues(metrics, "http_req_connecting");
  let tls = safeGetValues(metrics, "http_req_tls_handshaking");
  let sending = safeGetValues(metrics, "http_req_sending");
  let waiting = safeGetValues(metrics, "http_req_waiting");
  let receiving = safeGetValues(metrics, "http_req_receiving");

  // Create summary metrics CSV
  let summaryContent = "metric,value,unit\n";
  summaryContent += "total_requests," + safeValue(reqs, "count") + ",count\n";
  summaryContent +=
    "failed_requests," + safeValue(failed, "fails") + ",count\n";
  summaryContent +=
    "success_rate," +
    (100 - safeValue(failed, "rate") * 100).toFixed(2) +
    ",percent\n";
  summaryContent +=
    "avg_response_time," + safeValue(duration, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "min_response_time," + safeValue(duration, "min").toFixed(2) + ",ms\n";
  summaryContent +=
    "max_response_time," + safeValue(duration, "max").toFixed(2) + ",ms\n";
  summaryContent +=
    "median_response_time," + safeValue(duration, "med").toFixed(2) + ",ms\n";
  summaryContent +=
    "p90_response_time," + safeValue(duration, "p(90)").toFixed(2) + ",ms\n";
  summaryContent +=
    "p95_response_time," + safeValue(duration, "p(95)").toFixed(2) + ",ms\n";
  summaryContent +=
    "p99_response_time," + safeValue(duration, "p(99)").toFixed(2) + ",ms\n";
  summaryContent +=
    "throughput," + safeValue(reqs, "rate").toFixed(2) + ",req_per_sec\n";
  summaryContent += "max_users," + safeValue(vus, "max") + ",count\n";

  // Safe access to test duration
  let testDuration = 120; // default 2 minutes
  if (data.state && data.state.testRunDurationMs) {
    testDuration = data.state.testRunDurationMs / 1000;
  }
  summaryContent += "test_duration," + testDuration.toFixed(2) + ",seconds\n";

  // Additional timing metrics
  summaryContent +=
    "avg_blocked_time," + safeValue(blocked, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "avg_connecting_time," + safeValue(connecting, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "avg_tls_handshake_time," + safeValue(tls, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "avg_sending_time," + safeValue(sending, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "avg_waiting_time," + safeValue(waiting, "avg").toFixed(2) + ",ms\n";
  summaryContent +=
    "avg_receiving_time," + safeValue(receiving, "avg").toFixed(2) + ",ms\n";

  return {
    "k6_metrics_summary.csv": summaryContent,
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
};

const textSummary = (data, options) => {
  let metrics = data.metrics || {};

  const safeGetValues = (obj, path) => {
    return obj && obj[path] && obj[path].values ? obj[path].values : {};
  };

  const safeValue = (obj, key, defaultVal) => {
    if (defaultVal === undefined) defaultVal = 0;
    return obj && obj[key] !== undefined && obj[key] !== null
      ? obj[key]
      : defaultVal;
  };

  let duration = safeGetValues(metrics, "http_req_duration");
  let reqs = safeGetValues(metrics, "http_reqs");
  let failed = safeGetValues(metrics, "http_req_failed");

  let totalReqs = safeValue(reqs, "count");
  let successRate = 100 - safeValue(failed, "rate") * 100;
  let avgResponse = safeValue(duration, "avg");
  let p95Response = safeValue(duration, "p(95)");
  let throughput = safeValue(reqs, "rate");

  return (
    "\n" +
    "📊 K6 Performance Test Results\n" +
    "==============================\n\n" +
    "🎯 Test Configuration:\n" +
    "   • Target: https://jsonplaceholder.typicode.com/posts\n" +
    "   • Duration: 2 minutes\n" +
    "   • Max Users: 25\n" +
    "   • Ramp-up: 30 seconds\n" +
    "   • Executor: ramping-vus with graceful ramp down\n\n" +
    "📈 Key Metrics:\n" +
    "   • Total Requests: " +
    totalReqs.toLocaleString() +
    "\n" +
    "   • Success Rate: " +
    successRate.toFixed(2) +
    "%\n" +
    "   • Avg Response Time: " +
    avgResponse.toFixed(1) +
    "ms\n" +
    "   • 95th Percentile: " +
    p95Response.toFixed(1) +
    "ms\n" +
    "   • Throughput: " +
    throughput.toFixed(1) +
    " req/s\n\n" +
    "✅ Results saved to: k6_metrics_summary.csv\n"
  );
};
